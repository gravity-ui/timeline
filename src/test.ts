import { TimeLineOptions } from "./types";
import { Ruler } from "./newComponents/Ruler";
// import { BaseComponent } from "./newComponents/BaseComponent";

export class Test {
  private options: TimeLineOptions;
  private canvas: HTMLCanvasElement;
  private ruler: Ruler;

  constructor(options: TimeLineOptions) {
    this.options = options;

    this.updateCanvasSize = this.updateCanvasSize.bind(this);
  }

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.addEvents();

    this.updateCanvasSize();
    this.createRuler();
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
      this.ruler.draw();
    }
  }

  private createRuler() {
    if (!this.options.modules.ruler) return;

    this.ruler = new Ruler(this.canvas, this.options);
    this.ruler.draw();
  }
}
