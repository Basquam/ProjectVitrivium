# Quest Hero - Product Requirements Document

## Vision
Transform daily tasks into cinematic story adventures. Eliminate procrastination by gamifying tasks through narrative-driven gameplay where every task completion advances an epic story with deep emotional immersion.

## Core Concept: Story Grammar System
A flexible narrative structure that works with ANY task type and ANY story theme. The system uses sequence-based progression (Challenge → Action → Victory) so tasks don't need to thematically match the story.

## Visual Design Language (v2.0 — Cinematic Edition)
- **Archetype**: Jewel & Luxury - Cinematic, moody, immersive interactive novel
- **Color Strategy**: Deep black background (#0A0A0A) with theme-tinted gradients per story universe
- **Typography**: Each story uses its own display font (Rye for Western, Orbitron for Sci-Fi, Cinzel for Medieval/Pirate, Oswald for Horror, Courier Prime for Noir)
- **Effects**: Glassmorphism (expo-blur), cinematic background images, theme-tint overlays, react-native-reanimated entrance animations, haptic feedback
- **Tab Bar**: Themed labels (Quest / Missions / Worlds / Hero) with translucent blur background

## Features Implemented

### 1. Six Cinematic Story Adventures
Each story is a complete world with unique colors, fonts, and atmospheric background image:
- **Wild West Redemption** 🤠 - Dust, sepia, sunset (Rye font)
- **Space Odyssey: The Last Stand** 🚀 - Neon violet void (Orbitron font)
- **The Knight's Honor** ⚔️ - Torchlight & velvet (Cinzel font)
- **Shadows of the City** 🕵️ - Noir high-contrast (Courier Prime font)
- **Dawn of the Dead** 🧟 - Toxic green decay (Oswald font)
- **The Lost Treasure of Captain Kidd** 🏴‍☠️ - Ocean midnight (Cinzel font)

### 2. Custom Story Forge
- Cinematic creation form with theme-tinted live preview
- 6 theme presets (Fantasy / Sci-Fi / Horror / Adventure / Mystery / Hero)
- Configurable acts (3, 4, or 5)
- Named villain inputs with numbered badges
- Smart narrative template generation

### 3. AI Villain Image Generation
- Gemini Nano Banana (gemini-3.1-flash-image-preview) via emergentintegrations
- AGGRESSIVELY CACHED in MongoDB image_cache
- User-triggered generation (button on story beat) for credit control

### 4. Streak System
- Featured fire-gradient card on Profile screen
- Streak badge in Home header
- Bonus XP: +10 (3+ days), +25 (7+ days)
- Longest streak tracked

### 5. Recurring Quests
- Single / Daily / Weekly / Monthly frequencies
- Auto-generates next instance on completion

### 6. Cinematic Components (v2.0)
- **CinematicHero**: Full-screen background image with gradient fade
- **JourneyMap**: Vertical timeline showing past beats (✓), current (highlighted), future ("???")
- **QuestCard**: Themed left border, smart confirmation dialogs (web + native)
- **VictoryModal**: Theme-colored, animated, with villain name + streak bonus + badge unlock
- **GlassPanel**: BlurView wrapper with web fallback

### 7. Sound, Haptics & Motion
- Haptic feedback (Heavy on completion, Selection on tap, Success notification on victory)
- Confetti celebrations with theme colors
- Spring animations on beat reveals
- **Gyroscope Parallax**: Hero background subtly drifts as user tilts device — uses expo-sensors DeviceMotion with reanimated springs (damping=25, stiffness=80). Inverse motion creates "window into another world" illusion. Web silently falls back to static. iOS NSMotionUsageDescription added.

## Technical Architecture

### Backend (FastAPI + MongoDB)
- 6 pre-built stories + custom story collection
- Story progression engine with act/beat advancement
- Image caching (cached image served instantly, never regenerated)
- Streak tracking with date deduplication
- Recurring task auto-renewal

### Frontend (React Native + Expo)
- **Theme System**: `/app/frontend/src/theme.ts` - 6 universes with colors, fonts, background images
- **Components**: QuestCard, JourneyMap, GlassPanel, VictoryModal, StoryBeatCard
- **Utils**: Platform-safe `confirmAction` (window.confirm on web, Alert on native)
- **Animation**: react-native-reanimated FadeIn/FadeInDown/FadeInUp with staggered delays
- **Fonts**: Google Fonts via @expo-google-fonts/* (Rye, Orbitron, Cinzel, Oswald, Courier Prime)

## Testing Status
- ✅ Backend: 20/20 tests passing (verified in iteration 1)
- ✅ Visual verification via screenshots (Stories, Quest, Missions, Forge modal)
- ✅ All 6 story themes rendering with proper colors/fonts/backgrounds
- ✅ Journey map showing progression correctly
- ✅ Glassmorphism panels working on web fallback + native

## Smart Business Enhancement
**Story Pack Economy**: With the visual upgrade, premium story packs become highly desirable. Users can purchase themed visual packs (e.g., "Cyberpunk Dystopia", "Ancient Egypt", "Cosmic Horror") that include exclusive AI-generated villain art, custom fonts, atmospheric backgrounds, and unique narrative templates. The custom story creator paves the way for a community marketplace where players share story templates - perfect monetization through premium themes, AI villain art credits, and shareable adventure packs. The cinematic immersion creates the emotional investment that drives in-app purchases.
