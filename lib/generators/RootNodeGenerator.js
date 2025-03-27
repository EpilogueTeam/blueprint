/**
 * Generates HTML for the root node of the AST.
 */
class RootNodeGenerator {
  /**
   * Creates a new root node generator.
   * @param {Object} options - Options for the generator
   * @param {Object} parentGenerator - Parent HTML generator for recursion
   */
  constructor(options, parentGenerator) {
    this.options = options;
    this.parentGenerator = parentGenerator;
  }

  /**
   * Determines if this generator can handle the given node.
   * @param {Object} node - The node to check
   * @returns {boolean} - True if this generator can handle the node
   */
  canHandle(node) {
    return node.type === "root";
  }

  /**
   * Generates HTML for the root node.
   * @param {Object} node - The node to generate HTML for
   * @returns {string} - The generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`\n[RootNodeGenerator] Processing root node with ${node.children.length} children`);
    }

    let html = "";
    
    node.children.forEach((child, index) => {
      if (this.options.debug) {
        console.log(`[RootNodeGenerator] Processing child ${index + 1}/${node.children.length}`);
      }
      html += this.parentGenerator.generateHTML(child);
    });

    return html;
  }
}

module.exports = RootNodeGenerator; 