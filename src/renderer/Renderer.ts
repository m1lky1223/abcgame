export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'bevel' | 'miter' | 'round';
export type TextAlign = 'left' | 'right' | 'center' | 'start' | 'end';
export type TextBaseline = 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';

export interface Gradient {
  addColorStop(offset: number, color: string): void;
}

export interface CloudData {
  x: number;
  y: number;
  w: number;
  a: number;
}

export interface SparkleData {
  x: number;
  y: number;
  phase: number;
  size: number;
}

export interface Renderer {
  readonly width: number;
  readonly height: number;

  fillStyle: string | Gradient;
  strokeStyle: string | Gradient;
  lineWidth: number;
  lineCap: LineCap;
  lineJoin: LineJoin;
  font: string;
  textAlign: TextAlign;
  textBaseline: TextBaseline;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  globalAlpha: number;

  resize(width: number, height: number): void;
  save(): void;
  restore(): void;
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  roundRect(x: number, y: number, w: number, h: number, radii?: number | number[]): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  fill(): void;
  stroke(): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): Gradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): Gradient;

  // High-level operations
  drawLetter(letter: string, x: number, y: number, scale?: number, bobOffset?: number): void;
  drawBackground(clouds: CloudData[], sparkles: SparkleData[], canvasW: number, canvasH: number, frame: number): void;
  drawOddbodChaser(
    x: number,
    y: number,
    alive: boolean,
    name: string,
    bodyColor: string,
    outlineColor: string,
    runFrame: number,
    hasCaught: boolean,
    catchTimer: number
  ): void;
  drawZombieChaser(
    x: number,
    y: number,
    alive: boolean,
    name: string,
    bodyColor: string,
    outlineColor: string,
    runFrame: number,
    hasCaught: boolean,
    catchTimer: number
  ): void;
}
