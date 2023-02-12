<template>
  <h1 class="h h--primary">GitLab access</h1>
  <div class="input-box">
    <BaseInput
      id="groupId"
      v-model="groupId"
      title="top-level group ID"
      type="text"
      name="groupId"
    />
    <BaseButton
      text="Search"
      custom-class="btn--primary"
      :use-icon="true"
      :is-loading="isLoading"
      :disabled="!groupId"
      @click="search"
    >
      <template #ico>
        <!-- eslint-disable -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="currentColor" d="m16.027 14.977-4.257-4.262a6.43 6.43 0 0 0 1.43-4.106A6.63 6.63 0 0 0 .61 3.703a6.634 6.634 0 0 0 1.816 8.063 6.63 6.63 0 0 0 8.261.023l4.262 4.262c.156.14.356.219.567.222a.75.75 0 0 0 .757-.765.748.748 0 0 0-.246-.531Zm-14.5-8.364a5.086 5.086 0 1 1 10.173.001 5.086 5.086 0 0 1-10.173 0Zm0 0"/></svg>
        <!-- eslint-enable -->
      </template>
    </BaseButton>
  </div>

  <template v-if="isLoading">
    <div class="spinner-box spinner-box--page">
      <Spinner />
    </div>
  </template>

  <div class="members" v-else-if="groupId && members.length">
    <h2 class="h h--secondary">ID top level skupiny: {{ groupId }}</h2>

    <div
      class="members__member"
      v-for="(member, i) in paginatedMembers"
      :key="i"
    >
      <div>
        <span class="members__title">{{ member.name }}</span>
        (@{{ member.username }})
      </div>
      <div>
        <span class="members__title">Groups:</span>
        {{ getItems(member.groups) }}
      </div>
      <div>
        <span class="members__title">Projects:</span>
        {{ getItems(member.projects) }}
      </div>
    </div>

    <div class="members__title">Total Users: {{ members.length }}</div>

    <Pagination
      :total-pages="totalPages"
      :total="members.length.length"
      :current-page="currentPage"
      @pagechanged="onPageChange"
    />
  </div>

  <template v-else-if="clicked && groupId && !members.length">
    <p>No matching records.</p>
  </template>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { HttpClient } from "@/common/http/http-client";

const Spinner = defineAsyncComponent(() =>
  import("@/components/ui/Spinner.vue")
);
const BaseInput = defineAsyncComponent(() =>
  import("@/components/ui/BaseInput.vue")
);
const BaseButton = defineAsyncComponent(() =>
  import("@/components/ui/BaseButton.vue")
);
const Pagination = defineAsyncComponent(() =>
  import("@/components/ui/Pagination.vue")
);

export default {
  components: {
    Spinner,
    BaseInput,
    BaseButton,
    Pagination,
  },

  data() {
    return {
      members: [],
      groups: [],
      projects: [],
      groupId: null,
      isLoading: null,
      clicked: false,
      currentPage: 1,
      perPage: 5,
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.members.length / this.perPage);
    },

    paginatedMembers() {
      if (this.currentPage === 1) {
        const from = this.currentPage - 1;
        const to = this.perPage;
        return this.members.slice(from, to);
      } else if (this.currentPage > 1) {
        const from = (this.currentPage - 1) * this.perPage;
        const to = this.perPage * this.currentPage;
        return this.members.slice(from, to);
      } else return this.members;
    },
  },

  methods: {
    async search() {
      this.isLoading = true;
      this.clicked = true;
      try {
        await this.getGroup();
        const members = await this.getGroupMembers(parseInt(this.groupId));
        this.addGroupsToMembers();
        await this.getProjectsAndMembers();
        this.addProjectsToMembers();
        this.addMembers(members);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },

    async getGroup() {
      const groupResponse = await HttpClient.get(`groups/${this.groupId}`);
      this.groups.push(groupResponse.data);
    },

    async getGroupMembers(groupId, members = []) {
      try {
        const subgroupResponse = await HttpClient.get(
          `groups/${groupId}/subgroups`
        );
        const subgroups = subgroupResponse.data;
        subgroups.forEach((subgroup) => {
          if (!this.groups.find((g) => g.id === subgroup.id)) {
            this.groups.push(subgroup);
          }
        });

        const response = await HttpClient.get(`groups/${groupId}/members`);
        const groupMembers = response.data;
        const group = this.groups.find((group) => group.id === groupId);
        if (group) {
          group.members = groupMembers;
        }
        members.push(...groupMembers);

        for (const subgroup of subgroups) {
          await this.getGroupMembers(subgroup.id, members);
        }

        for (const subgroup of subgroups) {
          await this.getProjects(subgroup.id);
        }

        this.addMembers(members);
      } catch (error) {
        console.error(error);
      }
    },

    async getProjects(groupId) {
      try {
        const response = await HttpClient.get(`groups/${groupId}/projects`);
        const projects = response.data;
        projects.forEach((project) => {
          HttpClient.get(`projects/${project.id}/members`).then((response) => {
            this.addMembers(response.data);
          });
        });
      } catch (error) {
        console.error(error);
      }
    },

    addMembers(members) {
      if (members && members.length) {
        members.forEach((member) => {
          if (!this.members.find((m) => m.id === member.id)) {
            this.members.push(member);
          }
        });
      }
    },

    async getProjectsAndMembers() {
      const response = await HttpClient.get(
        `groups/${this.groupId}/projects?include_subgroups=true`
      );
      const projects = response.data;

      for (const project of projects) {
        const projectId = project.id;
        const projectMembersResponse = await HttpClient.get(
          `projects/${projectId}/members`
        );
        project.members = projectMembersResponse.data;
        this.projects.push(project);
      }
    },

    addProjectsToMembers() {
      let membersMap = new Map();
      this.members.forEach((m) => membersMap.set(m.id, m));

      for (let project of this.projects) {
        for (let projectMember of project.members) {
          let member = membersMap.get(projectMember.id);
          if (member) {
            if (!member.projects) {
              member.projects = [];
            }
            member.projects.push({
              id: project.id,
              name: project.path_with_namespace,
              accessLevelString: this.getAccessLevelString(
                projectMember.access_level
              ),
            });
          }
        }
      }
    },

    addGroupsToMembers() {
      let members = this.members.reduce((acc, member) => {
        acc[member.id] = { ...member, groups: [] };
        return acc;
      }, {});

      for (let group of this.groups) {
        for (let groupMember of group.members) {
          let member = members[groupMember.id];
          if (member) {
            member.groups.push({
              id: group.id,
              name: group.full_path,
              accessLevelString: this.getAccessLevelString(
                groupMember.access_level
              ),
            });
          }
        }
      }
      this.members = Object.values(members);
    },

    getAccessLevelString(accessLevel) {
      switch (accessLevel) {
        case 0:
          return "No access";
        case 5:
          return "Minimal access";
        case 10:
          return "Guest";
        case 20:
          return "Reporter";
        case 30:
          return "Developer";
        case 40:
          return "Maintainer";
        case 50:
          return "Owner";
      }
    },

    getItems(items) {
      return items && items.length
        ? `[${items
            .map((i) => `${i.name} (${i.accessLevelString})`)
            .join(", ")}]`
        : [];
    },

    onPageChange(page) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
};
</script>

<style lang="scss">
.input-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @include more-than(sm) {
    flex-direction: row;
  }
}

.members {
  padding: 3rem 0;
}

.members__member {
  background-color: $c-blank;
  border-radius: 0.5rem;
  margin-bottom: 3rem;
  padding: 2rem;
}

.members__title {
  font-weight: $fw-semi-bold;
}
</style>
