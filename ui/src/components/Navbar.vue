<template>
  <div>
    <!-- ALERT BANNER TESTNET -->
    <div v-if="selectedContract === 'ethereum'" class="alert-banner py-3 px-5">
      <div class="container">
        <p>
          <i class="fa-solid fa-circle-exclamation mr-3"></i>
          <b
            >Retriev is in testnet. This is an alpha version and storage is at
            your own risk.</b
          >
        </p>
      </div>
    </div>
    <!-- ALERT BANNER TESTNET -->
    <div class="header py-6">
      <div class="container" :class="{ 'px-5': !isDesktop }">
        <div
          class="columns is-mobile is-multiline is-vcentered is-justify-content-space-between"
        >
          <div class="column is-2-mobile is-2-tablet is-3-desktop">
            <a href="/">
              <div class="is-flex is-align-items-center">
                <img src="../assets/img/logo-ext.svg" alt="" /></div
            ></a>
          </div>
          <div class="column is-10-mobile is-10-tablet is-9-desktop">
            <div
              class="is-flex is-align-items-center"
              :class="{ 'is-justify-content-flex-end': !isMobile }"
            >
              <!-- Select Blockchain contract -->
              <div class="custom_dropdown-2 me-10-desktop">
                <div
                  class="custom_dropdown__face"
                  @click="openSelect = !openSelect"
                >
                  <div class="custom_dropdown__text">
                    <span>
                      <i class="fa-brands fa-ethereum mr-2"></i>
                      {{ selectedContract }}</span
                    >

                    <i
                      v-if="!openSelect"
                      class="ml-3 fa-solid fa-chevron-right"
                    ></i>
                    <i
                      v-if="openSelect"
                      class="ml-3 fa-solid fa-chevron-down"
                    ></i>
                  </div>
                </div>
                <Transition
                  name="custom-fade"
                  enter-active-class="fade-in-top"
                  leave-active-class="fade-out-top"
                >
                  <ul v-if="openSelect" class="custom_dropdown__items">
                    <li
                      @click="selectContract(contract)"
                      v-for="contract in config"
                      :value="contract.blockchain"
                      :key="contract.blockchain"
                    >
                      {{ contract.blockchain }}
                    </li>
                  </ul>
                </Transition>
              </div>
              <!-- END | Select Blockchain contract -->

              <div
                v-if="accountBalance.length > 0"
                @click="isWithdraw = !isWithdraw"
                class="btn-light ml-2 mr-2"
              >
                <span>{{ accountBalance.substr(0, 4) }}</span>
                <span
                  v-if="parseInt(network) === 5"
                  style="text-transform: lowercase"
                >
                  g</span
                >
                <span v-if="parseInt(network) === 1"> ETH</span>
                <span v-if="parseInt(network) === 137"> MATIC</span>
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
                                  'https://goerli.etherscan.io/address/' +
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
                          <img src="../assets/img/logo.svg" alt="" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";
import axios from "axios";

export default {
  mixins: [checkViewport],
  props: [
    "config",
    "selectedContract",
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
      openSelect: false,
      childData: "",
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
    selectContract(contract) {
      const app = this;
      localStorage.setItem("contract", contract.blockchain);
      console.log(
        "Funtcion selectContract CONTRACT",
        localStorage.getItem("contract")
      );
      window.location.reload();
    },
  },
};
</script>

<style scoped>
.b-tooltip.is-multiline.is-medium .tooltip-content {
  width: 100px !important;
}
</style>
