import "./assets/main.css";

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Login from "./views/Login.vue";
import Dashboard from "./views/Dashboard.vue";
import Billing from "./views/Billing.vue";
import Orders from "./views/Orders.vue";
import OrderEdit from "./views/OrderEdit.vue";
import OrderCreate from "./views/OrderCreate.vue";
import api from "./services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const routes = [
  { path: "/login", component: Login, meta: { guest: true } },
  { path: "/", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/billing", component: Billing, meta: { requiresAuth: true } },
  { path: "/orders", component: Orders, meta: { requiresAuth: true } },
  { path: "/orders/create", component: OrderCreate, meta: { requiresAuth: true } },
  {
    path: "/orders/:id/edit",
    component: OrderEdit,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) return next("/login");
  if (to.meta.guest && token) return next("/");
  next();
});

const app = createApp(App);
app.use(router);
app.provide("api", api);
app.mount("#app");
