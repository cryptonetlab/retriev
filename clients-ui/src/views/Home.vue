<template>
  <section class="hero">
    <div class="hero-body">
      <!-- Nav Button show/hide -->
      <div
        @click="
          showNavbar = !showNavbar;
          showConsole = false;
        "
        class="btn-sidebar position-top-right"
      >
        <i v-if="!showNavbar" class="fa-solid fa-bars"></i>
        <i v-if="showNavbar" class="fa-solid fa-times"></i>
      </div>
      <!-- END - Logs button show/hide -->

      <!-- Logs button show/hide -->
      <div
        @click="
          showConsole = !showConsole;
          showNavbar = false;
        "
        class="btn-sidebar position-bottom-right"
        :class="{ heartbeat: loading }"
      >
        <i class="fa-solid fa-terminal"></i>
      </div>
      <!-- END - Logs button show/hide -->

      <!-- Navbar -->
      <Transition
        enter-active-class="slide-in-right"
        leave-active-class="slide-out-right"
      >
        <div v-if="showNavbar" class="right-col">
          <div class="nav-container mt-5 pt-5">
            <button class="button is-rounded is-dark">Signup Protocol</button>
            <div class="mt-3">
              <a href="/help"
                ><i class="fa-solid fa-circle-question mr-2"></i>
                <span>Help</span></a
              >
            </div>
          </div>
        </div>
      </Transition>
      <!-- END - Navbar -->

      <div class="container" v-if="account">
        <div>
          <h1 class="title is-3">Data retrievability Oracle</h1>
          Welcome back {{ account }}<br />
          Internal balance in contract is {{ balance }} ETH,
          <a href="#" style="color: #000" @click="withdraw"
            >💵 withdraw them from contract</a
          >.
          <hr />
          <div v-if="!loading">
            <!-- Show all created deals -->
            <div v-if="!showCreate">
              <a
                href="#"
                style="color: #000"
                @click="
                  showCreate = true;
                  showToast();
                "
                >📄 new deal proposal</a
              >
              <div class="mt-5" v-if="deals.length > 0">
                <b class="title is-5 mb-3">Manage your deals</b><br /><br />
                <div>
                  <div class="columns is-multiline">
                    <div
                      class="column is-12-mobile is-12-tablet is-6-desktop"
                      v-for="deal in deals"
                      v-bind:key="deal.index"
                    >
                      <div class="box-deals">
                        <div>
                          <p><b>Index:</b> {{ deal.index }}</p>
                          <p><b>Hash</b>: {{ deal.ipfs_hash }}</p>
                          <p><b>Value:</b> {{ deal.value }}</p>
                          <p><b>Collateral:</b> {{ deal.collateral }}</p>
                          <p><b>Active:</b> {{ deal.active }}</p>
                          <p><b>Accepted:</b> {{ deal.accepted }}</p>
                          <p>
                            <b>Timestamp request:</b>
                            {{ deal.timestamp_request }}
                          </p>
                          <p>
                            <b>Timestamp start:</b> {{ deal.timestamp_start
                            }}<br />
                          </p>
                          <a href="#" v-if="deal.active === false"
                            >This deal is not active anymore</a
                          >
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
                              deal.appeal === undefined &&
                              parseInt(deal.timestamp_start) > 0 &&
                              new Date().getTime() < deal.timestamp_end
                            "
                            @click="createAppeal(deal.index)"
                            >❌ create appeal</a
                          >
                          <a
                            href="#"
                            v-if="
                              deal.appeal !== undefined &&
                              parseInt(deal.appeal.deal_index) ===
                                parseInt(deal.index) &&
                              parseInt(deal.appeal.round) < 99
                            "
                            >⌛Processing round {{ deal.appeal.round }}, slashes
                            are {{ deal.appeal.slashes }}.</a
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="deals.length === 0">
                No deals or proposal, create a new one.
              </div>
            </div>
            <!-- END - Show all created deals -->

            <!-- Show creation deals -->
            <div v-if="showCreate">
              <a href="#" style="color: #000" @click="showCreate = false"
                >⬅️ back</a
              >
              <br /><br />
              <div v-if="isUploadingIPFS">
                Uploading file on IPFS, please wait..
              </div>
              <b-field v-if="!fileToMint.name">
                <b-upload v-model="fileToMint" expanded drag-drop>
                  <section class="section">
                    <div class="content has-text-centered">
                      <p>Drop your file here or click to upload</p>
                    </div>
                  </section>
                </b-upload>
              </b-field>
              <b-input v-model="dealHash" placeholder="Deal IPFS CID"></b-input>
              <b-input
                v-model="dealValue"
                placeholder="Value of deal in gwei"
              ></b-input>
              <b-input
                v-model="dealCollateral"
                placeholder="Value of collateral in gwei"
              ></b-input>
              <br />
              <b-field
                v-if="parseInt(minDuration) > 0 && parseInt(maxDuration) > 0"
                label="Duration of deal in seconds"
              >
                <b-slider
                  :min="parseInt(minDuration)"
                  :max="parseInt(maxDuration)"
                  :step="1"
                  v-model="dealDuration"
                ></b-slider>
              </b-field>
              <!-- JUST FOR MVP, PROVIDER SHOULD BE A MULTISELECT -->
              <b-field label="Select a provider">
                <b-select
                  v-model="dealProviders"
                  placeholder="Select a provider"
                >
                  <option
                    v-for="provider in providers"
                    :value="provider"
                    :key="provider"
                  >
                    {{ provider }}
                  </option>
                </b-select>
              </b-field>
              <br />
              <div class="btn" v-if="!isWorking" @click="createDealProposal()">
                Create deal proposal
              </div>
              <div v-if="isWorking">{{ workingMessage }}</div>
            </div>
            <!-- END - Show creation deals -->
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
          <div v-if="showConsole" class="right-col" v-html="logs"></div>
        </Transition>
        <!-- END - Application Logs -->
      </div>
      <div
        class="container has-text-centered"
        v-if="!account"
        style="padding: 40vh 0"
      >
        <p class="title mb-0">Please connect your wallet first!<br /><br /></p>
        <div class="btn" @click="connect()">Connect Wallet</div>
      </div>
    </div>
  </section>
