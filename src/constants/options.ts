import { ViewConfigurationDefault } from "../types/configuration";
import { yaTimelineConfig } from "../config";

export const defaultViewConfig: ViewConfigurationDefault = {
  hideRuler: false,
  ruler: {
    spacing: yaTimelineConfig.RULER_LABEL_SPACING,
    position: yaTimelineConfig.RULER_LABEL_POS,
    subPosition: yaTimelineConfig.RULER_SUP_LABEL_POS,
    height: yaTimelineConfig.RULER_HEADER_HEIGHT,
    font: yaTimelineConfig.RULER_FONT,
    color: {
      background: yaTimelineConfig.PRIMARY_BACKGROUND_COLOR,
      primaryLevel: yaTimelineConfig.RULER_PRIMARY_TEXT_COLOR,
      secondaryLevel: yaTimelineConfig.RULER_SECONDARY_TEXT_COLOR,
      textOutlineColor: yaTimelineConfig.RULER_TEXT_OUTLINE_COLOR,
      borderColor: yaTimelineConfig.RULER_BORDER_COLOR,
    },
  },
  grid: {
    spacing: yaTimelineConfig.RULER_LABEL_SPACING,
    lineWidth: yaTimelineConfig.GRID_STROKE_WIDTH,
    widthBuffer: 40,
  },
  axes: {
    trackHeight: yaTimelineConfig.TRACK_HEIGHT,
    lineHeight: yaTimelineConfig.LINE_HEIGHT,
    color: {
      line: yaTimelineConfig.SECONDARY_MARK_COLOR,
    },
    lineWidth: 1,
    dashedLinePattern: [5, 3],
    solidLinePattern: [0, 0],
  },
};
