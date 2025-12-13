// LineChart class for widget visualizations
// Based on LineChart by kevinkub: https://gist.github.com/kevinkub/b74f9c16f050576ae760a7730c19b8e2

export class LineChart {
  private ctx: DrawContext;
  private values: number[];

  constructor(width: number, height: number, values: number[]) {
    this.ctx = new DrawContext();
    this.ctx.size = new Size(width, height);
    this.values = values;
  }

  private _calculatePath(): Path {
    const maxValue = Math.max(...this.values);
    const minValue = Math.min(...this.values);
    const difference = maxValue - minValue;
    const count = this.values.length;
    const step = this.ctx.size.width / (count - 1);

    const points = this.values.map((current, index) => {
      const x = step * index;
      const y = this.ctx.size.height - ((current - minValue) / difference) * this.ctx.size.height;
      return new Point(x, y);
    });

    return this._getSmoothPath(points);
  }

  private _getSmoothPath(points: Point[]): Path {
    const path = new Path();
    path.move(new Point(0, this.ctx.size.height));
    path.addLine(points[0]);

    for (let i = 0; i < points.length - 1; i++) {
      const xAvg = (points[i].x + points[i + 1].x) / 2;
      const yAvg = (points[i].y + points[i + 1].y) / 2;
      const avg = new Point(xAvg, yAvg);
      const cp1 = new Point((xAvg + points[i].x) / 2, points[i].y);
      const next = new Point(points[i + 1].x, points[i + 1].y);
      const cp2 = new Point((xAvg + points[i + 1].x) / 2, points[i + 1].y);
      path.addQuadCurve(avg, cp1);
      path.addQuadCurve(next, cp2);
    }

    path.addLine(new Point(this.ctx.size.width, this.ctx.size.height));
    path.closeSubpath();
    return path;
  }

  configure(fn?: (ctx: DrawContext, path: Path) => void): DrawContext {
    const path = this._calculatePath();
    if (fn) {
      fn(this.ctx, path);
    } else {
      this.ctx.addPath(path);
      this.ctx.fillPath();
    }
    return this.ctx;
  }
}
