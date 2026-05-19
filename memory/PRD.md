# Quest Hero - Product Requirements Document

## Vision
Transform daily tasks into epic story adventures. Eliminate procrastination by gamifying tasks through narrative-driven gameplay where every completion advances an exciting story.

## Core Concept: Story Grammar System
A flexible narrative structure that works with ANY task type and ANY story theme. The system uses sequence-based progression (Challenge → Action → Victory) so tasks don't need to thematically match the story.

## Features Implemented

### 1. Six Pre-built Story Adventures
- **Wild West Redemption** 🤠 - Save Dusty Gulch from outlaws
- **Space Odyssey: The Last Stand** 🚀 - Defend Earth from alien invasion
- **The Knight's Honor** ⚔️ - Medieval quest against a dark sorcerer
- **Shadows of the City** 🕵️ - Noir detective mystery
- **Dawn of the Dead** 🧟 - Zombie apocalypse survival
- **The Lost Treasure of Captain Kidd** 🏴‍☠️ - Pirate adventure
- Each story: 3 acts, multiple beats, unique villains, 300 max points, 4 badges

### 2. Custom Story Creator
- User-defined title, description, theme (fantasy/sci-fi/horror/adventure/mystery/superhero)
- Configurable number of acts (3, 4, or 5)
- User adds villain names for each act
- Template-based generation creates intro, challenge, and victory beats
- Last act gets epic FINALE with bigger reward

### 3. AI Villain Image Generation
- Uses Gemini Nano Banana (gemini-3.1-flash-image-preview)
- **AGGRESSIVELY CACHED**: Each villain image generated ONCE, cached forever in MongoDB
- User-triggered generation (button on story beat) to control credit usage
- Falls back to emoji icons if not generated

### 4. Streak System
- Daily streak counter on home screen 🔥
- Bonus points on victory beats:
  - 3+ day streak: +10 bonus points
  - 7+ day streak: +25 bonus points
- Longest streak tracked for bragging rights

### 5. Recurring Tasks
- Frequencies: One-time, Daily, Weekly, Monthly
- Auto-creates next instance when completed
- Perfect for habits like daily workouts or weekly meal prep

### 6. Sound & Haptics
- Haptic feedback on task completion (Medium impact)
- Success notification haptic on victory
- Confetti animation on victory modal

## Technical Architecture

### Backend (FastAPI + MongoDB)
- **Models**: Story, StoryAct, StoryBeat, Task, UserProgress, UserStreak
- **Stories file**: /app/backend/stories_data.py (separate for maintainability)
- **Image caching**: MongoDB collection with villain_name as key
- **Endpoints**: Story CRUD, Task CRUD with recurring, Streak tracking, AI image generation
- **Integration**: emergentintegrations for AI

### Frontend (React Native + Expo)
- **Navigation**: Tab-based (Home, Tasks, Stories, Profile) + modal (Create Story)
- **State**: AppContext for global state
- **Components**: VictoryModal (with confetti), StoryBeatCard (with AI image), TaskCard
- **Themes**: Each story uses its own gradient colors from backend

## Testing Status
- ✅ Backend: 20/20 tests passing (100%)
- ✅ All 6 stories verified
- ✅ Custom story creator verified
- ✅ Streak system verified
- ✅ Recurring tasks verified
- ✅ AI image endpoint registered (live test skipped to save credits)
- ✅ Full story playthrough verified

## Smart Business Enhancement
**Story Pack DLC Model**: The flexible story grammar makes it easy to add premium story packs (seasonal, branded collaborations, user-generated content marketplace). The custom story creator paves the way for user-shared story templates and a community-driven content ecosystem - perfect monetization opportunity through premium themes, AI-generated narratives, and shareable adventure packs.
