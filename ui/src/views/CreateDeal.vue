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
    <section v-if="!isMobile" class="hero">
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
        @withdraw="withdraw()"
        @toggleSpec="toggleSpec()"
      />
      <!-- END | NAVBAR SECTION -->

      <!-- SHOW CREATION DEAL -->
      <div class="hero-body pt-5">
        <div class="container">
          <!-- TITLE -->
          <div
            @click="checkAddressArray()"
            class="b-bottom-colored-dark m-0 pb-3 mb-6"
          >
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
                :disabled="isWorking"
                leftLabel
                type="is-info"
              >
                Expert Mode
              </b-switch>
            </b-field>
          </div>
          <!--END | BACK BUTTON AND EXPERT MODE SWITCH -->

          <!-- Upload file -->
          <div>
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
                :disabled="isWorking"
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
          </div>
          <!-- END | Upload File -->

          <!-- Appeal address & Deal URI -->
          <div v-if="expertMode" class="columns is-mobile mt-6">
            <div class="column">
              <h5 class="mb-3">Appeal Address</h5>
              <div
                v-for="(address, index) in appealAddresses"
                :key="index"
                class="is-flex is-align-items-center is-align-content-space-between mb-3"
              >
                <b-field class="mb-0" type="is-info" style="width: 100%">
                  <b-input
                    :disabled="isWorking"
                    v-model="appealAddresses[index]"
                    placeholder="ex: your ETH address"
                  ></b-input>
                </b-field>
                <div class="pointer" @click="addField()">
                  <i class="fa-solid fa-circle-plus ml-3 color-secondary"></i>
                </div>
                <div
                  class="pointer"
                  v-show="appealAddresses.length > 1"
                  @click="removeField(index)"
                >
                  <i class="fa-solid fa-circle-minus ml-3 color-error"></i>
                </div>
              </div>
            </div>
            <div class="column">
              <h5 class="mb-3">Deal URI</h5>
              <b-field class="mb-0" type="is-info">
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

          <!-- Select service and provider -->
          <div class="columns mt-6">
            <div class="column is-half">
              <h5 class="title-table mb-3">ONCHAIN PROTOCOLS</h5>
              <b-checkbox
                type="is-info"
                native-value="false"
                v-model="service"
                checked
                :disabled="isWorking"
              >
                <p>Retrieval Pinning</p>
              </b-checkbox>
            </div>
            <div v-if="service" class="column is-half">
              <h5 class="title-table mb-3">Referees Network</h5>

              <b-checkbox
                type="is-info"
                native-value="false"
                v-model="refereenetwork"
                checked
                :disabled="isWorking"
              >
                <div>
                  <p>Referee Network #1</p>
                  <p class="small">({{ contract }})</p>
                </div>
              </b-checkbox>
            </div>
          </div>
          <!-- END | Select service and provider -->

          <div v-if="service">
            <div v-if="refereenetwork">
              <div v-if="providers.length > 0" class="mt-6">
                <!-- TITLES TABLE -->
                <div class="columns is-mobile">
                  <div
                    class="column is-3-tablet is-4-desktop"
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
                  <div
                    class="column is-2-tablet is-1-desktop pl-0"
                    :class="{ 'pr-0': isDesktop }"
                  >
                    <h5 class="title-table">MAX DURATION</h5>
                  </div>
                  <div class="column is-2-tablet is-2-desktop pl-0">
                    <h5 class="title-table">WEI/B PER SEC.</h5>
                  </div>
                </div>
                <!-- END TITLES TABLE -->
                <div
                  v-for="provider in providers"
                  :value="provider"
                  :key="provider"
                  class="custom-card custom-card-hover"
                >
                  <div class="columns is-mobile m-0">
                    <div class="column is-3-tablet is-4-desktop">
                      {{ provider.substr(0, 4) + "..." + provider.substr(-4) }}
                    </div>

                    <div
                      class="column is-3-tablet is-3-desktop b-left-colored-grey b-right-colored-grey pl-3"
                    >
                      <p>{{ providersPolicy[provider].endpoint }}</p>
                    </div>
                    <div
                      class="column is-2-tablet is-1-desktop b-right-colored-grey"
                      :class="{ 'pl-3': isTablet }"
                    >
                      <p>{{ providersPolicy[provider].maxSize / 1000000 }}MB</p>
                    </div>
                    <div
                      class="column is-2-tablet is-1-desktop pl-3 b-right-colored-grey"
                    >
                      <p>{{ providersPolicy[provider].maxDuration }} days</p>
                    </div>
                    <div
                      class="column is-2-tablet is-2-desktop b-right-colored-grey"
                    >
                      <p>{{ providersPolicy[provider].price }}</p>
                    </div>
                    <div
                      class="column is-2-tablet is-1-desktop has-text-centered pl-5"
                    >
                      <b-checkbox
                        type="is-info"
                        :disabled="isWorking"
                        v-model="dealProviders"
                        :native-value="provider"
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
                    <div v-if="expertMode && dealProviders[0]">
                      <div style="position: relative">
                        <b-field type="is-info">
                          <b-input
                            v-model="dealDurationDays"
                            :disabled="isWorking"
                            placeholder="days"
                            :min="7"
                            :max="providersPolicy[dealProviders[0]].maxDuration"
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
                  <!-- ALERT BANNER DURATION -->
                  <div
                    v-if="
                      dealProviders[0] &&
                      dealDurationDays >
                        providersPolicy[dealProviders[0]].maxDuration
                    "
                    class="alert-banner p-3 mt-3 mb-3"
                  >
                    <p>
                      <i class="fa-solid fa-circle-exclamation mr-3"></i>
                      <b
                        >Duration is too long, provider may not accept the deal.
                      </b>
                    </p>
                  </div>
                  <!-- ALERT BANNER DURATION -->
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
                            >Value is below minimum price, provider may not
                            accept the deal.
                          </b>
                        </p>
                      </div>
                      <!-- ALERT BANNER PAYMENT -->
                    </div>

                    <div v-if="!expertMode">
                      <div class="is-flex is-align-items-center">
                        <b-button
                          class="btn-transparent fixed-width mr-4"
                          :disabled="isWorking"
                          :type="{ 'is-info': selectedPriority === 0 }"
                          @click="calculateDealValue(0)"
                          >Free</b-button
                        >
                        <b-button
                          class="btn-transparent fixed-width mr-4"
                          :disabled="isWorking"
                          :type="{ 'is-info': selectedPriority === 1 }"
                          @click="calculateDealValue(1)"
                          >Low</b-button
                        >
                        <b-button
                          class="btn-transparent fixed-width mr-4"
                          :disabled="isWorking"
                          :type="{ 'is-info': selectedPriority === 2 }"
                          @click="calculateDealValue(2)"
                          >Medium</b-button
                        >
                        <b-button
                          class="btn-transparent fixed-width"
                          :disabled="isWorking"
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
                            >Value is below minimum price, provider may not
                            accept the deal.
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
                        v-if="
                          dealValue !== undefined && parseInt(dealValue) > 0
                        "
                        type="is-info"
                        label="Select size of collateral"
                        multilined
                      >
                        <i class="fa-solid fa-circle-info"></i>
                      </b-tooltip>
                      <b-tooltip
                        v-if="
                          dealValue !== undefined && parseInt(dealValue) === 0
                        "
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
                          :disabled="dealValue === 0 || isWorking"
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
                          :disabled="dealValue === 0 || isWorking"
                          class="btn-transparent fixed-width mr-4"
                          :type="{
                            'is-info':
                              dealCollateral ===
                                parseInt(dealValue) *
                                  (slashingMultiplier / 100) && dealValue > 0,
                          }"
                          @click="
                            dealCollateral =
                              parseInt(dealValue) * (slashingMultiplier / 100)
                          "
                          >Low</b-button
                        >
                        <b-button
                          :disabled="dealValue === 0 || isWorking"
                          class="btn-transparent fixed-width mr-4"
                          :type="{
                            'is-info':
                              dealCollateral ===
                                parseInt(dealValue) *
                                  (slashingMultiplier / 10) && dealValue > 0,
                          }"
                          @click="
                            dealCollateral =
                              parseInt(dealValue) * (slashingMultiplier / 10)
                          "
                          >Medium</b-button
                        >
                        <b-button
                          :disabled="dealValue === 0 || isWorking"
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
                      <div
                        v-if="dealCollateralLow"
                        class="alert-banner p-3 mt-3"
                      >
                        <p>
                          <i class="fa-solid fa-circle-exclamation mr-3"></i>
                          <b
                            >Collateral is less than the Deal value. Keep
                            attention storage is at your own risk.
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
                      <div
                        v-if="dealCollateralLow"
                        class="alert-banner p-3 mt-3"
                      >
                        <p>
                          <i class="fa-solid fa-circle-exclamation mr-3"></i>
                          <b
                            >Collateral is less than the Deal value. Keep
                            attention storage is at your own risk.
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
                      <b-checkbox
                        :disabled="isWorking"
                        v-model="termsOfService"
                        type="is-info inter"
                      >
                        I agree to the referee net #1 terms and conditions
                      </b-checkbox>
                    </b-field>
                    <i
                      class="fa-solid fa-circle-info pointer"
                      @click="toggleSpec()"
                      style="margin-top: -5px"
                    ></i>
                  </div>

                  <b-button
                    class="btn-secondary"
                    :disabled="
                      (termsOfService !== undefined &&
                        !termsOfService &&
                        !isUploadingIPFS) ||
                      isWorking
                    "
                    v-if="!isWorking && canDoProposal"
                    @click="createDealProposal()"
                  >
                    <i class="fa-solid fa-file-medical mr-3"></i>
                    Create deal proposal
                  </b-button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isWorking">{{ workingMessage }}</div>
        </div>
      </div>
      <!-- END - SHOW CREATION DEAL -->

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
      service: false,
      refereenetwork: false,
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
      currentNetwork: { icon: "fa-solid fa-user-secret", text: "Rinkeby" },
      fileToUpload: {},
      isUploadingIPFS: false,
      slashingMultiplier: 1000,
      appealAddresses: [],
      referees: [],
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
          app.appealAddresses = [app.account];
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
      app.showLoadingToast("Loading Providers, please wait...");
      app.providers = [];
      const providersApi = await axios.get(
        process.env.VUE_APP_API_URL + "/providers"
      );
      for (let k in providersApi.data) {
        const provider = providersApi.data[k];
        if (app.providers.indexOf(provider.address) === -1) {
          app.providers.push(provider.address);
          app.providersPolicy[provider.address] = {
            maxSize: provider.strategy.max_size,
            price: provider.strategy.min_price,
            maxDuration: provider.strategy.max_duration,
            maxCollateralMultiplier:
              provider.strategy.max_collateral_multiplier,
            endpoint: provider.endpoint,
          };
          app.dealProviders.push(provider.address);
          app.canDoProposal = true;
        }
      }
      // Checking Referees
      let ended = false;
      let i = 0;
      while (!ended) {
        try {
          const referee = await contract.methods.active_referees(i).call();
          if (app.referees.indexOf(referee) === -1) {
            app.referees.push(referee);
          }
        } catch (e) {
          console.log(e);
          ended = true;
        }
        i++;
      }
      console.log(app.providers);
      console.log("DEFAULT PROVIDERS:", app.dealProviders);
      app.log("Found " + app.providers.length + " active providers");
      app.$toast.clear();
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
          app.showLoadingToast("Uploading file on IPFS, please wait..");
          app.isUploadingIPFS = true;
          app.canDoProposal = true;
          const formData = new FormData();
          formData.append("file", app.fileToUpload);
          formData.append("address", app.account);
          console.log("UPLOADED_FILE", app.fileToUpload);
          console.log("Size of FILE is: ", app.fileToUpload.size);
          console.log(
            "Provider policy price is: ",
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
            url: process.env.VUE_APP_API_URL + "/upload",
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data;",
            },
          }).then(function (response) {
            if (response.data.cid !== undefined) {
              app.dealUri = "ipfs://" + response.data.cid;
              app.isUploadingIPFS = false;
              app.$toast.clear();
              console.log("uploaded correctly");
            } else {
              app.alertCustomError("Error while uploading file, please retry!");
            }
          });
        } else if (!app.expertMode) {
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
            app.showLoadingToast("Please confirm action with metamask..");
            try {
              const contract = new app.web3.eth.Contract(app.abi, app.contract);
              console.log("Appeal Addresses typed are:", app.appealAddresses);
              const receipt = await contract.methods
                .createDealProposal(
                  app.dealUri,
                  app.dealDuration,
                  app.dealCollateral.toString(),
                  app.dealProviders,
                  app.appealAddresses
                )
                .send({
                  value: app.dealValue.toString(),
                  from: app.account,
                })
                .on("transactionHash", (tx) => {
                  app.log(
                    "Found pending transaction at " +
                      tx.substr(0, 4) +
                      "..." +
                      tx.substr(-4)
                  );
                  localStorage.setItem("pendingTx", tx);
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
                });
              app.$toast.clear();
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
    showLoadingToast(message) {
      const app = this;
      if (!app.isToasting) {
        app.isToasting = true;
        app.$toast.warning(message, {
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
          icon: "fa-solid fa-hourglass-half",
          rtl: false,
        });
        setTimeout(function () {
          app.isToasting = false;
        }, 6200);
      }
    },
    toggleSpec() {
      const app = this;
      app.navSpec = !app.navSpec;
    },

    //ADDING APPEAL ADDRESS
    addField() {
      const app = this;
      app.appealAddresses.push("");
    },
    removeField(index) {
      const app = this;
      console.log("Removing index:", index);
      let temp = app.appealAddresses;
      app.appealAddresses = [];
      for (let k in temp) {
        if (parseInt(k) !== parseInt(index)) {
          app.appealAddresses.push(temp[k]);
        }
      }
    },
  },
};
</script>
