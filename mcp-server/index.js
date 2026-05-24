import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const MODES = [
  { id: "free", category: "Core", name: "Free Pop", desc: "Pop floating letters. Collect all 26 before the OddBods do.", emoji: "🎈" },
  { id: "word", category: "Core", name: "Word Pop", desc: "See an emoji + word with a blank. Pop the correct letter.", emoji: "📖" },
  { id: "survival", category: "Core", name: "Survival", desc: "3 lives. Avoid OddBods & Zombies while collecting letters.", emoji: "❤️" },
  { id: "timeattack", category: "Core", name: "Time Attack", desc: "60-second score rush. Collect as many letters as you can.", emoji: "⏱️" },
  { id: "wordrace", category: "Core", name: "Word Race", desc: "Spell the word in order while chasers pursue you.", emoji: "🔤" },
  { id: "defense", category: "Core", name: "Defense", desc: "Protect letters. Click to kill approaching chasers.", emoji: "🛡️" },
  { id: "angry", category: "Arcade", name: "Odd Birds", desc: "Angry Birds-style. Launch projectiles at letter blocks to destroy all 26.", emoji: "🐦" },
  { id: "rescue", category: "Arcade", name: "Rescue", desc: "Free caged letters from zombies across multiple rooms.", emoji: "🏚️" },
  { id: "carnival", category: "Arcade", name: "Carnival", desc: "7 booths: balloon pop, fire ring, candy catch, sorting maze, prank pop, dance sequence, memory match.", emoji: "🎪" },
  { id: "dance", category: "Arcade", name: "Dance Academy", desc: "Follow the letter dance pattern. Copy the sequence to score.", emoji: "💃" },
  { id: "runner", category: "Arcade", name: "Runner", desc: "Endless runner. Collect letters while avoiding obstacles.", emoji: "🏃" },
  { id: "lab", category: "Arcade", name: "Evolution Lab", desc: "Merge letters to evolve them into new forms.", emoji: "🧬" },
  { id: "balloon", category: "Arcade", name: "Balloon Pop", desc: "Pop letter balloons before they float away. 20 waves.", emoji: "🎈" },
  { id: "memory", category: "Arcade", name: "Memory Match", desc: "Flip cards and match letter pairs. 4 rounds of increasing difficulty.", emoji: "🧠" },
  { id: "chef", category: "Arcade", name: "Chef Kitchen", desc: "Cook recipes by finding the right ingredients for each letter.", emoji: "👨‍🍳" },
  { id: "detective", category: "Arcade", name: "Detective", desc: "Solve 26 letter-based mysteries by finding clues in scenes.", emoji: "🔍" },
  { id: "zombieSchool", category: "Arcade", name: "Zombie School", desc: "Survive lessons while zombies chase. Learn all 26 letters.", emoji: "📚" },
  { id: "pirate", category: "Arcade", name: "Pirate Hunt", desc: "Zombie pirates hunt for alphabet treasure. Pop the right letter chests.", emoji: "🏴‍☠️" },
  { id: "circus", category: "Arcade", name: "Circus", desc: "Ringmaster the circus! 7 acts with zombie acrobats and Oddbods.", emoji: "🎪" },
  { id: "shooting", category: "Arcade", name: "Shooting Gallery", desc: "Side-scrolling shooter. Pick off zombies carrying letters before they reach you.", emoji: "🎯" },
  { id: "pizza", category: "Mini-Game", name: "Pizza Delivery", desc: "Zombie customers order pizza with missing letter toppings. Pop the right letter to make their pizza!", emoji: "🍕" },
  { id: "construction", category: "Mini-Game", name: "Construction Site", desc: "Build 26 alphabet playground structures by popping the right building materials.", emoji: "🏗️" },
  { id: "mail", category: "Mini-Game", name: "Mail Carriers", desc: "Deliver 26 letters across town by stamping envelopes with the correct letter.", emoji: "📬" },
  { id: "garden", category: "Mini-Game", name: "Alphabet Garden", desc: "Water 26 plants with letter droplets. Each plant grows through 3 stages.", emoji: "🌸" },
  { id: "fire", category: "Mini-Game", name: "Firefighters", desc: "Extinguish fires at 26 buildings by spraying the right water letters.", emoji: "🚒" },
  { id: "doctor", category: "Mini-Game", name: "Zombie Doctor", desc: "Cure 26 zombie patients by giving them the right letter medicine.", emoji: "🏥" },
  { id: "train", category: "Mini-Game", name: "Alphabet Train", desc: "Load 26 letter cargo boxes onto the train. Complete the journey across all stations.", emoji: "🚂" },
  { id: "space", category: "Mini-Game", name: "Space Explorers", desc: "Discover 26 celestial wonders by completing space transmissions.", emoji: "🚀" },
  { id: "bakery", category: "Mini-Game", name: "Zombie Bakery", desc: "Serve 26 letter-shaped treats to zombie customers at the bakery.", emoji: "🧁" },
  { id: "aquarium", category: "Mini-Game", name: "Alphabet Aquarium", desc: "Discover 26 sea creatures by popping the right letter bubbles.", emoji: "🐠" },
]

