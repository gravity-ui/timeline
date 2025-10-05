import { TimelineSection, ViewConfiguration } from "../../types";
import { Hitbox } from "../Events/AbstractEventRenderer";

export abstract class AbstractSectionRenderer<
  TSection extends TimelineSection = TimelineSection,
> {
  public abstract render(data: {
    ctx: CanvasRenderingContext2D;
    section: TSection;
    x0: number;
    x1: number;
    y0: number;
    h: number;
    isHovered: boolean;
    viewConfiguration: ViewConfiguration;
    timeToPosition?: (n: number) => number;
  }): void;

  protected hitboxResult: Hitbox = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  public abstract getHitbox(section: TSection, x0: number, x1: number): Hitbox;
}
