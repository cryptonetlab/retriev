<template>
  <div>
    <section class="hero">
      <Navbar
        :account="account"
        :network="network"
        :accountBalance="accountBalance"
      />
      <!-- SHOW CREATION DEAL -->
      <div class="hero-body pt-5">
        <div class="container">
          <!-- TITLE -->
          <div class="b-bottom-colored-dark m-0 pb-3 mb-5">
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

          <div class="mt-3" v-if="isUploadingIPFS">
            Uploading file on IPFS, please wait..
          </div>

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
            class="is-flex is-align-items-start is-justify-content-space-between py-3"
            v-if="fileToUpload.name && !expertMode"
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
                fileToUpload = '';
                dealUri = '';
              "
              >Select another file</b-button
            >
          </div>

          <div v-if="expertMode" class="columns mt-6">
            <div class="column">
              <h5 class="mb-3">Appeal Address</h5>
              <b-input
                :disabled="isWorking"
                v-model="appealAddress"
                placeholder="ex: your ETH address"
              ></b-input>
            </div>
            <div class="column">
              <h5 class="mb-3">Deal URI</h5>
              <b-input
                :disabled="isWorking"
                v-model="dealUri"
                placeholder="ex: ipfs://CID"
              ></b-input>
            </div>
          </div>

          <div class="mt-6">
            <!-- TITLES TABLE -->
            <div class="columns" v-if="isDesktop">
              <div class="column is-full-mobile is-4-tablet is-5-desktop">
                <h5 class="title-table">PROVIDER</h5>
              </div>
              <div class="column is-full-mobile is-4-tablet is-3-desktop">
                <h5 class="title-table">ADDRESS</h5>
              </div>
              <div class="column is-full-mobile is-4-tablet is-1-desktop pl-0">
                <h5 class="title-table">MAX SIZE</h5>
              </div>
              <div class="column is-full-mobile is-4-tablet is-2-desktop pl-0">
                <h5 class="title-table">WEI/B PER SEC.</h5>
              </div>
              <div class="column is-full-mobile is-4-tablet is-1-desktop pl-0">
                <h5 class="title-table">SELECTION</h5>
              </div>
            </div>
            <!-- END TITLES TABLE -->
            <h5 v-if="!isDesktop" class="title-table">PROVIDER</h5>
            <div
              v-for="provider in providers"
              :value="provider.address"
              :key="provider.address"
              class="custom-card"
            >
              <div class="columns m-0" v-if="isDesktop">
                <div class="column is-5">
                  <p>
                    <b>{{ provider.address }}</b>
                  </p>
                </div>
                <div class="column is-3">
                  <p>{{ provider.endpoint }}</p>
                </div>
                <div class="column is-1">
                  <p>{{ provider.maxSize / 1000000 }}MB</p>
                </div>
                <div class="column is-2">
                  <p>{{ provider.price }}</p>
                </div>
                <div class="column is-1 pl-5">
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
              <div class="is-flex is-align-items-center"></div>
            </div>
          </div>

          <div class="columns mt-6">
            <div class="column">
              <div class="mb-5">
                <h3 class="mb-3">Deal Duration</h3>
                <div style="position: relative">
                  <b-input
                    v-model="dealDurationDays"
                    :disabled="isWorking"
                    placeholder="days"
                    type="number"
                  ></b-input>
                  <div class="placeholder-input">days</div>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="mb-5">
                <h3 class="mb-3">
                  Payment in wei
                  <i
                    @click="infoWei = true"
                    class="fa-solid fa-circle-info pointer"
                  ></i>
                </h3>
                <div style="position: relative">
                  <b-input
                    v-model="dealValue"
                    :disabled="isWorking"
                    placeholder="Payment in wei"
                  ></b-input>
                  <div class="placeholder-input">wei</div>
                </div>
              </div>

              <div v-if="expertMode" class="mt-6 mb-6">
                <h5 class="mb-5">
                  collateral
                  <i
                    @click="infoCollateral = true"
                    class="fa-solid fa-circle-info pointer"
                  ></i>
                </h5>
                <b-field class="px-4">
                  <b-slider
                    :disabled="isWorking"
                    :min="0"
                    :max="dealValue * 1000"
                    :step="1"
                    indicator
                    :tooltip="false"
                    type="is-info"
                    v-model="dealCollateral"
                  >
                    <b-slider-tick v-if="dealValue > 0" :value="dealValue"
                      >Low</b-slider-tick
                    >
                    <b-slider-tick v-if="dealValue > 0" :value="dealValue * 500"
                      >Mid</b-slider-tick
                    >
                    <b-slider-tick
                      v-if="dealValue > 0"
                      :value="dealValue * 1000"
                      >High</b-slider-tick
                    ></b-slider
                  >
                </b-field>
              </div>

              <div
                class="btn-secondary mt-6"
                v-if="!isWorking && canDoProposal"
                @click="createDealProposal()"
              >
                <i class="fa-solid fa-file-medical mr-3"></i>
                Create deal proposal
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
      dealDuration: 86400,
      dealDurationDays: 1,
      dealCollateral: "",
      dealProviders: [],
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
      canDoProposal: false,
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
    };
  },
  components: { Navbar },
  watch: {
    dealDurationDays() {
      const app = this;
      if (app.dealDurationDays > 365) {
        app.dealDurationDays = 365;
      }
      if (app.dealDurationDays < 0) {
        app.dealDurationDays = 1;
      }
      // TODO: Handle case where providers > 1
      app.dealValue =
        app.providersPolicy[app.dealProviders[0]].price *
        app.dealDurationDays *
        86400 *
        app.fileToUpload.size;
      app.dealDuration = parseInt(app.dealDurationDays * 86400);
    },
    fileToUpload() {
      this.uploadFile();
    },
    async dealValue() {
      const app = this;
      app.dealCollateral = app.dealValue;
    },
    async dealCollateral() {
      const app = this;
      const maximumCollateral = app.slashingMultiplier * app.dealValue;
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
              providerDetails.price = 0;
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
    async uploadFile() {
      const app = this;
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
          app.dealValue =
            app.providersPolicy[app.dealProviders[0]].price *
            app.dealDuration *
            app.fileToUpload.size;
          axios({
            method: "post",
            url: app.infuraURL + "?cid-version=1",
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data;",
            },
          }).then(function (response) {
            app.dealUri = "ipfs://" + response.data.Hash;
            app.isUploadingIPFS = false;
          });
        } else if (!app.expertMode) {
          // TODO: Change with fancy alert
          alert("File is too big, provider will not accept the deal!");
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
          if (
            parseInt(app.dealCollateral) <= parseInt(maximumCollateral) &&
            parseInt(app.dealCollateral) >= parseInt(app.dealValue)
          ) {
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
                  app.workingMessage = "Found pending transaction at " + tx;
                  app.log("Found pending transaction at: ", tx);
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
              app.log("Transaction success at: ", receipt.blockHash);
              setTimeout(async function () {
                window.location.href = "/";
              }, 2000);
              app.workingMessage =
                "Transaction success at: " + receipt.blockHash;
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
              alert(e.message);
            }
          } else {
            alert(
              "Max collateral is " +
                maximumCollateral +
                " while minimum is same of value!"
            );
          }
        } else {
          alert("Please fill all fields!");
        }
      } else {
        console.log("App busy, retry.");
      }
    },
  },
};
</script>
