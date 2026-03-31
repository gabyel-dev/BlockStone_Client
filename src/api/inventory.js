import { api } from "./axios";

export const getInventory = () => api.get("/inventory");

export const createInventoryItem = (payload) => api.post("/inventory", payload);

export const updateInventoryItem = ({ iid, payload }) =>
  api.patch(`/inventory/${iid}`, payload);

export const deleteInventoryItem = (iid) => api.delete(`/inventory/${iid}`);
