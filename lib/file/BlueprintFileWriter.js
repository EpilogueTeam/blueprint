const fs = require("fs");
const path = require("path");

/**
 * Handles writing compiled Blueprint files to the file system.
 */
class BlueprintFileWriter {
  /**
   * Creates a new BlueprintFileWriter instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(options = {}) {
    this.options = {
      debug: false,
      ...options,
    };
  }

  /**
   * Writes HTML content to a file.
   * @param {string} outputPath - Path to write the HTML file
   * @param {string} content - HTML content to write
   */
  writeHtmlFile(outputPath, content) {
    if (this.options.debug) {
      console.log(`[DEBUG] Writing HTML file: ${outputPath}`);
    }
    this.ensureDirectoryExists(path.dirname(outputPath));
    fs.writeFileSync(outputPath, content);
  }

  /**
   * Writes CSS content to a file.
   * @param {string} outputPath - Path to write the CSS file
   * @param {string} content - CSS content to write
   */
  writeCssFile(outputPath, content) {
    if (this.options.debug) {
      console.log(`[DEBUG] Writing CSS file: ${outputPath}`);
    }
    this.ensureDirectoryExists(path.dirname(outputPath));
    fs.writeFileSync(outputPath, content);
  }

  /**
   * Writes both HTML and CSS files for a Blueprint compilation result.
   * @param {string} outputDir - Directory to write the files to
   * @param {string} baseName - Base name for the files (without extension)
   * @param {string} html - HTML content to write
   * @param {string} css - CSS content to write
   */
  writeCompiledFiles(outputDir, baseName, html, css) {
    if (this.options.debug) {
      console.log(`[DEBUG] Writing compiled files to: ${outputDir}/${baseName}`);
    }

    this.ensureDirectoryExists(outputDir);
    
    this.writeHtmlFile(path.join(outputDir, `${baseName}.html`), html);
    this.writeCssFile(path.join(outputDir, `${baseName}.css`), css);
  }

  /**
   * Ensures that a directory exists, creating it if it does not.
   * @param {string} dir - Directory path
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      if (this.options.debug) {
        console.log(`[DEBUG] Created directory: ${dir}`);
      }
    }
  }
}

module.exports = BlueprintFileWriter; 