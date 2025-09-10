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
    if(Array.from(e.target.classList).includes("delete-project")){
        const selectedProject = e.target.parentElement;
        const selectedProjectId = selectedProject.getAttribute('UID');
        const confirmMessage = "Are you sure you want to delete this project and its to-do items?"
        if(confirm(confirmMessage) === true){
            ProjectCollection.deleteItem(selectedProjectId);
        }
    }
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

/***********   To-do Management   ************/
let elementInFocus = undefined;

//find the relevant elements
const addToDoBtn = document.querySelector("#add-todo-item");
const toDoModal = document.querySelector("#todo-modal");
const toDoForm = toDoModal.querySelector("form");
const cancelModal = toDoModal.querySelector("cancel-btn");
const saveModal = toDoModal.querySelector("save-btn");

// Add To-do. Used mousedown to detect previously focused item
addToDoBtn.addEventListener("mousedown",()=>{
    //First check if a project is selected
    elementInFocus = document.activeElement;
    if(Array.from(elementInFocus.classList).includes("project-item")){
        toDoForm.setAttribute(mode,"add");
        toDoForm.setAttribute("projectId",elementInFocus.getAttribute("UID"));
        toDoModal.showModal();
    }
    else{
        alert("Please select a project you would like to add your to-do to.");
    }
})

//Cancel Todo Create/Edit
cancelModal.addEventListener("click",()=>{
    currentMode = undefined;
    toDoModal.close();
})

//Create Todo Item
saveModal.addEventListener("click",()=>{
    const formData = new FormData(toDoForm);
    //Check if the form is in edit or add mode
    const mode = toDoForm.getAttribute("mode");
    const projectId = toDoForm.getAttribute("projectId");
    const toDoId = toDoForm.getAttribute("toDoId");
    const currentToDo = toDoForm.getAttribute("toDoId");
    if(mode === "add"){
        addToDo(projectId,formData);
        //renderToDos()
    }
    else{
        editToDo(projectId,toDoId,formData)
    }
})

function addToDo(projectId,formData){
    const title = formData.get("title");
    const description = formData.get("description");
    const dueDate = formData.get("due-date");
    const priority = formData.get("priority");
    const ProjectObj = ProjectCollection.returnItemByID(projectId);
    ProjectObj.addItem(new TodoItem(title, description, dueDate, priority));
}

function editToDo(projectId,toDoId,formData){
    const title = formData.get("title");
    const description = formData.get("description");
    const dueDate = formData.get("due-date");
    const priority = formData.get("priority");
    const ProjectObj = ProjectCollection.returnItemByID(projectId);
    const ToDoObj = ProjectObj.returnItemByID(toDoId);
    ToDoObj.modifyProperty("title", title);
    ToDoObj.modifyProperty("description", description);
    ToDoObj.modifyProperty("dueDate", dueDate);
    ToDoObj.modifyProperty("priority", priority);
    
    
}