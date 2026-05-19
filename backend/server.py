from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== ENUMS ==============
class BeatType(str, Enum):
    INTRO = "intro"
    CHALLENGE = "challenge"
    VICTORY = "victory"
    PLOT_TWIST = "plot_twist"
    FINALE = "finale"

class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

# ============== MODELS ==============
class StoryBeat(BaseModel):
    type: BeatType
    title: str
    text: str
    image_url: Optional[str] = None
    villain_name: Optional[str] = None
    reward_points: int = 0
    reward_badge: Optional[str] = None

class StoryAct(BaseModel):
    act_number: int
    title: str
    beats: List[StoryBeat]

class Story(BaseModel):
    id: str
    title: str
    description: str
    theme: str
    total_acts: int
    acts: List[StoryAct]
    total_points: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

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
    due_date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[date] = None

class TaskComplete(BaseModel):
    task_id: str

class StoryStartRequest(BaseModel):
    story_id: str

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    badge_icon: str
    earned_at: datetime

# ============== WILD WEST STORY DATA ==============
WILD_WEST_STORY = Story(
    id="wild-west-redemption",
    title="Wild West Redemption",
    description="You're a mysterious wanderer who rides into Dusty Gulch, a town terrorized by outlaws. Only you can restore peace and become the hero the West deserves.",
    theme="western",
    total_acts=3,
    total_points=300,
    acts=[
        StoryAct(
            act_number=1,
            title="Act I: Arrival at Dusty Gulch",
            beats=[
                StoryBeat(
                    type=BeatType.INTRO,
                    title="The Dusty Trail",
                    text="🏜️ The sun beats down as you ride into Dusty Gulch. The town is quiet... too quiet. Townsfolk whisper and point. Something is very wrong here.",
                    image_url="🌵",
                    reward_points=0
                ),
                StoryBeat(
                    type=BeatType.CHALLENGE,
                    title="Billy the Kid Appears",
                    text="🤠 'Well, well... a stranger.' Billy the Kid steps out from the saloon, hand hovering over his revolver. 'This town ain't safe for heroes. Turn back now, or face me at high noon!'",
                    villain_name="Billy the Kid",
                    image_url="🔫",
                    reward_points=0
                ),
                StoryBeat(
                    type=BeatType.VICTORY,
                    title="Victory Over Billy",
                    text="💥 BANG! Your draw was faster! Billy the Kid stumbles back in disbelief. 'Impossible...' The townsfolk erupt in cheers! You've proven yourself a true gunslinger!",
                    image_url="⭐",
                    reward_points=50,
                    reward_badge="First Blood"
                ),
                StoryBeat(
                    type=BeatType.CHALLENGE,
                    title="The Dalton Gang Strikes",
                    text="🏦 Suddenly, gunshots ring out! The Dalton Gang is robbing the bank! 'Nobody move!' shouts Grat Dalton. 'This town's money is ours!' The sheriff looks to you desperately.",
                    villain_name="Grat Dalton",
                    image_url="💰",
                    reward_points=0
                ),
                StoryBeat(
                    type=BeatType.VICTORY,
                    title="Bank Saved!",
                    text="⚡ You burst through the bank doors! In a flurry of action, you disarm the gang! 'Get out of here!' they flee in terror. The townspeople lift you on their shoulders. 'You saved our life savings!'",
                    image_url="🎖️",
                    reward_points=75,
                    reward_badge="Bank Guardian"
                )
            ]
        ),
        StoryAct(
            act_number=2,
            title="Act II: The Plot Thickens",
            beats=[
                StoryBeat(
                    type=BeatType.PLOT_TWIST,
                    title="A Dark Secret",
                    text="🌙 That night, the sheriff reveals the truth: 'There's someone behind all this... Black Bart. He's been planning to take over the entire county. And he's gathering his gang for one final attack tomorrow.'",
                    image_url="🌑",
                    reward_points=0
                ),
                StoryBeat(
                    type=BeatType.CHALLENGE,
                    title="The Outlaw Army",
                    text="☀️ Dawn breaks. You see them on the horizon - dozens of outlaws riding toward town! 'There's too many!' cries a townsperson. But you stand firm. 'Not if we're ready for them.'",
                    villain_name="Outlaw Army",
                    image_url="🐎",
                    reward_points=0
                ),
                StoryBeat(
                    type=BeatType.VICTORY,
                    title="The Defense of Dusty Gulch",
                    text="💪 You organized the perfect defense! Barricades, strategy, courage! The outlaws retreat in chaos! 'We've never seen anything like this!' Black Bart's plan is crumbling!",
                    image_url="🛡️",
                    reward_points=75,
                    reward_badge="Town Defender"
                )
            ]
        ),
        StoryAct(
            act_number=3,
            title="Act III: High Noon Showdown",
            beats=[
                StoryBeat(
                    type=BeatType.CHALLENGE,
                    title="Black Bart's Challenge",
                    text="🕛 High noon. Black Bart stands alone in the street. 'You've ruined everything, stranger. But this ends now. You and me. One on one. Winner takes the town.' The clock tower bells begin to chime...",
                    villain_name="Black Bart",
                    image_url="💀",
                    reward_points=0
                ),
                StoryBeat(
                    type=BeatType.FINALE,
                    title="LEGENDARY VICTORY!",
                    text="🎉 DRAW! In the blink of an eye, it's over. Black Bart's gun falls to the dust. The town is saved! The mayor pins a golden sheriff's badge on your chest. 'You're not just a hero... you're a LEGEND!' 🌟",
                    image_url="👑",
                    reward_points=100,
                    reward_badge="Sheriff of the West"
                )
            ]
        )
    ]
)

