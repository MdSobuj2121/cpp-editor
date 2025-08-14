// Simple Event Bus for communication between components
const EventBus = {
    listeners: {},

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
};

// Problem Management System
const ProblemManager = {
    async initialize() {
        this.problems = new Map();
        this.userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
        await this.loadProblems();
        this.setupEventListeners();
    },

    async loadProblems() {
        try {
            // Load problems from multiple sources
            const [cfProblems, atcoderProblems] = await Promise.all([
                ApiService.getCodeforcesProblems(),
                ApiService.getAtCoderProblems()
            ]);

            // Process and store problems
            cfProblems.forEach(p => {
                this.problems.set(`cf_${p.contestId}_${p.index}`, {
                    id: `cf_${p.contestId}_${p.index}`,
                    title: p.name,
                    platform: 'CodeForces',
                    difficulty: p.rating,
                    tags: p.tags,
                    url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
                });
            });

            this.updateProblemList();
        } catch (error) {
            console.error('Error loading problems:', error);
        }
    },

    setupEventListeners() {
        // Filter problems
        document.querySelectorAll('[data-difficulty]').forEach(btn => {
            btn.addEventListener('click', () => this.filterProblems(btn.dataset.difficulty));
        });

        // Search problems
        document.getElementById('problemSearch')?.addEventListener('input', (e) => {
            this.searchProblems(e.target.value);
        });
    },

    filterProblems(difficulty) {
        const filtered = Array.from(this.problems.values()).filter(p => {
            if (!difficulty) return true;
            if (difficulty === 'easy') return p.difficulty <= 1400;
            if (difficulty === 'medium') return p.difficulty > 1400 && p.difficulty <= 2000;
            if (difficulty === 'hard') return p.difficulty > 2000;
            return true;
        });
        this.updateProblemList(filtered);
    },

    searchProblems(query) {
        if (!query) {
            this.updateProblemList();
            return;
        }

        const filtered = Array.from(this.problems.values()).filter(p => 
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        this.updateProblemList(filtered);
    },

    updateProblemList(problems = Array.from(this.problems.values())) {
        const tbody = document.querySelector('#practiceTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        problems.forEach(problem => {
            const solved = this.userStats[problem.id]?.solved;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <a href="${problem.url}" target="_blank" class="text-primary">
                        ${problem.title}
                    </a>
                </td>
                <td>${problem.difficulty || 'N/A'}</td>
                <td>${problem.tags.map(tag => `<span class="badge badge-info mr-1">${tag}</span>`).join('')}</td>
                <td>
                    <span class="badge badge-${solved ? 'success' : 'secondary'}">
                        ${solved ? 'Solved' : 'Not Attempted'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary solve-btn" data-problem-id="${problem.id}">
                        <i class="fas fa-code"></i> Solve
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to solve buttons
        document.querySelectorAll('.solve-btn').forEach(btn => {
            btn.addEventListener('click', () => this.loadProblem(btn.dataset.problemId));
        });
    },

    async loadProblem(problemId) {
        const problem = this.problems.get(problemId);
        if (!problem) return;

        document.getElementById('problem').value = `Problem: ${problem.title}
Platform: ${problem.platform}
Difficulty: ${problem.difficulty}
Tags: ${problem.tags.join(', ')}
URL: ${problem.url}

Please open the URL in your browser to view the complete problem statement.`;

        EditorService.setValue(LANGUAGE_CONFIG.cpp.template);
        document.querySelector('.nav-link[data-section="editor"]').click();
    }
};
