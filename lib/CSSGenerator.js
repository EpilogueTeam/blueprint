const { STYLE_MAPPINGS } = require("./mappings");

class CSSGenerator {
  /**
   * Creates a new CSS generator instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.minified=true] - Minify generated class names
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(options = {}) {
    this.options = options;
    this.cssRules = new Map();
    this.classCounter = 0;
    if (this.options.debug) {
      console.log(
        "[CSSGenerator] Initialized with options:",
        JSON.stringify(options, null, 2)
      );
    }
  }

  /**
   * Generates a class name for the given element type, based on the counter
   * and the minified option. If minified is true, the class name will be a
   * single lowercase letter (a-z), or a single uppercase letter (A-Z) if
   * the counter is between 26 and 51. Otherwise, it will be a complex
   * class name (e.g. "zabcdefg") with a counter starting from 52.
   *
   * @param {string} elementType - The type of the element for which to
   * generate a class name.
   * @return {string} The generated class name.
   */
  generateClassName(elementType) {
    if (this.options.debug) {
      console.log(
        `\n[CSSGenerator] Generating class name for element type: "${elementType}"`
      );
      console.log(`[CSSGenerator] Current class counter: ${this.classCounter}`);
    }

    let className;
    if (!this.options.minified) {
      className = `blueprint-${elementType}-${this.classCounter++}`;
      if (this.options.debug) {
        console.log(
          `[CSSGenerator] Generated readable class name: "${className}"`
        );
      }
      return className;
    }

    if (this.classCounter < 26) {
      className = String.fromCharCode(97 + this.classCounter++);
      if (this.options.debug) {
        console.log(
          `[CSSGenerator] Generated lowercase class name: "${className}" (counter: ${
            this.classCounter - 1
          })`
        );
      }
      return className;
    }

    if (this.classCounter < 52) {
      className = String.fromCharCode(65 + (this.classCounter++ - 26));
      if (this.options.debug) {
        console.log(
          `[CSSGenerator] Generated uppercase class name: "${className}" (counter: ${
            this.classCounter - 1
          })`
        );
      }
      return className;
    }

    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const base = chars.length;
    let num = this.classCounter++ - 52;
    let result = "";

    do {
      result = chars[num % base] + result;
      num = Math.floor(num / base);
    } while (num > 0);

    result = "z" + result;

    if (this.options.debug) {
      console.log(
        `[CSSGenerator] Generated complex class name: "${result}" (counter: ${
          this.classCounter - 1
        })`
      );
    }

    return result;
  }

  /**
   * Converts a node to CSS properties, using the style mappings to process
   * the node's properties. The generated CSS properties are returned as a
   * Map, where each key is a CSS property name and each value is the value
   * for that property.
   *
   * @param {Object} node - The node to convert
   * @return {Object} - The generated CSS properties and nested rules
   */
  nodeToCSSProperties(node) {
    if (this.options.debug) {
      console.log(`\n[CSSGenerator] Converting node to CSS properties`);
      console.log(`[CSSGenerator] Node tag: "${node.tag}"`);
      console.log("[CSSGenerator] Node properties:", node.props);
    }

    const cssProps = new Map();
    const nestedRules = new Map();

    node.props.forEach((prop) => {
      if (typeof prop === "object") {
        if (this.options.debug) {
          console.log(`[CSSGenerator] Skipping object property:`, prop);
        }
        return;
      }

      const [name, value] = prop.split(/[-:]/);
      if (this.options.debug) {
        console.log(
          `\n[CSSGenerator] Processing property - name: "${name}", value: "${value}"`
        );
      }
      // This is for customization of css properties

      if (name === "width" && !isNaN(value)) {
        cssProps.set("width", `${value}% !important`);
        cssProps.set("max-width", "none !important");
        if (this.options.debug) {
          console.log(
            `[CSSGenerator] Set width: ${value}% !important and max-width: none !important`
          );
        }
        return;
      }

      if (name === "height" && !isNaN(value)) {
        cssProps.set("height", `${value}% !important`);
        cssProps.set("max-height", "none !important");
        if (this.options.debug) {
          console.log(
            `[CSSGenerator] Set height: ${value}% !important and max-height: none !important`
          );
        }
        return;
      }

      if (name === "padding" && !isNaN(value)) {
        cssProps.set("padding", `${value}px !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set padding: ${value}px !important`);
        }
        return;
      }

      if (name === "margin" && !isNaN(value)) {
        cssProps.set("margin", `${value}px !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set margin: ${value}px !important`);
        }
        return;
      }

      if (name === "marginTop" && !isNaN(value)) {
        cssProps.set("margin-top", `${value}px !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set margin-top: ${value}px !important`);
        }
        return;
      }

