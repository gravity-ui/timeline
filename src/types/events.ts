import { AbstractEventRenderer } from "../components/Events";

export type TimelineEvent = {
  id: string;
  from: number;
  to?: number;
  axisId: string;
  trackIndex: number;
  renderer?: AbstractEventRenderer;
  color?: string;
  selectedColor?: string;
};
