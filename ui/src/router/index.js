import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Signup from "../views/Signup.vue";
import CreateDeal from "../views/CreateDeal.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/signup",
    name: "Signups",
    component: Signup,
  },
  {
    path: "/create",
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
