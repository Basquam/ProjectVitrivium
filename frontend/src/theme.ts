// Story theme system - colors, fonts, background images per universe

export interface StoryTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  tintOverlay: string;
  atmosphere: string;
  imageUrl: string;
  fontFamily: string;
  emoji: string;
  /** Pixels the parallax image can drift in each direction. Higher = more dramatic motion. */
  motionIntensity: number;
}

export const GLOBAL_THEME = {
  background: '#0A0A0A',
  surface: '#171717',
  surfaceGlass: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: 'rgba(255, 255, 255, 0.1)',
  gold: '#F4C430',
  goldDark: '#B8860B',
};

export const STORY_THEMES: Record<string, StoryTheme> = {
  western: {
    id: 'western',
    name: 'Wild West',
    primary: '#D97706',
    secondary: '#78350F',
    tintOverlay: 'rgba(217, 119, 6, 0.18)',
    atmosphere: 'Dust, sepia, grit, sunset.',
    imageUrl: 'https://static.prod-images.emergentagent.com/jobs/eab5525e-f04a-431c-a4c4-2d2f5b49df87/images/5473144ffb28792bf989b067942b0bf2adbbb2d156c20095403e759cf70442f9.png',
    fontFamily: 'Rye_400Regular',
    emoji: '🤠',
    motionIntensity: 24, // moderate, like dust drifting
  },
  'sci-fi': {
    id: 'sci-fi',
    name: 'Space Odyssey',
    primary: '#8B5CF6',
    secondary: '#4C1D95',
    tintOverlay: 'rgba(139, 92, 246, 0.18)',
    atmosphere: 'Neon, glowing violet, distant void.',
    imageUrl: 'https://static.prod-images.emergentagent.com/jobs/eab5525e-f04a-431c-a4c4-2d2f5b49df87/images/c214256c5a5b974456281021ec4548ab71a789ec75603bfa777e230d65db2adb.png',
    fontFamily: 'Orbitron_700Bold',
    emoji: '🚀',
    motionIntensity: 38, // dramatic, weightless floating
  },
  medieval: {
    id: 'medieval',
    name: 'Medieval',
    primary: '#DC2626',
    secondary: '#7F1D1D',
    tintOverlay: 'rgba(220, 38, 38, 0.18)',
    atmosphere: 'Torchlight, velvet, dark fantasy stone.',
    imageUrl: 'https://static.prod-images.emergentagent.com/jobs/eab5525e-f04a-431c-a4c4-2d2f5b49df87/images/e1417ff934850fe336c35ce6645fe044f6fdef24a86d1651035a8ae2ac594ccd.png',
    fontFamily: 'Cinzel_700Bold',
    emoji: '⚔️',
    motionIntensity: 18, // anchored, heavy stone walls
  },
  noir: {
    id: 'noir',
    name: 'Detective Noir',
    primary: '#E5E7EB',
    secondary: '#374151',
    tintOverlay: 'rgba(255, 255, 255, 0.08)',
    atmosphere: 'High contrast black and white, heavy rain shadows.',
    imageUrl: 'https://static.prod-images.emergentagent.com/jobs/eab5525e-f04a-431c-a4c4-2d2f5b49df87/images/2534cee4664f41371dab018e16dc3505e41068e68dd73a90343c7843e5da52c4.png',
    fontFamily: 'CourierPrime_700Bold',
    emoji: '🕵️',
    motionIntensity: 12, // minimal, oppressive stillness
  },
  horror: {
    id: 'horror',
    name: 'Zombie Horror',
    primary: '#10B981',
    secondary: '#064E3B',
    tintOverlay: 'rgba(16, 185, 129, 0.18)',
    atmosphere: 'Toxic green mist, decay, grunge suspense.',
    imageUrl: 'https://static.prod-images.emergentagent.com/jobs/eab5525e-f04a-431c-a4c4-2d2f5b49df87/images/37c2005f69996e62b3fb6b779ba0d2f8bf1778e754df6c77bfcee3ea6dbd3769.png',
    fontFamily: 'Oswald_700Bold',
    emoji: '🧟',
    motionIntensity: 16, // slow, creeping dread
  },
  pirate: {
    id: 'pirate',
    name: 'Pirate',
    primary: '#06B6D4',
    secondary: '#164E63',
    tintOverlay: 'rgba(6, 182, 212, 0.18)',
    atmosphere: 'Ocean midnight, cyan moon, dark wood.',
    imageUrl: 'https://static.prod-images.emergentagent.com/jobs/eab5525e-f04a-431c-a4c4-2d2f5b49df87/images/89a6ab8f7df0e3d980f3fa24cf5746286b81271d38ce9bb7b935a3aa4648bc70.png',
    fontFamily: 'Cinzel_700Bold',
    emoji: '🏴‍☠️',
    motionIntensity: 34, // rocking ship on waves
  },
};

// DEFAULT theme - shown when no story is active. Uses cosmic/space image because
// it feels UNIVERSAL (all worlds exist in the cosmos), but tinted in gold/neutral
// so it doesn't feel sci-fi specific.
export const DEFAULT_THEME: StoryTheme = {
  id: 'default',
  name: 'Quest Hero',
  primary: '#F4C430',
  secondary: '#B8860B',
  tintOverlay: 'rgba(0, 0, 0, 0.45)', // dark veil instead of color cast - keeps the image neutral/universal
  atmosphere: 'Cinematic gold and shadow.',
  imageUrl: STORY_THEMES['sci-fi'].imageUrl, // cosmic = universal
  fontFamily: 'Cinzel_700Bold',
  emoji: '⚔️',
  motionIntensity: 22, // gentle, calm wonder
};

export const getTheme = (themeId?: string): StoryTheme => {
  if (!themeId) return DEFAULT_THEME;
  return STORY_THEMES[themeId] || DEFAULT_THEME;
};

// Map fantasy/adventure/mystery/superhero (custom story themes) to closest universe
export const getThemeForCustomStory = (theme: string): StoryTheme => {
  const map: Record<string, string> = {
    fantasy: 'medieval',
    adventure: 'pirate',
    mystery: 'noir',
    superhero: 'sci-fi',
  };
  return getTheme(map[theme] || theme);
};
