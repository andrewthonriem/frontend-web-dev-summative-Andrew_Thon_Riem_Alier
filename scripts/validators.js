// Regex validation patterns
export const validators = {
    // Title: no leading/trailing spaces, no double spaces
    title: {
        pattern: /^\S(?:.*\S)?$/,
        message: 'Title cannot have leading/trailing spaces or double spaces',
        test: function(value) {
            return this.pattern.test(value) && !/\s{2,}/.test(value);
        }
    },

    // Date: YYYY-MM-DD format
    date: {
        pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        message: 'Please enter a valid date in YYYY-MM-DD format',
        test: function(value) {
            if (!this.pattern.test(value)) return false;
            
            // Additional date validation
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return date instanceof Date && !isNaN(date) && date >= today;
        }
    },

    // Duration: positive integers only
    duration: {
        pattern: /^(0|[1-9]\d*)$/,
        message: 'Duration must be a positive whole number',
        test: function(value) {
            const num = parseInt(value);
            return this.pattern.test(value) && num > 0 && num <= 1440; // Max 24 hours in minutes
        }
    },

    // Tag: letters, spaces, and hyphens only
    tag: {
        pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        message: 'Tag can only contain letters, spaces, and hyphens',
        test: function(value) {
            return this.pattern.test(value) && value.length <= 50;
        }
    },

    // Advanced regex: Detect duplicate words in title
    duplicateWords: {
        pattern: /\b(\w+)\s+\1\b/i,
        message: 'Title contains duplicate words',
        test: function(value) {
            return !this.pattern.test(value);
        }
    },

    // Advanced regex: Time format detection (HH:MM)
    timeFormat: {
        pattern: /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/g,
        message: 'Time detected in title - consider using due date field',
        test: function(value) {
            // This is a warning, not an error
            const matches = value.match(this.pattern);
            return {
                isValid: true,
                warning: matches ? `Time formats detected: ${matches.join(', ')}` : null
            };
        }
    },

    // Advanced regex: Tag filter pattern (@tag:value)
    tagFilter: {
        pattern: /^@tag:(\w+)$/,
        message: 'Use @tag:tagname to filter by specific tag',
        extract: function(value) {
            const match = value.match(this.pattern);
            return match ? match[1] : null;
        }
    },

    // Form validation
    validateForm(formData) {
        const errors = {};
        const warnings = [];

        // Validate title
        if (!this.title.test(formData.title)) {
            errors.title = this.title.message;
        }

        // Check for duplicate words
        if (!this.duplicateWords.test(formData.title)) {
            errors.title = this.duplicateWords.message;
        }

        // Check for time formats (warning only)
        const timeCheck = this.timeFormat.test(formData.title);
        if (timeCheck.warning) {
            warnings.push(timeCheck.warning);
        }

        // Validate date
        if (!this.date.test(formData.dueDate)) {
            errors.dueDate = this.date.message;
        }

        // Validate duration
        if (!this.duration.test(formData.duration)) {
            errors.duration = this.duration.message;
        }

        // Validate tag
        if (!this.tag.test(formData.tag)) {
            errors.tag = this.tag.message;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            warnings
        };
    },

    // Validate imported data
    validateImportedTask(task) {
        const requiredFields = ['id', 'title', 'dueDate', 'duration', 'tag'];
        const missingFields = requiredFields.filter(field => !(field in task));
        
        if (missingFields.length > 0) {
            return {
                isValid: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        // Validate field formats
        const validation = this.validateForm({
            title: task.title,
            dueDate: task.dueDate,
            duration: task.duration.toString(),
            tag: task.tag
        });

        if (!validation.isValid) {
            return {
                isValid: false,
                error: `Invalid task data: ${Object.values(validation.errors).join(', ')}`
            };
        }

        return { isValid: true };
    }
};

// Safe regex compiler for search
export function compileRegex(input, flags = 'i') {
    if (!input || input.trim() === '') return null;
    
    try {
        // Sanitize input - escape if it doesn't look like a regex pattern
        let pattern = input;
        if (!input.startsWith('/') || !input.endsWith('/')) {
            // Simple escape for special characters if not using regex syntax
            pattern = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        } else {
            // Extract pattern from regex literal
            pattern = input.slice(1, -1);
        }
        
        return new RegExp(pattern, flags);
    } catch (error) {
        console.warn('Invalid regex pattern:', input, error);
        return null;
    }
}

// Highlight matches in text
export function highlightMatches(text, regex) {
    if (!regex || !text) return text;
    
    try {
        return text.replace(regex, match => `<mark>${match}</mark>`);
    } catch (error) {
        console.warn('Error highlighting matches:', error);
        return text;
    }
}