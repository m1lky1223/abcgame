export interface ClickEvent {
  x: number
  y: number
}

export class Input {
  private keys = new Set<string>()
  private justPressed = new Set<string>()
  private clicks: ClickEvent[] = []
  mouseX = 0
  mouseY = 0
  mouseDown = false
  mouseDownX = 0
  mouseDownY = 0
  justReleased = false
  mouseJustPressed = false

  attach(): void {
    this.handleDown = this.handleDown.bind(this)
    this.handleUp = this.handleUp.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleTouchCancel = this.handleTouchCancel.bind(this)
    window.addEventListener('keydown', this.handleDown)
    window.addEventListener('keyup', this.handleUp)
    window.addEventListener('click', this.handleClick)
    window.addEventListener('mousedown', this.handleMouseDown)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true })
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true })
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true })
    window.addEventListener('touchcancel', this.handleTouchCancel)
  }

  detach(): void {
    window.removeEventListener('keydown', this.handleDown)
    window.removeEventListener('keyup', this.handleUp)
    window.removeEventListener('click', this.handleClick)
    window.removeEventListener('mousedown', this.handleMouseDown)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('touchstart', this.handleTouchStart)
    window.removeEventListener('touchmove', this.handleTouchMove)
    window.removeEventListener('touchend', this.handleTouchEnd)
    window.removeEventListener('touchcancel', this.handleTouchCancel)
  }

  isDown(key: string): boolean {
    return this.keys.has(key)
  }

  wasPressed(key: string): boolean {
    return this.justPressed.has(key)
  }

  getClicks(): ClickEvent[] {
    return this.clicks
  }

  clearFrame(): void {
    this.justPressed.clear()
    this.clicks = []
    this.justReleased = false
    this.mouseJustPressed = false
  }

  private handleDown(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    const key = e.key.toLowerCase()
    if (key.length === 1 || ['arrowup', 'arrowdown', ' ', 'enter'].includes(key)) {
      e.preventDefault()
    }
    if (!this.keys.has(key)) {
      this.justPressed.add(key)
    }
    this.keys.add(key)
  }

  private handleUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase())
  }

  private handleClick(e: MouseEvent): void {
    this.clicks.push({ x: e.clientX, y: e.clientY })
  }

  private handleMouseDown(e: MouseEvent): void {
    this.mouseDown = true
    this.mouseDownX = e.clientX
    this.mouseDownY = e.clientY
    this.mouseX = e.clientX
    this.mouseY = e.clientY
    this.mouseJustPressed = true
  }

  private handleMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX
    this.mouseY = e.clientY
  }

  private handleMouseUp(e: MouseEvent): void {
    this.mouseDown = false
    this.mouseX = e.clientX
    this.mouseY = e.clientY
    this.justReleased = true
  }

  private handleTouchStart(e: TouchEvent): void {
    const t = e.touches[0]
    this.mouseDown = true
    this.mouseDownX = t.clientX
    this.mouseDownY = t.clientY
    this.mouseX = t.clientX
    this.mouseY = t.clientY
    this.mouseJustPressed = true
  }

  private handleTouchMove(e: TouchEvent): void {
    const t = e.touches[0]
    this.mouseX = t.clientX
    this.mouseY = t.clientY
  }

  private handleTouchEnd(e: TouchEvent): void {
    const t = e.changedTouches[0]
    this.mouseDown = false
    this.mouseX = t.clientX
    this.mouseY = t.clientY
    this.justReleased = true
  }

  private handleTouchCancel(): void {
    this.mouseDown = false
    this.justReleased = true
  }
}
