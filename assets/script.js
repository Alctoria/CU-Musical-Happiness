const todoCards = $('#todo-cards');
const inProgressCards = $('#in-progress-cards');
const doneCards = $('#done-cards');

/* additional constants*/

const taskTitleEl = $('#task-title');
const dueDateEl = $('#task-due');
const taskDescrEl = $('#task-descr');


/* Generate a unique task id */
function generateTaskId() {
    const num = JSON.parse(localStorage.getItem("numTasks")) || 0;
    localStorage.setItem("numTasks", num + 1);
    return num + 1;
}

/* Generate a task card */
function createTaskCard(task) {
    // Create and populate card elements
    const card = $('<div class="card project-card draggable" id="task-card"></div>').attr('task-id', task.id);
    const cardHead = $('<div class="card-header h3"></div>').text(task.title);
    const cardBody = $('<div class="card-body"></div>');
    const description = $('<p></p>').text(task.descr);
    const dueDate = $('<p></p>').text(task.date);
    const deleteBtn = $('<button class="danger" id="delete-btn">Delete</button>').attr('task-id', task.id);
    
    // Assemble card
    cardBody.append(description)
    cardBody.append(dueDate)
    cardBody.append(deleteBtn)
    card.append(cardHead)
    card.append(cardBody)
    todoCards.append(card)

    const today = dayjs();
    const due = dayjs(task.date, 'DD/MM/YYYY');

    // Set card color according to due date
    if (today.isSame(due, 'day')) {
        card.addClass('bg-warning text-white');
    } else if (today.isAfter(due)) {
        card.addClass('bg-danger text-white');
        deleteBtn.addClass('border-light');
    }
    
     /* Make cards draggable and move cards forward */

    makeDraggable();
    return card;
}

/* Render task list and make cards draggable */
function renderTaskList() {

    // Clear existing tasks 

    todoCards.empty();
    inProgressCards.empty();
    doneCards.empty();

    // Get updated task list from the local storage
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    // Add each task back to the task board using a tasklist array

    for (const index in taskList) {
        const task = taskList[index];
        const card = createTaskCard(task);

        // Add task to relevant task array
        if (task.status == "to-do") {
            todoCards.append(card);
        } else if (task.status == "in-progress") {
            inProgressCards.append(card);
        } else if (task.status == "done") { 
            doneCards.append(card);
        }
    }
    
    /* Make cards draggable and move cards forward */
    makeDraggable();
}

/* Add a new task */
function handleAddTask(event){

    
    $('#formModal').modal('hide')

    // Get updated task list
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    // Create task object
    const task = {
        id: generateTaskId(),
        title: taskTitleEl.val(),
        date: dueDateEl.val(),
        descr: taskDescrEl.val(),
        status: "to-do"
    }

    createTaskCard(task);

    // Store in task list
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Clear inputs
    taskTitleEl.val("");
    dueDateEl.val("");
    taskDescrEl.val("");
}

/* Handle deleting a task */
function handleDeleteTask(event){

    // Get updated task list from the local storage
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    // Remove card function

    const targetId = $(this).attr("task-id");
    for (const index in taskList) {
        const task = taskList[index]
        if (targetId == task.id) {
            console.log(`Removing task #${targetId}...`);
            taskList.splice(index, 1);
            localStorage.setItem("tasks", JSON.stringify(taskList));
            break;
        }
    }

    renderTaskList();
}

/* Update status of card when dropping into a new lane */
function handleDrop(event, ui) {

    // Get updated task list from the local storage

    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    // Get new location of card from the newlane constant

    const newLane = event.target.id;

    // Update status of card when the card is moved into a different lane (array)

    const targetId = ui.draggable.attr('task-id');
    for (const index in taskList) {
        const task = taskList[index]
        if (targetId == task.id) {
            console.log(`Changing status of task #${targetId} to ${newLane}...`)
            task.status = newLane;
            localStorage.setItem("tasks", JSON.stringify(taskList));
            break;
        }
    }

    // Refresh page with card replacement and refresh the id classifiers as well

    renderTaskList();
}

/* Allow cards to be dropped into different lanes using drag function*/

function makeDroppable() {
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
}

function makeDraggable() {
    $('.draggable').draggable({zIndex: 1});
}

/* When the page loads, render the task list, add event listeners, make lanes */
/* droppable, and make the due date field a date picker */

$(document).ready(function () {
    $('#task-due').datepicker();
    $(".sortable").sortable();
    renderTaskList();  
    makeDroppable();
});

/* EVENT LISTENERS */

$('#submit-task').on('click', handleAddTask);
todoCards.on('click', '#delete-btn', handleDeleteTask)
inProgressCards.on('click', '#delete-btn', handleDeleteTask)
doneCards.on('click', '#delete-btn', handleDeleteTask)