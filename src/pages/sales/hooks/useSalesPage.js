import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteTransaction, getTransactions } from "../../../api/print";
import { calculateSalesTotals } from "../utils/metrics";
import {
  getTodayDateValue,
  isoWeekToDateValue,
} from "../../../utils/timezoneDate";

export const useSalesPage = ({ pageSize = 8 } = {}) => {
  const [period, setPeriod] = useState("daily");
  const [referenceDate, setReferenceDate] = useState(() => getTodayDateValue());
  const [page, setPage] = useState(1);
  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 1,
    period: "daily",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const lastSeenTransactionId = useRef(null);

  const fetchSales = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        if (!silent) {
          setError("");
        }

        const response = await getTransactions({
          period,
          page,
          pageSize,
          date: referenceDate,
        });
        const transactions = response?.data?.data?.transactions ?? [];
        const responseMeta = response?.data?.data?.meta;

        setSales(transactions);
        setMeta(
          responseMeta ?? {
            period,
            page,
            pageSize,
            total: transactions.length,
            totalPages: 1,
          },
        );

        const latestTid = transactions[0]?.tid;
        if (
          latestTid &&
          silent &&
          lastSeenTransactionId.current &&
          latestTid !== lastSeenTransactionId.current
        ) {
          toast.success(`New order #${latestTid} received.`);
        }

        if (latestTid) {
          lastSeenTransactionId.current = latestTid;
        }
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            "Unable to load sales records right now.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize, period, referenceDate],
  );

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchSales({ silent: true });
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchSales]);

  const totals = useMemo(() => calculateSalesTotals(sales), [sales]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearlyOptions = useMemo(
    () => [currentYear - 2, currentYear - 1, currentYear],
    [currentYear],
  );

  const handleChangePeriod = useCallback((nextPeriod) => {
    setPeriod(nextPeriod);
    setPage(1);
  }, []);

  const handleWeekInput = useCallback((event) => {
    setReferenceDate(isoWeekToDateValue(event.target.value));
    setPage(1);
  }, []);

  const handleMonthInput = useCallback((event) => {
    const monthValue = event.target.value;
    if (!monthValue) {
      return;
    }

    setReferenceDate(`${monthValue}-01`);
    setPage(1);
  }, []);

  const handleYearSelect = useCallback((year) => {
    setReferenceDate(`${year}-01-01`);
    setPage(1);
  }, []);

  const openTransaction = useCallback((transactionId) => {
    setSelectedTransactionId(transactionId);
  }, []);

  const closeTransaction = useCallback(() => {
    setSelectedTransactionId(null);
  }, []);

  const openDeletePrompt = useCallback((transaction) => {
    setTransactionToDelete(transaction);
  }, []);

  const closeDeletePrompt = useCallback(() => {
    setTransactionToDelete(null);
  }, []);

  const prevPage = useCallback(() => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }, []);

  const nextPage = useCallback(() => {
    setPage((currentPage) => Math.min(meta.totalPages || 1, currentPage + 1));
  }, [meta.totalPages]);

  const handleDeleteTransaction = useCallback(async () => {
    if (!transactionToDelete?.tid) {
      return;
    }

    try {
      setIsDeletingTransaction(true);
      await deleteTransaction(transactionToDelete.tid);
      setTransactionToDelete(null);
      toast.success(`Transaction #${transactionToDelete.tid} deleted.`);
      await fetchSales();
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message ||
          "Unable to delete transaction.",
      );
    } finally {
      setIsDeletingTransaction(false);
    }
  }, [fetchSales, transactionToDelete]);

  return {
    period,
    referenceDate,
    page,
    sales,
    meta,
    isLoading,
    error,
    selectedTransactionId,
    transactionToDelete,
    isDeletingTransaction,
    totals,
    yearlyOptions,
    handleChangePeriod,
    handleWeekInput,
    handleMonthInput,
    handleYearSelect,
    openTransaction,
    closeTransaction,
    openDeletePrompt,
    closeDeletePrompt,
    prevPage,
    nextPage,
    handleDeleteTransaction,
    reloadSales: fetchSales,
    setPage,
  };
};
