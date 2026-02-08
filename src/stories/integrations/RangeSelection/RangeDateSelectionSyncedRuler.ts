import type { DateTime, DurationUnit } from "@gravity-ui/date-utils";
import { dateTimeUtc, settings } from "@gravity-ui/date-utils";
import { Timeline } from "../../../Timeline";
import type {
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../../types";

/**
 * Number of intervals displayed in RangeDateSelection ruler.
 *
 * This constant is critical for synchronizing timeline viewport with RangeDateSelection.
 * When numberOfIntervals > 1, the RangeDateSelection shows a wider time range than the
 * selected (blue) interval, allowing users to see context before and after the selection.
 *
 * The timeline viewport displays exactly the selected interval portion, so we need to
 * use conversion functions (selectionToViewport/viewportToSelection) to map between them.
 *
 * Example with NUMBER_OF_INTERVALS = 4:
 * - RangeDateSelection shows 4 intervals total
 * - The blue selected area is 1/4 of the visible ruler
 * - Timeline canvas displays only the selected interval's time range
 * @see selectionToViewport - converts selected range to full viewport range
 * @see viewportToSelection - converts viewport range back to selected range
 */
export const NUMBER_OF_INTERVALS = 4;

/**
 * Position of selected interval on the RangeDateSelection ruler (0 to 1).
 *
 * 0.5 means the selected interval is centered on the ruler.
 * 0 would place it at the start, 1 would place it at the end.
 */
export const PLACE_ON_RULER = 0.5;

export type TRange = { start: number; end: number };

/**
 * Converts the selected (blue) interval range to the full timeline viewport range.
 *
 * When numberOfIntervals > 1, the timeline shows a larger time range than the
 * RangeDateSelection's selected interval. This function expands the selection
 * to match what the timeline viewport should display.
 */
export function selectionToViewport(start: number, end: number): TRange {
  const diff = end - start;
  return {
    start: start - diff * (NUMBER_OF_INTERVALS - 1) * PLACE_ON_RULER,
    end: end + diff * (NUMBER_OF_INTERVALS - 1) * (1 - PLACE_ON_RULER),
  };
}

/**
 * Converts the timeline viewport range back to the selected (blue) interval range.
 *
 * This is the inverse of selectionToViewport - it calculates which portion of
 * the viewport corresponds to the RangeDateSelection's selected interval.
 */
export function viewportToSelection(
  viewportStart: number,
  viewportEnd: number,
): TRange {
  const viewportDiff = viewportEnd - viewportStart;
  const selectionDiff = viewportDiff / NUMBER_OF_INTERVALS;
  const start =
    viewportStart + selectionDiff * (NUMBER_OF_INTERVALS - 1) * PLACE_ON_RULER;
  const end = start + selectionDiff;
  return { start, end };
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

interface TickSize {
  duration: number;
  period: DurationUnit;
  multiplier: number;
}

function makeTickSizes(
  periodSize: number,
  periodName: DurationUnit,
  ...multipliers: number[]
): TickSize[] {
  return multipliers.map((m) => ({
    duration: m * periodSize,
    period: periodName,
    multiplier: m,
  }));
}

const tickSizes: TickSize[] = [
  ...makeTickSizes(SECOND, "second", 1, 2, 5, 10, 15, 30),
  ...makeTickSizes(MINUTE, "minute", 1, 2, 5, 10, 20, 30),
  ...makeTickSizes(HOUR, "hour", 1, 2, 3, 6, 12),
  ...makeTickSizes(DAY, "day", 1, 2, 3),
  ...makeTickSizes(WEEK, "week", 1, 2),
  ...makeTickSizes(MONTH, "month", 1, 2, 3, 6),
  ...makeTickSizes(YEAR, "year", 1, 2, 5, 10, 15, 20, 30),
];

const MAX_TICKS = 100000;

export interface RangeDateSelectionSyncedRulerOptions {
  minTickWidth?: number;
  maxTickWidth?: number;
  lineColor?: string;
  lineWidth?: number;
  timeZone?: string;
}

function findTickSize(
  minWidth: number,
  maxWidth: number,
  timelineWidth: number,
  timelineDuration: number,
): TickSize {
  const minDuration = (minWidth / timelineWidth) * timelineDuration;
  const maxDuration = (maxWidth / timelineWidth) * timelineDuration;

  const suitableSizes: TickSize[] = [];

  for (const size of tickSizes) {
    if (minDuration <= size.duration) {
      if (size.duration <= maxDuration) {
        suitableSizes.push(size);
      } else if (suitableSizes.length === 0) {
        return size;
      }
    }
  }

  if (suitableSizes.length === 0) {
    return tickSizes[tickSizes.length - 1];
  }

  return suitableSizes[Math.floor(suitableSizes.length / 2)];
}

function computeCssVariable(value: string): string {
  if (!value.startsWith("var(")) {
    return value;
  }

  const match = value.match(/var\((--[^)]+)\)/);
  if (!match) {
    return value;
  }

  const varName = match[1];
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Custom ruler component that synchronizes vertical grid lines with RangeDateSelection ticks.
 * Uses the exact same tick calculation algorithm as @gravity-ui/date-components.
 *
 * This ensures that the vertical lines on the timeline canvas align perfectly with
 * the tick marks on the RangeDateSelection ruler above.
 */
export class RangeDateSelectionSyncedRuler<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> {
  private timeline: Timeline<TEvent, TMarker, TSection>;
  private minTickWidth: number;
  private maxTickWidth: number;
  private lineColor: string;
  private lineWidth: number;
  private timeZone: string;

  constructor(
    timeline: Timeline<TEvent, TMarker, TSection>,
    options: RangeDateSelectionSyncedRulerOptions = {},
  ) {
    this.timeline = timeline;
    this.minTickWidth = options.minTickWidth ?? 80;
    this.maxTickWidth = options.maxTickWidth ?? 200;
    this.lineColor = options.lineColor ?? "var(--g-color-line-generic)";
    this.lineWidth = options.lineWidth ?? 1;
    this.timeZone = options.timeZone ?? settings.getDefaultTimeZone();
  }

  public render(): void {
    const { start, end } = this.timeline.api.getInterval();
    const { ctx, height } = this.timeline.api;
    const canvas = this.timeline.api.canvas;
    const width = canvas.getBoundingClientRect().width;
    const rulerHeight = this.timeline.api.getRulerHeight();

    if (!start || !end || start >= end || width <= 0) {
      return;
    }

    const viewportStart = dateTimeUtc({ input: start });
    const viewportEnd = dateTimeUtc({ input: end });

    const tickTimes = this.calculateTickTimes(
      viewportStart,
      viewportEnd,
      width,
    );

    if (tickTimes.length === 0) {
      return;
    }

    this.timeline.api.useStaticTransform();

    const previousCompositeOperation = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "destination-over";

    ctx.strokeStyle = computeCssVariable(this.lineColor);
    ctx.lineWidth = this.lineWidth;

    const timeToXCoeff = width / (end - start);

    for (const tickTime of tickTimes) {
      const x = Math.round((tickTime - start) * timeToXCoeff);
      ctx.beginPath();
      ctx.moveTo(x, rulerHeight);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = previousCompositeOperation;
  }

  public destroy(): void {
    // No cleanup needed
  }

  private calculateTickTimes(
    viewportStart: DateTime,
    viewportEnd: DateTime,
    viewportWidth: number,
  ): number[] {
    const duration = viewportEnd.valueOf() - viewportStart.valueOf();
    const tickSize = findTickSize(
      this.minTickWidth,
      this.maxTickWidth,
      viewportWidth,
      duration,
    );

    let cursor: DateTime;
    const stableDate = dateTimeUtc({ input: "1977-01-01" }).timeZone(
      this.timeZone,
      true,
    );
    const diff = stableDate.diff(viewportStart, tickSize.period);
    const divider = tickSize.multiplier;
    const multiplier = Math.floor(diff / divider);
    cursor = stableDate.subtract(multiplier * divider, tickSize.period);

    if (viewportStart.isBefore(cursor)) {
      cursor = cursor.subtract(divider, tickSize.period);
    }

    const timeDiff = stableDate.utcOffset() - cursor.utcOffset();
    if (
      timeDiff !== 0 &&
      (tickSize.period === "hour" ||
        tickSize.period === "minute" ||
        tickSize.period === "second")
    ) {
      cursor = cursor.add(timeDiff, "minutes");
    }

    const ticks: number[] = [];
    let i = 0;
    let maxTickValue = cursor.valueOf();

    while (cursor.valueOf() < viewportEnd.valueOf()) {
      if (i >= MAX_TICKS) {
        break;
      }
      i++;
      ticks.push(cursor.valueOf());

      let next = cursor.add(tickSize.multiplier, tickSize.period);

      const nextTimeDiff = cursor.utcOffset() - next.utcOffset();

      if (
        nextTimeDiff !== 0 &&
        (tickSize.period === "hour" ||
          tickSize.period === "minute" ||
          tickSize.period === "second")
      ) {
        next = next.add(nextTimeDiff, "minutes");

        let k = 1;
        while (next.valueOf() <= maxTickValue) {
          next = next
            .add(tickSize.multiplier * k++, tickSize.period)
            .add(nextTimeDiff, "minutes");
        }
      }

      cursor = next;
      maxTickValue = Math.max(maxTickValue, cursor.valueOf());
    }

    return ticks;
  }
}
