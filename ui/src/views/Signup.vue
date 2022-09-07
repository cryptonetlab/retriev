<template>
  <div class="signup">
    <section class="hero">
      <div class="hero-body">
        <Navbar @hide="logState = false" />
        <!-- Logs button show/hide -->
        <div
          @click="logState = !logState"
          class="btn-sidebar position-bottom-right"
          :class="{ heartbeat: loading }"
        >
          <i class="fa-solid fa-terminal"></i>
        </div>
        <!-- END - Logs button show/hide -->

        <div v-if="account" class="container">
          <h1 class="title is-3 mb-0">Data retrievability Oracle</h1>
          <h3 class="title is-5">Signup as Provider</h3>
          <hr />
          <div class="columns is-multiline mt-5">
            <div class="column is-6 is-12-mobile">
              <div class="column is-12">
                <p class="mb-2">
                  Provider Endpoint*
                  <i
                    @click="infoModal = true"
                    class="fa-solid fa-circle-info pointer"
                  ></i>
                </p>
                <b-input
                  v-model="endpoint"
                  placeholder="Protocol_One"
                ></b-input>
                <p class="small" style="color: red">
                  {{ endpointError }}
                </p>
              </div>
              <div class="column is-12">
                <div class="is-flex is-align-items-baseline">
                  <p class="mb-2">Provider Name</p>
                  <p class="small ml-2">(optional)</p>
                </div>

                <b-input v-model="name" placeholder="Protocol_One"></b-input>
              </div>
              <div class="column is-12">
                <div class="is-flex is-align-items-baseline">
                  <p class="mb-2">E-mail</p>
                  <p class="small ml-2">(optional)</p>
                </div>
                <b-input
                  v-model="email"
                  placeholder="example@gmail.com"
                ></b-input>
              </div>
              <div v-if="!isSigningup" class="mt-5">
                <button class="button is-rounded is-dark" @click="signup()">
                  Sign Up
                </button>
              </div>
              <!-- <div class="mt-5" v-if="isWorking">{{ workingMessage }}</div> -->
            </div>
          </div>
        </div>
        <div
          class="container has-text-centered"
          v-if="!account"
          style="padding: 40vh 0"
        >
          <p class="title mb-0">
            Please connect your wallet first!<br /><br />
          </p>
          <div class="btn" @click="connect()">Connect Wallet</div>
        </div>
      </div>
    </section>
    <!-- Application Logs -->
    <Transition
      enter-active-class="slide-in-right"
      leave-active-class="slide-out-right"
    >
      <div v-if="logState" class="right-col" v-html="logs"></div>
    </Transition>
    <!-- END - Application Logs -->

    <!-- Modal Provider Info -->
    <b-modal
      v-model="infoModal"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-label="Example Modal"
      close-button-aria-label="Close"
      aria-modal
    >
      <template>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Provider Endpoint</p>
          </header>
          <section class="modal-card-body">
            <p>
              Please follow official repository instructions to deploy your
              provider node at:
              <a href="https://github.com/protocol/retriev"
                >https://github.com/protocol/retriev</a
              >.<br /><br />
              Endpoint is the public URI where the referee network can contact
              you to retrieve files
            </p>
          </section>
          <footer class="modal-card-foot">
            <b-button
              class="button is-rounded is-dark"
              label="Close"
              @click="infoModal = !infoModal"
            />
          </footer>
        </div>
      </template>
    </b-modal>
    <!-- END Modal Provider Info -->
  </div>
</template>

<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Navbar from "@/components/Navbar.vue";
import checkViewport from "@/mixins/checkViewport";
import axios from "axios";

const ABI = require("../abi.json");

export default {
  name: "Signup",
  mixins: [checkViewport],
  data() {
    return {
      // STATE
      logState: false,
      isSigningup: false,
      isSignup: false,
      isWorking: false,
      workingMessage: "",
      logs: "",
      endpointError: "",
      //MODAL
      infoModal: false,
      //LOGS
      loading: false,
      // FORM
      account: "",
      contract: process.env.VUE_APP_CONTRACT,
      infuraId: process.env.VUE_APP_INFURA_ID,
      network: process.env.VUE_APP_NETWORK,
      web3: "",
      abi: ABI,
      balance: 0,
      provider: "",
      endpoint: "",
      email: "",
      name: "",
    };
  },
  components: {
    Navbar,
  },
  mounted() {
    this.connect();
  },
  methods: {
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
      if (parseInt(netId) === parseInt(app.network)) {
        const accounts = await app.web3.eth.getAccounts();
        if (accounts.length > 0) {
          app.account = accounts[0];
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
    async signup() {
      const app = this;
      if (app.endpoint.length > 0) {
        try {
          app.isWorking = true;
          app.isSigningup = true;
          app.workingMessage = "Sign message on your wallet...";
          app.log("Sign message on your wallet...");
          const signature = await app.web3.eth.personal.sign(
            "Sign me as PLDR provider.",
            app.account
          );
          const isSignup = await axios.post(
            process.env.VUE_APP_API_URL + "/signup",
            {
              address: app.account,
              signature,
              endpoint: app.endpoint,
              name: app.name,
              email: app.email,
            }
          );
          app.workingMessage = "Registering as PLDR provider, please wait...";
          app.log("Registering as PLDR provider, please wait...");
          console.log("signature", signature);
          if (isSignup.data.message === "Provider exists yet") {
            app.showToast("Provider exists yet");
            app.log("Provider exists yet");
          } else {
            app.showToast("Pending transaction at:" + isSignup.data.tx.hash);
            app.log("Pending transaction at:" + isSignup.data.tx.hash);
            app.workingMessage =
              "Pending transaction at:" + isSignup.data.tx.hash;
          }

          app.isSignup = isSignup.data;
          if (app.isSignup.error === true) {
            app.isWorking = true;
            app.workingMessage = app.isSignup.message;
            app.isSigningup = false;
            // setTimeout(function () {
            //   window.location.reload();
            // }, 5000);
          } else {
            app.isWorking = false;
            app.workingMessage = "";
            console.log("signup data", app.isSignup);
            app.isSigningup = false;
            setTimeout(() => {
              if (isSignup.data.message === "Provided added correctly") {
                app.showToast("Provided added correctly!");
                app.log("Provided added correctly!");
              }
            }, 3000);
          }
        } catch (e) {
          alert(e.message);
          app.isWorking = true;
          app.workingMessage = e.message;
          app.showToast(e.message);
          app.log(e.message);
          setTimeout(function () {
            window.location.reload();
          }, 3000);
        }
      } else {
        app.endpointError = "Insert a correct Provider Endpoint";
        setTimeout(function () {
          app.endpointError = "";
        }, 5000);
      }
    },
    showToast(message) {
      const app = this;
      if (message.includes("Pending")) {
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
          icon: "fa-solid fa-stopwatch",
          rtl: false,
        });
      } else if (message.includes("yet")) {
        app.$toast.success(message, {
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
      } else if (message.includes("added")) {
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
      }
    },
  },
};
</script>
