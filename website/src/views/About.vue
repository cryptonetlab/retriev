<template>
  <div class="about">
    <Navbar />
    <div class="wrapper-page">
      <div class="container" :class="{ 'mt-5': isTablet }">
        <div
          class="row py-4 justify-content-start"
          :class="{ 'mb-3': isMobile }"
        >
          <div class="col-12 col-md-9 col-lg-8 offset-md-1 offset-lg-1">
            <h3>ABOUT</h3>
            <h6>
              <!-- We consider the setting of a decentralized storage network. That
              is, we have clients and storage providers; the former delegate the
              storage of their file to the network of the providers, which can
              publicly prove their service (ie, persistent storage). This is
              done following a specific protocol with detailed SLA about the
              storage (for example, see Filecoin). -->
              In the setting of a decentralized storage network there are
              clients who delegate the storage of their files to a network of
              providers.
            </h6>
          </div>
        </div>
        <div v-if="!isMobile" class="gap-smaller"></div>
        <div
          class="row justify-content-start pb-4"
          :class="{ 'mb-5': !isMobile && !isTablet }"
        >
          <div class="col-12 col-md-5 col-lg-4" :class="{ 'mb-3': isMobile }">
            <h3>WHY RETRIEVAL PINNING?</h3>
            <p>
              Adding a "retrievability assurance" for such storage service is
              key to boost confidence and usage of decentralized storage
              networks.
            </p>
          </div>
          <div class="col-12 col-md-5 col-lg-4 offset-lg-1">
            <h3>HOW IT WORKS?</h3>
            <p>
              - A fixed set of referees is part of the protocol - half of them
              is supposed to be honest; <br />
              - Any interested storage provider can sign up to offer assurance
              policies for retrieval services;<br />
              - Client and provider agree on a retrievability deal - the client
              sets a payment and the provider locks down a collateral for each
              deal; <br />
              When a client does not get the requested file, it appeals to the
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
    <div class="gap" v-if="isTablet"></div>
    <div class="gap" v-if="isTablet"></div>
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
