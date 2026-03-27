// Computes page-level sales metrics from current transaction rows.
// netIncome is derived from transaction.net_amount when available.
// If the API does not return net_amount yet, we fall back to gross amount.
export const calculateSalesTotals = (sales = []) => {
  const gross = sales.reduce(
    (sum, transaction) => sum + Number(transaction.total_amount ?? 0),
    0,
  );

  const netIncome = sales.reduce((sum, transaction) => {
    const net =
      transaction?.net_amount ??
      transaction?.net_income ??
      transaction?.total_amount ??
      0;

    return sum + Number(net);
  }, 0);

  const orders = sales.length;
  const items = sales.reduce(
    (sum, transaction) => sum + Number(transaction.total_qty ?? 0),
    0,
  );

  return {
    gross,
    netIncome,
    orders,
    items,
    avg: orders ? gross / orders : 0,
  };
};
