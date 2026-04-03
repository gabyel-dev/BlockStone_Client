import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/login";
import DashboardPage from "./pages/DashboardPage";
import PosPage from "./pages/pos/PosPage";
import SalesPage from "./pages/SalesPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import InventoryPage from "./pages/InventoryPage";
import SettingsPage from "./pages/SettingsPage";
import MainLayout from "./pages/MainLayout";
import { GuestOnly, RequireAuth } from "./context/authContext";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          element={
            <RequireAuth>
              {/*
                MainLayout contains <Outlet/>. All child routes below render inside that Outlet.
                Route changes happen inside BrowserRouter, so React updates the page in-app
                instead of triggering a full browser hard reload.
              */}
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/users" element={<UsersManagementPage />} />
          <Route path="/users/:id" element={<UserDetailsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
