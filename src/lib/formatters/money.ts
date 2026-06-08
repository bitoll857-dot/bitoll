export const formatAmount = (value: number) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue < 0 ? "-" : "";
  const [integerPart, decimalPart] = Math.abs(safeValue).toFixed(2).split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${sign}${groupedInteger},${decimalPart}`;
};

export const formatMoney = (value: number, currency = "MZN") =>
  `${formatAmount(value)} ${currency}`;
