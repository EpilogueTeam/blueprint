const LinkProcessor = require("../utils/LinkProcessor");

/**
 * Generates HTML for button elements.
 */
class ButtonElementGenerator {
  /**
   * Creates a new button element generator.
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
    return (
      node.type === "element" &&
      (node.tag === "button" || node.tag.startsWith("button-"))
    );
  }

  /**
   * Generates HTML for a button element.
   * @param {Object} node - The node to generate HTML for
   * @returns {string} - The generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`\n[ButtonElementGenerator] Processing button: ${node.tag}`);
    }

    const className = this.cssGenerator.generateClassName(node.tag);
    const { cssProps, nestedRules } = this.cssGenerator.nodeToCSSProperties(node);

    this.cssGenerator.cssRules.set(`.${className}`, {
      cssProps,
      nestedRules,
    });

    let attributes = "";
    
    const idProp = node.props.find((p) => typeof p === "string" && p.startsWith("id:"));
    if (idProp) {
      const idValue = idProp.substring(idProp.indexOf(":") + 1).trim().replace(/^"|"$/g, "");
      attributes += ` id="${idValue}"`;
      node.elementId = idValue;
      if (this.options.debug) {
        console.log(`[ButtonElementGenerator] Added explicit ID attribute: ${idValue}`);
      }
    }
    else if (node.elementId) {
      attributes += ` id="${node.elementId}"`;
      if (this.options.debug) {
        console.log(`[ButtonElementGenerator] Adding generated ID attribute: ${node.elementId}`);
      }
    }
    
    if (node.parent?.tag === "link") {
      const linkInfo = this.linkProcessor.processLink(node.parent);
      attributes += this.linkProcessor.getButtonClickHandler(linkInfo);
    }

    if (node.props.find((p) => typeof p === "string" && p.startsWith("data-"))) {
      const dataProps = node.props.filter(
        (p) => typeof p === "string" && p.startsWith("data-")
      );
      attributes += " " + dataProps.map((p) => `${p}`).join(" ");
    }

    let html = `<button class="${className}"${attributes}>${
      this.options.minified ? "" : "\n"
    }`;

    node.children.forEach((child) => {
      child.parent = node;
      html += this.parentGenerator.generateHTML(child);
    });

    html += `${this.options.minified ? "" : "\n"}</button>${
      this.options.minified ? "" : "\n"
    }`;

    return html;
  }
}

module.exports = ButtonElementGenerator; 