import { AbstractEventRenderer, Hitbox } from "./AbstractEventRenderer";
import {
  CanvasColorResolver,
  TimelineEvent,
  ViewConfiguration,
} from "../../types";

const DEFAULT_COLOR = "#333";
const DEFAULT_SELECTED_COLOR = "#546";

export class DefaultEventRenderer extends AbstractEventRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    event: TimelineEvent,
    isSelected: boolean,
    x0: number,
    x1: number,
    y0: number,
    h: number,
    _viewConfiguration: ViewConfiguration,
    _timeToPosition?: (n: number) => number,
    isHovered = false,
    resolveColor?: CanvasColorResolver,
  ) {
    let color = event.color || DEFAULT_COLOR;
    if (isHovered) color = event.hoverColor || color;
    if (isSelected) color = event.selectedColor || DEFAULT_SELECTED_COLOR;

    ctx.beginPath();
    ctx.fillStyle = resolveColor
      ? resolveColor(color, isSelected ? DEFAULT_SELECTED_COLOR : DEFAULT_COLOR)
      : color;
    ctx.rect(x0, y0 - h / 2, x1 - x0, h);
    ctx.fill();
  }

  public getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
    this.hitboxResult.left = x0;
    this.hitboxResult.right = x1;
    return this.hitboxResult;
  }
}
