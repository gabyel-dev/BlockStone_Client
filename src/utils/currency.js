export const formatPesoAmount = (amount) => {
  return `P${Number(amount ?? 0).toFixed(2)}`;
};
