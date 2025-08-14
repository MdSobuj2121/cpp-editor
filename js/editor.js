// Editor Management
const EditorService = {
    initialize() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' }});
        require(["vs/editor/editor.main"], () => {
            this.setupEditor();
            this.setupTheme();
            this.setupKeybindings();
        });
    },

    setupEditor() {
        window.editor = monaco.editor.create(document.getElementById('editor'), {
            value: LANGUAGE_CONFIG.cpp.template,
            language: 'cpp',
            theme: document.body.classList.contains('dark-mode') ? 'vs-dark' : 'vs',
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            tabSize: 4,
            insertSpaces: true,
            snippets: true,
            suggest: {
                snippetsPreventQuickSuggestions: false
            }
        });

        // Add custom snippets
        monaco.languages.registerCompletionItemProvider('cpp', {
            provideCompletionItems: () => {
                return {
                    suggestions: [
                        {
                            label: 'cp-template',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: LANGUAGE_CONFIG.cpp.template,
                            detail: 'Competitive Programming Template'
                        },
                        // Add more snippets here
                    ]
                };
            }
        });
    },

    setupTheme() {
        monaco.editor.defineTheme('cp-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: '569CD6' }
                // Add more custom theme rules
            ],
            colors: {
                'editor.background': '#1E1E1E',
            }
        });
    },

    setupKeybindings() {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
            EventBus.emit('save-code');
        });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_R, () => {
            EventBus.emit('run-code');
        });
    },

    getValue() {
        return window.editor.getValue();
    },

    setValue(code) {
        window.editor.setValue(code);
    },

    formatCode() {
        window.editor.getAction('editor.action.formatDocument').run();
    }
};
