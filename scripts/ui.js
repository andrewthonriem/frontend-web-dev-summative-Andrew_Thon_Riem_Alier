import { state } from './state.js';
import { validators } from './validators.js';
import { search } from './search.js';

export const ui = {
    // Initialize UI components
    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.renderAll();
        this.announceStatus('Campus Life Planner loaded successfully', 'success');
    },

    // Setup navigation
    setupNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
            });
        }

        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Update active nav link
                    navLinks.forEach(l => l.removeAttribute('aria-current'));
                    link.setAttribute('aria-current', 'page');
                    
                    // Close mobile menu if open
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    },

    // Setup event listeners
    setupEventListeners() {
        // Task form
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', this.handleAddTask.bind(this));
            taskForm.addEventListener('input', this.handleFormValidation.bind(this));
        }

        // Edit form
        const editForm = document.getElementById('edit-form');
        if (editForm) {
            editForm.addEventListener('submit', this.handleEditTask.bind(this));
        }

        // Sort control
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSort.bind(this));
        }

        // Settings
        const saveCapBtn = document.getElementById('save-cap');
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        const importFile = document.getElementById('import-file');
        const clearDataBtn = document.getElementById('clear-data');
        const durationUnits = document.getElementById('duration-units');

        if (saveCapBtn) {
            saveCapBtn.addEventListener('click', this.handleSaveCap.bind(this));
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', this.handleExport.bind(this));
        }
        if (importBtn) {
            importBtn.addEventListener('click', () => importFile.click());
        }
        if (importFile) {
            importFile.addEventListener('change', this.handleImport.bind(this));
        }
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', this.handleClearData.bind(this));
        }
        if (durationUnits) {
            durationUnits.addEventListener('change', this.handleUnitsChange.bind(this));
        }

        // Global events
        window.addEventListener('searchUpdated', this.handleSearchUpdate.bind(this));
    },

    // Handle add task form submission
    handleAddTask(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title'),
            dueDate: formData.get('dueDate'),
            duration: formData.get('duration'),
            tag: formData.get('tag')
        };

        // Validate form
        const validation = validators.validateForm(taskData);
        
        if (!validation.isValid) {
            this.showFormErrors('task-form', validation.errors);
            return;
        }

        // Clear any previous errors
        this.clearFormErrors('task-form');

        // Add task
        try {
            const newTask = state.addTask(taskData);
            this.renderAll();
            form.reset();
            
            // Show warnings if any
            if (validation.warnings.length > 0) {
                this.announceStatus(`Task added with warnings: ${validation.warnings.join(', ')}`, 'warning');
            } else {
                this.announceStatus('Task added successfully', 'success');
            }
            
            // Scroll to tasks section
            document.getElementById('tasks').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            this.announceStatus('Error adding task: ' + error.message, 'error');
        }
    },

    // Handle edit task form submission
    handleEditTask(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title'),
            dueDate: formData.get('dueDate'),
            duration: formData.get('duration'),
            tag: formData.get('tag')
        };

        // Validate form
        const validation = validators.validateForm(taskData);
        
        if (!validation.isValid) {
            this.showFormErrors('edit-form', validation.errors);
            return;
        }

        // Clear any previous errors
        this.clearFormErrors('edit-form');

        // Update task
        try {
            const taskId = state.getCurrentEditId();
            const updatedTask = state.updateTask(taskId, taskData);
            
            if (updatedTask) {
                this.renderAll();
                document.getElementById('edit-modal').close();
                this.announceStatus('Task updated successfully', 'success');
            }
        } catch (error) {
            this.announceStatus('Error updating task: ' + error.message, 'error');
        }
    },

    // Handle form validation in real-time
    handleFormValidation(event) {
        const form = event.target.form;
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title'),
            dueDate: formData.get('dueDate'),
            duration: formData.get('duration'),
            tag: formData.get('tag')
        };

        const field = event.target.name;
        const validation = validators.validateForm(taskData);

        // Update field-specific error
        if (validation.errors[field]) {
            this.showFieldError(form.id, field, validation.errors[field]);
        } else {
            this.clearFieldError(form.id, field);
        }
    },

    // Handle sort change
    handleSort(event) {
        state.sortTasks(event.target.value);
        this.renderTasks();
    },

    // Handle search update
    handleSearchUpdate() {
        this.renderTasks();
    },

    // Handle save daily cap
    handleSaveCap() {
        const capInput = document.getElementById('daily-cap');
        const newCap = parseInt(capInput.value);
        
        if (isNaN(newCap) || newCap < 0) {
            this.showSettingsMessage('Please enter a valid positive number', 'error');
            return;
        }

        state.updateSettings({ dailyCap: newCap });
        this.renderDashboard();
        this.showSettingsMessage(`Daily cap updated to ${newCap} minutes`, 'success');
    },

    // Handle export
    handleExport() {
        const exportData = state.exportData();
        if (!exportData) {
            this.showSettingsMessage('Error exporting data', 'error');
            return;
        }

        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campus-planner-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSettingsMessage('Data exported successfully', 'success');
    },

    // Handle import
    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                state.importData(e.target.result);
                this.renderAll();
                this.showSettingsMessage('Data imported successfully', 'success');
                this.announceStatus('All data has been imported successfully', 'success');
            } catch (error) {
                this.showSettingsMessage('Error importing data: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    },

    // Handle clear data
    handleClearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            state.clearData();
            this.renderAll();
            this.showSettingsMessage('All data cleared successfully', 'success');
            this.announceStatus('All data has been cleared', 'warning');
        }
    },

    // Handle units change
    handleUnitsChange(event) {
        state.updateSettings({ durationUnits: event.target.value });
        this.renderAll();
    },

    // Edit task
    editTask(taskId) {
        const task = state.getTask(taskId);
        if (!task) return;

        state.setCurrentEditId(taskId);
        
        // Populate edit form
        document.getElementById('edit-title').value = task.title;
        document.getElementById('edit-dueDate').value = task.dueDate;
        document.getElementById('edit-duration').value = task.duration;
        document.getElementById('edit-tag').value = task.tag;
        
        // Clear any previous errors
        this.clearFormErrors('edit-form');
        
        // Show modal
        document.getElementById('edit-modal').showModal();
    },

    // Delete task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            const success = state.deleteTask(taskId);
            if (success) {
                this.renderAll();
                this.announceStatus('Task deleted successfully', 'success');
            } else {
                this.announceStatus('Error deleting task', 'error');
            }
        }
    },

    // Render all components
    renderAll() {
        this.renderDashboard();
        this.renderTasks();
        this.renderSettings();
    },

    // Render dashboard
    renderDashboard() {
        const stats = state.getStats();
        const settings = state.getSettings();
        
        // Update stats cards
        const totalTasksEl = document.getElementById('total-tasks');
        const totalDurationEl = document.getElementById('total-duration');
        const topTagEl = document.getElementById('top-tag');
        const weekTasksEl = document.getElementById('week-tasks');
        
        if (totalTasksEl) totalTasksEl.textContent = stats.totalTasks;
        if (totalDurationEl) {
            const displayDuration = state.convertDuration(
                stats.totalDuration, 
                'minutes', 
                settings.durationUnits
            );
            totalDurationEl.textContent = `${displayDuration} ${settings.durationUnits}`;
        }
        if (topTagEl) topTagEl.textContent = stats.topTag;
        if (weekTasksEl) weekTasksEl.textContent = stats.weekTasks;
        
        // Update cap display
        const capProgress = document.getElementById('cap-progress');
        const capText = document.getElementById('cap-text');
        const capMessage = document.getElementById('cap-message');
        
        if (capProgress) {
            capProgress.style.width = `${stats.capPercentage}%`;
            capProgress.className = 'cap-progress ' + (
                stats.capPercentage < 80 ? '' : 
                stats.capPercentage < 100 ? 'warning' : 'danger'
            );
            capProgress.setAttribute('aria-valuenow', Math.round(stats.capPercentage));
        }
        
        if (capText) {
            const displayToday = state.convertDuration(
                stats.todayDuration, 
                'minutes', 
                settings.durationUnits
            );
            const displayCap = state.convertDuration(
                settings.dailyCap, 
                'minutes', 
                settings.durationUnits
            );
            capText.textContent = `${displayToday}/${displayCap} ${settings.durationUnits}`;
        }
        
        if (capMessage) {
            if (stats.isOverCap) {
                capMessage.textContent = `Warning: You've exceeded your daily cap by ${stats.todayDuration - settings.dailyCap} minutes!`;
                capMessage.className = 'cap-message error';
                capMessage.setAttribute('aria-live', 'assertive');
            } else if (stats.todayDuration > 0) {
                const remaining = settings.dailyCap - stats.todayDuration;
                capMessage.textContent = `You have ${remaining} minutes remaining today.`;
                capMessage.className = 'cap-message success';
                capMessage.setAttribute('aria-live', 'polite');
            } else {
                capMessage.textContent = 'No tasks scheduled for today.';
                capMessage.className = 'cap-message';
                capMessage.setAttribute('aria-live', 'off');
            }
        }
        
        // Render activity chart
        this.renderActivityChart(stats.dailyUsage);
    },

    // Render activity chart
    renderActivityChart(dailyUsage) {
        const chartEl = document.getElementById('activity-chart');
        if (!chartEl) return;
        
        const maxCount = Math.max(...Object.values(dailyUsage), 1);
        const today = new Date().toISOString().split('T')[0];
        
        chartEl.innerHTML = '';
        
        Object.entries(dailyUsage).forEach(([date, count]) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${(count / maxCount) * 100}%`;
            bar.setAttribute('data-count', count);
            bar.setAttribute('role', 'img');
            bar.setAttribute('aria-label', `${date}: ${count} tasks`);
            
            if (date === today) {
                bar.style.background = 'var(--primary-dark)';
            }
            
            chartEl.appendChild(bar);
        });
    },

    // Render tasks
    renderTasks() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        let tasks = state.getTasks();
        tasks = search.filterTasks(tasks);
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>${search.getSearchState().hasActiveSearch ? 
                        'Try adjusting your search criteria' : 
                        'Add your first task using the form above'
                    }</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        const settings = state.getSettings();
        
        tasks.forEach(task => {
            const taskEl = this.createTaskElement(task, settings);
            container.appendChild(taskEl);
            
            // Apply search highlighting
            search.applyHighlighting(taskEl, task);
        });
    },

    // Create task element
    createTaskElement(task, settings) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-card';
        taskEl.setAttribute('data-task-id', task.id);
        
        const displayDuration = state.convertDuration(
            task.duration, 
            'minutes', 
            settings.durationUnits
        );
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isOverdue = dueDate < today;
        const isToday = dueDate.getTime() === today.getTime();
        
        taskEl.innerHTML = `
            <div class="task-header">
                <div>
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <div class="task-meta">
                        <span class="task-date ${isOverdue ? 'overdue' : ''} ${isToday ? 'today' : ''}">
                            ${dueDate.toLocaleDateString()} ${isToday ? '(Today)' : ''} ${isOverdue ? '(Overdue)' : ''}
                        </span>
                        <span class="task-duration">${displayDuration} ${settings.durationUnits}</span>
                    </div>
                </div>
                <div class="task-tag">${this.escapeHtml(task.tag)}</div>
            </div>
            <div class="task-actions">
                <button class="btn btn-small btn-secondary" onclick="ui.editTask('${task.id}')" 
                        aria-label="Edit task: ${this.escapeHtml(task.title)}">
                    Edit
                </button>
                <button class="btn btn-small btn-danger" onclick="ui.deleteTask('${task.id}')" 
                        aria-label="Delete task: ${this.escapeHtml(task.title)}">
                    Delete
                </button>
            </div>
        `;
        
        return taskEl;
    },

    // Render settings
    renderSettings() {
        const settings = state.getSettings();
        
        const dailyCapEl = document.getElementById('daily-cap');
        const durationUnitsEl = document.getElementById('duration-units');
        
        if (dailyCapEl) dailyCapEl.value = settings.dailyCap;
        if (durationUnitsEl) durationUnitsEl.value = settings.durationUnits;
    },

    // Show form errors
    showFormErrors(formId, errors) {
        Object.entries(errors).forEach(([field, message]) => {
            this.showFieldError(formId, field, message);
        });
    },

    // Show field error
    showFieldError(formId, field, message) {
        const errorEl = document.querySelector(`#${formId} #${field}-error`);
        const inputEl = document.querySelector(`#${formId} #${field}`);
        
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.className = 'error-text';
        }
        if (inputEl) {
            inputEl.setAttribute('aria-invalid', 'true');
        }
    },

    // Clear form errors
    clearFormErrors(formId) {
        const errorEls = document.querySelectorAll(`#${formId} .error-text`);
        const inputEls = document.querySelectorAll(`#${formId} [aria-invalid="true"]`);
        
        errorEls.forEach(el => {
            el.textContent = '';
            el.className = 'error-text';
        });
        
        inputEls.forEach(el => {
            el.removeAttribute('aria-invalid');
        });
    },

    // Clear field error
    clearFieldError(formId, field) {
        const errorEl = document.querySelector(`#${formId} #${field}-error`);
        const inputEl = document.querySelector(`#${formId} #${field}`);
        
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.className = 'error-text';
        }
        if (inputEl) {
            inputEl.removeAttribute('aria-invalid');
        }
    },

    // Show settings message
    showSettingsMessage(message, type = 'info') {
        const messageEl = document.getElementById('settings-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `status-message ${type}`;
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    messageEl.textContent = '';
                    messageEl.className = 'status-message';
                }, 5000);
            }
        }
    },

    // Announce status to screen readers
    announceStatus(message, type = 'info') {
        const statusEl = document.createElement('div');
        statusEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        statusEl.setAttribute('aria-atomic', 'true');
        statusEl.className = 'sr-only';
        statusEl.textContent = message;
        
        document.body.appendChild(statusEl);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(statusEl);
        }, 1000);
    },

    // Utility: Escape HTML
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};