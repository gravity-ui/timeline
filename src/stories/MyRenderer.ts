import { AbstractEventRenderer } from "../components/Events";
import { TimelineEvent } from "../types";
import { Hitbox } from "../components/Events/AbstractEventRenderer";

export type MyEvent = TimelineEvent & {
  borderColor: string;
  selectedBorderColor: string;
  phases: { color: string; percent: number }[];
};

const BORDER_WIDTH = 2;

export class MyRenderer extends AbstractEventRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    event: MyEvent,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number,
    h: number,
  ) {
    const percent = (x1 - x0) / 100;

    const phases = event.phases.reduce<
      {
        color: string;
        start: number;
        width: number;
      }[]
    >((acc, phase, i) => {
      const item = {
        color: phase.color,
        start: i ? acc[i - 1].start + acc[i - 1].width : x0,
        width: phase.percent * percent,
      };
      acc.push(item);
      return acc;
    }, []);

    phases.forEach((phase) => {
      ctx.beginPath();
      ctx.rect(phase.start, y - h / 2, phase.width, h);
      ctx.fillStyle = phase.color;
      ctx.fill();
    });

    ctx.beginPath();
    ctx.lineWidth = BORDER_WIDTH;
    ctx.strokeStyle = isSelected
      ? event.selectedBorderColor
      : event.borderColor;
    ctx.strokeRect(
      x0 - BORDER_WIDTH,
      y - h / 2 - BORDER_WIDTH,
      x1 - x0 + BORDER_WIDTH * 2,
      h + BORDER_WIDTH * 2,
    );
  }

  public getHitbox(_event: MyEvent, x0: number, x1: number): Hitbox {
    this.hitboxResult.left = x0;
    this.hitboxResult.right = x1;
    return this.hitboxResult;
  }
}
