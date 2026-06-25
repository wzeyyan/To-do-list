# Personal Task & Calendar Manager

A web-based personal task management system with integrated calendar functionality, designed for efficient daily task organization. This application runs entirely in the browser, leveraging local storage for data persistence.

## Project Overview
This project provides a centralized system to manage tasks, featuring:
- **Calendar Integration**: Monthly and weekly calendar views to visualize tasks on a timeline.
- **Task Management**: Full CRUD (Create, Read, Update, Delete) functionality for tasks, including title, description, priority (High/Medium/Low), category, and due date/time.
- **Data Persistence**: Automatic data saving using the browser's `localStorage` to ensure data remains available across page refreshes.
- **Task Filtering & Search**: Real-time keyword search and filtering by category, priority, and completion status.
- **In-App Reminders**: Automatic detection of tasks due within 15 minutes, with in-app notifications (toasts) and simulated email logs in the console.

## Features
- **Responsive UI**: Built with HTML5, CSS3, and Tailwind CSS for a clean, mobile-friendly interface.
- **No Server Required**: Runs natively in modern web browsers (Chrome, Edge, Firefox).
- **Interactive Calendar**: One-click rescheduling of tasks directly from the calendar view.
- **Visual Feedback**: Priority-based color coding for tasks and visual indicators for completed tasks.

## Technologies Used
- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES6+).
- **Storage**: Browser `localStorage` (JSON-based key-value storage).
- **Development Tools**: VS Code, Git, Draw.io (for diagrams).

## Getting Started
To use this application:
1. Clone the repository: `git clone https://github.com/wzeyyan/To-do-list.git`
2. Open the `index.html` file directly in any modern web browser.
3. No server or build setup is required.

## Documentation & Design
- **System Architecture**: Front-end single-layer architecture (Presentation, Business Logic, Data Storage layers).
- **Data Structure**: Tasks are stored as a JSON array of objects, identified by unique UUIDs.

*This project was developed as part of a Software Engineering course.*
