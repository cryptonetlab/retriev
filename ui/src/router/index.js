import Vue from "vue";
import VueRouter from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import CreateDeal from "../views/CreateDeal.vue";
import Splash from "../views/Splash.vue";
import Terms from "../views/Terms.vue";
import Privacy from "../views/Privacy.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Splash",
    component: Splash,
  },
  {
    path: "/terms-of-service",
    name: "Terms",
    component: Terms,
  },
  {
    path: "/privacy-policy",
    name: "Privacy",
    component: Privacy,
  },
  {
    path: "/app",
    name: "Dashboard",
    component: Dashboard,
  },

  {
    path: "/app/new-deal",
    name: "CreateDeal",
    component: CreateDeal,
  },

];

const router = new VueRouter({
  routes,
  scrollBehavior: function (to) {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

export default router;
