<template>
  <div id="custom-footer">
    <div class="container-fluid pt-5 pb-5">
      <div class="row">
        <div class="col-8 col-lg-6">
          <div class="d-flex flex-column flex-lg-row align-items-start">
            <div class="inline">
              <h3>PROJECTNAME</h3>
            </div>
            <div>
              <p :class="{ 'ms-5': isDesktop }">
                Lorem ipsum UTXO full node timestamp server soft fork, miner,
                difficulty, segwit cryptocurrency.
              </p>
            </div>
          </div>
        </div>
        <div class="col-2 offset-1 col-lg-2 offset-lg-4">
          <ul>
            <li v-if="isMobile">
              <h3>LINKS</h3>
            </li>
            <li>
              <a href="">TEAM</a>
            </li>
            <li>
              <a href="">NEWS</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Footer",
  mixins: [checkViewport],
};
</script>
