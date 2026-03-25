import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Toaster position="top-right" richColors closeButton />
    <App />
  </AuthProvider>,
);
