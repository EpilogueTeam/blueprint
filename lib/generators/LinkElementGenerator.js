const LinkProcessor = require("../utils/LinkProcessor");

/**
 * Generates HTML for link elements.
 */
class LinkElementGenerator {
  /**
   * Creates a new link element generator.
   * @param {Object} options - Options for the generator
   * @param {CSSGenerator} cssGenerator - CSS generator instance
   * @param {Object} parentGenerator - Parent HTML generator for recursion
   */
  constructor(options, cssGenerator, parentGenerator) {
    this.options = options;
    this.cssGenerator = cssGenerator;
    this.parentGenerator = parentGenerator;
    this.linkProcessor = new LinkProcessor(options);
  }

  /**
   * Determines if this generator can handle the given node.
   * @param {Object} node - The node to check
   * @returns {boolean} - True if this generator can handle the node
   */
  canHandle(node) {
    return node.type === "element" && node.tag === "link";
  }

  /**
   * Generates HTML for a link element.
   * @param {Object} node - The node to generate HTML for
   * @returns {string} - The generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`\n[LinkElementGenerator] Processing link`);
    }

    if (
      node.children.length === 1 &&
      (node.children[0].tag === "button" || node.children[0].tag?.startsWith("button-"))
    ) {
      if (this.options.debug) {
        console.log("[LinkElementGenerator] Processing button inside link - using button's HTML");
      }
      node.children[0].parent = node;
      return this.parentGenerator.generateHTML(node.children[0]);
    }

    const className = this.cssGenerator.generateClassName(node.tag);
    const { cssProps, nestedRules } = this.cssGenerator.nodeToCSSProperties(node);

    this.cssGenerator.cssRules.set(`.${className}`, {
      cssProps,
      nestedRules,
    });

    const linkInfo = this.linkProcessor.processLink(node);
    const attributes = this.linkProcessor.getLinkAttributes(linkInfo);

    let html = `<a class="${className}"${attributes}>${
      this.options.minified ? "" : "\n"
    }`;

    node.children.forEach((child) => {
      child.parent = node;
      html += this.parentGenerator.generateHTML(child);
    });

    html += `${this.options.minified ? "" : "\n"}</a>${
      this.options.minified ? "" : "\n"
    }`;

    return html;
  }
}

module.exports = LinkElementGenerator; 