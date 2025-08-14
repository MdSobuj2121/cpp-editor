class LearningSystem {
    constructor(apiService) {
        this.api = apiService;
        this.currentCourse = null;
        this.progress = {};
    }

    async initialize() {
        await this.loadCourses();
        await this.loadUserProgress();
        this.setupEventListeners();
    }

    async loadCourses() {
        this.courses = {
            'cpp-basics': {
                title: 'C++ Basics',
                modules: [
                    {
                        id: 'intro',
                        title: 'Introduction to C++',
                        lessons: [
                            {
                                id: 'first-program',
                                title: 'Your First C++ Program',
                                content: `
                                    <h3>Hello World in C++</h3>
                                    <pre><code class="cpp">
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
                                    </code></pre>
                                    <p>Let's break down this program:</p>
                                    <ul>
                                        <li><code>#include &lt;iostream&gt;</code> - Header for input/output</li>
                                        <li><code>using namespace std;</code> - Using standard namespace</li>
                                        <li><code>int main()</code> - Main function, program entry point</li>
                                        <li><code>cout</code> - Output stream object</li>
                                    </ul>
                                `,
                                practice: {
                                    problem: 'Write a program to print "Hello, CP Master!"',
                                    template: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
                                    solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CP Master!" << endl;
    return 0;
}`
                                }
                            }
                            // Add more lessons
                        ]
                    },
                    {
                        id: 'variables',
                        title: 'Variables and Data Types',
                        lessons: [
                            {
                                id: 'basic-types',
                                title: 'Basic Data Types',
                                content: `
                                    <h3>C++ Basic Data Types</h3>
                                    <table class="table">
                                        <tr><th>Type</th><th>Description</th><th>Size</th></tr>
                                        <tr><td>int</td><td>Integer</td><td>4 bytes</td></tr>
                                        <tr><td>double</td><td>Double precision float</td><td>8 bytes</td></tr>
                                        <tr><td>char</td><td>Character</td><td>1 byte</td></tr>
                                        <tr><td>bool</td><td>Boolean</td><td>1 byte</td></tr>
                                    </table>
                                    <pre><code class="cpp">
int number = 42;
double pi = 3.14159;
char letter = 'A';
bool isTrue = true;
                                    </code></pre>
                                `,
                                practice: {
                                    problem: 'Create variables of different types and print them',
                                    template: `#include <iostream>
using namespace std;

int main() {
    // Declare and initialize variables here
    return 0;
}`,
                                    solution: `#include <iostream>
using namespace std;

int main() {
    int age = 25;
    double height = 1.75;
    char grade = 'A';
    bool isStudent = true;
    
    cout << "Age: " << age << endl;
    cout << "Height: " << height << endl;
    cout << "Grade: " << grade << endl;
    cout << "Is Student: " << isStudent << endl;
    
    return 0;
}`
                                }
                            }
                        ]
                    }
                ]
            },
            'algorithms': {
                title: 'Algorithms',
                modules: [
                    {
                        id: 'sorting',
                        title: 'Sorting Algorithms',
                        lessons: [
                            {
                                id: 'bubble-sort',
                                title: 'Bubble Sort',
                                content: `
                                    <h3>Bubble Sort Algorithm</h3>
                                    <p>Time Complexity: O(n²)</p>
                                    <pre><code class="cpp">
void bubbleSort(int arr[], int n) {
    for(int i = 0; i < n-1; i++) {
        for(int j = 0; j < n-i-1; j++) {
            if(arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
            }
        }
    }
}
                                    </code></pre>
                                    <div class="visualization">
                                        <!-- Add visualization here -->
                                    </div>
                                `,
                                practice: {
                                    problem: 'Implement bubble sort and use it to sort an array',
                                    template: `#include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    // Your implementation here
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr)/sizeof(arr[0]);
    
    bubbleSort(arr, n);
    
    cout << "Sorted array: ";
    for(int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    return 0;
}`
                                }
                            }
                        ]
                    }
                ]
            }
            // Add more courses
        };
    }

    async loadUserProgress() {
        if (firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            const doc = await firebase.firestore().collection('progress').doc(userId).get();
            this.progress = doc.exists ? doc.data() : {};
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.course-item').forEach(item => {
            item.addEventListener('click', () => this.loadCourse(item.dataset.courseId));
        });

        document.querySelectorAll('.practice-btn').forEach(btn => {
            btn.addEventListener('click', () => this.startPractice(btn.dataset.lessonId));
        });
    }

    async loadCourse(courseId) {
        this.currentCourse = this.courses[courseId];
        this.renderCourse();
    }

    renderCourse() {
        const container = document.getElementById('courseContent');
        if (!this.currentCourse || !container) return;

        container.innerHTML = `
            <h2>${this.currentCourse.title}</h2>
            <div class="progress mb-3">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${this.calculateProgress()}%" 
                     aria-valuenow="${this.calculateProgress()}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                    ${this.calculateProgress()}%
                </div>
            </div>
            <div class="modules">
                ${this.currentCourse.modules.map(module => this.renderModule(module)).join('')}
            </div>
        `;
    }

    renderModule(module) {
        return `
            <div class="card mb-3">
                <div class="card-header">
                    <h3 class="card-title">${module.title}</h3>
                </div>
                <div class="card-body">
                    <div class="list-group">
                        ${module.lessons.map(lesson => this.renderLesson(lesson)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderLesson(lesson) {
        const completed = this.isLessonCompleted(lesson.id);
        return `
            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${lesson.title}</h5>
                    <small class="text-muted">Estimated time: 20 minutes</small>
                </div>
                <div>
                    ${completed ? 
                        '<span class="badge badge-success"><i class="fas fa-check"></i> Completed</span>' :
                        `<button class="btn btn-primary btn-sm start-lesson" data-lesson-id="${lesson.id}">
                            Start Lesson
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    async startPractice(lessonId) {
        const lesson = this.findLesson(lessonId);
        if (!lesson || !lesson.practice) return;

        const container = document.getElementById('practiceArea');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h4>Practice: ${lesson.title}</h4>
                </div>
                <div class="card-body">
                    <p>${lesson.practice.problem}</p>
                    <div id="editor" style="height: 400px;"></div>
                    <div class="mt-3">
                        <button class="btn btn-primary" id="runCode">
                            <i class="fas fa-play"></i> Run Code
                        </button>
                        <button class="btn btn-secondary" id="resetCode">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                    <div class="mt-3">
                        <pre id="output" class="bg-dark text-light p-3 rounded"></pre>
                    </div>
                </div>
            </div>
        `;

        // Initialize Monaco Editor
        require(['vs/editor/editor.main'], () => {
            window.editor = monaco.editor.create(document.getElementById('editor'), {
                value: lesson.practice.template,
                language: 'cpp',
                theme: 'vs-dark',
                minimap: { enabled: false }
            });
        });

        this.setupPracticeEventListeners(lesson);
    }

    setupPracticeEventListeners(lesson) {
        document.getElementById('runCode').addEventListener('click', async () => {
            const code = window.editor.getValue();
            try {
                const result = await this.api.executeCode(code, 54); // 54 is for C++
                document.getElementById('output').textContent = result.stdout || result.stderr;
                
                if (result.stdout && !result.stderr) {
                    this.markLessonComplete(lesson.id);
                }
            } catch (error) {
                document.getElementById('output').textContent = 'Error: ' + error.message;
            }
        });

        document.getElementById('resetCode').addEventListener('click', () => {
            window.editor.setValue(lesson.practice.template);
        });
    }

    findLesson(lessonId) {
        for (const module of this.currentCourse.modules) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) return lesson;
        }
        return null;
    }

    calculateProgress() {
        if (!this.currentCourse) return 0;
        const totalLessons = this.currentCourse.modules.reduce(
            (total, module) => total + module.lessons.length, 0
        );
        const completedLessons = Object.keys(this.progress).length;
        return Math.round((completedLessons / totalLessons) * 100);
    }

    isLessonCompleted(lessonId) {
        return this.progress[lessonId]?.completed || false;
    }

    async markLessonComplete(lessonId) {
        if (firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            this.progress[lessonId] = { completed: true, completedAt: new Date() };
            await firebase.firestore().collection('progress').doc(userId).set(this.progress);
        }
    }
}
