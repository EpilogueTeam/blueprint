const fs = require("fs");
const path = require("path");
const BlueprintCompiler = require("./BlueprintCompiler");
const BlueprintFileHandler = require("./BlueprintFileHandler");

/**
 * BlueprintBuilder coordinates the entire build process from reading Blueprint files
 * to writing compiled HTML and CSS files.
 */
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

    this.compiler = new BlueprintCompiler(this.options);
    this.fileHandler = new BlueprintFileHandler(this.options);
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
      const input = this.fileHandler.readBlueprintFile(inputPath);
      
      const baseName = path.basename(inputPath, ".bp");
      
      const result = this.compiler.compile(input, baseName);
      
      if (result.success) {
        this.fileHandler.writeCompiledFiles(outputDir, baseName, result.html, result.css);
        
        if (result.hasServerCode && result.serverCode) {
          const serverDir = path.join(outputDir, 'server');
          if (!fs.existsSync(serverDir)) {
            fs.mkdirSync(serverDir, { recursive: true });
          }
          
          const serverFilePath = path.join(serverDir, `${baseName}-server.js`);
          fs.writeFileSync(serverFilePath, result.serverCode, 'utf8');
          
          if (this.options.debug) {
            console.log(`[DEBUG] Server code written to ${serverFilePath}`);
          }
        }
        
        if (this.options.debug) {
          console.log("[DEBUG] Build completed successfully");
        }
      }
      
      return {
        success: result.success,
        errors: result.errors,
        hasServerCode: result.hasServerCode
      };
    } catch (error) {
      if (this.options.debug) {
        console.log("[DEBUG] Build failed with error:", error);
      }
      return {
        success: false,
        hasServerCode: false,
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

module.exports = BlueprintBuilder;
