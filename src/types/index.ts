import dayjs from "dayjs";

export type RulerOptions = {
  spacing?: number;
  position?: number;
  subPosition?: number;
  height?: number;
  font?: string;
  color?: {
    background?: string;
    primaryLevel?: string;
    secondaryLevel?: string;
    textOutlineColor?: string;
    borderColor?: string;
  };
};

export type TimeLineOptions = {
  start: number;
  end: number;
  modules: {
    ruler?: boolean;
  };
  ruler?: RulerOptions;
};

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
