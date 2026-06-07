import { ALL_LETTERS } from '../characters/data'
import { FloatingLetter } from './FloatingLetter'
import { Renderer } from '../renderer/Renderer'

interface Recipe {
  dish: string; emoji: string; letters: string[]
}

const RECIPES: Recipe[] = [
  { dish: 'Apple Pie', emoji: '🍎', letters: ['A', 'P', 'I', 'E'] },
  { dish: 'Carrot Soup', emoji: '🥕', letters: ['C', 'A', 'R', 'O', 'T'] },
  { dish: 'Pizza', emoji: '🍕', letters: ['P', 'I', 'Z', 'A'] },
  { dish: 'Pancakes', emoji: '🥞', letters: ['P', 'A', 'N', 'C', 'K', 'E', 'S'] },
  { dish: 'Cookies', emoji: '🍪', letters: ['C', 'O', 'K', 'I', 'E'] },
  { dish: 'Salad', emoji: '🥗', letters: ['S', 'A', 'L', 'D'] },
  { dish: 'Donuts', emoji: '🍩', letters: ['D', 'O', 'N', 'U', 'T', 'S'] },
  { dish: 'Spaghetti', emoji: '🍝', letters: ['S', 'P', 'A', 'G', 'H', 'E', 'T', 'I'] },
  { dish: 'Sandwich', emoji: '🥪', letters: ['S', 'A', 'N', 'D', 'W', 'I', 'C', 'H'] },
  { dish: 'Tacos', emoji: '🌮', letters: ['T', 'A', 'C', 'O', 'S'] },
  { dish: 'Burger', emoji: '🍔', letters: ['B', 'U', 'R', 'G', 'E', 'R'] },
  { dish: 'Sushi', emoji: '🍣', letters: ['S', 'U', 'S', 'H', 'I'] },
  { dish: 'Curry', emoji: '🍛', letters: ['C', 'U', 'R', 'R', 'Y'] },
  { dish: 'Steak', emoji: '🥩', letters: ['S', 'T', 'E', 'A', 'K'] },
  { dish: 'Fries', emoji: '🍟', letters: ['F', 'R', 'I', 'E', 'S'] },
  { dish: 'Nachos', emoji: '🧀', letters: ['N', 'A', 'C', 'H', 'O', 'S'] },
  { dish: 'Waffle', emoji: '🧇', letters: ['W', 'A', 'F', 'F', 'L', 'E'] },
  { dish: 'Muffin', emoji: '🧁', letters: ['M', 'U', 'F', 'F', 'I', 'N'] },
  { dish: 'Bagel', emoji: '🥯', letters: ['B', 'A', 'G', 'E', 'L'] },
  { dish: 'Pretzel', emoji: '🥨', letters: ['P', 'R', 'E', 'T', 'Z', 'E', 'L'] },
  { dish: 'Noodles', emoji: '🍜', letters: ['N', 'O', 'O', 'D', 'L', 'E', 'S'] },
  { dish: 'Popcorn', emoji: '🍿', letters: ['P', 'O', 'P', 'C', 'O', 'R', 'N'] },
  { dish: 'Cheese', emoji: '🧀', letters: ['C', 'H', 'E', 'E', 'S', 'E'] },
  { dish: 'Bacon', emoji: '🥓', letters: ['B', 'A', 'C', 'O', 'N'] },
  { dish: 'Melon', emoji: '🍈', letters: ['M', 'E', 'L', 'O', 'N'] },
  { dish: 'Cereal', emoji: '🥣', letters: ['C', 'E', 'R', 'E', 'A', 'L'] },
]

const CRITICS = ['Bubbles', 'Jeff', 'Newt', 'Fuse', 'Pogo', 'Slick', 'Zee']

export class ChefKitchenMode {
  private canvasW: number; private canvasH: number
  private frame = 0; private score = 0; private recipesDone = 0
  private currentRecipe: Recipe | null = null
  private ingredientIndex = 0
  private floatingLetters: FloatingLetter[] = []
  private particles: any[] = []
  private stars = 0; private mistakes = 0
  private correctFlash = 0
  private showServing = false; private servingTimer = 0
  private criticIndex = 0
  private winner = false

