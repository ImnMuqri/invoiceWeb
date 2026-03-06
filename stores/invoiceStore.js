import { defineStore } from "pinia";

export const useInvoiceStore = defineStore("invoice", {
  state: () => ({
    invoices: [
      {
        id: "INV-2023-001",
        client: "Acme Corp",
        date: "2023-10-01",
        dueDate: "2023-10-15",
        amount: 5000,
        status: "Paid",
        currency: "MYR",
        latePrediction: "Low",
        riskScore: 12,
        whatsappStatus: "Not Sent",
      },
      {
        id: "INV-2023-002",
        client: "Stark Industries",
        date: "2023-11-01",
        dueDate: "2023-11-15",
        amount: 25000,
        status: "Overdue",
        currency: "MYR",
        latePrediction: "High", // AI Prediction
        riskScore: 88,
        predictedDelayDays: 14,
        whatsappStatus: "Not Sent",
      },
      {
        id: "INV-2023-003",
        client: "Wayne Enterprises",
        date: "2023-11-20",
        dueDate: "2023-12-05",
        amount: 12000,
        status: "Pending",
        currency: "MYR",
        latePrediction: "Medium",
        riskScore: 45,
        predictedDelayDays: 3,
        whatsappStatus: "Sent",
      },
    ],
    loading: false,
  }),
  actions: {
    addInvoice(invoice) {
      this.invoices.push({
        ...invoice,
        latePrediction: ["Low", "Medium", "High"][
          Math.floor(Math.random() * 3)
        ], // Mock AI
        riskScore: Math.floor(Math.random() * 100),
        whatsappStatus: "Not Sent",
      });
    },
    deleteInvoice(id) {
      this.invoices = this.invoices.filter((i) => i.id !== id);
    },
    sendWhatsAppReminder(id) {
      const invoice = this.invoices.find((i) => i.id === id);
      if (invoice) {
        invoice.whatsappStatus = "Sending...";
        setTimeout(() => {
          invoice.whatsappStatus = "Sent";
        }, 1000);
      }
    },
  },
});
