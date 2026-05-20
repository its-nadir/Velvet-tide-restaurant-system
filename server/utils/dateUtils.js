const parseDateInput = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const isoDate = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map((segment) => Number(segment));
    const localDate = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

module.exports = {
  parseDateInput,
};
