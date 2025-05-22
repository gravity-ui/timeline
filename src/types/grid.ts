import dayjs from "dayjs";

export type TGridLevel = {
  domain: number;
  style: (t: dayjs.Dayjs) => string;
  start: (t: dayjs.Dayjs | number) => dayjs.Dayjs;
  step: (t: dayjs.Dayjs) => dayjs.Dayjs;
};
