function storageAvailable(type) {
    let storage;
    try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        e.name === "QuotaExceededError" &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  }


function populateStorage(projectStorageName, registry, projects){
    localStorage.setItem(projectStorageName, JSON.stringify(projects, replacer(registry)));
    //localStorage.setItem(projectStorageName, JSON.stringify(projects, replacer));
}

function getStorage(projectStorageName, registry){
    let projectJSONObj = localStorage.getItem(projectStorageName);
    return JSON.parse(projectJSONObj, reviver(registry));
}

function replacer(registry){
  return (key, value)=>{
    if (value && registry[value.constructor.name]) {
      return { ...value, __type: value.constructor.name };
    }
    return value;
  }
}

function reviver(registry){
  return (key, value)=>{
    if (value && value.__type && registry[value.__type]) {
      const { __type, ...props } = value;
      return Object.assign(new registry[__type](), props);
    }
    return value;
}
}

export { storageAvailable, populateStorage, getStorage }