import {
  Renderer,
  Gradient,
  CloudData,
  SparkleData,
  LineCap,
  LineJoin,
  TextAlign,
  TextBaseline,
} from './Renderer';

export class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this._width = width;
    this._height = height;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get fillStyle(): string | Gradient {
    return this.ctx.fillStyle as string | Gradient;
  }

  set fillStyle(val: string | Gradient) {
    this.ctx.fillStyle = val as string | CanvasGradient;
  }

  get strokeStyle(): string | Gradient {
    return this.ctx.strokeStyle as string | Gradient;
  }

  set strokeStyle(val: string | Gradient) {
    this.ctx.strokeStyle = val as string | CanvasGradient;
  }

  get lineWidth(): number {
    return this.ctx.lineWidth;
  }

  set lineWidth(val: number) {
    this.ctx.lineWidth = val;
  }

  get lineCap(): LineCap {
    return this.ctx.lineCap as LineCap;
  }

  set lineCap(val: LineCap) {
    this.ctx.lineCap = val;
  }

  get lineJoin(): LineJoin {
    return this.ctx.lineJoin as LineJoin;
  }

  set lineJoin(val: LineJoin) {
    this.ctx.lineJoin = val;
  }

  get font(): string {
    return this.ctx.font;
  }

  set font(val: string) {
    this.ctx.font = val;
  }

  get textAlign(): TextAlign {
    return this.ctx.textAlign as TextAlign;
  }

  set textAlign(val: TextAlign) {
    this.ctx.textAlign = val;
  }

  get textBaseline(): TextBaseline {
    return this.ctx.textBaseline as TextBaseline;
  }

  set textBaseline(val: TextBaseline) {
    this.ctx.textBaseline = val;
  }

  get shadowBlur(): number {
    return this.ctx.shadowBlur;
  }

  set shadowBlur(val: number) {
    this.ctx.shadowBlur = val;
  }

  get shadowColor(): string {
    return this.ctx.shadowColor;
  }

  set shadowColor(val: string) {
    this.ctx.shadowColor = val;
  }

  get shadowOffsetX(): number {
    return this.ctx.shadowOffsetX;
  }

  set shadowOffsetX(val: number) {
    this.ctx.shadowOffsetX = val;
  }

  get shadowOffsetY(): number {
    return this.ctx.shadowOffsetY;
  }

  set shadowOffsetY(val: number) {
    this.ctx.shadowOffsetY = val;
  }

  get globalAlpha(): number {
    return this.ctx.globalAlpha;
  }

  set globalAlpha(val: number) {
    this.ctx.globalAlpha = val;
  }

  resize(width: number, height: number): void {
    this._width = width;
    this._height = height;
    if (this.ctx.canvas) {
      this.ctx.canvas.width = width;
      this.ctx.canvas.height = height;
    }
  }

  save(): void {
    this.ctx.save();
  }

  restore(): void {
    this.ctx.restore();
  }

  beginPath(): void {
    this.ctx.beginPath();
  }

  closePath(): void {
    this.ctx.closePath();
  }

  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean = false
  ): void {
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ): void {
    this.ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.ctx.quadraticCurveTo(cpx, cpy, x, y);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.ctx.rect(x, y, w, h);
  }

  roundRect(x: number, y: number, w: number, h: number, radii?: number | number[]): void {
    if (typeof this.ctx.roundRect === 'function') {
      this.ctx.roundRect(x, y, w, h, radii);
    } else {
      // Fallback for environments lacking roundRect
      this.ctx.rect(x, y, w, h);
    }
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.ctx.fillRect(x, y, w, h);
  }

  strokeRect(x: number, y: number, w: number, h: number): void {
    this.ctx.strokeRect(x, y, w, h);
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.ctx.clearRect(x, y, w, h);
  }

  fill(): void {
    this.ctx.fill();
  }

  stroke(): void {
    this.ctx.stroke();
  }

  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this.ctx.fillText(text, x, y, maxWidth);
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    this.ctx.strokeText(text, x, y, maxWidth);
  }

  translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  scale(x: number, y: number): void {
    this.ctx.scale(x, y);
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): Gradient {
    return this.ctx.createLinearGradient(x0, y0, x1, y1);
  }

  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ): Gradient {
    return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }

  // Stubs for high-level operations to be implemented in subsequent phases/tasks
  drawLetter(_letter: string, _x: number, _y: number, _scale?: number, _bobOffset?: number): void {}

  drawBackground(_clouds: CloudData[], _sparkles: SparkleData[], _frame: number): void {}

  drawOddbodChaser(
    _x: number,
    _y: number,
    _alive: boolean,
    _name: string,
    _bodyColor: string,
    _outlineColor: string,
    _runFrame: number,
    _hasCaught: boolean,
    _catchTimer: number
  ): void {}

  drawZombieChaser(
    _x: number,
    _y: number,
    _alive: boolean,
    _name: string,
    _bodyColor: string,
    _outlineColor: string,
    _runFrame: number,
    _hasCaught: boolean,
    _catchTimer: number
  ): void {}
}
