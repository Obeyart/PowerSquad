export interface Schedule {
  hours: number[]; // Array of 24 integers: 0 = No Power, 1 = Power
}

export interface Friend {
  id: string;
  name: string;
  schedule: number[]; // Array of 24 integers representing the day
  isHost?: boolean;
}

export interface AnalysisResult {
  message: string;
  bestTimeStart: number | null;
  duration: number;
}

export interface TimeRange {
  start: number;
  end: number;
  duration: number;
  count: number;
  total: number;
  missingFriends: string[]; // Names of friends who are offline
}