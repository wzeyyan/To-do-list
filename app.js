// Global App State & Storage Key
const STORAGE_KEY = 'taskManagerLocalData';
let tasks = [];
let currentViewMode = 'month'; // month / week
let currentDisplayDate = new Date();

// Sample default tasks when empty localStorage
const defaultSampleTasks = [
    {
        id: crypto.randomUUID(),
        title: "Complete Software Engineering Homework",
        description: "Finish requirements analysis document for assignment",
        priority: "High",
        category: "Study",
        dueDate: getISODate(new Date()),
        dueTime: "15:30",
        completed: false
    },
    {
        id: crypto.randomUUID(),
        title: "Grocery Shopping",
        description: "Buy milk, fruit and daily necessities",
        priority: "Medium",
        category: "Personal",
        dueDate: getISODate(addDays(new Date(),1)),
        dueTime: "18:00",
        completed: false
    },
    {
        id: crypto.randomUUID(),
        title: "Team Weekly Sync Meeting",
        description: "Project progress discussion with dev teammates",
        priority: "Low",
        category: "Work",
        dueDate: getISODate(addDays(new Date(),2)),
        dueTime: "10:00",
        completed: false
    }
];

// Init on page load
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    loadFromLocalStorage();
    bindAllEventListeners();
    renderCalendar();
    renderFilteredTaskList();
    startReminderChecker();
}

// LocalStorage Helpers
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function loadFromLocalStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) tasks = JSON.parse(saved);
    else tasks = [...defaultSampleTasks];
}

// Date Utility Functions
function getISODate(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
}
function parseISODate(dStr){
    return new Date(dStr + "T00:00:00");
}
function addDays(date, days){
    const copy = new Date(date);
    copy.setDate(copy.getDate()+days);
    return copy;
}

// Toast Notification System
function showToast(message, type="info"){
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    let bg = 'bg-sky-500';
    if(type==='warn') bg='bg-amber-500';
    if(type==='success') bg='bg-emerald-500';
    toast.className = `${bg} text-white px-4 py-2 rounded-lg shadow toast-popup max-w-xs`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(()=>toast.remove(),3500);
}

// Modal DOM References
const taskModal = document.getElementById('taskModal');
const rescheduleModal = document.getElementById('rescheduleModal');
const taskForm = document.getElementById('taskForm');

// Bind All UI Events
function bindAllEventListeners(){
    // Open New Task Modal
    document.getElementById('openTaskModalBtn').onclick = ()=>{
        resetTaskForm();
        document.getElementById('modalTitle').textContent = "Create New Task";
        taskModal.classList.remove('hidden');
    };
    document.getElementById('closeModal').onclick = ()=> taskModal.classList.add('hidden');

    // Task Form Submit (Create/Edit)
    taskForm.onsubmit = (e)=>{
        e.preventDefault();
        const taskId = document.getElementById('taskId').value;
        const newTask = {
            id: taskId || crypto.randomUUID(),
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDesc').value.trim(),
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value,
            dueDate: document.getElementById('taskDueDate').value,
            dueTime: document.getElementById('taskDueTime').value,
            completed: false
        };
        if(taskId){
            // Update existing
            const idx = tasks.findIndex(t=>t.id === taskId);
            newTask.completed = tasks[idx].completed;
            tasks[idx] = newTask;
            showToast("Task updated successfully", "success");
        }else{
            // Create new
            tasks.push(newTask);
            showToast("New task created", "success");
        }
        saveToLocalStorage();
        taskModal.classList.add('hidden');
        resetTaskForm();
        renderCalendar();
        renderFilteredTaskList();
    };

    // Calendar Nav Buttons
    document.getElementById('prevDate').onclick = ()=>{
        if(currentViewMode==='month') currentDisplayDate.setMonth(currentDisplayDate.getMonth()-1);
        else currentDisplayDate.setDate(currentDisplayDate.getDate()-7);
        renderCalendar();
    };
    document.getElementById('nextDate').onclick = ()=>{
        if(currentViewMode==='month') currentDisplayDate.setMonth(currentDisplayDate.getMonth()+1);
        else currentDisplayDate.setDate(currentDisplayDate.getDate()+7);
        renderCalendar();
    };
    document.getElementById('todayBtn').onclick = ()=>{
        currentDisplayDate = new Date();
        renderCalendar();
    };

    // View Switch Month / Week
    document.querySelectorAll('.viewSwitch').forEach(btn=>{
        btn.onclick = ()=>{
            document.querySelectorAll('.viewSwitch').forEach(b=>b.classList.replace('bg-blue-600','bg-slate-300'));
            btn.classList.replace('bg-slate-300','bg-blue-600');
            currentViewMode = btn.dataset.view;
            renderCalendar();
        }
    });

    // Search & Filter change auto refresh list
    ['searchInput','filterCategory','filterPriority','filterStatus'].forEach(id=>{
        document.getElementById(id).addEventListener('input', renderFilteredTaskList);
    });

    // Reschedule modal controls
    document.getElementById('cancelResched').onclick = ()=> rescheduleModal.classList.add('hidden');
    document.getElementById('saveResched').onclick = ()=>{
        const tid = document.getElementById('rescheduleTaskId').value;
        const newDate = document.getElementById('newReschedDate').value;
        const task = tasks.find(t=>t.id===tid);
        if(task){
            task.dueDate = newDate;
            saveToLocalStorage();
            renderCalendar();
            renderFilteredTaskList();
            showToast("Task rescheduled successfully",'success');
        }
        rescheduleModal.classList.add('hidden');
    };
}

