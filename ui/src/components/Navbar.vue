<template>
  <div>
    <!-- ALERT BANNER TESTNET -->
    <div class="alert-banner py-3 px-4">
      <div class="container">
        <p>
          <i class="fa-solid fa-circle-exclamation mr-3"></i>
          <b>
            <span v-if="selectedContract === 'goerli'"
              >Retriev is in testnet.</span
            >
            This is an alpha version and storage is at your own risk.</b
          >
        </p>
      </div>
    </div>
    <!-- END ALERT BANNER TESTNET -->

    <!-- NAVBAR -->
    <div class="header p-4">
      <div class="container px-md-5" :class="{ 'px-5': !isDesktop }">
        <div
          class="columns is-mobile is-multiline is-vcentered is-justify-content-space-between"
        >
          <div class="column is-2-mobile is-2-tablet is-3-desktop">
            <a href="/#/app">
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
                  :style="[
                    openSelect
                      ? {
                          borderBottom: 'none',
                          borderBottomLeftRadius: '0',
                          borderBottomRightRadius: '0',
                        }
                      : { top: '0px' },
                  ]"
                  @click="openSelect = !openSelect"
                >
                  <div class="custom_dropdown__text">
                    <span v-if="selectedContract === 'goerli'">
                      <i class="fa-brands fa-ethereum mr-2"></i>
                      GOERLI</span
                    >
                    <span v-if="selectedContract === 'polygon'">
                      <PolygonIco class="mr-2" />
                      POLYGON</span
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
                  <ul
                    v-if="openSelect"
                    class="custom_dropdown__items"
                    @mouseleave="openSelect = false"
                  >
                    <li
                      @click="selectContract(contract)"
                      v-for="contract in config"
                      :value="contract.blockchain"
                      :key="contract.blockchain"
                    >
                      <span v-if="contract.blockchain === 'goerli'">
                        GOERLI</span
                      >
                      <span v-if="contract.blockchain === 'polygon'">
                        POLYGON</span
                      >
                    </li>
                  </ul>
                </Transition>
              </div>
              <!-- END | Select Blockchain contract -->

              <div
                v-if="accountBalance.length > 0"
                @click="isWithdraw = !isWithdraw"
                class="btn-navbar is-flex is-align-items-center ml-2"
              >
                <div style="padding: 10px 30px">
                  <span>{{ accountBalance.substr(0, 4) }}</span>
                  <span v-if="parseInt(network) === 5">
                    <span> gETH</span></span
                  >
                  <span v-if="parseInt(network) === 1">ETH</span>
                  <span v-if="parseInt(network) === 137"> MATIC</span>
                </div>

                <div style="border-left: 1px solid white; padding: 10px 30px">
                  <i class="fa-solid fa-wallet mr-2"></i>
                  {{ account.substr(0, 4) + "..." + account.substr(-4) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END | NAVBAR -->

    <!-- REFEREE SPECIFICATION -->
    <Transition
      enter-active-class="slide-in-right"
      leave-active-class="slide-out-right"
    >
      <div v-if="navSpec" @mouseleave="$emit('toggleSpec')" class="right-col">
        <div class="referee-container px-5">
          <!-- <div class="referee-icon">
                        </div> -->
          <div class="mt-5">
            <h3>Referee Net #1</h3>
            <div class="mt-6">
              <h5 class="pb-2 b-bottom-colored-grey mb-3">
                Referee IDs
                <i class="fa-solid fa-wallet ml-3"></i>
              </h5>

              <div v-if="referees !== undefined && referees.length > 0">
                <a
                  class="hover-underline"
                  style="display: block"
                  :href="'https://goerli.etherscan.io/address/' + referee"
                  target="_blank"
                  v-for="referee in referees"
                  :key="referee.index"
                >
                  {{ referee.substr(0, 4) + "..." + referee.substr(-4) }}
                </a>
              </div>
            </div>
          </div>
          <div class="mt-5">
            <h5 class="pb-2 b-bottom-colored-grey">
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
              class="btn-navbar p-3"
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
      <div v-if="isWithdraw" @mouseleave="isWithdraw = false" class="right-col">
        <div class="nav-container p-5">
          <div class="mt-6">
            <h3><i class="fa-solid fa-user mr-3"></i> User Details:</h3>
            <div class="mt-6">
              <h5 class="pb-2 b-bottom-colored-grey">
                Account Connected
                <i class="fa-solid fa-link ml-3"></i>
              </h5>
              <p v-if="account" class="mt-3">
                {{ account.substr(0, 5) + "..." + account.substr(-5) }}
              </p>
              <p v-if="!account">No account connected</p>
            </div>
            <div class="mt-3">
              <h5 class="pb-2 b-bottom-colored-grey">
                Total Balance
                <i class="fa-solid fa-wallet ml-3"></i>
              </h5>
              <p class="mt-3">
                {{ accountBalance.substr(0, 7) }}
                <span v-if="selectedContract === 'polygon'">MATIC</span
                ><span v-if="selectedContract === 'goerli'">ETH</span>
              </p>
            </div>
            <div class="mt-3">
              <h5 class="pb-2 b-bottom-colored-grey">
                Vault funds
                <i class="fa-solid fa-vault ml-3"></i>
              </h5>
              <p class="mt-3">
                {{ balance.substr(0, 7) }}
                <span v-if="selectedContract === 'polygon'">MATIC</span
                ><span v-if="selectedContract === 'goerli'">ETH</span>
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
        <div class="nav-container p-5 mb-6">
          <div class="logo-navbar mb-3">
            <img width="30px" src="../assets/img/logo.svg" alt="" />
          </div>
          <div v-if="allDeals !== undefined">
            <h5 class="pb-2 b-bottom-colored-light">
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
</template>

<script>
import checkViewport from "@/mixins/checkViewport";
import PolygonIco from "@/components/elements/PolygonIco.vue";
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
  components: {
    PolygonIco,
  },
  watch: {
    async isWithdraw() {
      const app = this;
      if (app.isWithdraw === true) {
        if (app.selectedContract === "goerli") {
          try {
            let allDeals = await axios.get(
              app.config[1].api + "/deals/" + app.account
            );
            app.allDeals = allDeals.data.length;
          } catch (e) {
            console.log("Error while calculating deals");
          }
        } else if (app.selectedContract === "polygon") {
          try {
            let allDeals = await axios.get(
              app.config[0].api + "/deals/" + app.account
            );
            app.allDeals = allDeals.data.length;
          } catch (e) {
            console.log("Error while calculating deals");
          }
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
