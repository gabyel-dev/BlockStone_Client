import { useLocation, useOutletContext } from "react-router-dom";

const InventoryPage = () => {
  const { user } = useOutletContext();
  const location = useLocation();
  const activeMenu = location.state?.menu || "Inventory";

  return (
    <main className="min-h-screen bg-gray-100 p-10 text-slate-900">
      <h1 className="text-3xl font-bold mb-4">{activeMenu}</h1>
      <p className="text-gray-600">Hello, {user?.first_name}</p>
    </main>
  );
};

export default InventoryPage;