function resetTaskForm(){
    taskForm.reset();
    document.getElementById('taskId').value = '';
    document.getElementById('modalTitle').textContent = 'Create New Task';
}

// Open Edit Task Modal
function openEditTask(taskObj){
    document.getElementById('taskId').value = taskObj.id;
    document.getElementById('taskTitle').value = taskObj.title;
    document.getElementById('taskDesc').value = taskObj.description;
    document.getElementById('taskPriority').value = taskObj.priority;
    document.getElementById('taskCategory').value = taskObj.category;
    document.getElementById('taskDueDate').value = taskObj.dueDate;
    document.getElementById('taskDueTime').value = taskObj.dueTime;
    document.getElementById('modalTitle').textContent = "Edit Task";
    taskModal.classList.remove('hidden');
}

// Open Reschedule Popup from Calendar Item Click
function openReschedule(taskId, defaultDate){
    document.getElementById('rescheduleTaskId').value = taskId;
    document.getElementById('newReschedDate').value = defaultDate;
    rescheduleModal.classList.remove('hidden');
}

// Render Calendar (Month / Week)
function renderCalendar(){
    const wrap = document.getElementById('calendarWrap');
    const header = document.getElementById('calendarHeader');
    wrap.innerHTML = '';

    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const weekDayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    if(currentViewMode === 'month'){
        header.textContent = `${new Date(year,month).toLocaleString('default',{month:'long'})} ${year}`;
        // Month grid render
        const firstDay = new Date(year,month,1);
        const lastDay = new Date(year,month+1,0);
        const startPaddingDays = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Week name header row
        let html = `<div class="grid grid-cols-7">`;
        weekDayNames.forEach(d=> html += `<div class="calendar-week-header">${d}</div>`);
        html += `</div><div class="grid grid-cols-7">`;

        // Empty leading cells
        for(let i=0; i<startPaddingDays; i++) html += `<div class="calendar-day-cell bg-slate-50"></div>`;
        // Actual date cells
        for(let d=1; d<=totalDays; d++){
            const cellDateStr = getISODate(new Date(year,month,d));
            const dayTasks = tasks.filter(t=>t.dueDate === cellDateStr);
            html += `<div class="calendar-day-cell">
                <div class="font-medium text-sm mb-1">${d}</div>
                ${dayTasks.map(tsk=>`
                    <div class="task-calendar-item priority-${tsk.priority.toLowerCase()}" onclick='openReschedule("${tsk.id}","${cellDateStr}")' title="${tsk.title} | Click to reschedule">${shortenStr(tsk.title,12)}</div>
                `).join('')}
            </div>`;
        }
        html += `</div>`;
        wrap.innerHTML = html;
    }else{
        // Weekly view render
        header.textContent = `Week of ${getISODate(getWeekStart(currentDisplayDate))}`;
        const weekStart = getWeekStart(currentDisplayDate);
        let html = `<div class="grid grid-cols-7">`;
        weekDayNames.forEach(d=> html += `<div class="calendar-week-header">${d}</div>`);
        html += `</div><div class="grid grid-cols-7">`;

        for(let i=0; i<7; i++){
            const currDay = addDays(weekStart,i);
            const dateStr = getISODate(currDay);
            const dayTasks = tasks.filter(t=>t.dueDate === dateStr);
            html += `<div class="calendar-day-cell">
                <div class="font-medium text-sm mb-1">${currDay.getDate()}</div>
                ${dayTasks.map(tsk=>`
                    <div class="task-calendar-item priority-${tsk.priority.toLowerCase()}" onclick='openReschedule("${tsk.id}","${dateStr}")' title="${tsk.title} | Click to reschedule">${shortenStr(tsk.title,12)}</div>
                `).join('')}
            </div>`;
        }
        html += `</div>`;
        wrap.innerHTML = html;
    }
}

