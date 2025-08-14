// API Configuration
const CONFIG = {
    // Judge0 API for code execution
    JUDGE0_API: {
        URL: 'https://judge0-ce.p.rapidapi.com',
        HEADERS: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': 'f5deb01607msh6c40db8f424e01dp14bc48jsnb21a6af4366c'
        }
    },
    // CodeForces API
    CODEFORCES_API: {
        URL: 'https://codeforces.com/api'
    },
    // SPOJ API
    SPOJ_API: {
        URL: 'https://spoj.com/problems'
    },
    // AtCoder API
    ATCODER_API: {
        URL: 'https://kenkoooo.com/atcoder/atcoder-api'
    }
};

// Language configurations
const LANGUAGE_CONFIG = {
    cpp: {
        id: 54, // Judge0 language ID for C++
        name: 'C++ (GCC 9.2.0)',
        mode: 'cpp',
        template: `#include <bits/stdc++.h>
using namespace std;

void solve() {
    // Your solution here
}

int main() {
    ios::sync_with_stdio(0);
    cin.tie(0);
    
    int t = 1;
    cin >> t;
    while(t--) solve();
    
    return 0;
}`
    }
    // Add more languages as needed
};
