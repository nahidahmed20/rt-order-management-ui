import axios from 'axios'
const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'
const instance = axios.create({ baseURL })

instance.interceptors.request.use((config) => {
const token = localStorage.getItem('token')
if (token) config.headers.Authorization = `Bearer ${token}`
return config
})

instance.interceptors.response.use(resp => resp, err => {
if (err.response && err.response.status === 401) {
localStorage.removeItem('token')
window.location = '/login'
}
return Promise.reject(err)
})


export default instance