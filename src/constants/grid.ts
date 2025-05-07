import { DAY, HOUR, MONTH, YEAR } from "../definitions";
import dayjs from "dayjs";
import { yaTimelineConfig } from "../config";
import { TGridLevel } from "../types/grid";
import { getGridColorForTimeUnitMultiple } from "../helpers/getGridColorForTimeUnitMultiple";

export const gridLevels: TGridLevel[] = [
  {
    domain: HOUR,
    style: getGridColorForTimeUnitMultiple(5, "minute"),
    start: (t) => dayjs(t).startOf("minute"),
    step: (t) => t.add(1, "minute"),
  },
  {
    domain: DAY,
    style(t) {
      if (t.hour() === 0 && t.minute() === 0) {
        return yaTimelineConfig.resolveCssValue(
          yaTimelineConfig.BOUNDARY_MARK_COLOR,
        );
      }

      return t.minute() % 4 === 0
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
        : yaTimelineConfig.resolveCssValue(
            yaTimelineConfig.SECONDARY_MARK_COLOR,
          );
    },
    start(t) {
      const time = dayjs(t).startOf("minute");
      return time.subtract(time.minute() % 15, "minute");
    },
    step: (t) => t.add(15, "minute"),
  },
  {
    domain: MONTH,
    style(t) {
      if (t.hour() === 0) {
        return yaTimelineConfig.resolveCssValue(
          yaTimelineConfig.BOUNDARY_MARK_COLOR,
        );
      }

      return t.hour() % 4 === 0
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
        : yaTimelineConfig.resolveCssValue(
            yaTimelineConfig.SECONDARY_MARK_COLOR,
          );
    },
    start: (t) => dayjs(t).startOf("hour"),
    step: (t) => t.add(1, "hour"),
  },
  {
    domain: YEAR,
    style(t) {
      if (t.date() === 1) {
        return yaTimelineConfig.resolveCssValue(
          yaTimelineConfig.BOUNDARY_MARK_COLOR,
        );
      }

      return t.day() === 1
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
        : yaTimelineConfig.resolveCssValue(
            yaTimelineConfig.SECONDARY_MARK_COLOR,
          );
    },
    start: (t) => dayjs(t).startOf("day"),
    step: (t) => t.add(1, "day"),
  },
  {
    domain: YEAR * 5,
    style: getGridColorForTimeUnitMultiple(3, "month"),
    start: (t) => dayjs(t).startOf("month"),
    step: (t) => dayjs(t).add(1, "month"),
  },
  {
    domain: Infinity,
    style() {
      return yaTimelineConfig.resolveCssValue(
        yaTimelineConfig.PRIMARY_MARK_COLOR,
      );
    },
    start: (t) => dayjs(t).startOf("year"),
    step: (t) => t.add(1, "year"),
  },
];
