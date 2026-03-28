import { useCallback, useEffect, useState } from "react";
import {
  createShiftAgenda,
  deleteShiftAgenda,
  getShiftAgenda,
  updateShiftAgenda,
} from "../../../api/print";

// Manages shift agenda list plus CRUD helpers used by dashboard cards/modals.
export const useShiftAgendaData = () => {
  const [agendaData, setAgendaData] = useState([]);
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);

  const loadAgenda = useCallback(async () => {
    try {
      setIsAgendaLoading(true);
      const response = await getShiftAgenda();
      setAgendaData(response?.data?.agendaData ?? []);
    } catch {
      setAgendaData([]);
    } finally {
      setIsAgendaLoading(false);
    }
  }, []);

  const addAgenda = async (payload) => {
    await createShiftAgenda(payload);
    await loadAgenda();
  };

  const editAgenda = async (aid, payload) => {
    await updateShiftAgenda({ aid, payload });
    await loadAgenda();
  };

  const removeAgenda = async (aid) => {
    await deleteShiftAgenda(aid);
    await loadAgenda();
  };

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  return {
    agendaData,
    isAgendaLoading,
    loadAgenda,
    addAgenda,
    editAgenda,
    removeAgenda,
  };
};
