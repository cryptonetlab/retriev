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
                  class="pay-off-2 tertiary-light-text ml-4"
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
              <div
                v-if="accountBalance.length > 0"
                @click="isWithdraw = !isWithdraw"
                class="btn-light ml-2"
              >
                <span>{{ accountBalance.substr(0, 4) }}</span>
                <span
                  v-if="parseInt(network) === 4"
                  style="text-transform: lowercase"
                >
                  r</span
                >
                <span>ETH</span>
              </div>
              <div
                class="btn-light"
                style="margin-left: -1px"
                @click="isWithdraw = !isWithdraw"
              >
                <i class="fa-solid fa-wallet mr-2"></i>
                {{ account.substr(0, 4) + "..." + account.substr(-4) }}
              </div>
              <!-- Navbar -->
              <div class="ml-2">
                <div>
                  <!-- Nav Button show/hide -->
                  <div @click="navState = !navState" class="btn-light-icon">
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
                          ecosystem of
                          <a href="https://onchain.storage" target="_blank"
                            >on-chain storage products</a
                          >.
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
                      @mouseleave="$emit('toggleSpec')"
                      class="right-col"
                    >
                      <div class="referee-container px-5">
                        <!-- <div class="referee-icon">
                        </div> -->
                        <div class="mt-5">
                          <h3>Referee Net #1</h3>
                          <div class="mt-6">
                            <h5 class="pb-2 b-bottom-colored-dark">
                              Referee IDs
                              <i class="fa-solid fa-wallet ml-3"></i>
                            </h5>

                            <div
                              v-if="
                                referees !== undefined && referees.length > 0
                              "
                            >
                              <a
                                class="hover-underline"
                                style="display: block"
                                :href="
                                  'https://rinkeby.etherscan.io/address/' +
                                  referee
                                "
                                target="_blank"
                                v-for="referee in referees"
                                :key="referee.index"
                              >
                                {{
                                  referee.substr(0, 4) +
                                  "..." +
                                  referee.substr(-4)
                                }}
                              </a>
                            </div>
                          </div>
                        </div>
                        <div class="mt-5">
                          <h5 class="pb-2 b-bottom-colored-dark">
                            TERMS OF AGREEMENT
                            <i class="fa-solid fa-file-lines ml-2"></i>
                          </h5>
                          <p class="mt-3"><b>Deal proposal time out: </b>24h</p>
                          <p class="mt-5"><b># Round: </b>12</p>
                          <p><b>Round duration: </b>1h</p>
                          <p><b>Slashing condition: </b>100%</p>
                          <p class="mt-5"><b>Max appeals: </b>5</p>
                          <p><b>Appeal cost: </b>0.2 x payment</p>
                          <p class="mt-5"><b>Provider slash: </b></p>
                          <p>- Payment completely refunded</p>
                          <p>- Collateral goes into protocol's vault</p>
                        </div>
                        <div class="mt-5">
                          <a
                            class="btn-icon"
                            href="https://hackmd.io/Mp3_NyJhSbi-6g8BU_bgTg"
                            target="_blank"
                            >LEARN MORE</a
                          >
                        </div>
                      </div>
                    </div>
                  </Transition>
                  <!-- END REFEREE SPECIFICATION -->

                  <!-- WITHDRAW NAVBAR -->
                  <Transition
                    enter-active-class="slide-in-right"
                    leave-active-class="slide-out-right"
                  >
                    <div
                      v-if="isWithdraw"
                      @mouseleave="isWithdraw = false"
                      class="right-col"
                    >
                      <div class="nav-container">
                        <div class="mt-5">
                          <h3>
                            <i class="fa-solid fa-user mr-3"></i> User Details:
                          </h3>
                          <div class="mt-6">
                            <h5 class="pb-2 b-bottom-colored-dark">
                              Account Connected
                              <i class="fa-solid fa-link ml-3"></i>
                            </h5>
                            <p v-if="account" class="mt-3">
                              {{
                                account.substr(0, 5) +
                                "..." +
                                account.substr(-5)
                              }}
                            </p>
                            <p v-if="!account">No account connected</p>
                          </div>
                          <div class="mt-3">
                            <h5 class="pb-2 b-bottom-colored-dark">
                              Total Balance
                              <i class="fa-solid fa-wallet ml-3"></i>
                            </h5>
                            <p class="mt-3">{{ accountBalance }} ETH</p>
                          </div>
                          <div class="mt-3">
                            <h5 class="pb-2 b-bottom-colored-dark">
                              Vault funds
                              <i class="fa-solid fa-vault ml-3"></i>
                            </h5>
                            <p class="mt-3">
                              {{ balance }}
                              <span
                                v-if="parseInt(network) === 4"
                                style="text-transform: lowercase"
                              >
                                r</span
                              >ETH
                            </p>
                          </div>
                          <div class="mt-5">
                            <b-tooltip
                              class="b-tooltip-withdraw"
                              position="is-right"
                              type="is-info"
                              size="is-small"
                              :label="canWithdraw"
                              multilined
                            >
                              <b-button
                                :disabled="parseInt(balance) === 0"
                                @click="$emit('withdraw')"
                                class="btn-icon"
                              >
                                WITHDRAW
                              </b-button>
                            </b-tooltip>
                          </div>
                        </div>
                      </div>
                      <div class="nav-container">
                        <div class="logo-navbar mb-3">
                          <img src="../assets/img/icon-tr.svg" alt="" />
                        </div>
                        <div v-if="allDeals !== undefined">
                          <h5 class="pb-2 b-bottom-colored-dark">
                            Total Deal Created
                            <i class="fa-solid fa-file-invoice ml-3"></i>
                          </h5>
                          <p class="mt-3">{{ parseInt(allDeals) }} Deals</p>
                        </div>
                      </div>
                    </div>
                  </Transition>
                  <!-- END NAVBAR -->
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
    <!-- <div
      class="workingMessage is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center is-justify-content-center"
      v-if="isWithdraw"
    >
      <i class="fas fa-spinner fa-pulse mr-5"></i>
      <p class="text-center">{{ withdrawMessage }}</p>
    </div> -->
    <!-- END Working Messages -->
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";
import axios from "axios";

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
    "referees",
    "web3",
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
      allDeals: [],
      canWithdraw: "",
      TotalSpent: "",
      totalValue: [],
    };
  },
  watch: {
    async isWithdraw() {
      const app = this;
      if (app.isWithdraw === true) {
        try {
          let allDeals = await axios.get(
            process.env.VUE_APP_API_URL + "/deals/" + app.account
          );
          app.allDeals = allDeals.data.length;
        } catch (e) {
          console.log("Error while calculating deals");
        }
      }
    },
    balance() {
      const app = this;
      if (app.balance !== undefined && parseInt(app.balance) > 0) {
        app.canWithdraw = "Withdraw from you Vault";
      } else {
        app.canWithdraw = "Nothing to withdraw";
      }
    },
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
    closeWithdraw() {
      const app = this;
      app.isWithdraw = false;
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

<style scoped>
.b-tooltip.is-multiline.is-medium .tooltip-content {
  width: 100px !important;
}
</style>
