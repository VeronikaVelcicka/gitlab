<template>
  <ul class="pagination">
    <li>
      <BaseButton
        class="btn--primary-outlined btn--pagination"
        @click="onClickPreviousPage"
        v-if="!isInFirstPage"
        text="<"
      />
    </li>
    <li v-for="(page, i) in pages" :key="i">
      <BaseButton
        class="btn--primary-outlined btn--pagination"
        :class="{ 'btn--active': isPageActive(page.name) }"
        :disabled="page.isDisabled"
        @click="onClickPage(page.name)"
        :text="page.name"
      />
    </li>
    <li>
      <BaseButton
        v-if="!isInLastPage"
        class="btn--primary-outlined btn--pagination"
        :disabled="isInLastPage"
        @click="onClickNextPage"
        text=">"
      />
    </li>
  </ul>
</template>

<script>
import { defineAsyncComponent } from "vue";

const BaseButton = defineAsyncComponent(() =>
  import("@/components/ui/BaseButton.vue")
);
export default {
  components: { BaseButton },
  props: {
    totalPages: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    isInFirstPage() {
      return this.currentPage === 1;
    },
    isInLastPage() {
      return this.currentPage === this.totalPages;
    },
    pages() {
      const range = [];
      for (let i = 1; i <= this.totalPages; i += 1) {
        range.push({
          name: i,
          isDisabled: i === this.currentPage,
        });
      }
      return range;
    },
  },
  methods: {
    onClickPreviousPage() {
      this.$emit("pagechanged", this.currentPage - 1);
    },
    onClickPage(page) {
      this.$emit("pagechanged", page);
    },
    onClickNextPage() {
      this.$emit("pagechanged", this.currentPage + 1);
    },
    isPageActive(page) {
      return this.currentPage === page;
    },
  },
};
</script>

<style scoped lang="scss">
.pagination {
  margin: 6rem 0 0;
  padding: 0;
  list-style: none outside none;
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 1rem;
}
</style>
