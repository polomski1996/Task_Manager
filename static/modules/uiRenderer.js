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
    static parentTaskNames = new Map();

    // Inicjalizuj kolory dla wszystkich parent tasks
    static initializeParentTaskColors(parentTasks) {
        console.log('Initializing colors for parent tasks:', parentTasks);
        this.parentTaskColors.clear();
        this.parentTaskNames.clear();
        
        parentTasks.forEach(task => {
            this.assignColorToParentTask(task.id, task.name);
        });
    }

    // Przypisz kolor do parent task - konwertuj ID na number dla konsystencji
    static assignColorToParentTask(parentTaskId, parentTaskName) {
        // Konwertuj ID na number dla konsystencji
        const id = Number(parentTaskId);
        if (!id) return null;
        
        // Zapisz nazwę
        if (parentTaskName) {
            this.parentTaskNames.set(id, parentTaskName);
        }
        
        // Jeśli już mamy kolor, zwróć go
        if (this.parentTaskColors.has(id)) {
            return this.parentTaskColors.get(id);
        }
        
        // Użyj zapisanej nazwy jeśli dostępna, w przeciwnym razie ID
        const nameToHash = this.parentTaskNames.get(id) || id.toString();
        const hash = this.hashString(nameToHash);
        const colorIndex = hash % this.colorPalette.length;
        const color = this.colorPalette[colorIndex];
        
        this.parentTaskColors.set(id, color);
        console.log(`Assigned color ${color} to parent task ${id} (${nameToHash})`);
        return color;
    }

    // Pobierz kolor dla parent task - konwertuj ID na number
    static getColorForParentTask(parentTaskId) {
        // Konwertuj ID na number dla konsystencji
        const id = Number(parentTaskId);
        if (!id) return null;
        
        // Jeśli kolor już istnieje, zwróć go
        if (this.parentTaskColors.has(id)) {
            const color = this.parentTaskColors.get(id);
            console.log(`Found existing color ${color} for parent task ${id}`);
            return color;
        }
        
        // Jeśli nie ma koloru, ale znamy nazwę, utwórz kolor
        const parentTaskName = this.parentTaskNames.get(id);
        if (parentTaskName) {
            console.log(`Creating color for known parent task ${id} (${parentTaskName})`);
            return this.assignColorToParentTask(id, parentTaskName);
        }
        
        // Jeśli nie mamy żadnych informacji, NIE TWÓRZ NOWEGO KOLORA!
        console.warn(`No color information for parent task ${id} - returning null`);
        return null;
    }

    // Metoda do pobrania nazwy parent task po ID - konwertuj ID na number
    static getParentTaskName(parentTaskId) {
        const id = Number(parentTaskId);
        return this.parentTaskNames.get(id) || null;
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

        // Pobierz kolor dla parent task
        const parentTaskColor = this.getColorForParentTask(task.parent_task);
        console.log(`Task Row: ${task.name}, parent_task: ${task.parent_task}, color: ${parentTaskColor}`);

        row.innerHTML = `
            <td><input class="check-box" type="checkbox" ${task.is_done ? 'checked' : ''}></td>
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

        const color = this.getColorForParentTask(task.id);
        console.log(`Parent Task Row: ${task.name}, color: ${color}`);

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

        // Pobierz kolor dla parent task targetu
        const color = this.getColorForParentTask(target.parent_task);
        console.log(`Week Target Row: ${target.name}, parent_task: ${target.parent_task}, color: ${color}`);

        row.innerHTML = `
            <td><input class="check-box" type="checkbox" ${target.is_done ? 'checked' : ''}></td>
            <td class="target-name-cell" ${color ? `style="color: ${color}; font-weight: 600;"` : ''}>
                ${escapeHtml(target.name)}
            </td>
            <td>${escapeHtml(target.deadline)}</td>
        `;

        return row;
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