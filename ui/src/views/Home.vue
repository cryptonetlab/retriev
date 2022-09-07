<template>
  <div>
    <!-- MOBILE BLOCKER DAPP -->
    <div v-if="isMobile" class="mobile-blocker">
      <div class="logo mb-3">
        <img src="../assets/img/logo.svg" alt="" />
      </div>
      <h2 class="pay-off-2 tertiary-light-text">Retrieval Pinning</h2>
      <p class="has-text-centered mt-5">
        For a better experience, use dApp from Desktop.
      </p>
    </div>
    <!-- END MOBILE BLOCKER DAPP -->
    <section v-if="!isMobile" class="hero" :class="{ 'no-scroll': isWorking }">
      <!-- TODO: INFO DEAL TUTTE IN NERO -->
      <div v-if="account">
        <!-- NAVBAR SECTION -->
        <Navbar
          :account="account"
          :network="network"
          :accountBalance="accountBalance"
          :expertMode="expertMode"
          :logs="logs"
          :loading="loading"
          :balance="balance"
          :isWorking="isWorking"
          :workingMessage="workingMessage"
          :navSpec="navSpec"
          :referees="referees"
          :web3="web3"
          @withdraw="withdraw()"
          @toggleSpec="toggleSpec()"
        />
        <!-- END | NAVBAR SECTION -->

        <!-- PLATFORM START -->
        <div class="bg-color-light py-5" :class="{ 'px-3': !isDesktop }">
          <div class="container">
            <div>
              <div v-if="!loading">
                <div>
                  <!-- TITLE -->
                  <div class="b-bottom-colored-dark m-0 pb-3 mb-6">
                    <h2 class="title is-3 m-0">MANAGE DEALS</h2>
                  </div>
                  <!-- END TITLE -->

                  <!-- Message pending Tx -->
                  <!-- <div v-if="pendingTx">
                    Searching for latest transaction {{ pendingTx }}, please
                    wait...<br /><br />
                  </div> -->

                  <!-- ACTION BAR (button create deal - searchbar - filters) -->
                  <div class="columns is-mobile is-multiline is-vcentered mb-5">
                    <div class="column is-4-mobile is-4-tablet is-5-desktop">
                      <a href="/#/create" class="btn-secondary">
                        <i class="fa-solid fa-file-medical mr-3"></i>create new
                        deal
                      </a>
                    </div>

                    <!-- SEARCH FUNCTION -->
                    <div class="column is-4-mobile is-4-tablet is-5-desktop">
                      <div class="field" style="position: relative">
                        <div class="control has-icons-left has-icons-right">
                          <input
                            class="input is-info"
                            type="text"
                            placeholder=" Search Deal URI"
                            v-model="searcher"
                          />
                          <span class="icon is-small is-left">
                            <i class="fa-solid fa-magnifying-glass"></i>
                          </span>
                        </div>
                        <div
                          v-if="searcher !== undefined && searcher.length !== 0"
                          class="placeholder-input-search"
                        >
                          <i
                            class="fa-solid fa-circle-xmark pointer"
                            @click="searcher = ''"
                          ></i>
                        </div>
                      </div>
                    </div>
                    <!-- END SEARCH FUNCTION -->

                    <!-- FILTER FUNCTIONS -->
                    <div
                      class="column is-4-mobile is-4-tablet is-2-desktop"
                      :class="{ 'has-text-right': !isMobile }"
                    >
                      <div class="custom_dropdown me-10-desktop">
                        <div
                          class="custom_dropdown__face"
                          @click="filtered = !filtered"
                        >
                          <div class="custom_dropdown__text">
                            <span class="small">FILTER:</span>
                            <span v-if="activeDeal">Active</span>
                            <span
                              v-if="
                                endedDeal !== undefined && endedDeal === true
                              "
                              >Ended</span
                            >
                            <span v-if="showallDeals">All</span>
                            <i
                              v-if="!filtered"
                              class="ml-3 fa-solid fa-chevron-right"
                            ></i>
                            <i
                              v-if="filtered"
                              class="ml-3 fa-solid fa-chevron-down"
                            ></i>
                          </div>
                        </div>
                        <Transition
                          name="custom-fade"
                          enter-active-class="fade-in-top"
                          leave-active-class="fade-out-top"
                        >
                          <ul v-if="filtered" class="custom_dropdown__items">
                            <li
                              @click="
                                (showallDeals = true),
                                  (activeDeal = false),
                                  (endedDeal = false),
                                  (filtered = false),
                                  allDeals()
                              "
                            >
                              All
                            </li>
                            <li
                              @click="
                                (activeDeal = true),
                                  (showallDeals = false),
                                  (endedDeal = false),
                                  (filtered = false),
                                  loadState()
                              "
                            >
                              Active
                            </li>
                            <li
                              @click="
                                (endedDeal = true),
                                  (showallDeals = false),
                                  (activeDeal = false),
                                  (filtered = false),
                                  expiredDeals()
                              "
                            >
                              Ended
                            </li>
                          </ul>
                        </Transition>
                      </div>
                    </div>
                    <!-- END | FILTER FUNCTION -->
                  </div>
                  <!-- END | ACTION BAR (button create deal - searchbar - filters) -->

                  <div class="mb-5" v-if="deals.length > 0">
                    <!-- TITLES TABLE -->
                    <div
                      class="columns is-mobile is-multiline is-vcentered hide"
                      v-if="!isMobile"
                    >
                      <div
                        class="column is-4-mobile is-2-tablet is-5-desktop is-6-widescreen is-6-fullhd"
                      >
                        <h5 class="title-table ml-5">DEAL TYPE</h5>
                      </div>
                      <div
                        class="column is-4-mobile is-6-tablet is-4-desktop is-4-widescreen is-4-fullhd"
                      >
                        <h5 class="title-table ml-5">ACTIONS</h5>
                      </div>
                      <div
                        class="column is-4-mobile is-2-tablet is-2-desktop is-2-widescreen is-2-fullhd"
                      >
                        <h5
                          class="title-table"
                          :class="{ 'ml-5': isDesktop, 'ml-6': isTablet }"
                        >
                          STATUS
                        </h5>
                      </div>
                    </div>
                    <!-- END TITLES TABLE -->

                    <!-- DEALS -->
                    <div>
                      <div v-for="(deal, index) in deals" :key="deal.index">
                        <Deal
                          :web3="web3"
                          :account="account"
                          :storedDeal="deal"
                          :index="index"
                          :opensea="opensea"
                          :contract="contract"
                          :abi="abi"
                          :providerEndpoints="providerEndpoints"
                          @toggleSpec="toggleSpec()"
                          @alert="alertCustomError($event)"
                        />
                      </div>
                    </div>
                    <!-- DEALS -->
                  </div>
                  <!-- NO DEALS -->
                  <p
                    v-if="
                      deals.length === 0 &&
                      searcher.length === 0 &&
                      endedDeal !== undefined &&
                      endedDeal === false
                    "
                    class="mt-6"
                  >
                    You have no active Deals or Proposal. Create a new one or
                    view the history of Deals you have created.
                  </p>
                  <!-- END | NO DEALS -->

                  <!-- NO DEALS -->
                  <p
                    v-if="
                      (deals.length === 0 && searcher.length > 0) ||
                      (deals.length === 0 &&
                        endedDeal !== undefined &&
                        endedDeal === true)
                    "
                    class="mt-6"
                  >
                    No deal fouded... try again!
                  </p>
                  <!-- END | NO DEALS -->
                </div>
              </div>
              <div
                v-if="loading"
                class="mt-6 mb-6 has-text-centered pulse_loading"
              >
                <div class="btn-loader">
                  <h2 class="m-0">
                    <i class="fas fa-spinner fa-pulse mr-3"></i> PREPARING
                    DASHBOARD
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- PLATFORM END -->
      </div>

      <!-- Connect Wallet container -->
      <div v-if="!account" class="connect-container">
        <div class="grid-img">
          <img src="../assets/img/grid.svg" alt="">
        </div>
        <div>
          <div class="logo">
            <img src="../assets/img/logo.svg" alt="" />
          </div>
          <br />
          <h2 class="pay-off tertiary-light-text">Retrieval Pinning</h2>
          <div class="mt-5">
            <p class="mb-0">Please connect your wallet first</p>
            <div class="btn-primary mt-4" @click="connect()">
              <i class="fa-solid fa-wallet mr-3"></i> Connect Wallet
            </div>
          </div>
        </div>
      </div>

      <!-- END | Connect Wallet container -->

      <!-- Working Messages -->
      <div
        class="workingMessage is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center is-justify-content-center"
        v-if="
          isWorking && workingMessage !== undefined && workingMessage !== ''
        "
      >
        <i class="fas fa-spinner fa-pulse mr-5"></i>
        <p class="text-center">{{ workingMessage }}</p>
      </div>
      <!-- END Working Messages -->
    </section>
  </div>
