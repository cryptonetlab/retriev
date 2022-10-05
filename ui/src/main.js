import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Buefy from "buefy";
import Toast from "vue-toastification";
import Particles from "vue2-particles";

import "buefy/dist/buefy.css";
import "vue-toastification/dist/index.css";
import "animate.css";
import "./themes/colors.scss";
import "./themes/style.scss";
import "./themes/responsive.scss";

Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
});

Vue.use(Buefy);
Vue.config.productionTip = false;
Vue.use(Particles);
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
