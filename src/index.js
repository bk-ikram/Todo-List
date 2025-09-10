import "./styles.css";
import { Project , TodoItem , ChecklistItem, ProjectList } from './classes.js';
import { storageAvailable, populateStorage, getStorage } from './storage.js';

const projectStorageName = "__projectList__";

const registry = {
    ProjectList,
    Project,
    TodoItem,
    ChecklistItem
  };


const isLocalStorageAvailable = storageAvailable("localStorage");


// Initialize project list
const projectList = document.querySelector("#project-list");
const projectTemplate= projectList.querySelector("template");


let ProjectCollection = initializeProjects(projectStorageName);


renderProjects();

function initializeProjects(projectStorageName){
    // Load projects from local storage
    //// Test to see if localStorage is available for use
    if (isLocalStorageAvailable) {
        // Check if we have data for this project stored in localStorage
        if(localStorage[projectStorageName]){
            console.log("Project Data found in local storage");
            const projectsInStorage = getStorage(projectStorageName, registry);
            return new ProjectList(projectsInStorage.list);
        }
        console.log("No project data found in local storage.");
    }
    else{
        console.log("Local Storage cannot be used currently.")
    }
    return new ProjectList();
}

/*------------------------------------*\
    Add element funcitonality
\*------------------------------------*/


/***********   Project Management   ************/


//find the relevant elements
const addProjectBtn = document.querySelector("#add-project");
const projectmodal = document.querySelector("#project-modal");
const projectForm = projectmodal.querySelector("form");
const projectSaveBtn = projectmodal.querySelector(".save-btn");
const projectCancelBtn = projectmodal.querySelector(".cancel-btn");

//Add Project
addProjectBtn.addEventListener("click",()=>{
    console.log("button clicked");
    projectmodal.showModal();
})

projectSaveBtn.addEventListener("click",()=>{
    const formData = new FormData(projectForm);
    const projectName = formData.get("project-name");
    ProjectCollection.addItem(new Project(projectName));
    //render project list
    renderProjects();
    projectmodal.close();
});


//Delete Project
projectList.addEventListener("click",(e)=>{
    if(!Array.from(e.target.classList).includes("delete-project")){
        return;
    }
    
    const confirmMessage = "Are you sure you want to delete this project and its to-do items?"
    if(!confirm(confirmMessage) === true){
        return;
    }
    const selectedProject = e.target.parentElement;
    const selectedProjectId = selectedProject.getAttribute('UID');
    ProjectCollection.deleteItem(selectedProjectId);
})

projectCancelBtn.addEventListener("click",()=>{
    projectmodal.close();
});


//Rendering projects on the page

function renderProjects(){
    //First, save changes to localStorage
    populateStorage(projectStorageName, registry, ProjectCollection);
    //Remove currently rendered projects
    const renderedList = Array.from(projectList.children).filter((ele) => ele.tagName === "SPAN");
    renderedList.map((ele)=>ele.remove());
    for(let i = 0; i < ProjectCollection.list.length; i++){
        const frag = projectTemplate.content.cloneNode(true);
        const ele = frag.firstElementChild;
        ele.querySelector("h2").textContent = ProjectCollection.list[i].name;
        ele.setAttribute('UID',ProjectCollection.list[i].id);
        projectList.appendChild(ele);
    }
};

function getSelectedProjectObj(){
    const selectedProjectId = projectList.getAttribute("selectedProjectId");
    const ProjectObj = ProjectCollection.returnItemById(selectedProjectId);
    return ProjectObj;
}

/***********   To-do Management   ************/

//find the relevant elements
const toDoList = document.querySelector("#todo-list");
const addToDoBtn = document.querySelector("#add-todo-item");
const toDoModal = document.querySelector("#todo-modal");
const toDoForm = toDoModal.querySelector("form");
const cancelModal = toDoModal.querySelector(".cancel-btn");
const saveModal = toDoModal.querySelector(".save-btn");
const toDoTemplate = document.querySelector("#todo-template");

//Show Project ToDos
projectList.addEventListener("click",(e)=>{
    const selectedProject = e.target.closest(".project-item")
    if(!selectedProject){
        return;
    }
    if(Array.from(e.target.classList).includes("delete-project")){
        return;
    }
    //visually select only current project
    visuallyUnselectProjects();
    selectedProject.classList.add("selected");
    const selectedProjectId = selectedProject.getAttribute('UID');
    projectList.setAttribute("selectedProjectId",selectedProjectId);
    renderToDos();
    
})

//Remove visual border around all project items
function visuallyUnselectProjects(){
    const eless = document.querySelectorAll(".project-item");
    eless.forEach((ele) => ele.classList.remove("selected"));
}

// Add To-do. Used mousedown to detect previously focused item
addToDoBtn.addEventListener("click",()=>{
    //First check if a project is selected
    const selectedProject = document.querySelector(".project-item.selected");
    if(selectedProject){
        toDoForm.setAttribute("mode","add");
        toDoModal.showModal();
    }
    else{
        alert("Please select a project you would like to add your to-do to.");
    }
})

// Edit To-do
toDoList.addEventListener("click",(e)=>{
    //First check if the edit button is the target
    const target = e.target;
    if(!Array.from(target.classList).includes("edit")){
        return;
    }
    //Get selected ToDoId
    const selectedToDoId = getTargetToDoId(target);
    toDoForm.setAttribute("mode","edit");
    toDoList.setAttribute("selectedToDoId",selectedToDoId);

    toDoModal.showModal();
    //populate the add/edit To Do form in case it is opened in "edit" mode
    const ToDoObj = getToDoObj(target);
    populateToDoForm(ToDoObj);
    
})

