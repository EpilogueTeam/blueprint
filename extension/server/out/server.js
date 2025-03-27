"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
// Create a connection for the server
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a text document manager
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// Blueprint template
const blueprintTemplate = `page {
    title { "$1" }
    description { "$2" }
    keywords { "$3" }
    author { "$4" }
}

navbar {
    horizontal {
        link(href:$5) { text(bold) { "$6" } }
        links {
            link(href:$7) { "$8" }
            link(href:$9) { "$10" }
            link(href:$11) { "$12" }
        }
    }
}

horizontal(centered) {
    vertical(centered) {
        title(huge,margin:0) { "$13" }
        text(subtle,margin:0) { "$14" }
    }
}`;
// Blueprint elements that can be used
const elements = [
    'section', 'grid', 'horizontal', 'vertical', 'title', 'text',
    'link', 'links', 'button', 'button-light', 'button-secondary', 'button-compact',
    'card', 'badge', 'alert', 'tooltip', 'input', 'textarea', 'select',
    'checkbox', 'radio', 'switch', 'list', 'table', 'progress', 'slider'
];
// Script block types
const scriptBlocks = ['client', 'server'];
// Single instance elements
const singleElements = ['page', 'navbar'];
// Blueprint properties
const properties = [
    'wide', 'centered', 'alternate', 'padding', 'margin', 'columns', 'responsive',
    'gap', 'spaced', 'huge', 'large', 'small', 'tiny', 'bold', 'light', 'normal',
    'italic', 'underline', 'strike', 'uppercase', 'lowercase', 'capitalize',
    'subtle', 'accent', 'error', 'success', 'warning', 'hover-scale', 'hover-raise',
    'hover-glow', 'hover-underline', 'hover-fade', 'focus-glow', 'focus-outline',
    'focus-scale', 'active-scale', 'active-color', 'active-raise', 'mobile-stack',
    'mobile-hide', 'tablet-wrap', 'tablet-hide', 'desktop-wide', 'desktop-hide'
];
// Page configuration properties
const pageProperties = ['title', 'description', 'keywords', 'author'];
// Container elements that can have children
const containerElements = [
    'horizontal', 'vertical', 'section', 'grid', 'navbar',
    'links', 'card'
];
connection.onInitialize((params) => {
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ['{', '(', ' ', '!']
            }
        }
    };
    return result;
});
// Check if an element exists in the document
function elementExists(text, element) {
    const regex = new RegExp(`\\b${element}\\s*{`, 'i');
    return regex.test(text);
}
// This handler provides the initial list of completion items.
connection.onCompletion((textDocumentPosition) => {
    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) {
        return [];
    }
    const text = document.getText();
    const lines = text.split('\n');
    const position = textDocumentPosition.position;
    const line = lines[position.line];
    const linePrefix = line.slice(0, position.character);
    // Check if this is a template completion trigger
    if (linePrefix.trim() === '!') {
        return [{
                label: '!blueprint',
                kind: node_1.CompletionItemKind.Snippet,
                insertText: blueprintTemplate,
                insertTextFormat: node_1.InsertTextFormat.Snippet,
                documentation: 'Insert Blueprint starter template with customizable placeholders',
                preselect: true,
                // Add a command to delete the '!' character
                additionalTextEdits: [{
                        range: {
                            start: { line: position.line, character: linePrefix.indexOf('!') },
                            end: { line: position.line, character: linePrefix.indexOf('!') + 1 }
                        },
                        newText: ''
                    }]
            }];
    }
    // Check for @client or @server block completion
    if (linePrefix.trim() === '@' || linePrefix.trim().startsWith('@')) {
        return scriptBlocks.map(blockType => ({
            label: `@${blockType}`,
            kind: node_1.CompletionItemKind.Snippet,
            insertText: `@${blockType} {\n    $1\n}`,
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            documentation: `Create a ${blockType} script block`
        }));
    }
    // After an @client or @server block opening brace, suggest JS snippets
    const scriptBlockMatch = /@(client|server)\s*{\s*$/.exec(linePrefix);
    if (scriptBlockMatch) {
        const blockType = scriptBlockMatch[1];
        const jsSnippets = [];
        if (blockType === 'client') {
            jsSnippets.push({
                label: 'element.set',
                kind: node_1.CompletionItemKind.Method,
                insertText: '${1:elementId}.set("${2:new value}");',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
                documentation: 'Set the content of an element'
            }, {
                label: 'console.log',
                kind: node_1.CompletionItemKind.Method,
                insertText: 'console.log("${1:message}");',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
                documentation: 'Log a message to the console'
            }, {
                label: 'DOM event handling',
                kind: node_1.CompletionItemKind.Snippet,
                insertText: 'e.preventDefault();\n${1}',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
                documentation: 'Prevent default action of event'
            });
        }
        else if (blockType === 'server') {
            jsSnippets.push({
                label: 'element.set',
                kind: node_1.CompletionItemKind.Method,
                insertText: '${1:elementId}.set(${2:newValue});',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
                documentation: 'Update element value from server'
            }, {
                label: 'element.value',
                kind: node_1.CompletionItemKind.Property,
                insertText: 'const value = ${1:elementId}.value;',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
                documentation: 'Get the current value of an element'
            }, {
                label: 'fetch data',
                kind: node_1.CompletionItemKind.Snippet,
                insertText: 'const response = await fetch("${1:url}");\nconst data = await response.json();\n${2}',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
                documentation: 'Fetch data from an API'
            });
        }
        return jsSnippets;
    }
    // Inside page block
    if (text.includes('page {') && !text.includes('}')) {
        return pageProperties.map(prop => ({
            label: prop,
            kind: node_1.CompletionItemKind.Property,
            insertText: `${prop} { "$1" }`,
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            documentation: `Add ${prop} to the page configuration`
        }));
    }
    // After an opening parenthesis, suggest properties
    if (linePrefix.trim().endsWith('(')) {
        return properties.map(prop => ({
            label: prop,
            kind: node_1.CompletionItemKind.Property,
            documentation: `Apply ${prop} property`
        }));
    }
    // After a container element's opening brace, suggest child elements
    const containerMatch = /\b(horizontal|vertical|section|grid|navbar|links|card)\s*{\s*$/.exec(linePrefix);
    if (containerMatch) {
        const parentElement = containerMatch[1];
        let suggestedElements = elements;
        // Customize suggestions based on parent element
        switch (parentElement) {
            case 'navbar':
                suggestedElements = ['horizontal', 'vertical', 'link', 'links', 'text'];
                break;
            case 'links':
                suggestedElements = ['link'];
                break;
            case 'card':
                suggestedElements = ['title', 'text', 'button', 'image'];
                break;
        }
        return suggestedElements.map(element => ({
            label: element,
            kind: node_1.CompletionItemKind.Class,
            insertText: `${element} {\n    $1\n}`,
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            documentation: `Create a ${element} block inside ${parentElement}`
        }));
    }
    // Get available single instance elements
    const availableSingleElements = singleElements.filter(element => !elementExists(text, element));
    // Combine regular elements with available single instance elements
    const availableElements = [
        ...elements,
        ...availableSingleElements
    ];
    // Default: suggest elements
    return availableElements.map(element => {
        const isPage = element === 'page';
        const insertText = isPage ?
            'page {\n    title { "$1" }\n    description { "$2" }\n    keywords { "$3" }\n    author { "$4" }\n}' :
            `${element} {\n    $1\n}`;
        return {
            label: element,
            kind: node_1.CompletionItemKind.Class,
            insertText: insertText,
            insertTextFormat: node_1.InsertTextFormat.Snippet,
            documentation: `Create a ${element} block${isPage ? ' (only one allowed per file)' : ''}`
        };
    });
});
// Find all occurrences of an element in the document
function findElementOccurrences(text, element) {
    const occurrences = [];
    const lines = text.split('\n');
    const regex = new RegExp(`\\b(${element})\\s*{`, 'g');
    lines.forEach((line, lineIndex) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
            const startChar = match.index;
            const endChar = match.index + match[1].length;
            occurrences.push({
                start: { line: lineIndex, character: startChar },
                end: { line: lineIndex, character: endChar }
            });
        }
    });
    return occurrences;
}
// Validate the document for duplicate elements
function validateDocument(document) {
    const text = document.getText();
    const diagnostics = [];
    // Check for duplicate single instance elements
    singleElements.forEach(element => {
        const occurrences = findElementOccurrences(text, element);
        if (occurrences.length > 1) {
            // Add diagnostic for each duplicate occurrence (skip the first one)
            occurrences.slice(1).forEach(occurrence => {
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Error,
                    range: node_1.Range.create(occurrence.start, occurrence.end),
                    message: `Only one ${element} element is allowed per file.`,
                    source: 'blueprint'
                });
            });
        }
    });
    // Send the diagnostics to the client
    connection.sendDiagnostics({ uri: document.uri, diagnostics });
}
// Set up document validation events
documents.onDidChangeContent((change) => {
    validateDocument(change.document);
});
documents.onDidOpen((event) => {
    validateDocument(event.document);
});
// Make the text document manager listen on the connection
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map