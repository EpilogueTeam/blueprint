const fs = require("fs");
const path = require("path");
const TokenParser = require("./TokenParser");
const ASTBuilder = require("./ASTBuilder");
const CSSGenerator = require("./CSSGenerator");
const HTMLGenerator = require("./HTMLGenerator");
const MetadataManager = require("./MetadataManager");

class BlueprintBuilder {
  /**
   * Create a new Blueprint builder instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.minified=true] - Minify generated HTML and CSS
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(options = {}) {
    this.options = {
      minified: true,
      debug: false,
      ...options,
    };

    this.tokenParser = new TokenParser(this.options);
    this.astBuilder = new ASTBuilder(this.options);
    this.cssGenerator = new CSSGenerator(this.options);
    this.htmlGenerator = new HTMLGenerator(this.options, this.cssGenerator);
    this.metadataManager = new MetadataManager(this.options);
  }


  /**
   * Builds a Blueprint file.
   * @param {string} inputPath - Path to the Blueprint file to build
   * @param {string} outputDir - Directory to write the generated HTML and CSS files
   * @returns {Object} - Build result object with `success` and `errors` properties
   */
  build(inputPath, outputDir) {
    if (this.options.debug) {
      console.log(`[DEBUG] Starting build for ${inputPath}`);
    }

    try {
      if (!inputPath.endsWith(".bp")) {
        throw new Error("Input file must have .bp extension");
      }

      const input = fs.readFileSync(inputPath, "utf8");

      const tokens = this.tokenParser.tokenize(input);

      const ast = this.astBuilder.buildAST(tokens);

      const pageNode = ast.children.find((node) => node.tag === "page");
      if (pageNode) {
        this.metadataManager.processPageMetadata(pageNode);
      }

      const html = this.htmlGenerator.generateHTML(ast);
      const css = this.cssGenerator.generateCSS();

      const baseName = path.basename(inputPath, ".bp");
      const headContent = this.metadataManager.generateHeadContent(baseName);
      const finalHtml = this.generateFinalHtml(headContent, html);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(path.join(outputDir, `${baseName}.html`), finalHtml);
      fs.writeFileSync(path.join(outputDir, `${baseName}.css`), css);

      if (this.options.debug) {
        console.log("[DEBUG] Build completed successfully");
      }

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      if (this.options.debug) {
        console.log("[DEBUG] Build failed with error:", error);
      }
      return {
        success: false,
        errors: [
          {
            message: error.message,
            type: error.name,
            line: error.line,
            column: error.column,
          },
        ],
      };
    }
  }

/**
 * Generates the final HTML document as a string.
 *
 * @param {string} headContent - The HTML content to be placed within the <head> tag.
 * @param {string} bodyContent - The HTML content to be placed within the <body> tag.
 * @returns {string} - A complete HTML document containing the provided head and body content.
 */

  generateFinalHtml(headContent, bodyContent) {
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

module.exports = BlueprintBuilder;
