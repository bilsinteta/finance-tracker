import axios from './axios';

export const transactionService = {
  // Get all transactions
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    const response = await axios.get(`/transactions?${params.toString()}`);
    return response.data.transactions;
  },

  // Get single transaction
  getById: async (id) => {
    const response = await axios.get(`/transactions/${id}`);
    return response.data.transaction;
  },

  // Create transaction
  create: async (data) => {
    const response = await axios.post('/transactions', data);
    return response.data;
  },

  // Update transaction
  update: async (id, data) => {
    const response = await axios.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  delete: async (id) => {
    const response = await axios.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get balance
  getBalance: async () => {
    const response = await axios.get('/transactions/balance');
    return response.data;
  },
};