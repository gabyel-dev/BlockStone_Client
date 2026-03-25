import { api } from "./axios";

export const getPrintServices = () => api.get("/print/services");

export const createTransaction = (payload, config = {}) =>
  api.post("/print/transactions", payload, config);

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
