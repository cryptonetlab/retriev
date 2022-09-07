<template>
  <div class="team">
    <Navbar />
    <div class="wrapper-page">
      <div class="gap"></div>
      <div
        class="container"
        :class="{ 'mt-5 mb-5': isDesktop && isTablet, 'px-5' :isMobile }"
      >
        <div class="row" :class="{ 'mb-3': isMobile }">
          <div class="col-12 col-md-9 col-lg-6">
            <h3 class="mb-3">CONTRIBUTORS</h3>
            <p>
              Researchers from
              <a href="http://cryptonet.org/" target="_blank">Cryptonet Lab</a>
              designed the protocol - with contributions from
              <a
                href="https://research.protocol.ai/groups/cryptoeconlab/"
                target="_blank"
                >Cryptoecon Lab</a
              >
              - and it has been developed by
              <a href="https://yomi.digital" target="_blank">yomi.digital</a>.
            </p>
          </div>
        </div>
        <div v-if="!isMobile" class="gap"></div>
        <!-- <div class="row mb-5">
          <div
            class="col-12 col-md-5 col-lg-4 offset-lg-2"
            :class="{ 'mb-3': isMobile }"
          >
            <p class="m-0"><b>Lorem Ipsum</b></p>
            <p>Lorem ipsums block height</p>
          </div>
          <div class="col-12 col-md-5 col-lg-4" :class="{ 'mb-3': isMobile }">
            <p class="m-0"><b>Lorem Ipsum</b></p>
            <p>Lorem ipsums block height</p>
          </div>
          <div
            class="col-12 col-md-5 col-lg-4 offset-lg-2"
            :class="{ 'mb-3': isMobile }"
          >
            <p class="m-0"><b>Lorem Ipsum</b></p>
            <p>Lorem ipsums block height</p>
          </div>
          <div class="col-12 col-md-5 col-lg-4" :class="{ 'mb-3': isMobile }">
            <p class="m-0"><b>Lorem Ipsum</b></p>
            <p>Lorem ipsums block height</p>
          </div>
          <div
            class="col-12 col-md-5 col-lg-4 offset-lg-2"
            :class="{ 'mb-3': isMobile }"
          >
            <p class="m-0"><b>Lorem Ipsum</b></p>
            <p>Lorem ipsums block height</p>
          </div>
          <div class="col-12 col-md-5 col-lg-4" :class="{ 'mb-3': isMobile }">
            <p class="m-0"><b>Lorem Ipsum</b></p>
            <p>Lorem ipsums block height</p>
          </div>
          <div
            class="col-12 col-md-5 col-lg-4 offset-lg-2"
            :class="{ 'mb-3': isMobile }"
          >
            <p class="m-0"><b>Lorem Ipsum</b></p>
            <p>Lorem ipsums block height</p>
          </div>
        </div> -->
      </div>
      <div v-if="!isDesktop" class="gap"></div>
    </div>
    <div class="gap" v-if="!isDesktop"></div>
    <div class="gap" v-if="!isDesktop"></div>
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Contributors",
  mixins: [checkViewport],
  components: {
    Navbar,
    Footer,
  },
};
</script>
