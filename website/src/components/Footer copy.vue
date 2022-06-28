<template>
  <div id="custom-footer">
    <div class="container-fluid pt-4">
      <div class="row justify-content-between">
        <div class="col-8 col-md-10 col-lg-6">
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
        <div class="col-2 col-md-2 offset-md-0 offset-1">
          <ul>
            <li v-if="isMobile">
              <h3>LINKS</h3>
            </li>
            <li>
              <a href="/#/team">TEAM</a>
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
