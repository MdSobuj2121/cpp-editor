const ContestManager = {
    async initialize() {
        await this.loadContests();
        this.setupEventListeners();
    },

    async loadContests() {
        try {
            const contests = await ApiService.getCodeforcesContests();
            this.displayContests(contests);
        } catch (error) {
            console.error('Error loading contests:', error);
            throw error;
        }
    },

    displayContests(contests) {
        const container = document.querySelector('#contestsSection .contest-list');
        if (!container) return;

        const upcoming = contests.filter(c => c.phase === 'BEFORE');
        const ongoing = contests.filter(c => c.phase === 'CODING');

        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Ongoing Contests</h3>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Contest</th>
                                            <th>Time Left</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.renderContestList(ongoing)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Upcoming Contests</h3>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Contest</th>
                                            <th>Starts In</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.renderContestList(upcoming)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderContestList(contests) {
        return contests.map(contest => `
            <tr>
                <td>${contest.name}</td>
                <td>${this.formatDuration(contest.durationSeconds)}</td>
                <td>
                    <a href="https://codeforces.com/contest/${contest.id}" 
                       target="_blank" 
                       class="btn btn-sm btn-primary">
                        Join
                    </a>
                </td>
            </tr>
        `).join('');
    },

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    },

    setupEventListeners() {
        // Add contest-specific event listeners here
    }
};
