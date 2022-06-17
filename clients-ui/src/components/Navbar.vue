<template>
  <div>
    <!-- Nav Button show/hide -->
    <div
      @click="
        navState = !navState;
        hideLogs();
      "
      class="btn-sidebar position-top-right"
    >
      <i v-if="!navState" class="fa-solid fa-bars"></i>
      <i v-if="navState" class="fa-solid fa-times"></i>
    </div>
    <!--End | Nav Button show/hide -->

    <!-- Navbar -->
    <Transition
      enter-active-class="slide-in-right"
      leave-active-class="slide-out-right"
    >
      <div v-if="navState" class="right-col">
        <div class="nav-container mt-5 pt-5">
          <a href="/#/signup">
            <button class="button is-rounded is-dark">
              Signup as Provider
            </button></a
          >
          <div class="mt-3">
            <a href="/"
              ><i class="fa-solid fa-server mr-2"></i><span>dApp</span></a
            >
          </div>
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
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Navbar",
  mixins: [checkViewport],
  props: {
    parentData: {
      type: String,
      default() {
        return "";
      },
    },
  },
  data() {
    return {
      navState: false,
      childData: "",
    };
  },
  methods: {
    hideLogs() {
      this.$emit("hide");
    },
  },
};
</script>
