# Plan 05: Alphabet Evolution Lab

**Target**: Ages 5-7 | **Theme**: Science / Collection | **Characters**: Alphabet + Zombies + Oddbods

## Story
Bubbles (the science Oddbod) built an Evolution Machine! It can transform letters into Oddbod hybrids or Zombie hybrids! Collect all 52 evolutions!

## Mechanics
- Standard Free Pop mode as the base gameplay loop
- Pop floating letters to earn "Evolution Points" (DNA tokens)
- Each popped letter can be evolved in the Lab
- Two evolution paths per letter:

### Oddbod Path (Cute & Colorful)
| Level | Transformation | Visual |
|-------|---------------|--------|
| 0 | Bare letter | Standard Alphabet Lore drawing |
| 1 | Oddbod-tinted | Letter takes on an Oddbod's color palette |
| 2 | Oddbod accessory | Letter gains goggles, hat, or bow of that Oddbod |
| 3 | Full fusion | Letter shape inside Oddbod silhouette with eyes |

### Zombie Path (Silly & Spooky)
| Level | Transformation | Visual |
|-------|---------------|--------|
| 0 | Bare letter | Standard Alphabet Lore drawing |
| 1 | Zombie-tinted | Letter gets green/pale tint |
| 2 | Zombie feature | Stitches, cracks, or glowing eyes added |
| 3 | Full fusion | Letter with zombie features (tattered edges, green glow) |

## Oddbod DNA Donors
Each Oddbod corresponds to a set of letters:
- Bubbles (Yellow): A, B, C — goggles + springy antenna
- Fuse (Red): D, E, F — flame eyebrows, red glow
- Jeff (Purple): G, H, I — bow tie, organized stripes
- Newt (Pink): J, K, L — heart-shaped accessories, blush
- Pogo (Blue): M, N, O — prank glasses, springy limbs
- Slick (Orange): P, Q, R — sunglasses, gold chain
- Zee (Green): S, T, U — sleepy eyes, pillow accessory

(Remaining letters: V-Z are "bonus evolutions" — when all 7 Oddbods are used, these letters get ALL Oddbod traits combined = "Rainbow Evolution")

## Zombie DNA Donors
Each zombie type infects different letter traits:
- Classic: Stitches + bandages
- Decayed: Cracked surface + dust
- Toxic: Green glow + drip
- Undead: Pale + dark circles
- Rotten: Mold spots + decayed edges
- Ghoul: Horns + claws
- Mutant: Extra eyes + tendrils

## Collection Gallery
- Grid display showing all collected evolutions
- 26 letters × 2 paths = 52 total collectibles
- Unfilled slots show as silhouettes (encourages collection)
- Completed rows trigger celebration

## Lab Screen
- Bubbles at a lab table with beakers
- Evolution machine is a large device in center
- Select a letter → choose Oddbod or Zombie path → animation plays
- Machine glows, sparks fly, transformed letter appears

## Progression
- Start with basic Free Pop
- Earn 5 DNA per letter popped (click = 5, keyboard = 10)
- Evolution costs: Level 1 = 10 DNA, Level 2 = 25 DNA, Level 3 = 50 DNA
- Each letter must be evolved separately

## Win Condition
- Collect all 52 evolutions
- Final celebration: "Alphabet Evolution Complete!"
- All 26 letters parade across screen in their final forms

## Code Reuse
- Engine.ts Free Pop mode (base gameplay)
- FloatingLetter.ts (pop loop)
- draw.ts (character drawing — parameterized for evolutions)
- celebration particles

## New Code Needed
- Evolution UI overlay (letter grid, evolution buttons)
- DNA token system (earn + spend)
- Evolution rendering per level (color shifts, accessory drawing)
- Lab background scene
- Evolution animation (machine glow, letter transformation)
- Collection gallery screen

## Kid-Friendly Notes
- Science/lab theme is exciting (beakers, potions, machines)
- Collecting feels like completing a sticker book
- Two paths = replay value without pressure
- No wrong decisions — both paths are equally rewarding
- Big colorful buttons for evolution choices
