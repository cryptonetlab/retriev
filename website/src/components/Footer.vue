<template>
  <div class="footer">
    <div
      v-if="!isMobile"
      class="row justify-content-end b-top"
      :class="{ 'negative-left': isMobile }"
    >
      <div class="col-12 col-md-8 col-lg-8 pt-5"></div>
      <div class="col-4 col-md-2 col-lg-2 b-left px-0 pt-5"></div>
      <div class="col-4 col-md-2 col-lg-2 b-left px-0 pt-5"></div>
    </div>
    <div
      class="row justify-content-end negative-top"
      :class="{ 'negative-left': isMobile }"
    >
      <div class="col-12 col-md-8 col-lg-8" :class="{ 'mb-4': isMobile }">
        <div class="row">
          <div
            class="col-12 col-md-10 col-lg-6"
            :class="{ 'b-top pt-4': isMobile }"
          >
            <h4>
              Retrieval Pinning is part of an interoperable ecosystem of
              on-chain storage products.
            </h4>
          </div>
        </div>
      </div>
      <div
        class="col-6 col-md-2 col-lg-2 px-0"
        :class="{ 'pt-4 b-top b-left': isMobile }"
      >
        <a href="/#/contributors" class="nav-link">Contributors</a>
      </div>
      <div
        class="col-6 col-md-2 col-lg-2 px-0"
        :class="{ 'pt-4 b-top b-left': isMobile }"
      >
        <a href="" class="nav-link">News</a>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Footer",
  components: {},
  mixins: [checkViewport],
};
</script>
