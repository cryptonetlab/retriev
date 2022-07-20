<template>
  <section class="hero">
    <Transition enter-active-class="animate__animated animate__fadeInUp">
      <div v-if="account">
        <!-- Logs button show/hide -->
        <div
          v-if="expertMode"
          @click="logState = !logState"
          class="btn-sidebar position-bottom-right"
          :class="{ heartbeat: loading }"
        >
          <i class="fa-solid fa-terminal"></i>
        </div>
        <!-- END - Logs button show/hide -->

        <!-- HEADER SECTION -->
        <div class="header py-4" :class="{ 'px-3': !isDesktop }">
          <div class="container">
            <div
              class="columns is-mobile is-multiline is-vcentered is-justify-content-space-between"
            >
              <div class="column is-2-mobile is-3-tablet is-4-desktop">
                <div class="is-flex is-align-items-center">
                  <img src="../assets/img/logo.svg" alt="" />
                  <h2 v-if="!isMobile" class="pay-off tertiary-light-text ml-4">
                    Retrieval Pinning
                  </h2>
                </div>
              </div>
              <div class="column is-10-mobile is-9-tablet is-8-desktop">
                <div
                  class="is-flex is-align-items-center"
                  :class="{ 'is-justify-content-flex-end': !isMobile }"
                >
                  <b-dropdown v-model="currentNetwork" aria-role="list">
                    <template #trigger>
                      <b-button
                        :label="currentNetwork.text"
                        class="btn-light flex-force"
                        :icon-left="currentNetwork.icon"
                        icon-right="menu-down"
                      />
                    </template>

                    <b-dropdown-item
                      v-for="(network, index) in networks"
                      :key="index"
                      :value="network"
                      aria-role="listitem"
                    >
                      <div class="media">
                        <i class="media-left" :icon="network.icon"></i>
                        <div class="media-content">
                          <h3>{{ network.text }}</h3>
                        </div>
                      </div>
                    </b-dropdown-item>
                  </b-dropdown>
                  <div class="btn-light ml-2" style="cursor: default">
                    {{ accountBalance.substr(0, 4) }} ETH
                  </div>
                  <div
                    class="btn-light"
                    style="margin-left: -1px; cursor: default"
                  >
                    <i class="fa-solid fa-wallet mr-2"></i>
                    {{ account.substr(0, 4) + "..." + account.substr(-4) }}
                  </div>
                  <div class="ml-2">
                    <Navbar @hide="logState = false" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END | HEADER SECTION -->

        <!-- ALERT BANNER TESTNET -->
        <div class="alert-banner py-4" :class="{ 'px-3': !isDesktop }">
          <div class="container">
            <p>
              <i class="fa-solid fa-circle-exclamation mr-3"></i>
              <b
                >Retrieval Pinning is in testnet. This is an alpha version and
                storage is at your own risk.</b
              >
            </p>
          </div>
        </div>
        <!-- ALERT BANNER TESTNET -->

        <!-- PLATFORM START -->
        <div class="bg-color-light py-5" :class="{ 'px-3': !isDesktop }">
          <div class="container" :class="{ 'move-page': logState }">
            <div>
              <div v-if="!loading">
                <!-- Show all created deals -->
                <div v-if="!showCreate">
                  <!-- TITLE -->
                  <div class="b-top-colored-dark pt-3 mt-6 mb-5">
                    <h2 class="title is-3 m-0">
                      <span v-if="deals.length > 0">MANAGE </span>
                      <span v-if="deals.length <= 0">CREATE </span>YOUR DEALS
                    </h2>
                    <div
                      v-if="deals.length === 0"
                      class="mt-2"
                      style="width: 80%"
                    >
                      You have no active Deals or Proposal. Create a new one or
                      view the history of Deals you have created.
                    </div>
                  </div>
                  <!-- END TITLE -->

                  <!-- ACTION BAR (button create deal - searchbar - filters) -->
                  <div
                    class="columns is-mobile is-multiline is-vcentered mt-6 mb-5"
                  >
                    <div
                      class="column is-full-mobile is-4-tablet is-5-desktop is-6-widescreen is-6-fullhd"
                    >
                      <div class="btn-secondary" @click="showCreate = true">
                        <i class="fa-solid fa-file-medical mr-3"></i>create new
                        deal
                      </div>
                    </div>

                    <!-- SEARCH FUNCTION -->
                    <div
                      class="column is-full-mobile is-4-tablet is-4-desktop is-4-widescreen is-4-fullhd"
                    >
                      <div class="field">
                        <p class="control has-icons-left has-icons-right">
                          <input
                            class="input is-info"
                            type="email"
                            placeholder=" Search Deal URI"
                            v-model="searcher"
                            @keydown="startingSearch"
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
                      class="column is-full-mobile is-4-tablet is-3-desktop is-2-widescreen is-2-fullhd"
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
                                  activeDeals()
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
                  <!--TODO: complete this section deals -->
                  <div class="mt-6 mb-5" v-if="deals.length > 0">
                    <div
                      class="columns is-mobile is-multiline is-vcentered"
                      v-if="!isMobile"
                    >
                      <div
                        class="column is-full-mobile is-4-tablet is-6-desktop is-6-widescreen is-6-fullhd"
                      >
                        <h5 class="title-table">DEAL NAME</h5>
                      </div>
                      <div
                        class="column is-full-mobile is-4-tablet is-4-desktop is-4-widescreen is-4-fullhd"
                      >
                        <h5 class="title-table ml-5">ACTIONS</h5>
                      </div>
                      <div
                        class="column is-full-mobile is-4-tablet is-2-desktop is-2-widescreen is-2-fullhd"
                      >
                        <h5 class="title-table ml-5">STATUS</h5>
                      </div>
                    </div>

                    <!-- SINGLE DEAL -->
                    <b-collapse
                      v-for="deal in deals"
                      v-bind:key="deal.index"
                      :open="isOpen == deal.index"
                      @open="isOpen = deal.index"
                      class="card"
                      animation="slide"
                      :aria-id="'contentIdForA11y3' + deal.index"
                    >
                      <template #trigger="props">
                        <div
                          class="card-header"
                          role="button"
                          :aria-controls="'contentIdForA11y3' + deal.index"
                          :aria-expanded="props.open"
                        >
                          <p class="card-header-title">
                            Deal: #{{ deal.index }}
                          </p>
                          <div
                            class="is-flex is-align-items-center is-justify-content-center is-flex-wrap-wrap"
                          >
                            <b-button
                              class="btn-tertiary btn-active"
                              :disabled="
                                (deal.appeal.active === undefined &&
                                  parseInt(deal.timestamp_start) > 0 &&
                                  new Date().getTime() >
                                    parseInt(deal.timestamp_end * 1000)) ||
                                (deal.appeal.active !== undefined &&
                                  parseInt(deal.appeal.round) !== 99 &&
                                  new Date().getTime() >
                                    parseInt(deal.timestamp_end * 1000))
                              "
                            >
                              <i class="fa-solid fa-bell mr-3"></i>REQUEST
                              APPEAL
                            </b-button>
                            <div class="divider ml-4 mr-4"></div>
                            <div class="btn-icon">
                              <i class="fa-solid fa-download"></i>
                            </div>
                            <div class="divider ml-4 mr-4"></div>
                            <a
                              :href="
                                opensea + '/' + contract + '/' + deal.index
                              "
                              target="_blank"
                            >
                              <div class="btn-icon">
                                <i class="fa-solid fa-file-lines"></i>
                              </div>
                            </a>
                            <div class="divider ml-4 mr-4"></div>
                            <div
                              class="btn-icon"
                              @click="
                                selectedDeal = deal;
                                refreshDeal();
                              "
                            >
                              <i class="fa-solid fa-arrow-rotate-right"></i>
                            </div>
                            <div class="divider ml-4 mr-4"></div>
                            <!-- BADGES -->
                            <div
                              v-if="
                                parseInt(deal.timestamp_end) -
                                  new Date().getTime() / 1000 >
                                0
                              "
                              class="badge badge-success"
                            >
                              <span>Active</span>
                            </div>
                            <div
                              v-if="
                                parseInt(deal.timestamp_end) -
                                  new Date().getTime() / 1000 <
                                  0 && !deal.canceled
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
                                parseInt(deal.timestamp_start) === 0
                              "
                              class="badge badge-pending"
                            >
                              <span>Pending</span>
                            </div>
                            <div
                              v-if="
                                deal.appeal.round !== undefined &&
                                parseInt(deal.appeal.round) < 99
                              "
                              class="badge badge-slashed"
                            >
                              <span>Slahed</span>
                            </div>
                            <!-- END BADGES -->
                            <div class="divider ml-3 mr-3"></div>
                            <a class="card-header-icon mr-3">
                              <i
                                v-if="!props.open"
                                class="fa-solid fa-chevron-right"
                              ></i>
                              <i
                                v-if="props.open"
                                class="fa-solid fa-chevron-down"
                              ></i>
                            </a>
                          </div>
                        </div>
                      </template>

                      <div class="card-content">
                        <div class="content">
                          <div class="columns">
                            <div class="column is-half">
                              <div>
                                <div>
                                  <p>
                                    <b>Deal URI: </b>
                                    <a
                                      :href="
                                        deal.deal_uri.replace(
                                          'ipfs://',
                                          'https://dweb.link/ipfs/'
                                        )
                                      "
                                      target="_blank"
                                      >{{ deal.deal_uri }}</a
                                    >
                                  </p>
                                </div>
                                <div>
                                  <p><b>Value:</b> {{ deal.value }}</p>
                                </div>
                                <div>
                                  <p>
                                    <b>Collateral:</b> {{ deal.collateral }}
                                  </p>
                                </div>
                                <div>
                                  <p><b>Canceled:</b> {{ deal.canceled }}</p>
                                </div>
                                <div>
                                  <p><b>Provider:</b> {{ deal.provider }}</p>
                                </div>
                                <div>
                                  <p>
                                    <b>Timestamp request:</b>
                                    {{ deal.timestamp_request }}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <b>Timestamp start:</b>
                                    {{ deal.timestamp_start }}<br />
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <b>Timestamp end:</b> {{ deal.timestamp_end
                                    }}<br />
                                  </p>
                                </div>
                                <div>
                                  <p
                                    v-if="
                                      parseInt(deal.timestamp_end) -
                                        new Date().getTime() / 1000 >
                                      0
                                    "
                                  >
                                    <b>Time remaining:</b>
                                    {{
                                      parseInt(deal.timestamp_end) -
                                      new Date().getTime() / 1000
                                    }}<br />
                                  </p>
                                </div>
                                <p
                                  v-if="
                                    parseInt(deal.timestamp_end) -
                                      new Date().getTime() / 1000 <
                                    0
                                  "
                                >
                                  <b>Time remaining:</b> deal ended
                                </p>
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
                                      deal.appeal.round !== undefined &&
                                      parseInt(deal.appeal.round) < 99
                                    "
                                    >⌛ Processing round
                                    {{ deal.appeal.round }}, slashes are
                                    {{ deal.appeal.slashes }}.</a
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </b-collapse>
                    <!-- END | SINGLE DEAL -->
                  </div>
                  <!-- END | NEW SECTION DEALS -->

                  <!-- OLD DEALS VIEW -->
                  <div class="mt-5" v-if="deals.length > 0">
                    <div>
                      <div class="columns is-multiline">
                        <!-- SINGLE DEAL -->
                        <div
                          class="column is-12-mobile is-12-tablet is-6-desktop"
                          v-for="deal in deals"
                          v-bind:key="deal.index"
                        >
                          <div class="box-deals">
                            <div>
                              <div>
                                <p><b>Index:</b> {{ deal.index }}</p>
                              </div>
                              <div>
                                <p>
                                  <b>Deal URI: </b>
                                  <a
                                    :href="
                                      deal.deal_uri.replace(
                                        'ipfs://',
                                        'https://dweb.link/ipfs/'
                                      )
                                    "
                                    target="_blank"
                                    >{{ deal.deal_uri }}</a
                                  >
                                </p>
                              </div>
                              <div>
                                <p><b>Value:</b> {{ deal.value }}</p>
                              </div>
                              <div>
                                <p><b>Collateral:</b> {{ deal.collateral }}</p>
                              </div>
                              <div>
                                <p><b>Canceled:</b> {{ deal.canceled }}</p>
                              </div>
                              <div>
                                <p><b>Provider:</b> {{ deal.provider }}</p>
                              </div>
                              <div>
                                <p>
                                  <b>Timestamp request:</b>
                                  {{ deal.timestamp_request }}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <b>Timestamp start:</b>
                                  {{ deal.timestamp_start }}<br />
                                </p>
                              </div>
                              <div>
                                <p>
                                  <b>Timestamp end:</b> {{ deal.timestamp_end
                                  }}<br />
                                </p>
                              </div>
                              <div>
                                <p
                                  v-if="
                                    parseInt(deal.timestamp_end) -
                                      new Date().getTime() / 1000 >
                                    0
                                  "
                                >
                                  <b>Time remaining:</b>
                                  {{
                                    parseInt(deal.timestamp_end) -
                                    new Date().getTime() / 1000
                                  }}<br />
                                </p>
                              </div>

                              <p
                                v-if="
                                  parseInt(deal.timestamp_end) -
                                    new Date().getTime() / 1000 <
                                  0
                                "
                              >
                                <b>Time remaining:</b> deal ended
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
                                  (deal.appeal.active === undefined &&
                                    parseInt(deal.timestamp_start) > 0 &&
                                    new Date().getTime() <
                                      parseInt(deal.timestamp_end * 1000)) ||
                                  (deal.appeal.active !== undefined &&
                                    parseInt(deal.appeal.round) === 99 &&
                                    new Date().getTime() <
                                      parseInt(deal.timestamp_end * 1000))
                                "
                                @click="createAppeal(deal.index)"
                                >❌ create appeal</a
                              >
                              <a
                                href="#"
                                v-if="
                                  deal.appeal.round !== undefined &&
                                  parseInt(deal.appeal.round) < 99
                                "
                                >⌛Processing round {{ deal.appeal.round }},
                                slashes are {{ deal.appeal.slashes }}.</a
                              >
                              <div class="icon-opensea">
                                <a
                                  :href="
                                    opensea + '/' + contract + '/' + deal.index
                                  "
                                  target="_blank"
                                >
                                  <img
                                    src="../assets/opensea.svg"
                                    width="30"
                                    alt=""
                                  />
                                </a>
                              </div>
                              <div class="icon-refresh">
                                <i
                                  class="fa-solid fa-arrow-rotate-right"
                                  @click="
                                    selectedDeal = deal;
                                    refreshDeal();
                                  "
                                ></i>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- END SINGLE DEAL -->
                      </div>
                    </div>
                  </div>
                  <!-- END | OLD DEALS VIEW -->
                </div>
                <!-- END - Show all created deals -->

                <!-- SHOW CRATION DEAL -->
                <div v-if="showCreate">
                  <!-- TITLE -->
                  <div class="b-bottom-colored-dark pb-3 mt-5 mb-6">
                    <h2 class="title is-3 m-0">NEW DEAL PROPOSAL</h2>
                  </div>
                  <!-- END TITLE -->

                  <!-- BACK BUTTON AND EXPERT MODE SWITCH -->
                  <div
                    class="is-flex is-justify-content-space-between is-align-items-center mb-5"
                  >
                    <div class="btn-white" @click="showCreate = false">
                      <i class="fa-solid fa-arrow-left"></i> back
                    </div>
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
                  <b-field v-if="!fileToUpload.name">
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
                  <div v-if="expertMode" class="columns mt-6">
                    <div class="column">
                      <h5 class="mb-3">Appeal Address</h5>
                      <b-input
                        :disabled="isWorking"
                        v-model="appealAddress"
                        placeholder="ex: ipfs://CID"
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

                  <div class="columns mt-6">
                    <div class="column">
                      <div class="mb-5">
                        <h3 class="mb-3">Deal Duration</h3>
                        <b-input
                          v-model="dealDurationDays"
                          :disabled="isWorking"
                          placeholder="days"
                          type="number"
                        ></b-input>
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
                        <b-input
                          v-model="dealValue"
                          :disabled="isWorking"
                          placeholder="Payment in wei"
                        ></b-input>
                      </div>
                      <div class="mb-5">
                        <h5 class="mb-6">
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
                            :max="10000000000"
                            :step="1"
                            tooltip-always
                            v-model="dealCollateral"
                          ></b-slider>
                        </b-field>
                      </div>
                    </div>
                  </div>
                  <b-field
                    v-if="
                      parseInt(minDuration) > 0 && parseInt(maxDuration) > 0
                    "
                    label="Duration of deal in seconds"
                  >
                    <b-slider
                      :disabled="isWorking"
                      :min="parseInt(minDuration)"
                      :max="parseInt(maxDuration)"
                      :step="1"
                      v-model="dealDuration"
                    ></b-slider>
                  </b-field>

                  <!-- JUST FOR MVP, PROVIDER SHOULD BE A MULTISELECT -->
                  <b-field label="Select a provider">
                    <b-select
                      :disabled="isWorking"
                      v-model="dealProviders"
                      placeholder="Select a provider"
                    >
                      <option
                        v-for="provider in providers"
                        :value="provider.address"
                        :key="provider.address"
                      >
                        {{ provider.address }} ({{ provider.endpoint }})
                      </option>
                    </b-select>
                  </b-field>
                  <br />
                  <div
                    class="btn"
                    v-if="!isWorking"
                    @click="createDealProposal()"
                  >
                    Create deal proposal
                  </div>
                  <div v-if="isWorking">{{ workingMessage }}</div>
                </div>
                <!-- END - SHOW CRATION DEAL -->
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
              <div
                v-if="logState && expertMode"
                class="right-col"
                v-html="logs"
              ></div>
            </Transition>
            <!-- END - Application Logs -->

            <!-- Modal Payment in gwei -->
            <b-modal
              v-model="infoWei"
              has-modal-card
              trap-focus
              :destroy-on-hide="false"
              aria-role="dialog"
              aria-label="Payment in gwei"
              close-button-aria-label="Close"
              aria-modal
            >
              <template>
                <div class="modal-card" style="width: auto">
                  <header class="modal-card-head">
                    <p class="modal-card-title">Payment in gwei</p>
                  </header>
                  <section class="modal-card-body">
                    <p>Payment is the amount of tokens paid to the provider</p>
                  </section>
                  <footer class="modal-card-foot">
                    <b-button
                      class="button is-rounded is-dark"
                      label="Close"
                      @click="infoWei = !infoWei"
                    />
                  </footer>
                </div>
              </template>
            </b-modal>
            <!-- END Modal Modal Payment in gwei -->

            <!-- Modal Collateral in gwei -->
            <b-modal
              v-model="infoCollateral"
              has-modal-card
              trap-focus
              :destroy-on-hide="false"
              aria-role="dialog"
              aria-label="Collateral in gwei"
              close-button-aria-label="Close"
              aria-modal
            >
              <template>
                <div class="modal-card" style="width: auto">
                  <header class="modal-card-head">
                    <p class="modal-card-title">Collateral in gwei</p>
                  </header>
                  <section class="modal-card-body">
                    <p>
                      Collateral is locked down from the provider account.
                      Remeber that collateral needs to be ≥ Payment and ≤
                      1000*Payment
                    </p>
                  </section>
                  <footer class="modal-card-foot">
                    <b-button
                      class="button is-rounded is-dark"
                      label="Close"
                      @click="infoCollateral = !infoCollateral"
                    />
                  </footer>
                </div>
              </template>
            </b-modal>
            <!-- END Modal Modal Collateral in gwei -->
          </div>
        </div>
        <!-- PLATFORM END -->
      </div>
    </Transition>

    <!-- Connect Wallet container -->
    <Transition leave-active-class="animate__animated animate__fadeOutDown">
      <div v-if="!account" class="connect-container">
        <div class="logo">
          <img src="../assets/img/logo.svg" alt="" />
        </div>
        <h2 class="pay-off tertiary-light-text">Retrieval Pinning</h2>
        <div class="has-text-centered mt-5">
          <p class="mb-0">Please connect your wallet first</p>
          <div class="btn-primary mt-4" @click="connect()">
            <div class="btn-hovering"></div>
            <i class="fa-solid fa-wallet mr-3"></i> Connect Wallet
          </div>
        </div>
      </div>
    </Transition>
    <!-- END | Connect Wallet container -->
  </section>
