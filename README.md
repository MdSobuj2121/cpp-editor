"# CP Master - Competitive Programming Platform

A comprehensive platform for competitive programming practice, learning, and improvement.

## Features

### 1. Code Editor
- Monaco-based editor with syntax highlighting
- Multiple language support
- Code templates and snippets
- Auto-completion and IntelliSense
- Code formatting

### 2. Problem Practice
- Problems from multiple platforms:
  - CodeForces
  - AtCoder
  - Custom problems
- Difficulty-based filtering
- Tag-based organization
- Progress tracking

### 3. Contests
- Live contests tracking
- Virtual contest participation
- Contest calendar
- Rating changes

### 4. Tutorials
- Interactive C++ tutorials
- Algorithm explanations
- Data structure implementations
- Problem-solving strategies
- Progress tracking

### 5. Solutions Management
- Save and organize solutions
- Tag-based organization
- Search functionality
- Export/Import solutions

### 6. Profile & Statistics
- Solve count tracking
- Progress visualization
- Performance analytics
- Problem-solving statistics

## Routes

The platform includes the following routes:

| Route | Path | Description |
|-------|------|-------------|
| Editor | `/editor` | Main code editor |
| Problems | `/problems` | Practice problems |
| Contests | `/contests` | Live and upcoming contests |
| Tutorials | `/tutorials` | Learning resources |
| Solutions | `/solutions` | Saved solutions |
| Profile | `/profile` | User profile |
| Statistics | `/statistics` | Performance tracking |

## API Integrations

### 1. Judge0 API
- Code execution
- Multiple language support
- Detailed execution feedback

### 2. CodeForces API
- Problem set
- Contest information
- User statistics

### 3. AtCoder API
- Problem archive
- Contest information

## Running Locally

### Prerequisites
1. Install Visual Studio Code
   - Download from: https://code.visualstudio.com/

2. Install VS Code Extensions
   ```
   1. Open VS Code
   2. Go to Extensions (Ctrl+Shift+X)
   3. Install these extensions:
      - Live Server
      - C/C++ Extension
   ```

### Step-by-Step Setup

1. Clone or Download the Repository:
   ```bash
   git clone https://github.com/MdSobuj2121/cpp-editor.git
   # OR
   # Download ZIP and extract it
   ```

2. Open in VS Code:
   ```bash
   cd cpp-editor
   code .
   ```

3. Get Required API Keys:
   ```
   a. Judge0 API (for code execution):
      1. Go to: https://rapidapi.com/judge0-official/api/judge0-ce
      2. Sign up/Login
      3. Subscribe to the free plan
      4. Copy your RapidAPI key

   b. Optional: CodeForces API (no key needed)
   ```

4. Configure API Keys:
   ```
   1. Open js/config.js
   2. Replace 'YOUR_RAPIDAPI_KEY' with your actual RapidAPI key:
      JUDGE0_API: {
          HEADERS: {
              'X-RapidAPI-Key': 'your-key-here'
          }
      }
   ```

5. Start the Local Server:
   ```
   1. In VS Code, right-click on index.html
   2. Select "Open with Live Server"
   3. Your default browser will open automatically
   ```

### Verifying Installation

1. Check if everything is working:
   - Editor loads properly
   - Monaco editor shows syntax highlighting
   - Code execution works
   - Problem fetching works

2. Test Code Execution:
   ```cpp
   #include <iostream>
   using namespace std;
   
   int main() {
       cout << "Hello World!";
       return 0;
   }
   ```
   Click "Run" to test if Judge0 API is working.

### Troubleshooting

1. If Live Server doesn't start:
   - Check if the extension is installed
   - Try restarting VS Code
   - Check if port 5500 is available

2. If API calls fail:
   - Verify your API keys in config.js
   - Check browser console for errors
   - Ensure you have internet connection

3. If editor doesn't load:
   - Clear browser cache
   - Check console for script loading errors
   - Try a different browser

### Development Mode

For development and debugging:

1. Open Chrome DevTools:
   ```
   Windows: F12 or Ctrl+Shift+I
   Mac: Cmd+Option+I
   ```

2. Enable Network Tab:
   - Monitor API calls
   - Check for any failed requests
   - Verify API key usage

3. Check Console:
   - Look for any JavaScript errors
   - Monitor API responses
   - Debug code execution issues

## Development

### File Structure

```
cpp-editor/
├── index.html
├── js/
│   ├── config.js      # Configuration and API keys
│   ├── api.js         # API integrations
│   ├── editor.js      # Editor management
│   ├── router.js      # Route handling
│   ├── problems.js    # Problem management
│   └── ...
└── README.md
```

### Adding New Features

1. Create a new manager in `js/` (e.g., `newFeature.js`)
2. Add route in `router.js`
3. Add UI elements in `index.html`
4. Update necessary configurations in `config.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- **Md Sobuj Mia**
- GitHub: [@MdSobuj2121](https://github.com/MdSobuj2121)" 
