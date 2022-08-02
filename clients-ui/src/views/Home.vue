<template>
  <div>
    <!-- MOBILE BLOCKER DAPP -->
    <div v-if="isMobile" class="mobile-blocker">
      <div class="logo mb-3">
        <img src="../assets/img/logo.svg" alt="" />
      </div>
      <h2 class="pay-off tertiary-light-text">Retrieval Pinning</h2>
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
          @withdraw="withdraw()"
          @closeSpec="closeSpec()"
        />
        <!-- END | NAVBAR SECTION -->

        <!-- PLATFORM START -->
        <div class="bg-color-light py-5" :class="{ 'px-3': !isDesktop }">
          <div class="container">
            <div>
              <div v-if="!loading">
                <!-- Show all created deals -->
                <div>
                  <!-- TITLE -->
                  <div class="b-bottom-colored-dark m-0 pb-3 mb-6">
                    <h2 class="title is-3 m-0">MANAGE DEALS</h2>
                  </div>
                  <!-- END TITLE -->

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
                      class="column is-4-mobile is-4-tablet is-2-desktop"
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

                  <!-- NEW SECTION DEALS -->
                  <div class="mb-5" v-if="deals.length > 0">
                    <!-- TITLES TABLE -->
                    <div
                      class="columns is-mobile is-multiline is-vcentered hide"
                      v-if="!isMobile"
                    >
                      <div
                        class="column is-4-mobile is-2-tablet is-5-desktop is-6-widescreen is-6-fullhd"
                      >
                        <h5 class="title-table ml-5">DEAL NAME</h5>
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

                    <div
                      class="custom-card"
                      v-for="(deal, index) in filteredList"
                      :key="deal.index"
                      :class="{ 'custom-card-hover': index !== isOpening }"
                    >
                      <div class="card-header">
                        <h4
                          class="card-header-title"
                          @click="openDeal(index)"
                          style="cursor: pointer"
                        >
                          Deal ID: #{{ deal.index }}
                        </h4>

                        <div
                          class="is-flex is-align-items-center is-justify-content-center is-flex-wrap-wrap"
                        >
                          <b-button
                            @click="createAppeal(deal)"
                            class="btn-tertiary btn-active"
                            :disabled="
                              !deal.canAppeal ||
                              downloads[deal.deal_uri] === true
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
                            :class="{
                              'no-pointer':
                                parseInt(deal.timestamp_start * 1000) === 0,
                            }"
                            :href="opensea + '/' + contract + '/' + deal.index"
                            target="_blank"
                          >
                            <b-button
                              :disabled="
                                parseInt(deal.timestamp_start * 1000) === 0
                              "
                              class="btn-icon"
                            >
                              <i class="fa-solid fa-file-contract"></i>
                            </b-button>
                          </a>
                          <div class="divider ml-4 mr-4"></div>
                          <a class="btn-icon" @click="refreshDeal(index)">
                            <i class="fa-solid fa-arrow-rotate-right"></i>
                          </a>
                          <div class="divider ml-4 mr-4"></div>
                          <!-- BADGES -->
                          <div
                            v-if="
                              (parseInt(deal.timestamp_end) -
                                new Date().getTime() / 1000 >
                                0 &&
                                deal.appeal.round === undefined) ||
                              (parseInt(deal.timestamp_end) -
                                new Date().getTime() / 1000 >
                                0 &&
                                deal.appeal.round !== undefined &&
                                deal.appeal.round === 99 &&
                                deal.appeal.slashed !== undefined &&
                                deal.appeal.slashed === false)
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
                              parseInt(deal.timestamp_start) === 0 &&
                              !deal.expired
                            "
                            class="badge badge-pending"
                          >
                            <span>Pending</span>
                          </div>
                          <div
                            v-if="
                              deal.appeal.round !== undefined &&
                              parseInt(deal.appeal.round) < 99 &&
                              parseInt(deal.timestamp_end) -
                                new Date().getTime() / 1000 >
                                0
                            "
                            class="badge badge-requested"
                          >
                            <span>Appeal</span>
                          </div>
                          <div
                            v-if="
                              deal.appeal.round !== undefined &&
                              deal.slashed !== undefined &&
                              deal.slashed === true
                            "
                            class="badge badge-slashed"
                          >
                            <span>Slashed</span>
                          </div>
                          <div
                            v-if="
                              deal.timestamp_start !== undefined &&
                              parseInt(deal.timestamp_start) === 0 &&
                              deal.expired
                            "
                            class="badge badge-expired"
                          >
                            <span>Expired</span>
                          </div>
                          <!-- END BADGES -->
                          <div class="divider ml-3 mr-3"></div>
                          <div
                            @click="openDeal(index)"
                            class="card-header-icon mr-3 p-3"
                            style="width: 35px"
                          >
                            <i
                              v-if="index !== isOpening"
                              class="fa-solid fa-chevron-right"
                            ></i>
                            <i
                              v-if="index === isOpening"
                              class="fa-solid fa-chevron-down"
                            ></i>
                          </div>
                        </div>
                      </div>
                      <!-- DEAL SPECIFICATIONS -->
                      <Transition
                        name="custom-fade"
                        enter-active-class="fade-in-top"
                        leave-active-class="fade-out-top"
                      >
                        <div class="" v-show="index === isOpening">
                          <div class="card-content">
                            <div class="content">
                              <div class="columns is-mobile">
                                <div
                                  class="column is-three-quarter-tablet is-half-desktop"
                                >
                                  <div>
                                    <div
                                      class="b-top-colored-grey b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Deal URI: </b>
                                        <a
                                          style="word-wrap: break-word"
                                          class="link-primary"
                                          :href="
                                            providerEndpoints[deal.provider] +
                                            '/ipfs/' +
                                            deal.deal_uri.replace('ipfs://', '')
                                          "
                                          >{{ deal.deal_uri }}</a
                                        >
                                      </p>
                                    </div>
                                    <div
                                      class="is-flex is-justify-content-space-between is-align-items-center b-bottom-colored-grey"
                                      :class="{
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <div style="width: 100%">
                                        <p><b>Value:</b> {{ deal.value }}</p>
                                      </div>
                                      <div class="divider"></div>
                                      <div
                                        class="has-text-right"
                                        style="width: 100%"
                                      >
                                        <p>
                                          <b>Collateral:</b>
                                          {{ deal.collateral }}
                                        </p>
                                      </div>
                                    </div>
                                    <div
                                      class="b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Canceled:</b> {{ deal.canceled }}
                                      </p>
                                    </div>
                                    <div
                                      class="b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Provider:</b>
                                        <span
                                          v-if="
                                            deal.provider !== 'NOT_ACCEPTED'
                                          "
                                        >
                                          {{ deal.provider }}</span
                                        >
                                        <span
                                          v-if="
                                            deal.provider === 'NOT_ACCEPTED'
                                          "
                                        >
                                          Pending Approval</span
                                        >
                                      </p>
                                    </div>
                                    <div
                                      class="b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Timestamp request:</b>
                                        {{ returnDate(deal.timestamp_request) }}
                                      </p>
                                    </div>
                                    <div
                                      class="b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                      v-if="
                                        parseInt(deal.timestamp_start) !== 0
                                      "
                                    >
                                      <p>
                                        <b>Timestamp start:</b>
                                        {{ returnDate(deal.timestamp_start)
                                        }}<br />
                                      </p>
                                    </div>
                                    <div
                                      v-if="
                                        parseInt(deal.timestamp_end) -
                                          new Date().getTime() / 1000 >
                                        0
                                      "
                                      class="b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Timestamp end:</b>
                                        {{ returnDate(deal.timestamp_end)
                                        }}<br />
                                      </p>
                                    </div>
                                    <div
                                      v-if="
                                        parseInt(deal.timestamp_end) -
                                          new Date().getTime() / 1000 >
                                        0
                                      "
                                      class="b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Time remaining:</b>
                                        {{
                                          secondsToDhms(
                                            parseInt(deal.timestamp_end) -
                                              new Date().getTime() / 1000
                                          )
                                        }}<br />
                                      </p>
                                    </div>
                                    <div
                                      v-if="
                                        parseInt(deal.timestamp_end) -
                                          new Date().getTime() / 1000 <
                                          0 &&
                                        parseInt(deal.timestamp_start) !== 0
                                      "
                                      class="b-bottom-colored-grey"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
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
                                    </div>
                                  </div>
                                </div>
                                <div
                                  class="column is-one-quarter-tablet is-half-desktop"
                                >
                                  <div
                                    v-if="!downloads[deal.deal_uri]"
                                    class="box-img"
                                    style="
                                      background-image: url(../assets/img/no-avail.png);
                                    "
                                  ></div>
                                  <div
                                    v-if="downloads[deal.deal_uri]"
                                    class="box-img"
                                  >
                                    <img
                                      :src="
                                        providerEndpoints[deal.provider] +
                                        '/ipfs/' +
                                        deal.deal_uri.replace('ipfs://', '')
                                      "
                                    />
                                  </div>

                                  <div
                                    class="pl-3 mt-5"
                                    v-if="
                                      deal.appeal.round !== undefined &&
                                      parseInt(deal.appeal.round) < 99
                                    "
                                  >
                                    <div
                                      class="container-appeal b-bottom-colored-grey bg-pink-dark px-2"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p><b>Appeal Stautus</b></p>
                                    </div>
                                    <div
                                      class="b-bottom-colored-grey bg-pink-light px-2"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Round: </b>
                                        {{ deal.appeal.round }}/12
                                        <i
                                          class="fa-solid fa-hourglass-half fa-fade ml-2"
                                        ></i>
                                      </p>
                                    </div>
                                    <div
                                      class="b-bottom-colored-grey bg-pink-light px-2"
                                      :class="{
                                        'pb-3 pt-3': isDesktop,
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <p>
                                        <b>Slashes: </b>
                                        {{ deal.appeal.slashes }}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                      <!-- END DEAL SPECIFICATIONS -->
                    </div>
                  </div>

                  <!-- NO DEALS -->
                  <p v-if="deals.length === 0" class="mt-6">
                    You have no active Deals or Proposal. Create a new one or
                    view the history of Deals you have created.
                  </p>
                  <!-- END | NO DEALS -->
                </div>
                <!-- END - Show all created deals -->
              </div>

              <div v-if="loading">
                Loading informations from blockchain, please wait..
              </div>
            </div>
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
  </div>
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
      proposalTimeout: 0,
      downloads: {},
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
      expertMode: false,
      isOpening: -1,
      navSpec: false,
      // FILTER
      changeNetwork: false,
      filtered: false,
      activeDeal: true,
      endedDeal: false,
      showallDeals: false,
      searcher: "",
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

      // Checking proposal timeout
      let proposalTimeout = await contract.methods.proposal_timeout().call();
      app.proposalTimeout = proposalTimeout;
      console.log("Proposal Timeout", app.proposalTimeout);

      try {
        app.isWorking = true;
        app.workingMessage = "Fetching your deals, please wait...";
        let deals = await axios.get(
          process.env.VUE_APP_API_URL + "/deals/" + app.account
        );
        app.isWorking = false;
        let keys = [];
        let appealsByUri = {};
        for (let k in deals.data) {
          let deal = deals.data[k];
          if (keys.indexOf(parseInt(deal.index)) === -1) {
            keys.push(parseInt(deal.index));
            app.downloads[deal.deal_uri] = false;
            // Check if deal can appeal or not
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
            // Set expiration timestamp
            const expires_at =
              (parseInt(deal.timestamp_request) +
                parseInt(app.proposalTimeout)) *
              1000;
            // Check if expired
            if (new Date().getTime() > expires_at) {
              deal.expired = true;
            } else {
              deal.expired = false;
            }
            // Getting active deals
            if (
              parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 ||
              (parseInt(deal.timestamp_start) === 0 && !deal.expired)
            ) {
              keys.push(parseInt(deal.index));
              app.deals.push(deal);
            }
            console.log("Can deal appeal?", deal.canAppeal);
          }
        }
        app.$forceUpdate();
        // app.log("Found #" + app.deals.length + " deals.");
        // console.log("deals", app.deals);

        // app.activeDeals();
      } catch (e) {
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
          app.alertCustomError("Deal proposal canceled!");
          app.loadState();
        } catch (e) {
          app.isWorking = false;
          app.alertCustomError(e.message);
        }
      }
    },

    async createAppeal(deal) {
      const app = this;
      const index = deal.index;
      console.log("Try create appeal of", index);
      const contract = new app.web3.eth.Contract(app.abi, app.contract);
      const max_appeals = await contract.methods.max_appeals().call();
      const n_appeals = await contract.methods.tot_appeals(index).call();
      console.log("Max appeal is;", parseInt(max_appeals));
      console.log("n appeals is:", parseInt(n_appeals));
      if (!app.isWorking && parseInt(n_appeals) < parseInt(max_appeals)) {
        app.isWorking = true;
        app.workingMessage = "Creating Appeal...";
        const active_appeal = await contract.methods
          .active_appeals(deal.deal_uri)
          .call();
        const round = await contract.methods.getRound(active_appeal).call();
        console.log("active appeal is:", active_appeal);
        console.log("round is:", round);
        if (parseInt(round) === 99 || parseInt(round) === 0) {
          app.workingMessage = "Please confirm action with metamask..";
          try {
            const fee = await contract.methods.returnAppealFee(index).call();
            app.log("Fee needed for appeal is: " + fee);
            await contract.methods
              .createAppeal(index)
              .send({
                value: fee,
                from: app.account,
              })
              .on("transactionHash", (tx) => {
                app.workingMessage =
                  "Found pending transaction at " +
                  tx.substr(0, 4) +
                  "..." +
                  tx.substr(-4);
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
            app.isWorking = false;
            app.workingMessage = "";
            app.loadState();
          } catch (e) {
            app.isWorking = false;
            app.workingMessage = "";
            app.alertCustomError(e.message);
          }
        } else {
          app.isWorking = false;
          app.workingMessage = "";
          app.alertCustomError(
            "You can't create appeal, there's an active appeal for this URI yet."
          );
        }
      } else {
        app.isWorking = false;
        app.workingMessage = "";
        app.alertCustomError(
          "You can't create appeal, max appeal for this file is reached"
        );
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

    async refreshDeal(index) {
      const app = this;
      console.log("Refreshing deal", app.deals[index]);
      if (!app.isWorking) {
        try {
          let refreshed = await axios.get(
            process.env.VUE_APP_API_URL + "/parse/" + app.deals[index].index
          );
          console.log("refreshed", refreshed.data);
          app.deals[index] = refreshed.data;
          this.$buefy.toast.open({
            duration: 5000,
            message:
              `Deal ID #` + app.deals[index].index + ` information refreshed`,
            position: "is-bottom-right",
            type: "is-warning",
          });
          app.$forceUpdate();
        } catch (e) {
          app.alertCustomError(e.message);
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
        app.alertCustomError("Can't retrieve file!");
        app.isWorking = false;
        app.workingMessage = "";
      }
    },

    secondsToDhms(seconds) {
      seconds = Number(seconds);
      var d = Math.floor(seconds / (3600 * 24));
      var h = Math.floor((seconds % (3600 * 24)) / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = Math.floor(seconds % 60);

      var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      return dDisplay + hDisplay + mDisplay + sDisplay;
    },

    returnDate(s) {
      const date = new Date(s * 1000).toUTCString();
      return date.split("GMT")[0].trim();
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
            if (deal.timestamp_end * 1000 < new Date().getTime()) {
              deal.canAppeal = false;
              deal.dealisEnded = true;
            } else {
              deal.dealisEnded = false;
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
              if (deal.dealisEnded === true || (deal.dealisEnded === true && deal.expired === true)) {
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
    async openDeal(index) {
      const app = this;
      if (app.isOpening === index) {
        app.isOpening = -1;
      } else {
        console.log("Opening deal", app.deals[index]);
        const uri =
          app.providerEndpoints[app.deals[index].provider] +
          "/ipfs/" +
          app.deals[index].deal_uri.replace("ipfs://", "");
        try {
          console.log("Downloading file from:", uri);
          const downloaded = await axios.get(uri);
          if (downloaded.data !== undefined) {
            app.downloads[app.deals[index].deal_uri] = true;
          }
        } catch (e) {
          console.log("Error while downloading from:", uri);
        }
        app.isOpening = index;
        app.refreshDeal(index);
      }
    },
    closeSpec() {
      const app = this;
      app.navSpec = !app.navSpec;
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
          return Object.keys(deal).sort(); // Do your custom sorting here
        }
      });
    },
  },
  mounted() {
    this.connect();
  },
};
</script>

<style></style>
