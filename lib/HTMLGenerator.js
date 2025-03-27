const { ELEMENT_MAPPINGS } = require("./mappings");
const TextNodeGenerator = require("./generators/TextNodeGenerator");
const ButtonElementGenerator = require("./generators/ButtonElementGenerator");
const LinkElementGenerator = require("./generators/LinkElementGenerator");
const StandardElementGenerator = require("./generators/StandardElementGenerator");
const RootNodeGenerator = require("./generators/RootNodeGenerator");
const InputElementGenerator = require("./generators/InputElementGenerator");
const MediaElementGenerator = require("./generators/MediaElementGenerator");
const HTMLTemplate = require("./templates/HTMLTemplate");
const StringUtils = require("./utils/StringUtils");

class HTMLGenerator {
  /**
   * Creates a new HTML generator instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.minified=true] - Minify generated HTML
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {CSSGenerator} cssGenerator - CSS generator instance
   */
  constructor(options = {}, cssGenerator) {
    this.options = options;
    this.cssGenerator = cssGenerator;
    this.htmlTemplate = new HTMLTemplate(options);
    

    this.generators = [
      new TextNodeGenerator(this.options),
      new RootNodeGenerator(this.options, this),
      new ButtonElementGenerator(this.options, this.cssGenerator, this),
      new LinkElementGenerator(this.options, this.cssGenerator, this),
      new InputElementGenerator(this.options, this.cssGenerator, this),
      new MediaElementGenerator(this.options, this.cssGenerator, this),

      new StandardElementGenerator(this.options, this.cssGenerator, this)
    ];
    
    if (this.options.debug) {
      console.log(
        "[HTMLGenerator] Initialized with options:",
        JSON.stringify(options, null, 2)
      );
      console.log(
        "[HTMLGenerator] Registered generators:",
        this.generators.map(g => g.constructor.name).join(", ")
      );
    }
  }

  /**
   * Converts a node to a string for debugging purposes, avoiding circular
   * references.
   * @param {Object} node - Node to stringify
   * @returns {string} String representation of the node
   */
  debugStringify(node) {
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (key === "parent") return "[Circular:Parent]";
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      };
    };

    try {
      return JSON.stringify(node, getCircularReplacer(), 2);
    } catch (err) {
      return `[Unable to stringify: ${err.message}]`;
    }
  }

  /**
   * Generates HTML for a node, delegating to the appropriate generator.
   * @param {Object} node - Node to generate HTML for
   * @returns {string} Generated HTML
   */
  generateHTML(node) {
    if (this.options.debug) {
      console.log(`\n[HTMLGenerator] Generating HTML for node`);
      console.log(`[HTMLGenerator] Node type: "${node.type}"`);
      console.log("[HTMLGenerator] Node details:", StringUtils.safeStringify(node));
    }


    if (node.type === "element" && node.tag === "page") {
      if (this.options.debug) {
        console.log("[HTMLGenerator] Skipping page node - metadata only");
      }
      return "";
    }


    for (const generator of this.generators) {
      if (generator.canHandle(node)) {
        if (this.options.debug) {
          console.log(`[HTMLGenerator] Using ${generator.constructor.name} for node`);
        }
        return generator.generate(node);
      }
    }


    if (this.options.debug) {
      console.log(`[HTMLGenerator] No generator found for node type: ${node.type}`);
    }
    return "";
  }

  /**
   * Processes a link node, extracting the href attribute and converting it
   * to an internal link if it doesn't start with http:// or https://.
   *
   * If no href property is found, the default value of # is used.
   *
   * @param {Object} node - The link node to process
   * @returns {Object} - An object containing the final href value
   */
  processLink(node) {
    if (this.options.debug) {
      console.log("\n[HTMLGenerator] Processing link node");
      console.log(
        "[HTMLGenerator] Link properties:",
        this.debugStringify(node.props)
      );
    }

    const hrefProp = node.props.find((p) => p.startsWith("href:"));
    let href = "#";

    if (hrefProp) {
      let hrefTarget = hrefProp
        .substring(hrefProp.indexOf(":") + 1)
        .trim()
        .replace(/^"|"$/g, "");
      if (
        !hrefTarget.startsWith("http://") &&
        !hrefTarget.startsWith("https://")
      ) {
        hrefTarget = "/" + hrefTarget;
        if (this.options.debug) {
          console.log(
            `[HTMLGenerator] Converted to internal link: "${hrefTarget}"`
          );
        }
      } else {
        if (this.options.debug) {
          console.log(
            `[HTMLGenerator] External link detected: "${hrefTarget}"`
          );
        }
      }
      href = hrefTarget;
    } else {
      if (this.options.debug) {
        console.log(
          "[HTMLGenerator] No href property found, using default: '#'"
        );
      }
    }

    if (this.options.debug) {
      console.log(`[HTMLGenerator] Final href value: "${href}"`);
    }
    return { href };
  }

  /**
   * Generates the final HTML document as a string.
   *
   * @param {string} headContent - The HTML content to be placed within the <head> tag.
   * @param {string} bodyContent - The HTML content to be placed within the <body> tag.
   * @returns {string} - A complete HTML document containing the provided head and body content.
   */
  generateFinalHtml(headContent, bodyContent) {
    return this.htmlTemplate.generateDocument(headContent, bodyContent);
  }
}

module.exports = HTMLGenerator;
