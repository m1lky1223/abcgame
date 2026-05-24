export interface CharacterDef {
  letter: string
  bodyColor: string
  outlineColor: string
  eyelidColor?: string
  eyeWhiteColor: string
  pupilColor: string
  role: 'hero' | 'enemy' | 'ally'
}

export const CHARACTERS: Record<string, CharacterDef> = {
  A: { letter: 'A', bodyColor: '#D24545', outlineColor: '#932525', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'hero' },
  B: { letter: 'B', bodyColor: '#A2BEFF', outlineColor: '#6977C9', eyelidColor: '#6B82FE', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  C: { letter: 'C', bodyColor: '#FFE777', outlineColor: '#FFB75C', eyelidColor: '#EE7750', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  D: { letter: 'D', bodyColor: '#88C170', outlineColor: '#59895F', eyelidColor: '#4B693D', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  E: { letter: 'E', bodyColor: '#46B0A9', outlineColor: '#298EA1', eyelidColor: '#324757', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  F: { letter: 'F', bodyColor: '#000000', outlineColor: '#2B2B2B', eyeWhiteColor: '#fff', pupilColor: '#e74c3c', role: 'enemy' },
  G: { letter: 'G', bodyColor: '#6E5B7C', outlineColor: '#4F415A', eyelidColor: '#403148', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  H: { letter: 'H', bodyColor: '#B8D2C5', outlineColor: '#454F4C', eyeWhiteColor: '#000', pupilColor: '#fff', role: 'ally' },
  I: { letter: 'I', bodyColor: '#BFD4ED', outlineColor: '#8FA7CF', eyelidColor: '#424051', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  J: { letter: 'J', bodyColor: '#AA95B3', outlineColor: '#937AB5', eyelidColor: '#645A7B', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  K: { letter: 'K', bodyColor: '#FFFF00', outlineColor: '#FFCD0C', eyeWhiteColor: '#141414', pupilColor: '#484848', role: 'ally' },
  L: { letter: 'L', bodyColor: '#5E9B8B', outlineColor: '#467368', eyelidColor: '#254F41', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  M: { letter: 'M', bodyColor: '#A1282D', outlineColor: '#5E1C1C', eyelidColor: '#621619', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  N: { letter: 'N', bodyColor: '#F5A05F', outlineColor: '#B5654C', eyelidColor: '#F06F4D', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'enemy' },
  O: { letter: 'O', bodyColor: '#007DA5', outlineColor: '#1558A4', eyelidColor: '#1558A4', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  P: { letter: 'P', bodyColor: '#D46782', outlineColor: '#D64E65', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  Q: { letter: 'Q', bodyColor: '#E1D2AE', outlineColor: '#A28C78', eyelidColor: '#71735D', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  R: { letter: 'R', bodyColor: '#782D2D', outlineColor: '#4A1D1C', eyelidColor: '#4A1E1F', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  S: { letter: 'S', bodyColor: '#9FC381', outlineColor: '#59A056', eyelidColor: '#326856', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  T: { letter: 'T', bodyColor: '#666C73', outlineColor: '#4F5359', eyelidColor: '#545454', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  U: { letter: 'U', bodyColor: '#B4E182', outlineColor: '#93B75B', eyelidColor: '#546B3B', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  V: { letter: 'V', bodyColor: '#01548A', outlineColor: '#013A62', eyelidColor: '#082341', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  W: { letter: 'W', bodyColor: '#7E709B', outlineColor: '#544A6B', eyelidColor: '#31243F', eyeWhiteColor: '#fff', pupilColor: '#6D0201', role: 'ally' },
  X: { letter: 'X', bodyColor: '#FFFFFF', outlineColor: '#7D729B', eyeWhiteColor: '#fff', pupilColor: '#e74c3c', role: 'enemy' },
  Y: { letter: 'Y', bodyColor: '#FFFFFF', outlineColor: '#E8D9C1', eyelidColor: '#9F5A46', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
  Z: { letter: 'Z', bodyColor: '#FFFFFF', outlineColor: '#98BABA', eyelidColor: '#3D768E', eyeWhiteColor: '#fff', pupilColor: '#1a1a2e', role: 'ally' },
}

export const ALL_LETTERS = Object.keys(CHARACTERS)
export const ALLY_LETTERS = ALL_LETTERS.filter(l => CHARACTERS[l].role !== 'enemy')
export const ENEMY_LETTERS = ALL_LETTERS.filter(l => CHARACTERS[l].role === 'enemy')
