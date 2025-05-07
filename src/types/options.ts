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
  modules: {
    ruler?: boolean;
  };
  ruler?: RulerOptions;
  grid?: GridOptions;
};
