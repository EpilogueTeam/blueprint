const TokenParser = require("./TokenParser");
const ASTBuilder = require("./ASTBuilder");
const CSSGenerator = require("./CSSGenerator");
const HTMLGenerator = require("./HTMLGenerator");
const MetadataManager = require("./MetadataManager");

/**
 * BlueprintCompiler handles the core compilation process of transforming Blueprint syntax
 * into HTML and CSS, without handling file I/O operations.
 */
class BlueprintCompiler {
  /**
   * Create a new Blueprint compiler instance.
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
   * Compiles Blueprint code into HTML and CSS.
   * @param {string} blueprintCode - Blueprint source code to compile
   * @param {string} baseName - Base name for the generated files
   * @returns {Object} - Compilation result with HTML and CSS content
   */
  compile(blueprintCode, baseName) {
    if (this.options.debug) {
      console.log(`[DEBUG] Starting compilation`);
    }

    try {
      const tokens = this.tokenParser.tokenize(blueprintCode);
      const ast = this.astBuilder.buildAST(tokens);

      const pageNode = ast.children.find((node) => node.tag === "page");
      if (pageNode) {
        this.metadataManager.processPageMetadata(pageNode);
      }

      const html = this.htmlGenerator.generateHTML(ast);
      const css = this.cssGenerator.generateCSS();

      const headContent = this.metadataManager.generateHeadContent(baseName);
      const finalHtml = this.htmlGenerator.generateFinalHtml(headContent, html);

      if (this.options.debug) {
        console.log("[DEBUG] Compilation completed successfully");
      }

      return {
        success: true,
        html: finalHtml,
        css: css,
        errors: [],
      };
    } catch (error) {
      if (this.options.debug) {
        console.log("[DEBUG] Compilation failed with error:", error);
      }
      return {
        success: false,
        html: null,
        css: null,
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
}

module.exports = BlueprintCompiler; 