</template>
<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Navbar from "@/components/Navbar.vue";
import Deal from "@/components/Deal.vue";
import checkViewport from "@/mixins/checkViewport";
import { io } from "socket.io-client";
const axios = require("axios");
const ABI = require("../abi.json");

export default {
  name: "Home",
  mixins: [checkViewport],
  components: {
    Navbar,
    Deal,
  },
  data() {
    return {
      account: "",
      accountBalance: 0,
      opensea: process.env.VUE_APP_OPENSEA,
      contract: process.env.VUE_APP_CONTRACT,
      infuraId: process.env.VUE_APP_INFURA_ID,
      network: process.env.VUE_APP_NETWORK,
      web3: "",
      loading: true,
      showCreate: false,
      isWorking: false,
      isToasting: false,
      workingMessage: "",
      minDuration: 3600,
      maxDuration: 42000,
      proposalTimeout: 0,
      deals: [],
      providers: [],
      txids: [],
      providerEndpoints: {},
      logs: "",
      dealUri: "",
      dealCollateral: "",
      dealProviders: "",
      dealValue: "",
      abi: ABI,
      balance: 0,
      infuraURL: "https://ipfs.infura.io:5001/api/v0/add",
      currentNetwork: { icon: "fa-solid fa-user-secret", text: "Rinkeby" },
      appealsByUri: {},
      isUploadingIPFS: false,
      slashingMultiplier: 10,
      appealAddress: "",
      pendingTx: "",
      // REFRESH SINGLE DEAL
      selectedDeal: {},
      // FOR LAYOUT
      expertMode: false,
      navSpec: false,
      // FILTER
      changeNetwork: false,
      filtered: false,
      activeDeal: true,
      endedDeal: false,
      showallDeals: false,
      searcher: "",
      referees: [],
    };
  },
  watch: {
    searcher() {
      const app = this;
      if (app.searcher !== undefined && app.searcher.length > 3) {
        console.log("searching wathcer");
        console.log("searcher length", app.searcher.length);
        app.searchDealURI();
      } else if (app.searcher.length === 0) {
        app.loadState();
      }
    },
  },

  methods: {
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
      app.web3 = await new Web3(provider);
      const netId = await app.web3.eth.net.getId();
      console.log("Current network is:", netId);
      if (parseInt(netId) === parseInt(app.network)) {
        const accounts = await app.web3.eth.getAccounts();
        if (accounts.length > 0) {
          app.account = accounts[0];
          app.appealAddress = app.account;
          app.accountBalance = await app.web3.eth.getBalance(accounts[0]);
          console.log("account balance is", app.accountBalance);
          app.accountBalance = parseFloat(
            app.web3.utils.fromWei(app.accountBalance, "ether")
          ).toFixed(10);
          app.loadState();
        }
      } else {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId:
                  "0x" + Number(process.env.VUE_APP_NETWORK).toString(16),
              },
            ],
          });
          setTimeout(function () {
            app.connect();
          }, 100);
        } catch (e) {
          app.log(
            "Can't automatically switch to rinkeby, please do it manually."
          );
        }
      }
    },
    log(...what) {
      const app = this;
      console.log(what);
      const temp = app.logs;
      app.logs = "";
      for (let k in what) {
        try {
          app.logs = JSON.stringify(what[k]);
        } catch (e) {
          app.logs = what[k];
        }
      }
      app.logs += "<hr>" + temp;
    },
    async searchPending() {
      const app = this;
      const pendingTx = localStorage.getItem("pendingTx");
      app.pendingTx = pendingTx;
      console.log("Stored pending tx:", pendingTx);
      let found = false;
      if (pendingTx === null || pendingTx.length === 0) {
        found = true;
      }
      if (!found) {
        app.$buefy.toast.open({
          duration: 500000,
          message:
            '<i class="fa-solid fa-hourglass-half"></i> ' +
            ` Searching for latest transaction: ` +
            pendingTx +
            ` please wait...`,
          position: "is-bottom-right",
          type: "is-warning",
        });
        let deals = await axios.get(
          process.env.VUE_APP_API_URL + "/deals/" + app.account
        );
        for (let k in deals.data) {
          let deal = deals.data[k];
          if (
            deal.proposal_tx !== undefined &&
            deal.proposal_tx === pendingTx
          ) {
            found = true;
            app.$toast.clear();
            if (app.txids.indexOf(deal.proposal_tx) === -1) {
              app.txids.push(deal.proposal_tx);
              app.deals.push(deal);
            }
          }
        }
        // Still not found
        if (!found) {
          app.log("Pending tx not found, refreshing in 2 seconds..");
          setTimeout(function () {
            app.searchPending();
          }, 2000);
        } else {
          app.$toast.clear();
          app.log("Pending tx found, removing from cache.");
          localStorage.removeItem("pendingTx");
          app.pendingTx = "";
        }
      }
    },
    async parseDeal(deal) {
      const app = this;
      deal.canAppeal = true;
      // TODO: Optimize contract
      const contract = new app.web3.eth.Contract(app.abi, app.contract);
      const appeal_index = await contract.methods
        .active_appeals(deal.deal_uri)
        .call();
      const round = await contract.methods.getRound(appeal_index).call();
      console.log(
        "deal " + deal.index + " with appeal index ",
        appeal_index + " have a round " + round
      );
      // Check if appeal ended
      if (
        deal.appeal !== undefined &&
        deal.appeal.round !== undefined &&
        parseInt(deal.appeal.round) < 99
      ) {
        deal.canAppeal = false;
        app.appealsByUri[deal.deal_uri] = deal.appeal;
      }
      // Check if deal ended
      if (deal.timestamp_end * 1000 < new Date().getTime() || deal.canceled) {
        deal.canAppeal = false;
      }
      // Check if appeal doesn't exists
      if (deal.appeal === undefined || Object.keys(deal.appeal) === 0) {
        deal.canAppeal = true;
      }
      if (app.appealsByUri[deal.deal_uri] !== undefined) {
        deal.canAppeal = false;
      }
      // Set expiration timestamp
      const expires_at =
        (parseInt(deal.timestamp_request) + parseInt(app.proposalTimeout)) *
        1000;
      // Check if expired
      if (new Date().getTime() > expires_at) {
        deal.expired = true;
      } else {
        deal.expired = false;
      }
      // Getting round appel
      return deal;
    },
    async loadState() {
      const app = this;
      app.appealsByUri = {};
      app.showLoadingToast(
        "Loading data from blockchain and fetching your deals, please wait..."
      );
      app.deals = [];
      app.isWorking = false;
      app.log("Reading state from blockchain..");
      const contract = new app.web3.eth.Contract(app.abi, app.contract);
      // const totalDeals = await contract.methods.totalDeals().call();
      app.balance = await contract.methods.vault(app.account).call();
      app.balance = app.web3.utils.fromWei(app.balance);
      app.slashingMultiplier = parseInt(
        await contract.methods.slashing_multiplier().call()
      );

      // Checking proposal timeout
      let proposalTimeout = await contract.methods.proposal_timeout().call();
      app.proposalTimeout = proposalTimeout;
      console.log("Proposal Timeout", app.proposalTimeout);

      try {
        app.isWorking = true;
        let deals = await axios.get(
          process.env.VUE_APP_API_URL + "/deals/" + app.account
        );
        app.isWorking = false;
        let keys = [];
        for (let k in deals.data) {
          let deal = await app.parseDeal(deals.data[k]);
          if (deal.proposal_tx !== undefined && deal.proposal_tx !== null) {
            app.txids.push(deal.proposal_tx);
          }
          if (keys.indexOf(parseInt(deal.index)) === -1) {
            keys.push(parseInt(deal.index));
            // Check if deal can appeal or not

            // Getting active deals
            if (
              parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 ||
              (parseInt(deal.timestamp_start) === 0 &&
                !deal.expired &&
                !deal.canceled)
            ) {
              keys.push(parseInt(deal.index));
              app.deals.push(deal);
            }
            // console.log("Can deal appeal?", deal.canAppeal);
          }
        }

        app.searchPending();
        app.$forceUpdate();
        // app.log("Found #" + app.deals.length + " deals.");
        console.log("deals", app.deals);
        this.$toast.clear();
        // app.activeDeals();
      } catch (e) {
        console.log(e);
        app.alertCustomError(
          "Can't fetch deals from blockchain, please retry!"
        );
      }

      app.minDuration = parseInt(await contract.methods.min_duration().call());
      app.maxDuration = await contract.methods.max_duration().call();
      app.log("Min duration is: " + app.minDuration);
      app.log("Max duration is: " + app.maxDuration);

      app.loading = false;

      // Connecting to p2p network
      app.providers = [];
      app.referees = [];
      let ended = false;
      let i = 0;
      let unique = [];
      while (!ended) {
        try {
          const provider = await contract.methods.active_providers(i).call();
          console.log("active provider are", provider);
          if (app.providers.indexOf(provider) === -1) {
            let providerDetails = await contract.methods
              .providers(provider)
              .call();
            providerDetails.address = provider;
            if (
              providerDetails.endpoint.indexOf("localhost") === -1 &&
              providerDetails.endpoint.indexOf("https") !== -1 &&
              unique.indexOf(providerDetails.endpoint) === -1
            ) {
              app.log("Found provider " + provider);
              unique.push(providerDetails.endpoint);
              app.providers.push(providerDetails);
              app.connectSocket(providerDetails.endpoint);
              app.providerEndpoints[provider] = providerDetails.endpoint;
            }
          }
        } catch (e) {
          ended = true;
        }
        i++;
      }
      console.log("DEFAULT PROVIDERS:", app.dealProviders);
      ended = false;
      i = 0;
      while (!ended) {
        try {
          const referee = await contract.methods.active_referees(i).call();
          if (app.referees.indexOf(referee) === -1) {
            app.referees.push(referee);
            const refereeDetails = await contract.methods
              .referees(referee)
              .call();
            if (unique.indexOf(refereeDetails.endpoint) === -1) {
              unique.push(refereeDetails.endpoint);
              app.connectSocket(refereeDetails.endpoint);
            }
          }
        } catch (e) {
          console.log(e);
          ended = true;
        }
        i++;
      }
    },
    async withdraw() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.showLoadingToast("Please confirm action with metamask..");
        try {
          const contract = new app.web3.eth.Contract(app.abi, app.contract);
          const balance = await contract.methods.vault(app.account).call();
          app.log("Balance found in contract is: " + balance);
          if (balance > 0) {
            await contract.methods
              .withdrawFromVault(balance)
              .send({
                from: app.account,
              })
              .on("transactionHash", (tx) => {
                this.$toast.warning("Found pending transaction at: " + tx, {
                  position: "top-right",
                  timeout: 15000,
                  closeOnClick: true,
                  pauseOnFocusLoss: true,
                  pauseOnHover: true,
                  draggable: true,
                  draggablePercent: 0.6,
                  showCloseButtonOnHover: true,
                  hideProgressBar: true,
                  closeButton: "button",
                  icon: "fa-solid fa-arrow-right-arrow-left",
                  rtl: false,
                });
                app.log(app.workingMessage);
              });
            app.$toast.clear();
            app.alertCustomError("Withdraw done!");
            app.loadState();
          } else {
            app.isWorking = false;
            app.alertCustomError("You have nothing to withdraw");
          }
        } catch (e) {
          app.isWorking = false;
          app.alertCustomError(e.message);
        }
      }
    },
    connectSocket(endpoint) {
      const app = this;
      app.log("Connecting to socket: " + endpoint);
      const socket = io(endpoint, {
        reconnectionDelayMax: 10000,
        query: { identity: app.account },
      });
      socket.on("slash", (message) => {
        if (message !== undefined) {
          app.parseMessage(message);
        }
      });
      socket.on("message", (message) => {
        if (message !== undefined) {
          app.parseMessage(message);
        }
      });
    },
    parseMessage(message) {
      const app = this;
      try {
        const msg = JSON.parse(message);
        console.log("msg", msg);
        if (msg !== undefined && msg.message !== undefined) {
          const realMessage = JSON.parse(msg.message);
          const action = realMessage.action;
          console.log("realMessage", realMessage);
          console.log("action", action);
          console.log("Owner is:", realMessage.owner);
          if (
            action !== undefined &&
            action === "ACCEPTED" &&
            realMessage.owner.toLowerCase() === app.account.toLowerCase()
          ) {
            app.showToast(
              "Your deal proposal #" +
                realMessage.deal_index +
                " was accepted by provider!"
            );
            app.log(
              "Your deal proposal #" +
                realMessage.deal_index +
                " was accepted by provider!"
            );
          } else if (
            action !== undefined &&
            action === "SLASHED" &&
            realMessage.owner.toLowerCase() === app.account.toLowerCase()
          ) {
            // TODO: Read deal_index from contract
            // app.showToast("A provider was slashed!");
            // app.log("A provider was slashed!");
          } else if (
            action !== undefined &&
            action === "UNRETRIEVALABLE" &&
            realMessage.owner.toLowerCase() === app.account.toLowerCase()
          ) {
            // TODO: Read deal_index from contract
            app.showErrorToast(
              "File is unretrievalable! Provider can't accept deal proposal #" +
                realMessage.deal_index
            );
            app.log(
              "File is unretrievalable! Provider can't accept deal proposal #" +
                realMessage.deal_index
            );
          }
        }
      } catch (e) {
        console.log("Error parsing message from socket");
        console.log(e);
      }
    },

    // NOTIFICATION AND ALERT
    showToast(message) {
      const app = this;
      if (!app.isToasting) {
        app.isToasting = true;
        app.$toast(message, {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: true,
          hideProgressBar: true,
          closeButton: "button",
          icon: "fa-solid fa-check",
          rtl: false,
        });
        setTimeout(function () {
          app.isToasting = false;
        }, 6200);
      }
    },
    showErrorToast(message) {
      const app = this;
      if (!app.isToasting) {
        app.isToasting = true;
        app.$toast.error(message, {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: true,
          hideProgressBar: true,
          closeButton: "button",
          icon: true,
          rtl: false,
        });
        setTimeout(function () {
          app.isToasting = false;
        }, 6200);
      }
    },
    showLoadingToast(message) {
      const app = this;
      if (!app.isToasting) {
        app.isToasting = true;
        app.$toast.warning(message, {
          position: "top-right",
          timeout: 10000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: true,
          hideProgressBar: true,
          closeButton: "button",
          icon: "fa-solid fa-hourglass-half",
          rtl: false,
        });
        setTimeout(function () {
          app.isToasting = false;
        }, 6200);
      }
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

    // FILTERS
    async expiredDeals() {
      const app = this;
      console.log("Checking all deals...");
      app.log("Checking all deals...");
      if (!app.isWorking) {
        app.isWorking = true;
        app.deals = [];
        try {
          let deals = await axios.get(
            process.env.VUE_APP_API_URL + "/deals/" + app.account
          );
          let keys = [];
          let appealsByUri = {};
          for (let k in deals.data) {
            let deal = deals.data[k];
            const expires_at =
              (parseInt(deal.timestamp_request) +
                parseInt(app.proposalTimeout)) *
              1000;

            if (new Date().getTime() > expires_at) {
              deal.expired = true;
            } else {
              deal.expired = false;
            }

            deal.canAppeal = true;
            // Check if appeal ended
            if (
              deal.appeal !== undefined &&
              deal.appeal.round !== undefined &&
              parseInt(deal.appeal.round) < 99
            ) {
              deal.canAppeal = false;
              appealsByUri[deal.deal_uri] = deal.appeal;
            }
            // Check if deal ended
            if (
              deal.timestamp_end * 1000 < new Date().getTime() &&
              deal.timestamp_start !== 0 &&
              parseInt(deal.timestamp_end) !== 604800
            ) {
              deal.canAppeal = false;
              deal.dealisEnded = true;
            } else {
              deal.dealisEnded = false;
            }

            // Check if deal is pending
            if (
              parseInt(deal.timestamp_start) === 0 &&
              deal.expired === false &&
              parseInt(deal.timestamp_end) === 604800
            ) {
              deal.dealPending = true;
            } else {
              deal.dealPending = false;
            }

            // Check if appeal doesn't exists
            if (deal.appeal === undefined || Object.keys(deal.appeal) === 0) {
              deal.canAppeal = true;
            }
            if (appealsByUri[deal.deal_uri] !== undefined) {
              deal.canAppeal = false;
            }
            console.log(
              "checking time",
              parseInt(deal.timestamp_end * 1000) < new Date().getTime()
            );
            if (keys.indexOf(parseInt(deal.index)) === -1) {
              if (
                deal.dealisEnded === true ||
                (deal.dealisEnded === true &&
                  deal.expired === true &&
                  !deal.dealPending) ||
                deal.canceled
              ) {
                keys.push(parseInt(deal.index));
                app.deals.push(deal);
              }
            }
          }
          app.isWorking = false;
          console.log("Expired Deals", app.deals);
        } catch (e) {
          app.alertCustomError(
            "Can't fetch deals from blockchain, please retry!"
          );
        }
      }
    },
    async allDeals() {
      const app = this;
      console.log("Checking all deals...");
      app.log("Checking all deals...");
      if (!app.isWorking) {
        app.isWorking = true;
        app.deals = [];
        try {
          let deals = await axios.get(
            process.env.VUE_APP_API_URL + "/deals/" + app.account
          );
          let keys = [];
          let appealsByUri = {};
          for (let k in deals.data) {
            let deal = deals.data[k];
            const expires_at =
              (parseInt(deal.timestamp_request) +
                parseInt(app.proposalTimeout)) *
              1000;

            if (new Date().getTime() > expires_at) {
              deal.expired = true;
            } else {
              deal.expired = false;
            }

            deal.canAppeal = true;
            // Check if appeal ended
            if (
              deal.appeal !== undefined &&
              deal.appeal.round !== undefined &&
              parseInt(deal.appeal.round) < 99
            ) {
              deal.canAppeal = false;
              appealsByUri[deal.deal_uri] = deal.appeal;
            }
            // Check if deal ended
            if (deal.timestamp_end * 1000 < new Date().getTime()) {
              deal.canAppeal = false;
            }
            // Check if appeal doesn't exists
            if (deal.appeal === undefined || Object.keys(deal.appeal) === 0) {
              deal.canAppeal = true;
            }
            if (appealsByUri[deal.deal_uri] !== undefined) {
              deal.canAppeal = false;
            }

            if (keys.indexOf(parseInt(deal.index)) === -1) {
              keys.push(parseInt(deal.index));
              app.deals.push(deal);
            }
          }
          app.isWorking = false;
          console.log("All Deals", app.deals);
        } catch (e) {
          app.alertCustomError(
            "Can't fetch deals from blockchain, please retry!"
          );
        }
      }
    },
    searchDealURI() {
      // filter deal by deal_uri by v-model "searcher"
      console.log("Starting search...");
      const app = this;
      if (app.searcher.length > 0) {
        app.deals = app.deals.filter((deal) => {
          return deal.deal_uri
            .toLowerCase()
            .includes(app.searcher.toLowerCase());
        });
        console.log("deal founded", app.deals);
      }
    },
    toggleSpec() {
      const app = this;
      app.navSpec = !app.navSpec;
    },
  },
  computed: {
    // filteredList() {
    //   return this.deals.filter((deal) => {
    //     if (this.searcher.length > 0) {
    //       return (
    //         deal.deal_uri !== undefined &&
    //         deal.deal_uri.toLowerCase().includes(this.searcher.toLowerCase())
    //       );
    //     } else {
    //       return Object.keys(deal).sort(); // Do your custom sorting here
    //     }
    //   });
    // },
  },
  mounted() {
    this.connect();
  },
};
</script>

<style></style>
