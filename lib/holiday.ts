import holidayData from "@/data/holiday.json";
import type { DayChallenge, HolidayConfig } from "@/lib/types";

const config = holidayData as HolidayConfig;

export function getHolidayConfig(): HolidayConfig {
  return config;
}

export function getDayByNumber(dayNumber: number): DayChallenge | undefined {
  return config.days.find((d) => d.day === dayNumber);
}

export function getDayByDate(date: string): DayChallenge | undefined {
  return config.days.find((d) => d.date === date);
}

export function getTodayChallenge(now = new Date()): DayChallenge | undefined {
  const today = formatDate(now);
  return getDayByDate(today);
}

export function getAllDays(): DayChallenge[] {
  return config.days;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function isHolidayActive(now = new Date()): boolean {
  const today = formatDate(now);
  return today >= config.startDate && today <= config.endDate;
}

export function formatResultValue(
  value: string | number,
  resultType: DayChallenge["resultType"],
  unit?: string
): string {
  if (resultType === "time") {
    const seconds = typeof value === "number" ? value : parseInt(value, 10);
    if (isNaN(seconds)) return String(value);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  if (resultType === "text") {
    return String(value);
  }

  const num = typeof value === "number" ? value : parseFloat(value);
  const display = isNaN(num) ? String(value) : String(num);
  return unit ? `${display} ${unit}` : display;
}

export function parseTimeInput(minutes: string, seconds: string): number | null {
  const m = parseInt(minutes, 10) || 0;
  const s = parseInt(seconds, 10) || 0;
  if (m < 0 || s < 0 || s >= 60) return null;
  if (m === 0 && s === 0) return null;
  return m * 60 + s;
}
