<template>
  <!-- Pending Deals -->
  <div class="bordered mb-5" v-if="!foundDeal">
    <div class="deal-container py-0">
      <div class="card-header p-2 is-flex is-justify-content-space-between">
        <div class="is-flex is-align-items-center">
          <h4 class="card-header-title py-0">Waiting for deal creation...</h4>
          <!-- active badge -->
        </div>
        <div
          class="is-flex is-align-items-center is-justify-content-center is-flex-wrap-wrap"
        >
          <div class="divider ml-4 mr-4"></div>

          <!-- BADGES -->
          <div>
            <!-- pending badge -->
            <div class="badge badge-pending" style="width: auto">
              <span>Pending Transaction</span>
            </div>
          </div>
          <!-- END BADGES -->
        </div>
        <!-- Deal action bar -->
      </div>
    </div>
  </div>
  <!-- END | Pending Deals -->
</template>

<script>
export default {
  name: "pendingDeal",
  props: ["foundDeal"],
};
</script>
