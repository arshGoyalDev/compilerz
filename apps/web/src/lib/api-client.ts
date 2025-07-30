import axios from 'axios';

import { HOST } from './constants';

const apiClient = axios.create({
  baseURL: HOST,
})

export { apiClient };