<template>
  <div class="custom-card p-0">
    <div
      class="card-header p-2"
      :class="{ 'custom-card-hover': deal.index !== isOpen }"
    >
      <h4
        class="card-header-title"
        @click="toggleDeal()"
        style="cursor: pointer"
      >
        Retrieval Pinning Deal #{{ deal.index }}
      </h4>

      <!-- Deal action bar -->
      <div
        class="is-flex is-align-items-center is-justify-content-center is-flex-wrap-wrap"
      >
        <!-- create appeal button -->
        <b-button
          @click="createAppeal()"
          :disabled="isWorking"
          class="btn-tertiary btn-active"
        >
          <i class="fa-solid fa-bell mr-3"></i>REQUEST APPEAL
        </b-button>
        <div class="divider ml-4 mr-4"></div>

        <!-- download file button -->
        <b-button
          @click="
            downloadFile(
              providerEndpoints[deal.provider] +
                '/ipfs/' +
                deal.deal_uri.replace('ipfs://', '')
            )
          "
          :disabled="
            new Date().getTime() > parseInt(deal.timestamp_end * 1000) ||
            parseInt(deal.timestamp_start * 1000) === 0
          "
          class="btn-icon"
        >
          <i class="fa-solid fa-download"></i>
        </b-button>
        <div class="divider ml-4 mr-4"></div>

        <a
          :class="{
            'no-pointer': parseInt(deal.timestamp_start * 1000) === 0,
          }"
          :href="opensea + '/' + contract + '/' + deal.index"
          target="_blank"
        >
          <b-button
            :disabled="parseInt(deal.timestamp_start * 1000) === 0"
            class="btn-icon svg-icon"
          >
            <svg
              version="1.1"
              id="Livello_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 192 192"
              style="enable-background: new 0 0 192 192"
              xml:space="preserve"
            >
              <g>
                <g>
                  <path
                    class="st0"
                    d="M9.2,95.8c0-11.3,0.1-22.6,0-34c0-4.2,1-8,2.7-11.8c1.1-2.5,2.6-4.7,4.5-6.6c0.6-0.6,66.8-40.1,68.9-41.1
			c2.2-1,4.5-1.8,6.9-1.9C93,0.4,93.8,0,94.6,0c1.6-0.1,3.1,0.1,4.7,0.4c1.4,0.3,2.8,0.5,4.3,0.9c1.7,0.4,3.2,1.1,4.6,1.9
			c1.4,0.7,61.3,34.9,64.1,37.2c3.9,3.2,6.6,7.3,8.8,11.8c-0.1,2,1.5,3.7,1.1,5.7c1,2.6,0.5,5.3,0.5,8c0,21.5,0,43.1,0,64.6
			c0,1.3-0.3,2.6-0.5,3.9c-0.2,1.3-0.7,2.5-0.9,3.7c-0.2,1.7-1.2,3-1.7,4.5c-0.7,1.8-1.8,3.3-3,4.7c-1.9,2.1-3.9,4.1-6.3,5.7
			c-3.3,2.3-59.6,35-62.2,36.2c-2.6,1.2-5.4,2-8.3,2.4c-1.7,0.2-3.3,0.6-4.9,0.4c-3.8-0.4-7.6-1.1-11.1-2.9
			c-4.6-2.3-8.9-5.1-13.3-7.6c-2.4-1.4-39.5-23-42.1-24.4c-4.8-3-9.7-5.8-13.5-10.2c-1.7-2-3.5-5.5-4.5-8.9
			c-0.6-2.1-1.1-4.3-1.1-6.5C9.3,119.5,9.2,107.7,9.2,95.8z M46.3,103.6c0.8,2.3,1.5,4.7,2.3,7c1.8,5.4,3.6,10.8,5.4,16.3
			c1.6,4.8,2.8,9.6,4.7,14.3c1.4,3.6,4,4.8,7.8,3.6c0.7-0.2,1.4-0.3,2-0.9c1.7-1.6,2.5-3.6,2.5-5.9c0-27.9,0-55.8,0-83.7
			c0-0.3-0.1-0.9-0.1-1.2c-0.4-1.8-0.9-3.5-2.4-4.9c-1.5-1.5-5.2-1.7-6.7-0.7c-1.9,1.2-3.2,2.7-3.2,5.2c0.1,15.5,0,30.9,0,46.4
			c-0.7,0.2,0.2,0-0.6,0.1c-0.7-1.7-1.3-3.3-1.9-5c-1.9-5.7-3.6-11.4-5.8-16.9c-1.4-3.7-2.4-7.6-3.7-11.3c-0.7-1.9-1.3-3.8-2.9-5.2
			c-1.7-1.5-4.7-2-6.7-0.9c-2,1.1-3.3,2.6-3.3,5.1c0.1,15.4,0,57.1,0,62.5c0,0.7,0,5.4,6.3,5.5c5.9,0.1,6-4.4,6-7.7
			C46.3,118,46.3,110.8,46.3,103.6z M95.8,45c3.1,1.6,5.9,2.9,8.5,4.5c2.4,1.5,4.6,1.7,7.1,0c1.1-0.7,1.9-1.6,2.3-2.7
			c0.4-1.2,0.8-2.3,0.1-3.7c-0.7-1.5-0.9-2.4-2.2-3.4c-3-2.2-6.3-3.8-9.5-5.8c-2.8-1.7-5.7-3.3-8.5-5c-2.5-1.6-5.2-2-7.8-0.2
			c-1.5,1-2.6,2.1-2.6,4.3c0.1,39.5,0.1,79.1,0,118.6c0,1.7,0.5,3,1.7,4.2c1,1,2.1,1.5,3.3,1.9c1,0.3,2.5,0.1,3.2-0.1
			c0.2-0.1,0.9-0.5,1.1-0.7c2.3-1.9,3.1-4.2,3.1-7.3c-0.1-14.9,0-29.8,0-44.8c0-0.8,0-1.7,0-2.6c3.8,0,7.5,0.1,11.2,0
			c1.2,0,2.6-0.1,3.5-0.7c1.3-0.8,2.5-2,3.1-3.5c0.6-1.3,0.4-2.6,0.1-4c-0.6-2.3-3-4.1-5.3-4.1c-3,0-5.9,0-8.9,0c-1.3,0-2.5,0-3.8,0
			V45z M145.1,73.1c1.9,1.1,3.6,1.9,5.2,2.9c2.5,1.5,5.4,2.1,8.1-0.5c0.6-0.6,1.3-1.3,1.6-1.9c0.5-1.3,0.8-3,0.2-4.9
			c-0.8-1.9-1.6-2.2-3.2-3.3c-1.8-1.3-3.8-2.4-5.8-3.4c-3.3-1.7-6.4-3.7-9.7-5.4c-1.7-0.9-3.5-1.9-5.1-2.9c-2.4-1.5-4.8-2.8-7.3-4
			c-2-1-3.4-1.1-5.1-0.2c-1.4,0.7-2.6,1.6-3.2,3.4c-0.3,1-0.2,1.8-0.3,2.7c-0.3,2.5,1.2,4.1,3.1,5.2c2.3,1.4,4.6,2.6,7.1,3.8
			c1.4,0.6,2.2,2,2.2,3.5c-0.1,21.6,0,43.2,0,64.8c0,0.4,0,0.9,0,1.3c0,1.3,0.6,2.2,1.2,3c0.4,0.6,0.5,1,1.2,1.3
			c1.4,0.8,2.5,1,3.8,1c0.8,0,2-0.3,2.7-0.8c2.3-1.8,3.6-4.1,3.6-7.3c-0.1-18.5,0-37,0-55.5C145.1,74.9,145.1,74.1,145.1,73.1z"
                  />
                </g>
              </g>
            </svg>
          </b-button>
        </a>
        <div class="divider ml-4 mr-4"></div>
        <b-button
          :disabled="
            (deal.canceled !== undefined && deal.canceled === true) ||
            (deal.timestamp_start !== undefined && deal.timestamp_start !== 0)
          "
          class="btn-icon"
          @click="isDeletingDeal()"
        >
          <i class="fa-solid fa-trash-can"></i>
        </b-button>
        <div class="divider ml-4 mr-4"></div>

        <!-- BADGES -->
        <div>
          <!-- active badge -->
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
                    v-if="deal.deal_uri !== undefined"
                    class="b-top-colored-grey b-bottom-colored-grey bg-pink-light px-2"
                    :class="{
                      'pb-3 pt-3': isDesktop,
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <p>
                      <b>Deal URI: </b>
                      <a
                        v-if="providerEndpoints[deal.provider] !== undefined"
                        style="word-wrap: break-word"
                        class="link-primary"
                        :href="
                          providerEndpoints[deal.provider] +
                          '/ipfs/' +
                          deal.deal_uri.replace('ipfs://', '')
                        "
                        target="_blank"
                        >{{ deal.deal_uri }}</a
                      >
                      <a
                        v-if="providerEndpoints[deal.provider] === undefined"
                        style="word-wrap: break-word"
                        class="link-primary"
                        :href="
                          'https://ipfs.io/ipfs/' +
                          deal.deal_uri.replace('ipfs://', '')
                        "
                        target="_blank"
                        >{{ deal.deal_uri }}</a
                      >
                    </p>
                  </div>
                  <div
                    class="is-flex is-justify-content-space-between is-align-items-center b-bottom-colored-grey bg-pink-light px-2"
                    :class="{
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <div style="width: 100%">
                      <p><b>Value:</b> {{ deal.value }}</p>
                    </div>
                    <div class="divider-small"></div>
                    <div class="has-text-right" style="width: 100%">
                      <p>
                        <b>Collateral:</b>
                        {{ deal.collateral }}
                      </p>
                    </div>
                  </div>
                  <div
                    class="b-bottom-colored-grey bg-pink-light px-2"
                    :class="{
                      'pb-3 pt-3': isDesktop,
                      'pb-1 pt-1': isTablet,
                    }"
                  >
                    <p><b>Canceled:</b> {{ deal.canceled }}</p>
                  </div>
                  <div
                    class="b-bottom-colored-grey bg-pink-light px-2"
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
                    class="b-bottom-colored-grey bg-pink-light px-2"
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
                    class="b-bottom-colored-grey bg-pink-light px-2"
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
                    class="b-bottom-colored-grey bg-pink-light"
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
                        class="bg-pink-light px-2"
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
                      class="b-bottom-colored-grey bg-pink-dark px-2"
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
                      class="b-bottom-colored-grey bg-pink-dark px-2"
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
              <div class="column is-one-quarter-tablet is-half-desktop">
                <div
                  v-if="!download"
                  class="box-img"
                  style="background-image: url(../assets/img/no-avail.png)"
                ></div>
                <div v-if="download" class="box-img">
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
    this.deal = this.storedDeal;
    if (this.deal.appeal === undefined) {
      this.deal.appeal = {};
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
        const uri =
          app.providerEndpoints[app.deal.provider] +
          "/ipfs/" +
          app.deal.deal_uri.replace("ipfs://", "");
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
        app.isOpen = app.deal.index;
        console.log("Opening deal", app.isOpen);
        app.refreshDeal();
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
        try {
          let refreshed = await axios.get(
            process.env.VUE_APP_API_URL + "/parse/" + app.deal.index
          );
          console.log("refreshed", refreshed.data);
          app.deal = refreshed.data;
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
          .active_appeals(app.deal.deal_uri)
          .call();
        const round = await contract.methods.getRound(active_appeal).call();
        console.log("active appeal is:", active_appeal);
        console.log("round is:", round);
        if (parseInt(round) === 99 || parseInt(round) === 0) {
          app.workingMessage = "Please confirm action with metamask..";
          try {
            const fee = await contract.methods.returnAppealFee(index).call();
            console.log("Fee needed for appeal is: " + fee);
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
