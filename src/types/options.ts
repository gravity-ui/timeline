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

export type GridOptions = {
  spacing?: number;
  lineWidth?: number;
};

export type TimeLineOptions = {
  start: number;
  end: number;
  ruler?: RulerOptions;
  grid?: GridOptions;
};

export type DefaultTimeLineOptions = Required<TimeLineOptions> & {
  ruler: Required<RulerOptions> & {
    color: Required<Required<RulerOptions>["color"]>;
  };
  grid: Required<GridOptions>;
};
