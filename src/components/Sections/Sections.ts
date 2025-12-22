import {
  BaseComponentInterface,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../types";
import { CanvasApi } from "../../CanvasApi";
import RBush, { BBox } from "rbush";
import { rangeToRangeIntersect } from "../../helpers/math";
import { DefaultSectionRenderer } from "./DefaultSectionRenderer";

const MAX_INDEX_TREE_WIDTH = 16;

export class Sections<
  TEvent extends TimelineEvent = TimelineEvent,
  TMarker extends TimelineMarker = TimelineMarker,
  TSection extends TimelineSection = TimelineSection,
> implements BaseComponentInterface
{
  protected api: CanvasApi<TEvent, TMarker, TSection>;
  protected _sections: TSection[] = [];
  protected index = new RBush<BBox & { section: TSection }>(
    MAX_INDEX_TREE_WIDTH,
  );
  private hoveredSections: string[] | undefined = undefined;

  constructor(api: CanvasApi<TEvent, TMarker, TSection>) {
    this.api = api;
    this.addEventListeners();
  }

  public setSections(sections: TSection[]): void {
    this._sections = sections;
    this.rebuildIndex();
  }

  public getSectionsAt(rect: DOMRect) {
    const {
      sections: { hitboxPadding },
    } = this.api.getViewConfiguration();

    const sections = this.index.search({
      minX: this.api.positionToTime(rect.left - hitboxPadding),
      maxX: this.api.positionToTime(rect.right + hitboxPadding),
      minY: 0,
      maxY: this.api.ctx.canvas.height,
    });

    return sections.map((box) => box.section);
  }

  public getSectionsAtPoint(x: number, y: number) {
    const p = 6;
    return this.getSectionsAt(new DOMRect(x - p / 2, y - p / 2, p, p));
  }

  public isHoveredSection(id: string) {
    return this.hoveredSections?.includes(id) || false;
  }

  public rebuildIndex(): void {
    const { end } = this.api.getInterval();
    const rulerHeight = this.api.getRulerHeight();

    const boxes = this._sections.map(
      (section): BBox & { section: TSection } => {
        const minX = section.from;
        const maxX = section.to || end;
        const minY = rulerHeight;
        const maxY = this.api.height - rulerHeight;
        return { minX, maxX, minY, maxY, section };
      },
    );
    this.index.clear();
    this.index.load(boxes);
  }

  public render(): void {
    this.api.useScrollTransform();
    const viewConfiguration = this.api.getViewConfiguration();
    const { start, end } = this.api.getInterval();
    const ctx = this.api.ctx;
    const rulerHeight = this.api.getRulerHeight();
    const contentHeight = this.api.height - rulerHeight;

    for (let i = 0, len = this._sections.length; i < len; i += 1) {
      const section = this._sections[i];
      const sectionTo = section.to || end;

      if (rangeToRangeIntersect(start, end, section.from, sectionTo)) {
        const x0 = this.api.timeToPosition(section.from);
        const x1 = this.api.timeToPosition(sectionTo);

        if (!section.renderer) {
          section.renderer = new DefaultSectionRenderer();
        }

        section.renderer.render({
          ctx,
          section,
          x0,
          x1,
          y0: rulerHeight,
          h: contentHeight,
          isHovered: this.isHoveredSection(section.id),
          viewConfiguration,
          timeToPosition: this.api.timeToPosition,
        });
      }
    }
  }

  public destroy() {
    this.api.canvas.removeEventListener(
      "mousemove",
      this.handleCanvasMousemove,
    );
  }

  protected handleCanvasMousemove = (event: MouseEvent) => {
    const candidates = this.getSectionsAtPoint(event.offsetX, event.offsetY);

    const newHover = candidates.map((section) => section.id);
    if (JSON.stringify(this.hoveredSections) === JSON.stringify(newHover))
      return;

    this.hoveredSections = newHover;
    this.api.rerender();
  };

  protected addEventListeners() {
    this.api.canvas.addEventListener("mousemove", this.handleCanvasMousemove);
  }
}
