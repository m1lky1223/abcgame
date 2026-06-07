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
import { CHARACTERS } from '../characters/data';


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
  drawLetter(letter: string, x: number, y: number, scale?: number, bobOffset?: number): void {
    const def = CHARACTERS[letter]
    if (!def) return

    const s = scale ?? 1
    const fontSize = 56 * s
    const cx = x + 24 * s
    const cy = y + 28 * s + (bobOffset ?? 0)

    drawLetterBody(this.ctx, def.letter, cx, cy, fontSize, def.bodyColor, def.outlineColor)
    drawEyes(this.ctx, def, cx, cy, fontSize, s)
  }

  drawBackground(clouds: CloudData[], sparkles: SparkleData[], canvasW: number, canvasH: number, frame: number): void {
    const ctx = this.ctx
    const grad = ctx.createLinearGradient(0, 0, 0, canvasH)
    grad.addColorStop(0, '#1a1a3e')
    grad.addColorStop(0.3, '#2d2d6b')
    grad.addColorStop(0.6, '#4a3f7a')
    grad.addColorStop(1, '#2a1a3e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvasW, canvasH)

    for (const s of sparkles) {
      const flicker = Math.sin(frame * 0.05 + s.phase) * 0.4 + 0.6
      ctx.globalAlpha = flicker * 0.5
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    for (const c of clouds) {
      ctx.globalAlpha = c.a
      ctx.fillStyle = '#8899cc'
      ctx.beginPath()
      ctx.ellipse(c.x, c.y, c.w / 2, 14, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(c.x - c.w * 0.25, c.y + 4, c.w * 0.3, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(c.x + c.w * 0.25, c.y + 3, c.w * 0.3, 11, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

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

const EYE_RADIUS = 5;
const PUPIL_RADIUS = 2.5;

function drawLetterBody(
  ctx: CanvasRenderingContext2D,
  letter: string,
  cx: number,
  cy: number,
  fontSize: number,
  bodyColor: string,
  outlineColor: string,
): void {
  ctx.save();
  ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = Math.max(3, fontSize / 18);
  ctx.strokeText(letter, cx, cy);

  ctx.fillStyle = bodyColor;
  ctx.fillText(letter, cx, cy);

  ctx.restore();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  def: { letter: string; eyeWhiteColor: string; pupilColor: string; eyelidColor?: string },
  cx: number,
  cy: number,
  fontSize: number,
  s: number,
): void {
  const eyeR = EYE_RADIUS * s;
  const pupilR = PUPIL_RADIUS * s;
  const eyeY = cy - fontSize * 0.22;

  const hasTwoEyes = !['O', 'R', 'K'].includes(def.letter);

  if (def.letter === 'K') {
    drawCompoundEyes(ctx, cx, cy, fontSize, s);
    return;
  }

  if (!hasTwoEyes) {
    drawSingleEye(ctx, cx, eyeY, eyeR, pupilR, def.eyeWhiteColor, def.pupilColor, def.eyelidColor);
    return;
  }

  const spacing = fontSize * 0.15;
  drawPairEyes(ctx, cx, eyeY, spacing, eyeR, pupilR, def.eyeWhiteColor, def.pupilColor, def.eyelidColor);
}

function drawPairEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  eyeY: number,
  spacing: number,
  eyeR: number,
  pupilR: number,
  whiteColor: string,
  pupilColor: string,
  eyelidColor?: string,
): void {
  for (const side of [-1, 1]) {
    const ex = cx + side * spacing;

    if (eyelidColor) {
      ctx.fillStyle = eyelidColor;
      ctx.fillRect(ex - eyeR - 1, eyeY - eyeR - 4, eyeR * 2 + 2, eyeR + 3);
    }

    ctx.beginPath();
    ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = whiteColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex + 0.5, eyeY, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = pupilColor;
    ctx.fill();
  }
}

function drawSingleEye(
  ctx: CanvasRenderingContext2D,
  cx: number,
  eyeY: number,
  eyeR: number,
  pupilR: number,
  whiteColor: string,
  pupilColor: string,
  eyelidColor?: string,
): void {
  if (eyelidColor) {
    ctx.fillStyle = eyelidColor;
    ctx.fillRect(cx - eyeR - 1, eyeY - eyeR - 4, eyeR * 2 + 2, eyeR + 3);
  }

  ctx.beginPath();
  ctx.arc(cx, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fillStyle = whiteColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx + 0.5, eyeY, pupilR, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}

function drawCompoundEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  fontSize: number,
  s: number,
): void {
  const count = 4;
  const spread = fontSize * 0.08;
  const yBase = cy - fontSize * 0.22;

  for (let i = 0; i < count; i++) {
    const ox = (i - (count - 1) / 2) * spread;
    ctx.beginPath();
    ctx.arc(cx + ox, yBase, 2.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#141414';
    ctx.fill();
  }
}

