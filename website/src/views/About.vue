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
              We consider the setting of a decentralized storage network. That
              is, we have clients and storage providers; the former delegate the
              storage of their file to the network of the providers, which can
              publicly prove their service (ie, persistent storage). This is
              done following a specific protocol with detailed SLA about the
              storage (for example, see Filecoin).
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
              How can clients delegating storage be confident that the data can
              be retrieved from the network (ie, the guaranteed retrieval
              problem)? This protocol is made of a system of penalties and
              incentives that pushes providers who promised a retrieval service
              to fulfill this commitment
            </p>
          </div>
          <div class="col-12 col-md-5 col-lg-4 offset-lg-1">
            <h3>HOW IT WORKS?</h3>
            <p>
              – We have a consortium of providers that sign up to participate in
              our system;<br />
              – We have a fixed set of referees for which we can say that half
              of them are honest (eg, 5 referees and we trust 3 of them);<br />
              – Client and provider agree on a retrievability deal (aka the
              assurance policy for the retrieval service); providers lock down a
              collateral for each deal;<br />
              – When a client does not get the requested file, it appeals to the
              referees.<br />
              One of them tries to retrieve the file asking it again to the
              provider, if this works the file is forwarded to the client; If
              not, we try again. After some failed attempts, the provider is
              penalized: the collateral is taken away.
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
