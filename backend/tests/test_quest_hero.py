"""Backend tests for Quest Hero expansion features."""
import os
import time
import pytest
import requests
from datetime import date, timedelta
from pymongo import MongoClient

BASE = (os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get("EXPO_BACKEND_URL", "")).rstrip("/")
API = f"{BASE}/api"

# Direct DB for cleanup / cache injection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
_mongo = MongoClient(MONGO_URL)
_db = _mongo[DB_NAME]


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    """Clean leftover test data before and after run."""
    _db.tasks.delete_many({"title": {"$regex": "^TEST_"}})
    _db.custom_stories.delete_many({"title": {"$regex": "^TEST_"}})
    _db.user_progress.delete_many({})
    _db.user_streak.delete_many({})
    _db.image_cache.delete_many({"villain_name": {"$regex": "^TEST_"}})
    yield
    _db.tasks.delete_many({"title": {"$regex": "^TEST_"}})
    _db.custom_stories.delete_many({"title": {"$regex": "^TEST_"}})
    _db.user_progress.delete_many({})
    _db.user_streak.delete_many({})
    _db.image_cache.delete_many({"villain_name": {"$regex": "^TEST_"}})


# --------- Stories ---------
class TestStories:
    def test_get_stories_returns_six_builtin(self):
        r = requests.get(f"{API}/stories", timeout=15)
        assert r.status_code == 200
        data = r.json()
        ids = {s["id"] for s in data if "id" in s}
        expected = {"wild-west-redemption", "space-odyssey", "medieval-quest",
                    "detective-noir", "zombie-apocalypse", "pirate-treasure"}
        assert expected.issubset(ids), f"Missing built-in stories: {expected - ids}"

    def test_each_story_required_fields(self):
        r = requests.get(f"{API}/stories", timeout=15)
        data = r.json()
        required = ["id", "title", "theme", "icon", "color_primary",
                    "color_secondary", "total_acts", "acts", "total_points"]
        builtin_ids = {"wild-west-redemption", "space-odyssey", "medieval-quest",
                       "detective-noir", "zombie-apocalypse", "pirate-treasure"}
        for story in [s for s in data if s["id"] in builtin_ids]:
            for f in required:
                assert f in story, f"Story {story['id']} missing {f}"
            assert isinstance(story["acts"], list) and len(story["acts"]) == story["total_acts"]


