import { supabaseUrl, supabaseApiKey } from './config.js';

document.addEventListener('DOMContentLoaded', () => {

  const addNewTaskBtn = document.getElementById('addNewTaskBtn');
  const addTaskModal = document.getElementById('addTaskModal');
  const newTaskInput = document.getElementById('modalTaskInput'); // Updated ID
  const addTaskBtn = document.getElementById('addModalTaskBtn'); // Updated ID
  const initialAddTaskBtn = document.getElementById('addTaskBtn');
  
  const cancelAddTaskBtn = document.getElementById('cancelAddTaskBtn');
  const taskList = document.getElementById('taskList');
  const inProgressCount = document.getElementById('inProgressCount');

  //Enter Your URl and API Key
  //   const supabaseUrl = '';
  //  const supabaseApiKey = '';
  

  // Show modal for adding new task
  addNewTaskBtn.addEventListener('click', () => {
    addTaskModal.style.display = 'block';
  });

  // Cancel adding new task
  cancelAddTaskBtn.addEventListener('click', () => {
    addTaskModal.style.display = 'none';
    newTaskInput.value = '';
  });

  // Add a new task when 'Add Task' button is clicked
  addTaskBtn.addEventListener('click', () => {
    const taskName = newTaskInput.value.trim(); // Get the input value

    if (taskName) {
        addTask(taskName); // Call the addTask function
        newTaskInput.value = ''; // Clear the input field
        addTaskModal.style.display = 'none'; // Hide the modal after adding
    } else {
        alert('Please enter a task name'); // Alert if the input is empty
    }
});

// Add a new task when 'Add Task' button is clicked (outside modal)
initialAddTaskBtn.addEventListener('click', () => {
  const taskName = document.getElementById('newTaskInput').value.trim();

  if (taskName) {
    addTask(taskName); // Call the addTask function
    document.getElementById('newTaskInput').value = ''; // Clear the input field
    document.getElementById('noTasksMessage').style.display = 'none'; // Hide no tasks message
    document.querySelector('.task-header').style.display = 'flex'; // Show task header
  } else {
    alert('Please enter a task name'); // Alert if the input is empty
  }
});

// Event listener for task actions (edit, delete, status change)
taskList.addEventListener('click', (e) => {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  const taskId = taskItem.dataset.id; // Get the task ID
  const dropdown = taskItem.querySelector('.status-dropdown');

  // Edit task
  if (e.target.classList.contains('edit-btn')) {
      const newName = prompt('Enter new task name:', taskItem.querySelector('.task-name').textContent);
      if (newName && newName.trim() !== '') {
          updateTask(taskId, { name: newName.trim() });
      }
  }

  // Delete task
  else if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this task?')) {
          deleteTask(taskId);
      }
  }

  // Toggle dropdown visibility for status change
  else if (e.target.classList.contains('status-btn')) {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

      // Position the dropdown below the button
      const rect = e.target.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + window.scrollY}px`; // Position below the button
      dropdown.style.left = `${rect.left}px`; // Align to the left
  }

  // Select new status from dropdown
  else if (e.target.classList.contains('status-option')) {
      const newStatus = e.target.dataset.status;
      updateTask(taskId, { status: newStatus }); // Use the taskId here
      dropdown.style.display = 'none'; // Hide dropdown after selection
  }
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const isClickInsideDropdown = e.target.closest('.status-dropdown');
  const isClickOnStatusBtn = e.target.closest('.status-btn');

  if (!isClickInsideDropdown && !isClickOnStatusBtn) {
      const openDropdowns = document.querySelectorAll('.status-dropdown[style*="display: block"]');
      openDropdowns.forEach(dropdown => dropdown.style.display = 'none');
  }
});


// Update task (name or status) in Supabase
async function updateTask(id, updates) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseApiKey,
                'Authorization': `Bearer ${supabaseApiKey}`
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
        if (updates.name) {
            taskItem.querySelector('.task-name').textContent = updates.name;
        }
        if (updates.status) {
            const statusElement = taskItem.querySelector('.task-status');
            statusElement.textContent = updates.status;

            // Update background color and text color based on the status
            statusElement.className = `task-status ${updates.status.toLowerCase().replace(' ', '-')}`;
            updateInProgressCount(); // Update count of in-progress tasks
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// Update the count of tasks that are 'In Progress'
function updateInProgressCount() {
    const inProgressTasks = document.querySelectorAll('.task-status.in-progress').length;
    inProgressCount.textContent = `In Progress (${inProgressTasks})`;
}

  // Fetch tasks from Supabase and render them on the page
  async function fetchTasks() {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/tasks?select=*`, {
        headers: {
          'apikey': supabaseApiKey,
          'Authorization': `Bearer ${supabaseApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tasks = await response.json();
      taskList.innerHTML = '';
      tasks.forEach(task => renderTask(task));
      updateInProgressCount();
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

// Fetch tasks from Supabase and render them on the page
async function fetchTasks() {
  try {
      const response = await fetch(`${supabaseUrl}/rest/v1/tasks?select=*`, {
          headers: {
              'apikey': supabaseApiKey,
              'Authorization': `Bearer ${supabaseApiKey}`
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tasks = await response.json();
      taskList.innerHTML = '';
      
      // Check if tasks exist
      if (tasks.length > 0) {
          tasks.forEach(task => renderTask(task));
          updateInProgressCount();
          document.getElementById('noTasksMessage').style.display = 'none'; // Hide no tasks message
          document.querySelector('.task-header').style.display = 'flex'; // Show task header
      } else {
          document.getElementById('noTasksMessage').style.display = 'block'; // Show no tasks message
          document.querySelector('.task-header').style.display = 'none'; // Hide task header
      }
  } catch (error) {
      console.error('Error fetching tasks:', error);
  }
}

// Add a new task to Supabase and render it instantly
async function addTask(name) {
  try {
      const response = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseApiKey,
              'Authorization': `Bearer ${supabaseApiKey}`
          },
          body: JSON.stringify({ name, status: 'Pending' }) // Add task with 'Pending' status
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Fetch the newly added task
      const fetchNewTask = await fetch(`${supabaseUrl}/rest/v1/tasks?name=eq.${name}&order=id.desc&limit=1`, {
          headers: {
              'apikey': supabaseApiKey,
              'Authorization': `Bearer ${supabaseApiKey}`
          }
      });

      if (!fetchNewTask.ok) {
          throw new Error(`HTTP error when fetching new task! status: ${fetchNewTask.status}`);
      }

      const [task] = await fetchNewTask.json(); // Get the newly added task
      renderTask(task); // Render the task in the UI
      updateInProgressCount(); // Update the count of "In Progress" tasks

      // Hide no tasks message and show task header if tasks exist
      document.getElementById('noTasksMessage').style.display = 'none';
      document.querySelector('.task-header').style.display = 'flex';
  } catch (error) {
      console.error('Error adding task:', error);
  }
}



// Update task (name or status) in Supabase and update the UI instantly
async function updateTask(id, updates) {
  try {
      const response = await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseApiKey,
              'Authorization': `Bearer ${supabaseApiKey}`
          },
          body: JSON.stringify(updates)
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Find the task item in the DOM
      const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
      
      // Update the task name in the DOM
      if (updates.name) {
          taskItem.querySelector('.task-name').textContent = updates.name;
      }

      // Update the task status in the DOM and adjust the "In Progress" count
      if (updates.status) {
          const statusElement = taskItem.querySelector('.task-status');
          statusElement.textContent = updates.status;

          // Update the class based on the new status
          statusElement.className = `task-status ${updates.status.toLowerCase().replace(' ', '-')}`;
          
          // Update the In Progress count immediately
          updateInProgressCount();
      }
  } catch (error) {
      console.error('Error updating task:', error);
  }
}


  // Delete task from Supabase
  async function deleteTask(id) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseApiKey,
          'Authorization': `Bearer ${supabaseApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
      taskItem.remove();
      updateInProgressCount();

      // display "noTaskMessage" div if all tasks are removed.
      const numberOfTasks = document.getElementById('taskList').childElementCount;
      if(numberOfTasks < 1) {
        document.getElementById('noTasksMessage').style.display = 'block';
        document.querySelector('.task-header').style.display = 'none';
      }

    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

// Render a task to the DOM with status dropdown
function renderTask(task) {
  const taskItem = document.createElement('div');
  taskItem.classList.add('task-item');
  taskItem.dataset.id = task.id;

  taskItem.innerHTML = `
    <div class="task-content">
      <span class="task-name">${task.name}</span>
      <div class="task-status ${task.status.toLowerCase().replace(' ', '-')}">${task.status}</div>
      <div class="status-dropdown" style="display:none;">
        <button class="status-option" data-status="Pending">Pending</button>
        <button class="status-option" data-status="In-Progress">In-Progress</button>
        <button class="status-option" data-status="Completed">Completed</button>
      </div>
    </div>
    <div class="task-actions">
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑️</button>
      <button class="status-btn">…</button>
    </div>
  `;

  // Append the task to the list
  taskList.appendChild(taskItem);
}

  // Update the count of tasks that are 'In Progress'
  function updateInProgressCount() {
  const inProgressTasks = document.querySelectorAll('.task-status.in-progress').length; // Make sure this matches the class name
  inProgressCount.textContent = `In Progress (${inProgressTasks})`; // Update the text content
}


  // Fetch tasks when the page loads
  fetchTasks();
});
