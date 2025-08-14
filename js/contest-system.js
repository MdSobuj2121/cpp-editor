class ContestSystem {
    constructor(apiService) {
        this.api = apiService;
        this.activeContests = [];
        this.virtualContests = [];
    }

    async initialize() {
        await this.loadContests();
        this.setupEventListeners();
        this.startContestUpdates();
    }

    async loadContests() {
        try {
            // Load contests from multiple platforms
            const [cfContests, atcoderContests] = await Promise.all([
                this.api.getCodeforcesContests(),
                this.api.getAtCoderContests()
            ]);

            // Process and combine contests
            this.activeContests = this.processContests([...cfContests, ...atcoderContests]);
            
            // Load virtual contests
            this.virtualContests = await this.loadVirtualContests();
            
            this.renderContests();
        } catch (error) {
            console.error('Error loading contests:', error);
            throw error;
        }
    }

    processContests(contests) {
        return contests.map(contest => ({
            id: contest.id,
            title: contest.name,
            platform: this.determinePlatform(contest),
            startTime: new Date(contest.startTimeSeconds * 1000),
            duration: contest.durationSeconds,
            registrationOpen: contest.phase === 'BEFORE',
            type: contest.type || 'REGULAR',
            url: this.getContestUrl(contest)
        }));
    }

    determinePlatform(contest) {
        if (contest.id.toString().startsWith('cf_')) return 'CodeForces';
        if (contest.id.toString().startsWith('ac_')) return 'AtCoder';
        return 'Unknown';
    }

    getContestUrl(contest) {
        switch (this.determinePlatform(contest)) {
            case 'CodeForces':
                return `https://codeforces.com/contest/${contest.id}`;
            case 'AtCoder':
                return `https://atcoder.jp/contests/${contest.id}`;
            default:
                return '#';
        }
    }

    async loadVirtualContests() {
        try {
            const virtualContests = await firebase.firestore()
                .collection('virtualContests')
                .where('endTime', '>', new Date())
                .get();

            return virtualContests.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading virtual contests:', error);
            return [];
        }
    }

    renderContests() {
        const container = document.getElementById('contestsSection');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Upcoming Contests</h3>
                            <div class="card-tools">
                                <button class="btn btn-primary btn-sm" id="createVirtualContest">
                                    <i class="fas fa-plus"></i> Create Virtual Contest
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <ul class="nav nav-tabs" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active" data-toggle="tab" href="#liveContests">
                                        Live Contests
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-toggle="tab" href="#virtualContests">
                                        Virtual Contests
                                    </a>
                                </li>
                            </ul>
                            <div class="tab-content mt-3">
                                <div class="tab-pane fade show active" id="liveContests">
                                    ${this.renderContestList(this.activeContests)}
                                </div>
                                <div class="tab-pane fade" id="virtualContests">
                                    ${this.renderVirtualContestList()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupContestEventListeners();
    }

    renderContestList(contests) {
        if (!contests.length) {
            return '<p class="text-center">No upcoming contests found.</p>';
        }

        return `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Contest</th>
                            <th>Platform</th>
                            <th>Starts In</th>
                            <th>Duration</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contests.map(contest => `
                            <tr>
                                <td>${contest.title}</td>
                                <td>
                                    <span class="badge badge-${this.getPlatformBadgeClass(contest.platform)}">
                                        ${contest.platform}
                                    </span>
                                </td>
                                <td>${this.formatTimeUntil(contest.startTime)}</td>
                                <td>${this.formatDuration(contest.duration)}</td>
                                <td>
                                    ${contest.registrationOpen ? `
                                        <button class="btn btn-sm btn-success register-btn" 
                                                data-contest-id="${contest.id}">
                                            Register
                                        </button>
                                    ` : `
                                        <a href="${contest.url}" target="_blank" 
                                           class="btn btn-sm btn-primary">
                                            View
                                        </a>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderVirtualContestList() {
        if (!this.virtualContests.length) {
            return '<p class="text-center">No virtual contests available.</p>';
        }

        return `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Contest</th>
                            <th>Created By</th>
                            <th>Starts In</th>
                            <th>Duration</th>
                            <th>Participants</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.virtualContests.map(contest => `
                            <tr>
                                <td>${contest.title}</td>
                                <td>${contest.createdBy.name}</td>
                                <td>${this.formatTimeUntil(contest.startTime)}</td>
                                <td>${this.formatDuration(contest.duration)}</td>
                                <td>${contest.participants.length}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary join-virtual-btn"
                                            data-contest-id="${contest.id}">
                                        Join
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getPlatformBadgeClass(platform) {
        switch (platform) {
            case 'CodeForces': return 'primary';
            case 'AtCoder': return 'warning';
            default: return 'secondary';
        }
    }

    formatTimeUntil(date) {
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) return 'Started';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    setupContestEventListeners() {
        // Register for contest
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', () => this.registerForContest(btn.dataset.contestId));
        });

        // Join virtual contest
        document.querySelectorAll('.join-virtual-btn').forEach(btn => {
            btn.addEventListener('click', () => this.joinVirtualContest(btn.dataset.contestId));
        });

        // Create virtual contest
        document.getElementById('createVirtualContest')?.addEventListener('click', () => {
            this.showCreateVirtualContestModal();
        });
    }

    async registerForContest(contestId) {
        try {
            if (!firebase.auth().currentUser) {
                await this.showLoginPrompt();
                return;
            }

            const contest = this.activeContests.find(c => c.id === contestId);
            if (!contest) return;

            // Register user for the contest
            await firebase.firestore().collection('contestRegistrations').add({
                userId: firebase.auth().currentUser.uid,
                contestId: contestId,
                platform: contest.platform,
                registeredAt: new Date()
            });

            Swal.fire({
                icon: 'success',
                title: 'Registered Successfully',
                text: `You have been registered for ${contest.title}`
            });
        } catch (error) {
            console.error('Error registering for contest:', error);
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: 'There was an error registering for the contest.'
            });
        }
    }

    async joinVirtualContest(contestId) {
        try {
            if (!firebase.auth().currentUser) {
                await this.showLoginPrompt();
                return;
            }

            const contest = this.virtualContests.find(c => c.id === contestId);
            if (!contest) return;

            // Join virtual contest
            await firebase.firestore().collection('virtualContests')
                .doc(contestId)
                .update({
                    participants: firebase.firestore.FieldValue.arrayUnion({
                        userId: firebase.auth().currentUser.uid,
                        joinedAt: new Date()
                    })
                });

            Swal.fire({
                icon: 'success',
                title: 'Joined Successfully',
                text: `You have joined the virtual contest: ${contest.title}`
            });
        } catch (error) {
            console.error('Error joining virtual contest:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Join',
                text: 'There was an error joining the virtual contest.'
            });
        }
    }

    showCreateVirtualContestModal() {
        Swal.fire({
            title: 'Create Virtual Contest',
            html: `
                <input id="contestTitle" class="swal2-input" placeholder="Contest Title">
                <input id="contestDuration" class="swal2-input" placeholder="Duration (minutes)">
                <input id="startTime" class="swal2-input" type="datetime-local">
                <select id="problemSource" class="swal2-input">
                    <option value="codeforces">CodeForces</option>
                    <option value="atcoder">AtCoder</option>
                    <option value="custom">Custom Problems</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Create',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const contestData = {
                        title: document.getElementById('contestTitle').value,
                        duration: parseInt(document.getElementById('contestDuration').value) * 60,
                        startTime: new Date(document.getElementById('startTime').value),
                        problemSource: document.getElementById('problemSource').value,
                        createdBy: {
                            uid: firebase.auth().currentUser.uid,
                            name: firebase.auth().currentUser.displayName
                        },
                        participants: [],
                        createdAt: new Date()
                    };

                    const docRef = await firebase.firestore()
                        .collection('virtualContests')
                        .add(contestData);

                    return { ...contestData, id: docRef.id };
                } catch (error) {
                    Swal.showValidationMessage(`Creation failed: ${error}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.virtualContests.push(result.value);
                this.renderContests();
                Swal.fire({
                    icon: 'success',
                    title: 'Contest Created',
                    text: 'Your virtual contest has been created successfully!'
                });
            }
        });
    }

    async showLoginPrompt() {
        const result = await Swal.fire({
            title: 'Login Required',
            text: 'You need to be logged in to perform this action.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Login',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            // Trigger login flow
            EventBus.emit('show-login');
        }
    }

    startContestUpdates() {
        // Update contest times every minute
        setInterval(() => {
            document.querySelectorAll('[data-starts-in]').forEach(el => {
                const startTime = new Date(el.dataset.startsIn);
                el.textContent = this.formatTimeUntil(startTime);
            });
        }, 60000);
    }
}
