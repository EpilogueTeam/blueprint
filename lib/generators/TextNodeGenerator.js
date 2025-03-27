const StringUtils = require("../utils/StringUtils");

/**
 * Generates HTML for text nodes.
 */
class TextNodeGenerator {
  /**
   * Creates a new text node generator.
   * @param {Object} options - Options for the generator
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * Determines if this generator can handle the given node.
   * @param {Object} node - The node to check
   * @returns {boolean} - True if this generator can handle the node
   */
  canHandle(node) {
    return node.type === "text";
  }

  /**
   * Generates HTML for a text node.
   * @param {Object} node - The node to generate HTML for
   * @returns {string} - The generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`\n[TextNodeGenerator] Processing text node`);
    }

    if (node.parent?.tag === "codeblock") {
      if (this.options.debug) {
        console.log("[TextNodeGenerator] Raw text content for codeblock");
      }
      return node.value;
    }

    const escapedText = StringUtils.escapeHTML(node.value);
    
    if (this.options.debug) {
      console.log("[TextNodeGenerator] Generated escaped text");
    }
    
    return escapedText;
  }
}

module.exports = TextNodeGenerator; 