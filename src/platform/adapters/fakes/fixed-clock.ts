import type { Clock } from "../../ports/clock";

export class FixedClock implements Clock {
  constructor(private currentDate: Date = new Date("2026-10-13T12:00:00Z")) {}

  now(): Date {
    return new Date(this.currentDate);
  }

  setDate(date: Date): void {
    this.currentDate = date;
  }
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
