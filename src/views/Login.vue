<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card shadow-lg p-4" style="width: 400px; border-radius: 12px;">
      <h3 class="text-center mb-4 text-primary fw-bold">Login</h3>

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label fw-semibold">Email address</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Password</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-semibold">
          Login
        </button>

        <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
      </form>

      <div class="mt-3 text-center text-muted small">
        Don’t have an account? <a href="/register" class="text-decoration-none">Register</a>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  data() {
    return {
      email: "",
      password: "",
      error: null,
    };
  },
  methods: {
    async submit() {
      this.error = null;
      try {
        const res = await api.post("/login", {
          email: this.email,
          password: this.password,
        });
        const token = res.data.token || res.data.access_token;
        if (!token) throw new Error("No token returned");
        localStorage.setItem("token", token);
        this.$router.push("/");
      } catch (e) {
        this.error = e.response?.data?.error || e.message;
      }
    },
  },
};
</script>

<style scoped>
body {
  background: #f5f7fa;
}
</style>

