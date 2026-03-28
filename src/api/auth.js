import { api } from "./axios";

export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);
export const logoutUser = () => api.post("/auth/logout");
export const refreshSession = () => api.post("/auth/refresh");
export const getMe = () => api.get("/auth/me");
export const getUsers = () => api.get("/auth/users");
export const updateUserRole = ({ id, role }) =>
  api.patch(`/auth/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);
export const getDashboard = ({ period, date } = {}) =>
  api.get("/dashboard", {
    params: {
      period,
      date,
    },
  });
