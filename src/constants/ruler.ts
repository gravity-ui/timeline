import dayjs from "dayjs";
import { yaTimelineConfig } from "../config";
import { DAY, HOUR, MINUTE, MONTH, SECOND, YEAR } from "../definitions";
import { RulerLevel, RulerSupLevel } from "../types";

const minuteSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("hour");
  },
  step(t) {
    return dayjs(t).add(1, "hour");
  },
  format: "HH",
};

const hourSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("day");
  },
  step(t) {
    return dayjs(t).add(1, "day");
  },
  color(t) {
    const weekday = dayjs(t).day();
    return weekday === 6 || weekday === 0
      ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_WEEKEND_COLOR)
      : null;
  },
  format: "MMM D",
};

const dateSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("month");
  },
  step(t) {
    return dayjs(t).add(1, "month");
  },
  format: "MMM YYYY",
};

const monthSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("year");
  },
  step(t) {
    return dayjs(t).add(1, "year");
  },
  format: "YYYY",
};

export const labelLevels: RulerLevel[] = [
  {
    domain: SECOND,
    start: (t) => dayjs(t).startOf("millisecond"),
    step: (t) => dayjs(t).add(1, "millisecond"),
    format: "SSS[ms]",
    sup: {
      start(t) {
        return dayjs(t).startOf("second");
      },
      step(t) {
        return dayjs(t).add(1, "second");
      },
      format: "ss[′′]",
    },
  },
  {
    domain: MINUTE,
    start: (t) => dayjs(t).startOf("second"),
    step: (t) => dayjs(t).add(1, "second"),
    format: "ss[′′]",
    sup: {
      start(t) {
        const time = dayjs(t).startOf("minute");
        return time.subtract(time.minute() % 5, "minute");
      },
      step(t) {
        return dayjs(t).add(5, "minute");
      },
      format: "mm[′]",
    },
  },
  {
    domain: HOUR,
    start(t) {
      const time = dayjs(t).startOf("minute");
      return time.subtract(time.minute() % 5, "minute");
    },
    step: (t) => dayjs(t).add(5, "minute"),
    format: "mm[′]",
    sup: minuteSupLabel,
  },
  {
    domain: DAY,
    start(t) {
      const time = dayjs(t).startOf("minute");
      return time.subtract(time.minute() % 15, "minute");
    },
    step: (t) => dayjs(t).add(15, "minute"),
    format: "mm[′]",
    sup: minuteSupLabel,
  },
  {
    domain: DAY,
    start: (t) => dayjs(t).startOf("hour"),
    step: (t) => dayjs(t).add(1, "hour"),
    format: "HH",
    sup: hourSupLabel,
  },
  {
    domain: MONTH,
    start(t) {
      const time = dayjs(t).startOf("hour");
      return time.subtract(time.hour() % 4, "hour");
    },
    step: (t) => dayjs(t).add(4, "hour"),
    format: "HH",
    sup: hourSupLabel,
  },
  {
    domain: MONTH,
    start: (t) => dayjs(t).startOf("day"),
    step: (t) => dayjs(t).add(1, "day"),
    color(t) {
      const weekday = dayjs(t).day();
      return weekday === 6 || weekday === 0
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_WEEKEND_COLOR)
        : null;
    },
    format: "D",
    sup: dateSupLabel,
  },
  {
    domain: MONTH * 6,
    start: (t) => dayjs(t).startOf("week").add(1, "day"),
    step: (t) => dayjs(t).add(1, "week"),
    format: "D",
  },
  {
    domain: YEAR,
    start: (t) => dayjs(t).startOf("month"),
    step: (t) => dayjs(t).add(1, "month"),
    format: "MMM",
    sup: monthSupLabel,
  },
  {
    domain: YEAR * 10,
    start(t) {
      const time = dayjs(t).startOf("month");
      return time.subtract(time.month() % 3, "month");
    },
    step: (t) => dayjs(t).add(3, "month"),
    format: "[Q]Q",
  },
  {
    domain: Infinity,
    start: (t) => dayjs(t).startOf("year"),
    step: (t) => dayjs(t).add(1, "year"),
    format: "YYYY",
  },
];
