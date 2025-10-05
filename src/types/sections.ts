import { AbstractSectionRenderer } from "../components/Sections/AbstractSectionRenderer";

export type TimelineSection = {
  id: string;
  from: number;
  to?: number;
  color: string;
  hoverColor?: string;
  renderer?: AbstractSectionRenderer;
};
