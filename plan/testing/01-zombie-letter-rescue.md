# Plan 01: Zombie Letter Rescue

**Target**: Ages 5-7 | **Theme**: Rescue | **Characters**: Alphabet + Zombies + Oddbods

## Story
Zombies captured letters in their spooky mansion. You play as an Oddbod rescuer. Free all 26 letters!

## Mechanics
- Letters are trapped inside zombie cages
- Each cage shows a word with a missing letter
- Pop the correct floating letter to free the trapped letter
- Wrong letters wake up more zombies (they shuffle around — no penalty)
- Every freed letter joins your rescue team with a cheer animation

## Zombies (7 types as jailers)
- Classic: Guards the front entrance
- Decayed: Patrols the hallways (slow zigzag)
- Toxic: Guards the lab letters (green glow)
- Undead: Night shift (faster but predictable)
- Rotten: Messy cell block (letters scattered)
- Ghoul: Dungeon master
- Mutant: Final boss warden

## Oddbods (Power-ups)
- Bubbles: Slows all zombies temporarily
- Jeff: Shows which letter is correct (hint)
- Pogo: Distracts zombies — they dance away
- Fuse: Burns through cage bars instantly
- Newt: Heals a freed letter (sparkle animation)
- Zee: Freezes zombies in place (nap time!)
- Slick: Reveals the full word with a spotlight

## Win Condition
Free all 26 letters across multiple mansion rooms.
Each room = 4-6 letters. 5-6 rooms total.
Final room: Free the last letter with all zombies active = big celebration.

## Code Reuse
- FloatingLetter.ts (floating letter mechanics)
- Word Pop logic (word + blank + correct letter)
- ZombieChaser.ts (movement AI, designs)
- Celebration particles (Engine.ts)

## New Code Needed
- Cage rendering (bars drawn on canvas)
- Room system (background + zombie layout per room)
- Power-up system (Oddbod activation buttons)
- Letter-free animation (cage breaks, letter flies out)

## Kid-Friendly Notes (Ages 5-7)
- No lives, no game over
- Wrong letter = zombie just shuffles closer (not scary)
- Each freed letter = positive sound/visual reward
- Rooms have treasure chest feel
