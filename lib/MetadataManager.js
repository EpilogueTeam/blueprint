class MetadataManager {
/**
 * Initializes a new instance of the MetadataManager class.
 * 
 * @param {Object} options - Configuration options for the metadata manager.
 * @param {boolean} [options.debug=false] - Enables debug logging if true.
 * 
 * Sets up the pageMetadata object containing default title, faviconUrl, and an empty meta array.
 * If debug mode is enabled, logs the initialization options and the initial metadata state.
 */

  constructor(options = {}) {
    this.options = options;
    this.pageMetadata = {
      title: "",
      faviconUrl: "",
      meta: [],
    };
    if (this.options.debug) {
      console.log(
        "[MetadataManager] Initialized with options:",
        JSON.stringify(options, null, 2)
      );
      console.log(
        "[MetadataManager] Initial metadata state:",
        JSON.stringify(this.pageMetadata, null, 2)
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
   * Processes the metadata of a given node object, updating the internal page metadata state.
   * 
   * Iterates through the node's properties and children to extract metadata information such as
   * title, favicon, description, keywords, and author. This information is used to populate
   * the pageMetadata object.
   * 
   * For each property or child, it handles known metadata fields directly and adds custom
   * meta tags for any properties or children with a "meta-" prefix.
   * 
   * @param {Object} node - The node containing properties and children to process for metadata.
   */

  processPageMetadata(node) {
    if (this.options.debug) {
      console.log("\n[MetadataManager] Processing page metadata");
      console.log("[MetadataManager] Node details:", this.debugStringify(node));
    }

    if (node.props) {
      if (this.options.debug) {
        console.log(
          `\n[MetadataManager] Processing ${node.props.length} page properties`
        );
        console.log(
          "[MetadataManager] Properties:",
          this.debugStringify(node.props)
        );
      }
      node.props.forEach((prop) => {
        if (typeof prop === "object" && prop.name && prop.value) {
          if (this.options.debug) {
            console.log(
              `\n[MetadataManager] Processing property:`,
              this.debugStringify(prop)
            );
          }
          switch (prop.name) {
            case "title":
              this.pageMetadata.title = prop.value;
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Set page title: "${prop.value}"`
                );
              }
              break;
            case "favicon":
              this.pageMetadata.faviconUrl = prop.value;
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Set favicon URL: "${prop.value}"`
                );
              }
              break;
            case "description":
              this.pageMetadata.meta.push({
                name: "description",
                content: prop.value,
              });
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Added description meta tag: "${prop.value}"`
                );
              }
              break;
            case "keywords":
              this.pageMetadata.meta.push({
                name: "keywords",
                content: prop.value,
              });
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Added keywords meta tag: "${prop.value}"`
                );
              }
              break;
            case "author":
              this.pageMetadata.meta.push({
                name: "author",
                content: prop.value,
              });
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Added author meta tag: "${prop.value}"`
                );
              }
              break;
            default:
              if (prop.name.startsWith("meta-")) {
                const metaName = prop.name.substring(5);
                this.pageMetadata.meta.push({
                  name: metaName,
                  content: prop.value,
                });
                if (this.options.debug) {
                  console.log(
                    `[MetadataManager] Added custom meta tag - ${metaName}: "${prop.value}"`
                  );
                }
              } else if (this.options.debug) {
                console.log(
                  `[MetadataManager] Skipping unknown property: "${prop.name}"`
                );
              }
          }
        }
      });
    }

    if (node.children) {
      if (this.options.debug) {
        console.log(
          `\n[MetadataManager] Processing ${node.children.length} child nodes for metadata`
        );
      }
      node.children.forEach((child, index) => {
        if (child.tag) {
          if (this.options.debug) {
            console.log(
              `\n[MetadataManager] Processing child ${index + 1}/${
                node.children.length
              }`
            );
            console.log(`[MetadataManager] Child tag: "${child.tag}"`);
            console.log(
              "[MetadataManager] Child details:",
              this.debugStringify(child)
            );
          }

          let content = "";
/**
 * Recursively extracts the text content from a node tree.
 * 
 * This function traverses the node tree and concatenates the text content of
 * all text nodes. For non-text nodes, it recursively calls itself on the
 * children of that node.
 * 
 * @param {Object} node - The node for which to extract the text content
 * @return {string} The extracted text content
 */
          const getTextContent = (node) => {
            if (node.type === "text") return node.value;
            if (node.children) {
              return node.children.map(getTextContent).join("");
            }
            return "";
          };
          content = getTextContent(child);

          if (this.options.debug) {
            console.log(`[MetadataManager] Extracted content: "${content}"`);
          }

          switch (child.tag) {
            case "title":
              this.pageMetadata.title = content;
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Set page title from child: "${content}"`
                );
              }
              break;
            case "description":
              this.pageMetadata.meta.push({ name: "description", content });
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Added description meta tag from child: "${content}"`
                );
              }
              break;
            case "keywords":
              this.pageMetadata.meta.push({ name: "keywords", content });
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Added keywords meta tag from child: "${content}"`
                );
              }
              break;
            case "author":
              this.pageMetadata.meta.push({ name: "author", content });
              if (this.options.debug) {
                console.log(
                  `[MetadataManager] Added author meta tag from child: "${content}"`
                );
              }
              break;
            default:
              if (child.tag.startsWith("meta-")) {
                const metaName = child.tag.substring(5);
                this.pageMetadata.meta.push({ name: metaName, content });
                if (this.options.debug) {
                  console.log(
                    `[MetadataManager] Added custom meta tag from child - ${metaName}: "${content}"`
                  );
                }
              } else if (this.options.debug) {
                console.log(
                  `[MetadataManager] Skipping unknown child tag: "${child.tag}"`
                );
              }
          }
        }
      });
    }

    if (this.options.debug) {
      console.log("\n[MetadataManager] Metadata processing complete");
      console.log(
        "[MetadataManager] Final metadata state:",
        this.debugStringify(this.pageMetadata)
      );
    }
  }

  /**
   * Generates the HTML head content for the page, based on the metadata
   * previously collected. The generated content includes the page title,
   * favicon link, meta tags, and stylesheet link.
   *
   * @param {string} baseName - The base name of the page (used for the
   * stylesheet link)
   * @return {string} The generated HTML head content
   */
  generateHeadContent(baseName) {
    if (this.options.debug) {
      console.log("\n[MetadataManager] Generating head content");
      console.log(`[MetadataManager] Base name: "${baseName}"`);
    }

    let content = "";

    const title = this.pageMetadata.title || baseName;
    content += `    <title>${title}</title>\n`;
    if (this.options.debug) {
      console.log(`[MetadataManager] Added title tag: "${title}"`);
    }

    if (this.pageMetadata.faviconUrl) {
      content += `    <link rel="icon" href="${this.pageMetadata.faviconUrl}">\n`;
      if (this.options.debug) {
        console.log(
          `[MetadataManager] Added favicon link: "${this.pageMetadata.faviconUrl}"`
        );
      }
    }

    if (this.options.debug) {
      console.log(
        `[MetadataManager] Processing ${this.pageMetadata.meta.length} meta tags`
      );
    }
    this.pageMetadata.meta.forEach((meta, index) => {
      content += `    <meta name="${meta.name}" content="${meta.content}">\n`;
      if (this.options.debug) {
        console.log(
          `[MetadataManager] Added meta tag ${index + 1}: ${meta.name} = "${
            meta.content
          }"`
        );
      }
    });

    content += `    <link rel="stylesheet" href="${baseName}.css">\n`;
    if (this.options.debug) {
      console.log(`[MetadataManager] Added stylesheet link: "${baseName}.css"`);
      console.log("\n[MetadataManager] Head content generation complete");
      console.log("[MetadataManager] Generated content:", content);
    }

    return content;
  }
}

module.exports = MetadataManager;
