# Plan 04: Zombie Letter Runner

**Target**: Ages 5-7 | **Theme**: Running / Side-scrolling | **Characters**: Alphabet + Zombies + Oddbods

## Story
Zombies are chasing the Oddbods through Alphabet Town! Run fast, collect letter power-ups to escape!

## Mechanics (Side-scrolling Runner)
- Choose an Oddbod to play as (select from 7)
- Side-scrolling landscape auto-scrolls left to right
- Letters scroll in from the right as collectible items
- Press the matching key to grab the letter before it scrolls off-screen
- Zombies chase from behind the screen edge
- If a zombie catches you: tickle animation (1 sec stun), lose the current letter
- No lives — just keep running!

## The 7 Oddbods (Playable Characters)
| Oddbod | Speed | Special Ability |
|--------|-------|----------------|
| Bubbles | Medium | Magnet — attracts letters from further away |
| Fuse | Medium-Fast | Boost — short speed burst after 3 correct letters |
| Jeff | Slow | Radar — shows next 3 incoming letters |
| Newt | Slow | Shield — protects current letter from zombies |
| Pogo | Fast | Double Jump — avoids zombie grab |
| Slick | Medium | Glide — floats over obstacles |
| Zee | Slowest | Invincible — zombies can't catch for 5 sec after hit |

## Zombie Chasers (7 pursuer types)
- Classic: Steady speed, never tires
- Decayed: Stumbles (pauses randomly)
- Toxic: Leaves green goo puddles (slow you down)
- Undead: Phases through obstacles
- Rotten: Slow but accelerates over time
- Ghoul: Teleports closer every few seconds
- Mutant: Fastest but predictable straight line

## Collectible Letters
- Appear as items on the scrolling path
- Press matching key to collect (keyboard = +2 points)
- Click on letter = +1 point
- Some letters are high up (jump required), some low
- Collecting all 26 letters in a run = "Alphabet Runner" badge

## Obstacles (Age-appropriate)
- Puddles (hop over, slow down if hit)
- Boxes (slide under or jump over)
- Flowers (just decorative, no penalty)
- Letter gates (must have collected that letter to pass through)

## Win Condition
- Endless mode — run as far as you can
- Distance tracked in meters
- Letters collected tracked
- High score saved to localStorage
- Bonus: collect 26 unique letters = perfect alphabet run

## Uses Collectible.ts!
- The existing **Collectible.ts** was built for exactly this mechanic
- Spawns at right edge, scrolls left, letter + bob animation
- Contains `getBounds()` for collision detection
- No integration needed — it's ready to wire up

## Code Reuse
- Collectible.ts (existing but unused — primary mechanic!)
- Input.ts (keyboard detection)
- FloatingLetter.ts (letter visuals and particles)
- ZombieChaser.ts (zombie sprites)
- Character drawing

## New Code Needed
- Parallax scrolling background (buildings, trees, town)
- Ground rendering with scrolling tiles
- Jump physics (gravity, ground collision)
- Oddbod selection screen
- Obstacle spawner
- Distance counter
- Letter collection tracker UI

## Kid-Friendly Notes
- No dying — zombies just tickle you (silly animation)
- Running theme is energetic and fun
- Choose-your-Oddbod adds personalization
- Collecting letters feels like gathering power-ups
- High score encourages replay without pressure
