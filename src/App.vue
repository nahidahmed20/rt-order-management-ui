<template>
  <div>
    <nav class="nav">
      <router-link to="/">Dashboard</router-link> |
      <router-link to="/billing">Billing</router-link> |
      <router-link to="/orders">Orders</router-link> |
      <a href="#" v-if="token" @click.prevent="logout">Logout</a>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
  export default {
    computed: {
      token() {
        return localStorage.getItem("token");
      },
    },
    methods: {
      logout() {
        localStorage.removeItem("token");
        location.href = "/login";
      },
    },
  };
</script>

<style>
  .nav {
    padding: 12px;
    background: #f6f6f6;
  }
  main {
    padding: 5px 10px;
  }
</style>
