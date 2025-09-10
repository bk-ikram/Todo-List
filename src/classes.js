class ProjectList{
    constructor(projectsInStorage = []){
        this.list = projectsInStorage;
    }
    
}

class Project{
    constructor(name){
        this.id = crypto.randomUUID()
        this.name = name
        this.list = []
    }

}

class TodoItem{
    constructor(title, description, dueDate, priority){
        this.id = crypto.randomUUID();
        this.title = title
        this.description = description
        this.dueDate = dueDate
        this.priority = priority
        this.status = 'Not Started'
        this.list = []
        this.notes = ''
    }

}

class ChecklistItem {
    constructor(description){
        this.id = crypto.randomUUID()
        this.description = description
        this.status = 'Not Started'
    }

    toggleStatus (){
        this.status === 'Not Started' ? 'Completed' : 'Not Started';
    }
}

const hasItems = {
    addItem(classConstructor){
        this.list.push(classConstructor);
    },
    deleteItem(id){
        index = this.list.indexOf(id);
        this.list.splice(index,1);
    },
    modifyProperty(property, newValue){
        this[property] = newValue;
    },
    returnItemById(id){
        index = this.list.indexOf(id);
        return this.list[index];
    }
}

const isItem = {
    modifyProperty(property, newValue){
        this[property] = newValue;
    }
}

Object.assign(Project.prototype, hasItems);
Object.assign(ProjectList.prototype, hasItems);
Object.assign(TodoItem.prototype, hasItems, isItem);
Object.assign(ChecklistItem.prototype, isItem);



export { Project , TodoItem , ChecklistItem, ProjectList}