<template>
  <div class="about">
    <Navbar />
    <div class="wrapper-page">
      <div class="container" :class="{ 'mt-5': isTablet, 'px-5 mt-5': isMobile }">
        <div v-if="!isMobile" class="gap"></div>
        <div class="row pb-4" :class="{ 'pb-5': isDesktop }">
          <div class="col-12 col-md-5 col-lg-5" :class="{ 'mb-3': isMobile }">
            <div>
              <h3>CONTEXT</h3>
              <p>
                In the setting of a decentralized storage network there are
                clients who delegate the storage of their files to a network of
                providers.
              </p>
            </div>
            <div class="mt-5">
              <h3>WHY RETRIEVAL PINNING?</h3>
              <p>
                Adding a "retrievability assurance" for such storage service is
                key to boost confidence and usage of decentralized storage
                networks.
              </p>
            </div>
          </div>
          <div class="col-12 col-md-5 col-lg-5 offset-lg-1">
            <h3>HOW IT WORKS?</h3>
            <p>
              → A fixed set of referees is part of the protocol: half of them
              is supposed to be honest; <br /><br />
              → Any interested storage provider can sign up to offer assurance
              policies for retrieval services;<br /><br />
              → Client and provider agree on a retrievability deal - the client
              sets a payment and the provider locks down a collateral for each
              deal: <br /><br />
              → When a client does not get the requested file, it appeals to the
              referees. They try to retrieve the file asking it to the provider:
              if this works the file is forwarded to the client; if not, they
              try again. After a number of failed attempts, the provider is
              penalized: the collateral is taken away and the client gets its
              payment back.
            </p>
          </div>
        </div>
      </div>
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
  name: "About",
  mixins: [checkViewport],
  components: {
    Navbar,
    Footer,
  },
};
</script>
