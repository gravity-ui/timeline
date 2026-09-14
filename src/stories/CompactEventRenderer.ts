import {
  AbstractEventRenderer,
  Hitbox,
} from "../components/Events/AbstractEventRenderer";
import { TimelineEvent, ViewConfiguration } from "../types";

const BAR_HEIGHT = 12;
const BORDER_RADIUS = 4;

/** A compact renderer used to demonstrate centered events in a table row. */
export class CompactEventRenderer extends AbstractEventRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    event: TimelineEvent,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number,
    h: number,
    _viewConfiguration: ViewConfiguration,
    _timeToPosition?: (n: number) => number,
    isHovered = false,
  ) {
    const height = Math.min(BAR_HEIGHT, h);
    let color = event.color || "#333";
    if (isHovered) color = event.hoverColor || color;
    if (isSelected) color = event.selectedColor || color;

    ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    ctx.fillStyle = color;
    ctx.roundRect(x0, y - height / 2, x1 - x0, height, BORDER_RADIUS);
    ctx.fill();
  }

  public getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
    this.hitboxResult.left = x0;
    this.hitboxResult.right = x1;
    return this.hitboxResult;
  }
}
