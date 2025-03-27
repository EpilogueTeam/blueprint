const BlueprintError = require("./BlueprintError");
const { ELEMENT_MAPPINGS } = require("./mappings");

class ASTBuilder {
  /**
   * Initializes a new instance of the ASTBuilder class.
   *
   * @param {Object} options - Configuration options for the ASTBuilder.
   * @param {boolean} [options.debug=false] - If true, enables debug logging for the builder.
   */

  constructor(options = {}) {
    this.options = options;
    if (this.options.debug) {
      console.log(
        "[ASTBuilder] Initialized with options:",
        JSON.stringify(options, null, 2)
      );
    }
  }

  /**
   * Converts a node object into a JSON string representation.
   * Handles circular references by replacing them with a predefined string.
   *
   * @param {Object} node - The node object to stringify.
   * @returns {string} - The JSON string representation of the node.
   *                     If unable to stringify, returns an error message.
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
   * Constructs an Abstract Syntax Tree (AST) from a sequence of tokens.
   *
   * This function iterates over the provided tokens to build a hierarchical
   * AST structure. It identifies elements, their properties, and any nested
   * child elements, converting them into structured nodes. Each node is
   * represented as an object containing type, tag, properties, children,
   * and position information (line and column).
   *
   * Throws an error if unexpected tokens are encountered or if there are
   * mismatched braces.
   *
   * @param {Array} tokens - The list of tokens to be parsed into an AST.
   * @returns {Object} - The constructed AST root node with its children.
   *                     Each child represents either an element or text node.
   * @throws {BlueprintError} - If unexpected tokens or structural issues are found.
   */

