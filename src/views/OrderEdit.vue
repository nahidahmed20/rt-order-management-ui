<template>
  <div class="container py-5">
    <div class="card shadow-lg border-0">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0"><i class="bi bi-pencil-square me-2"></i>Edit Order</h4>
      </div>

      <div class="card-body">
        <div class="mb-3">
          <label class="form-label fw-semibold">Customer Name</label>
          <input
            type="text"
            v-model="customer_name"
            class="form-control"
            placeholder="Enter customer name"
          >
        </div>

        <div class="mb-4 position-relative">
          <input
            type="text"
            v-model="query"
            @input="onSearch"
            class="form-control"
            placeholder="Search products..."
          >
          <ul
            v-if="suggestions.length"
            class="list-group position-absolute w-100 shadow-sm mt-1"
            style="max-height: 200px; overflow-y: auto; z-index: 10;"
          >
            <li
              v-for="s in suggestions"
              :key="s.stock_id"
              @click="addStock(s)"
              class="list-group-item list-group-item-action"
            >
              {{ s.product_name }} — 
              <small class="text-muted">Available: {{ s.quantity }}</small>
            </li>
          </ul>
        </div>

        <div class="table-responsive mb-4">
          <table class="table table-bordered align-middle">
            <thead class="table-light">
              <tr>
                <th>Product</th>
                <th width="150">Quantity</th>
                <th>Available</th>
                <th width="120">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in cart" :key="item.stock_id">
                <td>{{ item.product_name }}</td>
                <td>
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    @input="recalc(i)"
                    class="form-control text-center"
                    :min="1"
                    :max="item.maxQty"
                  >
                </td>
                <td>{{ item.maxQty }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-danger" @click="remove(i)">
                    <i class="bi bi-trash"></i> Remove
                  </button>
                </td>
              </tr>
              <tr v-if="cart.length === 0">
                <td colspan="4" class="text-center text-muted py-3">
                  No products added yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-end mb-4">
          <h5>Total Items: {{ totalItems }}</h5>
        </div>
        <div class="text-end">
          <button
            @click="updateOrder"
            :disabled="loading || cart.length === 0"
            class="btn btn-primary px-4"
          >
            <i class="bi bi-save me-1"></i>
            {{ loading ? 'Saving...' : 'Update Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import debounce from 'lodash/debounce'

export default {
  data() {
    return {
      id: null,
      customer_name: '',
      query: '',
      suggestions: [],
      cart: [],
      loading: false
    }
  },
  computed: {
    totalItems() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0)
    }
  },
  created() {
    this.id = this.$route.params.id
    this.fetchOrder()
  },
  methods: {
    async fetchOrder() {
      this.loading = true
      try {
        const res = await api.get(`/orders/${this.id}`)
        this.customer_name = res.data.customer_name
        this.cart = res.data.items.map(i => ({
          ...i,
          quantity: i.quantity,
          maxQty: i.quantity 
        }))
      } catch (e) {
        alert('Failed to load order')
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    onSearch: debounce(async function() {
      if (!this.query || this.query.length < 2) {
        this.suggestions = []
        return
      }
      try {
        const res = await api.get('/products/search', { params: { q: this.query } })
        this.suggestions = res.data || []
      } catch (e) {
        console.error(e)
      }
    }, 300),

    addStock(stock) {
      const exists = this.cart.find(c => c.stock_id === stock.stock_id)
      if (exists) {
        exists.quantity = Math.min(exists.quantity + 1, stock.quantity)
      } else {
        this.cart.push({
          ...stock,
          quantity: 1,
          maxQty: stock.quantity
        })
      }
      this.query = ''
      this.suggestions = []
    },

    remove(index) {
      this.cart.splice(index, 1)
    },

    recalc(index) {
      const item = this.cart[index]
      item.quantity = Math.max(1, Math.min(item.quantity, item.maxQty))
    },

    async updateOrder() {
      if (!this.cart.length) {
        alert('Add at least one product to update the order')
        return
      }

      this.loading = true
      const items = this.cart.map(c => ({
        product_id: c.product_id,
        stock_id: c.stock_id,
        quantity: c.quantity
      }))

      try {
        await api.put(`/orders/${this.id}`, {
          customer_name: this.customer_name,
          items
        })
        alert('Order updated successfully')
        this.$router.push('/orders')
      } catch (e) {
        console.error(e)
        alert(e.response?.data?.error || e.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
}

ul.list-group {
  position: absolute;
  z-index: 1000;
}
</style>
