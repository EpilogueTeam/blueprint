/**
 * Generates HTML for standard HTML elements.
 */
class StandardElementGenerator {
  /**
   * Creates a new StandardElementGenerator instance.
   * @param {Object} options - Generator options
   * @param {CSSGenerator} cssGenerator - CSS generator instance
   * @param {HTMLGenerator} htmlGenerator - HTML generator instance 
   */
  constructor(options = {}, cssGenerator, htmlGenerator) {
    this.options = options;
    this.cssGenerator = cssGenerator;
    this.htmlGenerator = htmlGenerator;
    this.parentGenerator = htmlGenerator;
  }

  /**
   * Determines whether this generator can handle a given node.
   * @param {Object} node - Node to check
   * @returns {boolean} - True if this generator can handle the node
   */
  canHandle(node) {
    return node.type === "element";
  }

  /**
   * Generates HTML for a standard element.
   * @param {Object} node - Node to generate HTML for
   * @returns {string} - Generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`[StandardElementGenerator] Processing element node: ${node.tag || node.name}`);
    }

    const mapping = ELEMENT_MAPPINGS ? ELEMENT_MAPPINGS[node.tag] : null;
    
    const tagName = mapping ? mapping.tag : (node.name || node.tag || "div");

    let className = "";
    if (this.cssGenerator) {
      className = this.cssGenerator.generateClassName(node.tag);
      const { cssProps, nestedRules } = this.cssGenerator.nodeToCSSProperties(node);
      this.cssGenerator.cssRules.set(`.${className}`, {
        cssProps,
        nestedRules,
      });
    }

    const fullClassName = this.generateClassName(node);
    if (className && fullClassName) {
      className = `${className} ${fullClassName}`;
    } else if (fullClassName) {
      className = fullClassName;
    }

    const attributes = this.generateAttributes(node, node.elementId, className);

    let content = "";
    const children = node.children || [];
    
    for (const child of children) {
      if (
        child.type === "client" || 
        child.type === "server" ||
        (child.type === "element" && (child.name === "script" || child.tag === "script"))
      ) {
        continue;
      }
      child.parent = node;
      content += this.htmlGenerator.generateHTML(child);
      if (!this.options.minified) {
        content += "\n";
      }
    }

    return `<${tagName}${attributes}>${this.options.minified ? "" : "\n"}${content}${this.options.minified ? "" : ""}</${tagName}>${this.options.minified ? "" : "\n"}`;
  }

  /**
   * Generates a className string for the element.
   * @param {Object} node - The node to generate class for
   * @returns {string} - The generated class name
   */
  generateClassName(node) {
    let classNames = [];
    
    if (node.attributes && Array.isArray(node.attributes)) {
      const classAttr = node.attributes.find(attr => attr.name === "class");
      if (classAttr && classAttr.value) {
        classNames.push(classAttr.value);
      }
    }
    
    if (node.props && Array.isArray(node.props)) {
      for (const prop of node.props) {
        if (typeof prop === "string") {
          if (prop.startsWith("class:")) {
            classNames.push(prop.substring(prop.indexOf(":") + 1).trim().replace(/^"|"$/g, ""));
          }
        }
      }
    }
    
    return classNames.join(" ");
  }

  /**
   * Generates an attributes string for the element.
   * @param {Object} node - The node to generate attributes for
   * @param {string} id - The element ID
   * @param {string} className - The element class name
   * @returns {string} - The generated attributes string
   */
  generateAttributes(node, id, className) {
    let attributes = "";
    
    if (id) {
      attributes += ` id="${id}"`;
    } else if (node.props && Array.isArray(node.props)) {
      const idProp = node.props.find(p => typeof p === "string" && p.startsWith("id:"));
      if (idProp) {
        const idValue = idProp.substring(idProp.indexOf(":") + 1).trim().replace(/^"|"$/g, "");
        attributes += ` id="${idValue}"`;
        node.elementId = idValue;
      }
    }
    
    if (className) {
      attributes += ` class="${className}"`;
    }
    
    if (node.props && Array.isArray(node.props)) {
      const dataProps = node.props.filter(p => typeof p === "string" && p.startsWith("data-"));
      if (dataProps.length) {
        attributes += " " + dataProps.join(" ");
      }
    }
    
    if (node.attributes && Array.isArray(node.attributes)) {
      for (const attr of node.attributes) {
        if (attr.name === "id" || attr.name === "class") continue;
        
        if (attr.value === true) {
          attributes += ` ${attr.name}`;
        } else if (attr.value !== false && attr.value !== undefined && attr.value !== null) {
          attributes += ` ${attr.name}="${attr.value}"`;
        }
      }
    }
    
    if (node.props && Array.isArray(node.props)) {
      for (const prop of node.props) {
        if (typeof prop === "string") {
          if (prop.startsWith("id:") || prop.startsWith("class:") || prop.startsWith("data-")) continue;
          
          const colonIndex = prop.indexOf(":");
          if (colonIndex !== -1) {
            const name = prop.substring(0, colonIndex).trim();
            const value = prop.substring(colonIndex + 1).trim().replace(/^"|"$/g, "");
            
            if (!attributes.includes(` ${name}="`)) {
              attributes += ` ${name}="${value}"`;
            }
          } else {
            if (!attributes.includes(` ${prop}`)) {
              attributes += ` ${prop}`;
            }
          }
        }
      }
    }
    
    return attributes;
  }
}

module.exports = StandardElementGenerator;