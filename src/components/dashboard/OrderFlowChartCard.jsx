import { LineChart } from "@mui/x-charts/LineChart";
import { FiMoreVertical } from "react-icons/fi";

const OrderFlowChartCard = ({ orderFlow }) => {
  const points = Array.isArray(orderFlow) ? orderFlow : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-8">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Order Flow
          </p>
          <h3 className="text-lg font-black text-slate-900 sm:text-xl">
            Live Production Board
          </h3>
        </div>
        <button className="text-slate-500 transition hover:text-slate-800">
          <FiMoreVertical size={18} />
        </button>
      </div>

      <div className="h-52 rounded-2xl bg-linear-to-b from-slate-50 to-white p-2 sm:h-64 sm:p-3">
        <LineChart
          xAxis={[{ data: points.map((item) => item.day), scaleType: "point" }]}
          series={[
            {
              data: points.map((item) => item.order),
              color: "#16a34a",
              label: "Order",
              curve: "monotoneX",
            },
          ]}
          yAxis={[{ min: 0 }]}
          grid={{ horizontal: true }}
          margin={{ left: 30, right: 12, top: 16, bottom: 20 }}
          height={180}
        />
      </div>
    </div>
  );
};

export default OrderFlowChartCard;
