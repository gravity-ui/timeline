import dayjs from "dayjs";
import { yaTimelineConfig } from "../config";

export const getGridColorForTimeUnitMultiple = (
  n: number,
  unit: "second" | "minute" | "month" | "year",
) => {
  return (t: dayjs.Dayjs) => {
    return t[unit]() % n === 0
      ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
      : yaTimelineConfig.resolveCssValue(yaTimelineConfig.SECONDARY_MARK_COLOR);
  };
};
