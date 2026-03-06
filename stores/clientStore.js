import { defineStore } from 'pinia'

export const useClientStore = defineStore('client', {
  state: () => ({
    clients: [
      {
        id: 'CLI-001',
        name: 'Acme Corp',
        email: 'billing@acmecorp.com',
        company: 'Acme Corp LLC',
        riskScore: 15, // 0-100, low is better
        averageDelayDays: 2,
        totalRevenue: 45000,
        profitMargin: 35, // %
        status: 'Active'
      },
      {
        id: 'CLI-002',
        name: 'Stark Industries',
        email: 'tony@stark.com',
        company: 'Stark Industries',
        riskScore: 85, // High risk
        averageDelayDays: 45,
        totalRevenue: 120000,
        profitMargin: 10,
        status: 'Active'
      },
      {
        id: 'CLI-003',
        name: 'Wayne Enterprises',
        email: 'finance@wayne.com',
        company: 'Wayne Enterprises',
        riskScore: 40, // Medium risk
        averageDelayDays: 12,
        totalRevenue: 85000,
        profitMargin: 25,
        status: 'Active'
      }
    ],
    loading: false
  }),
  actions: {
    addClient(client) {
      this.clients.push({ 
        id: `CLI-${Math.floor(Math.random() * 1000)}`,
        riskScore: Math.floor(Math.random() * 100),
        averageDelayDays: Math.floor(Math.random() * 30),
        totalRevenue: 0,
        profitMargin: 20,
        ...client 
      })
    },
    deleteClient(id) {
      this.clients = this.clients.filter(c => c.id !== id)
    }
  }
})
