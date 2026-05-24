# Plan 07: Oddbods Memory Matching

**Target**: Ages 5-7 | **Theme**: Memory / Cards | **Characters**: Alphabet + Oddbods + Zombies

## Story
Jeff (organized Oddbod) shuffled all the letter cards! Match pairs to help him sort the alphabet. Friendly zombies peek from the card edges as decoration.

## Mechanics
- Grid of face-down cards showing letters
- Flip two cards per turn
- Match: letter cheer animation, cards stay face-up
- No match: gold pulse, cards flip back after 1.5 seconds
- Zombie cards appear randomly as "bonus" matches
- Grid sizes: 4×3 (6 pairs) up to 6×6 (18 pairs)

## Card Designs
Each card has a letter rendered as its Alphabet Lore character:
- Standard letters A-Z with their signature colors and eyes
- Special "Oddbod wildcard" — match two Oddbods for extra points
- Special "Zombie wildcard" — match two zombies for a silly dance

## Oddbod Reactions
Each correctly matched pair triggers a reaction:
- Bubbles: Cheers with confetti popper
- Fuse: Pounds the table excitedly (screen rumble)
- Jeff: Nods approvingly, checks off on clipboard
- Newt: Claps with heart-shaped sparkles
- Pogo: Laughs and does a handstand
- Slick: Points finger guns "Yeeeah!"
- Zee: Wakes up briefly, gives a thumbs up, falls back asleep

## Zombie Peekers
- Zombie faces peek from behind the card edges
- When all pairs in a round matched: zombies pop out and dance
- Each zombie type has a unique "peek" animation
- No gameplay effect — just fun decoration

## Progression
- Round 1: 4×3 grid (6 pairs) — 8 letters + 4 wildcards
- Round 2: 4×4 grid (8 pairs) — 10 letters + 6 wildcards
- Round 3: 5×4 grid (10 pairs) — 12 letters + 8 wildcards
- Round 4+: 6×6 grid (18 pairs) — all 26 letters + wildcards
- Timer counts up (no pressure, just for fun)
- Best time saved per grid size

## Scoring
- Each match = 10 points
- Consecutive matches = combo multiplier (×2, ×3, ×4)
- Grid completion bonus = 50 points

## Win Condition
- Complete the grid
- No lose condition — every game is a win
- Try to beat your best time

## Code Reuse
- Character drawing (letter faces on cards)
- Celebration particles (match animation)
- Oddbod/Zombie designs
- Gold pulse animation (from Word Pop)

## New Code Needed
- Card class (face-down/face-up state, flip animation)
- Grid renderer (rows/cols with spacing)
- Flip animation (scaleX from 1 to 0 to 1 with card back/front)
- Card back design (Alphabet Lore themed)
- Match detection logic
- Combo tracker
- Timer display
