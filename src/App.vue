<template>
  <main>
    <div class="container">
      <Home />
    </div>
  </main>
</template>

<script>
import { defineAsyncComponent } from "vue";

const Home = defineAsyncComponent(() => import("@/components/Home.vue"));

export default {
  components: { Home },
};
</script>

<style lang="scss">
.container {
  max-width: 160rem;
  margin: 0 auto;
  padding: 2rem;

  @include more-than(md) {
    padding: 5rem;
  }

  @include more-than(xl) {
    padding: 10rem;
  }
}
</style>
