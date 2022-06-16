<template>
  <div>
    <!-- Nav Button show/hide -->
    <div
      @click="
        showNavbar = !showNavbar;
        showConsole = false;
      "
      class="btn-sidebar position-top-right"
    >
      <i v-if="!showNavbar" class="fa-solid fa-bars"></i>
      <i v-if="showNavbar" class="fa-solid fa-times"></i>
    </div>
    <!-- END - Logs button show/hide -->
    <!-- Navbar -->
    <Transition
      enter-active-class="slide-in-right"
      leave-active-class="slide-out-right"
    >
      <div v-if="showNavbar" class="right-col">
        <div class="nav-container mt-5 pt-5">
          <a href="/#/signup">
            <button class="button is-rounded is-dark">
              Signup Protocol
            </button></a
          >
          <div class="mt-3">
            <a href="/help"
              ><i class="fa-solid fa-circle-question mr-2"></i>
              <span>Help</span></a
            >
          </div>
        </div>
      </div>
    </Transition>
    <!-- END - Navbar -->
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      showNavbar: false,
    };
  },
};
</script>
