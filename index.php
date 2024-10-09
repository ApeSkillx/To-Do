      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>To-Do Task Management</title>
          <link rel="stylesheet" href="css/styles.css">
      </head>
      <body>
        <div class="container">
            <h1>To-Do Task Management</h1>
            <div id="noTasksMessage" class="no-tasks">
                <h2>Add New Task</h2>
                <input type="text" id="newTaskInput" placeholder="Task name">
                <button id="addTaskBtn">Add</button>
            </div>
            <div class="task-header" style="display: none;">
                <span id="inProgressCount">In Progress (0)</span>
                <button id="addNewTaskBtn">+ Add new task</button>
            </div>
            <div id="taskList"></div>
        </div>

        <div id="addTaskModal" class="modal">
          <div class="modal-content">
              <h2>Add a New Task</h2>
              <input type="text" id="modalTaskInput" placeholder="Task name"> <!-- Changed ID -->
              <div class="modal-buttons">
                  <button id="addModalTaskBtn">Add</button> <!-- Changed ID -->
                  <button id="cancelAddTaskBtn">Go Back</button>
              </div>
          </div>
      </div>

          <script type="module" src="js/script.js"></script>
      </body>
      </html>