import { escapeHtml } from './utils.js';
import { getTodayISO } from './utils.js'

export class UIRenderer {
    static renderTasks(tasksArray, containerSelector = '#todo-table tbody') {
        const tbody = document.querySelector(containerSelector);
        if (!tbody) return;

        tbody.innerHTML = '';
        tasksArray.forEach(task => {
            const row = this.createTaskRow(task);
            tbody.appendChild(row);
        });

        // Add click handlers for rows
        this.addRowClickHandlers();
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
            <td><button class="del-btn">DEL</button></td>
        `;
        return row;
    }

    static addRowClickHandlers() {
        const rows = document.querySelectorAll('#todo-table tbody tr');
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking on checkbox or delete button
                if (e.target.type === 'checkbox' || e.target.classList.contains('del-btn')) {
                    return;
                }
                
                // Remove expanded class from all rows
                rows.forEach(r => r.classList.remove('expanded'));
                
                // Add expanded class to clicked row
                row.classList.add('expanded');
            });
        });

        // Close expanded rows when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#todo-table tbody tr')) {
                const rows = document.querySelectorAll('#todo-table tbody tr');
                rows.forEach(row => row.classList.remove('expanded'));
            }
        });
    }

    static renderParentTasks(parentTasks, containerSelector = '.parent-tasks') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = '';

        if (parentTasks.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="1" style="text-align: center; color: #888;">NO PARENT TASKS</td>';
            container.appendChild(emptyRow);
            return;
        }

        parentTasks.forEach(task => {
            const row = this.createParentTaskRow(task);
            container.appendChild(row);
        });
    }

    static createParentTaskRow(task) {
        const row = document.createElement('tr');
        row.className = 'parent-task-row';
        row.dataset.taskId = task.id;

        const todayIso = getTodayISO();
        if (task.date === todayIso) {
            row.classList.add('today');
        }

        row.innerHTML = `
            <td>${escapeHtml(task.name)}</td>
        `;

        return row;
    }

    static renderWeekTargets(weekTargets, containerSelector = '.targets-content') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = '';

        if (weekTargets.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="2" style="text-align: center; color: #888;">NO WEEK TARGETS!</td>';
            container.appendChild(emptyRow);
            return;
        }

        weekTargets.forEach(target => {
            const row = this.createWeekTargetRow(target);
            container.appendChild(row);
        });
    }

    static createWeekTargetRow(target) {
        const row = document.createElement('tr');
        row.className = 'week-target-row';
        row.dataset.targetId = target.id;

        row.innerHTML = `
            <td>${escapeHtml(target.name)}</td>
            <td>${escapeHtml(target.deadline)}</td>
        `;

        return row;
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