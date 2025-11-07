<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold text-primary m-0">Orders</h3>
      <router-link to="/orders/create" class="btn btn-sm btn-success">
        <i class="bi bi-plus-circle"></i> New Order
      </router-link>
    </div>
    <div class="card shadow-sm mb-4 border-0">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Search</label>
            <input
              type="text"
              v-model="search"
              placeholder="Search by customer or invoice..."
              class="form-control"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Date From</label>
            <input type="date" v-model="date_from" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Date To</label>
            <input type="date" v-model="date_to" class="form-control" />
          </div>
          <div class="col-md-2 text-end">
            <button @click="fetch" class="btn btn-primary w-100">
              <i class="bi bi-search"></i> Search
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="table-responsive shadow-sm rounded">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.invoice_number }}</td>
            <td>{{ order.customer_name }}</td>
            <td>{{ formatDate(order.date_time) }}</td>
            <td>Taka {{ Number(order.total_amount).toFixed(2) }}</td>
            <td>
              <span
                :class="[
                  'badge',
                  order.status === 'Completed'
                    ? 'bg-success'
                    : order.status === 'Pending'
                    ? 'bg-warning text-dark'
                    : 'bg-secondary',
                ]"
              >
                {{ order.status }}
              </span>
            </td>
            <td class="text-end">
              <router-link
                :to="`/orders/${order.id}/edit`"
                class="btn btn-sm btn-outline-primary me-2"
              >
              <i class="bi bi-pencil"></i> Edit
              </router-link>
              <button
                @click="confirmDelete(order.id)"
                class="btn btn-sm btn-outline-danger"
              >
                <i class="bi bi-trash"></i> Delete
              </button>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td colspan="6" class="text-center py-3 text-muted">
              No orders found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2"
    >
      <div>
        <button
          :disabled="page <= 1"
          @click="prevPage"
          class="btn btn-outline-secondary btn-sm me-2"
        >
          <i class="bi bi-chevron-left"></i> Prev
        </button>
        <button
          :disabled="page >= lastPage"
          @click="nextPage"
          class="btn btn-outline-secondary btn-sm"
        >
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
      <span class="text-muted small">
        Page {{ page }} of {{ lastPage }}
      </span>
    </div>
  </div>
</template>

<script>
import api from "../services/api";
import dayjs from "dayjs";

export default {
  data() {
    return {
      orders: [],
      search: "",
      date_from: "",
      date_to: "",
      perPage: 10,
      page: 1,
      lastPage: 1,
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    async fetch() {
      const params = {
        q: this.search,
        per_page: this.perPage,
        page: this.page,
      };
      if (this.date_from) params.date_from = this.date_from;
      if (this.date_to) params.date_to = this.date_to;

      try {
        const res = await api.get("/orders", { params });
        this.orders = res.data.data || [];
        this.lastPage = res.data.meta?.last_page || 1;
      } catch (e) {
        console.error(e);
        alert("Failed to fetch orders");
      }
    },
    formatDate(dt) {
      return dt ? dayjs(dt).format("YYYY-MM-DD HH:mm") : "-";
    },
    async confirmDelete(id) {
      if (!confirm("Delete this order?")) return;
      try {
        await api.delete(`/orders/${id}`);
        alert("Deleted successfully");
        this.fetch();
      } catch (e) {
        console.error(e);
        alert("Delete failed");
      }
    },
    prevPage() {
      if (this.page <= 1) return;
      this.page--;
      this.fetch();
    },
    nextPage() {
      if (this.page >= this.lastPage) return;
      this.page++;
      this.fetch();
    },
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
