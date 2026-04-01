import { api } from "./axios";

export const getPrintServices = () => api.get("/print/services");

export const getServiceCatalog = () => api.get("/print/services/catalog");

export const updateServicePricing = ({ priceOptionId, payload }) =>
  api.patch(`/print/services/options/${priceOptionId}`, payload);

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

export const deleteTransaction = (transactionId) =>
  api.delete(`/print/transactions/${transactionId}`);

export const createShiftAgenda = (payload) =>
  api.post("/print/shift-agenda", payload);

export const updateShiftAgenda = ({ aid, payload }) =>
  api.patch(`/print/shift-agenda/${aid}`, payload);

export const deleteShiftAgenda = (aid) =>
  api.delete(`/print/shift-agenda/${aid}`);

export const getShiftAgenda = () => api.get("/print/shift-agenda");
