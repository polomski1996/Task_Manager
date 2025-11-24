import { TaskAPI } from './api.js';
import { UIRenderer } from './uiRenderer.js';
import { EventHandlers } from './eventHandlers.js';
import { getTodayISO, filterTasksByDate, filterParentTasks } from './utils.js';

export class TaskManager {
    constructor() {
        this.tasks = [];
        this.parentTasks = [];
        this.eventHandlers = new EventHandlers(this);
    }

    async init() {
        await this.loadParentTasks();
        await this.loadTasks();
        await this.loadCurrentWeekTargets();
        this.eventHandlers.setupEventListeners();
    }

    async loadTasks() {
        try {
            this.tasks = await TaskAPI.fetchTasks();
            this.renderTasks();
            this.updateParentTaskDropdown();
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async loadParentTasks() {
        try {
            this.parentTasks = await TaskAPI.fetchParentTasks();
            // Inicjalizuj kolory dla parent tasks
            UIRenderer.initializeParentTaskColors(this.parentTasks);
            this.renderParentTasks();
            this.updateParentTaskDropdown();
        } catch (error) {
            console.error('Error loading parent tasks:', error);
        }
    }

    async loadCurrentWeekTargets() {
        try {
            this.weekTargets = await TaskAPI.fetchCurrentWeekTargets();
            this.renderWeekTargets();
        } catch (error) {
            console.error('Error loadign week targets: ', error);
        }
    }

    async createTask() {
        const formData = {
            name: document.getElementById('task-name').value,
            parent_task: document.getElementById('parent-task-drop').value || null,
            acceptance_criteria: document.getElementById('acceptance-criteria').value,
            start_hour: document.getElementById('start-hour').value,
            estimated_time: document.getElementById('estimated-time').value,
            date: document.getElementById('task-date').value,
            is_done: false
        };

        try {
            const newTask = await TaskAPI.createTask(formData);
            this.tasks.push(newTask);
            this.renderTasks();
            // await this.loadParentTasks();
            this.updateParentTaskDropdown();
            UIRenderer.resetForm();
            alert('Zadanie zostało dodane!');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Błąd podczas dodawania zadania');
        }
    }

    async createTarget() {
        const formData = {
            name: document.getElementById('target-name').value,
            parent_task: document.getElementById('parent-target-drop').value,
            description: document.getElementById('description').value,
            deadline: document.getElementById('deadline-date').value,
            is_done: false
        };

        try {
            const newTarget = await TaskAPI.createWeekTarget(formData);
            this.tasks.push(newTarget);
            this.updateParentTaskDropdown();
            UIRenderer.resetForm('target-form');
            alert('Week target dodany!');
        } catch (error) {
            console.error('Error creating target:', error);
            alert('Błąd podczas dodawania Week Target');
        }
    }

    async toggleTaskDone(taskId) {
        try {
            await TaskAPI.toggleTaskDone(taskId);
            await this.loadTasks();
            await this.loadParentTasks();
        } catch (error) {
            console.error('Error toggling task:', error);
            await this.loadTasks();
            await this.loadParentTasks();
        }
    }

    async deleteTask(taskId) {
        try {
            await TaskAPI.deleteTask(taskId);
            const row = document.querySelector(`tr[data-task-id="${taskId}"]`);
            if (row) row.remove();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    filterTasks(filter) {
        if (!filter || filter === 'all') {
            this.renderTasks();
            return;
        }

        let filtered;
        if (filter === 'today') {
            filtered = filterTasksByDate(this.tasks, getTodayISO());
        } else if (filter === 'parent') {
            filtered = filterParentTasks(this.tasks);
        } else {
            filtered = this.tasks;
        }

        this.renderFilteredTasks(filtered);
    }

    renderTasks() {
        UIRenderer.renderTasks(this.tasks);
    }

    renderFilteredTasks(tasksArray) {
        UIRenderer.renderTasks(tasksArray);
    }

    renderParentTasks() {
        UIRenderer.renderParentTasks(this.parentTasks);
    }

    renderWeekTargets() {
        UIRenderer.renderWeekTargets(this.weekTargets);
    }

    updateParentTaskDropdown() {
        UIRenderer.updateParentTaskDropdown(this.parentTasks);
    }
}