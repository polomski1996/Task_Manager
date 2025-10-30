const API_BASE_URL = 'http://127.0.0.1:8000/api';  // Adjust to your Django server

class TaskManager {
    constructor() {
        this.tasks = [];
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // Checkbox changes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.task-row')) {
                const taskId = e.target.closest('tr').dataset.taskId;
                this.toggleTaskDone(taskId);
            }
        });
    }

    async loadTasks() {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/`);
            this.tasks = await response.json();
            this.renderTasks();
            this.updateParentTaskDropdown();
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async createTask() {
        const formData = {
            name: document.getElementById('task-name').value,
            parent_task: document.getElementById('parent-task').value || null,
            acceptance_criteria: document.getElementById('acceptance-criteria').value,
            start_hour: document.getElementById('start-hour').value,
            estimated_time: document.getElementById('estimated-time').value,
            date: document.getElementById('task-date').value,
            is_done: false
        };

        try {
            const response = await fetch(`${API_BASE_URL}/tasks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newTask = await response.json();
                this.tasks.push(newTask);
                this.renderTasks();
                this.updateParentTaskDropdown();
                this.resetForm();
                alert('Zadanie zostało dodane!');
            } else {
                alert('Błąd podczas dodawania zadania');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Błąd podczas dodawania zadania');
        }
    }

    async toggleTaskDone(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle_done/`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                // Reload tasks if there was an error to sync state
                this.loadTasks();
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            this.loadTasks(); // Reload to sync
        }
    }

    renderTasks() {
        const tbody = document.querySelector('#todo-table tbody');
        tbody.innerHTML = '';

        this.tasks.forEach(task => {
            const row = document.createElement('tr');
            row.className = 'task-row';
            row.dataset.taskId = task.id;
            
            if (task.parent_task === null) {
                row.classList.add('parent');
            }

            // Add today class logic based on your needs
            const today = new Date().toLocaleDateString('pl-PL');
            if (task.date === today) {
                row.classList.add('today');
            }

            row.innerHTML = `
                <td><input type="checkbox" ${task.is_done ? 'checked' : ''}></td>
                <td>${task.name}</td>
                <td>${task.parent_task_name || 'N/A'}</td>
                <td>${task.acceptance_criteria || ''}</td>
                <td>${task.start_hour || 'N/A'}</td>
                <td>${task.estimated_time || ''}</td>
                <td>${task.date}</td>
            `;

            tbody.appendChild(row);
        });
    }

    updateParentTaskDropdown() {
        const dropdown = document.getElementById('parent-task');
        // Clear existing options except the first one
        dropdown.innerHTML = '<option value="">Brak (zadanie główne)</option>';
        
        // Add parent tasks (tasks without parent)
        this.tasks
            .filter(task => task.parent_task === null)
            .forEach(task => {
                const option = document.createElement('option');
                option.value = task.id;
                option.textContent = task.name;
                dropdown.appendChild(option);
            });
    }

    resetForm() {
        document.getElementById('task-form').reset();
        // Set default date to today
        document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});