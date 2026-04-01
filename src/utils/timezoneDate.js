const DEFAULT_TIME_ZONE = "Asia/Manila";

const UTC_NAIVE_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?$/;

const HAS_TIME_ZONE_SUFFIX = /(Z|[+-]\d{2}:?\d{2})$/i;

const toDateFromSource = (value) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const raw = value.trim();
    const asIso = raw.includes(" ") ? raw.replace(" ", "T") : raw;
    const normalized =
      UTC_NAIVE_DATE_TIME.test(asIso) && !HAS_TIME_ZONE_SUFFIX.test(asIso)
        ? `${asIso}Z`
        : asIso;

    return new Date(normalized);
  }

  return new Date(value);
};

const getDateParts = (value, timeZone = DEFAULT_TIME_ZONE) => {
  const date = toDateFromSource(value);
  if (Number.isNaN(date.getTime())) {
    return getDateParts(new Date(), timeZone);
  }

  const formatter = new Intl.DateTimeFormat("en-PH", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  return parts.reduce((result, part) => {
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      result[part.type] = part.value;
    }

    return result;
  }, {});
};

export const getTodayDateValue = (timeZone = DEFAULT_TIME_ZONE) => {
  const { year, month, day } = getDateParts(new Date(), timeZone);
  return `${year}-${month}-${day}`;
};

export const formatDateTimeInTimeZone = (
  value,
  timeZone = DEFAULT_TIME_ZONE,
) => {
  if (!value) {
    return "-";
  }

  const date = toDateFromSource(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const formatter = new Intl.DateTimeFormat("en-PH", {
    timeZone,
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formatter.format(date)} PHT`;
};

export const getDateInputValueInTimeZone = (
  value,
  timeZone = DEFAULT_TIME_ZONE,
) => {
  const { year, month, day } = getDateParts(value, timeZone);
  return `${year}-${month}-${day}`;
};

export const getIsoWeekValueInTimeZone = (
  value,
  timeZone = DEFAULT_TIME_ZONE,
) => {
  const { year, month, day } = getDateParts(value, timeZone);
  const sourceDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
  const utcDate = new Date(
    Date.UTC(
      sourceDate.getUTCFullYear(),
      sourceDate.getUTCMonth(),
      sourceDate.getUTCDate(),
    ),
  );
  const dayNum = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

export const isoWeekToDateValue = (weekValue) => {
  const [yearPart, weekPart] = String(weekValue || "").split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);

  if (!year || !week) {
    return getTodayDateValue();
  }

  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - day + 1);

  return monday.toISOString().slice(0, 10);
};

export const getMonthValueInTimeZone = (value, timeZone = DEFAULT_TIME_ZONE) =>
  getDateInputValueInTimeZone(value, timeZone).slice(0, 7);
