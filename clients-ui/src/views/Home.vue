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
                            @click="
                              openDeal(index);
                              openTimingDeal = false;
                            "
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
                                      class="b-top-colored-grey b-bottom-colored-grey bg-pink-light px-2"
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
                                      class="is-flex is-justify-content-space-between is-align-items-center b-bottom-colored-grey bg-pink-light px-2"
                                      :class="{
                                        'pb-1 pt-1': isTablet,
                                      }"
                                    >
                                      <div style="width: 100%">
                                        <p><b>Value:</b> {{ deal.value }}</p>
                                      </div>
                                      <div class="divider-small"></div>
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
                                      class="b-bottom-colored-grey bg-pink-light px-2"
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
                                      class="b-bottom-colored-grey bg-pink-light px-2"
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
                                        @click="
                                          openTimingDeal = !openTimingDeal
                                        "
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
                                              0 &&
                                            parseInt(deal.timestamp_start) !== 0
                                          "
                                        >
                                          <p>
                                            <b>Time remaining:</b> deal ended
                                          </p>
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
                                            {{
                                              returnDate(deal.timestamp_request)
                                            }}
                                          </p>
                                        </div>
                                        <div
                                          class="bg-pink-light px-2"
                                          v-if="
                                            parseInt(deal.timestamp_start) !== 0
                                          "
                                        >
                                          <p>
                                            <b>Deal start:</b>
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
                                          class="px-2"
                                        >
                                          <p>
                                            <b>Deal end:</b>
                                            {{ returnDate(deal.timestamp_end)
                                            }}<br />
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <!-- TIMING DEAL -->
                                    <div
                                      class=""
                                      v-if="
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
                                          <b style="color: white !important"
                                            >Appeal Status</b
                                          >
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
                                          <b>Round: </b>
                                          {{ deal.appeal.round }}/12
                                          <i
                                            class="fa-solid fa-hourglass-half fa-fade ml-2"
                                          ></i>
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
                                    <!-- CANCEL DEAL PROPOSAL -->
                                    <!-- <div v-if="!isWorking">
                                      <a
                                        href="#"
                                        v-if="
                                          deal.timestamp_start !== undefined &&
                                          parseInt(deal.timestamp_start) ===
                                            0 &&
                                          !deal.expired
                                        "
                                        @click="cancelDealProposal(deal)"
                                        >🗑️ cancel deal proposal</a
                                      >
                                    </div> -->
                                    <!-- CANCEL DEAL PROPOSAL -->
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
      openTimingDeal: false,
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

            const contract = new app.web3.eth.Contract(app.abi, app.contract);
            const appeal_index = await contract.methods
              .active_appeals(deal.deal_uri)
              .call();
            const round = await contract.methods.getRound(appeal_index).call();
            console.log(
              "deal " + deal.index + " with appeal index ",
              appeal_index + " have a round " + round
            );

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
            // Getting round appel

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
        console.log("deals", app.deals);

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

    async cancelDealProposal(deal) {
      const app = this;
      const index = deal.index;
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
            if (
              deal.timestamp_end * 1000 < new Date().getTime() &&
              deal.timestamp_start !== 0 &&
              parseInt(deal.timestamp_end) !== 604800
            ) {
              deal.canAppeal = false;
              deal.dealisEnded = true;
            } else {
              deal.dealisEnded = false;
            }

            // Check if deal is pending
            if (
              parseInt(deal.timestamp_start) === 0 &&
              deal.expired === false &&
              parseInt(deal.timestamp_end) === 604800
            ) {
              deal.dealPending = true;
            } else {
              deal.dealPending = false;
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
              if (
                deal.dealisEnded === true ||
                (deal.dealisEnded === true &&
                  deal.expired === true &&
                  !deal.dealPending)
              ) {
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
        setTimeout(async function () {
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
        }, 2000);
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
