<template>
  <section class="hero" :class="{ 'no-scroll': isWorking }">
    <div v-if="account">
      <!-- Logs button show/hide -->
      <div
        v-if="expertMode"
        @click="logState = !logState"
        class="btn-sidebar position-bottom-right"
        :class="{ heartbeat: loading }"
      >
        <i class="fa-solid fa-terminal"></i>
      </div>
      <!-- END - Logs button show/hide -->

      <!-- NAVBAR SECTION -->
      <Navbar
        :account="account"
        :network="network"
        :accountBalance="accountBalance"
      />
      <!-- END | NAVBAR SECTION -->

      <!-- PLATFORM START -->
      <div class="bg-color-light py-5" :class="{ 'px-3': !isDesktop }">
        <div class="container">
          <div>
            <div v-if="!loading">
              <!-- Show all created deals -->
              <div v-if="!showCreate">
                <!-- TITLE -->
                <div class="b-bottom-colored-dark m-0 pb-3 mb-5">
                  <h2 class="title is-3 m-0">MANAGE DEALS</h2>
                </div>
                <!-- END TITLE -->

                <!-- ACTION BAR (button create deal - searchbar - filters) -->
                <div class="columns is-mobile is-multiline is-vcentered mb-5">
                  <div class="column is-full-mobile is-4-tablet is-5-desktop">
                    <a href="/#/create" class="btn-secondary">
                      <i class="fa-solid fa-file-medical mr-3"></i>create new
                      deal
                    </a>
                  </div>

                  <!-- SEARCH FUNCTION -->
                  <div class="column is-full-mobile is-4-tablet is-5-desktop">
                    <div class="field">
                      <p class="control has-icons-left has-icons-right">
                        <input
                          class="input is-info"
                          type="email"
                          placeholder=" Search Deal URI"
                          v-model="searcher"
                        />
                        <span class="icon is-small is-left">
                          <i class="fa-solid fa-magnifying-glass"></i>
                        </span>
                      </p>
                    </div>
                  </div>
                  <!-- END SEARCH FUNCTION -->

                  <!-- FILTER FUNCTIONS -->
                  <div
                    class="column is-full-mobile is-4-tablet is-2-desktop"
                    :class="{ 'has-text-right': !isMobile }"
                  >
                    <div class="custom_dropdown me-10-desktop">
                      <div
                        class="custom_dropdown__face"
                        @click="filtered = !filtered"
                      >
                        <div class="custom_dropdown__text">
                          <span class="small">FILTER</span>
                          <span v-if="activeDeal || endedDeal || showallDeals"
                            >:
                          </span>
                          <span v-if="activeDeal">Active</span>
                          <span v-if="endedDeal">Ended</span>
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
                                activeDeals()
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

                <!-- NEW SECTION DEALS -->
                <!--TODO: complete this section deals -->
                <div class="mb-5" v-if="deals.length > 0">
                  <div
                    class="columns is-mobile is-multiline is-vcentered"
                    v-if="!isMobile"
                  >
                    <div
                      class="column is-full-mobile is-4-tablet is-6-desktop is-6-widescreen is-6-fullhd"
                    >
                      <h5 class="title-table">DEAL NAME</h5>
                    </div>
                    <div
                      class="column is-full-mobile is-4-tablet is-4-desktop is-4-widescreen is-4-fullhd"
                    >
                      <h5 class="title-table ml-5">ACTIONS</h5>
                    </div>
                    <div
                      class="column is-full-mobile is-4-tablet is-2-desktop is-2-widescreen is-2-fullhd"
                    >
                      <h5 class="title-table ml-5">STATUS</h5>
                    </div>
                  </div>

                  <!-- SINGLE DEAL -->
                  <b-collapse
                    v-for="(deal, index) in filteredList"
                    :key="deal.index"
                    :id="'deal_' + deal.index"
                    :open="isOpen == deal.index"
                    @open="isOpen = deal.index"
                    class="card"
                    animation="slide"
                    :aria-id="'contentIdForA11y3' + deal.index"
                  >
                    <template #trigger="props">
                      <div
                        class="card-header"
                        role="button"
                        :aria-controls="'contentIdForA11y3' + deal.index"
                        :aria-expanded="props.open"
                      >
                        <p class="card-header-title">Deal: #{{ deal.index }}</p>
                        <div
                          class="is-flex is-align-items-center is-justify-content-center is-flex-wrap-wrap"
                        >
                          <b-button
                            class="btn-tertiary btn-active"
                            :disabled="
                              (deal.appeal.active === undefined &&
                                parseInt(deal.timestamp_start) > 0 &&
                                new Date().getTime() >
                                  parseInt(deal.timestamp_end * 1000)) ||
                              (deal.appeal.active !== undefined &&
                                parseInt(deal.appeal.round) !== 99 &&
                                new Date().getTime() >
                                  parseInt(deal.timestamp_end * 1000)) ||
                              parseInt(deal.timestamp_start * 1000) === 0
                            "
                          >
                            <i class="fa-solid fa-bell mr-3"></i>REQUEST APPEAL
                          </b-button>
                          <div class="divider ml-4 mr-4"></div>
                          <b-button
                            @click="
                              downloadFile(
                                providerEndpoints[deal.provider] +
                                  '/ipfs/' +
                                  deal.deal_uri.replace('ipfs://', '')
                              )
                            "
                            :disabled="
                              new Date().getTime() >
                                parseInt(deal.timestamp_end * 1000) ||
                              parseInt(deal.timestamp_start * 1000) === 0
                            "
                            class="btn-icon"
                          >
                            <i class="fa-solid fa-download"></i>
                          </b-button>
                          <div class="divider ml-4 mr-4"></div>
                          <a
                            :href="opensea + '/' + contract + '/' + deal.index"
                            target="_blank"
                            :disabled="
                              parseInt(deal.timestamp_start * 1000) === 0
                            "
                          >
                            <b-button
                              :disabled="
                                parseInt(deal.timestamp_start * 1000) === 0
                              "
                              class="btn-icon"
                            >
                              <i class="fa-solid fa-file-lines"></i>
                            </b-button>
                          </a>
                          <div class="divider ml-4 mr-4"></div>
                          <a
                            :href="'#deal_' + deal.index"
                            class="btn-icon"
                            @click="refreshDeal(index)"
                          >
                            <i class="fa-solid fa-arrow-rotate-right"></i>
                          </a>
                          <div class="divider ml-4 mr-4"></div>
                          <!-- BADGES -->
                          <div
                            v-if="
                              parseInt(deal.timestamp_end) -
                                new Date().getTime() / 1000 >
                              0
                            "
                            class="badge badge-success"
                          >
                            <span>Active</span>
                          </div>
                          <div
                            v-if="
                              parseInt(deal.timestamp_end) -
                                new Date().getTime() / 1000 <
                                0 &&
                              !deal.canceled &&
                              deal.timestamp_start > 0
                            "
                            class="badge badge-ended"
                          >
                            <span>Ended</span>
                          </div>
                          <div v-if="deal.canceled" class="badge badge-ended">
                            <span>Canceled</span>
                          </div>
                          <div
                            v-if="
                              deal.timestamp_start !== undefined &&
                              parseInt(deal.timestamp_start) === 0
                            "
                            class="badge badge-pending"
                          >
                            <span>Pending</span>
                          </div>
                          <div
                            v-if="
                              deal.appeal.round !== undefined &&
                              parseInt(deal.appeal.round) < 99
                            "
                            class="badge badge-slashed"
                          >
                            <span>Slahed</span>
                          </div>
                          <!-- END BADGES -->
                          <div class="divider ml-3 mr-3"></div>
                          <a class="card-header-icon mr-3">
                            <i
                              v-if="!props.open"
                              class="fa-solid fa-chevron-right"
                            ></i>
                            <i
                              v-if="props.open"
                              class="fa-solid fa-chevron-down"
                            ></i>
                          </a>
                        </div>
                      </div>
                    </template>

                    <div class="card-content">
                      <div class="content">
                        <div class="columns">
                          <div class="column is-half">
                            <div>
                              <div
                                class="b-top-colored-grey b-bottom-colored-grey pt-3 pb-3"
                              >
                                <p>
                                  <b>Deal URI: </b>
                                  <span style="font-size: 11px">{{
                                    deal.deal_uri
                                  }}</span>
                                </p>
                              </div>
                              <div class="b-bottom-colored-grey pb-3 pt-3 ">
                                <p><b>Value:</b> {{ deal.value }}</p>
                              </div>
                              <div class="b-bottom-colored-grey pt-3 pb-3">
                                <p><b>Collateral:</b> {{ deal.collateral }}</p>
                              </div>
                              <div class="b-bottom-colored-grey pt-3 pb-3">
                                <p><b>Canceled:</b> {{ deal.canceled }}</p>
                              </div>
                              <div class="b-bottom-colored-grey pb-3 pt-3">
                                <p>
                                  <b>Provider:</b>
                                  <span v-if="deal.provider !== 'NOT_ACCEPTED'">
                                    {{ deal.provider }}</span
                                  >
                                  <span v-if="deal.provider === 'NOT_ACCEPTED'">
                                    Pending Approval</span
                                  >
                                </p>
                              </div>
                              <div class="b-bottom-colored-grey pb-3 pt-3">
                                <p>
                                  <b>Timestamp request:</b>
                                  {{ returnDate(deal.timestamp_request) }}
                                </p>
                              </div>
                              <div
                                class="b-bottom-colored-grey pb-3 pt-3"
                                v-if="parseInt(deal.timestamp_start) !== 0"
                              >
                                <p>
                                  <b>Timestamp start:</b>
                                  {{ returnDate(deal.timestamp_start) }}<br />
                                </p>
                              </div>
                              <div class="b-bottom-colored-grey pb-3 pt-3">
                                <p>
                                  <b>Timestamp end:</b>
                                  {{ returnDate(deal.timestamp_end) }}<br />
                                </p>
                              </div>
                              <div
                                v-if="
                                  parseInt(deal.timestamp_end) -
                                    new Date().getTime() / 1000 >
                                  0
                                "
                                class="b-bottom-colored-grey pb-3 pt-3"
                              >
                                <p>
                                  <b>Time remaining:</b>
                                  {{
                                    parseInt(deal.timestamp_end) -
                                    new Date().getTime() / 1000
                                  }}<br />
                                </p>
                              </div>
                              <div
                                v-if="
                                  parseInt(deal.timestamp_end) -
                                    new Date().getTime() / 1000 <
                                    0 && parseInt(deal.timestamp_start) !== 0
                                "
                                class="b-bottom-colored-grey pb-3 pt-3"
                              >
                                <p><b>Time remaining:</b> deal ended</p>
                              </div>

                              <div v-if="!isWorking">
                                <a
                                  href="#"
                                  v-if="
                                    deal.active === true &&
                                    parseInt(deal.timestamp_start) === 0
                                  "
                                  @click="cancelDealProposal(deal.index)"
                                  >🗑️ cancel deal proposal</a
                                >
                                <a
                                  href="#"
                                  v-if="
                                    deal.appeal.round !== undefined &&
                                    parseInt(deal.appeal.round) < 99
                                  "
                                  >⌛ Processing round {{ deal.appeal.round }},
                                  slashes are {{ deal.appeal.slashes }}.</a
                                >
                              </div>
                            </div>
                          </div>
                          <div class="column is-half">
                            <div v-if="deal.deal_uri" class="box-img">
                              <img
                                :src="
                                  providerEndpoints[deal.provider] +
                                  '/ipfs/' +
                                  deal.deal_uri.replace('ipfs://', '')
                                "
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </b-collapse>
                  <!-- END | SINGLE DEAL -->
                </div>

                <!-- NO DEALS -->
                <h5 v-if="deals.length === 0" class="mt-2 has-text-centered">
                  You have no active Deals or Proposal. Create a new one or view
                  the history of Deals you have created.
                </h5>
                <!-- END | NO DEALS -->

                <!-- END | NEW SECTION DEALS -->
              </div>
              <!-- END - Show all created deals -->
            </div>

            <div v-if="loading">
              Loading informations from blockchain, please wait..
            </div>
          </div>

          <!-- Application Logs -->
          <Transition
            enter-active-class="slide-in-right"
            leave-active-class="slide-out-right"
          >
            <div
              v-if="logState && expertMode"
              class="right-col"
              v-html="logs"
            ></div>
          </Transition>
          <!-- END - Application Logs -->

          <!-- Modal Payment in gwei -->
          <b-modal
            v-model="infoWei"
            has-modal-card
            trap-focus
            :destroy-on-hide="false"
            aria-role="dialog"
            aria-label="Payment in gwei"
            close-button-aria-label="Close"
            aria-modal
          >
            <template>
              <div class="modal-card" style="width: auto">
                <header class="modal-card-head">
                  <p class="modal-card-title">Payment in wei</p>
                </header>
                <section class="modal-card-body">
                  <p>Payment is the amount of tokens paid to the provider</p>
                </section>
                <footer class="modal-card-foot">
                  <b-button
                    class="button is-rounded is-dark"
                    label="Close"
                    @click="infoWei = !infoWei"
                  />
                </footer>
              </div>
            </template>
          </b-modal>
          <!-- END Modal Modal Payment in gwei -->

          <!-- Modal Collateral in gwei -->
          <b-modal
            v-model="infoCollateral"
            has-modal-card
            trap-focus
            :destroy-on-hide="false"
            aria-role="dialog"
            aria-label="Collateral in gwei"
            close-button-aria-label="Close"
            aria-modal
          >
            <template>
              <div class="modal-card" style="width: auto">
                <header class="modal-card-head">
                  <p class="modal-card-title">Collateral in gwei</p>
                </header>
                <section class="modal-card-body">
                  <p>
                    Collateral is locked down from the provider account. Remeber
                    that collateral needs to be ≥ Payment and ≤ 1000*Payment
                  </p>
                </section>
                <footer class="modal-card-foot">
                  <b-button
                    class="button is-rounded is-dark"
                    label="Close"
                    @click="infoCollateral = !infoCollateral"
                  />
                </footer>
              </div>
            </template>
          </b-modal>
          <!-- END Modal Modal Collateral in gwei -->
        </div>
      </div>
      <!-- PLATFORM END -->
    </div>

    <!-- Connect Wallet container -->
    <div v-if="!account" class="connect-container">
      <div class="logo">
        <img src="../assets/img/logo.svg" alt="" />
      </div>
      <h2 class="pay-off tertiary-light-text">Retrieval Pinning</h2>
      <div class="has-text-centered mt-5">
        <p class="mb-0">Please connect your wallet first</p>
        <div class="btn-primary mt-4" @click="connect()">
          <i class="fa-solid fa-wallet mr-3"></i> Connect Wallet
        </div>
      </div>
    </div>

    <!-- END | Connect Wallet container -->

    <!-- Working Messages -->
    <div
      class="workingMessage is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center is-justify-content-center"
      v-if="isWorking"
    >
      <i class="fas fa-spinner fa-pulse mr-5"></i>
      <p class="text-center">{{ workingMessage }}</p>
    </div>
    <!-- END Working Messages -->
  </section>
