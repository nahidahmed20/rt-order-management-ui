<template>
  <div class="container py-4">
    <h3 class="fw-bold text-primary mb-4">Create New Order</h3>

    <div class="mb-3">
      <label class="form-label fw-semibold">Customer Name</label>
      <input
        v-model="customer_name"
        type="text"
        class="form-control"
        placeholder="Enter customer name"
      />
    </div>

    <div class="mb-3 position-relative">
      <label class="form-label fw-semibold">Add Product</label>
      <div class="input-group">
        <input
          v-model="productQuery"
          type="text"
          class="form-control"
          placeholder="Search by product name or barcode"
          @input="searchProduct"
        />
        <button class="btn btn-primary" @click="addSelectedProduct">
          Add
        </button>
      </div>

      <ul
        v-if="suggestions.length > 0"
        class="list-group position-absolute shadow-sm w-100"
        style="z-index: 1000; max-height: 200px; overflow-y:auto;"
      >
        <li
          v-for="item in suggestions"
          :key="item.stock_id"
          class="list-group-item list-group-item-action"
          @click="selectProduct(item)"
          style="cursor: pointer;"
        >
          {{ item.name }} | SKU: {{ item.sku }} | Stock: {{ item.quantity }} | ${{ Number(item.sale_price).toFixed(2) }}
        </li>
      </ul>
    </div>

    <div v-if="cart.length > 0" class="table-responsive shadow-sm rounded">
      <table class="table table-bordered align-middle text-center">
        <thead class="table-light">
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in cart" :key="item.stock_id">
            <td>{{ item.name }}</td>
            <td>{{ item.sku }}</td>
            <td>{{ item.quantity }}</td>
            <td>
              <input
                type="number"
                v-model.number="item.order_quantity"
                min="1"
                :max="item.quantity"
                class="form-control text-center"
              />
            </td>
            <td>${{ Number(item.sale_price).toFixed(2) }}</td>
            <td>${{ (Number(item.sale_price) * Number(item.order_quantity)).toFixed(2) }}</td>
            <td>
              <button
                class="btn btn-sm btn-danger"
                @click="removeProduct(index)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="cart.length > 0" class="d-flex justify-content-between align-items-center mt-3">
      <h5>Total: Taka {{ total.toFixed(2) }}</h5>
      <button class="btn btn-success" @click="submitOrder">
        <i class="bi bi-check-circle"></i> Place Order
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "../services/api";

const customer_name = ref("");
const productQuery = ref("");
const suggestions = ref([]);
const selectedProduct = ref(null);
const cart = ref([]);

const searchProduct = async () => {
  if (!productQuery.value) return (suggestions.value = []);
  try {
    const res = await api.get("/products/search", { params: { q: productQuery.value } });
    suggestions.value = (res.data || []).map(p => ({
      ...p,
      sale_price: Number(p.sale_price) || 0,
      quantity: Number(p.quantity) || 0
    }));
  } catch (err) {
    console.error(err);
  }
};

const selectProduct = (product) => {
  selectedProduct.value = product;
  productQuery.value = product.name;
  suggestions.value = [];
};

const addSelectedProduct = () => {
  let product = selectedProduct.value || suggestions.value[0]; 
  if (!product) {
    alert("No product found to add");
    return;
  }

  product.sale_price = Number(product.sale_price) || 0;
  product.quantity = Number(product.quantity) || 0;

  const exists = cart.value.find(p => p.stock_id === product.stock_id);
  if (!exists) cart.value.push({ ...product, order_quantity: 1 });

  selectedProduct.value = null;
  productQuery.value = "";
  suggestions.value = [];
};

const removeProduct = (index) => cart.value.splice(index, 1);
const total = computed(() => 
  cart.value.reduce((sum, item) => sum + Number(item.sale_price) * Number(item.order_quantity), 0)
);
const submitOrder = async () => {
  if (!customer_name.value) {
    alert("Please enter customer name");
    return;
  }
  if (cart.value.length === 0) {
    alert("Add products to the cart");
    return;
  }
  try {


    const payload = {
        customer_name: customer_name.value,
        items: cart.value.map(item => ({
            product_id: item.product_id,
            stock_id: item.stock_id,
            quantity: item.order_quantity,
            sale_price: item.sale_price
        }))
    };

    await api.post("/orders", payload);
    alert("Order placed successfully");
    customer_name.value = "";
    cart.value = [];
  } catch (err) {
    console.error(err);
    alert("Failed to place order");
  }
};
</script>

<style scoped>
.list-group {
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}
</style>
