import { escapeHtml } from './utils.js';

export class UIRenderer {
    static renderTasks(tasksArray, containerSelector = '#todo-table tbody') {
        const tbody = document.querySelector(containerSelector);
        if (!tbody) return;

        tbody.innerHTML = '';
        tasksArray.forEach(task => {
            const row = this.createTaskRow(task);
            tbody.appendChild(row);
        });
    }

    static createTaskRow(task) {
        const row = document.createElement('tr');
        row.className = 'task-row';
        row.dataset.taskId = task.id;

        if (task.parent_task === null) {
            row.classList.add('parent');
        }

        const todayIso = new Date().toISOString().split('T')[0];
        if (task.date === todayIso) {
            row.classList.add('today');
        }

        row.innerHTML = `
            <td><input type="checkbox" ${task.is_done ? 'checked' : ''}></td>
            <td>${escapeHtml(task.name)}</td>
            <td>${escapeHtml(task.parent_task_name || 'PARENT')}</td>
            <td>${escapeHtml(task.acceptance_criteria || '')}</td>
            <td>${escapeHtml(task.start_hour || 'N/A')}</td>
            <td>${escapeHtml(task.estimated_time || '')}</td>
            <td>${escapeHtml(task.date || '')}</td>
            <td><button class="hidden del-btn">DEL</button></td>
        `;
        return row;
    }

    static renderParentTasks(parentTasks, containerSelector = '.parent-tasks') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = '';

        if (parentTasks.length === 0) {
            container.innerHTML = '<p>NO PARENT TASKS</p>';
            return;
        }

        parentTasks.forEach(task => {
            const taskElement = this.createParentTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    static createParentTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'parent-task-item';
        taskDiv.dataset.taskId = task.id;

        const todayIso = new Date().toISOString().split('T')[0];
        if (task.date === todayIso) {
            taskDiv.classList.add('today');
        }

        taskDiv.innerHTML = `
            <div class="parent-task-header">
                <span class="parent-task-name">${escapeHtml(task.name)}</span>
            </div>
        `;

        return taskDiv;
    }

    static updateParentTaskDropdown(parentTasks, dropdownId = 'parent-task-drop') {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">zadanie parent</option>';

        parentTasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            dropdown.appendChild(option);
        });
    }

    static showForm() {
        document.body.classList.add('blured');
        document.querySelector('.task-form-container').classList.remove('hidden');
    }

    static hideForm() {
        document.body.classList.remove('blured');
        document.querySelector('.task-form-container').classList.add('hidden');
    }

    static resetForm(formId = 'task-form') {
        document.getElementById(formId).reset();
        const dateField = document.getElementById('task-date');
        if (dateField) {
            dateField.value = new Date().toISOString().split('T')[0];
        }
    }
}