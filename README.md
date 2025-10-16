# Campus Life Planner

Campus Life Planner is designed to make student productivity effortless, accessible, and visually engaging.  
Here’s everything it can do — organized to align with the project rubric:

---

### Core Functionalities
- **Task Dashboard:** View all your study sessions, deadlines, and campus activities at a glance.  
- **Add, Edit, Delete Records:** Manage your tasks dynamically using in-app forms and validation.  
- **Search & Filter:** Search by keywords or tags using regex-powered queries (e.g., `@tag:study`).  
- **Total Time Tracker:** Automatically sums up total duration of all logged tasks.  
- **Weekly Activity Chart:** Visual display of time spent each day.  

---

### Regex & Validation Features
- **Regex Validation:** Prevents empty titles, enforces proper date format, and checks for duplicates.  
- **Real-time Error Alerts:** Inline validation messages appear as you type.  
- **Smart Search Engine:** Accepts regex-based input patterns for flexible record filtering.  
- **Pattern Testing (tests.html):** Separate validation tester file to verify all regex rules.  

---

### Data Management
- **LocalStorage Integration:** All tasks persist even after closing or refreshing the browser.  
- **Import Data:** Load existing `.json` files from another device.  
- **Export Data:** Download all records in structured JSON format.  
- **Automatic Sync:** Changes instantly reflected on dashboard and chart.  

---

### Responsive Design
- **Mobile-First Layout:** Works perfectly on phones, tablets, and desktops.  
- **Adaptive Grid System:** Smooth transitions between screen sizes (min 3 breakpoints).  
- **CSS Transitions & Hover Effects:** Subtle animations enhance the UI.  
- **Accessible Font Scaling:** Uses `clamp()` for responsive text resizing.  

---

### Accessibility Features
- **Screen Reader Announcements:** Uses ARIA live regions to announce actions (e.g., “Task added”).  
- **Keyboard Navigation:** Navigate all buttons and inputs using `Tab`, `Enter`, and shortcut keys.  
- **ARIA Roles & Labels:** Added to all interactive and feedback elements.  
- **Skip to Content Link:** Allows quick jump to the main section.  
- **High Contrast Theme:** Meets WCAG AA color-contrast standards.  

---

### Settings Module
- **Time Cap Setting:** Define your daily or weekly study limit.  
- **Progress Feedback:** Announces how much time remains or if target exceeded.  
- **Persistent Preferences:** All settings saved automatically in localStorage.  

---

### Dashboard Metrics
- **Total Tasks:** Count of all entries logged.  
- **Total Duration:** Combined minutes/hours of all tasks.  
- **Most Frequent Tag:** Displays your most common activity type.  
- **Visual Chart:** Compact bar graph using native JS and CSS grid.  

---

### Keyboard Shortcuts
| Action | Shortcut |
|---------|-----------|
| Add new record | `Alt + N` |
| Edit record | `Alt + E` |
| Delete record | `Alt + D` |
| Focus search bar | `/` |
| Open Settings | `Alt + S` |
| Return to Dashboard | `Alt + H` |
| Navigate items | `Tab` / `Shift + Tab` |

---

### Testing Tools
- **tests.html:** Verifies all regex and validation patterns.  
- **Manual Testing Scenarios:** Includes sample seed data in `seed.json`.  
- **Console Logging (Dev Mode):** Clean debugging messages for developers.  

---

### Bonus Enhancements
- **Dark/Light Mode Toggle** *(future-ready placeholder in settings.js)*  
- **Tag-based Filtering:** Type `@tag:work` or `@tag:study` to instantly filter.  
- **Category Analytics:** Planned for future dashboard updates.  
- **Animated Status Alerts:** ARIA messages fade in/out gracefully.  

---
