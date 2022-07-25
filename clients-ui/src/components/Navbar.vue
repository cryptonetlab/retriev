<template>
  <div>
    <div class="header py-4" :class="{ 'px-3': !isDesktop }">
      <div class="container">
        <div
          class="columns is-mobile is-multiline is-vcentered is-justify-content-space-between"
        >
          <div class="column is-2-mobile is-3-tablet is-4-desktop">
            <a href="/">
              <div class="is-flex is-align-items-center">
                <img src="../assets/img/logo.svg" alt="" />
                <h2 v-if="!isMobile" class="pay-off tertiary-light-text ml-4">
                  Retrieval Pinning
                </h2>
              </div></a
            >
          </div>
          <div class="column is-10-mobile is-9-tablet is-8-desktop">
            <div
              class="is-flex is-align-items-center"
              :class="{ 'is-justify-content-flex-end': !isMobile }"
            >
              <div class="btn-light" style="cursor: default">
                <i class="fa-brands fa-ethereum mr-2"></i
                ><span v-if="parseInt(network) === 4">Rinkeby</span>
                <span v-if="parseInt(network) === 1">Ethereum</span>
              </div>
              <div
                v-if="accountBalance"
                class="btn-light ml-2"
                style="cursor: default"
              >
                {{ accountBalance.substr(0, 4) }}
                <span style="text-transform: lowercase">r</span>ETH
              </div>
              <div class="btn-light" style="margin-left: -1px; cursor: default">
                <i class="fa-solid fa-wallet mr-2"></i>
                {{ account.substr(0, 4) + "..." + account.substr(-4) }}
              </div>
              <div class="ml-2">
                <div>
                  <!-- Nav Button show/hide -->
                  <div
                    @click="
                      navState = !navState;
                      hideLogs();
                    "
                    class="btn-light"
                    style="padding: 10px 15px"
                  >
                    <i class="fa-solid fa-ellipsis"></i>
                  </div>
                  <!--End | Nav Button show/hide -->

                  <!-- Navbar -->
                  <Transition
                    enter-active-class="slide-in-right"
                    leave-active-class="slide-out-right"
                  >
                    <div
                      v-if="navState"
                      @mouseout="!navState"
                      @mouseleave="closeNav()"
                      class="right-col"
                    >
                      <div class="nav-container mt-5 pt-5">
                        <!-- <a href="/#/signup">
                        <button class="button is-rounded is-dark">
                          Signup as Provider
                        </button>
                     </a> -->
                        <div class="mt-3">
                          <a href="/"
                            ><i class="fa-solid fa-server mr-2"></i
                            ><span>Dashboard</span></a
                          >
                        </div>
                        <div class="mt-3">
                          <a
                            href="https://filecoinproject.slack.com/archives/C03CJKWP2DR"
                            target="_blank"
                            ><i class="fa-solid fa-circle-question mr-2"></i>
                            <span>Help</span></a
                          >
                        </div>
                      </div>
                    </div>
                  </Transition>
                  <!-- END - Navbar -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ALERT BANNER TESTNET -->
    <div class="alert-banner py-4" :class="{ 'px-3': !isDesktop }">
      <div class="container">
        <p>
          <i class="fa-solid fa-circle-exclamation mr-3"></i>
          <b
            >Retrieval Pinning is in testnet. This is an alpha version and
            storage is at your own risk.</b
          >
        </p>
      </div>
    </div>
    <!-- ALERT BANNER TESTNET -->
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  mixins: [checkViewport],
  props: ["account", "accountBalance", "network"],
  data() {
    return {
      // LAYOUT
      navState: false,
      childData: "",
    };
  },
  methods: {
    closeNav() {
      const app = this;
      app.navState = false;
      console.log("closing nav");
    },
  },
};
</script>
