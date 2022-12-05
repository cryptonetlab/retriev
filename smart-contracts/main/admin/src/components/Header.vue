<template>
  <div class="header p-3 text-center">
    <div class="ms-5 ps-2 d-flex align-items-center">
      <h1 style="font-weight: bold; padding-right:20px">Retriev</h1>
      <div class="text-start">
        <p class="m-0">Referees</p>
        <p class="m-0">Admin Suite</p>
      </div>
    </div>
    <a v-if="!isDashboard" href="/" class="back-button">
      <i class="fas fa-chevron-left"></i>
    </a>
  </div>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      isDashboard: "",
    };
  },
  mounted() {
    const app = this;
    console.log(app.$route);
    if (app.$route.name === "Home") {
      app.isDashboard = true;
    }
  },
};
</script>
