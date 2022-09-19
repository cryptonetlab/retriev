import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/manage-referees",
    name: "ManageReferees",
    component: () =>
      import("../views/ManageReferees.vue"),
  },
  {
    path: "/manage-providers",
    name: "ManageProviders",
    component: () =>
      import("../views/ManageProviders.vue"),
  },
  {
    path: "/manage-vault",
    name: "ManageVault",
    component: () =>
      import("../views/ManageVault.vue"),
  },
  {
    path: "/withdraw",
    name: "Withdraw",
    component: () =>
      import("../views/Withdraw.vue"),
  },
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

export default router;
