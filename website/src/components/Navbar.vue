<template>
  <div class="header" id="navHead">
    <nav class="navbar navbar-expand-lg p-0">
      <div class="container-fluid p-4">
        <a href="/">
          <div class="navbar-brand">
            <img src="../assets/img/logo.png" alt="" /></div
        ></a>

        <div class="navbar-toggler" @click="collapseMenu()">
          <i v-if="!showMenuMobile" class="fa-solid fa-bars main-color"></i>
          <i v-if="showMenuMobile" class="fa-solid fa-xmark"></i>
        </div>
        <Transition
          name="custom-fade"
          enter-active-class="animate__animated animate__fadeInDown"
          leave-active-class="animate__animated animate__fadeOutUp"
        >
          <div
            v-show="showMenuContent || showMenuMobile"
            class="navbar-collapse justify-content-end"
            id="navbarContent"
          >
            <ul class="navbar-nav mb-2 mb-lg-0 me-4" role="tablist">
              <li class="nav-item">
                <a class="nav-link me-3" href="/"> GitHub</a>
              </li>
              <li class="nav-item">
                <a class="nav-link me-3" href="https://hackmd.io/@irenegia/BkqNihVY5" target="_blank">Litepaper</a>
              </li>
              <li class="nav-item">
                <a class="nav-link me-3" href="/#/about">About</a>
              </li>
            </ul>
          </div>
        </Transition>
        <Transition
          name="custom-fade"
          enter-active-class="animate__animated animate__fadeInDown"
          leave-active-class="animate__animated animate__fadeOutUp"
        >
          <div v-show="isDesktop" id="btn-group-container">
            <a href="https://dapp.pldr.dev">
              <div class="custom-btn-primary">MVP</div></a
            >
          </div>
        </Transition>
      </div>
    </nav>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Header",
  components: {},
  mixins: [checkViewport],
  data() {
    return {
      showBtn: true,
      showMenuContent: true,
      showMenuMobile: false,
    };
  },

  mounted() {
    const app = this;
    if (window.innerWidth < 992) {
      app.showMenuContent = false;
      app.showMenuMobile = false;
    }
    window.addEventListener("resize", function () {
      if (window.innerWidth > 992) {
        app.showMenuContent = true;
        app.showMenuMobile = false;
      } else {
        app.showMenuContent = false;
        app.showMenuMobile = false;
      }
    });
  },
  methods: {
    collapseMenu() {
      const app = this;
      app.showBtn = !app.showBtn;
      app.showMenuMobile = !app.showMenuMobile;
      console.log(app.showMenuContent);
    },
  },
};
</script>
<style lanc="scss">
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
