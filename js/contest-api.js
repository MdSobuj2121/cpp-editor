class ContestAPI {
    constructor() {
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    async getCodeforcesContests() {
        try {
            const response = await fetch('https://codeforces.com/api/contest.list', {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.result
                .filter(contest => contest.phase === 'BEFORE')
                .map(contest => ({
                    ...contest,
                    id: `cf_${contest.id}`
                }));
        } catch (error) {
            console.error('Error fetching Codeforces contests:', error);
            return [];
        }
    }

    async getAtCoderContests() {
        try {
            const response = await fetch('https://kenkoooo.com/atcoder/resources/contests.json', {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contests = await response.json();
            const now = Date.now();
            
            return contests
                .filter(contest => new Date(contest.start_epoch_second * 1000) > now)
                .map(contest => ({
                    id: `ac_${contest.id}`,
                    name: contest.title,
                    startTimeSeconds: contest.start_epoch_second,
                    durationSeconds: contest.duration_second,
                    phase: 'BEFORE'
                }));
        } catch (error) {
            console.error('Error fetching AtCoder contests:', error);
            return [];
        }
    }

    async getContestProblems(contestId) {
        if (contestId.startsWith('cf_')) {
            return this.getCodeforcesProblems(contestId.slice(3));
        } else if (contestId.startsWith('ac_')) {
            return this.getAtCoderProblems(contestId.slice(3));
        }
        throw new Error('Unknown contest platform');
    }

    async getCodeforcesProblems(contestId) {
        try {
            const response = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.result.problems.map(problem => ({
                id: `cf_${contestId}_${problem.index}`,
                name: problem.name,
                index: problem.index,
                points: problem.points || null,
                type: problem.type,
                platform: 'CodeForces',
                url: `https://codeforces.com/contest/${contestId}/problem/${problem.index}`,
                tags: problem.tags
            }));
        } catch (error) {
            console.error('Error fetching Codeforces problems:', error);
            return [];
        }
    }

    async getAtCoderProblems(contestId) {
        try {
            const response = await fetch(`https://kenkoooo.com/atcoder/resources/problems.json`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const problems = await response.json();
            return problems
                .filter(p => p.contest_id === contestId)
                .map(problem => ({
                    id: `ac_${problem.id}`,
                    name: problem.title,
                    index: problem.problem_index,
                    points: null,
                    type: 'PROGRAMMING',
                    platform: 'AtCoder',
                    url: `https://atcoder.jp/contests/${contestId}/tasks/${problem.id}`,
                    tags: []
                }));
        } catch (error) {
            console.error('Error fetching AtCoder problems:', error);
            return [];
        }
    }

    async submitSolution(contestId, problemId, code, language) {
        if (!firebase.auth().currentUser) {
            throw new Error('User must be logged in to submit solutions');
        }

        // First, submit to Judge0 for evaluation
        const judgeResult = await this.submitToJudge0(code, language);

        // Store the submission in Firestore
        const submission = {
            userId: firebase.auth().currentUser.uid,
            contestId,
            problemId,
            code,
            language,
            judgeResult,
            submittedAt: new Date(),
            status: judgeResult.status.description
        };

        await firebase.firestore()
            .collection('submissions')
            .add(submission);

        return submission;
    }

    async submitToJudge0(code, language) {
        const judge0Token = await this.getJudge0Token();
        
        try {
            // Create submission
            const createResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    'X-RapidAPI-Key': judge0Token
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: this.getJudge0LanguageId(language),
                    stdin: ''
                })
            });

            if (!createResponse.ok) {
                throw new Error(`HTTP error! status: ${createResponse.status}`);
            }

            const { token } = await createResponse.json();

            // Poll for results
            const result = await this.pollJudge0Result(token, judge0Token);
            return result;
        } catch (error) {
            console.error('Error submitting to Judge0:', error);
            throw error;
        }
    }

    async pollJudge0Result(token, judge0Token, attempts = 10) {
        for (let i = 0; i < attempts; i++) {
            const response = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    'X-RapidAPI-Key': judge0Token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.status.id >= 3) { // Processing completed
                return result;
            }

            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before next poll
        }

        throw new Error('Submission processing timeout');
    }

    getJudge0LanguageId(language) {
        // Map our language names to Judge0 language IDs
        const languageMap = {
            'cpp': 54,    // C++ (GCC 9.2.0)
            'java': 62,   // Java (OpenJDK 13.0.1)
            'python': 71, // Python (3.8.1)
            'javascript': 63, // JavaScript (Node.js 12.14.0)
        };

        return languageMap[language.toLowerCase()] || 54; // Default to C++
    }

    async getJudge0Token() {
        // You can store this in your Firebase config or environment variables
        return localStorage.getItem('JUDGE0_API_KEY') || '';
    }
}
