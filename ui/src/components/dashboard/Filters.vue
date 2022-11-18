<template>
  <div
    class="column is-4-mobile is-3-tablet is-3-desktop"
    :class="{ 'has-text-right': !isMobile }"
  >
    <div class="custom_dropdown me-10-desktop" @mouseleave="filtered = false">
      <div
        class="custom_dropdown__face"
        :style="[
          filtered
            ? {
                borderBottom: 'none',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }
            : { top: '0px' },
        ]"
        @click="filtered = !filtered"
      >
        <div class="custom_dropdown__text">
          <span class="small mr-1">FILTER:</span>
          <span v-if="activeDeal"><b>Active</b></span>
          <span v-if="endedDeal !== undefined && endedDeal === true"
            ><b>Ended</b></span
          >
          <span v-if="showallDeals"><b>All</b></span>
          <i v-if="!filtered" class="ml-3 fa-solid fa-chevron-right"></i>
          <i v-if="filtered" class="ml-3 fa-solid fa-chevron-down"></i>
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
                $emit('filterAll')
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
                $emit('filterActive')
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
                $emit('filterEnded')
            "
          >
            Ended
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<script>
import checkViewport from "../../mixins/checkViewport";
export default {
  name: "filters",
  mixins: [checkViewport],
  data() {
    return {
      showallDeals: false,
      endedDeal: false,
      filtered: false,
      activeDeal: true,
    };
  },
};
</script>
