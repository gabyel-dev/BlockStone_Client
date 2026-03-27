import { useEffect, useState } from "react";
import { getShiftAgenda } from "../../../api/print";

// Loads shift-agenda rows using local cache fallback to reduce redundant requests.
export const useShiftAgendaData = () => {
  const [agendaData, setAgendaData] = useState([]);

  useEffect(() => {
    const loadAgenda = async () => {
      try {
        const cachedRaw = localStorage.getItem("agenda-data");

        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          setAgendaData(cached);
          return;
        }

        const response = await getShiftAgenda();
        const fetched = response?.data?.agendaData;

        setAgendaData(fetched);
        localStorage.setItem("agenda-data", JSON.stringify(fetched));
      } catch {
        setAgendaData([]);
        localStorage.removeItem("agenda-data");
      }
    };

    loadAgenda();
  }, []);

  return { agendaData };
};
