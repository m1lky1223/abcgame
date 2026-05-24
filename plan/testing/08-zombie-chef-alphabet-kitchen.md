# Plan 08: Zombie Chef — Alphabet Kitchen

**Target**: Ages 5-7 | **Theme**: Cooking / Food | **Characters**: Alphabet + Zombies + Oddbods

## Story
Zombie chefs need ingredients starting with each letter to cook! Oddbods are the restaurant critics. Help the zombies cook delicious alphabet meals!

## Mechanics
- A recipe card appears showing a dish (e.g., "🍎 Apple Pie")
- 3-5 ingredient slots are shown, each with a letter blank
- Letters float as ingredients (A = Apple, B = Butter, C = Cinnamon, etc.)
- Pop each correct letter in order to add the ingredient
- Wrong letter = zombie chef sneezes flour (screen dust, harmless reset)
- After all ingredients collected: zombie serves the dish to Oddbod critics

## Recipe Examples
| Dish | Letters Needed |
|------|---------------|
| 🍎 Apple Pie | A, P, I, E |
| 🥕 Carrot Soup | C, A, R, O, T |
| 🍝 Spaghetti | S, P, A, G, H, E, T, I |
| 🍕 Pizza | P, I, Z, A |
| 🥞 Pancakes | P, A, N, C, K, E, S |
| 🍪 Cookies | C, O, O, K, I, E |
| 🥗 Salad | S, A, L, D |
| 🍩 Donuts | D, O, N, U, T, S |

## Zombie Chefs (7 types, each with chef hat)
- Classic: Head Chef — wears tall white hat, makes comfort food
- Decayed: Pastry Chef — makes cakes and pies (dusty with flour)
- Toxic: Smoothie Master — all green smoothies (healthy!)
- Undead: Line Cook — works night shift, makes midnight snacks
- Rotten: Gardener — uses only fresh produce (some is overripe)
- Ghoul: Grill Master — handles the barbecue
- Mutant: Experimental — fusion cuisine (surprisingly good)

## Oddbod Restaurant Critics
- Bubbles: Nutrition rating (5/5 for balanced meals)
- Jeff: Presentation (5/5 if plate is neat)
- Newt: Taste (5/5 for sweet dishes)
- Fuse: Heat level (5/5 for spicy food)
- Pogo: Fun factor (5/5 for messy foods)
- Slick: Style rating (5/5 for fancy plating)
- Zee: Comfort rating (5/5 for cozy meals)

## Scoring
- Each correct ingredient = 10 points
- Full recipe completed = 50 bonus
- 3 stars per Oddbod critic = up to 21 stars per dish
- Star requirements: speed (fast = more stars), accuracy (no mistakes = more stars)

## Win Condition
- Complete 26 recipes (one per letter starter)
- After all 26 = "Alphabet Restaurant Grand Opening" celebration
- All 7 zombie chefs + 7 Oddbods dining together

## Visual Style
- Kitchen background (stove, counter, fridge)
- Ingredients bounce in as floating letter items
- Zombie chefs in aprons and hats
- Food particles (splashes, steam, sparkles)

## Code Reuse
- FloatingLetter.ts (floating ingredient items)
- Word Pop logic (blank letter in word)
- ZombieChaser.ts (zombie visual designs)
- Celebration particles

## New Code Needed
- Recipe bank (original data structure — dish + ingredient letters)
- Kitchen background rendering
- Chef hat/accessory drawing on zombies
- Plate service animation (zombie presents dish)
- Oddbod critic reaction panel (star rating)
- Ingredient letter visual (food item with letter)
