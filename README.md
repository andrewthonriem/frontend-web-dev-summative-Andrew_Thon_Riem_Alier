# Campus Life Planner

### Overview
**Campus Life Planner** is a responsive, accessible, and mobile-first web app built using **vanilla HTML, CSS, and JavaScript**.  
It helps students plan their campus life efficiently by tracking tasks, events, and study sessions with tags, durations, and deadlines.

The app allows you to:
- Add, edit, and delete tasks/events  
- Search tasks using **live regex search**  
- Sort tasks by title, date, or duration  
- View stats such as total tasks, total duration, and a 7-day trend chart  
- Persist data with **localStorage**  
- Import/export task data as JSON  
- Set and monitor study/time caps  
- Navigate entirely via keyboard with accessible feedback  

---

## Live Demo
**GitHub Pages URL:**  
 [https://yourusername.github.io/campus-life-planner/](#)

*(Replace with your actual GitHub Pages URL after deployment)*

---

## Features

| Category | Description |
|-----------|-------------|
| **Core Pages** | About, Dashboard, Tasks, Add/Edit Form, Settings |
| **Regex Validation** | 4+ input rules including one advanced regex |
| **Responsive Design** | Mobile-first layout, 3+ breakpoints |
| **Persistence** | Auto-saves tasks in localStorage |
| **Import/Export** | Validates and loads JSON data |
| **Sorting & Filtering** | Sort by date/title/duration, live regex search |
| **Stats Dashboard** | Total tasks, total duration, top tag, 7-day chart |
| **Accessibility (a11y)** | Keyboard navigation, ARIA live, visible focus, semantic HTML |
| **Unit Conversion** | Convert minutes ↔ hours |
| **Settings** | Manage target caps and units |
| **UX Polish** | Smooth animations, empty/error states |

---

## Data Model

Each task or event follows this structure:

```json
{
  "id": "task_001",
  "title": "Study Group Session",
  "dueDate": "2025-09-30",
  "duration": 120,
  "tag": "Academics",
  "createdAt": "2025-09-20T12:00:00Z",
  "updatedAt": "2025-09-20T12:00:00Z"
}
