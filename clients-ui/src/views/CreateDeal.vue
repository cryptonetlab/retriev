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

      <!-- SHOW CREATION DEAL -->
      <div class="hero-body pt-5">
        <div class="container">
          <!-- TITLE -->
          <div class="b-bottom-colored-dark m-0 pb-3 mb-6">
            <h2 class="title is-3 m-0">NEW DEAL PROPOSAL</h2>
          </div>
          <!-- END TITLE -->

          <!-- BACK BUTTON AND EXPERT MODE SWITCH -->
          <div
            class="is-flex is-justify-content-space-between is-align-items-center mb-5"
          >
            <a class="btn-white" href="/">
              <i class="fa-solid fa-arrow-left"></i> back
            </a>
            <b-field>
              <b-switch
                v-model="expertMode"
                :rounded="false"
                leftLabel
                type="is-info"
              >
                Expert Mode
              </b-switch>
            </b-field>
          </div>
          <!--END | BACK BUTTON AND EXPERT MODE SWITCH -->

          <!-- Upload file -->
          <b-field v-if="!fileToUpload.name && !expertMode">
            <b-upload
              v-model="fileToUpload"
              expanded
              drag-drop
              :disabled="isWorking"
              type="is-info"
            >
              <section class="section">
                <div class="content has-text-centered">
                  <p>Drop your file here or click to upload</p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <div class="mt-3" v-if="isUploadingIPFS">
            <p>Uploading file on IPFS, please wait..</p>
          </div>
          <div
            class="bordered-dashed is-flex is-flex-wrap-wrap is-align-items-start is-justify-content-space-between p-3"
            v-if="fileToUpload.name"
          >
            <div>
              <h5>File name:</h5>
              <p>{{ fileToUpload.name }}</p>
              <h5>Deal URI:</h5>
              <p v-if="dealUri">{{ dealUri }}</p>
              <p v-if="!dealUri">Calculating...</p>
            </div>
            <b-button
              class="btn-secondary"
              style="float: right"
              @click="
                fileToUpload = {};
                dealUri = '';
                dealValue = 0;
                dealCollateral = 0;
                baseDealValue = 0;
              "
              ><i class="fa-solid fa-circle-xmark"></i> Change file</b-button
            >
          </div>
          <!-- END | Upload File -->

          <!-- Appeal address & Deal URI -->
          <div v-if="expertMode" class="columns is-mobile mt-6">
            <div class="column">
              <h5 class="mb-3">Appeal Address</h5>
              <b-field type="is-info">
                <b-input
                  :disabled="isWorking"
                  v-model="appealAddress"
                  placeholder="ex: your ETH address"
                ></b-input>
              </b-field>
            </div>
            <div class="column">
              <h5 class="mb-3">Deal URI</h5>
              <b-field type="is-info">
                <b-input
                  :disabled="isWorking || fileToUpload.name"
                  v-model="dealUri"
                  placeholder="ex: ipfs://CID"
                ></b-input>
              </b-field>
              <!-- ALERT BANNER PAYMENT -->
              <div v-if="fileToUpload.name" class="alert-banner p-3 mt-3 mb-3">
                <p>
                  <i class="fa-solid fa-circle-exclamation mr-3"></i>
                  <b>It can be edited only by removing the file. </b>
                </p>
              </div>
              <!-- ALERT BANNER PAYMENT -->
            </div>
          </div>
          <!-- END | Appeal address & Deal URI -->

          <div v-if="providers.length > 0" class="mt-6">
            <!-- TITLES TABLE -->
            <div class="columns is-mobile">
              <div
                class="column is-3-tablet is-5-desktop"
                :class="{ 'pl-3': isTablet }"
              >
                <h5 class="title-table">PROVIDER</h5>
              </div>
              <div class="column is-3-tablet is-3-desktop px-0">
                <h5 class="title-table">ADDRESS</h5>
              </div>
              <div
                class="column is-2-tablet is-1-desktop pl-0"
                :class="{ 'pr-0': isDesktop }"
              >
                <h5 class="title-table">MAX SIZE</h5>
              </div>
              <div class="column is-2-tablet is-2-desktop pl-0">
                <h5 class="title-table">WEI/B PER SEC.</h5>
              </div>
            </div>
            <!-- END TITLES TABLE -->
            <div
              v-for="provider in providers"
              :value="provider.address"
              :key="provider.address"
              class="custom-card custom-card-hover"
            >
              <div class="columns is-mobile m-0">
                <div class="column is-3-tablet is-5-desktop">
                  <p v-if="isDesktop">
                    <b>{{ provider.address }}</b>
                  </p>
                  <p v-if="!isDesktop">
                    <b>{{
                      provider.address.substr(0, 4) +
                      "..." +
                      provider.address.substr(-4)
                    }}</b>
                  </p>
                </div>

                <div
                  class="column is-3-tablet is-3-desktop b-left-colored-grey b-right-colored-grey pl-3"
                >
                  <p>{{ provider.endpoint }}</p>
                </div>
                <div
                  class="column is-2-tablet is-1-desktop b-right-colored-grey"
                  :class="{ 'pl-3': isTablet }"
                >
                  <p>{{ provider.maxSize / 1000000 }}MB</p>
                </div>
                <div
                  class="column is-2-tablet is-2-desktop b-right-colored-grey"
                >
                  <p>{{ provider.price }}</p>
                </div>
                <div
                  class="column is-2-tablet is-1-desktop has-text-centered pl-5"
                >
                  <b-checkbox
                    type="is-info"
                    :disabled="isWorking"
                    v-model="dealProviders"
                    :native-value="provider.address"
                    checked
                  >
                  </b-checkbox>
                </div>
              </div>
            </div>
          </div>

          <div class="columns is-mobile mt-6">
            <!-- Deal input fields -->
            <div class="column is-half">
              <div class="mb-5">
                <div class="is-flex is-align-items-center mb-3">
                  <b-tooltip
                    position="is-right"
                    type="is-info"
                    label="Type or select a duration for your deal."
                    multilined
                  >
                    <i class="fa-solid fa-circle-info"></i>
                  </b-tooltip>
                  <h5 class="ml-3">Deal Duration</h5>
                </div>
                <div v-if="expertMode">
                  <div style="position: relative">
                    <b-field type="is-info">
                      <b-input
                        v-model="dealDurationDays"
                        :disabled="isWorking"
                        placeholder="days"
                        :min="7"
                        :max="365"
                        type="number"
                        id="dealDurationDays"
                      ></b-input>
                    </b-field>
                    <div class="placeholder-input">days</div>
                  </div>
                </div>

                <div v-if="!expertMode">
                  <b-field>
                    <b-radio-button
                      class="fixed-width"
                      v-model="dealDurationDays"
                      :disabled="isWorking"
                      :native-value="7"
                      type="is-info is-light is-outlined"
                    >
                      <span>Week</span>
                    </b-radio-button>

                    <b-radio-button
                      class="fixed-width"
                      v-model="dealDurationDays"
                      :disabled="isWorking"
                      :native-value="31"
                      type="is-info is-light is-outlined"
                    >
                      <span>Month</span>
                    </b-radio-button>

                    <b-radio-button
                      class="fixed-width"
                      v-model="dealDurationDays"
                      :disabled="isWorking"
                      :native-value="365"
                      type="is-info is-light is-outlined"
                    >
                      <span>Year</span>
                    </b-radio-button>

                    <b-radio-button
                      class="fixed-width"
                      disabled
                      type="is-info is-light is-outlined"
                    >
                      <span>Forever</span>
                    </b-radio-button>
                  </b-field>
                </div>
                <p class="pt-3 grey-color recap-deal">
                  Deal Duration is:
                  <b>{{ dealDurationDays }} days</b>
                </p>
              </div>
            </div>
            <!-- END | Dealinput fields -->

            <div class="column is-half">
              <!-- Payment input fields -->
              <div class="mb-6">
                <div class="is-flex is-align-items-center mb-3">
                  <b-tooltip
                    type="is-info"
                    label="Select payment for your deal, value will be calculated after uploading the file"
                    multilined
                  >
                    <i class="fa-solid fa-circle-info"></i>
                  </b-tooltip>
                  <h5 class="ml-3">Deal Cost</h5>
                </div>
                <div v-if="expertMode">
                  <div style="position: relative">
                    <b-field type="is-info">
                      <b-input
                        type="number"
                        v-model="dealValue"
                        :disabled="isWorking"
                        :min="0"
                        placeholder="Payment in wei"
                      ></b-input>
                    </b-field>
                    <div class="placeholder-input">wei</div>
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                  <div
                    v-if="dealValue < baseDealValue"
                    class="alert-banner p-3 mt-3 mb-3"
                  >
                    <p>
                      <i class="fa-solid fa-circle-exclamation mr-3"></i>
                      <b
                        >Value is below minimum price, provider may not accept
                        the deal.
                      </b>
                    </p>
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                </div>

                <div v-if="!expertMode">
                  <div class="is-flex is-align-items-center">
                    <b-button
                      class="btn-transparent fixed-width mr-4"
                      :type="{ 'is-info': selectedPriority === 0 }"
                      @click="calculateDealValue(0)"
                      >Free</b-button
                    >
                    <b-button
                      class="btn-transparent fixed-width mr-4"
                      :type="{ 'is-info': selectedPriority === 1 }"
                      @click="calculateDealValue(1)"
                      >Low</b-button
                    >
                    <b-button
                      class="btn-transparent fixed-width mr-4"
                      :type="{ 'is-info': selectedPriority === 2 }"
                      @click="calculateDealValue(2)"
                      >Medium</b-button
                    >
                    <b-button
                      class="btn-transparent fixed-width"
                      :type="{ 'is-info': selectedPriority === 5 }"
                      @click="calculateDealValue(5)"
                      >High</b-button
                    >
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                  <div
                    v-if="dealValue < baseDealValue"
                    class="alert-banner p-3 mt-3 mb-3"
                  >
                    <p>
                      <i class="fa-solid fa-circle-exclamation mr-3"></i>
                      <b
                        >Value is below minimum price, provider may not accept
                        the deal.
                      </b>
                    </p>
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                </div>
                <p class="mt-3 grey-color recap-deal">
                  You are paying:
                  <b>{{ dealValue }} WEI</b>
                </p>
              </div>

              <!-- END | Payment input fields -->

              <!-- Collateral Input -->

              <!-- Collateral Input Slider OK -->
              <!-- <div v-if="!expertMode" class="mt-6 mb-6">
                <div class="is-flex is-align-items-center mb-3">
                  <h5 class="m-0">collateral</h5>
                  <h3>
                    <i
                      @click="infoCollateral = true"
                      class="fa-solid fa-circle-info pointer ml-2"
                    ></i>
                  </h3>
                </div>
                <b-field class="px-4">
                  <b-slider
                    :disabled="isWorking"
                    :min="0"
                    :max="dealValue * slashingMultiplier"
                    :step="slashingMultiplier"
                    indicator
                    :tooltip="false"
                    type="is-info"
                    v-model="dealCollateral"
                  >
                    <b-slider-tick
                      v-if="parseInt(dealValue) > 0"
                      :value="parseInt(dealValue)"
                      >Low</b-slider-tick
                    >
                    <b-slider-tick
                      v-if="parseInt(dealValue) > 0"
                      :value="parseInt(dealValue) * (slashingMultiplier / 2)"
                      >Mid</b-slider-tick
                    >
                    <b-slider-tick
                      v-if="dealValue > 0"
                      :value="dealValue * slashingMultiplier"
                      >High</b-slider-tick
                    ></b-slider
                  >
                </b-field>
                <div v-if="dealCollateralLow" class="alert-banner p-3 mt-6">
                  <p>
                    <i class="fa-solid fa-circle-exclamation mr-3"></i>
                    <b
                      >Collateral is less than the Deal value. Keep attention
                      storage is at your own risk.
                    </b>
                  </p>
                </div>
              </div> -->
              <!-- END | Collateral Input Slider -->

              <div class="mb-6">
                <div class="is-flex is-align-items-center mb-3">
                  <b-tooltip
                    v-if="dealValue !== undefined && parseInt(dealValue) > 0"
                    type="is-info"
                    label="Select size of collateral"
                    multilined
                  >
                    <i class="fa-solid fa-circle-info"></i>
                  </b-tooltip>
                  <b-tooltip
                    v-if="dealValue !== undefined && parseInt(dealValue) === 0"
                    type="is-warning"
                    label="When deal is free the size of the collateral cannot be changed"
                    multilined
                  >
                    <i class="fa-solid fa-circle-info"></i>
                  </b-tooltip>
                  <h5 class="ml-3">Collateral</h5>
                </div>
                <div v-if="!expertMode">
                  <div class="is-flex is-align-items-center">
                    <b-button
                      :disabled="dealValue === 0"
                      class="btn-transparent fixed-width mr-4"
                      :type="{
                        'is-info':
                          dealCollateral === parseInt(dealValue) &&
                          parseInt(dealValue) > 0,
                      }"
                      @click="dealCollateral = parseInt(dealValue)"
                      >Minimum</b-button
                    >
                    <b-button
                      :disabled="dealValue === 0"
                      class="btn-transparent fixed-width mr-4"
                      :type="{
                        'is-info':
                          dealCollateral ===
                            parseInt(dealValue) * (slashingMultiplier / 100) &&
                          dealValue > 0,
                      }"
                      @click="
                        dealCollateral =
                          parseInt(dealValue) * (slashingMultiplier / 100)
                      "
                      >Low</b-button
                    >
                    <b-button
                      :disabled="dealValue === 0"
                      class="btn-transparent fixed-width mr-4"
                      :type="{
                        'is-info':
                          dealCollateral ===
                            parseInt(dealValue) * (slashingMultiplier / 10) &&
                          dealValue > 0,
                      }"
                      @click="
                        dealCollateral =
                          parseInt(dealValue) * (slashingMultiplier / 10)
                      "
                      >Medium</b-button
                    >
                    <b-button
                      :disabled="dealValue === 0"
                      class="btn-transparent fixed-width"
                      :type="{
                        'is-info':
                          dealCollateral ===
                            parseInt(dealValue) * slashingMultiplier &&
                          dealValue > 0,
                      }"
                      @click="
                        dealCollateral =
                          parseInt(dealValue) * slashingMultiplier
                      "
                      >Max</b-button
                    >
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                  <div v-if="dealCollateralLow" class="alert-banner p-3 mt-3">
                    <p>
                      <i class="fa-solid fa-circle-exclamation mr-3"></i>
                      <b
                        >Collateral is less than the Deal value. Keep attention
                        storage is at your own risk.
                      </b>
                    </p>
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                </div>

                <div v-if="expertMode">
                  <div style="position: relative">
                    <b-field type="is-info">
                      <b-input
                        type="number"
                        v-model="dealCollateral"
                        :disabled="isWorking"
                        :min="0"
                        placeholder="Payment in wei"
                      ></b-input>
                    </b-field>
                    <div class="placeholder-input">collateral</div>
                  </div>
                  <!-- ALERT BANNER COLLATERAL -->
                  <div v-if="dealCollateralLow" class="alert-banner p-3 mt-3">
                    <p>
                      <i class="fa-solid fa-circle-exclamation mr-3"></i>
                      <b
                        >Collateral is less than the Deal value. Keep attention
                        storage is at your own risk.
                      </b>
                    </p>
                  </div>
                  <!-- ALERT BANNER COLLATERAL -->
                </div>
                <!-- END | Collateral Input -->
                <p class="mt-3 grey-color recap-deal">
                  Your Collateral:
                  <b> {{ dealCollateral }} WEI</b>
                </p>
              </div>

              <div class="is-flex is-align-items-center mb-5">
                <b-field class="mb-0">
                  <b-checkbox v-model="termsOfService" type="is-info inter">
                    I agree to the referee net #1 terms and conditions
                  </b-checkbox>
                </b-field>
                <i
                  class="fa-solid fa-circle-info pointer"
                  @click="closeSpec()"
                  style="margin-top: -5px"
                ></i>
              </div>

              <b-button
                class="btn-secondary"
                :disabled="
                  termsOfService !== undefined &&
                  !termsOfService &&
                  !isUploadingIPFS
                "
                v-if="!isWorking && canDoProposal"
                @click="createDealProposal()"
              >
                <i class="fa-solid fa-file-medical mr-3"></i>
                Create deal proposal
              </b-button>
            </div>
          </div>
          <div v-if="isWorking">{{ workingMessage }}</div>
        </div>
      </div>
      <!-- END - SHOW CREATION DEAL -->

      <!-- Working Messages -->
      <div
        class="workingMessage is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center is-justify-content-center"
        v-if="isWorking"
      >
        <i class="fas fa-spinner fa-pulse mr-5"></i>
        <p class="text-center">{{ workingMessage }}</p>
      </div>
      <!-- END Working Messages -->

      <!-- Loading PROVIDERS  -->
      <div
        class="workingMessage is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center is-justify-content-center"
        v-if="providers.length <= 0"
      >
        <i class="fas fa-spinner fa-pulse mr-5"></i>
        <p class="text-center">Loading Providers, please wait...</p>
      </div>
      <!-- END | Loading PROVIDERS -->
    </section>
  </div>
