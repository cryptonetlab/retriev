<template>
  <div class="bg-color-dark full-container bg-img">
    <Particles />
    <div class="container px-5" style="min-height: 100vh">
      <!-- ====================== NAVBAR ====================== -->
      <div class="is-flex is-justify-content-space-between py-6">
        <img
          :width="[isMobile ? 40 : 52]"
          src="../assets/img/logo.svg"
          alt=""
        />
        <div class="is-flex is-align-items-center">
          <a
            @click="fetchingContract()"
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
      <div class="gap-1" v-if="!isMobile"></div>
      <div class="gap-1 hideMiddle"></div>
      <!-- ====================== CONTENT ====================== -->
      <typewriter :type-interval="30" :replace-interval="1000">
        <h1 class="big-title">
          Retriev Protocol is part of an interoperable ecosystem of on-chain
          storage products.
        </h1>
      </typewriter>
      <Transition enter-active-class="fade-in">
        <div v-if="loadToShow" class="columns mt-6">
          <div class="column is-6">
            <p class="pay-off">
              In the setting of a decentralized storage network there are
              clients who delegate the storage of their files to a network of
              providers,<br />we add a "retrievability assurance" for such
              storage service is key to boost confidence and usage of
              decentralized storage networks.
            </p>
          </div>
        </div>
      </Transition>
      <div v-if="isDesktop || isMobile" class="gap"></div>

      <!-- <div class="gap hideMiddle"></div> -->
      <!-- ====================== CONTENT ====================== -->

      <!-- ====================== FOOTER ====================== -->
      <Transition enter-active-class="fade-in">
        <div
          v-if="loadToShow"
          class="custom-footer is-flex is-align-items-center is-justify-content-flex-end"
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
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const CONFIG = require("../config.json");
const ABI_POLYGON = require("../abi/abi-polygon.json");
const ABI_ETH = require("../abi/abi-eth.json");

export default {
  name: "splash",
  mixins: [checkViewport],
  data() {
    return {
      contract: "",
      selectedContract: localStorage.getItem("contract"),
      config: CONFIG,
      abi: ABI_POLYGON,
      network: 5,
      loadToShow: false,
      infuraId: process.env.VUE_APP_INFURA_ID,
    };
  },
  components: {
    Typewriter,
    Particles,
  },
  mounted() {
    this.loader();
    if (localStorage.getItem("contract") === null) {
      localStorage.setItem("contract", "polygon");
    }
  },
  methods: {
    loader() {
      const app = this;
      setTimeout(function () {
        app.loadToShow = true;
      }, 2950);
    },
    async fetchingContract() {
      const app = this;
      // Fetching data by contract selected
      console.log("CONTRACT Selected is:", app.selectedContract);
      if (app.selectedContract === "polygon") {
        app.contract = app.config[0].contract;
        app.network = app.config[0].network;
        app.apiEndpoint = app.config[0].api;
        app.opensea = app.config[0].opensea;
        app.abi = ABI_POLYGON;
      } else if (app.selectedContract === "ethereum") {
        app.contract = app.config[1].contract;
        app.network = app.config[1].network;
        app.apiEndpoint = app.config[1].api;
        app.opensea = app.config[1].opensea;
        app.abi = ABI_ETH;
      } else if (app.selectedContract === null) {
        app.contract = app.config[0].contract;
        app.network = app.config[0].network;
        app.apiEndpoint = app.config[0].api;
        app.opensea = app.config[0].opensea;
        app.abi = ABI_POLYGON;
        localStorage.setItem("contract", "polygon");
      }
      console.log(
        "contract spec",
        "address",
        app.contract,
        "network",
        app.network,
        "endpoint",
        app.apiEndpoint
      );
      app.connect();
    },
    async connect() {
      const app = this;
      let providerOptions = {};
      if (app.infuraId !== undefined) {
        providerOptions = {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: app.infuraId,
            },
          },
        };
      }
      // Instantiating Web3Modal
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: providerOptions,
      });
      const provider = await web3Modal.connect();
      const web3 = await new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        window.location = "/#/app";
      }
    },
  },
};
</script>

<style scoped>
@media screen and (min-width: 1408px) {
  .container:not(.is-max-desktop):not(.is-max-widescreen) {
    max-width: 1440px;
  }
}
@media screen and (min-width: 1408px) {
  .container[data-v-6092b1a1]:not(.is-max-desktop):not(.is-max-widescreen) {
    max-width: 1344px;
  }
}
</style>
