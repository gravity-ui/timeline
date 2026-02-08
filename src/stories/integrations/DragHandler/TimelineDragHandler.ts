import type { Timeline } from "../../../Timeline";
import type {
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../../types";
import type { RefObject } from "react";

export interface TimelineDragHandlerCallbacks {
  onPan?: (start: number, end: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * TimelineDragHandler provides drag-to-pan functionality for Timeline canvas.
 *
 * Features:
 * - Horizontal drag to pan timeline (shift time interval)
 * - Vertical drag to scroll lanes container
 * - Touch support for mobile devices
 * - RequestAnimationFrame optimization for smooth performance
 * - Drag threshold to distinguish between click and drag
 * - Cursor feedback during drag
 * @example
 * ```tsx
 * const dragHandler = new TimelineDragHandler(
 *   timeline,
 *   lanesContainerRef, // optional, for vertical scroll sync
 *   (start, end) => timeline.api.setRange(start, end),
 *   () => console.log('drag started'),
 *   () => console.log('drag ended')
 * );
 *
 * // Cleanup
 * dragHandler.destroy();
 * ```
 */
export class TimelineDragHandler<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> {
  private timeline: Timeline<TEvent, TMarker, TSection>;
  private lanesContainerRef?: RefObject<HTMLDivElement | null>;
  private onPan?: (start: number, end: number) => void;
  private onDragStart?: () => void;
  private onDragEnd?: () => void;

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialScrollTop = 0;
  private initialStart = 0;
  private initialEnd = 0;
  private travel = 0;
  private enabled = true;
  private animationFrameId: number | null = null;
  private pendingMouseMove: MouseEvent | null = null;
  private cursorChanged = false;

  private get DRAG_THRESHOLD(): number {
    return Math.min(2 * (window.devicePixelRatio || 1), 4);
  }

  constructor(
    timeline: Timeline<TEvent, TMarker, TSection>,
    lanesContainerRef?: RefObject<HTMLDivElement | null>,
    onPan?: (start: number, end: number) => void,
    onDragStart?: () => void,
    onDragEnd?: () => void,
  ) {
    this.timeline = timeline;
    this.lanesContainerRef = lanesContainerRef;
    this.onPan = onPan;
    this.onDragStart = onDragStart;
    this.onDragEnd = onDragEnd;
    this.init();
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.timeline.canvas.style.cursor = "default";
    if (!enabled && this.isDragging) {
      this.cancelDrag();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public destroy(): void {
    if (this.isDragging) {
      this.cancelDrag();
    }

    this.timeline.canvas.style.cursor = "default";
    this.timeline.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.timeline.canvas.removeEventListener(
      "contextmenu",
      this.handleContextMenu,
    );
    this.timeline.canvas.removeEventListener(
      "touchstart",
      this.handleTouchStart,
    );
    document.body.style.userSelect = "";
  }

  private init(): void {
    this.timeline.canvas.style.cursor = "default";
    this.timeline.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.timeline.canvas.addEventListener(
      "contextmenu",
      this.handleContextMenu,
    );
    this.timeline.canvas.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
  }

  private handleMouseDown = (event: MouseEvent): void => {
    if ((event.button !== 0 && event.button !== 2) || !this.enabled) return;

    event.preventDefault();

    this.isDragging = true;
    this.cursorChanged = false;

    const rect = this.timeline.canvas.getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
    this.travel = 0;

    document.body.style.userSelect = "none";

    this.initialScrollTop = this.timeline.api.canvasScrollTop;
    const { start, end } = this.timeline.api.getInterval();
    this.initialStart = start;
    this.initialEnd = end;

    this.onDragStart?.();

    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp, { capture: true });
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.pendingMouseMove = event;

    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.processPendingMouseMove();
      });
    }
  };

  private processPendingMouseMove(): void {
    if (!this.pendingMouseMove || !this.isDragging) {
      this.animationFrameId = null;
      return;
    }

    const event = this.pendingMouseMove;
    this.pendingMouseMove = null;
    this.animationFrameId = null;

    const rect = this.timeline.canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const dx = currentX - this.startX;
    const dy = currentY - this.startY;

    this.travel = Math.sqrt(dx * dx + dy * dy);

    if (!this.cursorChanged && this.travel > this.DRAG_THRESHOLD) {
      this.cursorChanged = true;
      this.timeline.canvas.style.cursor = "grabbing";
      document.body.style.cursor = "grabbing";
    }

    const lanesContainer = this.lanesContainerRef?.current;
    if (lanesContainer && Math.abs(dy) > 0.1) {
      const maxScrollTop = Math.max(
        0,
        lanesContainer.scrollHeight - lanesContainer.clientHeight,
      );
      const newScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, this.initialScrollTop - dy),
      );

      this.timeline.api.setCanvasScrollTop(newScrollTop);
      lanesContainer.scrollTop = newScrollTop;
    }

    if (Math.abs(dx) > 0.1) {
      const canvasWidth = this.timeline.canvas.offsetWidth;
      const domain = this.initialEnd - this.initialStart;
      const timeShift = (dx / canvasWidth) * domain;

      const newStart = this.initialStart - timeShift;
      const newEnd = this.initialEnd - timeShift;

      this.onPan?.(newStart, newEnd);
    }
  }

  private handleMouseUp = (event: MouseEvent): void => {
    if (this.travel > this.DRAG_THRESHOLD) {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    this.cancelDrag();
    this.onDragEnd?.();
  };

  private handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private cancelDrag(): void {
    this.isDragging = false;

    this.timeline.canvas.style.cursor = "default";
    document.body.style.cursor = "default";
    document.body.style.userSelect = "";

    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp, {
      capture: true,
    });

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) {
      this.cancelDrag();
      return;
    }

    event.preventDefault();

    const touch = event.touches[0];
    this.isDragging = true;

    const rect = this.timeline.canvas.getBoundingClientRect();
    this.startX = touch.clientX - rect.left;
    this.startY = touch.clientY - rect.top;
    this.travel = 0;

    this.initialScrollTop = this.timeline.api.canvasScrollTop;
    const { start, end } = this.timeline.api.getInterval();
    this.initialStart = start;
    this.initialEnd = end;

    this.onDragStart?.();

    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", this.handleTouchEnd);
    document.addEventListener("touchcancel", this.handleTouchEnd);
  };

  private handleTouchMove = (event: TouchEvent): void => {
    if (!this.isDragging || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const rect = this.timeline.canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    const dx = currentX - this.startX;
    const dy = currentY - this.startY;

    this.travel = Math.sqrt(dx * dx + dy * dy);

    const lanesContainer = this.lanesContainerRef?.current;
    if (lanesContainer && Math.abs(dy) > 0.1) {
      const maxScrollTop = Math.max(
        0,
        lanesContainer.scrollHeight - lanesContainer.clientHeight,
      );
      const newScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, this.initialScrollTop - dy),
      );

      this.timeline.api.setCanvasScrollTop(newScrollTop);
      lanesContainer.scrollTop = newScrollTop;
    }

    if (Math.abs(dx) > 0.1) {
      const canvasWidth = this.timeline.canvas.offsetWidth;
      const domain = this.initialEnd - this.initialStart;
      const timeShift = (dx / canvasWidth) * domain;

      const newStart = this.initialStart - timeShift;
      const newEnd = this.initialEnd - timeShift;

      this.onPan?.(newStart, newEnd);
    }
  };

  private handleTouchEnd = (): void => {
    this.isDragging = false;
    this.onDragEnd?.();

    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchcancel", this.handleTouchEnd);
  };
}
