<template>
  <div class="about">
    <div class="wrapper-page">
      <Navbar />
      <div v-if="!isDesktop" class="gap"></div>
      <div class="container">
        <div class="row" :class="{ 'mb-3': isMobile }">
          <div class="col-12 col-md-9 col-lg-6">
            <h3 class="mb-3">WHAT IS PROJECT NAME?</h3>
            <p>
              Lorem ipsums block height, stacking sats hard fork UTXO public key
              Merkle Tree double-spend problem stacking sats transaction! Segwit
              genesis block whitepaper halvening address whitepaper, sats
              stacking sats. Inputs, private key full node blocksize
              double-spend problem SHA-256 UTXO, genesis block transaction!
              Nonce, proof-of-work.
            </p>
          </div>
        </div>
        <div v-if="!isMobile" class="gap"></div>
        <div class="row justify-content-center mb-5">
          <div class="col-12 col-md-5 col-lg-4" :class="{ 'mb-3': isMobile }">
            <h3 class="mb-3">HOW IT WORKS?</h3>
            <p>
              Lorem ipsums block height, stacking sats hard fork UTXO public key
              Merkle Tree double-spend problem stacking sats transaction! Segwit
              genesis block whitepaper halvening address whitepaper, sats
              stacking sats. Inputs, private key full node blocksize
              double-spend problem SHA-256 UTXO, genesis block transaction!
              Proof-of-work.
            </p>
          </div>
          <div class="col-12 col-md-5 col-lg-4 offset-lg-1">
            <h3 class="mb-3">WHAT IT STANDS FOR?</h3>
            <p>
              Lorem ipsum soft fork mining halvening public key consensus
              address, transaction peer-to-peer! Consensus genesis block block
              height whitepaper block reward Bitcoin Improvement Proposal
              hashrate UTXO.
            </p>
          </div>
        </div>
      </div>
      <div v-if="!isDesktop" class="gap"></div>
      <div v-if="!isDesktop" class="gap"></div>
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
  name: "About",
  mixins: [checkViewport],
  components: {
    Navbar,
    Footer,
  },
};
</script>
