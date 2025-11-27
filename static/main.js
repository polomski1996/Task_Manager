import { TaskManager } from "{% static '/js/modules/taskManager.js' %}";

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager().init();
});