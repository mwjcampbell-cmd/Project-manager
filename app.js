let db;
const request = indexedDB.open("BuildingProjectsDB", 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    const objectStore = db.createObjectStore("projects", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("name", "name", { unique: false });
};

request.onsuccess = function(e) {
    db = e.target.result;
    displayProjects();
};

request.onerror = function(e) {
    console.error("Error opening IndexedDB", e);
};

document.getElementById("addProjectBtn").addEventListener("click", () => {
    const name = document.getElementById("projectName").value;
    const client = document.getElementById("projectClient").value;
    const deadline = document.getElementById("projectDeadline").value;

    if (!name || !client || !deadline) return alert("All fields are required.");

    const transaction = db.transaction(["projects"], "readwrite");
    const store = transaction.objectStore("projects");
    store.add({ name, client, deadline });
    transaction.oncomplete = () => {
        displayProjects();
        document.getElementById("projectName").value = "";
        document.getElementById("projectClient").value = "";
        document.getElementById("projectDeadline").value = "";
    };
});

function displayProjects() {
    const list = document.getElementById("projects");
    list.innerHTML = "";
    const transaction = db.transaction(["projects"], "readonly");
    const store = transaction.objectStore("projects");
    const request = store.openCursor();

    request.onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            const li = document.createElement("li");
            li.textContent = `${cursor.value.name} - ${cursor.value.client} (Deadline: ${cursor.value.deadline})`;
            list.appendChild(li);
            cursor.continue();
        }
    };
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
        .then(() => console.log("Service Worker Registered"))
        .catch(err => console.error("Service Worker Failed:", err));
    });
}