<template>
  <div>
    <Header />
    <div class="home">
      <div class="container mt-5">
        <div class="row justify-content-center">
          <h2 class="mb-4 text-center">
            Select a function that you want to run:
          </h2>
          <div class="col-12 col-md-10 col-lg-5" style="padding-bottom: 100px">
            <a href="/#/manage-referees">
              <div class="cardbox text-center">
                <h3>Manage Referees</h3>
              </div>
            </a>
            <a href="/#/manage-providers">
              <div class="cardbox text-center">
                <h3>Manage Providers</h3>
              </div>
            </a>
            <a href="/#/manage-vault">
              <div class="cardbox text-center">
                <h3>Manage Vault</h3>
              </div>
            </a>
            <a href="/#/withdraw">
              <div class="cardbox text-center">
                <h3>Withdraw</h3>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Header from "@/components/Header.vue";

// CONTRATTO DI TEST SUITE RINKEBY ATTUALMENTE IN PRODUZIONE= 0x3c3Ef0954Df42a123C4C716CB94403b1C50D2eCa
// CONTRATTO DI TEST SUITE RINKEBY NUOVO= 0xFFb10958173508Cece1C41F4FFc6cbbc286009c4

const ABI = require("../abi.json");

export default {
  name: "Home",
  components: {
    Header,
  },
  data() {
    return {
      isMinting: "",
      networks: {
        ethereum: 1,
        rinkeby: 4,
        polygon: 137,
        mumbai: 80001,
        ganache: 5777,
      },
      abi: ABI,
      account: "",
      network: process.env.VUE_APP_NETWORK,
      contract: process.env.VUE_APP_CONTRACT_ADDRESS,
      explorerUrl: "https://etherscan.io/tx/",
      pending: "",
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
      // Checking if networkId matches
      const netId = await app.web3.eth.net.getId();
      if (parseInt(netId) !== app.networks[app.network]) {
        alert("Switch to " + app.network + " network!");
      } else {
        const accounts = await app.web3.eth.getAccounts();
        if (accounts.length > 0) {
          app.balance = await app.web3.eth.getBalance(accounts[0]);
          app.account = accounts[0];
          app.balance = parseFloat(
            app.web3.utils.fromWei(app.balance, "ether")
          ).toFixed(10);
        }
      }
    },
  },
};
</script>
