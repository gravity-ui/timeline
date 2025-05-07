import { TimeLineOptions } from "./types/options";
import { Ruler } from "./newComponents/Ruler";
import { Grid } from "./newComponents/Grid";
// import { BaseComponent } from "./newComponents/BaseComponent";

export class Test {
  private options: TimeLineOptions;
  private canvas: HTMLCanvasElement;
  private ruler: Ruler;
  private grid: Grid;

  constructor(options: TimeLineOptions) {
    this.options = options;

    this.updateCanvasSize = this.updateCanvasSize.bind(this);
  }

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.addEvents();

    this.updateCanvasSize();
    this.createRuler();
    this.createGrid();
  }

  public destroy() {
    window.removeEventListener("resize", this.updateCanvasSize);
  }

  private addEvents() {
    window.addEventListener("resize", this.updateCanvasSize);
  }

  private updateCanvasSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.canvas.offsetWidth * pixelRatio);
    this.canvas.height = Math.floor(this.canvas.offsetHeight * pixelRatio);

    if (this.ruler) {
      this.ruler.render();
    }
    if (this.grid) {
      this.grid.render();
    }
  }

  private createRuler() {
    this.ruler = new Ruler(this.canvas, this.options);
    this.ruler.render();
  }

  private createGrid() {
    this.grid = new Grid(this.canvas, this.options);
    this.grid.render();
  }
}
