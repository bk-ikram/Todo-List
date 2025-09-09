import "./styles.css";
import { Project , TodoItem , ChecklistItem } from './classes.js';
import { storageAvailable, populateStorage, getStorage } from './storage.js';

const projectStorageName = "__projectList__";

const registry = {
    Project,
    TodoItem,
    ChecklistItem
  };


const isLocalStorageAvailable = storageAvailable("localStorage");


// Initialize project list
let projects = initializeProjects(projectStorageName);

function initializeProjects(projectStorageName){
    // Load projects from local storage
    //// Test to see if localStorage is available for use
    if (isLocalStorageAvailable) {
        // Check if we have data for this project stored in localStorage
        if(localStorage.projectStorageName){
            console.log("Project Data found in local storage");
            return getStorage(projectStorageName);
        }
        console.log("No project data found in local storage.");
    }
    else{
        console.log("Local Storage cannot be used currently.")
    }
    return [new Project('My To do List')];
}

const projectList = document.querySelector("#project-list");
const projectTemplate= projectList.querySelector("template");

/*
//for testing
//create a new project
projects.push(new Project("Test Project"));

projects[1].addItem(new TodoItem('My first item', 'This is my very first to do list item', '2025-12-31', 'normal'));
*/
populateStorage(projectStorageName, registry, projects);

projects = getStorage(projectStorageName, registry);

renderProjects();

console.log(projects);


/***********   Add element funcitonality   ************/


//find the relevant elements
const addProjectBtn = document.querySelector("#add-project");
const projectmodal = document.querySelector("#project-modal");
const projectForm = projectmodal.querySelector("form");
const projectSaveBtn = projectmodal.querySelector(".save-btn");
const projectCancelBtn = projectmodal.querySelector(".cancel-btn");


console.log("current code working");

//Add the event listeners
addProjectBtn.addEventListener("click",()=>{
    console.log("button clicked");
    projectmodal.showModal();
})

projectList.addEventListener("click",(e)=>{
    console.log("delete-project" in Array.from(e.target.classList))
    if(Array.from(e.target.classList).includes("delete-project")){
        e.target.parentElement.remove();
    }
})

projectSaveBtn.addEventListener("click",()=>{
    const formData = new FormData(projectForm);
    const projectName = formData.get("project-name");
    projects.push(new Project(projectName));
    //update storage
    populateStorage(projectStorageName, registry, projects);
    //render project list
    renderProjects();
    projectmodal.close();
});

projectCancelBtn.addEventListener("click",()=>{
    projectmodal.close();
});




//Rendering elements on the page

function renderProjects(){
    //Remove currently rendered projects
    const renderedList = Array.from(projectList.children).filter((ele) => ele.tagName === "SPAN");
    renderedList.map((ele)=>ele.remove());
    for(let i = 0; i < projects.length; i++){
        const ele = projectTemplate.content.cloneNode(true);
        ele.querySelector("h2").textContent = projects[i].name;
        projectList.appendChild(ele);
        console.log(i);
    }
};