      if (name === "marginBottom" && !isNaN(value)) {
        cssProps.set("margin-bottom", `${value}px !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set margin-bottom: ${value}px !important`);
        }
        return;
      }

      if (name === "marginLeft" && !isNaN(value)) {
        cssProps.set("margin-left", `${value}px !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set margin-left: ${value}px !important`);
        }
        return;
      }

      if (name === "marginRight" && !isNaN(value)) {
        cssProps.set("margin-right", `${value}px !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set margin-right: ${value}px !important`);
        }
        return;
      }

      if (name === "color") {
        cssProps.set("color", `${value} !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set color: ${value} !important`);
        }
        return;
      }

      if (name === "backgroundColor") {
        cssProps.set("background-color", `${value} !important`);
        if (this.options.debug) {
          console.log(`[CSSGenerator] Set background-color: ${value} !important`);
        }
        return;
      }

      const style = STYLE_MAPPINGS[name];
      if (style) {
        if (this.options.debug) {
          console.log(`[CSSGenerator] Processing style mapping for: "${name}"`);
        }
        Object.entries(style).forEach(([key, baseValue]) => {
          if (typeof baseValue === "object") {
            if (key.startsWith(":") || key.startsWith(">")) {
              nestedRules.set(key, baseValue);
              if (this.options.debug) {
                console.log(
                  `[CSSGenerator] Added nested rule: "${key}" =>`,
                  baseValue
                );
              }
            } else {
              let finalValue = baseValue;
              if (value && key === "gridTemplateColumns" && !isNaN(value)) {
                finalValue = `repeat(${value}, 1fr)`;
                if (this.options.debug) {
                  console.log(
                    `[CSSGenerator] Set grid template columns: ${finalValue}`
                  );
                }
              }
              cssProps.set(key, finalValue);
              if (this.options.debug) {
                console.log(
                  `[CSSGenerator] Set CSS property: "${key}" = "${finalValue}"`
                );
              }
            }
          } else {
            let finalValue = baseValue;
            if (value && key === "gridTemplateColumns" && !isNaN(value)) {
              finalValue = `repeat(${value}, 1fr)`;
              if (this.options.debug) {
                console.log(
                  `[CSSGenerator] Set grid template columns: ${finalValue}`
                );
              }
            }
            cssProps.set(key, finalValue);
            if (this.options.debug) {
              console.log(
                `[CSSGenerator] Set CSS property: "${key}" = "${finalValue}"`
              );
            }
          }
        });
      }
    });

    if (this.options.debug) {
      console.log("\n[CSSGenerator] CSS properties generation complete");
      console.log(`[CSSGenerator] Generated ${cssProps.size} CSS properties`);
      console.log(`[CSSGenerator] Generated ${nestedRules.size} nested rules`);
    }

    return { cssProps, nestedRules };
  }

/**
 * Generates the CSS code for the given style mappings. If minified is true,
 * the generated CSS will be minified. Otherwise, it will be formatted with
 * indentation and newlines.
 *
 * @return {string} The generated CSS code
 */
  generateCSS() {
    if (this.options.debug) {
      console.log("\n[CSSGenerator] Starting CSS generation");
      console.log(`[CSSGenerator] Processing ${this.cssRules.size} rule sets`);
    }

    /**
     * Converts a camelCase string to kebab-case (lowercase with hyphens
     * separating words)
     *
     * @param {string} str The string to convert
     * @return {string} The converted string
     */

    const toKebabCase = (str) =>
      str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

    let css = "";
    this.cssRules.forEach((props, selector) => {
      if (props.cssProps.size > 0) {
        if (this.options.debug) {
          console.log(
            `\n[CSSGenerator] Generating CSS for selector: "${selector}"`
          );
          console.log(
            `[CSSGenerator] Properties count: ${props.cssProps.size}`
          );
        }
        css += `${selector} {${this.options.minified ? "" : "\n"}`;
        props.cssProps.forEach((value, prop) => {
          const cssProperty = toKebabCase(prop);
          css += `${
            this.options.minified ? "" : "  "
          }${cssProperty}: ${value};${this.options.minified ? "" : "\n"}`;
          if (this.options.debug) {
            console.log(
              `[CSSGenerator] Added property: ${cssProperty}: ${value}`
            );
          }
        });
        css += `}${this.options.minified ? "" : "\n"}`;
      }

      if (props.nestedRules.size > 0) {
        if (this.options.debug) {
          console.log(
            `\n[CSSGenerator] Processing ${props.nestedRules.size} nested rules for "${selector}"`
          );
        }
        props.nestedRules.forEach((rules, nestedSelector) => {
          const fullSelector = nestedSelector.startsWith(">")
            ? `${selector} ${nestedSelector}`
            : `${selector}${nestedSelector}`;

          if (this.options.debug) {
            console.log(
              `[CSSGenerator] Generating nested selector: "${fullSelector}"`
            );
          }

          css += `${fullSelector} {${this.options.minified ? "" : "\n"}`;
          Object.entries(rules).forEach(([prop, value]) => {
            if (typeof value === "object") {
              const pseudoSelector = `${fullSelector}${prop}`;
              if (this.options.debug) {
                console.log(
                  `[CSSGenerator] Generating pseudo-selector: "${pseudoSelector}"`
                );
              }
              css += `}${this.options.minified ? "" : "\n"}${pseudoSelector} {${
                this.options.minified ? "" : "\n"
              }`;
              Object.entries(value).forEach(([nestedProp, nestedValue]) => {
                const cssProperty = toKebabCase(nestedProp);
                css += `${
                  this.options.minified ? "" : "  "
                }${cssProperty}: ${nestedValue};${
                  this.options.minified ? "" : "\n"
                }`;
                if (this.options.debug) {
                  console.log(
                    `[CSSGenerator] Added nested property: ${cssProperty}: ${nestedValue}`
                  );
                }
              });
            } else {
              const cssProperty = toKebabCase(prop);
              css += `${
                this.options.minified ? "" : "  "
              }${cssProperty}: ${value};${this.options.minified ? "" : "\n"}`;
              if (this.options.debug) {
                console.log(
                  `[CSSGenerator] Added property: ${cssProperty}: ${value}`
                );
              }
            }
          });
          css += `}${this.options.minified ? "" : "\n"}`;
        });
      }
    });

    if (this.options.debug) {
      console.log("\n[CSSGenerator] CSS generation complete");
      console.log(
        `[CSSGenerator] Generated ${css.split("\n").length} lines of CSS`
      );
    }

    return css;
  }
}

module.exports = CSSGenerator;
