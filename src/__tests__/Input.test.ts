import { describe, it, expect } from 'vitest'
import { Input } from '../game/Input'

describe('Input', () => {
  it('tracks key down state', () => {
    const input = new Input()
    input.attach()

    const e = new KeyboardEvent('keydown', { key: 'a' })
    window.dispatchEvent(e)

    expect(input.isDown('a')).toBe(true)

    const e2 = new KeyboardEvent('keyup', { key: 'a' })
    window.dispatchEvent(e2)

    expect(input.isDown('a')).toBe(false)
    input.detach()
  })

  it('tracks justPressed for new keys', () => {
    const input = new Input()
    input.attach()

    const e = new KeyboardEvent('keydown', { key: 'b' })
    window.dispatchEvent(e)

    expect(input.wasPressed('b')).toBe(true)
    input.detach()
  })

  it('clears justPressed after clearFrame', () => {
    const input = new Input()
    input.attach()

    const e = new KeyboardEvent('keydown', { key: 'c' })
    window.dispatchEvent(e)

    expect(input.wasPressed('c')).toBe(true)

    input.clearFrame()
    expect(input.wasPressed('c')).toBe(false)
    input.detach()
  })

  it('tracks mouse clicks', () => {
    const input = new Input()
    input.attach()

    const e = new MouseEvent('click', { clientX: 100, clientY: 200 })
    window.dispatchEvent(e)

    const clicks = input.getClicks()
    expect(clicks.length).toBe(1)
    expect(clicks[0].x).toBe(100)
    expect(clicks[0].y).toBe(200)
    input.detach()
  })

  it('clears clicks after clearFrame', () => {
    const input = new Input()
    input.attach()

    const e = new MouseEvent('click', { clientX: 50, clientY: 75 })
    window.dispatchEvent(e)

    input.clearFrame()
    expect(input.getClicks().length).toBe(0)
    input.detach()
  })

  it('tracks mouse position', () => {
    const input = new Input()
    input.attach()

    const e = new MouseEvent('mousemove', { clientX: 300, clientY: 400 })
    window.dispatchEvent(e)

    expect(input.mouseX).toBe(300)
    expect(input.mouseY).toBe(400)
    input.detach()
  })
})
