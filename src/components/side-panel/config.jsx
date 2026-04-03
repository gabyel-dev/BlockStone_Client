import { FaUsers } from "react-icons/fa6";
import {
  MdAttachMoney,
  MdDashboard,
  MdInventory,
  MdPrint,
} from "react-icons/md";

export const PROFILE_IMAGE_URL =
  "https://i.pinimg.com/736x/58/7b/57/587b57f888b1cdcc0e895cbdcfde1c1e.jpg";

export const MAIN_NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", Icon: MdDashboard },
  { name: "POS", path: "/pos", Icon: MdPrint },
  { name: "Sales", path: "/sales", Icon: MdAttachMoney },
  { name: "Users Management", path: "/users", Icon: FaUsers },
];

export const INVENTORY_SUB_ITEMS = [
  {
    name: "Stocks",
    path: "/inventory",
    state: { menu: "Inventory", inventoryView: "Stocks" },
  },
  {
    name: "Services",
    path: "/inventory",
    state: { menu: "Inventory", inventoryView: "Services" },
  },
];

export const MOBILE_NAV_ITEMS = [
  ...MAIN_NAV_ITEMS.filter((item) => item.name !== "Users Management"),
  { name: "Inventory", path: "/inventory", Icon: MdInventory },
];
