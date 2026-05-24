import { CHARACTERS } from './data'

const EYE_RADIUS = 5
const PUPIL_RADIUS = 2.5

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  letter: string,
  x: number,
  y: number,
  scale = 1,
  bobOffset = 0,
): void {
  const def = CHARACTERS[letter]
  if (!def) return

  const s = scale
  const fontSize = 56 * s
  const cx = x + 24 * s
  const cy = y + 28 * s + bobOffset

  drawLetterBody(ctx, def.letter, cx, cy, fontSize, def.bodyColor, def.outlineColor)
  drawEyes(ctx, def, cx, cy, fontSize, s)
}

function drawLetterBody(
  ctx: CanvasRenderingContext2D,
  letter: string,
  cx: number,
  cy: number,
  fontSize: number,
  bodyColor: string,
  outlineColor: string,
): void {
  ctx.save()
  ctx.font = `bold ${fontSize}px "Arial Black", Arial, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.strokeStyle = outlineColor
  ctx.lineWidth = Math.max(3, fontSize / 18)
  ctx.strokeText(letter, cx, cy)

  ctx.fillStyle = bodyColor
  ctx.fillText(letter, cx, cy)

  ctx.restore()
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  def: { letter: string; eyeWhiteColor: string; pupilColor: string; eyelidColor?: string },
  cx: number,
  cy: number,
  fontSize: number,
  s: number,
): void {
  const eyeR = EYE_RADIUS * s
  const pupilR = PUPIL_RADIUS * s
  const eyeY = cy - fontSize * 0.22

  const hasTwoEyes = !['O', 'R', 'K'].includes(def.letter)

  if (def.letter === 'K') {
    drawCompoundEyes(ctx, cx, cy, fontSize, s)
    return
  }

  if (!hasTwoEyes) {
    drawSingleEye(ctx, cx, eyeY, eyeR, pupilR, def.eyeWhiteColor, def.pupilColor, def.eyelidColor)
    return
  }

  const spacing = fontSize * 0.15
  drawPairEyes(ctx, cx, eyeY, spacing, eyeR, pupilR, def.eyeWhiteColor, def.pupilColor, def.eyelidColor)
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
    const ex = cx + side * spacing

    if (eyelidColor) {
      ctx.fillStyle = eyelidColor
      ctx.fillRect(ex - eyeR - 1, eyeY - eyeR - 4, eyeR * 2 + 2, eyeR + 3)
    }

    ctx.beginPath()
    ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2)
    ctx.fillStyle = whiteColor
    ctx.fill()

    ctx.beginPath()
    ctx.arc(ex + 0.5, eyeY, pupilR, 0, Math.PI * 2)
    ctx.fillStyle = pupilColor
    ctx.fill()
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
    ctx.fillStyle = eyelidColor
    ctx.fillRect(cx - eyeR - 1, eyeY - eyeR - 4, eyeR * 2 + 2, eyeR + 3)
  }

  ctx.beginPath()
  ctx.arc(cx, eyeY, eyeR, 0, Math.PI * 2)
  ctx.fillStyle = whiteColor
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx + 0.5, eyeY, pupilR, 0, Math.PI * 2)
  ctx.fillStyle = pupilColor
  ctx.fill()
}

function drawCompoundEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  fontSize: number,
  s: number,
): void {
  const count = 4
  const spread = fontSize * 0.08
  const yBase = cy - fontSize * 0.22

  for (let i = 0; i < count; i++) {
    const ox = (i - (count - 1) / 2) * spread
    ctx.beginPath()
    ctx.arc(cx + ox, yBase, 2.5 * s, 0, Math.PI * 2)
    ctx.fillStyle = '#141414'
    ctx.fill()
  }
}
