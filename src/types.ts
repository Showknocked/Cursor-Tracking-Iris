export type EyeStyle = 'classic' | 'cybernet' | 'reptile' | 'anime' | 'clockwork';

export type GazeMode = 'normal' | 'evade' | 'cross' | 'laggy' | 'anxious';

export interface EyeballData {
  id: string;
  x: number; // relative position X (0 to 100 percent of viewport/container)
  y: number; // relative position Y (0 to 100 percent of viewport/container)
  size: number; // size in pixels
  style: EyeStyle;
  irisColor: string;
  pupilColor: string;
  expression: 'normal' | 'shocked' | 'sleepy' | 'giddy';
  blinkState: 'open' | 'closed' | 'winking';
  tension: number; // spring coefficient for movement speed
  label?: string;
}

export interface PresetStyle {
  id: EyeStyle;
  name: string;
  description: string;
  defaultIrisColor: string;
  defaultPupilColor: string;
  colors: string[];
}
