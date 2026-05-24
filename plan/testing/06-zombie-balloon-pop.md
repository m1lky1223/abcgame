# Plan 06: Zombie Balloon Pop

**Target**: Ages 5-7 | **Theme**: Balloons / Floating | **Characters**: Alphabet + Zombies + Oddbods

## Story
Zombies are floating away on letter balloons! Pop the balloons to bring them back down. Oddbods are on the ground with a net!

## Mechanics
- Zombie chasers float upward holding letter balloons
- Each balloon has a visible letter on it
- Click the balloon or press the matching key to pop it
- Popped balloon = zombie drops down with "Oof!" animation
- Oddbod on ground catches zombie with a net (cheer animation)
- New zombie waves spawn with increasing speed
- Each zombie type has a different floating pattern

## Zombie Floating Patterns
- Classic: Zigzag upward
- Decayed: Steady drift with occasional stutter-stop
- Toxic: Spiral pattern (spinning as it floats)
- Undead: Slow steady float (predictable)
- Rotten: Bouncy — random speed changes
- Ghoul: Teleport — vanishes and reappears higher
- Mutant: Fast straight-line upward (hardest)

## Oddbod Ground Crew
- All 7 Oddbods stand at the bottom with a giant net
- The net is drawn across the bottom of the screen
- When a zombie drops: the nearest Oddbod catches them
- Bubbles cheers, Pogo does a victory bounce, Jeff checks them off a list
- After catching all zombies in a wave: group celebration

## Scoring
- Click pop = +1
- Keyboard pop = +2
- Chain bonus: pop 3+ balloons within 2 seconds = +5 bonus
- Each wave completed = +10 bonus

## Wave System
- Wave 1: 3 balloons (slow)
- Wave 2: 5 balloons (medium)
- Wave 3: 7 balloons (faster)
- Difficulty scales every 3 waves
- Speed cap at reasonable level for 5-7 year olds

## Win Condition
- Endless waves — play as long as you want
- High score tracked in localStorage
- Collect 25 balloons in a single game = "Balloon Master" badge
- No lose condition — just balloons that float off screen (they come back next wave)

## Visual Style
- Bright sky gradient background
- Colorful balloons with string tails
- Balloons wobble in the wind
- Zombies designed with cute upward drift expressions

## Code Reuse
- ZombieChaser.ts (all 7 zombie visual designs)
- FloatingLetter.ts (pop mechanic, particles)
- Input.ts (click + keyboard)
- Celebration particles

## New Code Needed
- Upward drift movement (vs chasing toward letters)
- Balloon rendering (oval + string + letter text)
- Wave spawning system
- Zombie floating pattern AI (zigzag, spiral, etc.)
- Ground net drawing (Oddbods holding net)
- Combo timer (2-second chain window)
