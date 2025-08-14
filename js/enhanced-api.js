// Enhanced API Integration Service
const API_CONFIG = {
    JUDGE0: {
        URL: 'https://judge0-ce.p.rapidapi.com',
        HEADERS: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY'
        }
    },
    LEETCODE: {
        URL: 'https://leetcode-api.p.rapidapi.com',
        HEADERS: {
            'X-RapidAPI-Host': 'leetcode-api.p.rapidapi.com',
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY'
        }
    },
    HACKERRANK: {
        URL: 'https://hackerrank-api.p.rapidapi.com',
        HEADERS: {
            'X-RapidAPI-Host': 'hackerrank-api.p.rapidapi.com',
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY'
        }
    },
    CODEFORCES: {
        URL: 'https://codeforces.com/api'
    },
    ATCODER: {
        URL: 'https://kenkoooo.com/atcoder/atcoder-api'
    },
    GITHUB: {
        URL: 'https://api.github.com',
        TOKEN: 'YOUR_GITHUB_TOKEN' // For code snippet storage
    },
    FIREBASE_CONFIG: {
        // Add your Firebase config here for user management and data persistence
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "your-app.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-app.appspot.com",
        messagingSenderId: "your-messaging-sender-id",
        appId: "your-app-id"
    }
};

class EnhancedAPIService {
    constructor() {
        // Initialize Firebase
        firebase.initializeApp(API_CONFIG.FIREBASE_CONFIG);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    }

    // Code Execution Service
    async executeCode(sourceCode, language_id, input) {
        try {
            const response = await fetch(`${API_CONFIG.JUDGE0.URL}/submissions?base64_encoded=false&wait=true`, {
                method: 'POST',
                headers: API_CONFIG.JUDGE0.HEADERS,
                body: JSON.stringify({ source_code: sourceCode, language_id, stdin: input })
            });
            return await response.json();
        } catch (error) {
            console.error('Code execution error:', error);
            throw error;
        }
    }

    // LeetCode Integration
    async getLeetCodeProblems() {
        try {
            const response = await fetch(`${API_CONFIG.LEETCODE.URL}/problems`, {
                headers: API_CONFIG.LEETCODE.HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('LeetCode API error:', error);
            throw error;
        }
    }

    async getLeetCodeProblemDetails(titleSlug) {
        try {
            const response = await fetch(`${API_CONFIG.LEETCODE.URL}/problems/${titleSlug}`, {
                headers: API_CONFIG.LEETCODE.HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('LeetCode API error:', error);
            throw error;
        }
    }

    // HackerRank Integration
    async getHackerRankChallenges() {
        try {
            const response = await fetch(`${API_CONFIG.HACKERRANK.URL}/challenges`, {
                headers: API_CONFIG.HACKERRANK.HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('HackerRank API error:', error);
            throw error;
        }
    }

    // CodeForces Enhanced Integration
    async getCodeforcesUserInfo(handle) {
        try {
            const response = await fetch(`${API_CONFIG.CODEFORCES.URL}/user.info?handles=${handle}`);
            return (await response.json()).result[0];
        } catch (error) {
            console.error('CodeForces API error:', error);
            throw error;
        }
    }

    async getCodeforcesContests() {
        try {
            const response = await fetch(`${API_CONFIG.CODEFORCES.URL}/contest.list`);
            return (await response.json()).result;
        } catch (error) {
            console.error('CodeForces API error:', error);
            throw error;
        }
    }

    // AtCoder Integration
    async getAtCoderProblems() {
        try {
            const response = await fetch(`${API_CONFIG.ATCODER.URL}/v3/problems`);
            return await response.json();
        } catch (error) {
            console.error('AtCoder API error:', error);
            throw error;
        }
    }

    // GitHub Integration for Code Storage
    async saveCodeToGist(filename, content, description) {
        try {
            const response = await fetch(`${API_CONFIG.GITHUB.URL}/gists`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${API_CONFIG.GITHUB.TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description,
                    public: false,
                    files: {
                        [filename]: {
                            content: content
                        }
                    }
                })
            });
            return await response.json();
        } catch (error) {
            console.error('GitHub API error:', error);
            throw error;
        }
    }

    // Firebase User Management
    async signUp(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Firebase Auth error:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Firebase Auth error:', error);
            throw error;
        }
    }

    async saveUserProgress(userId, data) {
        try {
            await this.db.collection('userProgress').doc(userId).set(data, { merge: true });
        } catch (error) {
            console.error('Firebase Firestore error:', error);
            throw error;
        }
    }

    // Problem Recommendation System
    async getRecommendedProblems(userRating, preferredTags, difficulty) {
        try {
            // Fetch problems from multiple sources
            const [cfProblems, leetcodeProblems, hackerrankProblems] = await Promise.all([
                this.getCodeforcesProblems(),
                this.getLeetCodeProblems(),
                this.getHackerRankChallenges()
            ]);

            // Combine and filter problems based on user preferences
            let allProblems = [
                ...cfProblems.map(p => ({ ...p, source: 'CodeForces' })),
                ...leetcodeProblems.map(p => ({ ...p, source: 'LeetCode' })),
                ...hackerrankProblems.map(p => ({ ...p, source: 'HackerRank' }))
            ];

            // Filter based on criteria
            return allProblems.filter(problem => {
                const matchesRating = !userRating || (problem.rating && problem.rating <= userRating + 300);
                const matchesTags = !preferredTags.length || problem.tags.some(tag => preferredTags.includes(tag));
                const matchesDifficulty = !difficulty || problem.difficulty === difficulty;
                return matchesRating && matchesTags && matchesDifficulty;
            });
        } catch (error) {
            console.error('Problem recommendation error:', error);
            throw error;
        }
    }

    // Learning Resources Integration
    async getLearningResources(topic) {
        try {
            // You can integrate with various learning platforms' APIs here
            const resources = {
                'algorithms': [
                    { title: 'Introduction to Algorithms', source: 'MIT OpenCourseWare', url: '...' },
                    { title: 'Algorithm Specialization', source: 'Coursera', url: '...' }
                ],
                'data-structures': [
                    { title: 'Data Structures Fundamentals', source: 'edX', url: '...' },
                    { title: 'Advanced Data Structures', source: 'Stanford Online', url: '...' }
                ]
                // Add more topics and resources
            };
            return resources[topic] || [];
        } catch (error) {
            console.error('Learning resources error:', error);
            throw error;
        }
    }

    // Contest Calendar Integration
    async getContestCalendar() {
        try {
            const [cfContests, atcoderContests] = await Promise.all([
                this.getCodeforcesContests(),
                this.getAtCoderContests()
            ]);

            return {
                upcoming: [...cfContests, ...atcoderContests].filter(contest => 
                    new Date(contest.startTimeSeconds * 1000) > new Date()
                ),
                ongoing: [...cfContests, ...atcoderContests].filter(contest => {
                    const now = new Date().getTime() / 1000;
                    return contest.startTimeSeconds <= now && 
                           contest.startTimeSeconds + contest.durationSeconds > now;
                })
            };
        } catch (error) {
            console.error('Contest calendar error:', error);
            throw error;
        }
    }
}