const CHARACTERS = [
  { letter: "A", bodyColor: "#D24545", role: "hero", desc: "The main hero! Red letter who leads the alphabet." },
  { letter: "B", bodyColor: "#A2BEFF", role: "ally", desc: "Blue ally with a calm, supportive personality." },
  { letter: "C", bodyColor: "#FFE777", role: "ally", desc: "Yellow ally — bright and energetic." },
  { letter: "D", bodyColor: "#88C170", role: "ally", desc: "Green ally — grounded and reliable." },
  { letter: "E", bodyColor: "#46B0A9", role: "ally", desc: "Teal ally — clever and adaptable." },
  { letter: "F", bodyColor: "#000000", role: "enemy", desc: "Dark enemy letter. One of the antagonists." },
  { letter: "G", bodyColor: "#6E5B7C", role: "ally", desc: "Purple ally — mysterious and wise." },
  { letter: "H", bodyColor: "#B8D2C5", role: "ally", desc: "Silver-green ally with dark eyes." },
  { letter: "I", bodyColor: "#BFD4ED", role: "ally", desc: "Light blue ally — gentle and thoughtful." },
  { letter: "J", bodyColor: "#AA95B3", role: "ally", desc: "Mauve ally — creative and playful." },
  { letter: "K", bodyColor: "#FFFF00", role: "ally", desc: "Bright yellow ally — stands out in the crowd." },
  { letter: "L", bodyColor: "#5E9B8B", role: "ally", desc: "Forest green ally — steady and dependable." },
  { letter: "M", bodyColor: "#A1282D", role: "ally", desc: "Crimson ally — strong and bold." },
  { letter: "N", bodyColor: "#F5A05F", role: "enemy", desc: "Orange enemy letter. An antagonist." },
  { letter: "O", bodyColor: "#007DA5", role: "ally", desc: "Ocean blue ally — deep and thoughtful." },
  { letter: "P", bodyColor: "#D46782", role: "ally", desc: "Pink ally — warm and caring." },
  { letter: "Q", bodyColor: "#E1D2AE", role: "ally", desc: "Cream ally — elegant and refined." },
  { letter: "R", bodyColor: "#782D2D", role: "ally", desc: "Maroon ally — passionate and determined." },
  { letter: "S", bodyColor: "#9FC381", role: "ally", desc: "Sage green ally — balanced and harmonious." },
  { letter: "T", bodyColor: "#666C73", role: "ally", desc: "Gray ally — practical and grounded." },
  { letter: "U", bodyColor: "#B4E182", role: "ally", desc: "Lime ally — fresh and energetic." },
  { letter: "V", bodyColor: "#01548A", role: "ally", desc: "Navy ally — loyal and trustworthy." },
  { letter: "W", bodyColor: "#7E709B", role: "ally", desc: "Lavender ally — imaginative and unique." },
  { letter: "X", bodyColor: "#FFFFFF", role: "enemy", desc: "White enemy letter. Mysterious antagonist." },
  { letter: "Y", bodyColor: "#FFFFFF", role: "ally", desc: "White ally with warm tones — bright and cheerful." },
  { letter: "Z", bodyColor: "#FFFFFF", role: "ally", desc: "White ally with cool tones — the final letter, wise and complete." },
]

