<template>
  <div class="footer">
    <div class="container">
      <div v-if="!isMobile" class="row b-top">
        <div class="col-12 col-md-6 col-lg-6 pt-5"></div>
        <div class="col-3 col-md-2 col-lg-2 b-left px-0 pt-5"></div>
        <div class="col-3 col-md-2 col-lg-2 b-left px-0 pt-5"></div>
        <!-- <div class="col-3 col-md-2 col-lg-2 b-left px-0 pt-5"></div> -->
      </div>
      <div class="row negative-top" :class="{ 'px-5': isMobile }">
        <div class="col-12 col-md-6 col-lg-6" :class="{ 'mb-2': isMobile }">
          <div class="row">
            <div
              class="col-12 col-md-10 col-lg-8"
              :class="{ 'b-top pt-3 ps-0': isMobile }"
            >
              <h4>
                Retrieval Pinning is part of an interoperable ecosystem of
                on-chain storage products.
              </h4>
            </div>
          </div>
        </div>
        <div
          class="col-4 col-md-2 col-lg-2 px-0"
          :class="{ 'pt-3 b-top b-left': isMobile }"
        >
          <a href="/#/contributors" class="nav-link">Contributors</a>
        </div>
        <!-- <div
          class="col-4 col-md-2 col-lg-2 px-0"
          :class="{ 'pt-3 b-top b-left': isMobile }"
        >
          <a href="" class="nav-link">News</a>
        </div> -->
        <div
          class="col-4 col-md-2 col-lg-2 px-0"
          :class="{ 'pt-3 b-top b-left': isMobile }"
        >
          <a
            href="https://filecoinproject.slack.com/archives/C03CJKWP2DR"
            target="_blank"
            class="nav-link"
            >Slack</a
          >
        </div>
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
