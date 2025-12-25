import axios from 'axios'

const http = axios.create({
  baseURL: '/api', // Adjust if your API base URL is different
  timeout: 10000
})

export default http