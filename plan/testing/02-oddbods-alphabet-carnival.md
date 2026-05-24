# Plan 02: Oddbods Alphabet Carnival

**Target**: Ages 5-7 | **Theme**: Carnival / Mini-games | **Characters**: Alphabet + Oddbods + Zombies

## Story
The Oddbods run a carnival with 7 booths! Each booth is a different alphabet mini-game. Zombies are visiting guests having fun.

## The 7 Booths (one per Oddbod)

### Booth 1: Bubbles' Balloon Pop 🎈
- Balloons with letters float up
- Pop balloons matching the target letter
- Wrong pop = balloon squeaks and deflates slowly (funny)
- Zombie: Clown zombie holds the balloon string

### Booth 2: Fuse's Fire Ring 🔥
- Hoops with letters appear in a row
- Type/pop the correct letter before the hoop closes
- Zombie: Fire-jumping zombie (hula hoop with flames)

### Booth 3: Jeff's Sorting Maze 🧩
- Letters tumble in a maze
- Guide them to the correct A-Z exit
- Drag or click to direct
- Zombie: Maze guard zombie (just waves)

### Booth 4: Newt's Candy Catch 🍬
- Candies with letters fall from above (uses Collectible.ts!)
- Catch the right letter candy in a basket
- Wrong candy = melts into a sparkle puddle
- Zombie: Candy-craving zombie under the basket

### Booth 5: Pogo's Prank Pop 🤡
- Letters wear silly disguises (hats, glasses)
- Find and pop the letter that starts the given word
- Zombie: Prank-victim zombie with a pie in face

### Booth 6: Slick's Dance Sequence 💃
- A dance pattern shows letter sequence
- Press/pop letters in rhythm to match the dance
- Zombie: Dance-off zombie (copies your moves)

### Booth 7: Zee's Naptime Match 😴
- Memory card matching with letters
- Flip cards to find matching letter pairs
- Zombie: Sleeping zombie — don't wake it (whisper mode)
- Actually: waking it is fun, it just yawns and goes back to sleep

## Progression
- Each booth awards tickets (1-3 stars)
- Collect enough tickets to unlock the next booth
- After all 7 booths = Grand Prize celebration
- Zombie guests line up for a photo with all Oddbods

## Code Reuse
- FloatingLetter.ts (balloon pop, candy catch)
- Collectible.ts (candy catch — first active use!)
- Character drawing (letter faces, zombie sprites)
- Word pop logic (prank booth)
- Celebration particles

## New Code Needed
- Booth selection screen (carnival map)
- Each booth = self-contained mini-game loop (like AngryMode pattern)
- Ticket counter UI
- Memory card flip animation (Zee booth)
- Dance sequence tracking (Slick booth)

## Kid-Friendly Notes
- Colorful carnival aesthetic
- No booth has a "lose" state — just low score
- Zombie carnival guests are friendly, not scary
- Tickets are always positive (even 1 star is a win)
