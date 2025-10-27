document.addEventListener("DOMContentLoaded", function() {
    const filterButtons = document.querySelectorAll(".filter-button");
    const taskRows = document.querySelectorAll("#todo-table tbody tr");

    // Function to check if a task row has today's date
    function isToday(row) {
        const dateCell = row.querySelector("td:nth-child(7)"); // Get the 7th cell (Date column)
        if (!dateCell) return false; // If there's no date cell, return false
        const taskDate = dateCell.textContent.trim();
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const year = today.getFullYear();
        const todaysDate = `${day}.${month}.${year}`;
        return taskDate === todaysDate;
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            const filter = this.dataset.filter;

            taskRows.forEach(row => {
                row.classList.remove("hidden");

                if (filter === "all") {
                    // Show all tasks
                } else if (filter === "today") {
                    if (!isToday(row)) {  //Use function isToday
                        row.classList.add("hidden");
                    }
                } else if (filter === "parent") {
                    if (!row.classList.contains("parent")) {
                        row.classList.add("hidden");
                    }
                }
            });
        });
    });
});
