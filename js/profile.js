const ProfileManager = {
    async initialize() {
        this.loadUserProfile();
        this.setupEventListeners();
    },

    loadUserProfile() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        this.updateProfileUI(profile);
    },

    updateProfileUI(profile) {
        const container = document.querySelector('#profileSection');
        if (!container) return;

        container.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card card-primary card-outline">
                        <div class="card-body box-profile">
                            <div class="text-center">
                                <img class="profile-user-img img-fluid img-circle"
                                     src="${profile.avatar || 'https://via.placeholder.com/128'}"
                                     alt="User profile picture">
                            </div>
                            <h3 class="profile-username text-center">${profile.username || 'Guest User'}</h3>
                            <p class="text-muted text-center">${profile.rating ? 'Rating: ' + profile.rating : 'Unrated'}</p>
                            <ul class="list-group list-group-unbordered mb-3">
                                <li class="list-group-item">
                                    <b>Problems Solved</b> <a class="float-right">${profile.problemsSolved || 0}</a>
                                </li>
                                <li class="list-group-item">
                                    <b>Contests</b> <a class="float-right">${profile.contestCount || 0}</a>
                                </li>
                                <li class="list-group-item">
                                    <b>Max Rating</b> <a class="float-right">${profile.maxRating || 'N/A'}</a>
                                </li>
                            </ul>
                            <button class="btn btn-primary btn-block" id="editProfileBtn">
                                <i class="fas fa-edit"></i> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Activity</h3>
                        </div>
                        <div class="card-body">
                            <div class="timeline">
                                ${this.renderTimeline(profile.recentActivity || [])}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderTimeline(activities) {
        if (!activities.length) {
            return '<div class="timeline-item"><p>No recent activity</p></div>';
        }

        return activities.map(activity => `
            <div class="timeline-item">
                <i class="fas fa-${activity.icon} bg-${activity.type}"></i>
                <div class="timeline-item">
                    <span class="time"><i class="fas fa-clock"></i> ${activity.time}</span>
                    <h3 class="timeline-header">${activity.title}</h3>
                    <div class="timeline-body">
                        ${activity.description}
                    </div>
                </div>
            </div>
        `).join('');
    },

    setupEventListeners() {
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.showEditProfileModal();
        });
    },

    showEditProfileModal() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        Swal.fire({
            title: 'Edit Profile',
            html: `
                <input id="username" class="swal2-input" placeholder="Username" value="${profile.username || ''}">
                <input id="codeforcesHandle" class="swal2-input" placeholder="CodeForces Handle" value="${profile.codeforcesHandle || ''}">
                <input id="atcoderHandle" class="swal2-input" placeholder="AtCoder Handle" value="${profile.atcoderHandle || ''}">
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const newProfile = {
                    ...profile,
                    username: document.getElementById('username').value,
                    codeforcesHandle: document.getElementById('codeforcesHandle').value,
                    atcoderHandle: document.getElementById('atcoderHandle').value,
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem('userProfile', JSON.stringify(newProfile));
                return newProfile;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.updateProfileUI(result.value);
                Swal.fire('Saved!', 'Your profile has been updated.', 'success');
            }
        });
    }
};
