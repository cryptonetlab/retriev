<template>
  <div class="header" :class="{ 'px-5': isMobile }">
    <div class="container">
      <div
        class="d-flex align-items-center justify-content-between py-4"
        :class="{ 'py-4': isDesktop, 'py-4': !isDesktop }"
      >
        <div class="navbar-brand">
          <a href="/"><img src="../assets/img/logo.svg" alt="" /></a>
        </div>
        <a href="https://dapp.pldr.dev" target="_blank"
          ><div class="custom-btn-primary">Launch dApp</div></a
        >
      </div>
      <div class="row justify-content-end b-top">
        <div class="col-4 col-md-2 col-lg-2 b-left">
          <a
            href="https://github.com/protocol/retriev"
            target="_blank"
            class="nav-link"
            >GitHub</a
          >
        </div>
        <div class="col-4 col-md-2 col-lg-2 b-left">
          <a
            href="https://hackmd.io/@irenegia/BkqNihVY5"
            target="_blank"
            class="nav-link"
            >Paper</a
          >
        </div>

        <div class="col-4 col-md-2 col-lg-2 b-left">
          <a href="/#/about" class="nav-link">About</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Header",
  components: {},
  mixins: [checkViewport],
};
</script>
<style lanc="scss">
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";
</style>
