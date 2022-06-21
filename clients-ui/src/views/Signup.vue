<template>
  <div class="signup">
    <section class="hero">
      <div class="hero-body">
        <Navbar @hide="logState = false" />
        <!-- Logs button show/hide -->
        <div
          @click="
            logState = !logState;
            hideNav();
          "
          class="btn-sidebar position-bottom-right"
          :class="{ heartbeat: loading }"
        >
          <i class="fa-solid fa-terminal"></i>
        </div>
        <!-- END - Logs button show/hide -->

        <div class="container">
          <h1 class="title is-3 mb-0">Data retrievability Oracle</h1>
          <h3 class="title is-5">Signup as Provider</h3>
          <hr />
          <div class="columns is-multiline mt-5">
            <div class="column is-6 is-12-mobile">
              <div class="column is-12">
                <p class="mb-2">Provider ID</p>
                <b-input
                  v-model="provider"
                  placeholder="999"
                  disabled
                ></b-input>
                <p class="small">
                  The Provider ID will be calculated automatically
                </p>
              </div>
              <div class="column is-12">
                <p class="mb-2">
                  Provider Endpoint*
                  <i
                    @click="infoModal = true"
                    class="fa-solid fa-circle-info pointer"
                  ></i>
                </p>
                <b-input v-model="address" placeholder="Protocol_One"></b-input>
              </div>
              <div class="column is-12">
                <p class="mb-2">Filecoin Address*</p>
                <b-input
                  v-model="address"
                  placeholder="f2plku564ddywnmb5b2ky7dhk4mb6uacsxuuev3pi"
                ></b-input>
              </div>
              <div class="column is-12">
                <div class="is-flex is-align-items-baseline">
                  <p class="mb-2">Provider Name</p>
                  <p class="small ml-2">(optional)</p>
                </div>

                <b-input v-model="address" placeholder="Protocol_One"></b-input>
              </div>
              <div class="column is-12">
                <div class="is-flex is-align-items-baseline">
                  <p class="mb-2">E-mail</p>
                  <p class="small ml-2">(optional)</p>
                </div>
                <b-input
                  v-model="email"
                  placeholder="example@gmail.com"
                ></b-input>
              </div>
              <div class="mt-5">
                <button class="button is-rounded is-dark">Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Application Logs -->
    <Transition
      enter-active-class="slide-in-right"
      leave-active-class="slide-out-right"
    >
      <div v-if="logState" class="right-col">Logs</div>
    </Transition>
    <!-- END - Application Logs -->

    <!-- Modal Provider Info -->
    <b-modal
      v-model="infoModal"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-label="Example Modal"
      close-button-aria-label="Close"
      aria-modal
    >
      <template>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Provider Endpoint</p>
          </header>
          <section class="modal-card-body">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </section>
          <footer class="modal-card-foot">
            <b-button
              class="button is-rounded is-dark"
              label="Close"
              @click="infoModal = !infoModal"
            />
          </footer>
        </div>
      </template>
    </b-modal>
    <!-- END Modal Provider Info -->
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Signup",
  mixins: [checkViewport],
  data() {
    return {
      logState: false,
      //MODAL
      infoModal: false,
      //LOGS
      loading: false,
      // FORM
      provider: "",
      address: "",
      email: "",
    };
  },
  components: {
    Navbar,
  },
  methods: {
    hideNav(event) {
      console.log("data after child handle: ", event); // get the data after child dealing
    },
  },
};
</script>
