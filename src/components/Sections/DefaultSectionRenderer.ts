import { AbstractSectionRenderer } from "./AbstractSectionRenderer";
import {
  CanvasColorResolver,
  TimelineSection,
  ViewConfiguration,
} from "../../types";
import { Hitbox } from "../Events/AbstractEventRenderer";

export class DefaultSectionRenderer<
  TSection extends TimelineSection,
> extends AbstractSectionRenderer<TSection> {
  public render({
    ctx,
    section,
    x0,
    x1,
    y0,
    h,
    isHovered,
    resolveColor,
  }: {
    ctx: CanvasRenderingContext2D;
    section: TSection;
    x0: number;
    x1: number;
    y0: number;
    h: number;
    isHovered: boolean;
    viewConfiguration: ViewConfiguration;
    timeToPosition?: (n: number) => number;
    resolveColor?: CanvasColorResolver;
  }) {
    const hoverColor = section.hoverColor || section.color;

    ctx.beginPath();
    const color = isHovered ? hoverColor : section.color;
    ctx.fillStyle = resolveColor ? resolveColor(color) : color;
    ctx.rect(x0, y0, x1 - x0, h);
    ctx.fill();
  }

  public getHitbox(_section: TSection, x0: number, x1: number): Hitbox {
    this.hitboxResult.left = x0;
    this.hitboxResult.right = x1;
    return this.hitboxResult;
  }
}
