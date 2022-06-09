import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

import "./themes/style.scss";
import "./themes/responsive.scss";
import "./themes/colors.scss";

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
