export type ResultType = "time" | "count" | "score" | "text";
export type PlayerGroup = "adult" | "child";

export interface Player {
  id: string;
  name: string;
  emoji: string;
  group: PlayerGroup;
}

export interface DayChallenge {
  day: number;
  date: string;
  title: string;
  description: string;
  durationMinutes: number;
  resultType: ResultType;
  resultLabel: string;
  resultUnit?: string;
  lowerIsBetter?: boolean;
  tips?: string[];
}

export interface HolidayConfig {
  name: string;
  startDate: string;
  endDate: string;
  players: Player[];
  days: DayChallenge[];
}

export interface ResultEntry {
  playerId: string;
  value: string | number;
  resultType: ResultType;
  submittedAt: string;
}

export interface BatchResultPayload {
  date: string;
  entries: { playerId: string; value: string | number }[];
}
