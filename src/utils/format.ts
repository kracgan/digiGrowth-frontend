export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "—";
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatPercent(num: number | null | undefined): string {
  if (num === null || num === undefined) return "Not available";
  return `${num.toFixed(1)}%`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthName(monthStr: string): string {
  if (!monthStr || !monthStr.includes("-")) return monthStr;
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