  buildAST(tokens) {
    if (this.options.debug) {
      console.log("\n[ASTBuilder] Starting AST construction");
      console.log(`[ASTBuilder] Processing ${tokens.length} tokens`);
      console.log(
        "[ASTBuilder] First few tokens:",
        tokens
          .slice(0, 3)
          .map((t) => this.debugStringify(t))
          .join(", ")
      );
    }

    let current = 0;

    /**
     * Walks the token list to construct a hierarchical AST structure.
     *
     * This function is responsible for processing each token and constructing
     * the corresponding node in the AST. It handles elements, their properties,
     * and any nested child elements, converting them into structured nodes.
     * Each node is represented as an object containing type, tag, properties,
     * children, and position information (line and column).
     *
     * Throws an error if unexpected tokens are encountered or if there are
     * mismatched braces.
     *
     * @returns {Object} - The constructed AST node with its children.
     *                     Each child represents either an element or text node.
     * @throws {BlueprintError} - If unexpected tokens or structural issues are found.
     */
    const walk = () => {
      if (this.options.debug) {
        console.log(
          `\n[ASTBuilder] Walking tokens at position ${current}/${tokens.length}`
        );
        console.log(
          "[ASTBuilder] Current token:",
          this.debugStringify(tokens[current])
        );
      }

      let token = tokens[current];

      if (!token) {
        if (this.options.debug) {
          console.log(
            "[ASTBuilder] Unexpected end of input while walking tokens"
          );
          console.log(
            "[ASTBuilder] Last processed token:",
            this.debugStringify(tokens[current - 1])
          );
        }
        throw new BlueprintError(
          "Unexpected end of input",
          tokens[tokens.length - 1]?.line || 1,
          tokens[tokens.length - 1]?.column || 0
        );
      }

      if (token.type === "client" || token.type === "server") {
        if (this.options.debug) {
          console.log(
            `\n[ASTBuilder] Processing ${token.type} block at line ${token.line}, column ${token.column}`
          );
        }

        const node = {
          type: token.type,
          script: token.value,
          line: token.line,
          column: token.column,
        };

        if (token.type === "server" && token.params) {
          node.params = token.params;
          if (this.options.debug) {
            console.log(
              `[ASTBuilder] Server block parameters: ${node.params.join(", ")}`
            );
          }
        }

        if (this.options.debug) {
          console.log(`[ASTBuilder] Created node for ${token.type} block`);
          console.log(
            "[ASTBuilder] Script content (first 50 chars):",
            node.script.substring(0, 50) + (node.script.length > 50 ? "..." : "")
          );
        }

        current++;
        return node;
      }

      if (token.type === "identifier") {
        if (this.options.debug) {
          console.log(
            `\n[ASTBuilder] Processing identifier: "${token.value}" at line ${token.line}, column ${token.column}`
          );
        }

        const elementType = token.value;
        if (!ELEMENT_MAPPINGS[elementType]) {
          if (this.options.debug) {
            console.log(
              `[ASTBuilder] Error: Unknown element type "${elementType}"`
            );
            console.log(
              "[ASTBuilder] Available element types:",
              Object.keys(ELEMENT_MAPPINGS).join(", ")
            );
          }
          throw new BlueprintError(
            `Unknown element type: ${elementType}`,
            token.line,
            token.column
          );
        }

        const mapping = ELEMENT_MAPPINGS[elementType];
        const node = {
          type: "element",
          tag: elementType,
          props:
            elementType === "page" ? [] : [...(mapping.defaultProps || [])],
          children: [],
          line: token.line,
          column: token.column,
        };

        if (this.options.debug) {
          console.log(`[ASTBuilder] Created node for element "${elementType}"`);
          console.log(
            "[ASTBuilder] Initial node state:",
            this.debugStringify(node)
          );
        }

        current++;

        if (
          current < tokens.length &&
          tokens[current].type === "props"
        ) {
          const props = tokens[current].value.split(",").map((p) => p.trim());
          if (this.options.debug) {
            console.log(
              `[ASTBuilder] Processing ${props.length} properties for "${elementType}"`
            );
            console.log("[ASTBuilder] Properties:", props);
          }

          props.forEach((prop) => {
            const [name, ...valueParts] = prop.split(":");
            const value = valueParts.join(":").trim();
            if (this.options.debug) {
              console.log(
                `[ASTBuilder] Processing property - name: "${name}", value: "${value}"`
              );
            }

            if (value) {
              if (elementType === "page") {
                const processedProp = {
                  name,
                  value: value.replace(/^"|"$/g, ""),
                };
                node.props.push(processedProp);
                if (this.options.debug) {
                  console.log(
                    `[ASTBuilder] Added page property:`,
                    processedProp
                  );
                }
              } else {
                node.props.push(`${name}:${value}`);
                if (this.options.debug) {
                  console.log(
                    `[ASTBuilder] Added property: "${name}:${value}"`
                  );
                }
              }
            } else {
              node.props.push(name);
              if (this.options.debug) {
                console.log(`[ASTBuilder] Added flag property: "${name}"`);
              }
            }
          });
          current++;
        }

        if (
          current < tokens.length &&
          tokens[current].type === "brace" &&
          tokens[current].value === "{"
        ) {
          if (this.options.debug) {
            console.log(
              `\n[ASTBuilder] Processing child elements for "${elementType}"`
            );
          }
          current++;

          while (
            current < tokens.length &&
            !(tokens[current].type === "brace" && tokens[current].value === "}")
          ) {
            if (this.options.debug) {
              console.log(
                `[ASTBuilder] Processing child at position ${current}`
              );
            }
            const child = walk();
            child.parent = node;
            node.children.push(child);
            if (this.options.debug) {
              console.log(
                `[ASTBuilder] Added child to "${elementType}":`,
                this.debugStringify(child)
              );
            }
          }

          if (current >= tokens.length) {
            if (this.options.debug) {
              console.log(
                `[ASTBuilder] Error: Missing closing brace for "${elementType}"`
              );
            }
            throw new BlueprintError(
              "Missing closing brace",
              node.line,
              node.column
            );
          }

          current++;
        }

        if (this.options.debug) {
          console.log(`[ASTBuilder] Completed node for "${elementType}"`);
          console.log(
            "[ASTBuilder] Final node state:",
            this.debugStringify(node)
          );
        }

        return node;
      }

      if (token.type === "text") {
        if (this.options.debug) {
          console.log(
            `[ASTBuilder] Processing text node at line ${token.line}, column ${token.column}`
          );
          console.log(`[ASTBuilder] Text content: "${token.value}"`);
        }
        current++;
        return {
          type: "text",
          value: token.value,
          line: token.line,
          column: token.column,
        };
      }

      if (this.options.debug) {
        console.log(`[ASTBuilder] Error: Unexpected token type: ${token.type}`);
        console.log("[ASTBuilder] Token details:", this.debugStringify(token));
      }
      throw new BlueprintError(
        `Unexpected token type: ${token.type}`,
        token.line,
        token.column
      );
    };

    const ast = {
      type: "root",
      children: [],
    };

    while (current < tokens.length) {
      if (this.options.debug) {
        console.log(
          `\n[ASTBuilder] Processing root-level token at position ${current}`
        );
      }
      ast.children.push(walk());
    }

    if (this.options.debug) {
      console.log("\n[ASTBuilder] AST construction complete");
      console.log(`[ASTBuilder] Total nodes: ${ast.children.length}`);
      console.log(
        "[ASTBuilder] Root children types:",
        ast.children.map((c) => c.type).join(", ")
      );
    }

    return ast;
  }
}

module.exports = ASTBuilder;
