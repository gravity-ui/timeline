import { DAY, HOUR, MONTH, YEAR } from "./timeConstants";
import dayjs from "dayjs";
import { TGridLevel } from "../types/grid";
import { ViewConfigurationDefault } from "../types/configuration";

const getGridColorForTimeUnitMultiple = (
  n: number,
  unit: "second" | "minute" | "month" | "year",
  primaryColor: string,
  secondaryColor: string,
) => {
  return (t: dayjs.Dayjs) => {
    return t[unit]() % n === 0 ? primaryColor : secondaryColor;
  };
};

export const getGridLevels = ({
  color,
}: ViewConfigurationDefault["grid"]): TGridLevel[] => [
  {
    domain: HOUR,
    style: getGridColorForTimeUnitMultiple(
      5,
      "minute",
      color.primaryMarkColor,
      color.secondaryMarkColor,
    ),
    start: (t) => dayjs(t).startOf("minute"),
    step: (t) => t.add(1, "minute"),
  },
  {
    domain: DAY,
    style(t) {
      if (t.hour() === 0 && t.minute() === 0) {
        return color.boundaryMarkColor;
      }

      return t.minute() % 4 === 0
        ? color.primaryMarkColor
        : color.secondaryMarkColor;
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
        return color.boundaryMarkColor;
      }

      return t.hour() % 4 === 0
        ? color.primaryMarkColor
        : color.secondaryMarkColor;
    },
    start: (t) => dayjs(t).startOf("hour"),
    step: (t) => t.add(1, "hour"),
  },
  {
    domain: YEAR,
    style(t) {
      if (t.date() === 1) {
        return color.boundaryMarkColor;
      }

      return t.day() === 1 ? color.primaryMarkColor : color.secondaryMarkColor;
    },
    start: (t) => dayjs(t).startOf("day"),
    step: (t) => t.add(1, "day"),
  },
  {
    domain: YEAR * 5,
    style: getGridColorForTimeUnitMultiple(
      3,
      "month",
      color.primaryMarkColor,
      color.secondaryMarkColor,
    ),
    start: (t) => dayjs(t).startOf("month"),
    step: (t) => dayjs(t).add(1, "month"),
  },
  {
    domain: Infinity,
    style() {
      return color.primaryMarkColor;
    },
    start: (t) => dayjs(t).startOf("year"),
    step: (t) => t.add(1, "year"),
  },
];
