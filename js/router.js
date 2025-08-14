// Router for handling different sections and views
const Router = {
    currentSection: 'editor',
    routes: {
        editor: {
            path: '/editor',
            title: 'Code Editor',
            icon: 'fas fa-code',
            init: () => EditorService.initialize(),
            template: '#editorSection'
        },
        problems: {
            path: '/problems',
            title: 'Practice Problems',
            icon: 'fas fa-dumbbell',
            init: () => ProblemManager.initialize(),
            template: '#practiceSection'
        },
        contests: {
            path: '/contests',
            title: 'Contests',
            icon: 'fas fa-trophy',
            init: async () => {
                const contests = await ApiService.getCodeforcesContests();
                ContestManager.displayContests(contests);
            },
            template: '#contestsSection'
        },
        tutorials: {
            path: '/tutorials',
            title: 'Tutorials',
            icon: 'fas fa-graduation-cap',
            init: () => TutorialManager.initialize(),
            template: '#tutorialsSection'
        },
        solutions: {
            path: '/solutions',
            title: 'My Solutions',
            icon: 'fas fa-save',
            init: () => SolutionManager.loadSolutions(),
            template: '#solutionsSection'
        },
        profile: {
            path: '/profile',
            title: 'Profile',
            icon: 'fas fa-user',
            init: () => ProfileManager.initialize(),
            template: '#profileSection'
        },
        statistics: {
            path: '/statistics',
            title: 'Statistics',
            icon: 'fas fa-chart-line',
            init: () => StatisticsManager.initialize(),
            template: '#statisticsSection'
        }
    },

    initialize() {
        // Set up route handling
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.path) {
                this.navigateTo(e.state.path, false);
            }
        });

        // Set up navigation links
        document.querySelectorAll('[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = e.currentTarget.dataset.route;
                this.navigateTo(route);
            });
        });

        // Initialize with current path or default to editor
        const path = window.location.pathname.substring(1) || 'editor';
        this.navigateTo(path, false);
    },

    async navigateTo(routeName, addToHistory = true) {
        const route = this.routes[routeName];
        if (!route) {
            console.error('Route not found:', routeName);
            return;
        }

        // Update navigation state
        if (addToHistory) {
            window.history.pushState({ path: routeName }, '', route.path);
        }

        // Update active state in sidebar
        document.querySelectorAll('[data-route]').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.route === routeName) {
                link.classList.add('active');
            }
        });

        // Hide all sections
        document.querySelectorAll('section[id$="Section"]').forEach(section => {
            section.classList.add('d-none');
        });

        // Show target section
        const targetSection = document.querySelector(route.template);
        if (targetSection) {
            targetSection.classList.remove('d-none');
        }

        // Initialize route
        try {
            await route.init();
        } catch (error) {
            console.error(`Error initializing route ${routeName}:`, error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to load ${route.title}. Please try again.`
            });
        }

        this.currentSection = routeName;
    }
};
