/**
 * Generates HTML for input elements (checkbox, radio, switch, slider).
 */
class InputElementGenerator {
  /**
   * Creates a new input element generator.
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
      ["checkbox", "radio", "switch", "slider"].includes(node.tag)
    );
  }

  /**
   * Generates HTML for an input element.
   * @param {Object} node - The node to generate HTML for
   * @returns {string} - The generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`\n[InputElementGenerator] Processing input: ${node.tag}`);
    }

    const className = this.cssGenerator.generateClassName(node.tag);
    const { cssProps, nestedRules } = this.cssGenerator.nodeToCSSProperties(node);

    this.cssGenerator.cssRules.set(`.${className}`, {
      cssProps,
      nestedRules,
    });

    let attributes = "";
    if (node.tag === "checkbox") {
      attributes = ' type="checkbox"';
    } else if (node.tag === "radio") {
      attributes = ' type="radio"';
    } else if (node.tag === "switch") {
      attributes = ' type="checkbox" role="switch"';
    } else if (node.tag === "slider") {
      attributes = ' type="range"';
    }

    // Extract and handle ID attribute
    let idAttr = "";
    const idProp = node.props.find(p => typeof p === "string" && p.startsWith("id:"));
    if (idProp) {
      const idValue = idProp.substring(idProp.indexOf(":") + 1).trim().replace(/^"|"$/g, "");
      idAttr = ` id="${idValue}"`;
      node.elementId = idValue;
      
      // Register as reactive element with the parent generator
      if (this.parentGenerator && this.parentGenerator.jsGenerator) {
        this.parentGenerator.jsGenerator.registerReactiveElement(idValue);
        if (this.options.debug) {
          console.log(`[InputElementGenerator] Registered checkbox with ID: ${idValue} as reactive`);
        }
      }
    }

    const valueProp = node.props.find((p) => p.startsWith("value:"));
    if (valueProp) {
      const value = valueProp.substring(valueProp.indexOf(":") + 1).trim();
      attributes += ` value="${value}"`;
    }

    if (node.props.find((p) => typeof p === "string" && p.startsWith("data-"))) {
      const dataProps = node.props.filter(
        (p) => typeof p === "string" && p.startsWith("data-")
      );
      attributes += " " + dataProps.map((p) => `${p}`).join(" ");
    }

    if (node.children.length > 0) {
      let html = `<label class="${className}-container">`;
      html += `<input class="${className}"${attributes}${idAttr}>`;
      
      node.children.forEach((child) => {
        child.parent = node;
        html += this.parentGenerator.generateHTML(child);
      });
      
      html += `</label>`;
      return html;
    } else {
      return `<input class="${className}"${attributes}${idAttr}>`;
    }
  }
}

module.exports = InputElementGenerator; 