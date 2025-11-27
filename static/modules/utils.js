export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

export function filterTasksByDate(tasks, targetDate) {
    return tasks.filter(task => task.date === targetDate);
}

export function filterParentTasks(tasks) {
    return tasks.filter(task => task.parent_task === null);
}