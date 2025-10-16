import { compileRegex, highlightMatches } from './validators.js';

let currentRegex = null;
let caseSensitive = false;

export const search = {
    // Initialize search functionality
    init() {
        const searchInput = document.getElementById('search-input');
        const caseToggle = document.getElementById('case-toggle');

        if (searchInput && caseToggle) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
            caseToggle.addEventListener('click', this.toggleCaseSensitive.bind(this));
        }
    },

    // Handle search input
    handleSearch(event) {
        const searchTerm = event.target.value.trim();
        const helpElement = document.getElementById('search-help');
        
        if (searchTerm === '') {
            currentRegex = null;
            if (helpElement) {
                helpElement.textContent = 'Type a regex pattern to search. Invalid patterns will be ignored.';
                helpElement.className = 'help-text';
            }
            this.dispatchSearchUpdate();
            return;
        }

        // Check for special patterns
        const tagFilter = this.extractTagFilter(searchTerm);
        if (tagFilter) {
            currentRegex = new RegExp(`^${tagFilter}$`, 'i');
            if (helpElement) {
                helpElement.textContent = `Filtering by tag: ${tagFilter}`;
                helpElement.className = 'help-text success';
            }
        } else {
            // Compile regex pattern
            const flags = caseSensitive ? '' : 'i';
            currentRegex = compileRegex(searchTerm, flags);
            
            if (helpElement) {
                if (currentRegex) {
                    helpElement.textContent = `Searching with pattern: /${searchTerm}/${flags || ''}`;
                    helpElement.className = 'help-text success';
                } else {
                    helpElement.textContent = 'Invalid regex pattern. Using plain text search.';
                    helpElement.className = 'help-text error';
                    // Fallback to simple text search
                    currentRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
                }
            }
        }

        this.dispatchSearchUpdate();
    },

    // Toggle case sensitivity
    toggleCaseSensitive(event) {
        caseSensitive = !caseSensitive;
        const button = event.target;
        button.setAttribute('aria-pressed', caseSensitive.toString());
        button.textContent = caseSensitive ? 'Case Sensitive' : 'Case Insensitive';
        
        // Re-run current search with new case sensitivity
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
            this.handleSearch({ target: searchInput });
        }
    },

    // Extract tag filter pattern (@tag:value)
    extractTagFilter(searchTerm) {
        const tagPattern = /^@tag:(\w+)$/i;
        const match = searchTerm.match(tagPattern);
        return match ? match[1] : null;
    },

    // Filter tasks based on current search
    filterTasks(tasks) {
        if (!currentRegex) return tasks;

        return tasks.filter(task => {
            // Search in multiple fields
            const searchableText = [
                task.title,
                task.tag,
                task.dueDate,
                task.duration.toString()
            ].join(' ');

            return currentRegex.test(searchableText);
        });
    },

    // Apply highlighting to task elements
    applyHighlighting(element, task) {
        if (!currentRegex) return;

        const fields = {
            title: element.querySelector('.task-title'),
            tag: element.querySelector('.task-tag'),
            meta: element.querySelector('.task-meta')
        };

        Object.entries(fields).forEach(([field, element]) => {
            if (element && task[field]) {
                const originalText = task[field];
                const highlighted = highlightMatches(originalText, currentRegex);
                if (field === 'tag') {
                    element.innerHTML = highlighted;
                } else if (field === 'title') {
                    element.innerHTML = highlighted;
                } else if (field === 'meta') {
                    // For meta, we need to be more careful
                    const durationElement = element.querySelector('.task-duration');
                    const dateElement = element.querySelector('.task-date');
                    
                    if (durationElement) {
                        durationElement.innerHTML = highlightMatches(
                            durationElement.textContent, 
                            currentRegex
                        );
                    }
                    if (dateElement) {
                        dateElement.innerHTML = highlightMatches(
                            dateElement.textContent, 
                            currentRegex
                        );
                    }
                }
            }
        });
    },

    // Remove highlighting from task elements
    removeHighlighting(element) {
        const markedElements = element.querySelectorAll('mark');
        markedElements.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    },

    // Dispatch search update event
    dispatchSearchUpdate() {
        window.dispatchEvent(new CustomEvent('searchUpdated', {
            detail: { regex: currentRegex, caseSensitive }
        }));
    },

    // Get current search state
    getSearchState() {
        return {
            regex: currentRegex,
            caseSensitive,
            hasActiveSearch: currentRegex !== null
        };
    }
};