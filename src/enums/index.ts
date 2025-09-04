export enum ComponentType {
  Axes = "Axes",
  Grid = "grid",
  Ruler = "ruler",
  Events = "events",
  Markers = "markers",
}

export enum StrokeMode {
  STRAIGHT,
  DASHED,
}

export enum TimelineState {
  INIT,
  READY,
}

export enum ZoomMode {
  NONE = "none",
  HORIZONTAL = "horizontal",
  DEFAULT = "default",
}

export enum MarkerDeselectionMode {
  ON_CLICK_ANYWHERE = "on_click_anywhere",
  ON_MARKER_CLICK_ONLY = "on_marker_click_only",
}
