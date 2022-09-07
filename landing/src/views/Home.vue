<template>
  <div class="home">
    <div class="container bg-color">
      <Navbar />
      <div :class="{ gap: isMobile }"></div>
      <div class="wrapper-page">
        <div :class="{ container: !isDesktop }">
          <div v-if="!isMobile && !isTablet" class="gap"></div>
          <div class="row" :class="{ 'px-3': !isDesktop }">
            <div class="col-12 col-md-10 col-lg-8">
              <!-- <h1 class="m-0">
                <b>Onchain.Storage</b> is an ecosystem of storage products.
              </h1> -->
              <h1 class="m-0">
                <b>Retrieval Pinning</b> is part of an interoperable ecosystem
                of on-chain storage products.
              </h1>
              <a href="https://v2.pldr.dev/#/" target="_blank">
                <div class="custom-btn-primary mt-5 mb-5">Launch dApp</div></a
              >
            </div>
          </div>
          <div class="gap" v-if="!isDesktop"></div>
          <div class="gap" v-if="isTablet"></div>
        </div>
      </div>
      <Footer />
    </div>
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
