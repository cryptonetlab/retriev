import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import "./themes/style.scss";
import "./themes/resp.scss";

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
