import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    InsertTextFormat,
    Diagnostic,
    DiagnosticSeverity,
    Position,
    Range,
    TextDocumentChangeEvent
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

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

// Script blocks
const scriptBlocks = [
    'client', 'server'
];

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

// ID attribute suggestion - using underscore format
const idAttributeTemplate = 'id:$1_$2';

// Container elements that can have children
const containerElements = [
    'horizontal', 'vertical', 'section', 'grid', 'navbar',
    'links', 'card'
];

connection.onInitialize((params: InitializeParams) => {
    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ['{', '(', ' ', '!']
            }
        }
    };
    return result;
});

// Check if an element exists in the document
function elementExists(text: string, element: string): boolean {
    const regex = new RegExp(`\\b${element}\\s*{`, 'i');
    return regex.test(text);
}

// This handler provides the initial list of completion items.
connection.onCompletion(
    (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        const document = documents.get(textDocumentPosition.textDocument.uri);
        if (!document) {
            return [];
        }

        const text = document.getText();
        const lines = text.split('\n');
        const position = textDocumentPosition.position;
        const line = lines[position.line];
        const linePrefix = line.slice(0, position.character);

        // Suggest script blocks after @ symbol
        if (linePrefix.trim().endsWith('@')) {
            return scriptBlocks.map(block => ({
                label: `@${block}`,
                kind: CompletionItemKind.Snippet,
                insertText: `@${block} {\n    $1\n}`,
                insertTextFormat: InsertTextFormat.Snippet,
                documentation: block === 'client' ? 
                    'Create a client-side JavaScript block that runs when the element is clicked. The "e" event object is available.' :
                    'Create a server-side JavaScript block that runs on the server.'
            }));
        }

        // Check if this is a template completion trigger
        if (linePrefix.trim() === '!') {
            return [{
                label: '!blueprint',
                kind: CompletionItemKind.Snippet,
                insertText: blueprintTemplate,
                insertTextFormat: InsertTextFormat.Snippet,
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

        // Inside page block
        if (text.includes('page {') && !text.includes('}')) {
            return pageProperties.map(prop => ({
                label: prop,
                kind: CompletionItemKind.Property,
                insertText: `${prop} { "$1" }`,
                insertTextFormat: InsertTextFormat.Snippet,
                documentation: `Add ${prop} to the page configuration`
            }));
        }

        // After an opening parenthesis, suggest properties including ID with underscore format
        if (linePrefix.trim().endsWith('(')) {
            return [
                ...properties.map(prop => ({
                    label: prop,
                    kind: CompletionItemKind.Property,
                    documentation: `Apply ${prop} property`
                })),
                {
                    label: 'id',
                    kind: CompletionItemKind.Property,
                    insertText: idAttributeTemplate,
                    insertTextFormat: InsertTextFormat.Snippet,
                    documentation: 'Add an ID to the element (use underscores instead of hyphens for JavaScript compatibility)'
                }
            ];
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

            // Include client/server block suggestions for interactive elements
            if (['button', 'button-light', 'button-secondary', 'button-compact'].includes(parentElement)) {
                return [
                    ...suggestedElements.map(element => ({
                        label: element,
                        kind: CompletionItemKind.Class,
                        insertText: `${element} {\n    $1\n}`,
                        insertTextFormat: InsertTextFormat.Snippet,
                        documentation: `Create a ${element} block inside ${parentElement}`
                    })),
                    {
                        label: '@client',
                        kind: CompletionItemKind.Snippet,
                        insertText: `@client {\n    $1\n}`,
                        insertTextFormat: InsertTextFormat.Snippet,
                        documentation: 'Create a client-side JavaScript block that runs when the element is clicked. The "e" event object is available.'
                    }
                ];
            }

            return suggestedElements.map(element => ({
                label: element,
                kind: CompletionItemKind.Class,
                insertText: `${element} {\n    $1\n}`,
                insertTextFormat: InsertTextFormat.Snippet,
                documentation: `Create a ${element} block inside ${parentElement}`
            }));
        }
        
        // Inside interactive elements, suggest @client blocks
        const interactiveElementMatch = /\b(button|button-light|button-secondary|button-compact|input|textarea|select|checkbox|radio|switch)\s*(?:\([^)]*\))?\s*{\s*$/.exec(linePrefix);
        if (interactiveElementMatch) {
            return [
                {
                    label: '@client',
                    kind: CompletionItemKind.Snippet,
                    insertText: `@client {\n    $1\n}`,
                    insertTextFormat: InsertTextFormat.Snippet,
                    documentation: 'Create a client-side JavaScript block that runs when the element is clicked. The "e" event object is available.'
                },
                {
                    label: 'text',
                    kind: CompletionItemKind.Class,
                    insertText: `"$1"`,
                    insertTextFormat: InsertTextFormat.Snippet,
                    documentation: 'Add text content to the element'
                }
            ];
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
                kind: CompletionItemKind.Class,
                insertText: insertText,
                insertTextFormat: InsertTextFormat.Snippet,
                documentation: `Create a ${element} block${isPage ? ' (only one allowed per file)' : ''}`
            };
        });
    }
);

// Find all occurrences of an element in the document
function findElementOccurrences(text: string, element: string): { start: Position; end: Position; }[] {
    const occurrences: { start: Position; end: Position; }[] = [];
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
function validateDocument(document: TextDocument): void {
    const text = document.getText();
    const diagnostics: Diagnostic[] = [];

    // Check for duplicate single instance elements
    singleElements.forEach(element => {
        const occurrences = findElementOccurrences(text, element);
        if (occurrences.length > 1) {
            // Add diagnostic for each duplicate occurrence (skip the first one)
            occurrences.slice(1).forEach(occurrence => {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: Range.create(occurrence.start, occurrence.end),
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
documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
    validateDocument(change.document);
});

documents.onDidOpen((event: TextDocumentChangeEvent<TextDocument>) => {
    validateDocument(event.document);
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen(); 