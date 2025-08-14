# Debugging Guide for CP Master

## Common Issues and Solutions

### 1. Editor Issues

#### Monaco Editor Not Loading
```
Symptoms:
- Blank editor area
- Console error about 'monaco' undefined
```

Solutions:
1. Check script loading:
   ```html
   <!-- These must be in order -->
   <script src="monaco-editor/min/vs/loader.js"></script>
   <script src="js/editor.js"></script>
   ```

2. Clear browser cache:
   - Chrome: Ctrl+F5
   - Firefox: Ctrl+Shift+R
   - Edge: Ctrl+F5

3. Check Network tab in DevTools:
   - Look for failed Monaco Editor script loads
   - Verify all required files are loading

#### Editor Performance Issues
```
Symptoms:
- Slow typing response
- High CPU usage
```

Solutions:
1. Adjust editor settings in `js/editor.js`:
   ```javascript
   window.editor = monaco.editor.create(document.getElementById('editor'), {
       // Reduce features for better performance
       minimap: { enabled: false },
       lineNumbers: 'on',
       folding: false,
       // Increase performance
       renderWhitespace: 'none',
       wordWrap: 'on'
   });
   ```

2. Limit file size:
   - Keep code files under 100KB
   - Split large files into modules

### 2. API Integration Issues

#### Judge0 API Problems
```
Symptoms:
- Code doesn't execute
- "API Key Invalid" errors
```

Solutions:
1. Verify API key in `js/config.js`:
   ```javascript
   JUDGE0_API: {
       URL: 'https://judge0-ce.p.rapidapi.com',
       HEADERS: {
           'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
           'X-RapidAPI-Key': 'YOUR_KEY_HERE'
       }
   }
   ```

2. Check API limits:
   ```javascript
   // Add this to api.js
   async function checkApiLimits() {
       try {
           const response = await fetch('https://judge0-ce.p.rapidapi.com/about', {
               headers: CONFIG.JUDGE0_API.HEADERS
           });
           return response.ok;
       } catch (error) {
           console.error('API Limit Check Failed:', error);
           return false;
       }
   }
   ```

#### CodeForces API Issues
```
Symptoms:
- Problems not loading
- Contest information missing
```

Solutions:
1. Check CORS issues:
   ```javascript
   // Add to api.js
   async function handleCodeforcesRequest(url) {
       try {
           const response = await fetch(url);
           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }
           return await response.json();
       } catch (error) {
           console.error('CodeForces API Error:', error);
           // Use cached data if available
           return JSON.parse(localStorage.getItem('cf_cache') || '{}');
       }
   }
   ```

2. Implement caching:
   ```javascript
   // Add to problems.js
   function cacheProblems(problems) {
       localStorage.setItem('problems_cache', JSON.stringify({
           timestamp: Date.now(),
           data: problems
       }));
   }
   ```

### 3. Local Storage Issues

#### Data Not Persisting
```
Symptoms:
- Settings not saving
- Solutions disappearing
```

Solutions:
1. Check storage quota:
   ```javascript
   async function checkStorageQuota() {
       if ('storage' in navigator && 'estimate' in navigator.storage) {
           const {usage, quota} = await navigator.storage.estimate();
           if (usage > quota * 0.9) {
               alert('Storage nearly full! Please clear some data.');
           }
       }
   }
   ```

2. Implement backup system:
   ```javascript
   // Add to profile.js
   const BackupManager = {
       createBackup() {
           const data = {
               solutions: localStorage.getItem('solutions'),
               profile: localStorage.getItem('userProfile'),
               settings: localStorage.getItem('settings')
           };
           const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
           saveAs(blob, `cp_master_backup_${new Date().toISOString()}.json`);
       },
       
       async restoreBackup(file) {
           const text = await file.text();
           const data = JSON.parse(text);
           Object.entries(data).forEach(([key, value]) => {
               localStorage.setItem(key, value);
           });
       }
   };
   ```

### 4. Performance Optimization

#### Slow Problem Loading
```
Symptoms:
- Long loading times
- High memory usage
```

Solutions:
1. Implement virtual scrolling:
   ```javascript
   // Add to problems.js
   class VirtualScroller {
       constructor(container, items, rowHeight) {
           this.container = container;
           this.items = items;
           this.rowHeight = rowHeight;
           this.visibleItems = Math.ceil(container.clientHeight / rowHeight);
           this.setupScroller();
       }

       setupScroller() {
           this.container.style.overflow = 'auto';
           this.content = document.createElement('div');
           this.container.appendChild(this.content);
           this.container.addEventListener('scroll', () => this.onScroll());
           this.render();
       }

       onScroll() {
           const scrollTop = this.container.scrollTop;
           const startIndex = Math.floor(scrollTop / this.rowHeight);
           this.render(startIndex);
       }

       render(startIndex = 0) {
           const visibleItems = this.items
               .slice(startIndex, startIndex + this.visibleItems)
               .map(item => this.renderItem(item))
               .join('');
           this.content.innerHTML = visibleItems;
       }

       renderItem(item) {
           return `<div class="problem-item" style="height: ${this.rowHeight}px">
               ${item.title}
           </div>`;
       }
   }
   ```

2. Implement lazy loading:
   ```javascript
   // Add to router.js
   async function lazyLoadSection(sectionName) {
       if (!this.loadedSections.includes(sectionName)) {
           await import(`./js/${sectionName}.js`);
           this.loadedSections.push(sectionName);
       }
   }
   ```

### 5. Browser Compatibility

#### Cross-Browser Issues
```
Symptoms:
- Features not working in specific browsers
- Layout problems
```

Solutions:
1. Add browser checks:
   ```javascript
   // Add to config.js
   const BrowserCheck = {
       checkCompatibility() {
           const issues = [];
           
           // Check LocalStorage
           if (!window.localStorage) {
               issues.push('LocalStorage not supported');
           }
           
           // Check modern JS features
           try {
               eval('async () => {}');
           } catch {
               issues.push('Modern JavaScript not supported');
           }
           
           // Check IndexedDB
           if (!window.indexedDB) {
               issues.push('IndexedDB not supported');
           }
           
           return issues;
       }
   };
   ```

2. Add polyfills:
   ```javascript
   // Add to index.html before other scripts
   <script src="https://polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017"></script>
   ```

### Development Tools

#### VS Code Extensions for Development
1. Install recommended extensions:
   ```json
   // .vscode/extensions.json
   {
       "recommendations": [
           "ritwickdey.liveserver",
           "esbenp.prettier-vscode",
           "dbaeumer.vscode-eslint",
           "ms-vscode.js-debug"
       ]
   }
   ```

#### Debug Configuration
1. Add VS Code debug configuration:
   ```json
   // .vscode/launch.json
   {
       "version": "0.2.0",
       "configurations": [
           {
               "type": "chrome",
               "request": "launch",
               "name": "Launch Chrome against localhost",
               "url": "http://localhost:5500",
               "webRoot": "${workspaceFolder}"
           }
       ]
   }
   ```

2. Add debugging shortcuts:
   ```json
   // .vscode/keybindings.json
   {
       "key": "ctrl+shift+d",
       "command": "workbench.action.debug.start",
       "when": "!inDebugMode"
   }
   ```