const WORDS = [
  { word: "JUPITER", emoji: "🪐", blankIndex: 0 }, { word: "DRAGON", emoji: "🐉", blankIndex: 1 }, { word: "BANANA", emoji: "🍌", blankIndex: 4 },
  { word: "PHANTOM", emoji: "👻", blankIndex: 3 }, { word: "VOLCANO", emoji: "🌋", blankIndex: 5 }, { word: "KNIGHT", emoji: "⚔️", blankIndex: 2 },
  { word: "WIZARD", emoji: "🧙", blankIndex: 4 }, { word: "BRIDGE", emoji: "🌉", blankIndex: 1 }, { word: "FOSSIL", emoji: "🦴", blankIndex: 3 },
  { word: "GALAXY", emoji: "🌌", blankIndex: 5 }, { word: "HARBOR", emoji: "⚓", blankIndex: 0 }, { word: "JUNGLE", emoji: "🌴", blankIndex: 2 },
  { word: "LANTERN", emoji: "🏮", blankIndex: 4 }, { word: "MIRAGE", emoji: "🏜️", blankIndex: 1 }, { word: "NEBULA", emoji: "🌫️", blankIndex: 3 },
  { word: "ORACLE", emoji: "🔮", blankIndex: 5 }, { word: "PLANET", emoji: "🌍", blankIndex: 0 }, { word: "PUZZLE", emoji: "🧩", blankIndex: 2 },
  { word: "RHYTHM", emoji: "🥁", blankIndex: 4 }, { word: "SAILOR", emoji: "⛵", blankIndex: 1 }, { word: "TORNADO", emoji: "🌪️", blankIndex: 3 },
  { word: "TROPHY", emoji: "🏆", blankIndex: 5 }, { word: "VIKING", emoji: "🛡️", blankIndex: 0 }, { word: "WHISPER", emoji: "🤫", blankIndex: 2 },
  { word: "ALBUM", emoji: "💿", blankIndex: 4 }, { word: "CANYON", emoji: "🏔️", blankIndex: 1 }, { word: "ELIXIR", emoji: "🧪", blankIndex: 3 },
  { word: "GONDOLA", emoji: "🚡", blankIndex: 5 }, { word: "HYPNOS", emoji: "💤", blankIndex: 0 }, { word: "KETCHUP", emoji: "🍅", blankIndex: 2 },
  { word: "ABYSS", emoji: "🕳️", blankIndex: 4 }, { word: "BEACON", emoji: "💡", blankIndex: 1 }, { word: "CHIMNEY", emoji: "🏭", blankIndex: 3 },
  { word: "DUNGEON", emoji: "🏰", blankIndex: 5 }, { word: "EMERALD", emoji: "💚", blankIndex: 0 }, { word: "FLAMINGO", emoji: "🦩", blankIndex: 2 },
  { word: "GLACIER", emoji: "🧊", blankIndex: 4 }, { word: "HORIZON", emoji: "🌅", blankIndex: 6 }, { word: "IGLOO", emoji: "🏔️", blankIndex: 1 },
  { word: "JEWELRY", emoji: "💎", blankIndex: 3 }, { word: "KOALA", emoji: "🐨", blankIndex: 4 }, { word: "LIZARD", emoji: "🦎", blankIndex: 0 },
  { word: "MYSTERY", emoji: "🕵️", blankIndex: 2 }, { word: "NOSEBAG", emoji: "🎒", blankIndex: 4 }, { word: "OXFORD", emoji: "🎓", blankIndex: 1 },
  { word: "PANTHER", emoji: "🐆", blankIndex: 3 }, { word: "QUARTZ", emoji: "💎", blankIndex: 5 }, { word: "RADIANT", emoji: "🌟", blankIndex: 0 },
  { word: "SABER", emoji: "⚔️", blankIndex: 2 }, { word: "TEMPEST", emoji: "⛈️", blankIndex: 4 }, { word: "ULTIMAT", emoji: "🏁", blankIndex: 1 },
  { word: "VORTEX", emoji: "🌀", blankIndex: 3 }, { word: "WALRUS", emoji: "🦭", blankIndex: 5 }, { word: "YOGURT", emoji: "🥛", blankIndex: 0 },
  { word: "ZEPHYR", emoji: "🌬️", blankIndex: 2 }, { word: "ANKLET", emoji: "📿", blankIndex: 4 }, { word: "BURGLAR", emoji: "🥷", blankIndex: 1 },
  { word: "CORAL", emoji: "🪸", blankIndex: 3 }, { word: "DUSTY", emoji: "💨", blankIndex: 4 }, { word: "EASEL", emoji: "🎨", blankIndex: 0 },
  { word: "FABRIC", emoji: "🧵", blankIndex: 2 }, { word: "GARLIC", emoji: "🧄", blankIndex: 5 }, { word: "HEDGE", emoji: "🌳", blankIndex: 1 },
  { word: "INSIGN", emoji: "🎖️", blankIndex: 3 }, { word: "JASMINE", emoji: "🌸", blankIndex: 4 }, { word: "KARATE", emoji: "🥋", blankIndex: 0 },
  { word: "LOYAL", emoji: "🤝", blankIndex: 2 }, { word: "MANTIS", emoji: "🦗", blankIndex: 5 }, { word: "NOVICE", emoji: "🧑‍🎓", blankIndex: 1 },
  { word: "OCTAVE", emoji: "🎵", blankIndex: 3 }, { word: "PALACE", emoji: "🏛️", blankIndex: 4 }, { word: "RABBIT", emoji: "🐇", blankIndex: 0 },
  { word: "SALMON", emoji: "🐟", blankIndex: 2 }, { word: "TEMPLE", emoji: "🛕", blankIndex: 5 }, { word: "UMPIRE", emoji: "🧑‍⚖️", blankIndex: 1 },
  { word: "VENDOR", emoji: "🧑‍🌾", blankIndex: 3 }, { word: "WAGON", emoji: "🛒", blankIndex: 4 }, { word: "ZOMBIE", emoji: "🧟", blankIndex: 0 },
  { word: "BASKET", emoji: "🧺", blankIndex: 2 }, { word: "CACTUS", emoji: "🌵", blankIndex: 5 }, { word: "DINNER", emoji: "🍽️", blankIndex: 1 },
  { word: "EAGLE", emoji: "🦅", blankIndex: 3 }, { word: "FLOWER", emoji: "🌸", blankIndex: 4 }, { word: "GUITAR", emoji: "🎸", blankIndex: 0 },
  { word: "HAMMER", emoji: "🔨", blankIndex: 2 }, { word: "ISLAND", emoji: "🏝️", blankIndex: 5 }, { word: "JACKET", emoji: "🧥", blankIndex: 1 },
  { word: "KETTLE", emoji: "🫖", blankIndex: 3 }, { word: "LADDER", emoji: "🪜", blankIndex: 4 }, { word: "MARTIAN", emoji: "👽", blankIndex: 0 },
  { word: "NUGGET", emoji: "🍗", blankIndex: 2 }, { word: "ORANGE", emoji: "🍊", blankIndex: 5 }, { word: "PIRATE", emoji: "🏴‍☠️", blankIndex: 1 },
  { word: "ROBOT", emoji: "🤖", blankIndex: 3 }, { word: "SCARF", emoji: "🧣", blankIndex: 4 }, { word: "TUNNEL", emoji: "🚇", blankIndex: 0 },
  { word: "UNICORN", emoji: "🦄", blankIndex: 2 }, { word: "VIOLIN", emoji: "🎻", blankIndex: 5 }, { word: "WHARF", emoji: "⛵", blankIndex: 1 },
  { word: "YACHT", emoji: "🛥️", blankIndex: 3 }, { word: "SILVER", emoji: "🥈", blankIndex: 4 }, { word: "COPPER", emoji: "🪙", blankIndex: 0 },
  { word: "BRONZE", emoji: "🥉", blankIndex: 2 }, { word: "CRYSTAL", emoji: "🔮", blankIndex: 5 }, { word: "MARBLE", emoji: "🏛️", blankIndex: 1 },
  { word: "VELVET", emoji: "🟪", blankIndex: 3 }, { word: "TURBINE", emoji: "💨", blankIndex: 4 }, { word: "PISTON", emoji: "⚙️", blankIndex: 0 },
  { word: "BOILER", emoji: "🔥", blankIndex: 2 }, { word: "FORGE", emoji: "🔧", blankIndex: 3 }, { word: "ANVIL", emoji: "🔨", blankIndex: 1 },
  { word: "SPHINX", emoji: "🗿", blankIndex: 3 }, { word: "CHARIOT", emoji: "🐎", blankIndex: 4 }, { word: "OBELISK", emoji: "🏛️", blankIndex: 0 },
  { word: "PYLON", emoji: "⚡", blankIndex: 2 }, { word: "TANDEM", emoji: "🚲", blankIndex: 5 }, { word: "VELOCE", emoji: "🏎️", blankIndex: 1 },
  { word: "MOTIF", emoji: "🎭", blankIndex: 3 }, { word: "SONATA", emoji: "🎼", blankIndex: 4 }, { word: "CADENZ", emoji: "🎵", blankIndex: 0 },
  { word: "LULLABY", emoji: "🎶", blankIndex: 2 }, { word: "CAROL", emoji: "🔔", blankIndex: 2 }, { word: "HARMONY", emoji: "🎵", blankIndex: 1 },
  { word: "BALLAD", emoji: "📜", blankIndex: 3 }, { word: "OPERA", emoji: "🎭", blankIndex: 4 }, { word: "TIMPANI", emoji: "🥁", blankIndex: 0 },
  { word: "PICCOLO", emoji: "🪈", blankIndex: 2 }, { word: "BANJO", emoji: "🪕", blankIndex: 3 }, { word: "UKULELE", emoji: "🎸", blankIndex: 1 },
  { word: "COBALT", emoji: "🔵", blankIndex: 3 }, { word: "UMBRA", emoji: "🌑", blankIndex: 4 }, { word: "AURORA", emoji: "🌌", blankIndex: 0 },
  { word: "CORONA", emoji: "☀️", blankIndex: 2 }, { word: "LUNAR", emoji: "🌙", blankIndex: 2 }, { word: "SOLSTICE", emoji: "🌞", blankIndex: 1 },
  { word: "EQUINOX", emoji: "⚖️", blankIndex: 3 }, { word: "PULSAR", emoji: "🌟", blankIndex: 4 }, { word: "QUASAR", emoji: "💫", blankIndex: 0 },
  { word: "ASTEROID", emoji: "☄️", blankIndex: 2 }, { word: "METEOR", emoji: "🌠", blankIndex: 1 }, { word: "SATELLITE", emoji: "🛰️", blankIndex: 3 },
  { word: "ROVER", emoji: "🚗", blankIndex: 4 }, { word: "RADIUS", emoji: "📐", blankIndex: 0 }, { word: "VECTOR", emoji: "📏", blankIndex: 2 },
  { word: "MATRIX", emoji: "💊", blankIndex: 5 }, { word: "FORMULA", emoji: "🧮", blankIndex: 1 }, { word: "FRACTAL", emoji: "🌀", blankIndex: 3 },
  { word: "PRISM", emoji: "🌈", blankIndex: 4 }, { word: "LENS", emoji: "🔍", blankIndex: 0 }, { word: "MIRROR", emoji: "🪞", blankIndex: 2 },
  { word: "ECHO", emoji: "🗣️", blankIndex: 1 }, { word: "SHADOW", emoji: "👤", blankIndex: 3 }, { word: "FLASK", emoji: "⚗️", blankIndex: 4 },
  { word: "BEAKER", emoji: "🧪", blankIndex: 0 }, { word: "PIPETTE", emoji: "💉", blankIndex: 2 }, { word: "FILTER", emoji: "🧴", blankIndex: 5 },
  { word: "CENTRUM", emoji: "💊", blankIndex: 1 }, { word: "BARNACLE", emoji: "🦪", blankIndex: 3 }, { word: "ANCHOR", emoji: "⚓", blankIndex: 4 },
  { word: "CABIN", emoji: "🪟", blankIndex: 0 }, { word: "DECKHAND", emoji: "🧑‍✈️", blankIndex: 2 }, { word: "FERRY", emoji: "⛴️", blankIndex: 1 },
  { word: "KAYAK", emoji: "🛶", blankIndex: 1 }, { word: "LAGOON", emoji: "🏝️", blankIndex: 3 }, { word: "MARINA", emoji: "⛵", blankIndex: 0 },
  { word: "MONSOON", emoji: "🌧️", blankIndex: 4 }, { word: "OASIS", emoji: "🏖️", blankIndex: 2 }, { word: "PIRANHA", emoji: "🐟", blankIndex: 5 },
  { word: "SARDINE", emoji: "🐟", blankIndex: 1 }, { word: "TSUNAMI", emoji: "🌊", blankIndex: 3 }, { word: "TUNA", emoji: "🐟", blankIndex: 2 },
  { word: "WHALE", emoji: "🐋", blankIndex: 0 }, { word: "PLANKTON", emoji: "🦐", blankIndex: 2 }, { word: "PUFFIN", emoji: "🐧", blankIndex: 5 },
  { word: "ALBATROSS", emoji: "🦅", blankIndex: 3 }, { word: "FALCON", emoji: "🦅", blankIndex: 0 }, { word: "HAWK", emoji: "🦅", blankIndex: 2 },
  { word: "PARROT", emoji: "🦜", blankIndex: 4 }, { word: "RAVEN", emoji: "🐦‍⬛", blankIndex: 1 }, { word: "TOUCAN", emoji: "🦜", blankIndex: 3 },
  { word: "VULTURE", emoji: "🦅", blankIndex: 5 }, { word: "SWALLOW", emoji: "🐦", blankIndex: 0 }, { word: "MAGPIE", emoji: "🐦", blankIndex: 2 },
  { word: "CANARY", emoji: "🐤", blankIndex: 4 }, { word: "CUCKOO", emoji: "🦉", blankIndex: 1 }, { word: "NIGHTIN", emoji: "🎵", blankIndex: 3 },
  { word: "CROCODI", emoji: "🐊", blankIndex: 5 }, { word: "GECKO", emoji: "🦎", blankIndex: 0 }, { word: "PYTHON", emoji: "🐍", blankIndex: 2 },
  { word: "VIPER", emoji: "🐍", blankIndex: 4 }, { word: "TURTLE", emoji: "🐢", blankIndex: 1 }, { word: "TORTOISE", emoji: "🐢", blankIndex: 3 },
  { word: "CHIMP", emoji: "🐵", blankIndex: 3 }, { word: "ORANGUT", emoji: "🦧", blankIndex: 0 }, { word: "BABOON", emoji: "🐵", blankIndex: 2 },
  { word: "MARMOSET", emoji: "🐒", blankIndex: 4 }, { word: "LEMUR", emoji: "🐒", blankIndex: 1 }, { word: "OTTER", emoji: "🦦", blankIndex: 2 },
  { word: "BADGER", emoji: "🦡", blankIndex: 0 }, { word: "WEASEL", emoji: "🐾", blankIndex: 2 }, { word: "MOLAR", emoji: "🦷", blankIndex: 4 },
  { word: "BISCUIT", emoji: "🍪", blankIndex: 1 }, { word: "WAFFLE", emoji: "🧇", blankIndex: 3 }, { word: "MUFFIN", emoji: "🧁", blankIndex: 5 },
  { word: "PRETZEL", emoji: "🥨", blankIndex: 0 }, { word: "BAGEL", emoji: "🥯", blankIndex: 2 }, { word: "CROUTON", emoji: "🥖", blankIndex: 4 },
  { word: "NOODLE", emoji: "🍜", blankIndex: 1 }, { word: "PAPRIKA", emoji: "🌶️", blankIndex: 3 }, { word: "CINNAMON", emoji: "🥮", blankIndex: 5 },
  { word: "GINGER", emoji: "🫚", blankIndex: 0 }, { word: "PICKLE", emoji: "🥒", blankIndex: 2 }, { word: "OLIVE", emoji: "🫒", blankIndex: 4 },
  { word: "CHEDDAR", emoji: "🧀", blankIndex: 1 }, { word: "MASCOT", emoji: "🧸", blankIndex: 3 }, { word: "GADGET", emoji: "📱", blankIndex: 5 },
  { word: "DRONE", emoji: "✈️", blankIndex: 2 }, { word: "GIZMO", emoji: "🔧", blankIndex: 4 }, { word: "LASER", emoji: "🔫", blankIndex: 1 },
  { word: "MAGNET", emoji: "🧲", blankIndex: 3 }, { word: "PLASMA", emoji: "⚡", blankIndex: 5 }, { word: "SONIC", emoji: "〰️", blankIndex: 0 },
  { word: "THERMAL", emoji: "🌡️", blankIndex: 2 }, { word: "ATOM", emoji: "⚛️", blankIndex: 1 }, { word: "FISSION", emoji: "☢️", blankIndex: 4 },
]