</template>
<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { io } from "socket.io-client";
const FormData = require("form-data");
const axios = require("axios");
const ABI = require("../abi.json");

export default {
  name: "Home",
  data() {
    return {
      account: "",
      contract: process.env.VUE_APP_CONTRACT,
      infuraId: process.env.VUE_APP_INFURA_ID,
      network: process.env.VUE_APP_NETWORK,
      web3: "",
      loading: true,
      showCreate: false,
      isWorking: false,
      workingMessage: "",
      minDuration: 3600,
      maxDuration: 42000,
      deals: [],
      providers: [],
      logs: "",
      dealHash: "",
      dealDuration: 3600,
      dealCollateral: "",
      dealProviders: "",
      dealValue: "",
      abi: ABI,
      balance: 0,
      infuraURL: "https://ipfs.infura.io:5001/api/v0/add",
      fileToMint: {},
      isUploadingIPFS: false,
      slashingMultiplier: 10,
      // FOR LAYOUT
      showConsole: false,
      showNavbar: false,
    };
  },
  watch: {
    fileToMint() {
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
      const totalDeals = await contract.methods.totalDeals().call();
      app.balance = await contract.methods.vault(app.account).call();
      app.balance = app.web3.utils.fromWei(app.balance);
      app.slashingMultiplier = parseInt(
        await contract.methods.slashing_multiplier().call()
      );

      app.log("Found " + totalDeals + " deals.");
      for (let k = 0; k <= totalDeals; k++) {
        const deal = await contract.methods.deals(k).call();
        if (deal.owner === app.account) {
          deal.index = k;
          deal.timestamp_end = deal.timestamp_start + deal.duration;
          const active_appeal = await contract.methods
            .active_appeals(deal.ipfs_hash)
            .call();
          if (active_appeal > 0) {
            app.log("Found appeal for deal, asking details..");
            const appeal = await contract.methods.appeals(active_appeal).call();
            const round = await contract.methods.getRound(active_appeal).call();
            appeal.round = round;
            deal.appeal = appeal;
          }
          app.deals.push(deal);
        } else {
          app.log("Not the owner of deal " + k);
        }
      }
      app.providers = [];
      app.referees = [];
      let ended = false;
      let i = 0;
      while (!ended) {
        try {
          const provider = await contract.methods.active_providers(i).call();
          if (app.providers.indexOf(provider) === -1) {
            app.providers.push(provider);
            app.log("Found provider " + provider);
            const providerDetails = await contract.methods
              .providers(provider)
              .call();
            app.connectSocket(providerDetails.endpoint);
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
      app.minDuration = parseInt(await contract.methods.min_duration().call());
      app.maxDuration = await contract.methods.max_duration().call();
      app.log("Min duration is: " + app.minDuration);
      app.log("Max duration is: " + app.maxDuration);
      app.loading = false;
    },
    async uploadFile() {
      const app = this;
      if (app.fileToMint.name && !app.isUploadingIPFS) {
        app.isUploadingIPFS = true;
        const formData = new FormData();
        formData.append("file", app.fileToMint);
        axios({
          method: "post",
          url: app.infuraURL,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data;",
          },
        }).then(function (response) {
          app.dealHash = response.data.Hash;
          app.isUploadingIPFS = false;
        });
      } else {
        alert("Select a file first!");
      }
    },
    async createDealProposal() {
      const app = this;
      if (!app.isWorking) {
        if (
          parseInt(app.dealDuration) >= parseInt(app.minDuration) &&
          parseInt(app.dealDuration) <= parseInt(app.maxDuration) &&
          app.dealHash.length > 0 &&
          app.dealValue > 0 &&
          app.dealProviders.length > 0
        ) {
          const maximumCollateral = app.slashingMultiplier * app.dealValue;
          if (
            parseInt(app.dealCollateral) < parseInt(maximumCollateral) &&
            parseInt(app.dealCollateral) >= parseInt(app.dealValue)
          ) {
            app.isWorking = true;
            app.workingMessage = "Please confirm action with metamask..";
            try {
              const contract = new app.web3.eth.Contract(app.abi, app.contract);
              await contract.methods
                .createDealProposal(
                  app.dealHash,
                  app.dealDuration,
                  app.web3.utils.toWei(app.dealCollateral, "gwei"),
                  [app.dealProviders]
                )
                .send({
                  value: app.web3.utils.toWei(app.dealValue, "gwei"),
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
                });

              this.$toast("Deal proposal created!", {
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
              app.showCreate = false;
              app.dealHash = "";
              app.dealDuration = "";
              app.dealValue = "";
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
              app.log(app.workingMessage);
            });
          alert("Appeal created!");
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
        // this.$toast(
        //   ("Appeal:", message.appeal, "Received:", message.received),
        //   {
        //     position: "top-right",
        //     timeout: 5000,
        //     closeOnClick: true,
        //     pauseOnFocusLoss: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     draggablePercent: 0.6,
        //     showCloseButtonOnHover: true,
        //     hideProgressBar: true,
        //     closeButton: "button",
        //     icon: "fa-solid fa-check",
        //     rtl: false,
        //   }
        // );
        app.log(JSON.parse(message));
        app.log("STASH, I'M HERE");
        console.log("STASH, I'M HERE");
      });
      socket.on("message", (message) => {
        app.$toast(JSON.parse(message), {
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
        app.log(JSON.parse(message));
        console.log("MESSAGE, I'M HERE");
      });
    },
    showToast() {
      this.$toast(
        '{"message":"{"signature":"0xd1cfa3c6a351c59c07748538ccc3838eac65218c4ef02ab89c0fb8e049b87a2716b2b6e001089235b41b52b4e13c1f7339f78b795f5ae6de72171787a7bf30ce1c","appeal":"10","received":false}","signature":"0xcc793e0713c7846476f865c8e19e5723551b25fb10edd149e5cdb2dfbe3b89a5527fb3abd113717a83420bd5934cd98b10a94799d6540b81d659e205964086721c"}',
        {
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
        }
      );
    },
  },
  mounted() {
    this.connect();
  },
};
</script>

<style>
.btn {
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
}
</style>
