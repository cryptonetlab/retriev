<template>
  <div class="custom-card p-0">
    <div
      class="card-header p-2 is-flex is-justify-content-space-between"
      :class="{ 'custom-card-hover': deal.index !== isOpen }"
    >
      <div class="is-flex is-align-items-center">
        <h4
          class="card-header-title"
          @click="toggleDeal()"
          style="cursor: pointer"
        >
          <span v-if="isDesktop">Retriev&nbsp;</span> Deal #{{ deal.index }}
        </h4>
        <!-- OLD CONTRACT DEAL BADGE -->
        <div v-if="deal.contract !== contract" class="badge badge-ended">
          <span>Read Only</span>
        </div>
        <!-- active badge -->
      </div>

      <!-- Deal action bar -->
      <div
        class="is-flex is-align-items-center is-justify-content-center is-flex-wrap-wrap"
      >
        <!-- create appeal button -->
        <b-button
          @click="createAppeal()"
          :disabled="
            deal.timestamp_start === 0 ||
            deal.provider === 'NOT_ACCEPTED' ||
            deal.contract !== contract ||
            deal.pending === true ||
            deal.ended === true ||
            (deal.appeal.active !== undefined && deal.appeal.active) ||
            isWorking
          "
          class="btn-tertiary btn-active"
        >
          <i class="fa-solid fa-bell mr-3"></i>REQUEST APPEAL
        </b-button>
        <div class="divider ml-4 mr-4"></div>

        <!-- BADGES -->
        <div>
          <div
            v-if="
              (parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 &&
                deal.appeal !== undefined &&
                deal.appeal.round === undefined) ||
              (parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 &&
                deal.appeal !== undefined &&
                deal.appeal.round !== undefined &&
                deal.appeal.round === 99 &&
                deal.appeal.slashed !== undefined &&
                deal.appeal.slashed === false)
            "
            class="badge badge-success"
          >
            <span>Active</span>
          </div>

          <!-- ended badge -->
          <div
            v-if="
              parseInt(deal.timestamp_end) - new Date().getTime() / 1000 < 0 &&
              !deal.canceled &&
              deal.timestamp_start > 0
            "
            class="badge badge-ended"
          >
            <span>Ended</span>
          </div>

          <!-- canceled badge -->
          <div v-if="deal.canceled" class="badge badge-ended">
            <span>Canceled</span>
          </div>

          <!-- pending badge -->
          <div
            v-if="
              deal.timestamp_start !== undefined &&
              parseInt(deal.timestamp_start) === 0 &&
              !deal.expired &&
              !deal.canceled
            "
            class="badge badge-pending"
          >
            <span>Pending</span>
          </div>

          <!-- appeal badge -->
          <div
            v-if="
              deal.appeal !== undefined &&
              deal.appeal.round !== undefined &&
              parseInt(deal.appeal.round) < 99 &&
              parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0
            "
            class="badge badge-requested"
          >
            <span>Appeal</span>
          </div>

          <!-- slashed badge -->
          <div
            v-if="
              deal.appeal !== undefined &&
              deal.appeal.round !== undefined &&
              deal.slashed !== undefined &&
              deal.slashed === true
            "
            class="badge badge-slashed"
          >
            <span>Slashed</span>
          </div>

          <!-- expired badge -->
          <div
            v-if="
              deal.timestamp_start !== undefined &&
              parseInt(deal.timestamp_start) === 0 &&
              deal.expired &&
              !deal.canceled
            "
            class="badge badge-expired"
          >
            <span>Expired</span>
          </div>
        </div>
        <!-- END BADGES -->

        <div class="divider ml-3 mr-3"></div>
        <div
          @click="
            toggleDeal();
            openTimingDeal = false;
          "
          class="card-header-icon mr-3 p-3"
          style="width: 35px"
        >
          <i v-if="deal.index !== isOpen" class="fa-solid fa-chevron-right"></i>
          <i v-if="deal.index === isOpen" class="fa-solid fa-chevron-down"></i>
        </div>
      </div>
      <!-- Deal action bar -->
    </div>

    <!-- DEAL SPECIFICATIONS -->
    <Transition
      name="custom-fade"
      enter-active-class="fade-in-top"
      leave-active-class="fade-out-top"
    >
      <div class="" v-show="isOpen === deal.index">
        <div class="card-content">
          <div class="content">
            <div class="columns is-mobile">
              <div class="column is-three-quarter-tablet is-half-desktop">
                <div>
                  <div
                    v-if="deal.data_uri !== undefined"
                    class="b-top-colored-grey b-bottom-colored-grey px-2"
                    :class="{
                      'pb-3 pt-3': isDesktop,
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <p>
                      <b>Data URI: </b>
                      <a
                        v-if="
                          providerEndpoints[deal.provider] !== undefined &&
                          deal.data_uri !== undefined
                        "
                        style="word-wrap: break-word"
                        class="link-primary"
                        :href="
                          providerEndpoints[deal.provider] +
                          '/ipfs/' +
                          deal.data_uri.replace('ipfs://', '')
                        "
                        target="_blank"
                        >{{ deal.data_uri }}</a
                      >
                      <a
                        v-if="
                          providerEndpoints[deal.provider] === undefined &&
                          deal.data_uri !== undefined
                        "
                        style="word-wrap: break-word"
                        class="link-primary"
                        :href="
                          'https://ipfs.io/ipfs/' +
                          deal.data_uri.replace('ipfs://', '')
                        "
                        target="_blank"
                        >{{ deal.data_uri }}</a
                      >
                    </p>
                    <!-- <h2>{{returnDate(deal.timestamp_end)}}</h2> -->
                  </div>
                  <div
                    class="is-flex is-justify-content-space-between is-align-items-center b-bottom-colored-grey px-2"
                    :class="{
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <p class="m-0"><b>Value:</b> {{ deal.value }}</p>

                    <div class="divider-small"></div>

                    <p class="m-0 has-text-right">
                      <b>Collateral:</b>
                      {{ deal.collateral }}
                    </p>
                  </div>
                  <div
                    class="b-bottom-colored-grey px-2"
                    :class="{
                      'pb-3 pt-3': isDesktop,
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <p><b>Canceled:</b> {{ deal.canceled }}</p>
                  </div>
                  <div
                    class="b-bottom-colored-grey px-2"
                    :class="{
                      'pb-3 pt-3': isDesktop,
                      'pb-1 pt-1': isTablet,
                    }"
                  >
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
                  <div
                    v-if="deal.appeal_requested !== undefined"
                    class="b-bottom-colored-grey px-2"
                    :class="{
                      'pb-3 pt-3': isDesktop,
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <p>
                      <b>Appeal Requested: </b>
                      {{ deal.appeal_requested }}/5
                    </p>
                  </div>
                  <div
                    class="b-bottom-colored-grey px-2"
                    :class="{
                      'pb-3 pt-3': isDesktop,
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <p>
                      <b>Referee network: </b>
                      <a
                        style="word-wrap: break-word"
                        class="link-primary"
                        @click="$emit('toggleSpec')"
                        target="_blank"
                        >Referee network #1</a
                      >
                    </p>
                  </div>
                  <!-- TIMING DEAL -->
                  <div
                    class="b-bottom-colored-grey"
                    :class="{ 'pb-3': openTimingDeal }"
                  >
                    <div
                      class="is-flex is-justify-content-space-between is-align-items-center px-2"
                      style="cursor: pointer"
                      :class="{
                        'pb-3 pt-3': isDesktop,
                        'pb-1 pt-1': isTablet,
                      }"
                      @click="openTimingDeal = !openTimingDeal"
                    >
                      <div
                        v-if="
                          parseInt(deal.timestamp_end) -
                            new Date().getTime() / 1000 >
                          0
                        "
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
                          0
                        "
                      >
                        <p>
                          <b>Deal Timing</b>
                        </p>
                      </div>
                      <div
                        v-if="
                          parseInt(deal.timestamp_end) -
                            new Date().getTime() / 1000 <
                            0 && parseInt(deal.timestamp_start) !== 0
                        "
                      >
                        <p><b>Time remaining:</b> deal ended</p>
                      </div>
                      <i
                        v-if="!openTimingDeal"
                        class="fa-solid fa-chevron-right"
                      ></i>
                      <i
                        v-if="openTimingDeal"
                        class="fa-solid fa-chevron-down"
                      ></i>
                    </div>
                    <div v-show="openTimingDeal">
                      <div class="px-2">
                        <p>
                          <b>Deal request:</b>
                          {{ returnDate(deal.timestamp_request) }}
                        </p>
                      </div>
                      <div
                        class="px-2"
                        v-if="parseInt(deal.timestamp_start) !== 0"
                      >
                        <p>
                          <b>Deal start:</b>
                          {{ returnDate(deal.timestamp_start) }}<br />
                        </p>
                      </div>
                      <div
                        v-if="
                          parseInt(deal.timestamp_end) -
                            new Date().getTime() / 1000 >
                          0
                        "
                        class="px-2"
                      >
                        <p>
                          <b>Deal end:</b>
                          {{ returnDate(deal.timestamp_end) }}<br />
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- TIMING DEAL -->

                  <div
                    class=""
                    v-if="
                      deal.appeal !== undefined &&
                      deal.appeal.round !== undefined &&
                      parseInt(deal.appeal.round) < 99
                    "
                  >
                    <div
                      class="container-appeal b-bottom-colored-grey bg-primary-color px-2"
                      :class="{
                        'pb-3 pt-3': isDesktop,
                        'pb-1 pt-1': isTablet,
                      }"
                    >
                      <p>
                        <b style="color: white !important">Appeal Status</b>
                      </p>
                    </div>
                    <div
                      v-if="
                        deal.appeal !== undefined &&
                        deal.appeal.round !== undefined
                      "
                      class="b-bottom-colored-grey px-2"
                      :class="{
                        'pb-3 pt-3': isDesktop,
                        'pb-1 pt-1': isTablet,
                      }"
                    >
                      <p>
                        <b>Round: </b>
                        {{ deal.appeal.round }}/12
                        <i class="fa-solid fa-hourglass-half fa-fade ml-2"></i>
                      </p>
                    </div>
                    <div
                      class="b-bottom-colored-grey px-2"
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
                  <div class="is-flex align-items-center mt-5">
                    <!-- Check NFT BUTTON -->
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
                          parseInt(deal.timestamp_start * 1000) === 0 ||
                          deal.contract !== contract
                        "
                        class="btn-tertiary"
                      >
                        Check NFT
                      </b-button>
                    </a>
                    <!-- Download file button -->
                    <b-button
                      @click="
                        downloadFile(
                          providerEndpoints[deal.provider] +
                            '/ipfs/' +
                            deal.data_uri.replace('ipfs://', '')
                        )
                      "
                      :disabled="
                        new Date().getTime() >
                          parseInt(deal.timestamp_end * 1000) ||
                        parseInt(deal.timestamp_start * 1000) === 0
                      "
                      class="btn-tertiary ml-3"
                    >
                      <i class="fa-solid fa-download mr-3"></i>Download File
                    </b-button>
                    <!-- Cancel Deal button -->
                    <b-button
                      v-if="deal.pending"
                      class="btn-tertiary ml-3"
                      @click="isDeletingDeal()"
                    >
                      <i class="fa-solid fa-trash-can mr-3"></i> Cancel Deal
                    </b-button>
                  </div>
                </div>
              </div>
              <div class="column is-one-quarter-tablet is-half-desktop">
                <div
                  v-if="!download"
                  class="box-img"
                  style="background-image: url(../assets/img/no-avail.png)"
                ></div>
                <div v-if="download" class="box-img">
                  <img
                    v-if="deal.data_uri !== undefined"
                    :src="
                      providerEndpoints[deal.provider] +
                      '/ipfs/' +
                      deal.data_uri.replace('ipfs://', '')
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- END DEAL SPECIFICATIONS -->
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

