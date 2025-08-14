// API Integration Service
const ApiService = {
    // Judge0 API for code execution
    async executeCode(sourceCode, language_id, input) {
        try {
            const response = await fetch(`${CONFIG.JUDGE0_API.URL}/submissions?base64_encoded=false&wait=true`, {
                method: 'POST',
                headers: CONFIG.JUDGE0_API.HEADERS,
                body: JSON.stringify({ source_code: sourceCode, language_id, stdin: input })
            });
            return await response.json();
        } catch (error) {
            console.error('Code execution error:', error);
            throw error;
        }
    },

    // CodeForces API Integration
    async getCodeforcesProblems() {
        try {
            const response = await fetch(`${CONFIG.CODEFORCES_API.URL}/problemset.problems`);
            const data = await response.json();
            return data.result.problems;
        } catch (error) {
            console.error('CodeForces API error:', error);
            throw error;
        }
    },

    async getCodeforcesContests() {
        try {
            const response = await fetch(`${CONFIG.CODEFORCES_API.URL}/contest.list`);
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('CodeForces API error:', error);
            throw error;
        }
    },

    // AtCoder API Integration
    async getAtCoderProblems() {
        try {
            const response = await fetch(`${CONFIG.ATCODER_API.URL}/v3/problems`);
            return await response.json();
        } catch (error) {
            console.error('AtCoder API error:', error);
            throw error;
        }
    },

    // Problem Recommendation System
    async getRecommendedProblems(userRating, tags) {
        try {
            const problems = await this.getCodeforcesProblems();
            return problems.filter(problem => {
                const matchesRating = !userRating || (problem.rating && problem.rating <= userRating + 300 && problem.rating >= userRating - 100);
                const matchesTags = !tags || !tags.length || (problem.tags && problem.tags.some(tag => tags.includes(tag)));
                return matchesRating && matchesTags;
            });
        } catch (error) {
            console.error('Problem recommendation error:', error);
            throw error;
        }
    },

    // Competitive Programming News and Updates
    async getCPNews() {
        try {
            // You can integrate with a news API or RSS feed here
            const response = await fetch('https://codeforces.com/api/recentActions?maxCount=10');
            return await response.json();
        } catch (error) {
            console.error('CP News error:', error);
            throw error;
        }
    }
};
