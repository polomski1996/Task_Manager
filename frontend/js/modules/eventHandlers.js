import { TaskAPI } from './api.js';
import { UIRenderer } from './uiRenderer.js';
import { getTodayISO, filterTasksByDate, filterParentTasks } from './utils.js';

export class EventHandlers {
    constructor(taskManager) {
        this.taskManager = taskManager;
    }

    setupEventListeners() {
        this.setupFormSubmissions();
        this.setupCheckboxHandlers();
        this.setupFilterButtons();
        this.setupUIInteractions();
        this.setupDeleteHandlers();
    }

    setupFormSubmissions() {
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.taskManager.createTask();
        });

        document.getElementById('target-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.taskManager.createTarget();
        });
    }

    setupCheckboxHandlers() {
        // Main table checkboxes
        document.querySelector('#todo-table tbody').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.task-row')) {
                const taskId = e.target.closest('tr').dataset.taskId;
                this.taskManager.toggleTaskDone(taskId);
            }
        });

        // Parent tasks checkboxes
        document.querySelector('.parent-tasks').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.parent-task-item')) {
                const taskId = e.target.closest('.parent-task-item').dataset.taskId;
                this.taskManager.toggleTaskDone(taskId);
            }
        });
    }

    setupFilterButtons() {
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = btn.dataset.filter;
                this.taskManager.filterTasks(filter);
            });
        });
    }

    setupUIInteractions() {
        document.querySelector('.add-task').addEventListener('click', () => {
            UIRenderer.showForm();
        });

        document.querySelector('.quit').addEventListener('click', () => {
            UIRenderer.hideForm();
        });

        // Show/hide delete buttons
        const tbody = document.querySelector('#todo-table tbody');
        tbody.addEventListener('click', (e) => {
            const row = e.target.closest('tr.task-row');
            if (!row) return;

            const delBtn = row.querySelector('.del-btn');
            if (delBtn) {
                delBtn.classList.toggle('hidden');
            }
        });
    }

    setupDeleteHandlers() {
        const tbody = document.querySelector('#todo-table tbody');
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('.del-btn');
            if (!btn) return;

            e.stopPropagation();
            const row = btn.closest('tr.task-row');
            const taskId = row.dataset.taskId;
            this.taskManager.deleteTask(taskId);
        });
    }
}