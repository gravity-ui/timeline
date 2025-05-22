import { AbstractEventRenderer, Hitbox } from "./AbstractEventRenderer";
import { TimelineEvent } from "../../types/events";

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
  ) {
    let color = event.color || DEFAULT_COLOR;
    if (isSelected) color = event.selectedColor || DEFAULT_SELECTED_COLOR;

    ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    ctx.fillStyle = color;
    ctx.rect(x0, y0 - 10, x1 - x0, 20);
    ctx.fill();
  }

  public getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
    this.hitboxResult.left = x0;
    this.hitboxResult.right = x1;
    return this.hitboxResult;
  }
}
