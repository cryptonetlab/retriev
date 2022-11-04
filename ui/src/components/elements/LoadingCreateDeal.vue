<template>
  <div>
    <div class="container">
      <div
        class="is-flex is-justify-content-space-between is-align-items-center mb-5 mt-5"
      >
        <div class="loading_box" style="width: 200px; height: 42px"></div>
        <div class="loading_box" style="width: 44px; height: 25px"></div>
      </div>
      <!--END | BACK BUTTON AND EXPERT MODE SWITCH -->

      <!-- Upload file -->
      <div class="columns is-desktop">
        <div class="column is-6-desktop">
          <div>
            <div class="loading_box" style="width: 100%; height: 118px"></div>
          </div>
          <!-- END | Upload File -->

          <!-- PROVIDER LISTS -->
          <div class="mt-6">
            <div
              v-for="i in 2"
              :key="i"
              class="loading_box mb-3"
              style="width: 100%; height: 60px"
            ></div>
          </div>
          <!-- END PROVIDER LISTS -->
        </div>
        <div class="column is-6-desktop">
          <!-- Deal input fields -->
          <div v-for="i in 3" :key="i" class="mb-4">
            <div
              class="loading_box mb-4"
              style="width: 110px; height: 20px"
            ></div>
            <div class="is-flex is-align-items-center">
              <div
                v-for="i in 4"
                :key="i"
                class="loading_box fixed-width mr-4"
                style="height: 40px"
              ></div>
            </div>
            <div
              class="loading_box mt-3"
              style="width: 30%; height: 20px"
            ></div>
          </div>
          <div>
            <div class="loading_box" style="width: 90%; height: 22px"></div>
            <div class="loading_box mt-3" style="width: 60%; height: 43px"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
