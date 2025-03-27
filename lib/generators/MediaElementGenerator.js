const BlueprintError = require("../BlueprintError");

/**
 * Generates HTML for media elements (images and videos).
 */
class MediaElementGenerator {
  /**
   * Creates a new media element generator.
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
    return node.type === "element" && node.tag === "media";
  }

  /**
   * Generates HTML for a media element.
   * @param {Object} node - The node to generate HTML for
   * @returns {string} - The generated HTML
   */
  generate(node) {
    if (this.options.debug) {
      console.log(`\n[MediaElementGenerator] Processing media element`);
    }

    const className = this.cssGenerator.generateClassName(node.tag);
    const { cssProps, nestedRules } = this.cssGenerator.nodeToCSSProperties(node);

    this.cssGenerator.cssRules.set(`.${className}`, {
      cssProps,
      nestedRules,
    });

    const srcProp = node.props.find((p) => p.startsWith("src:"));
    const typeProp = node.props.find((p) => p.startsWith("type:"));
    
    if (!srcProp) {
      throw new BlueprintError("Media element requires src property", node.line, node.column);
    }
    
    const src = srcProp.substring(srcProp.indexOf(":") + 1).trim();
    const type = typeProp ? typeProp.substring(typeProp.indexOf(":") + 1).trim() : "img";
    
    let tag, attributes;
    
    if (type === "video") {
      tag = "video";
      attributes = ` src="${src}" controls`;
      
      const autoProp = node.props.find((p) => p === "autoplay");
      if (autoProp) {
        attributes += ` autoplay`;
      }
      
      const loopProp = node.props.find((p) => p === "loop");
      if (loopProp) {
        attributes += ` loop`;
      }
      
      const mutedProp = node.props.find((p) => p === "muted");
      if (mutedProp) {
        attributes += ` muted`;
      }
    } else {
      tag = "img";
      const altText = node.children.length > 0 
        ? node.children.map(child => 
            this.parentGenerator.generateHTML(child)).join("") 
        : src.split('/').pop();
      
      attributes = ` src="${src}" alt="${altText}"`;
      
      const loadingProp = node.props.find((p) => p.startsWith("loading:"));
      if (loadingProp) {
        const loadingValue = loadingProp.substring(loadingProp.indexOf(":") + 1).trim();
        if (["lazy", "eager"].includes(loadingValue)) {
          attributes += ` loading="${loadingValue}"`;
        }
      }
    }
    
    if (node.props.find((p) => typeof p === "string" && p.startsWith("data-"))) {
      const dataProps = node.props.filter(
        (p) => typeof p === "string" && p.startsWith("data-")
      );
      attributes += " " + dataProps.map((p) => `${p}`).join(" ");
    }
    
    if (tag === "img") {
      return `<${tag} class="${className}"${attributes}>`;
    } else {
      let html = `<${tag} class="${className}"${attributes}>${
        this.options.minified ? "" : "\n"
      }`;
      
      if (node.children.length > 0 && tag === "video") {
        html += `<p>Your browser doesn't support video playback.</p>`;
      }
      
      html += `${this.options.minified ? "" : "\n"}</${tag}>${
        this.options.minified ? "" : "\n"
      }`;
      
      return html;
    }
  }
}

module.exports = MediaElementGenerator; 