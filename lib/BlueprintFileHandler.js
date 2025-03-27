const path = require("path");
const BlueprintFileReader = require("./file/BlueprintFileReader");
const BlueprintFileWriter = require("./file/BlueprintFileWriter");

/**
 * BlueprintFileHandler coordinates file I/O operations for the Blueprint compiler.
 */
class BlueprintFileHandler {
  /**
   * Create a new BlueprintFileHandler instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(options = {}) {
    this.options = {
      debug: false,
      ...options,
    };
    
    this.reader = new BlueprintFileReader(this.options);
    this.writer = new BlueprintFileWriter(this.options);
  }

  /**
   * Reads a Blueprint file from the file system.
   * @param {string} inputPath - Path to the Blueprint file
   * @returns {string} - The content of the file
   * @throws {Error} - If the file does not exist or has an invalid extension
   */
  readBlueprintFile(inputPath) {
    return this.reader.readFile(inputPath);
  }

  /**
   * Writes the compiled HTML and CSS to the file system.
   * @param {string} outputDir - Directory to write the files to
   * @param {string} baseName - Base name for the files
   * @param {string} html - HTML content to write
   * @param {string} css - CSS content to write
   * @throws {Error} - If the output directory cannot be created or the files cannot be written
   */
  writeCompiledFiles(outputDir, baseName, html, css) {
    this.writer.writeCompiledFiles(outputDir, baseName, html, css);
  }

  /**
   * Ensures that a directory exists, creating it if it does not.
   * @param {string} dir - Directory path
   */
  ensureDirectoryExists(dir) {
    this.writer.ensureDirectoryExists(dir);
  }
}

module.exports = BlueprintFileHandler; 