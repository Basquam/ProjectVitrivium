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


class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    story_id: Optional[str] = None
    due_date: str  # ISO date string
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
    villains: List[str]  # list of villain names
    num_acts: int = 3


class UserStreak(BaseModel):
    current_streak: int = 0
    longest_streak: int = 0
    last_completion_date: Optional[str] = None
    total_completions: int = 0


# ============== HELPER FUNCTIONS ==============
async def get_story_by_id(story_id: str) -> Optional[Story]:
    """Get story from built-in or database"""
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


async def get_current_beat(progress: UserProgress, story: Story) -> Optional[StoryBeat]:
    try:
        act = story.acts[progress.current_act - 1]
        return act.beats[progress.current_beat]
    except (IndexError, KeyError):
        return None


async def advance_story(progress: UserProgress, story: Story) -> Dict[str, Any]:
    act = story.acts[progress.current_act - 1]
    
    if progress.current_beat + 1 < len(act.beats):
        progress.current_beat += 1
    elif progress.current_act < story.total_acts:
        progress.current_act += 1
        progress.current_beat = 0
    else:
        progress.is_active = False
        progress.completed_at = datetime.utcnow()
        return {
            "story_completed": True,
            "message": "🎊 You've completed the entire adventure!",
            "final_score": progress.total_points
        }
    
    new_beat = await get_current_beat(progress, story)
    return {
        "story_completed": False,
        "new_beat": new_beat,
        "progress": progress
    }


async def get_user_streak() -> UserStreak:
    streak_data = await db.user_streak.find_one({"_id": "main"}, {"_id": 0})
    if streak_data:
        return UserStreak(**streak_data)
    return UserStreak()


async def update_streak_on_completion():
    """Update streak when a task is completed"""
    streak = await get_user_streak()
    today_str = date.today().isoformat()
    yesterday_str = (date.today() - timedelta(days=1)).isoformat()
    
    if streak.last_completion_date == today_str:
        # Already counted today
        streak.total_completions += 1
    elif streak.last_completion_date == yesterday_str:
        # Consecutive day!
        streak.current_streak += 1
        streak.total_completions += 1
        streak.last_completion_date = today_str
    else:
        # Streak broken or first time
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


async def generate_villain_image(villain_name: str, image_prompt: str) -> Optional[str]:
    """Generate villain image using AI, cached aggressively"""
    # Check cache first
    cached = await db.image_cache.find_one({"villain_name": villain_name}, {"_id": 0})
    if cached and cached.get("image_data"):
        return cached["image_data"]
    
    # Generate new image
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            return None
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"villain-{villain_name}",
            system_message="You are an expert digital artist creating villain character portraits."
        )
        chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
        
        msg = UserMessage(text=f"Create a single character portrait: {image_prompt}. Style: dramatic, cinematic, game art")
        text, images = await chat.send_message_multimodal_response(msg)
        
        if images and len(images) > 0:
            image_data = f"data:{images[0]['mime_type']};base64,{images[0]['data']}"
            # Cache it
            await db.image_cache.insert_one({
                "villain_name": villain_name,
                "image_data": image_data,
                "created_at": datetime.utcnow()
            })
            return image_data
    except Exception as e:
        logger.error(f"Image generation failed for {villain_name}: {str(e)[:200]}")
    return None


# ============== API ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Quest Hero API - Where Tasks Become Adventures!"}