</template>
<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Navbar from "@/components/Navbar.vue";

import checkViewport from "@/mixins/checkViewport";
import { io } from "socket.io-client";
const axios = require("axios");
const ABI = require("../abi.json");

export default {
  name: "Home",
  mixins: [checkViewport],
  components: {
    Navbar,
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
      deals: [],
      providers: [],
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
      fileToUpload: {},
      isUploadingIPFS: false,
      slashingMultiplier: 10,
      appealAddress: "",
      // REFRESH SINGLE DEAL
      selectedDeal: {},

      // FOR LAYOUT
      logState: false,
      infoWei: false,
      infoCollateral: false,
      expertMode: false,
      // FILTER
      changeNetwork: false,
      filtered: false,
      activeDeal: true,
      endedDeal: false,
      showallDeals: false,
      isOpen: 0,
      searcher: "",
      searchTimeout: null,
      // JUST FOR TEST
      hardcodedPrice: 5,
      checkboxGroup: ["Flint"],
    };
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
    async loadState() {
      const app = this;
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
      try {
        app.isWorking = true;
        app.workingMessage = "Fetching your deals, please wait...";
        let deals = await axios.get(
          process.env.VUE_APP_API_URL + "/deals/" + app.account
        );
        app.isWorking = false;
        let keys = [];
        for (let k in deals.data) {
          let deal = deals.data[k];
          if (keys.indexOf(parseInt(deal.index)) === -1) {
            keys.push(parseInt(deal.index));
            app.deals.push(deal);
          }
        }
        app.log("Found " + app.deals.length + " deals.");
        console.log(app.deals);
        this.activeDeals();
      } catch (e) {
        alert("Can't fetch deals from blockchain, please retry!");
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
      while (!ended) {
        try {
          const provider = await contract.methods.active_providers(i).call();
          if (app.providers.indexOf(provider) === -1) {
            app.log("Found provider " + provider);
            let providerDetails = await contract.methods
              .providers(provider)
              .call();
            providerDetails.address = provider;
            if (
              providerDetails.endpoint.indexOf("localhost") === -1 &&
              providerDetails.endpoint.indexOf("https") !== -1
            ) {
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
            app.log("Found referee " + referee);
            const refereeDetails = await contract.methods
              .referees(referee)
              .call();
            app.connectSocket(refereeDetails.endpoint);
          }
        } catch (e) {
          console.log(e);
          ended = true;
        }
        i++;
      }
      app.log("Found " + app.providers.length + " active providers");
    },
    async cancelDealProposal(index) {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Please confirm action with metamask..";
        try {
          const contract = new app.web3.eth.Contract(app.abi, app.contract);
          await contract.methods
            .cancelDealProposal(index)
            .send({
              from: app.account,
            })
            .on("transactionHash", (tx) => {
              app.workingMessage = "Found pending transaction at " + tx;
              app.log(app.workingMessage);
            });
          alert("Deal proposal canceled!");
          app.loadState();
        } catch (e) {
          app.isWorking = false;
          alert(e.message);
        }
      }
    },
    async createAppeal(index) {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Please confirm action with metamask..";
        try {
          const contract = new app.web3.eth.Contract(app.abi, app.contract);
          const fee = await contract.methods.returnAppealFee(index).call();
          app.log("Fee needed for appeal is: " + fee);
          await contract.methods
            .createAppeal(index)
            .send({
              value: fee,
              from: app.account,
            })
            .on("transactionHash", (tx) => {
              app.workingMessage = "Found pending transaction at " + tx;
              this.$toast.warning("Found pending transaction at:" + tx, {
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
                icon: "fa-solid fa-arrow-right-arrow-left",
                rtl: false,
              });
              app.log(app.workingMessage);
            });
          this.$toast("Appeal created!", {
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
          app.loadState();
        } catch (e) {
          app.isWorking = false;
          alert(e.message);
        }
      }
    },
    async withdraw() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Please confirm action with metamask..";
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
                app.workingMessage = "Found pending transaction at " + tx;
                app.log(app.workingMessage);
              });
            alert("Withdraw done!");
            app.loadState();
          }
        } catch (e) {
          app.isWorking = false;
          alert(e.message);
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
            app.showToast("Your deal proposal was accepted by provider!");
            app.log("Your deal proposal was accepted by provider!");
          } else if (
            action !== undefined &&
            action === "SLASHED" &&
            realMessage.owner.toLowerCase() === app.account.toLowerCase()
          ) {
            // TODO: Read deal_index from contract
            app.showToast("A provider was slashed!");
            app.log("A provider was slashed!");
          } else if (
            action !== undefined &&
            action === "UNRETRIEVALABLE" &&
            realMessage.owner.toLowerCase() === app.account.toLowerCase()
          ) {
            // TODO: Read deal_index from contract
            app.showErrorToast(
              "File is unretrievalable! Provider can't accept your deal proposal"
            );
            app.log(
              "File is unretrievalable! Provider can't accept your deal proposal"
            );
          }
        }
      } catch (e) {
        console.log("Error parsing message from socket");
        console.log(e);
      }
    },
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
    async refreshDeal(index) {
      const app = this;
      console.log("Refreshing deal", app.deals[index]);
      if (!app.isWorking) {
        app.isWorking = true;
        app.log("Updating deal please wait..");
        app.workingMessage = "Updating deal please wait..";
        try {
          let refreshed = await axios.get(
            process.env.VUE_APP_API_URL + "/parse/" + app.deals[index].index
          );
          console.log("refreshed", refreshed.data);
          app.deals[index] = refreshed.data;
          app.workingMessage = "";
        } catch (e) {
          app.isWorking = false;
          app.workingMessage = "";
          alert(e.message);
        }
        app.isWorking = false;
        app.workingMessage = "";
      }
    },
    async expiredDeals() {
      const app = this;
      app.log("Checking expired deals...");
      console.log("Checking expired deals...");
      if (!app.isWorking) {
        app.isWorking = true;
        app.deals = [];
        try {
          let deals = await axios.get(
            process.env.VUE_APP_API_URL + "/deals/" + app.account
          );
          app.isWorking = false;
          let keys = [];
          for (let k in deals.data) {
            let deal = deals.data[k];
            if (keys.indexOf(parseInt(deal.index)) === -1) {
              if (
                parseInt(deal.timestamp_end) - new Date().getTime() / 1000 <
                  0 &&
                parseInt(deal.timestamp_start) > 0
              ) {
                keys.push(parseInt(deal.index));
                app.deals.push(deal);
              }
            }
          }
          console.log(app.deals);
        } catch (e) {
          alert("Can't fetch deals from blockchain, please retry!");
        }
      }
    },
    async activeDeals() {
      const app = this;
      console.log("Checking active deals...");
      app.log("Checking active deals...");
      if (!app.isWorking) {
        app.isWorking = true;
        app.deals = [];
        try {
          let deals = await axios.get(
            process.env.VUE_APP_API_URL + "/deals/" + app.account
          );
          app.isWorking = false;
          let keys = [];
          for (let k in deals.data) {
            let deal = deals.data[k];
            if (keys.indexOf(parseInt(deal.index)) === -1) {
              if (
                parseInt(deal.timestamp_end) - new Date().getTime() / 1000 >
                  0 ||
                parseInt(deal.timestamp_start) === 0
              ) {
                keys.push(parseInt(deal.index));
                app.deals.push(deal);
              }
            }
          }
          console.log(app.deals);
        } catch (e) {
          alert("Can't fetch deals from blockchain, please retry!");
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
          app.deals = deals.data;
          app.isWorking = false;
          console.log("All Deals", app.deals);
        } catch (e) {
          alert("Can't fetch deals from blockchain, please retry!");
        }
      }
    },
    async downloadFile(uri) {
      const app = this;
      app.isWorking = true;
      app.workingMessage = "Try to download your file. Please Wait...";
      console.log("try download start");
      try {
        console.log("Downloading file from:", uri);
        const downloaded = await axios.get(uri);
        console.log(downloaded);
        window.open(uri, "_blank");
        app.isWorking = false;
        app.workingMessage = "";
      } catch (e) {
        console.log("RETRIEVE_ERROR", e);
        alert("Can't retrieve file!");
        app.isWorking = false;
        app.workingMessage = "";
      }
    },
    returnDate(s) {
      const date = new Date(s * 1000).toUTCString();
      return date.split("GMT")[0].trim();
    },
  },
  computed: {
    filteredList() {
      return this.deals.filter((deal) => {
        if (this.searcher.length > 0) {
          return (
            deal.deal_uri !== undefined &&
            deal.deal_uri.toLowerCase().includes(this.searcher.toLowerCase())
          );
        } else {
          return deal;
        }
      });
    },
  },
  mounted() {
    this.connect();
  },
};
</script>

<style>
/* .btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  color: #050505;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  background-color: transparent;
  border: 1px solid #050505;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn:hover {
  background-color: #050505;
  color: #ffffff;
}

input {
  font-size: 1.5rem;
  border-radius: 5px;
  margin: 5px 0;
}

input:focus {
  outline: rgba(0, 0, 0, 0.5) solid 2px;
  -moz-box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.8);
  -webkit-box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.8);
}

.m-top-1 {
  margin-top: 1em;
}

.mint-wrapper {
  padding: 30px;
  text-align: center;
}

p {
  margin: 0;
}

p.small {
  font-size: 0.9rem;
  font-style: italic;
  color: #7d7d7d;
} */
</style>
