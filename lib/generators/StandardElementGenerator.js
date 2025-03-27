const { ELEMENT_MAPPINGS } = require("../mappings");
const StringUtils = require("../utils/StringUtils");

/**
 * Generates HTML for standard elements.
 */
class StandardElementGenerator {
  /**
   * Creates a new standard element generator.
   * @param {Object} options - Options for the generator
   * @param {CSSGenerator} cssGenerator - CSS generator instance
   * @param {Object} parentGenerator - Parent HTML generator for recursion
   */
  constructor(options, cssGenerator, parentGenerator) {
    this.options = options;
    this.cssGenerator = cssGenerator;
    this.parentGenerator = parentGenerator;
  }

  /**
   * Determines if this generator can handle the given node.
   * @param {Object} node - The node to check
   * @returns {boolean} - True if this generator can handle the node
   */
  canHandle(node) {
    return (
      node.type === "element" &&
      node.tag !== "page" &&
      !node.tag.startsWith("button") &&
      node.tag !== "link" &&
      node.tag !== "media"
    );
  }

  /**
   * Generates HTML for a standard element.
   * @param {Object} node - The node to generate HTML for
   * @returns {string} - The generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`\n[StandardElementGenerator] Processing element node: ${node.tag}`);
    }

    const mapping = ELEMENT_MAPPINGS[node.tag];
    const tag = mapping ? mapping.tag : "div";
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
        console.log(`[StandardElementGenerator] Added explicit ID attribute: ${idValue}`);
      }
    }
    else if (node.elementId) {
      attributes += ` id="${node.elementId}"`;
      if (this.options.debug) {
        console.log(`[StandardElementGenerator] Adding generated ID attribute: ${node.elementId}`);
      }
    }
    
    if (node.props.find((p) => typeof p === "string" && p.startsWith("data-"))) {
      const dataProps = node.props.filter(
        (p) => typeof p === "string" && p.startsWith("data-")
      );
      attributes += " " + dataProps.map((p) => `${p}`).join(" ");
    }

    let html = `<${tag} class="${className}"${attributes}>${
      this.options.minified ? "" : "\n"
    }`;

    node.children.forEach((child) => {
      child.parent = node;
      html += this.parentGenerator.generateHTML(child);
    });

    html += `${this.options.minified ? "" : "\n"}</${tag}>${
      this.options.minified ? "" : "\n"
    }`;

    return html;
  }
}

module.exports = StandardElementGenerator; 