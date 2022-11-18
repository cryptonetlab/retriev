<template>
  <div>
    <!-- MOBILE BLOCKER APP -->
    <div v-if="isMobile" class="mobile-blocker">
      <div class="logo mb-3">
        <img src="../assets/img/logo-ext.svg" alt="" />
      </div>
      <p class="has-text-centered mt-5">
        For a better experience,<br />
        use app from Desktop.
      </p>
    </div>
    <!-- END MOBILE BLOCKER APP -->
    <section
      v-if="!isMobile"
      class="hero"
      :class="{ 'no-scroll': isWorking }"
      style="position: relative; min-height: 100vh"
    >
      <!-- TODO: INFO DEAL TUTTE IN NERO -->
      <div>
        <!-- NAVBAR SECTION -->
        <Navbar
          :config="config"
          :selectedContract="selectedContract"
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
          @reloadContract="fetchingContract()"
        />
        <!-- END | NAVBAR SECTION -->

        <!-- PLATFORM START -->
        <div
          v-if="account"
          class="container mt-5 pb-6 px-md-5"
          :class="{ 'px-5': !isDesktop, 'mb-6': !loading }"
        >
          <div class="columns is-mobile is-centered">
            <div class="column is-12-tablet is-10-desktop">
              <div>
                <div>
                  <Transition
                    enter-active-class="fadeIn"
                    leave-active-class="fadeOut"
                  >
                    <div v-if="!loading">
                      <div>
                        <!-- ACTION BAR (button create deal - searchbar - filters) -->
                        <div
                          class="columns is-mobile is-multiline is-vcentered"
                        >
                          <div
                            class="column is-4-mobile is-4-tablet is-4-desktop"
                          >
                            <a href="/#/app/new-deal" class="btn-secondary">
                              <i class="fa-solid fa-file-medical mr-3"></i
                              >Create new deal
                            </a>
                          </div>

                          <!-- SEARCH FUNCTION -->
                          <div
                            class="column is-4-mobile is-5-tablet is-5-desktop"
                          >
                            <div class="field" style="position: relative">
                              <div
                                class="control has-icons-left has-icons-right"
                              >
                                <input
                                  class="input is-info"
                                  type="text"
                                  placeholder=" Search Data URI"
                                  v-model="searcher"
                                />
                                <span class="icon is-small is-left">
                                  <i class="fa-solid fa-magnifying-glass"></i>
                                </span>
                              </div>
                              <div
                                v-if="
                                  searcher !== undefined &&
                                  searcher.length !== 0
                                "
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
                          <Filters
                            @filterAll="filterAll()"
                            @filterActive="filterActive()"
                            @filterEnded="filterEnded()"
                          />
                          <!-- END | FILTER FUNCTION -->
                        </div>
                        <!-- END | ACTION BAR (button create deal - searchbar - filters) -->

                        <!-- DEALS -->
                        <div class="mb-5" v-if="deals.length > 0">
                          <!-- TITLES TABLE -->
                          <div
                            class="columns is-mobile is-multiline is-vcentered hide mb-0"
                            v-if="!isMobile"
                          >
                            <div
                              class="column is-4-mobile is-7-tablet is-7-desktop is-8-widescreen is-9-fullhd"
                            >
                              <h5 class="title-table ml-5">RETRIEVAL DEALS</h5>
                            </div>
                            <div
                              class="column is-4-mobile is-2-tablet is-2-desktop is-2-widescreen is-1-fullhd"
                            >
                              <h5 class="title-table">ACTIONS</h5>
                            </div>
                            <div
                              class="column is-4-mobile is-2-tablet is-2-desktop is-1-widescreen is-1-fullhd"
                            >
                              <h5 class="title-table ml-4">STATUS</h5>
                            </div>
                          </div>
                          <!-- END TITLES TABLE -->
                          <PendingDeal :foundDeal="foundDeal" />
                          <div class="bordered">
                            <div
                              v-for="deal in filterDeals"
                              :key="deal.identifier"
                            >
                              <Deal
                                :web3="web3"
                                :account="account"
                                :storedDeal="deal"
                                :index="deal.index"
                                :apiEndpoint="apiEndpoint"
                                :opensea="opensea"
                                :contract="contract"
                                :abi="abi"
                                :providerEndpoints="providerEndpoints"
                                @toggleSpec="toggleSpec()"
                                @alert="alertCustomError($event)"
                              />
                            </div>
                          </div>
                        </div>
                        <!-- DEALS -->

                        <!-- NO DEALS MESSAGE -->

                        <div
                          class="pt-5"
                          v-if="
                            deals.length === 0 &&
                            searcher.length === 0 &&
                            isFilterEnded !== undefined &&
                            isFilterEnded === false
                          "
                        >
                          <div class="mb-6 mt-6 is-flex is-align-items-center">
                            <div class="mr-5">
                              <NoFile />
                            </div>
                            <div>
                              <h2 style="font-size: 1.4rem">
                                <b>You have no active Deals or Proposal.</b>
                              </h2>
                              <h2 class="mt-2" style="font-size: 1.4rem">
                                Create a new one or view the history <br />of
                                Deals you have created.
                              </h2>
                            </div>
                          </div>
                        </div>

                        <!-- END | NO DEALS MESSAGE -->

                        <!-- NO DEALS MESSAGE 2-->
                        <div
                          class="pt-5"
                          v-if="
                            (filterDeals.length === 0 && searcher.length > 0) ||
                            (filterDeals.length === 0 && isFilterEnded === true)
                          "
                        >
                          <div class="mb-6 mt-6 is-flex is-align-items-center">
                            <div class="mr-5">
                              <NoFile />
                            </div>
                            <div>
                              <h2 style="font-size: 1.4rem">
                                <b>You have no active Deals or Proposal.</b>
                              </h2>
                              <h2 class="mt-2" style="font-size: 1.4rem">
                                No deal fouded... try again
                              </h2>
                            </div>
                          </div>
                        </div>

                        <!-- END | NO DEALS MESSAGE 2 -->
                      </div>
                    </div>
                  </Transition>
                  <!-- Loader Dashboard -->
                  <Transition
                    enter-active-class="fadeIn"
                    leave-active-class="fadeOut"
                  >
                    <div v-if="loading">
                      <LoadingDashboard />
                    </div>
                  </Transition>
                  <!--END Loader Dashboard -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!account">
          <div class="container py-6 mt-6 is-flex is-align-items-center">
            <div>
              <h2 style="font-size: 1.8rem">
                <b>Reconnecting...</b>
              </h2>
              <h2 class="mt-2" style="font-size: 1.2rem">
                Maybe you have changed the network. <br />
                Check your wallet and confirm the switch network action.<br /><br />
                If you don't see the notification on your wallet, <br />
                please click on button below.
              </h2>
              <div class="btn-primary mt-5" @click="connect()">
                Connect Wallet
              </div>
            </div>
          </div>
        </div>
        <Footer v-if="!loading" />
        <!-- PLATFORM END -->
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
import LoadingDashboard from "@/components/dashboard/LoadingDashboard.vue";
import PendingDeal from "@/components/dashboard/PendingDeal.vue";
import Filters from "@/components/dashboard/Filters.vue";
import Footer from "@/components/Footer.vue";
import NoFile from "@/components/elements/NoFile.vue";
import Deal from "@/components/Deal.vue";
import checkViewport from "@/mixins/checkViewport";
import { io } from "socket.io-client";
const axios = require("axios");
const CONFIG = require("../config.json");
const ABI_POLYGON = require("../abi/abi-polygon.json");
const ABI_ETH = require("../abi/abi-eth.json");
export default {
  name: "Home",
  mixins: [checkViewport],
  components: {
    Navbar,
    LoadingDashboard,
    PendingDeal,
    Filters,
    Deal,
    Footer,
    NoFile,
  },
  data() {
    return {
      contract: "",
      selectedContract: localStorage.getItem("contract"),
      opensea: process.env.VUE_APP_OPENSEA,
      infuraId: process.env.VUE_APP_INFURA_ID,
      config: CONFIG,
      abi: ABI_POLYGON,
      network: 0,
      apiEndpoint: "",
      account: "",
      balance: 0,
      accountBalance: 0,
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
      referees: [],
      providerEndpoints: {},
      logs: "",
      dealUri: "",
      dealCollateral: "",
      dealProviders: "",
      dealValue: "",
      foundDeal: true,
      infuraURL: "https://ipfs.infura.io:5001/api/v0/add",
      currentNetwork: { icon: "fa-solid fa-user-secret", text: "Goerli" },
      appealsByUri: {},
      isUploadingIPFS: false,
      slashingMultiplier: 10,
      appealAddress: "",
      pendingTx: "",
      // FOR LAYOUT
      expertMode: false,
      navSpec: false,
      retries: 0,
      // FILTER
      filterDeals: [],
      isFilterEnded: false,
      showallDeals: false,
      searcher: "",
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
  mounted() {
    this.fetchingContract();
  },
  methods: {
    async fetchingContract() {
      const app = this;
      // Fetching data by contract selected
      console.log("CONTRACT Selected is:", app.selectedContract);
      if (app.selectedContract === "polygon") {
        app.contract = app.config[0].contract;
        app.network = app.config[0].network;
        app.apiEndpoint = app.config[0].api;
        app.abi = ABI_POLYGON;
        app.opensea = app.config[0].opensea;
      } else if (app.selectedContract === "goerli") {
        app.contract = app.config[1].contract;
        app.network = app.config[1].network;
        app.apiEndpoint = app.config[1].api;
        app.opensea = app.config[1].opensea;
        app.abi = ABI_ETH;
      } else if (app.selectedContract === null) {
        app.contract = app.config[0].contract;
        app.network = app.config[0].network;
        app.apiEndpoint = app.config[0].api;
        app.abi = ABI_POLYGON;
        app.opensea = app.config[0].opensea;
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

      try {
        const provider = await web3Modal.connect();
        app.web3 = await new Web3(provider);
      } catch (e) {
        console.log("PROVIDER_ERROR", e.message);
        window.location = "/#/";
      }
      const netId = await app.web3.eth.net.getId();
      console.log("Current network is:", netId);
      if (parseInt(netId) === parseInt(app.network)) {
        try {
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
          } else {
            window.location = "/";
          }
        } catch (e) {
          console.log("USER_CONNECT", e.message);
          window.location = "/#/";
        }
      } else {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0x" + Number(app.network).toString(16),
              },
            ],
          });
          setTimeout(function () {
            app.connect();
          }, 100);
        } catch (e) {
          // ADD POLYGON MAINNET IF NOT FOUND
          if (
            e.message ===
            'Unrecognized chain ID "0x89". Try adding the chain using wallet_addEthereumChain first.'
          ) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x" + Number(app.network).toString(16),
                    blockExplorerUrls: ["https://polygonscan.com/"],
                    chainName: "Polygon Mainnet",
                    nativeCurrency: {
                      decimals: 18,
                      name: "Polygon",
                      symbol: "MATIC",
                    },
                    rpcUrls: ["https://polygon-rpc.com"],
                  },
                ],
              });
              setTimeout(function () {
                app.connect();
              }, 100);
            } catch (e) {
              app.alertCustomWarning(
                "Can't add Polygon network, please do it manually."
              );
            }
          } else {
            app.alertCustomWarning(
              "Can't switch network, please do it manually."
            );
          }
        }
      }
    },
    async loadState() {
      const app = this;
      app.appealsByUri = {};
      app.deals = [];
      app.isWorking = false;
      app.loading = true;
      app.log("Reading state from blockchain..");
      const contract = new app.web3.eth.Contract(app.abi, app.contract);
      app.balance = await contract.methods.vault(app.account).call();
      app.balance = app.web3.utils.fromWei(app.balance);
      app.slashingMultiplier = parseInt(
        await contract.methods.slashing_multiplier().call()
      );

      // Checking proposal timeout
      let proposalTimeout = await contract.methods.proposal_timeout().call();
      app.proposalTimeout = proposalTimeout;
      console.log("Proposal Timeout", app.proposalTimeout);

      // Fetch Deals and parser
      try {
        app.isWorking = true;
        let deals = await axios.get(app.apiEndpoint + "/deals/" + app.account);
        app.isWorking = false;
        let keys = [];
        for (let k in deals.data) {
          let deal = await app.parseDeal(deals.data[k]);
          if (deal.proposal_tx !== undefined && deal.proposal_tx !== null) {
            app.txids.push(deal.proposal_tx);
          }
          if (keys.indexOf(deal.contract + ":" + deal.index) === -1) {
            keys.push(deal.contract + ":" + deal.index);
            // Getting active deals
            // if (
            //   parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 ||
            //   (parseInt(deal.timestamp_start) === 0 &&
            //     !deal.expired &&
            //     !deal.canceled)
            // ) {
            //   app.deals.push(deal);
            // }
            // console.log("Can deal appeal?", deal.canAppeal);
            app.deals.push(deal);
            app.filterActive();
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
        app.alertCustomError("2 h deals from blockchain, please retry!");
      }

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
              // app.connectSocket(providerDetails.endpoint);
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
              // app.connectSocket(refereeDetails.endpoint);
            }
          }
        } catch (e) {
          console.log(e);
          ended = true;
        }
        i++;
      }
    },
    async parseDeal(deal) {
      const app = this;
      deal.canAppeal = true;

      // Fix needed to be compatible to old contract
      if (deal.deal_uri === undefined) {
        deal.deal_uri = deal.data_uri;
      }
      if (deal.data_uri === undefined) {
        deal.data_uri = deal.deal_uri;
      }

      // TODO: Optimize contract
      const contract = new app.web3.eth.Contract(app.abi, app.contract);
      let proposalTimeout = await contract.methods.proposal_timeout().call();
      const appeal_index = await contract.methods
        .active_appeals(deal.deal_uri)
        .call();
      const round = await contract.methods.getRound(appeal_index).call();

      console.log(
        "deal " + deal.index + " with appeal index ",
        appeal_index + " have a round " + round
      );

      // Check STATUS ACTIVE Deal

      if (
        parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 ||
        (parseInt(deal.timestamp_start) === 0 &&
          !deal.expired &&
          !deal.canceled)
      ) {
        deal.status_active = true;
      } else {
        deal.status_active = false;
      }

      // Check Pending deal
      if (
        deal.timestamp_start !== undefined &&
        parseInt(deal.timestamp_start) === 0 &&
        !deal.canceled
      ) {
        deal.pending = true;
        deal.canAppeal = false;
        deal.status_active = true;
      } else {
        deal.pending = false;
      }

      //DEBUG
      if (deal.pending) {
        console.log("AFTER CHECK PENDING DEAL", deal.index);
        console.log("Result active?", deal.status_active);
      }

      // Check if deal ended
      if (
        (deal.timestamp_end * 1000 < new Date().getTime() &&
          deal.timestamp_start > 0) ||
        deal.canceled
      ) {
        deal.canAppeal = false;
        deal.status_active = false;
      }

      //debug
      if (deal.pending) {
        console.log("BEFORE CHECK EXPIRATION FUNCTION");
        console.log("Expiration of deal", deal.index, "is:", expires_at);
        console.log("is expired?", deal.expired);
        console.log("Result active?", deal.status_active);
      }

      // Set expiration timestamp
      const expires_at =
        (parseInt(deal.timestamp_request) + parseInt(proposalTimeout)) * 1000;

      // Check if expired
      if (new Date().getTime() > expires_at && deal.timestamp_start === 0) {
        deal.expired = true;
        deal.canAppeal = false;
      } else if (
        new Date().getTime() < expires_at &&
        deal.timestamp_start === 0
      ) {
        deal.expired = false;
        deal.status_active = false;
      }

      //debug
      if (deal.pending) {
        console.log("AFTER CHECK EXPIRATION FUNCTION");
        console.log("Expiration of deal", deal.index, "is:", expires_at);
        console.log("is expired?", deal.expired);
        console.log("Result active?", deal.status_active);
      }

      // Check if appeal ended
      if (
        deal.appeal !== undefined &&
        deal.appeal.round !== undefined &&
        parseInt(deal.appeal.round) < 99
      ) {
        deal.canAppeal = false;
      }

      if (deal.pending) {
        console.log("AFTER AFTER APPEL DEAL", deal.index);
        console.log("Result active?", deal.status_active);
      }

      // Check if appeal doesn't exists
      if (deal.appeal === undefined || Object.keys(deal.appeal) === 0) {
        deal.canAppeal = true;
      }

      // Check Contract Deal
      if (deal.contract !== contract) {
        deal.canAppeal = false;
      }
      return deal;
    },
    async searchPending() {
      const app = this;
      app.retries = 0;
      const pendingTx = localStorage.getItem("pendingTx");
      app.pendingTx = pendingTx;
      console.log("Stored pending tx:", pendingTx);
      app.foundDeal = false;
      if (pendingTx === null || pendingTx.length === 0) {
        app.foundDeal = true;
      }
      if (!app.foundDeal) {
        let deals = await axios.get(app.apiEndpoint + "/deals/" + app.account);
        for (let k in deals.data) {
          let deal = deals.data[k];
          if (
            deal.proposal_tx !== undefined &&
            deal.proposal_tx === pendingTx
          ) {
            app.foundDeal = true;
            // app.$toast.clear();
            if (app.txids.indexOf(deal.proposal_tx) === -1) {
              app.txids.push(deal.proposal_tx);
              app.deals.push(deal);
              // app.parseDeal(deals.data[k])
              app.loadState()
            }
          }
        }
        app.retries++;
        // Still not found
        if (!app.foundDeal) {
          if (app.retries < 10) {
            console.log("Pending tx not found, refreshing in 5 seconds..");
            setTimeout(function () {
              app.searchPending();
            }, 5000);
          } else {
            localStorage.removeItem("pendingTx");
          }
        } else {
          console.log("Pending tx found, removing from cache.");
          localStorage.removeItem("pendingTx");
          app.pendingTx = "";
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
            const gasPrice = await app.web3.eth.getGasPrice();
            await contract.methods
              .withdrawFromVault(balance)
              .send({
                from: app.account,
                gasPrice,
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
            app.alertCustomWarning("Withdraw done!");
            app.loadState();
          } else {
            app.isWorking = false;
            app.alertCustomWarning("You have nothing to withdraw");
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
    alertCustomWarning(message) {
      this.$buefy.dialog.alert({
        title: "Attention",
        message: message,
        type: "is-warning",
        hasIcon: true,
        icon: "circle-exclamation",
        iconPack: "fa",
        ariaRole: "alertdialog",
        ariaModal: true,
      });
    },
    // FILTERS
    async filterEnded() {
      const app = this;
      app.filterDeals = app.deals;
      app.filterDeals = app.filterDeals.filter((deal) => {
        return deal.status_active === false;
      });
      console.log("Ended Deals", app.filterDeals);
      app.isFilterEnded = true;
    },
    async filterActive() {
      const app = this;
      app.isFilterEnded = false;
      app.filterDeals = app.deals;
      app.filterDeals = app.filterDeals.filter((deal) => {
        return deal.status_active === true;
      });
      console.log("Active Deals", app.filterDeals);
    },
    async filterAll() {
      const app = this;
      app.isFilterEnded = false;
      app.filterDeals = app.deals;
      app.filterDeals = app.filterDeals.filter((deal) => {
        return deal.status_active === true || deal.status_active === false;
      });
      console.log("All Deals", app.filterDeals);
    },
    searchDealURI() {
      // filter deal by data_uri by v-model "searcher"
      console.log("Starting search...");
      const app = this;
      if (app.searcher.length > 0) {
        app.deals = app.deals.filter((deal) => {
          return deal.data_uri
            .toLowerCase()
            .includes(app.searcher.toLowerCase());
        });
        console.log("deal founded", app.deals);
      }
    },
    toggleSpec() {
      const app = this;
      app.navSpec = !app.navSpec;
      console.log("nav spec", app.navSpec);
    },
  },
};
</script>

<style></style>
