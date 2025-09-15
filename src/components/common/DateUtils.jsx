import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function formatChatDate(timestamp) {
  const date = dayjs(timestamp);
  if (date.isToday()) return "Today";
  if (date.isYesterday()) return "Yesterday";
  return date.format("DD/MM/YYYY");
}