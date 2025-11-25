import { API_BASE_URL } from './constants.js';

export class TaskAPI {
    static async fetchTasks() {
        const response = await fetch(`${API_BASE_URL}/tasks/`);
        return await response.json();
    }

    static async fetchParentTasks() {
        const response = await fetch(`${API_BASE_URL}/tasks/get_parent_tasks/`);
        return await response.json();
    }

    static async fetchCurrentWeekTargets() {
        const response = await fetch(`${API_BASE_URL}/week-targets/get_current_weektargets/`)
        return await response.json();
    }

    static async createTask(taskData) {
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    }

    static async createWeekTarget(targetData) {
        const response = await fetch(`${API_BASE_URL}/week-targets/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(targetData)
        });
        return await response.json();
    }

    static async toggleTargetDone(targetId) {
        const response = await fetch(`${API_BASE_URL}/week-targets/${targetId}/toggle_done/`, {
            method: 'POST'
        });
        return response.ok;
    }

    static async toggleTaskDone(taskId) {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle_done/`, {
            method: 'POST'
        });
        return response.ok;
    }

    static async deleteTask(taskId) {
        await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            method: 'DELETE'
        });
    }
}