</template>
<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Navbar from "@/components/Navbar.vue";

import checkViewport from "@/mixins/checkViewport";
import { io } from "socket.io-client";
const FormData = require("form-data");
const axios = require("axios");
const ABI = require("../abi.json");

export default {
  name: "Home",
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
      showCreate: false,
      isWorking: false,
      isToasting: false,
      workingMessage: "",
      minDuration: 3600,
      maxDuration: 42000,
      deals: [],
      providers: [],
      logs: "",
      dealUri: "",
      dealDuration: 3600,
      dealDurationDays: 1,
      dealCollateral: "",
      dealProviders: "",
      dealValue: "",
      abi: ABI,
      balance: 0,
      infuraURL: "https://ipfs.infura.io:5001/api/v0/add",
      networks: [
        { icon: "fa-solid fa-user-secret", text: "Rinkeby" },
        { icon: "fa-solid fa-user-secret", text: "Ethereum" },
        { icon: "fa-solid fa-user-secret", text: "Polygon" },
        { icon: "fa-solid fa-user-secret", text: "Mumbai" },
      ],
      currentNetwork: { icon: "fa-solid fa-user-secret", text: "Rinkeby" },
      fileToUpload: {},
      isUploadingIPFS: false,
      slashingMultiplier: 10,
      appealAddress: "",
      // REFRESH SINGLE DEAL
      selectedDeal: {},
      // FOR LAYOUT
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
      // JUST FOR TEST
      hardcodedPrice: 5,
    };
  },
  components: {
    Navbar,
  },
  watch: {
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
    dealDurationDays() {
      const app = this;
      if (app.dealDurationDays > 365) {
        app.dealDurationDays = 365;
      }
      if (app.dealDurationDays < 0) {
        app.dealDurationDays = 1;
      }
      app.dealValue =
        app.hardcodedPrice *
        app.dealDurationDays *
        86400 *
        app.fileToUpload.size;
      app.dealDuration = parseInt(app.dealDurationDays * 86400);
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
      try {
        app.isWorking = true;
        app.workingMessage = "Fetching your deals, please wait...";
        let deals = await axios.get(
          process.env.VUE_APP_API_URL + "/deals/" + app.account
        );
        app.isWorking = false;
        let keys = [];
        for (let k in deals.data) {
          let deal = deals.data[k];
          if (keys.indexOf(parseInt(deal.index)) === -1) {
            keys.push(parseInt(deal.index));
            app.deals.push(deal);
          }
        }
        app.log("Found " + app.deals.length + " deals.");
        console.log(app.deals);
        this.activeDeals();
      } catch (e) {
        alert("Can't fetch deals from blockchain, please retry!");
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
    async uploadFile() {
      const app = this;
      if (app.fileToUpload.name && !app.isUploadingIPFS) {
        app.isUploadingIPFS = true;
        const formData = new FormData();
        formData.append("file", app.fileToUpload);
        console.log("UPLOADED_FILE", app.fileToUpload);
        app.dealValue =
          app.hardcodedPrice * app.dealDuration * app.fileToUpload.size;
        axios({
          method: "post",
          url: app.infuraURL,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data;",
          },
        }).then(function (response) {
          app.dealUri = "ipfs://" + response.data.Hash;
          app.isUploadingIPFS = false;
        });
      }
    },
    async createDealProposal() {
      const app = this;
      if (!app.isWorking) {
        if (
          parseInt(app.dealDuration) >= parseInt(app.minDuration) &&
          parseInt(app.dealDuration) <= parseInt(app.maxDuration) &&
          app.dealUri.length > 0 &&
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
              const receipt = await contract.methods
                .createDealProposal(
                  app.dealUri,
                  app.dealDuration,
                  app.dealCollateral.toString(),
                  [app.dealProviders],
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
              const dealId =
                receipt.events?.DealProposalCreated?.returnValues?.index;
              if (dealId !== undefined) {
                console.log("DEAL_ID", dealId);
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
                app.workingMessage = "Waiting for API update..";
                setTimeout(async function () {
                  let updated = false;
                  while (!updated) {
                    const parsed = await axios.get(
                      process.env.VUE_APP_API_URL + "/parse/" + dealId
                    );
                    console.log("PARSED_API", parsed);
                    if (parsed.data.index !== undefined) {
                      updated = true;
                    }
                  }
                  app.loadState();
                  app.showCreate = false;
                  app.fileToUpload = "";
                  app.dealUri = "";
                  app.dealDuration = "";
                  app.dealValue = "";
                }, 2000);
              }
            } catch (e) {
              app.isWorking = false;
              alert(e.message);
            }

            setTimeout(async function () {
              app.isWorking = false;
              app.workingMessage = "";
              app.showCreate = false;
              app.loadState();
              app.fileToUpload = "";
              app.dealUri = "";
              app.dealDuration = "";
              app.dealValue = "";
            }, 2000);
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
            // TODO: Be sure accepted deal is yours
            // TODO: Read deal_index from contract
            app.showToast("Your deal proposal was accepted by provider!");
            app.log("Your deal proposal was accepted by provider!");
          } else if (
            action !== undefined &&
            action === "SLASHED" &&
            realMessage.owner.toLowerCase() === app.account.toLowerCase()
          ) {
            // TODO: Read deal_index from contract
            app.showToast("A provider was slashed!");
            app.log("A provider was slashed!");
          } else if (
            action !== undefined &&
            action === "UNRETRIEVALABLE" &&
            realMessage.owner.toLowerCase() === app.account.toLowerCase()
          ) {
            // TODO: Read deal_index from contract
            app.showErrorToast(
              "File is unretrievalable! Provider can't accept your deal proposal"
            );
            app.log(
              "File is unretrievalable! Provider can't accept your deal proposal"
            );
          }
        }
      } catch (e) {
        console.log("Error parsing message from socket");
        console.log(e);
      }
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
    async refreshDeal() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.log("Updating deal please wait..");
        app.$toast.warning("Updating deal please wait..", {
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
          icon: "fa-solid fa-hourglass",
          rtl: false,
        });
        try {
          let refresh = await axios.get(
            process.env.VUE_APP_API_URL + "/parse/" + app.selectedDeal._id
          );
          console.log("refreshed", refresh);
        } catch (e) {
          app.isWorking = false;
          alert(e.message);
        }
        app.isWorking = false;
        app.workingMessage = "";
      }
    },
    async expiredDeals() {
      const app = this;
      app.log("Checking expired deals...");
      console.log("Checking expired deals...");
      if (!app.isWorking) {
        app.isWorking = true;
        app.deals = [];
        try {
          let deals = await axios.get(
            process.env.VUE_APP_API_URL + "/deals/" + app.account
          );
          app.isWorking = false;
          let keys = [];
          for (let k in deals.data) {
            let deal = deals.data[k];
            if (keys.indexOf(parseInt(deal.index)) === -1) {
              if (
                parseInt(deal.timestamp_end) - new Date().getTime() / 1000 <
                0
              ) {
                keys.push(parseInt(deal.index));
                app.deals.push(deal);
              }
            }
          }
          console.log(app.deals);
        } catch (e) {
          alert("Can't fetch deals from blockchain, please retry!");
        }
      }
    },
    async activeDeals() {
      const app = this;
      console.log("Checking active deals...");
      app.log("Checking active deals...");
      if (!app.isWorking) {
        app.isWorking = true;
        app.deals = [];
        try {
          let deals = await axios.get(
            process.env.VUE_APP_API_URL + "/deals/" + app.account
          );
          app.isWorking = false;
          let keys = [];
          for (let k in deals.data) {
            let deal = deals.data[k];
            if (keys.indexOf(parseInt(deal.index)) === -1) {
              if (
                parseInt(deal.timestamp_end) - new Date().getTime() / 1000 >
                0
              ) {
                keys.push(parseInt(deal.index));
                app.deals.push(deal);
              }
            }
          }
          console.log(app.deals);
        } catch (e) {
          alert("Can't fetch deals from blockchain, please retry!");
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
          app.deals = deals.data;
          app.isWorking = false;
          console.log(app.deals);
        } catch (e) {
          alert("Can't fetch deals from blockchain, please retry!");
        }
      }
    },
    async searchDeals() {
      // const app = this;
      console.log("Searching all deals...");

      // if (!app.isWorking) {
      //   app.isWorking = true;
      //   app.deals = [];
      //   try {
      //     let deals = await axios.get(
      //       process.env.VUE_APP_API_URL + "/deals/" + app.account
      //     );
      //     app.deals = deals.data;
      //     app.isWorking = false;
      //     console.log(app.deals);
      //   } catch (e) {
      //     alert("Can't fetch deals from blockchain, please retry!");
      //   }
      // }
    },
    startingSearch() {
      const app = this;
      if (app.searcher !== undefined && app.searcher.length > 3) {
        // console.log("acitve watch", app.searcher);
        if (app.searchTimeout !== null && app.searchTimeout !== undefined) {
          clearTimeout(app.searchTimeout);
          // console.log("Clearing timeout", app.searchTimeout);
        }
        app.searchTimeout = setTimeout(function () {
          app.searchDeals();
          console.log("Start search", app.searcher);
        }, 500);
      }
    },
  },
  mounted() {
    this.connect();
  },
};
</script>

<style>
/* .btn {
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
} */
</style>