# ============== HELPER FUNCTIONS ==============
async def get_story_by_id(story_id: str) -> Optional[Story]:
    """Get story from database or return built-in story"""
    if story_id == "wild-west-redemption":
        return WILD_WEST_STORY
    story_data = await db.stories.find_one({"id": story_id})
    if story_data:
        return Story(**story_data)
    return None

async def get_active_progress() -> Optional[UserProgress]:
    """Get the currently active story progress"""
    progress_data = await db.user_progress.find_one({"is_active": True})
    if progress_data:
        return UserProgress(**progress_data)
    return None

async def get_current_beat(progress: UserProgress, story: Story) -> Optional[StoryBeat]:
    """Get the current story beat based on progress"""
    try:
        act = story.acts[progress.current_act - 1]
        beat = act.beats[progress.current_beat]
        return beat
    except (IndexError, KeyError):
        return None

async def advance_story(progress: UserProgress, story: Story) -> Dict[str, Any]:
    """Advance to next beat and return the result"""
    act = story.acts[progress.current_act - 1]
    
    # Check if there are more beats in current act
    if progress.current_beat + 1 < len(act.beats):
        progress.current_beat += 1
    # Check if there are more acts
    elif progress.current_act < story.total_acts:
        progress.current_act += 1
        progress.current_beat = 0
    else:
        # Story completed!
        progress.is_active = False
        progress.completed_at = datetime.utcnow()
        return {
            "story_completed": True,
            "message": "🎊 Congratulations! You've completed the entire story!",
            "final_score": progress.total_points
        }
    
    # Get the new current beat
    new_beat = await get_current_beat(progress, story)
    
    return {
        "story_completed": False,
        "new_beat": new_beat,
        "progress": progress
    }

# ============== API ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Quest Hero API - Where Tasks Become Adventures!"}

# Story Routes
@api_router.get("/stories", response_model=List[Story])
async def get_stories():
    """Get all available stories"""
    # For now, return the built-in Wild West story
    # Later, can add custom stories from database
    return [WILD_WEST_STORY]