import axios from "axios";

export default {
  name: "Deal",
  mixins: [checkViewport],
  props: [
    "abi",
    "apiEndpoint",
    "storedDeal",
    "opensea",
    "contract",
    "account",
    "web3",
    "providerEndpoints",
    "index",
  ],
  data() {
    return {
      openTimingDeal: false,
      download: false,
      isOpen: -1,
      isWorking: false,
      deal: {},
    };
  },
  mounted() {
    const app = this;
    app.deal = app.storedDeal;
    if (app.deal.appeal === undefined) {
      app.deal.appeal = {};
    }
  },
  methods: {
    async toggleDeal() {
      const app = this;
      app.download = false;
      console.log("isOpen start", app.isOpen);
      if (app.isOpen === app.deal.index) {
        app.isOpen = -1;
      } else {
        app.isOpen = app.deal.index;
        app.refreshDeal();
        const providers = await axios.get(app.apiEndpoint + "/providers");
        for (let k in providers.data) {
          app.providerEndpoints[providers.data[k].address] =
            providers.data[k].endpoint;
        }
        // Fix needed to be compatible to old contract
        if (app.deal.deal_uri === undefined) {
          app.deal.deal_uri = app.deal.data_uri;
        }
        if (app.deal.data_uri === undefined) {
          app.deal.data_uri = app.deal.deal_uri;
        }

        const uri =
          app.providerEndpoints[app.deal.provider] +
          "/ipfs/" +
          app.deal.data_uri.replace("ipfs://", "");

        try {
          console.log("Downloading file from:", uri);
          const downloaded = await axios.get(uri);
          if (downloaded.data !== undefined) {
            // app.download[app.deal.deal_uri] = true;
            app.download = true;
            console.log("download became", app.download);
          }
        } catch (e) {
          console.log("Error while downloading from:", uri);
        }
        // Fetching appeal fee
        try {
          console.log("starting fetching appelFee");
          const contract = new app.web3.eth.Contract(app.abi, app.contract);
          const appeal_fee = await contract.methods
            .returnAppealFee(app.deal.index)
            .call();
          app.appealFee = appeal_fee;
          console.log("Appeal Fee is:", app.appealFee);
        } catch (e) {
          console.log("Error while calculating appel fee");
        }
        console.log("Opening deal", app.isOpen);
      }
    },
    async refreshDeal() {
      const app = this;
      console.log("Refreshing deal", app.deal);
      if (!app.isWorking) {
        app.$buefy.toast.open({
          duration: 50000,
          message:
            '<i class="fa-solid fa-hourglass-half"></i> ' +
            ` Deal ID #` +
            app.deal.index +
            ` information is refreshing...`,
          position: "is-bottom-right",
          type: "is-warning",
        });
        console.log(
          "PARSE ENDPOINT",
          app.apiEndpoint + "/parse/" + app.deal.contract + "/" + app.deal.index
        );
        try {
          let refreshed = await axios.get(
            app.apiEndpoint +
              "/parse/" +
              app.deal.contract +
              "/" +
              app.deal.index
          );
          console.log("refreshed", refreshed.data);
          app.deal = refreshed.data;

          //Check active deal
          if (
            (parseInt(app.deal.timestamp_end) - new Date().getTime() / 1000 >
              0 &&
              app.deal.appeal !== undefined &&
              app.deal.appeal.round === undefined) ||
            (parseInt(app.deal.timestamp_end) - new Date().getTime() / 1000 >
              0 &&
              app.deal.appeal !== undefined &&
              app.deal.appeal.round !== undefined &&
              app.deal.appeal.round === 99 &&
              app.deal.appeal.slashed !== undefined &&
              app.deal.appeal.slashed === false)
          ) {
            app.deal.status_active = true;
          } else {
            app.deal.status_active = false;
          }

          // Check Pending deal
          if (
            app.deal.timestamp_start !== undefined &&
            parseInt(app.deal.timestamp_start) === 0 &&
            !app.deal.canceled
          ) {
            app.deal.pending = true;
            app.deal.canAppeal = false;
          } else {
            app.deal.pending = false;
          }

          app.$toast.clear();
          this.$buefy.toast.open({
            duration: 5000,
            message:
              `<i class="fa-solid fa-file-invoice"></i>` +
              ` Deal ID #` +
              app.deal.index +
              ` information refreshed`,
            position: "is-bottom-right",
            type: "is-warning",
          });
          app.$forceUpdate();
        } catch (e) {
          app.$emit("alert", e.message);
        }
      } else {
        console.log("Working, please wait..");
      }
    },
    async createAppeal() {
      const app = this;
      const index = app.deal.index;
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
          .active_appeals(app.deal.data_uri)
          .call();
        const round = await contract.methods.getRound(active_appeal).call();
        console.log("active appeal is:", active_appeal);
        console.log("round is:", round);
        if (parseInt(round) === 99 || parseInt(round) === 0) {
          app.workingMessage = "Please confirm action with metamask..";
          try {
            const fee = await contract.methods.returnAppealFee(index).call();
            console.log("Fee needed for appeal is: " + fee);
            const gasPrice = await app.web3.eth.getGasPrice();
            await contract.methods
              .createAppeal(index)
              .send({
                value: fee,
                from: app.account,
                gasPrice,
              })
              .on("transactionHash", (tx) => {
                app.workingMessage =
                  "Found pending transaction at " +
                  tx.substr(0, 4) +
                  "..." +
                  tx.substr(-4);
                this.$toast.warning("Found pending transaction at:" + tx, {
                  position: "top-right",
                  timeout: 500000,
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
                console.log(app.workingMessage);
              });
            app.$toast.clear();
            app.$toast("Appeal created!", {
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
            setTimeout(function () {
              app.refreshDeal();
            }, 30000);
          } catch (e) {
            app.isWorking = false;
            app.workingMessage = "";
            app.$emit("alert", e.message);
          }
        } else {
          app.isWorking = false;
          app.workingMessage = "";
          app.$emit(
            "alert",
            "You can't create appeal, there's an active appeal for this URI yet."
          );
        }
      } else {
        app.isWorking = false;
        app.workingMessage = "";
        app.$emit(
          "alert",
          "You can't create appeal, max appeal for this file is reached"
        );
      }
    },
    isDeletingDeal() {
      const app = this;
      const index = app.deal.index;
      this.$buefy.dialog.confirm({
        title: "Deleting Deal #" + index,
        message:
          "Are you sure you want to <b>delete</b> this Deal? This action cannot be undone.",
        confirmText: "Delete Deal",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => app.cancelDealProposal(),
      });
    },
    async cancelDealProposal() {
      const app = this;
      const index = app.deal.index;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Please confirm action with metamask..";
        console.log("cancel deal number", index);
        try {
          const contract = new app.web3.eth.Contract(app.abi, app.contract);
          await contract.methods
            .cancelDealProposal(index)
            .send({
              from: app.account,
            })
            .on("transactionHash", (tx) => {
              app.workingMessage = "Found pending transaction at " + tx;
              console.log(app.workingMessage);
            });
          app.$emit("alert", "Deal proposal canceled!");
          app.isWorking = false;
          app.refreshDeal();
        } catch (e) {
          app.isWorking = false;
          app.$emit("alert", e.message);
        }
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
        app.$emit("alert", "Can't retrieve file!");
        app.isWorking = false;
        app.workingMessage = "";
      }
    },
  },
};
</script>
