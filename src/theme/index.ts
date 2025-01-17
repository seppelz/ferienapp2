import { colors } from './colors';
import { effects } from './effects';

export const theme = {
  colors,
  effects,
  calendar: {
    day: {
      base: `${effects.rounded.md} ${effects.transitions.default}`,
      default: 'hover:bg-neutral-100',
      holiday: 'bg-red-100/80 text-red-700',
      bridge: 'bg-orange-100/80 text-orange-700',
      school: 'bg-purple-100/80 text-purple-700',
      vacation: {
        person1: 'bg-sky-100/80 text-sky-700',
        person2: 'bg-emerald-100/80 text-emerald-700'
      }
    },
    container: `${effects.glass.light} ${effects.shadows.lg} ${effects.rounded.lg} p-4`
  },
  card: {
    base: `${effects.glass.light} ${effects.shadows.md} ${effects.rounded.lg}`,
    hover: `hover:${effects.shadows.lg} ${effects.transitions.default}`,
    active: `${effects.shadows.xl} scale-[1.02]`
  },
  button: {
    base: `${effects.rounded.full} ${effects.transitions.default} px-4 py-2`,
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
  },
  text: {
    heading: 'text-neutral-900 font-bold',
    body: 'text-neutral-600',
    small: 'text-neutral-600 text-sm',
    secondary: 'text-neutral-600/75'
  }
}

export type Theme = typeof theme;
export { colors, effects }; 