const MODE_INSTRUCTIONS = {
  free: "Click or tap floating letters to pop them. Collect all 26 before the OddBods catch them. You can also press the letter key on your keyboard.",
  word: "An emoji and a word with a blank letter appear. Pop the correct letter that fills the blank. Use the emoji as a hint!",
  survival: "You have 3 hearts. Pop letters while avoiding OddBods and Zombies. If a chaser reaches a letter before you, you lose a life.",
  timeattack: "Collect as many letters as you can in 60 seconds. Score as high as possible before time runs out.",
  wordrace: "A word appears. Pop its letters in order (first letter, second letter, etc.) while chasers pursue you.",
  defense: "Letters appear in a protected zone. Chasers approach from both sides. Click chasers to eliminate them before they steal letters.",
  angry: "Aim by moving the mouse. Click and hold to set power, release to launch. Destroy all 26 letter blocks with limited ammo (30 shots). Use OddBods as projectiles with different abilities.",
  rescue: "Free letters trapped in cages. Click cages to break them open. Help each rescued letter escape by guiding them to the exit. Zombies roam each room.",
  carnival: "7 booths: Balloon Pop (pop balloons matching the letter), Fire Ring (jump through rings in letter order), Sorting Maze (find the path), Candy Catch (catch correct letter candies), Prank Pop (pop the right box), Dance Sequence (copy the letter dance), Memory Match (find the pair).",
  dance: "Watch the letter dance pattern. Then repeat it by clicking or pressing the letters in the same order. Longer sequences each round.",
  runner: "Endless runner. Tap/click to jump. Collect letter tokens. Avoid obstacles. Press the matching letter key when you see a letter obstacle to destroy it.",
  lab: "Merge two letters to evolve them into a new letter. Higher letters are worth more points. Reach Z to win!",
  balloon: "Zombies float up with letter balloons. Pop them by clicking or pressing the letter key. 20 waves. Speed and number increase each wave.",
  memory: "Flip cards to find matching letter pairs. Match all pairs to advance to the next round. 4 rounds with increasing cards.",
  chef: "A recipe card shows ingredients with missing letters. Pop the correct letter to add each ingredient. Cook all recipes to win.",
  detective: "Search scenes for 3 clues (fragments) hidden among objects. Then find the letter to solve the case. Talk to witnesses for hints. 26 cases.",
  zombieSchool: "A teacher presents a word. Pop the letter shown from the floating options. 26 lessons, one per letter. Recess every 5 lessons.",
  pirate: "Zombie pirates sail in with letter treasure chests. Pop the chests matching the required letter. Collect all 26 treasures.",
  circus: "7 acts with zombie acrobats and Oddbods. Each act has unique letter-based challenges. Complete all acts for the grand finale.",
  shooting: "Zombies carry letters toward you from the right. Click to shoot. Press R to reload, 1-7 to switch weapons. Collect all 26 letters. Switch between 7 Oddbod shooters each with unique weapons.",
  pizza: "A zombie customer orders a pizza with a missing letter topping. Pop the correct letter topping from the floating options. Serve all 26 orders to win.",
  construction: "A blueprint shows a structure shaped like a letter. Pop the matching letter building material. Build all 26 structures to complete the playground.",
  mail: "An envelope has a word with a missing letter stamp. Pop the correct letter stamp to frank the envelope. Deliver all 26 letters.",
  garden: "A plant pot has a letter on it. Water droplets float with letters. Pop the matching letter to water the plant. 3 waterings per plant (seed → sprout → bloom). Grow all 26.",
  fire: "A building is on fire with a flaming word missing a letter. Spray water droplets with the correct letter to extinguish the flames. Save all 26 buildings.",
  doctor: "A zombie patient has a symptom word with a missing letter. Give them the correct letter medicine bottle. Cure all 26 patients.",
  train: "A train car shows a cargo word with a missing letter. Load the correct letter cargo box onto the train. The train grows longer as you load more. Complete all 26 stops.",
  space: "A zombie astronaut receives a space signal with a missing letter. Pop the correct star letter to complete the transmission. Discover all 26 celestial wonders.",
  bakery: "A zombie customer orders a treat with a missing letter. Pop the correct letter pastry from the bakery. Serve all 26 treats.",
  aquarium: "A sea creature name has a missing letter. Pop the correct letter bubble to name the creature. Discover all 26 sea creatures.",
}

