const StatisticsManager = {
    async initialize() {
        await this.loadStatistics();
        this.setupEventListeners();
        this.initializeCharts();
    },

    async loadStatistics() {
        const stats = {
            problemsSolved: JSON.parse(localStorage.getItem('solutions') || '[]').length,
            contestsParticipated: 0,
            averageSolveTime: '00:00',
            ...JSON.parse(localStorage.getItem('statistics') || '{}')
        };

        // Update stats with platform data if available
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (profile.codeforcesHandle) {
            try {
                const cfStats = await ApiService.getCodeforcesUserInfo(profile.codeforcesHandle);
                stats.rating = cfStats.rating;
                stats.maxRating = cfStats.maxRating;
                stats.rank = cfStats.rank;
            } catch (error) {
                console.error('Error loading CodeForces stats:', error);
            }
        }

        this.updateStatisticsUI(stats);
    },

    updateStatisticsUI(stats) {
        const container = document.querySelector('#statisticsSection');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-info">
                        <div class="inner">
                            <h3>${stats.problemsSolved}</h3>
                            <p>Problems Solved</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-code"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-success">
                        <div class="inner">
                            <h3>${stats.rating || 'Unrated'}</h3>
                            <p>Current Rating</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-warning">
                        <div class="inner">
                            <h3>${stats.contestsParticipated}</h3>
                            <p>Contests Participated</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-trophy"></i>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-danger">
                        <div class="inner">
                            <h3>${stats.averageSolveTime}</h3>
                            <p>Avg. Solve Time</p>
                        </div>
                        <div class="icon">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Problem Solving Progress</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="progressChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Problem Categories</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="categoriesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    initializeCharts() {
        this.initializeProgressChart();
        this.initializeCategoriesChart();
    },

    initializeProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const solutions = JSON.parse(localStorage.getItem('solutions') || '[]');
        const dates = {};
        
        solutions.forEach(solution => {
            const date = new Date(solution.date).toLocaleDateString();
            dates[date] = (dates[date] || 0) + 1;
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(dates),
                datasets: [{
                    label: 'Problems Solved',
                    data: Object.values(dates),
                    borderColor: '#3498db',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    initializeCategoriesChart() {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;

        const solutions = JSON.parse(localStorage.getItem('solutions') || '[]');
        const categories = {};
        
        solutions.forEach(solution => {
            if (solution.tags) {
                solution.tags.forEach(tag => {
                    categories[tag] = (categories[tag] || 0) + 1;
                });
            }
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#e74c3c',
                        '#f1c40f',
                        '#9b59b6',
                        '#e67e22'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    setupEventListeners() {
        // Add any statistics-specific event listeners here
    }
};