  onStateChange?: (s: any) => void

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW; this.canvasH = canvasH
    this.nextRecipe()
  }

  private nextRecipe(): void {
    if (this.recipesDone >= RECIPES.length) { this.winner = true; return }
    this.currentRecipe = RECIPES[this.recipesDone]
    this.ingredientIndex = 0; this.mistakes = 0; this.correctFlash = 0
    this.showServing = false; this.servingTimer = 0
    this.criticIndex = this.recipesDone % CRITICS.length
    this.spawnIngredients()
  }

  private spawnIngredients(): void {
    if (!this.currentRecipe) return
    const needed = this.currentRecipe.letters[this.ingredientIndex]
    const options = [needed]
    const pool = ALL_LETTERS.filter(l => l !== needed)
    while (options.length < 5) {
      const p = pool[Math.floor(Math.random() * pool.length)]
      if (!options.includes(p)) options.push(p)
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]
    }
    this.floatingLetters = options.map(l => new FloatingLetter(this.canvasW, this.canvasH, l, 150))
  }

  handleClick(cx: number, cy: number): void {
    if (this.winner || this.correctFlash > 0 || this.showServing) return
    for (const l of this.floatingLetters) {
      if (!l.collected && l.containsCanvas(cx, cy)) {
        this.checkLetter(l.letter); l.pop(); return
      }
    }
  }

  handleKey(key: string): void {
    if (this.winner || this.correctFlash > 0 || this.showServing) return
    const l = this.floatingLetters.find(f => !f.collected && f.letter.toLowerCase() === key)
    if (l) { this.checkLetter(l.letter); l.pop() }
  }

  private checkLetter(letter: string): void {
    if (!this.currentRecipe) return
    const needed = this.currentRecipe.letters[this.ingredientIndex]
    if (letter === needed) {
      this.score += 10; this.ingredientIndex++
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#f5b041', life: 0, maxLife: 20 })
      }
      if (this.ingredientIndex >= this.currentRecipe.letters.length) {
        this.correctFlash = 1; this.showServing = true; this.servingTimer = 0
        this.recipesDone++
        this.stars += Math.max(1, 3 - this.mistakes)
      }
      this.onStateChange?.({ score: this.score, recipesDone: this.recipesDone, totalRecipes: RECIPES.length })
    } else {
      this.mistakes++
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2; const s = 2 + Math.random() * 3
        this.particles.push({ x: this.canvasW / 2, y: this.canvasH * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#fff', life: 0, maxLife: 15 })
      }
    }
  }

  update(): void {
    if (this.winner) { this.frame++; return }
    this.frame++

    if (this.correctFlash > 0) {
      this.correctFlash++
      if (this.showServing) this.servingTimer++
      if (this.servingTimer > 60) {
        this.showServing = false; this.correctFlash = 0
        this.nextRecipe()
      }
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
      this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
      return
    }

    for (const l of this.floatingLetters) { l.update(0) }
    this.floatingLetters = this.floatingLetters.filter(l => { if (l.collected) return l.popTime < l.popDuration; return true })

    for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++ }
    this.particles = this.particles.filter((p: any) => p.life < p.maxLife)
  }

  draw(ctx: Renderer): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH)
    grad.addColorStop(0, '#1a1a0a'); grad.addColorStop(0.5, '#3a2a1a'); grad.addColorStop(1, '#2a1a0a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.canvasW, this.canvasH)

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(0, this.canvasH * 0.35, this.canvasW, this.canvasH * 0.4)

    if (this.currentRecipe) {
      ctx.font = `${48}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(this.currentRecipe.emoji, this.canvasW / 2, 20)

      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px system-ui'; ctx.fillText(this.currentRecipe.dish, this.canvasW / 2, 75)

      const needed = this.currentRecipe.letters
      const fontSize = 20; const gap = 6
      const startX = (this.canvasW - needed.length * (fontSize + gap)) / 2
      for (let i = 0; i < needed.length; i++) {
        const lx = startX + i * (fontSize + gap)
        if (i < this.ingredientIndex) {
          ctx.fillStyle = '#58d68d'; ctx.font = `bold ${fontSize}px system-ui`
          ctx.textAlign = 'center'; ctx.textBaseline = 'top'
          ctx.fillText(needed[i], lx + fontSize / 2, 110)
        } else if (i === this.ingredientIndex) {
          ctx.strokeStyle = '#f5b041'; ctx.lineWidth = 2; ctx.setLineDash([3, 3])
          ctx.strokeRect(lx, 112, fontSize, fontSize)
          ctx.setLineDash([]); ctx.fillStyle = '#f5b041'
          ctx.font = `bold ${fontSize}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
          ctx.fillText('_', lx + fontSize / 2, 114)
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = `bold ${fontSize}px system-ui`
          ctx.textAlign = 'center'; ctx.textBaseline = 'top'
          ctx.fillText(needed[i], lx + fontSize / 2, 110)
        }
      }

      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('Pop the right ingredient!', this.canvasW / 2, 145)

      for (const l of this.floatingLetters) {
        if (!l.collected) l.draw(ctx, this.frame)
        else if (l.popTime < l.popDuration) l.draw(ctx, this.frame)
      }
    }

    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife; if (a <= 0) continue
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2)
      ctx.fillStyle = p.color; ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, this.canvasW, 32)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillStyle = '#58d68d'
    ctx.fillText(`🍳 Recipes: ${this.recipesDone}/${RECIPES.length}`, 12, 16)
    ctx.textAlign = 'right'; ctx.fillStyle = '#f5b041'
    ctx.fillText(`Score: ${this.score}  ⭐${this.stars}`, this.canvasW - 12, 16)

    if (this.showServing) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`🍽️ ${this.currentRecipe?.dish} Served!`, this.canvasW / 2, this.canvasH / 2 - 30)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`${CRITICS[this.criticIndex]}: ⭐${Math.max(1, 3 - this.mistakes)} stars!`, this.canvasW / 2, this.canvasH / 2 + 10)
    }

    if (this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, this.canvasW, this.canvasH)
      ctx.fillStyle = '#58d68d'; ctx.font = 'bold 30px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🍽️ Restaurant Grand Opening! 🎉', this.canvasW / 2, this.canvasH / 2 - 30)
      ctx.fillStyle = '#f5b041'; ctx.font = '18px system-ui'
      ctx.fillText(`All ${RECIPES.length} recipes cooked! Score: ${this.score}`, this.canvasW / 2, this.canvasH / 2 + 15)
    }
  }

  restart(): void {
    this.score = 0; this.recipesDone = 0; this.ingredientIndex = 0
    this.floatingLetters = []; this.particles = []; this.stars = 0; this.mistakes = 0
    this.correctFlash = 0; this.showServing = false; this.servingTimer = 0
    this.winner = false; this.frame = 0
    this.nextRecipe()
  }
}