const server = new McpServer({
  name: "ABC World Game",
  version: "1.0.0",
})

server.tool(
  "list_game_modes",
  { category: z.string().optional().describe("Filter by category: Core, Arcade, or Mini-Game") },
  async ({ category }) => {
    let modes = MODES
    if (category) modes = modes.filter(m => m.category === category)
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ count: modes.length, modes }, null, 2),
      }],
    }
  },
)

server.tool(
  "get_character",
  { letter: z.string().length(1).describe("A single uppercase letter A-Z") },
  async ({ letter }) => {
    const c = CHARACTERS.find(c => c.letter === letter.toUpperCase())
    if (!c) return { content: [{ type: "text", text: JSON.stringify({ error: `Character ${letter} not found` }) }] }
    return { content: [{ type: "text", text: JSON.stringify(c, null, 2) }] }
  },
)

server.tool(
  "list_characters",
  { role: z.enum(["hero", "ally", "enemy"]).optional().describe("Filter by role") },
  async ({ role }) => {
    let chars = CHARACTERS
    if (role) chars = chars.filter(c => c.role === role)
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ count: chars.length, characters: chars }, null, 2),
      }],
    }
  },
)

server.tool(
  "get_word",
  { letter: z.string().optional().describe("Find words starting with this letter") },
  async ({ letter }) => {
    if (letter) {
      const upper = letter.toUpperCase()
      const matched = WORDS.filter(w => w.word.startsWith(upper))
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ count: matched.length, words: matched.slice(0, 20) }, null, 2),
        }],
      }
    }
    const random = WORDS[Math.floor(Math.random() * WORDS.length)]
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ word: random, hint: `${random.word.replace(random.word[random.blankIndex], '_')} ${random.emoji}` }, null, 2),
      }],
    }
  },
)

