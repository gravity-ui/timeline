export class BaseComponent {
  protected ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
  }

  public pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  public useStaticTransform(): void {
    const dpr = this.pixelRatio();
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
