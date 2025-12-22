import { ViewConfigurationDefault } from "../types";
import { defaultPalette } from "./colors";
import { ZoomMode } from "../enums";

const DEFAULT_FONT = "10px sans-serif";
const DEFAULT_GROUP_COLOR = "rgb(254, 127, 45)";
const DEFAULT_GROUP_COLOR_HOVER = "red";

export const defaultViewConfig: ViewConfigurationDefault = {
  hideRuler: false,
  ruler: {
    spacing: 40,
    position: 33,
    subPosition: 16,
    height: 41,
    font: DEFAULT_FONT,
    color: {
      background: "transparent",
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
    color: {
      line: defaultPalette.gray13,
    },
    lineWidth: 1,
    dashedLinePattern: [5, 3],
    solidLinePattern: [0, 0],
  },
  sections: {
    hitboxPadding: 2,
  },
  events: {
    font: DEFAULT_FONT,
    hitboxPadding: 2,
  },
  markers: {
    font: DEFAULT_FONT,
    groupColor: DEFAULT_GROUP_COLOR,
    groupColorHover: DEFAULT_GROUP_COLOR_HOVER,
    hitboxPadding: 2,
    collapseMinDistance: 4,
    collapseEnabled: true,
    groupZoomEnabled: true,
    groupZoomPadding: 0.2,
    groupZoomMaxFactor: 0.5,
  },
  camera: {
    zoom: ZoomMode.DEFAULT,
  },
};
