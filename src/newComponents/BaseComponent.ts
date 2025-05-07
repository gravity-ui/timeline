export class BaseComponent {
  protected ctx: CanvasRenderingContext2D;
  protected width: number;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
  }

  protected pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  protected useStaticTransform(): void {
    const dpr = this.pixelRatio();
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  protected updateWidth() {
    this.width = this.ctx.canvas.width / this.pixelRatio();
  }
}
