import { ViewConfigurationDefault } from "../types/configuration";

const DEFAULT_FONT = "10px sans-serif";

export const defaultViewConfig: ViewConfigurationDefault = {
  hideRuler: false,
  ruler: {
    spacing: 40,
    position: 33,
    subPosition: 16,
    height: 41,
    font: DEFAULT_FONT,
    color: {
      background: "#FFF",
      primaryLevel: "#111",
      secondaryLevel: "#777",
      textOutlineColor: "#FFF",
      borderColor: "#333",
    },
  },
  grid: {
    spacing: 40,
    lineWidth: 1,
    widthBuffer: 40,
  },
  axes: {
    trackHeight: 25,
    lineHeight: 25,
    color: {
      line: "#DDD",
    },
    lineWidth: 1,
    dashedLinePattern: [5, 3],
    solidLinePattern: [0, 0],
  },
  events: {
    font: DEFAULT_FONT,
    hitboxPadding: 2,
    maxIndexTreeWidth: 16,
  },
};
