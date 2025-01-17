import { colors } from './colors';
import { effects } from './effects';

export const theme = {
  colors,
  effects,
  calendar: {
    day: {
      base: `${effects.rounded.md} ${effects.transitions.default}`,
      default: 'hover:bg-neutral-100',
      holiday: `bg-[${colors.secondary.holiday}]/10 text-[${colors.secondary.holiday}]`,
      bridge: `bg-[${colors.secondary.bridge}]/10 text-[${colors.secondary.bridge}]`,
      school: `bg-[${colors.secondary.school}]/10 text-[${colors.secondary.school}]`,
      vacation: {
        person1: `bg-[${colors.primary.ui.person1}]/10 text-[${colors.primary.ui.person1}]`,
        person2: `bg-[${colors.primary.ui.person2}]/10 text-[${colors.primary.ui.person2}]`
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
    primary: `bg-[${colors.primary.beach.ocean}] text-white hover:bg-[${colors.primary.beach.ocean}]/90`,
    secondary: `bg-[${colors.neutral[200]}] text-[${colors.neutral[600]}] hover:bg-[${colors.neutral[300]}]`
  },
  text: {
    heading: `text-[${colors.neutral[900]}] font-bold`,
    body: `text-[${colors.neutral[600]}]`,
    small: `text-[${colors.neutral[600]}] text-sm`,
    secondary: `text-[${colors.neutral[600]}] text-opacity-75`
  }
}

export type Theme = typeof theme;
export { colors, effects }; 