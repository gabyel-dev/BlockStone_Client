// Formats one transaction timestamp for table and card display.
export const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSafeDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
};

const toIsoDate = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

// Converts a day into ISO week notation (YYYY-Wnn) for weekly picker.
export const getIsoWeekValue = (value) => {
  const sourceDate = getSafeDate(value);
  const utcDate = new Date(
    Date.UTC(
      sourceDate.getFullYear(),
      sourceDate.getMonth(),
      sourceDate.getDate(),
    ),
  );
  const dayNum = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

// Converts selected ISO week into its Monday date used by backend API.
export const isoWeekToDate = (weekValue) => {
  const [yearPart, weekPart] = String(weekValue || "").split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);

  if (!year || !week) {
    return toIsoDate(new Date());
  }

  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - day + 1);

  return monday.toISOString().slice(0, 10);
};

export const getMonthValue = (value) =>
  toIsoDate(getSafeDate(value)).slice(0, 7);
