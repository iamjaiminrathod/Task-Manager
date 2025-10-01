// DOM element references
        const taskForm = document.getElementById('task-form');
        const taskInput = document.getElementById('task-input');
        const taskList = document.getElementById('task-list');
        const taskCount = document.getElementById('task-count');
        const addTaskBtn = document.getElementById('add-task-btn');
        const emptyState = document.getElementById('empty-state');
        const clearAllBtn = document.getElementById('clear-all-btn');
        const notificationContainer = document.getElementById('notification-container');

        // State variables
        let tasks = [];
        let editingTaskId = null;

        // --- LocalStorage Functions ---
        function getTasksFromStorage() {
            const storedTasks = localStorage.getItem('tasks');
            return storedTasks ? JSON.parse(storedTasks) : [];
        }

        function saveTasksToStorage(tasksToSave) {
            localStorage.setItem('tasks', JSON.stringify(tasksToSave));
        }

        // --- Core Application Logic ---

        function renderTasks() {
            // Clear the current list
            taskList.innerHTML = '';

            // Get tasks from state
            const tasksToRender = tasks;

            // Show empty state if no tasks
            if (tasksToRender.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }

            // Update task count
            taskCount.textContent = `${tasksToRender.length} task${tasksToRender.length !== 1 ? 's' : ''}`;

            // Create and append list items for each task
            tasksToRender.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item group flex items-center justify-between p-3 rounded-xl transition duration-200 hover:bg-slate-700/50 ${task.completed ? 'completed' : ''}`;
                li.dataset.id = task.id;

                li.innerHTML = `
                    <div class="flex items-center gap-4 flex-grow">
                        <div class="task-checkbox-container flex items-center justify-center cursor-pointer" role="button" aria-label="Toggle task completion">
                            <div class="custom-checkbox h-6 w-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}">
                                <i class="fa-solid fa-check text-white text-xs ${task.completed ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200"></i>
                            </div>
                        </div>
                        <p class="task-text flex-grow text-slate-200">${escapeHTML(task.text)}</p>
                    </div>
                    <div class="flex items-center gap-1 task-actions opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button class="edit-btn text-slate-500 hover:text-blue-500 transition-colors duration-200 p-2 w-8 h-8 flex items-center justify-center">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="delete-btn text-slate-500 hover:text-red-500 transition-colors duration-200 p-2 w-8 h-8 flex items-center justify-center">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }
        
        // Helper to prevent XSS
        function escapeHTML(str) {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }


        function handleFormSubmit(e) {
            e.preventDefault();
            const taskText = taskInput.value.trim();

            if (taskText === '') {
                showNotification('Please enter a task!', 'error');
                return;
            }

            if (editingTaskId) {
                // We are updating an existing task
                const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
                if (taskIndex > -1) {
                    tasks[taskIndex].text = taskText;
                }
                editingTaskId = null;
                addTaskBtn.innerHTML = '<i class="fa-solid fa-plus"></i><span>Add</span>';
            } else {
                // We are adding a new task
                const newTask = {
                    id: Date.now(),
                    text: taskText,
                    completed: false
                };
                tasks.unshift(newTask); // Add to the beginning of the array
            }

            // Reset form
            taskInput.value = '';
            taskInput.focus();

            // Save and re-render
            saveTasksToStorage(tasks);
            renderTasks();
        }

        function handleTaskListClick(e) {
            const target = e.target;
            const taskItem = target.closest('.task-item');
            if (!taskItem) return;

            const taskId = Number(taskItem.dataset.id);

            // Toggle complete status
            if (target.closest('.task-checkbox-container')) {
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    tasks[taskIndex].completed = !tasks[taskIndex].completed;
                    saveTasksToStorage(tasks);
                    renderTasks();
                }
            }
            
            // Delete task
            if (target.closest('.delete-btn')) {
                // Custom modal would be better than confirm() here as well
                if (confirm('Are you sure you want to delete this task?')) {
                    tasks = tasks.filter(t => t.id !== taskId);
                    saveTasksToStorage(tasks);
                    renderTasks();
                }
            }

            // Edit task
            if (target.closest('.edit-btn')) {
                const taskToEdit = tasks.find(t => t.id === taskId);
                if (taskToEdit) {
                    taskInput.value = taskToEdit.text;
                    taskInput.focus();
                    editingTaskId = taskId;
                    addTaskBtn.innerHTML = '<i class="fa-solid fa-save"></i><span>Update</span>';
                }
            }
        }
        
        function handleClearAll() {
            if (tasks.length > 0) {
                 // In a real app, a custom modal would be better than confirm()
                if (confirm('Are you sure you want to delete all tasks?')) {
                    tasks = [];
                    saveTasksToStorage(tasks);
                    renderTasks();
                }
            }
        }

        // --- Custom Notification Function ---
        function showNotification(message, type = 'error') {
            const notification = document.createElement('div');
            notification.className = `notification ${type} show`;
            notification.textContent = message;
            
            notificationContainer.appendChild(notification);

            setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.add('hide');
                notification.addEventListener('animationend', () => {
                    notification.remove();
                });
            }, 3000);
        }


        // --- Event Listeners and Initialization ---

        function initializeApp() {
            // Load tasks from storage
            tasks = getTasksFromStorage();

            // Render tasks on initial load
            renderTasks();

            // Attach event listeners
            taskForm.addEventListener('submit', handleFormSubmit);
            taskList.addEventListener('click', handleTaskListClick);
            clearAllBtn.addEventListener('click', handleClearAll);
        }

        // Run the app once the DOM is fully loaded
        document.addEventListener('DOMContentLoaded', initializeApp);
