# Plan 09: Oddbods Detective Agency

**Target**: Ages 5-7 | **Theme**: Mystery / Detective | **Characters**: Alphabet + Oddbods + Zombies

## Story
A letter of the alphabet goes missing! The Oddbods detective team is on the case. Friendly zombies are witnesses in each scene.

## Mechanics (26 cases — one per letter)
- A scene is displayed (jungle, castle, space, ocean, etc.)
- The missing letter is hidden somewhere in the scene
- Click suspicious objects to reveal letter fragments
- 3 fragments collected = the full letter appears
- Pop the escaped letter to solve the case
- Each case = one letter of the alphabet

## Oddbod Detective Roles
- Jeff: Lead Detective — organizes the clue board, connects the dots
- Bubbles: Forensics — analyzes clues with a magnifying glass
- Fuse: Muscle — knocks down doors (but politely)
- Newt: Witness Interviewer — asks zombies what they saw
- Pogo: Undercover — disguises as a zombie (hilarious)
- Slick: Stakeout — watches from a car with donuts
- Zee: Night Watch — sleeps on the job but notices things in dreams

## Zombie Witnesses (7 types per case rotation)
- Each zombie witnessed something
- Click the zombie to hear their clue (speech bubble)
- Classic: "I saw something round... like a circle!"
- Toxic: "It was green! Very green!"
- Decayed: "It was old. Ancient even."
- Undead: "It happened at midnight!"
- Rotten: "It smelled funny!"
- Ghoul: "There was a strange growling sound!"
- Mutant: "It was... different. Very different!"

## Interactive Scene Objects
Each scene has 6-8 clickable objects:
- 3 hide letter fragments (click to find)
- 2 are zombie witnesses (click for clue)
- Remaining are fun interactions (birds fly away, flower blooms, etc.)
- Wrong objects have funny animations (no penalty)

## 26 Scene Themes
| Letter | Scene |
|--------|-------|
| A | Apple Orchard |
| B | Beach |
| C | Castle |
| D | Desert |
| E | Egypt (Pyramids) |
| F | Forest |
| G | Garden |
| H | Haunted House |
| I | Igloo |
| J | Jungle |
| K | Kitchen |
| L | Lighthouse |
| M | Mountain |
| N | Night Sky |
| O | Ocean |
| P | Playground |
| Q | Quiet Library |
| R | Rainforest |
| S | Space |
| T | Toy Store |
| U | Underground Cave |
| V | Volcano |
| W | Water Park |
| X | X-ray Lab |
| Y | Yard |
| Z | Zoo |

## Scoring
- Each solved case = 1 letter added to your solved alphabet
- Clues found = bonus points
- No time limit
- Solve all 26 = "Master Detective" badge

## Win Condition
- Solve all 26 cases
- Final celebration: all Oddbods in detective outfits taking a group photo
- Zombies bring a cake shaped like a question mark

## Code Reuse
- Character drawing (letter faces, zombie sprites)
- Click detection (Input.ts)
- FloatingLetter.ts (letter pop when found)
- Celebration particles

## New Code Needed
- Scene rendering per case (26 different backgrounds)
- Interactive object system (clickable with state)
- Fragment collection tracker (3 per case)
- Clue speech bubbles (zombie witness text)
- Detective's notebook UI
- Magnifying glass cursor
- Solved letters display (alphabet chart)
