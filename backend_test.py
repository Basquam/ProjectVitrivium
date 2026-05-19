#!/usr/bin/env python3
"""
Backend API Tests for Quest Hero - Gamified Task Management App
Tests story progression, task management, and achievement tracking
"""

import requests
import json
from datetime import date
from typing import Dict, Any, List

# Backend URL from environment
BASE_URL = "https://epic-daily-1.preview.emergentagent.com/api"

# Test data storage
test_data = {
    "story_id": "wild-west-redemption",
    "progress_id": None,
    "task_ids": [],
    "badges_earned": [],
    "total_points": 0
}

def print_test_header(test_name: str):
    """Print formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success: bool, message: str, details: Any = None):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if details:
        print(f"Details: {json.dumps(details, indent=2, default=str)}")

def test_api_root():
    """Test API root endpoint"""
    print_test_header("API Root Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print_result(True, "API root accessible", data)
            return True
        else:
            print_result(False, f"API root returned {response.status_code}", response.text)
            return False
    except Exception as e:
        print_result(False, f"API root failed: {str(e)}")
        return False

def test_get_stories():
    """Test GET /api/stories - Should return Wild West story"""
    print_test_header("Get All Stories")
    try:
        response = requests.get(f"{BASE_URL}/stories")
        if response.status_code != 200:
            print_result(False, f"GET /stories returned {response.status_code}", response.text)
            return False
        
        stories = response.json()
        if not isinstance(stories, list) or len(stories) == 0:
            print_result(False, "No stories returned")
            return False
        
        # Verify Wild West story structure
        wild_west = stories[0]
        checks = {
            "has_id": wild_west.get("id") == "wild-west-redemption",
            "has_title": wild_west.get("title") == "Wild West Redemption",
            "has_3_acts": len(wild_west.get("acts", [])) == 3,
            "act1_has_beats": len(wild_west.get("acts", [{}])[0].get("beats", [])) > 0,
        }
        
        # Check beat types
        act1_beats = wild_west.get("acts", [{}])[0].get("beats", [])
        beat_types = [beat.get("type") for beat in act1_beats]
        checks["has_intro"] = "intro" in beat_types
        checks["has_challenge"] = "challenge" in beat_types
        checks["has_victory"] = "victory" in beat_types
        
        # Check for villains and rewards
        checks["has_villains"] = any(beat.get("villain_name") for beat in act1_beats)
        checks["has_reward_points"] = any(beat.get("reward_points", 0) > 0 for beat in act1_beats)
        checks["has_badges"] = any(beat.get("reward_badge") for beat in act1_beats)
        
        all_passed = all(checks.values())
        print_result(all_passed, "Wild West story structure verified", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"GET /stories failed: {str(e)}")
        return False

def test_start_story():
    """Test POST /api/stories/start - Start Wild West story"""
    print_test_header("Start New Story")
    try:
        payload = {"story_id": test_data["story_id"]}
        response = requests.post(f"{BASE_URL}/stories/start", json=payload)
        
        if response.status_code != 200:
            print_result(False, f"POST /stories/start returned {response.status_code}", response.text)
            return False
        
        data = response.json()
        progress = data.get("progress", {})
        current_beat = data.get("current_beat", {})
        
        # Store progress ID for later tests
        test_data["progress_id"] = progress.get("id")
        
        checks = {
            "has_progress": progress is not None,
            "current_act_is_1": progress.get("current_act") == 1,
            "current_beat_is_0": progress.get("current_beat") == 0,
            "is_active": progress.get("is_active") == True,
            "has_current_beat": current_beat is not None,
            "beat_is_intro": current_beat.get("type") == "intro"
        }
        
        all_passed = all(checks.values())
        print_result(all_passed, "Story started successfully", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"POST /stories/start failed: {str(e)}")
        return False

def test_start_second_story():
    """Test that starting a second story fails"""
    print_test_header("Prevent Starting Second Story")
    try:
        payload = {"story_id": test_data["story_id"]}
        response = requests.post(f"{BASE_URL}/stories/start", json=payload)
        
        # Should return 400 error
        if response.status_code == 400:
            print_result(True, "Correctly prevented starting second story", response.json())
            return True
        else:
            print_result(False, f"Should have returned 400, got {response.status_code}")
            return False
            
    except Exception as e:
        print_result(False, f"Test failed: {str(e)}")
        return False

def test_get_active_story():
    """Test GET /api/stories/progress/active"""
    print_test_header("Get Active Story Progress")
    try:
        response = requests.get(f"{BASE_URL}/stories/progress/active")
        
        if response.status_code != 200:
            print_result(False, f"GET /stories/progress/active returned {response.status_code}", response.text)
            return False
        
        data = response.json()
        checks = {
            "has_active_story": data.get("has_active_story") == True,
            "has_progress": data.get("progress") is not None,
            "has_story": data.get("story") is not None,
            "has_current_beat": data.get("current_beat") is not None,
            "has_progress_percentage": "progress_percentage" in data
        }
        
        all_passed = all(checks.values())
        print_result(all_passed, "Active story progress retrieved", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"GET /stories/progress/active failed: {str(e)}")
        return False

def test_create_tasks():
    """Test POST /api/tasks - Create 3 tasks"""
    print_test_header("Create Tasks")
    
    tasks_to_create = [
        {
            "title": "Complete morning workout routine",
            "description": "30 minutes of exercise to start the day strong",
            "category": "Health"
        },
        {
            "title": "Review project documentation",
            "description": "Go through the technical specs and update notes",
            "category": "Work"
        },
        {
            "title": "Call family members",
            "description": "Check in with parents and siblings",
            "category": "Personal"
        }
    ]
    
    created_count = 0
    for task_data in tasks_to_create:
        try:
            response = requests.post(f"{BASE_URL}/tasks", json=task_data)
            if response.status_code == 200:
                task = response.json()
                test_data["task_ids"].append(task.get("id"))
                created_count += 1
                print(f"  ✓ Created task: {task.get('title')}")
            else:
                print(f"  ✗ Failed to create task: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Error creating task: {str(e)}")
    
    success = created_count == 3
    print_result(success, f"Created {created_count}/3 tasks", {"task_ids": test_data["task_ids"]})
    return success

def test_get_all_tasks():
    """Test GET /api/tasks"""
    print_test_header("Get All Tasks")
    try:
        response = requests.get(f"{BASE_URL}/tasks")
        
        if response.status_code != 200:
            print_result(False, f"GET /tasks returned {response.status_code}", response.text)
            return False
        
        tasks = response.json()
        checks = {
            "is_list": isinstance(tasks, list),
            "has_tasks": len(tasks) >= 3,
            "tasks_have_story_id": all(task.get("story_id") == test_data["story_id"] for task in tasks)
        }
        
        all_passed = all(checks.values())
        print_result(all_passed, f"Retrieved {len(tasks)} tasks", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"GET /tasks failed: {str(e)}")
        return False

def test_get_today_tasks():
    """Test GET /api/tasks/today"""
    print_test_header("Get Today's Tasks")
    try:
        response = requests.get(f"{BASE_URL}/tasks/today")
        
        if response.status_code != 200:
            print_result(False, f"GET /tasks/today returned {response.status_code}", response.text)
            return False
        
        tasks = response.json()
        checks = {
            "is_list": isinstance(tasks, list),
            "has_pending_tasks": len(tasks) >= 3,
            "all_pending": all(task.get("status") == "pending" for task in tasks)
        }
        
        all_passed = all(checks.values())
        print_result(all_passed, f"Retrieved {len(tasks)} today's tasks", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"GET /tasks/today failed: {str(e)}")
        return False

def test_complete_task_and_progression(task_num: int):
    """Test PUT /api/tasks/{id}/complete - Complete task and verify story progression"""
    print_test_header(f"Complete Task {task_num} - Story Progression")
    
    if task_num > len(test_data["task_ids"]):
        print_result(False, f"Task {task_num} not available")
        return False
    
    task_id = test_data["task_ids"][task_num - 1]
    
    try:
        response = requests.put(f"{BASE_URL}/tasks/{task_id}/complete")
        
        if response.status_code != 200:
            print_result(False, f"PUT /tasks/{task_id}/complete returned {response.status_code}", response.text)
            return False
        
        data = response.json()
        task = data.get("task", {})
        victory = data.get("victory")
        story_advancement = data.get("story_advancement", {})
        
        checks = {
            "task_completed": task.get("status") == "completed",
            "has_story_advancement": story_advancement is not None,
            "story_not_completed": not story_advancement.get("story_completed", False)
        }
        
        # Check for victory rewards
        if victory:
            points = victory.get("points_earned", 0)
            badge = victory.get("badge_earned")
            checks["has_victory_data"] = True
            checks["points_awarded"] = points > 0
            if badge:
                checks["badge_awarded"] = True
                test_data["badges_earned"].append(badge)
            test_data["total_points"] += points
            print(f"  🎉 Victory! Earned {points} points and badge: {badge}")
        
        # Check new beat
        new_beat = story_advancement.get("new_beat")
        if new_beat:
            checks["has_new_beat"] = True
            print(f"  📖 Advanced to: {new_beat.get('title')} ({new_beat.get('type')})")
        
        all_passed = all(checks.values())
        print_result(all_passed, f"Task {task_num} completed, story advanced", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"Complete task {task_num} failed: {str(e)}")
        return False

def test_complete_already_completed_task():
    """Test that completing an already completed task fails"""
    print_test_header("Prevent Re-completing Task")
    
    if not test_data["task_ids"]:
        print_result(False, "No tasks available to test")
        return False
    
    task_id = test_data["task_ids"][0]
    
    try:
        response = requests.put(f"{BASE_URL}/tasks/{task_id}/complete")
        
        # Should return 400 error
        if response.status_code == 400:
            print_result(True, "Correctly prevented re-completing task", response.json())
            return True
        else:
            print_result(False, f"Should have returned 400, got {response.status_code}")
            return False
            
    except Exception as e:
        print_result(False, f"Test failed: {str(e)}")
        return False

def test_get_achievements():
    """Test GET /api/achievements"""
    print_test_header("Get Achievements")
    try:
        response = requests.get(f"{BASE_URL}/achievements")
        
        if response.status_code != 200:
            print_result(False, f"GET /achievements returned {response.status_code}", response.text)
            return False
        
        data = response.json()
        achievements = data.get("achievements", [])
        total_points = data.get("total_points", 0)
        tasks_completed = data.get("tasks_completed", 0)
        
        checks = {
            "has_achievements": len(achievements) > 0,
            "badges_match": len(achievements) == len(test_data["badges_earned"]),
            "points_tracked": total_points > 0,
            "tasks_counted": tasks_completed >= 3
        }
        
        print(f"  Achievements: {achievements}")
        print(f"  Total Points: {total_points}")
        print(f"  Tasks Completed: {tasks_completed}")
        
        all_passed = all(checks.values())
        print_result(all_passed, "Achievements retrieved", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"GET /achievements failed: {str(e)}")
        return False

def test_get_stats():
    """Test GET /api/stats"""
    print_test_header("Get User Statistics")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        
        if response.status_code != 200:
            print_result(False, f"GET /stats returned {response.status_code}", response.text)
            return False
        
        data = response.json()
        
        checks = {
            "has_total_points": "total_points" in data,
            "has_total_tasks": "total_tasks_completed" in data,
            "has_total_badges": "total_badges" in data,
            "has_badges_list": "badges" in data,
            "points_positive": data.get("total_points", 0) > 0,
            "tasks_positive": data.get("total_tasks_completed", 0) >= 3
        }
        
        print(f"  Total Points: {data.get('total_points')}")
        print(f"  Total Tasks: {data.get('total_tasks_completed')}")
        print(f"  Total Badges: {data.get('total_badges')}")
        print(f"  Badges: {data.get('badges')}")
        
        all_passed = all(checks.values())
        print_result(all_passed, "Stats retrieved", checks)
        return all_passed
        
    except Exception as e:
        print_result(False, f"GET /stats failed: {str(e)}")
        return False

def test_delete_task():
    """Test DELETE /api/tasks/{id}"""
    print_test_header("Delete Task")
    
    # Create a new task to delete
    try:
        task_data = {
            "title": "Test task to delete",
            "description": "This task will be deleted",
            "category": "Test"
        }
        response = requests.post(f"{BASE_URL}/tasks", json=task_data)
        if response.status_code != 200:
            print_result(False, "Failed to create task for deletion test")
            return False
        
        task_id = response.json().get("id")
        
        # Now delete it
        response = requests.delete(f"{BASE_URL}/tasks/{task_id}")
        
        if response.status_code != 200:
            print_result(False, f"DELETE /tasks/{task_id} returned {response.status_code}", response.text)
            return False
        
        # Verify it's deleted by trying to complete it
        response = requests.put(f"{BASE_URL}/tasks/{task_id}/complete")
        if response.status_code == 404:
            print_result(True, "Task successfully deleted")
            return True
        else:
            print_result(False, "Task still exists after deletion")
            return False
            
    except Exception as e:
        print_result(False, f"DELETE task failed: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests in sequence"""
    print("\n" + "="*80)
    print("QUEST HERO BACKEND API TEST SUITE")
    print("="*80)
    
    results = {}
    
    # Test 1: API Root
    results["API Root"] = test_api_root()
    
    # Test 2: Get Stories
    results["Get Stories"] = test_get_stories()
    
    # Test 3: Start Story
    results["Start Story"] = test_start_story()
    
    # Test 4: Prevent Second Story
    results["Prevent Second Story"] = test_start_second_story()
    
    # Test 5: Get Active Story
    results["Get Active Story"] = test_get_active_story()
    
    # Test 6: Create Tasks
    results["Create Tasks"] = test_create_tasks()
    
    # Test 7: Get All Tasks
    results["Get All Tasks"] = test_get_all_tasks()
    
    # Test 8: Get Today's Tasks
    results["Get Today's Tasks"] = test_get_today_tasks()
    
    # Test 9-11: Complete Tasks and Story Progression
    results["Complete Task 1"] = test_complete_task_and_progression(1)
    results["Complete Task 2"] = test_complete_task_and_progression(2)
    results["Complete Task 3"] = test_complete_task_and_progression(3)
    
    # Test 12: Prevent Re-completion
    results["Prevent Re-completion"] = test_complete_already_completed_task()
    
    # Test 13: Get Achievements
    results["Get Achievements"] = test_get_achievements()
    
    # Test 14: Get Stats
    results["Get Stats"] = test_get_stats()
    
    # Test 15: Delete Task
    results["Delete Task"] = test_delete_task()
    
    # Print Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    print(f"{'='*80}\n")
    
    return results

if __name__ == "__main__":
    results = run_all_tests()
    
    # Exit with error code if any tests failed
    if not all(results.values()):
        exit(1)
    else:
        exit(0)
