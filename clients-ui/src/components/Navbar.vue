<template>
  <div>
    <div class="header py-5" :class="{ 'px-3': !isDesktop }">
      <div class="container">
        <div
          class="columns is-mobile is-multiline is-vcentered is-justify-content-space-between"
        >
          <div class="column is-2-mobile is-1-tablet is-3-desktop">
            <a href="/">
              <div class="is-flex is-align-items-center">
                <img src="../assets/img/logo.svg" alt="" />
                <h2
                  v-if="!isMobile && !isTablet"
                  class="pay-off tertiary-light-text ml-4"
                >
                  Retrieval Pinning
                </h2>
              </div></a
            >
          </div>
          <div class="column is-10-mobile is-11-tablet is-9-desktop">
            <div
              class="is-flex is-align-items-center"
              :class="{ 'is-justify-content-flex-end': !isMobile }"
            >
              <div class="btn-light" style="cursor: default">
                <i class="fa-brands fa-ethereum mr-2"></i
                ><span v-if="parseInt(network) === 4">Rinkeby</span>
                <span v-if="parseInt(network) === 1">Ethereum</span>
              </div>
              <div class="btn-light ml-2" @click="$emit('closeSpec')">
                Referee Net #1
              </div>
              <div
                v-if="balance.length > 0"
                class="btn-light btn-withdraw ml-2"
                @click="$emit('withdraw')"
              >
                <span>{{ balance.substr(0, 4) }}</span>
                <span style="text-transform: lowercase">r</span>
                <span>ETH</span>
              </div>
              <div
                class="btn-minimal-noHover"
                style="margin-left: -1px; cursor: default"
              >
                <i class="fa-solid fa-wallet mr-2"></i>
                {{ account.substr(0, 4) + "..." + account.substr(-4) }}
              </div>
              <!-- Navbar -->
              <div class="ml-2">
                <div>
                  <!-- Nav Button show/hide -->
                  <div
                    @click="navState = !navState"
                    @mouseleave="closeSpec()"
                    class="btn-light-icon"
                  >
                    <i class="fa-solid fa-ellipsis"></i>
                  </div>
                  <!--End | Nav Button show/hide -->

                  <!-- NAVBAR -->
                  <Transition
                    enter-active-class="slide-in-right"
                    leave-active-class="slide-out-right"
                  >
                    <div
                      v-if="navState"
                      @mouseleave="closeNav()"
                      class="right-col"
                    >
                      <div class="nav-container">
                        <div class="mt-3">
                          <a href="/"
                            ><i class="fa-solid fa-server mr-2"></i>Dashboard</a
                          >
                        </div>
                        <div class="mt-3">
                          <a
                            href="https://filecoinproject.slack.com/archives/C03CJKWP2DR"
                            target="_blank"
                            ><i class="fa-solid fa-circle-question mr-2"></i
                            >Help</a
                          >
                        </div>
                        <div class="mt-3">
                          <a href="https://pldr.dev" target="_blank"
                            ><i class="fa-solid fa-link mr-2"></i>website</a
                          >
                        </div>
                      </div>
                      <div class="nav-container">
                        <div class="logo-navbar mb-3">
                          <img src="../assets/img/icon-tr.svg" alt="" />
                        </div>
                        <p class="navbar-text">
                          Retrieval Pinning is part of an interoperable
                          ecosystem of on-chain storage products.
                        </p>
                      </div>
                    </div>
                  </Transition>
                  <!-- END NAVBAR -->

                  <!-- REFEREE SPECIFICATION -->
                  <Transition
                    enter-active-class="slide-in-right"
                    leave-active-class="slide-out-right"
                  >
                    <div
                      v-if="navSpec"
                      @mouseleave="$emit('closeSpec')"
                      class="right-col"
                    >
                      <div class="nav-container px-5">
                        <div class="referee-icon">
                        </div>
                        <div class="mt-5">
                          <h3>Referee Net #1</h3>
                          <div class="mt-6">
                            <h5 class="pb-2 b-bottom-colored-dark">
                              Referee IDs
                              <i class="fa-solid fa-wallet ml-3"></i>
                            </h5>
                            <p class="mt-3">
                              0x6909...eAdv<br />
                              0x1106...0Beoz<br />
                              0x429r...bmAKg
                            </p>
                          </div>
                        </div>
                        <div class="mt-5">
                          <h5 class="pb-2 b-bottom-colored-dark">
                            TERMS OF SERVICE
                          </h5>
                          <p class="mt-3"><b>Deal proposal time out: </b>24h</p>
                          <p class="mt-5"><b># Round: </b>12</p>
                          <p><b>Round duration: </b>1h</p>
                          <p><b>Slashing condition: </b>100%</p>
                          <p class="mt-5"><b>Max appeals: </b>5</p>
                          <p><b>Appeal cost: </b>0.2 x payment</p>
                          <p class="mt-5"><b>Provider slash: </b></p>
                          <p>- Payment completely refunded</p>
                          <p>
                            - Collateral goes into protoco vault
                          </p>
                        </div>
                      </div>
                    </div>
                  </Transition>
                  <!-- END REFEREE SPECIFICATION -->
                </div>

                <!-- END - Navbar -->
              </div>
              <div class="ml-2">
                <!-- Logs button show/hide -->
                <div @click="logState = !logState" class="btn-light-icon">
                  <i class="fa-solid fa-terminal"></i>
                </div>
                <!-- END - Logs button show/hide -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ALERT BANNER TESTNET -->
    <div class="alert-banner py-3 mb-4" :class="{ 'px-3': !isDesktop }">
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

    <!-- Application Logs -->
    <Transition
      enter-active-class="slide-in-right"
      leave-active-class="slide-out-right"
    >
      <div
        v-if="logState"
        @mouseleave="closeLogs()"
        class="right-col"
        style="padding: 0.5rem 1.5rem"
      >
        <p v-html="logs"></p>
      </div>
    </Transition>
    <!-- END - Application Logs -->

    <!-- Working Messages -->
    <div
      class="workingMessage is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center is-justify-content-center"
      v-if="isWithdraw"
    >
      <i class="fas fa-spinner fa-pulse mr-5"></i>
      <p class="text-center">{{ withdrawMessage }}</p>
    </div>
    <!-- END Working Messages -->
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  mixins: [checkViewport],
  props: [
    "account",
    "accountBalance",
    "network",
    "expertMode",
    "logs",
    "balance",
    "navSpec",
  ],
  data() {
    return {
      // LAYOUT
      navState: false,
      childData: "",
      logState: false,
      hideForNow: true,
      isWithdraw: false,
      withdrawMessage: false,
    };
  },
  methods: {
    closeNav() {
      const app = this;
      app.navState = false;
    },
    closeLogs() {
      const app = this;
      app.logState = false;
    },

    alertCustomError(message) {
      this.$buefy.dialog.alert({
        title: "Error",
        message: message,
        type: "is-danger",
        hasIcon: true,
        icon: "times-circle",
        iconPack: "fa",
        ariaRole: "alertdialog",
        ariaModal: true,
      });
    },
  },
};
</script>