function getWeekStart(d){
    const copy = new Date(d);
    const day = copy.getDay();
    copy.setDate(copy.getDate()-day);
    return copy;
}
function shortenStr(s,max){
    return s.length>max ? s.substring(0,max)+'...' : s;
}

// Filter & Render Task List
function renderFilteredTaskList(){
    const wrap = document.getElementById('taskListWrap');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const catFilter = document.getElementById('filterCategory').value;
    const prioFilter = document.getElementById('filterPriority').value;
    const statFilter = document.getElementById('filterStatus').value;

    let filtered = [...tasks];
    // Search filter
    if(search){
        filtered = filtered.filter(t=>
            t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search)
        );
    }
    // Category
    if(catFilter !== 'all') filtered = filtered.filter(t=>t.category === catFilter);
    // Priority
    if(prioFilter !== 'all') filtered = filtered.filter(t=>t.priority === prioFilter);
    // Completion status
    if(statFilter !== 'all') filtered = filtered.filter(t=>String(t.completed) === statFilter);

    if(filtered.length ===0){
        wrap.innerHTML = `<div class="col-span-full text-slate-500 py-4">No matching tasks found.</div>`;
        return;
    }
    wrap.innerHTML = filtered.map(task=>{
        let prioCls = '';
        if(task.priority==='High') prioCls='border-l-4 border-red-500';
        if(task.priority==='Medium') prioCls='border-l-4 border-amber-500';
        if(task.priority==='Low') prioCls='border-l-4 border-green-500';
        return `
        <div class="border rounded-lg p-4 ${prioCls} ${task.completed ? 'completed-task-card bg-slate-50' : ''}">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold">${task.title}</h4>
                <div class="flex gap-1">
                    <button onclick='openEditTask(tasks.find(x=>x.id=="${task.id}") )' class="text-blue-600 text-sm">Edit</button>
                    <button onclick='deleteTask("${task.id}")' class="text-red-600 text-sm">Del</button>
                </div>
            </div>
            <p class="text-sm text-slate-600 mb-2">${task.description||'No description'}</p>
            <div class="text-xs text-slate-500 mb-2">
                <span class="mr-3">Cat:${task.category}</span>
                <span class="mr-3">Prio:${task.priority}</span>
                <span>Due:${task.dueDate} ${task.dueTime}</span>
            </div>
            <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" ${task.completed?'checked':''} onchange="toggleComplete('${task.id}')">
                Mark Completed
            </label>
        </div>`;
    }).join('');
}

// Toggle Complete Status
window.toggleComplete = function(id){
    const t = tasks.find(x=>x.id===id);
    if(!t)return;
    t.completed = !t.completed;
    saveToLocalStorage();
    renderFilteredTaskList();
    renderCalendar();
}
// Delete Task
window.deleteTask = function(id){
    if(!confirm("Delete this task permanently?"))return;
    tasks = tasks.filter(x=>x.id!==id);
    saveToLocalStorage();
    renderFilteredTaskList();
    renderCalendar();
    showToast("Task deleted",'warn');
}
// Expose global for calendar click reschedule / edit
window.openReschedule = openReschedule;
window.openEditTask = openEditTask;

// Reminder Checker: every 60s check tasks due in 15min
function startReminderChecker(){
    setInterval(()=>{
        const now = new Date();
        const target = new Date(now.getTime() + 15*60*1000); // +15min
        const targetISO = getISODate(target);
        const targetTime = `${String(target.getHours()).padStart(2,'0')}:${String(target.getMinutes()).padStart(2,'0')}`;

        const remindTasks = tasks.filter(t=> t.dueDate === targetISO && t.dueTime === targetTime && !t.completed);
        remindTasks.forEach(tsk=>{
            const msg = `REMINDER: Task "${tsk.title}" is due in 15 minutes! Category:${tsk.category}, Priority:${tsk.priority}`;
            showToast(msg,'warn');
            // Simulate Email log output
            console.log("[SIMULATED EMAIL SENT] "+msg);
        })
    },60000);
}