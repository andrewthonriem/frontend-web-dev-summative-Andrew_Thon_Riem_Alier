import { storage } from './storage.js';

// Application state
let tasks = [];
let settings = {};
let currentEditId = null;

// Initialize state
export const state = {
    // Initialize application state
    init() {
        tasks = storage.loadTasks();
        settings = storage.loadSettings();
        this.sortTasks('date-desc');
    },

    // Get all tasks
    getTasks() {
        return [...tasks];
    },

    // Get filtered tasks (for search)
    getFilteredTasks() {
        return this.getTasks(); // Will be filtered by search module
    },

    // Get task by ID
    getTask(id) {
        return tasks.find(task => task.id === id);
    },

    // Add new task
    addTask(taskData) {
        const newTask = {
            id: this.generateId(),
            title: taskData.title.trim(),
            dueDate: taskData.dueDate,
            duration: parseInt(taskData.duration),
            tag: taskData.tag,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        this.sortTasks(); // Maintain current sort
        storage.saveTasks(tasks);
        return newTask;
    },

    // Update existing task
    updateTask(id, updates) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return null;

        const updatedTask = {
            ...tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        tasks[taskIndex] = updatedTask;
        this.sortTasks(); // Maintain current sort
        storage.saveTasks(tasks);
        return updatedTask;
    },

    // Delete task
    deleteTask(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return false;

        tasks.splice(taskIndex, 1);
        storage.saveTasks(tasks);
        return true;
    },

    // Sort tasks
    sortTasks(sortBy = 'date-desc') {
        const [field, direction] = sortBy.split('-');
        
        tasks.sort((a, b) => {
            let aVal, bVal;

            switch (field) {
                case 'title':
                    aVal = a.title.toLowerCase();
                    bVal = b.title.toLowerCase();
                    break;
                case 'duration':
                    aVal = a.duration;
                    bVal = b.duration;
                    break;
                case 'date':
                default:
                    aVal = new Date(a.dueDate);
                    bVal = new Date(b.dueDate);
            }

            if (typeof aVal === 'string') {
                return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
        });
    },

    // Generate unique ID
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get settings
    getSettings() {
        return { ...settings };
    },

    // Update settings
    updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        storage.saveSettings(settings);
        return settings;
    },

    // Calculate statistics
    getStats() {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalTasks = tasks.length;
        const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
        
        // Get top tag
        const tagCounts = {};
        tasks.forEach(task => {
            tagCounts[task.tag] = (tagCounts[task.tag] || 0) + 1;
        });
        const topTag = Object.keys(tagCounts).reduce((a, b) => 
            tagCounts[a] > tagCounts[b] ? a : b, 'None'
        );

        // Get this week's tasks
        const weekTasks = tasks.filter(task => 
            new Date(task.dueDate) >= oneWeekAgo
        ).length;

        // Calculate daily usage for chart
        const dailyUsage = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyUsage[dateStr] = tasks.filter(task => 
                task.dueDate === dateStr
            ).length;
        }

        // Calculate cap usage
        const today = now.toISOString().split('T')[0];
        const todayDuration = tasks
            .filter(task => task.dueDate === today)
            .reduce((sum, task) => sum + task.duration, 0);

        const capPercentage = settings.dailyCap > 0 ? 
            Math.min((todayDuration / settings.dailyCap) * 100, 100) : 0;

        return {
            totalTasks,
            totalDuration,
            topTag,
            weekTasks,
            dailyUsage,
            todayDuration,
            capPercentage,
            isOverCap: todayDuration > settings.dailyCap
        };
    },

    // Set current edit ID
    setCurrentEditId(id) {
        currentEditId = id;
    },

    // Get current edit ID
    getCurrentEditId() {
        return currentEditId;
    },

    // Convert duration units
    convertDuration(duration, fromUnit, toUnit) {
        if (fromUnit === toUnit) return duration;
        
        if (fromUnit === 'minutes' && toUnit === 'hours') {
            return (duration / 60).toFixed(1);
        } else if (fromUnit === 'hours' && toUnit === 'minutes') {
            return Math.round(duration * 60);
        }
        
        return duration;
    },

    // Export data
    exportData() {
        return storage.exportData(tasks, settings);
    },

    // Import data
    importData(jsonString) {
        const imported = storage.importData(jsonString);
        tasks = imported.tasks;
        settings = imported.settings;
        storage.saveTasks(tasks);
        storage.saveSettings(settings);
        return true;
    },

    // Clear all data
    clearData() {
        tasks = [];
        settings = storage.loadSettings(); // Reset to default settings
        storage.clearAllData();
        return true;
    }
};