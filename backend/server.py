from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from enum import Enum
import random

from stories_data import (
    Story, StoryAct, StoryBeat, BeatType, ALL_STORIES, get_story_by_id as get_builtin_story
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")


class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class TaskFrequency(str, Enum):
    ONCE = "once"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


# ============== MODELS ==============
class UserProgress(BaseModel):
    id: str
    story_id: str
    story_title: str
    current_act: int = 1
    current_beat: int = 0
    tasks_completed: int = 0
    total_points: int = 0
    rewards_earned: List[str] = []
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    is_active: bool = True
    
    # === BRANCHING İÇİN YENİ ALANLAR ===
    story_flags: Dict[str, bool] = Field(default_factory=dict)
    villain_health: Dict[str, int] = Field(default_factory=dict)
    hero_momentum: int = 50
    last_task_category: Optional[str] = None


class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    story_id: Optional[str] = None
    due_date: str
    frequency: TaskFrequency = TaskFrequency.ONCE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[str] = None
    frequency: TaskFrequency = TaskFrequency.ONCE


class StoryStartRequest(BaseModel):
    story_id: str


class CustomStoryRequest(BaseModel):
    title: str
    description: str
    theme: str
    icon: str = "📖"
    villains: List[str]
    num_acts: int = 3


class UserStreak(BaseModel):
    current_streak: int = 0
    longest_streak: int = 0
    last_completion_date: Optional[str] = None
    total_completions: int = 0


# ============== HELPER FUNCTIONS ==============
async def get_story_by_id(story_id: str) -> Optional[Story]:
    builtin = get_builtin_story(story_id)
    if builtin:
        return builtin
    story_data = await db.custom_stories.find_one({"id": story_id}, {"_id": 0})
    if story_data:
        return Story(**story_data)
    return None


async def get_active_progress() -> Optional[UserProgress]:
    progress_data = await db.user_progress.find_one({"is_active": True}, {"_id": 0})
    if progress_data:
        return UserProgress(**progress_data)
    return None


def matches_conditions(beat: StoryBeat, progress: UserProgress, task_category: Optional[str] = None) -> bool:
    if not beat.conditions:
        return True
    for key, value in beat.conditions.items():
        if key == "task_category" and task_category:
            if value != task_category:
                return False
        elif key == "required_flags":
            for flag in value:
                if not progress.story_flags.get(flag, False):
                    return False
    return True


def apply_effects(progress: UserProgress, effects: Dict[str, Any], task_category: Optional[str] = None):
    if "villain_health" in effects:
        main_villain = "Billy the Kid"
        if main_villain not in progress.villain_health:
            progress.villain_health[main_villain] = 100
        progress.villain_health[main_villain] = max(0, min(100, progress.villain_health[main_villain] + effects["villain_health"]))
    
    if "add_flags" in effects:
        for flag in effects["add_flags"]:
            progress.story_flags[flag] = True
    
    if "hero_momentum" in effects:
        progress.hero_momentum = max(0, min(100, progress.hero_momentum + effects["hero_momentum"]))
    
    progress.last_task_category = task_category


async def select_next_beat(progress: UserProgress, story: Story, task_category: Optional[str] = None) -> Optional[StoryBeat]:
    current_act = story.acts[progress.current_act - 1]
    possible_beats = [beat for beat in current_act.beats if matches_conditions(beat, progress, task_category)]
    
    if not possible_beats:
        try:
            return current_act.beats[progress.current_beat]
        except:
            return None
    
    weights = [1.8 if b.beat_type in ["reward", "conflict"] else 1.0 for b in possible_beats]
    selected = random.choices(possible_beats, weights=weights, k=1)[0]
    
    apply_effects(progress, selected.effects, task_category)
    return selected


async def get_user_streak() -> UserStreak:
    streak_data = await db.user_streak.find_one({"_id": "main"}, {"_id": 0})
    if streak_data:
        return UserStreak(**streak_data)
    return UserStreak()


async def update_streak_on_completion():
    streak = await get_user_streak()
    today_str = date.today().isoformat()
    yesterday_str = (date.today() - timedelta(days=1)).isoformat()
    
    if streak.last_completion_date == today_str:
        streak.total_completions += 1
    elif streak.last_completion_date == yesterday_str:
        streak.current_streak += 1
        streak.total_completions += 1
        streak.last_completion_date = today_str
    else:
        streak.current_streak = 1
        streak.total_completions += 1
        streak.last_completion_date = today_str
    
    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak
    
    await db.user_streak.update_one(
        {"_id": "main"},
        {"$set": streak.dict()},
        upsert=True
    )
    return streak


# ============== API ROUTES ==============
@api_router.get("/")
async def root():
    return {"message": "Quest Hero API - Where Tasks Become Adventures!"}


@api_router.get("/stories")
async def get_stories():
    built_in = [s.dict() for s in ALL_STORIES]
    custom = await db.custom_stories.find({}, {"_id": 0}).to_list(100)
    return built_in + custom


@api_router.get("/stories/{story_id}")
async def get_story(story_id: str):
    story = await get_story_by_id(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story


@api_router.post("/stories/start")
async def start_story(request: StoryStartRequest):
    existing_progress = await get_active_progress()
    if existing_progress:
        raise HTTPException(status_code=400, detail=f"You already have an active story: {existing_progress.story_title}")
    
    story = await get_story_by_id(request.story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    progress = UserProgress(
        id=f"progress-{datetime.utcnow().timestamp()}",
        story_id=story.id,
        story_title=story.title,
    )
    
    await db.user_progress.insert_one(progress.dict())
    first_beat = story.acts[0].beats[0] if story.acts else None
    
    return {
        "message": "Story started!",
        "progress": progress,
        "current_beat": first_beat
    }


@api_router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    task_data = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = Task(**task_data)
    if task.status == TaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Task already completed")
    
    completed_at = datetime.utcnow()
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": {"status": TaskStatus.COMPLETED, "completed_at": completed_at}}
    )
    task.status = TaskStatus.COMPLETED
    task.completed_at = completed_at
    
    # Update streak
    streak = await update_streak_on_completion()
    
    # Recurring task
    if task.frequency != TaskFrequency.ONCE:
        next_date = date.fromisoformat(task.due_date)
        if task.frequency == TaskFrequency.DAILY:
            next_date = next_date + timedelta(days=1)
        elif task.frequency == TaskFrequency.WEEKLY:
            next_date = next_date + timedelta(days=7)
        elif task.frequency == TaskFrequency.MONTHLY:
            next_date = next_date + timedelta(days=30)
        
        new_task = Task(
            id=f"task-{datetime.utcnow().timestamp()}",
            title=task.title,
            description=task.description,
            category=task.category,
            story_id=task.story_id,
            due_date=next_date.isoformat(),
            frequency=task.frequency,
            status=TaskStatus.PENDING
        )
        await db.tasks.insert_one(new_task.dict())
    
    progress = await get_active_progress()
    if not progress:
        return {"task": task, "streak": streak, "message": "Task completed!"}
    
    story = await get_story_by_id(progress.story_id)
    if not story:
        return {"task": task, "streak": streak}
    
    # === BRANCHING MANTIĞI ===
    new_beat = await select_next_beat(progress, story, task.category)
    
    progress.tasks_completed += 1
    progress.total_points += 20
    
    await db.user_progress.update_one(
        {"id": progress.id},
        {"$set": progress.dict()}
    )
    
    return {
        "task": task,
        "new_beat": new_beat.dict() if new_beat else None,
        "progress": progress,
        "streak": streak,
        "message": "🎉 Task completed! Story progressed."
    }


# Diğer route'lar (orijinal dosyanızdaki gibi)
@api_router.get("/stories/progress/active")
async def get_active_story():
    progress = await get_active_progress()
    if not progress:
        return {"has_active_story": False}
    
    story = await get_story_by_id(progress.story_id)
    current_beat = story.acts[progress.current_act-1].beats[progress.current_beat] if story else None
    
    return {
        "has_active_story": True,
        "progress": progress,
        "story": story,
        "current_beat": current_beat
    }


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
