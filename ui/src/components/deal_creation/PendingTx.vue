<template>
  <div v-if="isCreatingDeal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <div
          class="modal-header-button"
          @click="$emit('closeModalTx')"
          style="cursor: pointer;"
        >
          <i class="fa-solid fa-xmark"></i>
        </div>
        <h3><b>Deal Transaction</b></h3>
      </div>
      <div class="modal-content">
        <div class="pt-6">
          <b-steps
            v-model="activeStep"
            animated
            :rounded="false"
            :has-navigation="false"
          >
            <b-step-item
              type="is-info"
              step="1"
              icon-pack="fa"
              icon="check"
              label="Approve"
            >
              <div class="py-6">
                <div class="icon-status">
                  <img src="../../assets/img/icon1.svg" alt="" />
                </div>
                <h2 class="mt-4">
                  Confirm the transaction<br />
                  in your wallet.
                </h2>
              </div>
            </b-step-item>

            <b-step-item
              type="is-info"
              step="2"
              label="Pending"
              icon-pack="fa"
              icon="check"
            >
              <div class="py-6">
                <div class="icon-status">
                  <img src="../../assets/img/icon2.svg" alt="" />
                </div>
                <h2 class="mt-4 mb-4">
                  Creating your deal <br />
                  proposal, please wait...
                </h2>
                <a
                  class="color-light"
                  v-if="pendingTx !== undefined"
                  :href="explorer + pendingTx"
                  target="_blank"
                  >Pending transaction at:
                  {{
                    pendingTx.substr(0, -4) + "..." + pendingTx.substr(-4)
                  }}</a
                >
                <div class="mt-4">
                  <a href="/#/app" class="btn-white">Dashboard</a>
                </div>
              </div>
            </b-step-item>

            <b-step-item
              type="is-info"
              step="3"
              label="Completed"
              icon-pack="fa"
              icon="check"
            >
              <div class="py-6">
                <div class="icon-status">
                  <img src="../../assets/img/icon3.svg" alt="" />
                </div>
                <h2 class="mt-4 mb-4">
                  Deal created <br />
                  successfully
                </h2>
                <p class="color-light" v-if="receipt !== undefined">
                  Your payment is completed.
                </p>
                <div class="mt-4 mb-2">
                  <a href="/#/app" class="btn-white">Dashboard</a>
                </div>
                <a
                  style="text-decoration: underline"
                  v-if="receipt !== undefined"
                  :href="explorer + receipt"
                  target="_blank"
                  >View on explorer
                </a>
              </div>
            </b-step-item>
          </b-steps>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["isCreatingDeal", "activeStep", "pendingTx", "explorer", "receipt"],
};
</script>
