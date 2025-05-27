// Task data structure
let tasks = {
    todo: [
        { id: 1, title: "Plan project structure", description: "Define the overall architecture and components needed for the application." },
        { id: 2, title: "Set up development environment", description: "Install necessary tools and configure the workspace." }
    ],
    inprogress: [
        { id: 3, title: "Implement user authentication", description: "Create login and registration functionality with proper validation." }
    ],
    done: [
        { id: 4, title: "Design mockups", description: "Create wireframes and visual designs for all main pages." }
    ]
};

let taskIdCounter = 5;

// DOM elements
const modal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const closeBtn = document.querySelector('.close');

// Initialize the app
function initApp() {
    renderTasks();
    setupDragAndDrop();
    setupModal();
}

// Render all tasks
function renderTasks() {
    Object.keys(tasks).forEach(status => {
        renderTaskList(status);
    });
}

// Render tasks for a specific status
function renderTaskList(status) {
    const container = document.getElementById(`${status}-cards`);
    container.innerHTML = '';
    
    tasks[status].forEach(task => {
        const cardElement = createTaskCard(task, status);
        container.appendChild(cardElement);
    });
}

// Create a task card element
function createTaskCard(task, status) {
    const card = document.createElement('div');
    card.className = `card ${status}-card`;
    card.draggable = true;
    card.dataset.id = task.id;
    card.dataset.status = status;
    
    card.innerHTML = `
        <button class="card-delete" onclick="deleteTask(${task.id}, '${status}')">&times;</button>
        <div class="card-title">${task.title}</div>
        <div class="card-description">${task.description || ''}</div>
    `;
    
    return card;
}

// Add a new task
function addNewCard(status) {
    modal.style.display = 'block';
    document.getElementById('task-status').value = status;
    document.getElementById('task-title').focus();
}

// Delete a task with confirmation
function deleteTask(id, status) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = tasks[status].findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[status].splice(taskIndex, 1);
            renderTasks();
        }
    }
}

// Setup modal functionality
function setupModal() {
    // Close modal when clicking the X
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Handle form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(taskForm);
        const newTask = {
            id: taskIdCounter++,
            title: formData.get('title'),
            description: formData.get('description')
        };
        
        const status = formData.get('status');
        tasks[status].push(newTask);
        renderTasks();
        closeModal();
        taskForm.reset();
    });
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    taskForm.reset();
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const boards = document.querySelectorAll('.board');
    
    boards.forEach(board => {
        board.addEventListener('dragover', dragOver);
        board.addEventListener('drop', drop);
        board.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        board.addEventListener('dragleave', function(e) {
            if (!this.contains(e.relatedTarget)) {
                this.classList.remove('drag-over');
            }
        });
    });

    // Add event listeners to existing cards
    document.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('card')) {
            dragStart(e);
        }
    });
}

// Drag start handler
function dragStart(e) {
    const cardId = parseInt(e.target.dataset.id);
    const cardStatus = e.target.dataset.status;
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
        id: cardId,
        status: cardStatus
    }));
    
    e.target.classList.add('dragging');
    
    // Remove dragging class after drag ends
    setTimeout(() => {
        e.target.classList.remove('dragging');
    }, 0);
}

// Drag over handler
function dragOver(e) {
    e.preventDefault();
}

// Drop handler
function drop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const cardId = data.id;
    const oldStatus = data.status;
    const newStatus = e.currentTarget.id.replace('-board', '');
    
    if (oldStatus !== newStatus) {
        const taskIndex = tasks[oldStatus].findIndex(task => task.id === cardId);
        if (taskIndex !== -1) {
            const task = tasks[oldStatus][taskIndex];
            tasks[oldStatus].splice(taskIndex, 1);
            tasks[newStatus].push(task);
            renderTasks();
        }
    }
    
    // Remove drag-over class
    e.currentTarget.classList.remove('drag-over');
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);