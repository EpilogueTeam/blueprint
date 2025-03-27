const fs = require("fs");

/**
 * Handles reading Blueprint files from the file system.
 */
class BlueprintFileReader {
  /**
   * Creates a new BlueprintFileReader instance.
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
   * Reads a Blueprint file from the file system.
   * @param {string} inputPath - Path to the Blueprint file
   * @returns {string} - The content of the file
   * @throws {Error} - If the file does not exist or has an invalid extension
   */
  readFile(inputPath) {
    if (this.options.debug) {
      console.log(`[DEBUG] Reading Blueprint file: ${inputPath}`);
    }

    if (!inputPath.endsWith(".bp")) {
      throw new Error("Input file must have .bp extension");
    }

    if (!fs.existsSync(inputPath)) {
      throw new Error(`File not found: ${inputPath}`);
    }

    return fs.readFileSync(inputPath, "utf8");
  }
}

module.exports = BlueprintFileReader; 