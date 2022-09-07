import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Buefy from "buefy";
import "buefy/dist/buefy.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import 'animate.css';
import "./themes/style.scss";
import "./themes/responsive.scss";

Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
});

Vue.use(Buefy);
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
