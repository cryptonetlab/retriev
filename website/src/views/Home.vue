<template>
  <div class="home">
    <Navbar />
    <div class="wrapper-page" :class="{ 'padding-5x': isDesktop }">
      <div :class="{ container: !isDesktop, 'container-fluid': isDesktop }">
        <div class="gap"></div>
        <div v-if="isDesktop" class="gap"></div>
        <div class="row">
          <div class="col-12 col-md-6 col-lg-6">
            <h1 class="m-0">
              Lorem ipsum provider digital signature provider peer-to-peer sats
              hashrate hash.
            </h1>
            <div class="custom-btn-primary mt-5 mb-5">Go to dApp</div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Home",
  mixins: [checkViewport],
  components: {
    Navbar,
    Footer,
  },
};
</script>
