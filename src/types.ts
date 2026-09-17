export interface SiteConfig {
  hint: string;
  showHint: boolean;
  timeLengthMinutes: number; // Duration of timer in minutes
  timerEnabled: boolean;
  timerStartedAt: number | null; // Timestamp (ms) when timer started
  serverTime?: number;
  remainingSeconds?: number | null;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  hint: '',
  showHint: false,
  timeLengthMinutes: 10,
  timerEnabled: false,
  timerStartedAt: null,
  remainingSeconds: null,
};