server.tool(
  "get_mode_instructions",
  { mode_id: z.string().describe("The mode ID (e.g. 'free', 'pirate', 'space')") },
  async ({ mode_id }) => {
    const mode = MODES.find(m => m.id === mode_id)
    if (!mode) return { content: [{ type: "text", text: JSON.stringify({ error: `Mode '${mode_id}' not found` }) }] }
    const instructions = MODE_INSTRUCTIONS[mode_id] || "No instructions available for this mode."
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ mode: mode, instructions }, null, 2),
      }],
    }
  },
)

server.tool(
  "get_game_info",
  {},
  async () => {
    const heroCount = CHARACTERS.filter(c => c.role === "hero").length
    const allyCount = CHARACTERS.filter(c => c.role === "ally").length
    const enemyCount = CHARACTERS.filter(c => c.role === "enemy").length
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          name: "ABC World",
          description: "Educational alphabet game for ages 4+. Pop letters, learn the alphabet, and fend off OddBods and Zombies!",
          totalModes: MODES.length,
          totalCharacters: CHARACTERS.length,
          totalWords: WORDS.length,
          categories: {
            core: MODES.filter(m => m.category === "Core").length,
            arcade: MODES.filter(m => m.category === "Arcade").length,
            miniGame: MODES.filter(m => m.category === "Mini-Game").length,
          },
          characters: { heroes: heroCount, allies: allyCount, enemies: enemyCount },
          techStack: "Vite + React 19 + TypeScript + Canvas 2D",
          platforms: { web: "Vite + React", mobile: "React Native + Skia (planned)" },
        }, null, 2),
      }],
    }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
