<template>
  <div class="bg-color-dark full-container bg-img">
    <Particles />
    <div class="container" :class="{ 'p-5': !isDesktop }">
      <!-- ====================== NAVBAR ====================== -->
      <div class="is-flex is-justify-content-space-between py-5">
        <img
          :width="[isMobile ? 32 : 52]"
          src="../assets/img/logo.svg"
          alt=""
        />
        <div class="is-flex is-align-items-center">
          <a
            href="/#/app"
            class="btn-secondary"
            style="text-align: center; text-transform: lowercase"
            :style="[
              isMobile
                ? { width: '120px', fontSize: '0.8rem' }
                : { width: '180px', fontSize: '1.2rem' },
            ]"
          >
            launch app</a
          >
          <a
            class="btn-primary ml-3"
            href="https://hackmd.io/@irenegia/BkqNihVY5"
            target="_blank"
            style="
              text-align: center;
              text-transform: lowercase;
              font-size: 1.2rem;
            "
            :style="[
              isMobile
                ? { width: '120px', fontSize: '0.8rem' }
                : { width: '180px', fontSize: '1.2rem' },
            ]"
          >
            paper
          </a>
        </div>
      </div>
      <!-- ====================== NAVBAR ====================== -->
      <div class="gap"></div>

      <!-- ====================== CONTENT ====================== -->
      <typewriter :type-interval="50" :replace-interval="1000">
        <h1 class="big-title">
          Retriev Pinning Protocol is part of an interoperable ecosystem of
          on-chain storage products.
        </h1>
      </typewriter>
      <Transition enter-active-class="fade-in">
        <div v-if="loadToShow" class="columns mt-6">
          <div class="column is-6">
            <p class="pay-off">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </p>
          </div>
        </div>
      </Transition>
      <div v-if="isDesktop || isMobile" class="gap"></div>

      <div class="gap"></div>
      <!-- ====================== CONTENT ====================== -->

      <!-- ====================== FOOTER ====================== -->
      <Transition enter-active-class="fade-in">
        <div
          v-if="loadToShow"
          class="is-flex is-align-items-center is-justify-content-flex-end pb-6"
          style="position: absolute, bottom: 20px"
        >
          <a
            class="splash-link mr-3"
            href="https://github.com/protocol/retriev"
            target="_blank"
            >github</a
          >
          <a
            class="splash-link"
            href="https://filecoinproject.slack.com/archives/C03CJKWP2DR"
            target="_blank"
            >slack</a
          >
        </div>
      </Transition>
      <!-- ====================== FOOTER ====================== -->
    </div>
  </div>
</template>

<script>
import Typewriter from "typewriter-vue";
import checkViewport from "@/mixins/checkViewport";
import Particles from "@/components/landing/Particles.vue";
export default {
  name: "splash",
  mixins: [checkViewport],
  data() {
    return {
      loadToShow: false,
    };
  },
  components: {
    Typewriter,
    Particles,
  },
  mounted() {
    this.loader();
  },
  methods: {
    loader() {
      const app = this;
      setTimeout(function () {
        app.loadToShow = true;
      }, 5000);
    },
  },
};
</script>