# --------- Custom Story Creator ---------
class TestCustomStory:
    def test_create_custom_story_3acts_finale(self):
        payload = {
            "title": "TEST_Custom Adventure",
            "description": "A test journey",
            "theme": "fantasy",
            "icon": "🧪",
            "villains": ["V1", "V2", "V3"],
            "num_acts": 3,
        }
        r = requests.post(f"{API}/stories/custom", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == payload["title"]
        assert data["total_acts"] == 3
        assert len(data["acts"]) == 3
        # Last act last beat must be FINALE
        last_beat = data["acts"][-1]["beats"][-1]
        assert last_beat["type"] == "finale", f"Last beat type: {last_beat['type']}"
        # store id for delete test
        TestCustomStory.created_id = data["id"]

    def test_custom_story_villains_less_than_acts_400(self):
        payload = {
            "title": "TEST_Bad Custom",
            "description": "Bad",
            "theme": "x",
            "villains": ["A", "B"],
            "num_acts": 3,
        }
        r = requests.post(f"{API}/stories/custom", json=payload, timeout=15)
        assert r.status_code == 400, f"Expected 400 got {r.status_code}: {r.text}"

    def test_delete_custom_story(self):
        story_id = getattr(TestCustomStory, "created_id", None)
        assert story_id, "Prior create test must have run"
        r = requests.delete(f"{API}/stories/custom/{story_id}", timeout=15)
        assert r.status_code == 200
        # verify deleted
        r2 = requests.get(f"{API}/stories/{story_id}", timeout=15)
        assert r2.status_code == 404


# --------- Streak ---------
class TestStreak:
    def test_get_default_streak(self):
        _db.user_streak.delete_many({})
        r = requests.get(f"{API}/streak", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["current_streak"] == 0
        assert data["longest_streak"] == 0
        assert data["last_completion_date"] is None
        assert data["total_completions"] == 0


# --------- Recurring Tasks ---------
class TestRecurringTasks:
    def _create_task(self, frequency, due_offset=0):
        due = (date.today() + timedelta(days=due_offset)).isoformat()
        payload = {
            "title": f"TEST_{frequency}_task_{time.time()}",
            "frequency": frequency,
            "due_date": due,
        }
        r = requests.post(f"{API}/tasks", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        return r.json(), due

    def test_create_daily_task(self):
        task, _ = self._create_task("daily")
        assert task["frequency"] == "daily"
        assert task["status"] == "pending"

    def test_daily_creates_next_plus_one_day(self):
        _db.user_streak.delete_many({})
        task, due = self._create_task("daily", due_offset=-10)
        r = requests.put(f"{API}/tasks/{task['id']}/complete", timeout=15)
        assert r.status_code == 200, r.text
        expected_next = (date.fromisoformat(due) + timedelta(days=1)).isoformat()
        # find new task with same title, due == expected
        next_task = _db.tasks.find_one({"title": task["title"], "due_date": expected_next})
        assert next_task is not None, f"No next daily task found at {expected_next}"
        assert next_task["status"] == "pending"

    def test_weekly_creates_next_plus_seven(self):
        _db.user_streak.delete_many({})
        task, due = self._create_task("weekly", due_offset=-10)
        r = requests.put(f"{API}/tasks/{task['id']}/complete", timeout=15)
        assert r.status_code == 200
        expected = (date.fromisoformat(due) + timedelta(days=7)).isoformat()
        nt = _db.tasks.find_one({"title": task["title"], "due_date": expected})
        assert nt is not None

    def test_monthly_creates_next_plus_thirty(self):
        _db.user_streak.delete_many({})
        task, due = self._create_task("monthly", due_offset=-10)
        r = requests.put(f"{API}/tasks/{task['id']}/complete", timeout=15)
        assert r.status_code == 200
        expected = (date.fromisoformat(due) + timedelta(days=30)).isoformat()
        nt = _db.tasks.find_one({"title": task["title"], "due_date": expected})
        assert nt is not None

    def test_once_does_not_create_next(self):
        _db.user_streak.delete_many({})
        task, _ = self._create_task("once", due_offset=-10)
        before = _db.tasks.count_documents({"title": task["title"]})
        r = requests.put(f"{API}/tasks/{task['id']}/complete", timeout=15)
        assert r.status_code == 200
        after = _db.tasks.count_documents({"title": task["title"]})
        assert after == before, f"Once-task should not create new instance (before={before}, after={after})"


# --------- Streak behavior on completions ---------
class TestStreakBehavior:
    def test_first_completion_sets_streak_one(self):
        _db.user_streak.delete_many({})
        # Create + complete a task
        due = date.today().isoformat()
        r = requests.post(f"{API}/tasks", json={"title": f"TEST_streak_{time.time()}", "due_date": due, "frequency": "once"}, timeout=15)
        tid = r.json()["id"]
        requests.put(f"{API}/tasks/{tid}/complete", timeout=15)
        s = requests.get(f"{API}/streak", timeout=15).json()
        assert s["current_streak"] == 1
        assert s["total_completions"] >= 1

    def test_multiple_tasks_same_day_no_double_count(self):
        _db.user_streak.delete_many({})
        for i in range(3):
            r = requests.post(f"{API}/tasks", json={"title": f"TEST_dup_{i}_{time.time()}", "due_date": date.today().isoformat(), "frequency": "once"}, timeout=15)
            requests.put(f"{API}/tasks/{r.json()['id']}/complete", timeout=15)
        s = requests.get(f"{API}/streak", timeout=15).json()
        assert s["current_streak"] == 1, f"Streak should still be 1, got {s['current_streak']}"
        assert s["total_completions"] == 3


# --------- Tasks range ---------
class TestTaskRange:
    def test_get_tasks_in_range(self):
        # Create task in range
        due = "2026-06-15"
        r = requests.post(f"{API}/tasks", json={"title": f"TEST_range_{time.time()}", "due_date": due, "frequency": "once"}, timeout=15)
        assert r.status_code == 200
        rr = requests.get(f"{API}/tasks/range", params={"start": "2026-01-01", "end": "2026-12-31"}, timeout=15)
        assert rr.status_code == 200
        tasks = rr.json()
        assert any(t["due_date"] == due and t["title"].startswith("TEST_range_") for t in tasks)


# --------- Story abandon ---------
class TestStoryAbandon:
    def test_abandon_active_story(self):
        _db.user_progress.delete_many({})
        # Start a story
        r = requests.post(f"{API}/stories/start", json={"story_id": "space-odyssey"}, timeout=15)
        assert r.status_code == 200, r.text
        # Abandon
        ra = requests.post(f"{API}/stories/abandon", timeout=15)
        assert ra.status_code == 200
        # Should now have no active story
        active = requests.get(f"{API}/stories/progress/active", timeout=15).json()
        assert active["has_active_story"] is False

    def test_abandon_when_no_active_returns_404(self):
        _db.user_progress.delete_many({})
        r = requests.post(f"{API}/stories/abandon", timeout=15)
        assert r.status_code == 404


# --------- Villain image (no live AI calls) ---------
class TestVillainImage:
    def test_get_image_returns_null_when_uncached(self):
        name = f"TEST_uncached_{int(time.time())}"
        _db.image_cache.delete_many({"villain_name": name})
        r = requests.get(f"{API}/villains/{name}/image", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["image_data"] is None
        assert data["villain_name"] == name

    def test_get_image_returns_cached(self):
        name = f"TEST_cached_{int(time.time())}"
        fake = "data:image/png;base64,FAKEDATA=="
        _db.image_cache.insert_one({"villain_name": name, "image_data": fake})
        try:
            r = requests.get(f"{API}/villains/{name}/image", timeout=15)
            assert r.status_code == 200
            data = r.json()
            assert data["image_data"] == fake
        finally:
            _db.image_cache.delete_many({"villain_name": name})

    def test_generate_image_endpoint_registered(self):
        # Public ingress only routes /api/*. Verify route exists by POSTing
        # with missing required query param -> should return 422 (validation),
        # not 404 (route not found). This confirms the endpoint is registered.
        name = f"TEST_route_check_{int(time.time())}"
        r = requests.post(f"{API}/villains/{name}/generate-image", timeout=15)
        assert r.status_code != 404, f"Endpoint not registered (got 404): {r.text}"
        # 422 expected because image_prompt query param is required
        assert r.status_code in (422, 400), f"Unexpected status {r.status_code}: {r.text}"


# --------- Regression: full Wild West playthrough ---------
class TestWildWestRegression:
    def test_full_wild_west_playthrough(self):
        # Reset
        _db.user_progress.delete_many({})
        _db.user_streak.delete_many({})

        r = requests.post(f"{API}/stories/start", json={"story_id": "wild-west-redemption"}, timeout=15)
        assert r.status_code == 200, r.text

        badges = []
        total_points = 0
        beats_advanced = 0

        # Wild West has 10 beats; complete one task per beat
        for i in range(10):
            tr = requests.post(f"{API}/tasks", json={"title": f"TEST_ww_{i}_{time.time()}", "due_date": date.today().isoformat(), "frequency": "once"}, timeout=15)
            assert tr.status_code == 200
            tid = tr.json()["id"]
            cr = requests.put(f"{API}/tasks/{tid}/complete", timeout=15)
            assert cr.status_code == 200, cr.text
            beats_advanced += 1
            data = cr.json()
            if data.get("victory"):
                v = data["victory"]
                if v.get("badge_earned"):
                    badges.append(v["badge_earned"])
                total_points += v.get("points_earned", 0)

        # Verify story completed
        active = requests.get(f"{API}/stories/progress/active", timeout=15).json()
        assert active["has_active_story"] is False, "Story should be completed"

        # Expected: 4 badges (First Blood, Bank Guardian, Town Defender, Sheriff of the West)
        assert len(badges) == 4, f"Expected 4 badges, got {len(badges)}: {badges}"
        # Expected points: 50+75+75+100 = 300 from beats
        assert total_points == 300, f"Expected 300 points, got {total_points}"
