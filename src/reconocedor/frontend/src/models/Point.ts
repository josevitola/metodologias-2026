type PointLabelConfig = {
  label?: string;
  fontSize?: number;
  coordinates?: boolean;
};

const DEFAULT_CONFIG = { label: "", fontSize: 10, coordinates: true };

export class Point {
  x: number;
  y: number;
  r: number;

  constructor(x = 0, y = 0, r: number = 10) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  hypot(other?: Point) {
    const ox = other?.x ?? 0;
    const oy = other?.y ?? 0;
    const dx = this.x - ox;
    const dy = this.y - oy;

    return Math.hypot(dx * dx + dy * dy);
  }

  subY(other: Point) {
    return this.y - other.y;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    mousePos: Point,
    config?: PointLabelConfig
  ) {
    const { x, y } = this;
    const { fontSize, label, coordinates } = { ...DEFAULT_CONFIG, ...config };
    const formattedLabel = label ? `${label}:` : "";
    const formattedCoordinates = coordinates
      ? `(${Math.trunc(x)}, ${Math.trunc(y)})`
      : "";

    ctx.save();
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, Math.floor(fontSize / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(
      `${formattedLabel}${formattedCoordinates}`,
      x + fontSize,
      y + fontSize
    );
    ctx.restore();

    this.updateOnHover(mousePos);
  }

  clone() {
    return new Point(this.x, this.y, this.r);
  }

  add(other: Point) {
    return new Point(this.x + other.x, this.y + other.y, this.r);
  }

  addX(x: number) {
    return new Point(this.x + x, this.y, this.r);
  }

  addY(y: number) {
    return new Point(this.x, this.y + y, this.r);
  }

  updateOnHover(mousePos: Point) {
    if (this.isHovered(mousePos)) {
      this.r = this.r * 1.1;
    } else {
      this.r = this.r / 1.1;
    }
  }

  isHovered(mousePos: Point) {
    return this.hypot(mousePos) < this.r;
  }
}