// delete To-do
toDoList.addEventListener("click",(e)=>{
    //First check if the edit button is the target
    const target = e.target;
    if(!Array.from(target.classList).includes("delete")){
        return;
    }
    const confirmMessage = "Are you sure you want to delete item?"
    if(!confirm(confirmMessage) === true){
        return;
    }
    
    const selectedToDoId = getTargetToDoId(target);
    toDoList.setAttribute("selectedToDoId",selectedToDoId);

    //Get the selected project object
    const ProjectObj = getSelectedProjectObj();

    //Remove item
    ProjectObj.deleteItem(selectedToDoId)

    //render the to-do lists again
    renderToDos();
})


//populate to do form in case of todo modification
function populateToDoForm(ToDoObj){
    console.log("entered populate func");
    const titleEle = toDoForm.querySelector("#title");
    titleEle.value = ToDoObj.title;
    //description
    const descEle = toDoForm.querySelector("#description");
    descEle.value = ToDoObj.description;
    //due date
    const dueDateEle = toDoForm.querySelector("#due-date");
    dueDateEle.value = ToDoObj.dueDate;
    //priority
    const priorityEle = toDoForm.querySelector("#priority");
    priorityEle.value = ToDoObj.priority;
}


//Cancel Todo Create/Edit
cancelModal.addEventListener("click",()=>{
    toDoForm.reset();
    toDoModal.close();
})

//Process Todo add/edit form
saveModal.addEventListener("click",()=>{

    //Get form data
    const formData = new FormData(toDoForm);
    const toDoOptions = formData.values();

    //Get the project object that the todo item belongs to
    const ProjectObj = getSelectedProjectObj();

    //Get current todo item (if modifying)
    const toDoId = toDoList.getAttribute("selectedToDoId");
    const ToDoObj = ProjectObj.returnItemById(toDoId);

    //Check if the form is in edit or add mode
    const mode = toDoForm.getAttribute("mode");
    if(mode === "add"){
        addToDo(ProjectObj,toDoOptions);
    }
    else if (mode === "edit"){
        editToDo(ToDoObj,toDoOptions)
    }
    toDoForm.reset();
    renderToDos();
})

function addToDo(ProjectObj,toDoOptions){
    ProjectObj.addItem(new TodoItem(...toDoOptions));
}

function editToDo(ToDoObj,toDoOptions){
    ToDoObj.updatePropsFromForm(...toDoOptions);
}



function renderToDos(){
    //Save current state to storage
    populateStorage(projectStorageName, registry, ProjectCollection);
    
    //get selected project obj
    const ProjectObj = getSelectedProjectObj();

    //First, remove all rendered todos
    const renderedList = Array.from(toDoList.children).filter((ele) => ele.tagName === "DIV");
    renderedList.map((ele)=>ele.remove());

    const todos = ProjectObj.list
    todos.sort((a, b)=> new Date(a.dueDate) - new Date(b.dueDate));
    for(let i = 0; i < todos.length; i++ ){
        //clone template
        const frag = toDoTemplate.content.cloneNode(true);
        const ele = frag.firstElementChild;
        //id
        ele.setAttribute("UID",todos[i].id);
        //title
        const titleEle = ele.querySelector("h3");
        titleEle.textContent = todos[i].title;
        //description
        const descEle = ele.querySelector(".desc-line");
        descEle.textContent = todos[i].description;
        //details
        const detailsEle = ele.querySelector(".details-line");
        detailsEle.textContent = `Due: ${todos[i].dueDate} | Priority: ${todos[i].priority}`;
        //checklist
        const checlistItems = todos[i].list;
        const checklistEle = ele.querySelector(".checklist");
        for(let j = 0; j < checlistItems.length; j++){
            const checklistitem = document.createElement("li");
            checklistitem.textContent = checlistItems[j].description;
            checklistitem.setAttribute("status",checlistItems[j].status);
            checklistitem.setAttribute("UID",checlistItems[j].id);
            checklistitem.after('<button>✖</button>');
            checklistEle.appendChild(checklistitem);
        }

        toDoList.appendChild(ele);
    }

}

function getToDoObj(target){
    //if target is supplied, find UID of nearest todo item
    const toDoId =  target ? getTargetToDoId(target) : getSelectedToDoId();
    const ProjectObj = getSelectedProjectObj();
        return ProjectObj.returnItemById(toDoId);
}

function getTargetToDoId(target){
    const toDoEle = target.closest(".todo-item");
    const toDoId = toDoEle.getAttribute("UID");
    return toDoId;
}

function getSelectedToDoId(){
    return toDoList.getAttribute("selectedtodoId");
}


/***********   Checklist Management   ************/
const checkListModal = document.querySelector("#checklist-modal");
const checkListForm = checkListModal.querySelector("form");
const checkListSaveBtn = checkListForm.querySelector(".save-btn");
const checkListCancelBtn = checkListForm.querySelector(".cancel-btn");

//Add event listener to the Add Checklist Item buttons
toDoList.addEventListener("click",(e)=>{
    if(!Array.from(e.target.classList).includes("add-checklist-item")){
        return;
    }
    const targetToDoId = getTargetToDoId(e.target);
    toDoList.setAttribute("selectedtodoId", targetToDoId);
    checkListModal.showModal();
})

checkListCancelBtn.addEventListener("click",() => {
    checkListForm.reset();
    checkListModal.close();
})

checkListSaveBtn.addEventListener("click",(e) => {
    const formData = new FormData(checkListForm);
    const item = formData.get("item");

    //get current to do object
    const ToDoObj = getToDoObj();
    //add the item
    ToDoObj.addItem(new ChecklistItem(item));
    checkListModal.close();
    renderToDos();
    console.log(ProjectCollection);
})


