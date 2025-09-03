
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


//for testing
//create a new project
projects.push(new Project("Test Project"));

projects[1].addItem(new TodoItem('My first item', 'This is my very first to do list item', '2025-12-31', 'normal'));

populateStorage(projectStorageName, registry, projects);

projects = getStorage(projectStorageName, registry);

console.log(projects);