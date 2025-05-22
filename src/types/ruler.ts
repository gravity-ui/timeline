import dayjs from "dayjs";

export type RulerSupLevel = {
  start: (t: number) => dayjs.Dayjs;
  step: (t: dayjs.Dayjs) => dayjs.Dayjs;
  format: string;
  color?: (t: dayjs.Dayjs | number) => string | null;
};

export type RulerLevel = RulerSupLevel & {
  domain: number;
  sup?: RulerSupLevel;
};
