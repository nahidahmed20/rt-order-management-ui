<template>
  <div class="container py-4">
    <h3>Create Order</h3>

    <div class="mb-3">
      <label>Customer Name</label>
      <input v-model="customer_name" type="text" class="form-control" />
    </div>

    <div class="mb-3 position-relative">
      <label>Search Product</label>
      <input
        v-model="query"
        @input="onSearch"
        type="text"
        class="form-control"
        placeholder="Type product name or barcode"
      />
      <ul
        v-if="suggestions.length"
        class="list-group position-absolute w-100"
        style="z-index: 1000;"
      >
        <li
          v-for="p in suggestions"
          :key="p.stock_id"
          class="list-group-item list-group-item-action"
          @click="selectProduct(p)"
          style="cursor: pointer;"
        >
          {{ p.name }} | SKU: {{ p.sku }} | Stock: {{ p.quantity }}
        </li>
      </ul>
    </div>

    <div v-if="cart.length" class="mt-3">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Available</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in cart" :key="item.stock_id">
            <td>{{ item.name }}</td>
            <td>
              <input
                type="number"
                v-model.number="item.quantity"
                :max="item.quantity"
                min="1"
                class="form-control"
              />
            </td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.sale_price }}</td>
            <td>
              <button class="btn btn-sm btn-danger" @click="removeProduct(i)">
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <h5>Total: {{ total }}</h5>
    </div>

    <button class="btn btn-success mt-2" @click="createOrder" :disabled="!cart.length">
      Create Order
    </button>
  </div>
</template>

<script>
import api from "../services/api";
import debounce from "lodash/debounce";

export default {
  data() {
    return {
      customer_name: "",
      query: "",
      suggestions: [],
      cart: [],
    };
  },
  computed: {
    total() {
      return this.cart.reduce((sum, p) => sum + p.sale_price * p.quantity, 0);
    },
  },
  methods: {
    onSearch: debounce(async function () {
      if (!this.query) {
        this.suggestions = [];
        return;
      }
      try {
        const res = await api.get(`/products/search?q=${this.query}`);
        this.suggestions = res.data;
      } catch (err) {
        console.error(err);
      }
    }, 300),

    selectProduct(product) {
      const exist = this.cart.find((p) => p.stock_id === product.stock_id);
      if (exist) {
        exist.quantity += 1;
      } else {
        this.cart.push({ ...product, quantity: 1 });
      }
      this.query = "";
      this.suggestions = [];
    },

    removeProduct(index) {
      this.cart.splice(index, 1);
    },

    async createOrder() {
      try {
        const payload = {
          customer_name: this.customer_name,
          items: this.cart.map((p) => ({
            stock_id: p.stock_id,
            quantity: p.quantity,
          })),
        };
        await api.post("/orders", payload);
        alert("Order created successfully!");
        this.customer_name = "";
        this.cart = [];
      } catch (err) {
        alert(err.response?.data?.message || "Failed to create order");
      }
    },
  },
};
</script>
