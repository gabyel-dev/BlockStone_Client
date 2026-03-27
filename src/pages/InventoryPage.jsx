import { motion, useReducedMotion } from "framer-motion";
import { useLocation, useOutletContext } from "react-router-dom";

const InventoryPage = () => {
  const { user } = useOutletContext();
  const location = useLocation();
  const activeMenu = location.state?.menu || "Inventory";
  const shouldReduceMotion = useReducedMotion();
  const motionSafe = (props) => (shouldReduceMotion ? {} : props);

  return (
    <motion.main
      className="min-h-screen bg-gray-100 p-10 text-slate-900"
      {...motionSafe({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      })}
    >
      <motion.h1
        className="mb-4 text-3xl font-bold"
        {...motionSafe({
          initial: { opacity: 0, y: 4 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.05 },
        })}
      >
        {activeMenu}
      </motion.h1>
      <motion.p
        className="text-gray-600"
        {...motionSafe({
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.1 },
        })}
      >
        Hello, {user?.first_name}
      </motion.p>
    </motion.main>
  );
};

export default InventoryPage;
