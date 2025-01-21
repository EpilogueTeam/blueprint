const { ELEMENT_MAPPINGS } = require("./mappings");

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
    if (this.options.debug) {
      console.log(
        "[HTMLGenerator] Initialized with options:",
        JSON.stringify(options, null, 2)
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
   * Converts a node to a string of HTML.
   * @param {Object} node - Node to generate HTML for
   * @returns {string} Generated HTML
   */
  generateHTML(node) {
    if (this.options.debug) {
      console.log(`\n[HTMLGenerator] Generating HTML for node`);
      console.log(`[HTMLGenerator] Node type: "${node.type}"`);
      console.log("[HTMLGenerator] Node details:", this.debugStringify(node));
    }

    if (node.type === "text") {
      if (node.parent?.tag === "codeblock") {
        if (this.options.debug) {
          console.log("[HTMLGenerator] Rendering raw text for codeblock");
          console.log(`[HTMLGenerator] Raw text content: "${node.value}"`);
        }
        return node.value;
      }
      const escapedText = node.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      if (this.options.debug) {
        console.log("[HTMLGenerator] Generated escaped text");
        console.log(`[HTMLGenerator] Original: "${node.value}"`);
        console.log(`[HTMLGenerator] Escaped: "${escapedText}"`);
      }
      return escapedText;
    }

    let html = "";
    if (node.type === "element") {
      if (node.tag === "page") {
        if (this.options.debug) {
          console.log("[HTMLGenerator] Skipping page node - metadata only");
        }
        return "";
      }

      const mapping = ELEMENT_MAPPINGS[node.tag];
      let tag = mapping ? mapping.tag : "div";
      const className = this.cssGenerator.generateClassName(node.tag);
      const { cssProps, nestedRules } =
        this.cssGenerator.nodeToCSSProperties(node);

      if (this.options.debug) {
        console.log(`\n[HTMLGenerator] Processing element node`);
        console.log(`[HTMLGenerator] Tag: "${node.tag}" -> "${tag}"`);
        console.log(`[HTMLGenerator] Generated class name: "${className}"`);
        console.log(
          "[HTMLGenerator] CSS properties:",
          this.debugStringify(Object.fromEntries(cssProps))
        );
        console.log(
          "[HTMLGenerator] Nested rules:",
          this.debugStringify(Object.fromEntries(nestedRules))
        );
      }

      let attributes = "";
      if (tag === "input") {
        if (node.tag === "checkbox") {
          attributes = ' type="checkbox"';
        } else if (node.tag === "radio") {
          attributes = ' type="radio"';
        } else if (node.tag === "switch") {
          attributes = ' type="checkbox" role="switch"';
        } else if (node.tag === "slider") {
          attributes = ' type="range"';
        }
        if (this.options.debug) {
          console.log(
            `[HTMLGenerator] Added input attributes: "${attributes}"`
          );
        }
      }

      if (node.tag === "media") {
        const srcProp = node.props.find((p) => p.startsWith("src:"));
        const typeProp = node.props.find((p) => p.startsWith("type:"));

        if (!srcProp) {
          throw new BlueprintError("Media element requires src property", node.line, node.column);
        }

        const src = srcProp.substring(srcProp.indexOf(":") + 1).trim();
        const type = typeProp ? typeProp.substring(typeProp.indexOf(":") + 1).trim() : "img";

        if (type === "video") {
          tag = "video";
          attributes = ` src="${src}" controls`;
        } else {
          tag = "img";
          attributes = ` src="${src}" alt="${node.children.map(child => this.generateHTML(child)).join("")}"`;
        }
      }

      if (node.tag === "link") {
        const linkInfo = this.processLink(node);
        attributes += ` href="${linkInfo.href}"`;
        if (
          linkInfo.href.startsWith("http://") ||
          linkInfo.href.startsWith("https://")
        ) {
          attributes += ` target="_blank" rel="noopener noreferrer"`;
          if (this.options.debug) {
            console.log(
              `[HTMLGenerator] Added external link attributes for: ${linkInfo.href}`
            );
          }
        } else {
          if (this.options.debug) {
            console.log(
              `[HTMLGenerator] Added internal link attributes for: ${linkInfo.href}`
            );
          }
        }
      }

      if (
        node.props.find((p) => typeof p === "string" && p.startsWith("data-"))
      ) {
        const dataProps = node.props.filter(
          (p) => typeof p === "string" && p.startsWith("data-")
        );
        attributes += " " + dataProps.map((p) => `${p}`).join(" ");
        if (this.options.debug) {
          console.log(
            `[HTMLGenerator] Added data attributes:`,
            this.debugStringify(dataProps)
          );
        }
      }

      this.cssGenerator.cssRules.set(`.${className}`, {
        cssProps,
        nestedRules,
      });
      if (this.options.debug) {
        console.log(
          `[HTMLGenerator] Registered CSS rules for class: .${className}`
        );
      }

      if (node.tag === "button" || node.tag.startsWith("button-")) {
        if (node.parent?.tag === "link") {
          const linkInfo = this.processLink(node.parent);
          if (
            linkInfo.href.startsWith("http://") ||
            linkInfo.href.startsWith("https://")
          ) {
            attributes += ` onclick="window.open('${linkInfo.href}', '_blank', 'noopener,noreferrer')"`;
            if (this.options.debug) {
              console.log(
                `[HTMLGenerator] Added external button click handler for: ${linkInfo.href}`
              );
            }
          } else {
            attributes += ` onclick="window.location.href='${linkInfo.href}'"`;
            if (this.options.debug) {
              console.log(
                `[HTMLGenerator] Added internal button click handler for: ${linkInfo.href}`
              );
            }
          }
        }
        html += `<button class="${className}"${attributes}>${this.options.minified ? "" : "\n"
          }`;
        if (this.options.debug) {
          console.log(
            `[HTMLGenerator] Generated button opening tag with attributes:`,
            this.debugStringify({ class: className, ...attributes })
          );
        }
        node.children.forEach((child) => {
          child.parent = node;
          html += this.generateHTML(child);
        });
        html += `${this.options.minified ? "" : "\n"}</button>${this.options.minified ? "" : "\n"
          }`;
      } else if (
        node.tag === "link" &&
        node.children.length === 1 &&
        (node.children[0].tag === "button" ||
          node.children[0].tag?.startsWith("button-"))
      ) {
        if (this.options.debug) {
          console.log(
            "[HTMLGenerator] Processing button inside link - using button's HTML"
          );
        }
        node.children[0].parent = node;
        html += this.generateHTML(node.children[0]);
      } else {
        html += `<${tag} class="${className}"${attributes}>${this.options.minified ? "" : "\n"
          }`;
        if (this.options.debug) {
          console.log(
            `[HTMLGenerator] Generated opening tag: <${tag}> with attributes:`,
            this.debugStringify({ class: className, ...attributes })
          );
        }
        node.children.forEach((child) => {
          child.parent = node;
          html += this.generateHTML(child);
        });
        html += `${this.options.minified ? "" : "\n"}</${tag}>${this.options.minified ? "" : "\n"
          }`;
        if (this.options.debug) {
          console.log(`[HTMLGenerator] Completed element: ${tag}`);
        }
      }
    } else if (node.type === "root") {
      if (this.options.debug) {
        console.log(
          `[HTMLGenerator] Processing root node with ${node.children.length} children`
        );
      }
      node.children.forEach((child, index) => {
        if (this.options.debug) {
          console.log(
            `[HTMLGenerator] Processing root child ${index + 1}/${node.children.length
            }`
          );
        }
        html += this.generateHTML(child);
      });
    }

    if (this.options.debug) {
      console.log("[HTMLGenerator] Generated HTML:", html);
    }
    return html;
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
        !hrefTarget.startsWith("https://") &&
        !hrefTarget.startsWith("mailto:")
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
            `[HTMLGenerator] Detected link: "${hrefTarget}"`
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
}

module.exports = HTMLGenerator;
