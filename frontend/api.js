const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
        // Form submission - task
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // Form submission - Week Target
        document.getElementById('target-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTarget();
        })

        // Checkbox changes (delegation)
        document.querySelector('#todo-table tbody').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.task-row')) {
                const taskId = e.target.closest('tr').dataset.taskId;
                this.toggleTaskDone(taskId);
            }
        });

        // Filter buttons (use arrow to preserve this)
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = btn.dataset.filter; // or e.currentTarget.dataset.filter
                this.filterTasks(filter);
            });
        });

        // Add task button - show form
        document.querySelector('.add-task').addEventListener('click', function() {
            document.body.classList.add('blured');
            document.querySelector('.task-form-container').classList.remove('hidden');
        });

        // Finish add button - hide form
        document.querySelector('.finish-add-button').addEventListener('click', function() {
            document.body.classList.remove('blured');
            document.querySelector('.task-form-container').classList.add('hidden');
        });
    }

    async loadTasks() {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/`);
            this.tasks = await response.json();
            // render all tasks by default
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
                this.renderTasks(); // odśwież widok
                this.updateParentTaskDropdown();
                this.resetForm();
                alert('Zadanie zostało dodane!');
            } else {
                const text = await response.text();
                console.error('Create task failed:', response.status, text);
                alert('Błąd podczas dodawania zadania');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Błąd podczas dodawania zadania');
        }
    }

    //create Week Target 
    async createTarget() {
        const formData = {
            name: document.getElementById('target-name').value,
            parent_task: document.getElementById('parent-task').value || null,
            description: document.getElementById('description').value,
            deadline: document.getElementById('deadline-date').value,
            is_done: false
        };

        try {
            const response = await fetch(`${API_BASE_URL}/week-targets/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newTask = await response.json();
                this.tasks.push(newTask);
                //this.renderWeekTarget();  NEEDS IMPLEMENTATION
                this.updateParentTaskDropdown();
                this.resetForm();
                alert('Week target dodany!');
            } else {
                const text = await response.text();
                console.error('Create task failed:', response.status, text);
                alert('Błąd podczas dodawania Week Target');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Błąd podczas dodawania Week Target');
        }
    }

    async toggleTaskDone(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle_done/`, {
                method: 'POST'
            });
            
            if (response.ok) {
                // opcjonalnie odśwież pojedyncze zadanie lub wszystkie
                await this.loadTasks();
            } else {
                console.error('Toggle failed', response.status);
                await this.loadTasks();
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            await this.loadTasks(); // reload to sync
        }
    }

    // --- Filtracja ---
    filterTasks(filter) {
        if (!filter || filter === 'all') {
            this.renderTasks();
            return;
        }

        const todayIso = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        let filtered = this.tasks;
        if (filter === 'today') {
            filtered = this.tasks.filter(t => t.date === todayIso);
        } else if (filter === 'parent') {
            filtered = this.tasks.filter(t => t.parent_task === null);
        }

        this.renderFilteredTasks(filtered);
    }

    // Rysuje wszystkie zadania (wywołuje renderFilteredTasks z pełną listą)
    renderTasks() {
        this.renderFilteredTasks(this.tasks);
    }

    // Render używany zarówno do pełnych jak i filtrowanych list
    renderFilteredTasks(tasksArray) {
        const tbody = document.querySelector('#todo-table tbody');
        tbody.innerHTML = '';

        tasksArray.forEach(task => {
            const row = this.createRow(task);
            tbody.appendChild(row);
        });
    }

    // helper: tworzy <tr> dla zadania (używane przez obie metody renderujące)
    createRow(task) {
        const row = document.createElement('tr');
        row.className = 'task-row';
        row.dataset.taskId = task.id;

        if (task.parent_task === null) {
            row.classList.add('parent');
        }

        // DOPASUJ format porównania dat: zakładamy, że task.date jest "YYYY-MM-DD"
        const todayIso = new Date().toISOString().split('T')[0];
        if (task.date === todayIso) {
            row.classList.add('today');
        }

        // Zawartość wiersza - zabezpiecz wartości null/undefined
        row.innerHTML = `
            <td><input type="checkbox" ${task.is_done ? 'checked' : ''}></td>
            <td>${this.escapeHtml(task.name)}</td>
            <td>${this.escapeHtml(task.parent_task_name || 'N/A')}</td>
            <td>${this.escapeHtml(task.acceptance_criteria || '')}</td>
            <td>${this.escapeHtml(task.start_hour || 'N/A')}</td>
            <td>${this.escapeHtml(task.estimated_time || '')}</td>
            <td>${this.escapeHtml(task.date || '')}</td>
        `;
        return row;
    }

    // prosty sanitizer tekstu do innerHTML
    escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    updateParentTaskDropdown() {
        const dropdown = document.getElementById('parent-task');
        dropdown.innerHTML = '<option value="">Brak (zadanie główne)</option>';
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
        document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