@api_router.get("/stories/{story_id}", response_model=Story)
async def get_story(story_id: str):
    """Get a specific story by ID"""
    story = await get_story_by_id(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story

@api_router.post("/stories/start")
async def start_story(request: StoryStartRequest):
    """Start a new story"""
    # Check if there's already an active story
    existing_progress = await get_active_progress()
    if existing_progress:
        raise HTTPException(
            status_code=400, 
            detail=f"You already have an active story: {existing_progress.story_title}"
        )
    
    # Get the story
    story = await get_story_by_id(request.story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Create new progress
    progress = UserProgress(
        id=f"progress-{datetime.utcnow().timestamp()}",
        story_id=story.id,
        story_title=story.title,
        current_act=1,
        current_beat=0,
        tasks_completed=0,
        total_points=0,
        rewards_earned=[],
        is_active=True
    )
    
    await db.user_progress.insert_one(progress.dict())
    
    # Get the first beat
    first_beat = await get_current_beat(progress, story)
    
    return {
        "message": "Story started!",
        "progress": progress,
        "current_beat": first_beat
    }

@api_router.get("/stories/progress/active")
async def get_active_story():
    """Get the currently active story progress"""
    progress = await get_active_progress()
    if not progress:
        return {"has_active_story": False, "progress": None}
    
    story = await get_story_by_id(progress.story_id)
    current_beat = await get_current_beat(progress, story)
    
    # Calculate overall progress percentage
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

# Task Routes
@api_router.post("/tasks", response_model=Task)
async def create_task(task_input: TaskCreate):
    """Create a new task"""
    # Get active story if exists
    progress = await get_active_progress()
    
    task = Task(
        id=f"task-{datetime.utcnow().timestamp()}",
        title=task_input.title,
        description=task_input.description,
        category=task_input.category,
        story_id=progress.story_id if progress else None,
        due_date=task_input.due_date or date.today(),
        status=TaskStatus.PENDING
    )
    
    # Convert task to dict and handle date serialization
    task_dict = task.dict()
    if isinstance(task_dict.get('due_date'), date):
        task_dict['due_date'] = task_dict['due_date'].isoformat()
    
    await db.tasks.insert_one(task_dict)
    return task

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(status: Optional[str] = None):
    """Get all tasks, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    
    tasks = await db.tasks.find(query).to_list(1000)
    return [Task(**task) for task in tasks]

@api_router.get("/tasks/today", response_model=List[Task])
async def get_today_tasks():
    """Get today's tasks"""
    today = date.today()
    tasks = await db.tasks.find({
        "due_date": today.isoformat(),
        "status": TaskStatus.PENDING
    }).to_list(1000)
    return [Task(**task) for task in tasks]

@api_router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    """Complete a task and advance the story"""
    # Get the task
    task_data = await db.tasks.find_one({"id": task_id})
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = Task(**task_data)
    
    if task.status == TaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Task already completed")
    
    # Mark task as completed
    task.status = TaskStatus.COMPLETED
    task.completed_at = datetime.utcnow()
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": {"status": TaskStatus.COMPLETED, "completed_at": task.completed_at}}
    )
    
    # Get active story progress
    progress = await get_active_progress()
    if not progress:
        return {
            "task": task,
            "story_advancement": None,
            "message": "Task completed! Start a story to see your progress come to life!"
        }
    
    # Get current story
    story = await get_story_by_id(progress.story_id)
    if not story:
        return {"task": task, "story_advancement": None}
    
    # Get current beat (should be a challenge or victory)
    current_beat = await get_current_beat(progress, story)
    
    # Award points and badges from current beat if it's a victory beat
    victory_data = None
    if current_beat and current_beat.type in [BeatType.VICTORY, BeatType.FINALE]:
        progress.total_points += current_beat.reward_points
        if current_beat.reward_badge:
            progress.rewards_earned.append(current_beat.reward_badge)
        victory_data = {
            "points_earned": current_beat.reward_points,
            "badge_earned": current_beat.reward_badge,
            "victory_text": current_beat.text
        }
    
    # Advance the story
    progress.tasks_completed += 1
    advancement = await advance_story(progress, story)
    
    # Update progress in database
    await db.user_progress.update_one(
        {"id": progress.id},
        {"$set": progress.dict()}
    )
    
    return {
        "task": task,
        "victory": victory_data,
        "story_advancement": advancement,
        "message": "🎉 Task completed!"
    }

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task"""
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# Achievement Routes
@api_router.get("/achievements")
async def get_achievements():
    """Get all earned achievements"""
    progress = await get_active_progress()
    if not progress:
        return {"achievements": [], "total_points": 0}
    
    return {
        "achievements": progress.rewards_earned,
        "total_points": progress.total_points,
        "tasks_completed": progress.tasks_completed
    }

# Stats Routes
@api_router.get("/stats")
async def get_stats():
    """Get user statistics"""
    # Get all progress records
    all_progress = await db.user_progress.find().to_list(1000)
    
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
        "total_badges": len(all_badges),
        "badges": list(set(all_badges))
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
