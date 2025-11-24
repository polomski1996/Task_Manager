import { escapeHtml } from './utils.js';
import { getTodayISO } from './utils.js'

export class UIRenderer {
    static colorPalette = [
        '#FF6B6B', // Czerwony
        '#4ECDC4', // Turkusowy
        '#FFD166', // Żółty
        '#06D6A0', // Zielony
        '#118AB2', // Niebieski
        '#EF476F', // Różowy
        '#7209B7', // Fioletowy
        '#F48C06'  // Pomarańczowy
    ];

    static parentTaskColors = new Map();
    static parentTaskNames = new Map(); // Nowa mapa do przechowywania nazw parent tasks

    // Metoda do przypisania koloru do parent task
    static getColorForParentTask(parentTaskId, parentTaskName) {
        if (!parentTaskId) return null;
        
        // Zapisz nazwę parent task
        if (parentTaskName) {
            this.parentTaskNames.set(parentTaskId, parentTaskName);
        }
        
        // Jeśli już mamy kolor dla tego taska, zwróć go
        if (this.parentTaskColors.has(parentTaskId)) {
            return this.parentTaskColors.get(parentTaskId);
        }
        
        // Przypisz nowy kolor na podstawie hash nazwy
        const nameToHash = parentTaskName || parentTaskId.toString();
        const hash = this.hashString(nameToHash);
        const colorIndex = hash % this.colorPalette.length;
        const color = this.colorPalette[colorIndex];
        
        this.parentTaskColors.set(parentTaskId, color);
        return color;
    }

    // Metoda do pobrania nazwy parent task po ID
    static getParentTaskName(parentTaskId) {
        return this.parentTaskNames.get(parentTaskId) || null;
    }

    // Prosta funkcja hashująca
    static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    static renderTasks(tasksArray, containerSelector = '#todo-table tbody') {
        const tbody = document.querySelector(containerSelector);
        if (!tbody) return;
        
        const sortedTaskArray = [...tasksArray].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        tbody.innerHTML = '';
        sortedTaskArray.forEach(task => {
            const row = this.createTaskRow(task);
            tbody.appendChild(row);
        });

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

        // Pobierz kolor dla parent task - używamy parent_task_name z taska
        const parentTaskColor = task.parent_task ? 
            this.getColorForParentTask(task.parent_task, task.parent_task_name) : null;

        row.innerHTML = `
            <td><input type="checkbox" ${task.is_done ? 'checked' : ''}></td>
            <td class="task-name-cell" ${parentTaskColor ? `style="color: ${parentTaskColor}; font-weight: 600;"` : ''}>
                ${escapeHtml(task.name)}
            </td>
            <td class="parent-task-cell" ${parentTaskColor ? `style="color: ${parentTaskColor}; font-weight: 600;"` : ''}>
                ${escapeHtml(task.parent_task_name || '-')}
            </td>
            <td>${escapeHtml(task.acceptance_criteria || '')}</td>
            <td>${escapeHtml(task.start_hour || 'N/A')}</td>
            <td>${escapeHtml(task.estimated_time || '')}</td>
            <td>${escapeHtml(task.date || '')}</td>
            <td><button class="del-btn">DEL</button></td>
        `;
        return row;
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

        const color = this.getColorForParentTask(task.id, task.name);

        row.innerHTML = `
            <td class="parent-task-name" style="color: ${color}; font-weight: 600;">
                ${escapeHtml(task.name)}
            </td>
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

        // Pobierz nazwę parent task z zapisanej mapy
        const parentTaskName = target.parent_task ? 
            this.getParentTaskName(target.parent_task) : null;
        
        // Pobierz kolor dla parent task targetu
        const color = target.parent_task ? 
            this.getColorForParentTask(target.parent_task, parentTaskName) : null;

        row.innerHTML = `
            <td class="target-name-cell" ${color ? `style="color: ${color}; font-weight: 600;"` : ''}>
                ${escapeHtml(target.name)}
            </td>
            <td>${escapeHtml(target.deadline)}</td>
        `;

        return row;
    }

    // Inicjalizacja kolorów dla istniejących parent tasks
    static initializeParentTaskColors(parentTasks) {
        parentTasks.forEach(task => {
            this.getColorForParentTask(task.id, task.name);
        });
    }

    static addRowClickHandlers() {
        const rows = document.querySelectorAll('#todo-table tbody tr');
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox' || e.target.classList.contains('del-btn')) {
                    return;
                }
                
                rows.forEach(r => r.classList.remove('expanded'));
                row.classList.add('expanded');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#todo-table tbody tr')) {
                const rows = document.querySelectorAll('#todo-table tbody tr');
                rows.forEach(row => row.classList.remove('expanded'));
            }
        });
    }

    static updateParentTaskDropdown(parentTasks) {
        // Inicjalizuj kolory dla parent tasks
        this.initializeParentTaskColors(parentTasks);

        // dropdown for tasks
        const taskDropdown = document.getElementById('parent-task-drop');
        if (!taskDropdown) return;
        
        taskDropdown.innerHTML = '<option value="">zadanie parent</option>';

        parentTasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            taskDropdown.appendChild(option);
        });

        // dropdown for targets
        const targetDropdown = document.getElementById('parent-target-drop');
        if (!targetDropdown) return;
        
        targetDropdown.innerHTML = '<option value="">zadanie parent</option>';

        parentTasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            targetDropdown.appendChild(option);
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