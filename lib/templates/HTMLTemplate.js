/**
 * HTMLTemplate provides templates for generating the final HTML document.
 */
class HTMLTemplate {
  /**
   * Creates a new HTML template instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.minified=true] - Whether to minify the output
   */
  constructor(options = {}) {
    this.options = {
      minified: true,
      ...options,
    };
  }

  /**
   * Generates the final HTML document using the provided head and body content.
   * @param {string} headContent - HTML content for the <head> section
   * @param {string} bodyContent - HTML content for the <body> section
   * @returns {string} - Complete HTML document
   */
  generateDocument(headContent, bodyContent) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${headContent}
    <style>
        :root {
            --navbar-height: 4rem;
        }
        body {
            margin: 0;
            padding: 0;
            padding-top: var(--navbar-height);
            background-color: #0d1117;
            color: #e6edf3;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.5;
            min-height: 100vh;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        ::selection {
            background-color: rgba(59, 130, 246, 0.2);
        }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;
  }
}

module.exports = HTMLTemplate; 