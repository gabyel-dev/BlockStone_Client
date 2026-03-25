import { api } from "./axios";

export const getPrintServices = () => api.get("/print/services");

export const createTransaction = (payload) =>
  api.post("/print/transactions", payload);

export const getTransactions = ({ period, page, pageSize, date }) =>
  api.get("/print/transactions", {
    params: {
      period,
      page,
      pageSize,
      date,
    },
  });

export const getTransactionById = (transactionId) =>
  api.get(`/print/transactions/${transactionId}`);