</template>

<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import checkViewport from "@/mixins/checkViewport";
import Navbar from "@/components/Navbar.vue";
import axios from "axios";
const ABI = require("../abi.json");
const FormData = require("form-data");

export default {
  name: "newDeal",
  mixins: [checkViewport],

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
      isWorking: false,
      isToasting: false,
      workingMessage: "",
      minDuration: 3600,
      maxDuration: 42000,
      deals: [],
      providers: [],
      providersPolicy: {},
      logs: "",
      dealUri: "",
      dealDuration: 86400 * 7,
      dealDurationDays: 7,
      dealCollateral: 0,
      dealCollateralLow: 0,
      dealProviders: [],
      dealValue: 0,
      baseDealValue: 0,
      selectedPriority: 1,
      selectedCollateralPriority: 1,
      termsOfService: "",
      abi: ABI,
      balance: 0,
      infuraURL: "https://ipfs.infura.io:5001/api/v0/add",
      currentNetwork: { icon: "fa-solid fa-user-secret", text: "Rinkeby" },
      fileToUpload: {},
      isUploadingIPFS: false,
      slashingMultiplier: 1000,
      appealAddress: "",
      // REFRESH SINGLE DEAL
      selectedDeal: {},

      // FOR LAYOUT
      canDoProposal: false,
      expertMode: false,
      navSpec: false,

      // FILTER
      changeNetwork: false,
      filtered: false,
      activeDeal: true,
      endedDeal: false,
      showallDeals: false,
      isOpen: 0,
      searcher: "",
    };
  },
  components: { Navbar },
  watch: {
    dealDurationDays() {
      const app = this;
      // Duration day limit max and min on input
      if (app.dealDurationDays > 365) {
        app.dealDurationDays = 365;
      }

      if (app.dealDurationDays === "") {
        app.dealDurationDays = 7;
      }
      // TODO: Handle case where providers > 1
      if (app.fileToUpload.size !== undefined) {
        app.dealValue = parseInt(
          parseInt(app.providersPolicy[app.dealProviders[0]].price) *
            parseInt(app.dealDurationDays) *
            86400 *
            parseInt(app.fileToUpload.size)
        );
        app.baseDealValue = app.dealValue;
        app.dealValue = app.dealValue * app.selectedPriority;
      }
      app.dealDuration = parseInt(app.dealDurationDays * 86400);
    },
    fileToUpload() {
      this.uploadFile();
    },
    async dealValue() {
      const app = this;
      // dealValue limit min on input
      if (app.dealValue < 0) {
        app.dealValue = 0;
      } else if (app.dealValue === "") {
        app.dealValue = 0;
      }
      if (app.expertMode) {
        if (app.dealCollateral < parseInt(app.dealValue)) {
          app.dealCollateralLow = true;
        } else {
          app.dealCollateralLow = false;
        }
      } else {
        app.dealCollateral = parseInt(app.dealValue);
      }
    },
    async dealCollateral() {
      const app = this;
      const collateralDeal =
        parseInt(app.dealCollateral) - parseInt(app.dealValue);
      if (collateralDeal > -1) {
        app.dealCollateralLow = false;
      } else {
        app.dealCollateralLow = true;
      }
      const maximumCollateral =
        parseInt(app.slashingMultiplier) * parseInt(app.dealValue);
      console.log("max collateral", maximumCollateral);
      if (parseInt(app.dealCollateral) > parseInt(maximumCollateral)) {
        app.log("Min collateral is " + maximumCollateral + ", please fix it!");
      }
    },
    closeSpec() {
      const app = this;
      app.navSpec = false;
    },
  },
  mounted() {
    this.connect();
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
      app.minDuration = parseInt(await contract.methods.min_duration().call());
      app.maxDuration = await contract.methods.max_duration().call();
      app.log("Min duration is: " + app.minDuration);
      app.log("Max duration is: " + app.maxDuration);
      app.loading = false;
      // Connecting to p2p network
      app.providers = [];
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
            console.log("Details Provider", provider);
            if (
              providerDetails.endpoint.indexOf("localhost") === -1 &&
              providerDetails.endpoint.indexOf("https") !== -1
            ) {
              // Just for demo
              providerDetails.maxSize = 20000000;
              providerDetails.price = 1;
              app.providersPolicy[provider] = {
                maxSize: providerDetails.maxSize,
                price: providerDetails.price,
              };
              // end
              app.providers.push(providerDetails);
              app.dealProviders.push(provider);
              app.canDoProposal = true;
              app.connectSocket(providerDetails.endpoint);
            }
          }
        } catch (e) {
          ended = true;
        }
        i++;
      }
      console.log("DEFAULT PROVIDERS:", app.dealProviders);
      app.log("Found " + app.providers.length + " active providers");
    },
    async uploadFile() {
      const app = this;
      console.log("init upload file");
      if (app.fileToUpload.name && !app.isUploadingIPFS) {
        // TODO: Handle case where providers > 1
        if (
          app.fileToUpload.size <
          app.providersPolicy[app.dealProviders[0]].maxSize
        ) {
          app.isUploadingIPFS = true;
          app.canDoProposal = true;
          const formData = new FormData();
          formData.append("file", app.fileToUpload);
          console.log("UPLOADED_FILE", app.fileToUpload);
          console.log("Size of FILE is: ", app.fileToUpload.size);
          console.log(
            "provider policy price is: ",
            app.providersPolicy[app.dealProviders[0]].price
          );
          console.log("Deal duration is: ", app.dealDuration);
          app.dealValue =
            app.providersPolicy[app.dealProviders[0]].price *
            app.dealDuration *
            app.fileToUpload.size;
          app.baseDealValue = app.dealValue;
          app.dealValue = app.dealValue * app.selectedPriority;
          console.log("changed Deal value, now is: ", app.dealValue);
          axios({
            method: "post",
            url: app.infuraURL + "?cid-version=1",
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data;",
              Authorization: "Basic " + process.env.VUE_APP_INFURA_KEY,
            },
          }).then(function (response) {
            app.dealUri = "ipfs://" + response.data.Hash;
            app.isUploadingIPFS = false;
            console.log("uploaded correctly");
          });
        } else if (!app.expertMode) {
          // TODO: Change with fancy alert
          app.alertCustomError(
            "File is too big, provider will not accept the deal!"
          );
          app.fileToUpload = "";
          app.canDoProposal = false;
        }
      }
    },
    async createDealProposal() {
      const app = this;
      if (!app.isWorking) {
        if (
          parseInt(app.dealDuration) >= parseInt(app.minDuration) &&
          parseInt(app.dealDuration) <= parseInt(app.maxDuration) &&
          app.dealUri.length > 0 &&
          app.dealProviders.length > 0
        ) {
          const maximumCollateral = app.slashingMultiplier * app.dealValue;
          if (parseInt(app.dealCollateral) <= parseInt(maximumCollateral)) {
            app.isWorking = true;
            app.workingMessage = "Please confirm action with metamask..";
            try {
              const contract = new app.web3.eth.Contract(app.abi, app.contract);
              const receipt = await contract.methods
                .createDealProposal(
                  app.dealUri,
                  app.dealDuration,
                  app.dealCollateral.toString(),
                  app.dealProviders,
                  [app.account]
                )
                .send({
                  value: app.dealValue.toString(),
                  from: app.account,
                })
                .on("transactionHash", (tx) => {
                  app.workingMessage =
                    "Found pending transaction at " +
                    tx.substr(0, 4) +
                    "..." +
                    tx.substr(-4);
                  app.log(
                    "Found pending transaction at " +
                      tx.substr(0, 4) +
                      "..." +
                      tx.substr(-4)
                  );
                  this.$toast.warning("Found pending transaction at: " + tx, {
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
                });
              console.log("BLOCKCHAIN_RECEIPT ", receipt);
              app.log(
                "Transaction success at: ",
                receipt.blockHash.substr(0, 4) +
                  "..." +
                  receipt.blockHash.substr(-4)
              );
              setTimeout(async function () {
                window.location.href = "/";
              }, 2000);
              app.workingMessage =
                "Transaction success at: " +
                receipt.blockHash.substr(0, 4) +
                "..." +
                receipt.blockHash.substr(-4);
              this.$toast("Transaction success at: " + receipt.blockHash, {
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
            } catch (e) {
              app.isWorking = false;
              app.alertCustomError(e.message);
            }
          } else {
            app.alertCustomError(
              "Max collateral is " +
                maximumCollateral +
                " while minimum is same of value!"
            );
          }
        } else {
          app.alertCustomError("Please fill all fields!");
        }
      } else {
        console.log("App busy, retry.");
      }
    },
    // NOTIFICATIONS & ALERTS
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
    calculateDealValue(priority) {
      const app = this;
      app.selectedPriority = priority;
      app.dealValue = app.baseDealValue * priority;
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

    closeSpec() {
      const app = this;
      app.navSpec = !app.navSpec;
    },
  },
};
</script>
