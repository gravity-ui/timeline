import { ViewConfigurationDefault } from "../types/configuration";
import { defaultPalette } from "./colors";

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
      background: defaultPalette.white,
      primaryLevel: defaultPalette.gray1,
      secondaryLevel: defaultPalette.gray7,
      textOutlineColor: defaultPalette.white,
      borderColor: defaultPalette.gray3,
      rulerWeekendColor: defaultPalette.red,
    },
  },
  grid: {
    spacing: 40,
    lineWidth: 1,
    widthBuffer: 40,
    color: {
      primaryMarkColor: defaultPalette.gray7,
      secondaryMarkColor: defaultPalette.gray13,
      boundaryMarkColor: defaultPalette.gray3,
    },
  },
  axes: {
    trackHeight: 25,
    lineHeight: 25,
    color: {
      line: defaultPalette.gray13,
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