# Story Routes
@api_router.get("/stories")
async def get_stories():
    """Get all available stories (built-in + custom)"""
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
        raise HTTPException(
            status_code=400, 
            detail=f"You already have an active story: {existing_progress.story_title}"
        )
    
    story = await get_story_by_id(request.story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    progress = UserProgress(
        id=f"progress-{datetime.utcnow().timestamp()}",
        story_id=story.id,
        story_title=story.title,
    )
    
    await db.user_progress.insert_one(progress.dict())
    first_beat = await get_current_beat(progress, story)
    
    return {
        "message": "Story started!",
        "progress": progress,
        "current_beat": first_beat
    }


@api_router.post("/stories/abandon")
async def abandon_story():
    """Abandon current story"""
    result = await db.user_progress.update_one(
        {"is_active": True},
        {"$set": {"is_active": False, "completed_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="No active story to abandon")
    return {"message": "Story abandoned"}


@api_router.get("/stories/progress/active")
async def get_active_story():
    progress = await get_active_progress()
    if not progress:
        return {"has_active_story": False, "progress": None}
    
    story = await get_story_by_id(progress.story_id)
    current_beat = await get_current_beat(progress, story)
    
    total_beats = sum(len(act.beats) for act in story.acts)
    beats_completed = sum(len(story.acts[i].beats) for i in range(progress.current_act - 1))
    beats_completed += progress.current_beat
    progress_percentage = (beats_completed / total_beats) * 100
    
    return {
        "has_active_story": True,
        "progress": progress,
        "story": story,
        "current_beat": current_beat,
        "progress_percentage": round(progress_percentage, 1)
    }


# Custom Story Creator
@api_router.post("/stories/custom")
async def create_custom_story(request: CustomStoryRequest):
    """Create a custom story using a template-based approach"""
    if len(request.villains) < request.num_acts:
        raise HTTPException(
            status_code=400, 
            detail=f"Need at least {request.num_acts} villains for {request.num_acts} acts"
        )
    
    # Generate acts with template-based beats
    acts = []
    intro_texts = [
        f"🌟 Your adventure begins. {request.description}",
        "⚡ The journey grows more dangerous. The path ahead is treacherous.",
        "🔥 The final confrontation approaches. Everything has led to this moment."
    ]
    
    for i in range(request.num_acts):
        beats = []
        # Intro beat for first act
        if i == 0:
            beats.append(StoryBeat(
                type=BeatType.INTRO,
                title="The Adventure Begins",
                text=intro_texts[0],
                image_url="✨"
            ))
        elif i == request.num_acts - 1:
            beats.append(StoryBeat(
                type=BeatType.PLOT_TWIST,
                title="The Final Truth",
                text=intro_texts[2 if i >= 2 else 1],
                image_url="🌑"
            ))
        else:
            beats.append(StoryBeat(
                type=BeatType.PLOT_TWIST,
                title="A New Challenge",
                text=intro_texts[1],
                image_url="⚡"
            ))
        
        # Challenge beat
        villain = request.villains[i] if i < len(request.villains) else "Unknown Foe"
        beats.append(StoryBeat(
            type=BeatType.CHALLENGE,
            title=f"Face {villain}",
            text=f"⚔️ {villain} stands in your way! 'You shall not pass without defeating me!'",
            villain_name=villain,
            image_url="⚔️"
        ))
        
        # Victory beat
        is_finale = (i == request.num_acts - 1)
        beats.append(StoryBeat(
            type=BeatType.FINALE if is_finale else BeatType.VICTORY,
            title=f"{'EPIC VICTORY!' if is_finale else f'Defeated {villain}!'}",
            text=f"🎉 {'You have completed your epic journey!' if is_finale else f'You defeated {villain}! The path continues...'}",
            image_url="👑" if is_finale else "⭐",
            reward_points=100 if is_finale else 50 + (i * 25),
            reward_badge=f"{'Legend of ' + request.title if is_finale else 'Defeated ' + villain}"
        ))
        
        acts.append(StoryAct(
            act_number=i + 1,
            title=f"Act {['I', 'II', 'III', 'IV', 'V'][i]}: {villain}'s Domain",
            beats=beats
        ))
    
    total_points = sum(
        beat.reward_points 
        for act in acts 
        for beat in act.beats
    )
    
    story = Story(
        id=f"custom-{datetime.utcnow().timestamp()}",
        title=request.title,
        description=request.description,
        theme=request.theme,
        icon=request.icon,
        color_primary="#8b5cf6",
        color_secondary="#5b21b6",
        total_acts=request.num_acts,
        total_points=total_points,
        acts=acts
    )
    
    await db.custom_stories.insert_one(story.dict())
    return story


@api_router.delete("/stories/custom/{story_id}")
async def delete_custom_story(story_id: str):
    result = await db.custom_stories.delete_one({"id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Custom story not found")
    return {"message": "Custom story deleted"}


# AI Image Generation
@api_router.post("/villains/{villain_name}/generate-image")
async def generate_villain_image_endpoint(villain_name: str, image_prompt: str):
    """Generate or fetch cached villain image"""
    image_data = await generate_villain_image(villain_name, image_prompt)
    if image_data:
        return {"villain_name": villain_name, "image_data": image_data}
    raise HTTPException(status_code=500, detail="Failed to generate image")


@api_router.get("/villains/{villain_name}/image")
async def get_villain_image(villain_name: str):
    """Get cached villain image only"""
    cached = await db.image_cache.find_one({"villain_name": villain_name}, {"_id": 0})
    if cached and cached.get("image_data"):
        return {"villain_name": villain_name, "image_data": cached["image_data"]}
    return {"villain_name": villain_name, "image_data": None}


# Task Routes
@api_router.post("/tasks", response_model=Task)
async def create_task(task_input: TaskCreate):
    progress = await get_active_progress()
    
    # Convert date string to ISO format
    due_date_str = task_input.due_date if task_input.due_date else date.today().isoformat()
    
    task = Task(
        id=f"task-{datetime.utcnow().timestamp()}",
        title=task_input.title,
        description=task_input.description,
        category=task_input.category,
        story_id=progress.story_id if progress else None,
        due_date=due_date_str,
        frequency=task_input.frequency,
        status=TaskStatus.PENDING
    )
    
    await db.tasks.insert_one(task.dict())
    return task


@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    return [Task(**task) for task in tasks]


@api_router.get("/tasks/today", response_model=List[Task])
async def get_today_tasks():
    today = date.today().isoformat()
    tasks = await db.tasks.find({
        "due_date": today,
        "status": TaskStatus.PENDING
    }, {"_id": 0}).to_list(1000)
    return [Task(**task) for task in tasks]


@api_router.get("/tasks/range")
async def get_tasks_by_range(start: str, end: str):
    """Get tasks in date range (YYYY-MM-DD format)"""
    tasks = await db.tasks.find({
        "due_date": {"$gte": start, "$lte": end}
    }, {"_id": 0}).to_list(1000)
    return [Task(**task) for task in tasks]


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
    
    # If recurring, create next instance
    if task.frequency != TaskFrequency.ONCE:
        next_date = date.fromisoformat(task.due_date)
        if task.frequency == TaskFrequency.DAILY:
            next_date = next_date + timedelta(days=1)
        elif task.frequency == TaskFrequency.WEEKLY:
            next_date = next_date + timedelta(days=7)
        elif task.frequency == TaskFrequency.MONTHLY:
            # Approximate month
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
        return {
            "task": task,
            "story_advancement": None,
            "streak": streak,
            "message": "Task completed! Start a story to see your progress come to life!"
        }
    
    story = await get_story_by_id(progress.story_id)
    if not story:
        return {"task": task, "story_advancement": None, "streak": streak}
    
    current_beat = await get_current_beat(progress, story)
    
    victory_data = None
    streak_bonus = 0
    if current_beat and current_beat.type in [BeatType.VICTORY, BeatType.FINALE]:
        # Streak bonus
        if streak.current_streak >= 7:
            streak_bonus = 25
        elif streak.current_streak >= 3:
            streak_bonus = 10
        
        progress.total_points += current_beat.reward_points + streak_bonus
        if current_beat.reward_badge:
            progress.rewards_earned.append(current_beat.reward_badge)
        victory_data = {
            "points_earned": current_beat.reward_points,
            "streak_bonus": streak_bonus,
            "badge_earned": current_beat.reward_badge,
            "victory_text": current_beat.text,
            "villain_name": current_beat.villain_name
        }
    
    progress.tasks_completed += 1
    advancement = await advance_story(progress, story)
    
    await db.user_progress.update_one(
        {"id": progress.id},
        {"$set": progress.dict()}
    )
    
    return {
        "task": task,
        "victory": victory_data,
        "story_advancement": advancement,
        "streak": streak,
        "message": "🎉 Task completed!"
    }


@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}


# Streak Routes
@api_router.get("/streak")
async def get_streak():
    return await get_user_streak()


# Achievement Routes
@api_router.get("/achievements")
async def get_achievements():
    # Aggregate all badges from all progress records
    all_progress = await db.user_progress.find({}, {"_id": 0}).to_list(1000)
    all_badges = []
    total_points = 0
    tasks_completed = 0
    for p in all_progress:
        all_badges.extend(p.get("rewards_earned", []))
        total_points += p.get("total_points", 0)
        tasks_completed += p.get("tasks_completed", 0)
    
    return {
        "achievements": list(set(all_badges)),
        "total_points": total_points,
        "tasks_completed": tasks_completed
    }


@api_router.get("/stats")
async def get_stats():
    all_progress = await db.user_progress.find({}, {"_id": 0}).to_list(1000)
    streak = await get_user_streak()
    
    total_stories_completed = len([p for p in all_progress if not p.get("is_active")])
    total_points = sum(p.get("total_points", 0) for p in all_progress)
    total_tasks = sum(p.get("tasks_completed", 0) for p in all_progress)
    all_badges = []
    for p in all_progress:
        all_badges.extend(p.get("rewards_earned", []))
    
    return {
        "total_stories_completed": total_stories_completed,
        "total_points": total_points,
        "total_tasks_completed": total_tasks,
        "total_badges": len(set(all_badges)),
        "badges": list(set(all_badges)),
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
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

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
