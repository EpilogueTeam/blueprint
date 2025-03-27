const BlueprintError = require("./BlueprintError");

class TokenParser {

  /**
   * Creates a new TokenParser instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(options = {}) {
    this.options = options;
    if (this.options.debug) {
      console.log(
        "[TokenParser] Initialized with options:",
        JSON.stringify(options, null, 2)
      );
    }
  }

  /**
   * Tokenizes the input string into an array of tokens.
   * Tokens can be of the following types:
   * - `identifier`: A sequence of letters, numbers, underscores, and hyphens.
   *                  Represents a CSS selector or a property name.
   * - `props`: A sequence of characters enclosed in parentheses.
   *            Represents a list of CSS properties.
   * - `text`: A sequence of characters enclosed in quotes.
   *           Represents a string of text.
   * - `brace`: A single character, either `{` or `}`.
   *            Represents a brace in the input.
   *
   * @param {string} input - Input string to tokenize
   * @returns {Array<Object>} - Array of tokens
   * @throws {BlueprintError} - If the input contains invalid syntax
   */
  tokenize(input) {
    if (this.options.debug) {
      console.log("\n[TokenParser] Starting tokenization");
      console.log(`[TokenParser] Input length: ${input.length} characters`);
      console.log(`[TokenParser] First 100 chars: ${input.slice(0, 100)}...`);
    }

    const tokens = [];
    let current = 0;
    let line = 1;
    let column = 1;
    const startTime = Date.now();
    const TIMEOUT_MS = 5000;

    while (current < input.length) {
      let char = input[current];

      if (Date.now() - startTime > TIMEOUT_MS) {
        if (this.options.debug) {
          console.log(
            `[TokenParser] Tokenization timeout at position ${current}, line ${line}, column ${column}`
          );
        }
        throw new BlueprintError(
          "Parsing timeout - check for unclosed brackets or quotes",
          line,
          column
        );
      }

      if (char === "\n") {
        if (this.options.debug) {
          console.log(
            `[TokenParser] Line break at position ${current}, moving to line ${
              line + 1
            }`
          );
        }
        line++;
        column = 1;
        current++;
        continue;
      }

      if (/\s/.test(char)) {
        column++;
        current++;
        continue;
      }

      if (char === "/" && input[current + 1] === "/") {
        if (this.options.debug) {
          console.log(
            `[TokenParser] Comment found at line ${line}, column ${column}`
          );
          const commentEnd = input.indexOf("\n", current);
          const comment = input.slice(
            current,
            commentEnd !== -1 ? commentEnd : undefined
          );
          console.log(`[TokenParser] Comment content: ${comment}`);
        }
        while (current < input.length && input[current] !== "\n") {
          current++;
          column++;
        }
        continue;
      }

      if (char === "@") {
        const startPos = current;
        const startColumn = column;
        const startLine = line;
        current++;
        column++;
        
        let blockType = "";
        char = input[current];
        
        while (current < input.length && /[a-zA-Z]/.test(char)) {
          blockType += char;
          current++;
          column++;
          char = input[current];
        }
        
        if (blockType === "client" || blockType === "server") {
          if (this.options.debug) {
            console.log(`[TokenParser] ${blockType} block found at line ${startLine}, column ${startColumn}`);
          }
          
          while (current < input.length && /\s/.test(char)) {
            if (char === "\n") {
              line++;
              column = 1;
            } else {
              column++;
            }
            current++;
            char = input[current];
          }
          
          let params = [];
          if (blockType === "server" && char === "(") {
            current++;
            column++;
            let paramString = "";
            let depth = 1;
            
            while (current < input.length && depth > 0) {
              char = input[current];
              
              if (char === "(") depth++;
              if (char === ")") depth--;
              
              if (depth === 0) break;
              
              paramString += char;
              if (char === "\n") {
                line++;
                column = 1;
              } else {
                column++;
              }
              current++;
            }
            
            current++;
            column++;
            
            params = paramString.split(",").map(p => p.trim()).filter(p => p);
            
            if (this.options.debug) {
              console.log(`[TokenParser] Server block parameters: ${params.join(", ")}`);
            }
            
            char = input[current];
            while (current < input.length && /\s/.test(char)) {
              if (char === "\n") {
                line++;
                column = 1;
              } else {
                column++;
              }
              current++;
              char = input[current];
            }
          }
          
          if (char === "{") {
            current++;
            column++;
            let script = "";
            let braceCount = 1;
            
            while (current < input.length && braceCount > 0) {
              char = input[current];
              
              if (char === "{") braceCount++;
              if (char === "}") braceCount--;
              
              if (braceCount === 0) break;
              
              script += char;
              if (char === "\n") {
                line++;
                column = 1;
              } else {
                column++;
              }
              current++;
            }
            
            current++;
            column++;
            
            tokens.push({
              type: blockType,
              value: script.trim(),
              params: params,
              line: startLine,
              column: startColumn,
            });
            
            if (this.options.debug) {
              console.log(`[TokenParser] ${blockType} block script: "${script.trim().substring(0, 50)}..."`);
            }
            
            continue;
          } else {
            throw new BlueprintError(
              `Expected opening brace after @${blockType}${params.length ? '(...)' : ''}`,
              line,
              column
            );
          }
        } else {
          throw new BlueprintError(
            `Unknown block type: @${blockType}`,
            startLine,
            startColumn
          );
        }
      }

      if (/[a-zA-Z]/.test(char)) {
        let value = "";
        const startColumn = column;
        const startPos = current;

        while (current < input.length && /[a-zA-Z0-9_-]/.test(char)) {
          value += char;
          current++;
          column++;
          char = input[current];
        }

        if (this.options.debug) {
          console.log(
            `[TokenParser] Identifier found at line ${line}, column ${startColumn}`
          );
          console.log(`[TokenParser] Identifier value: "${value}"`);
          console.log(
            `[TokenParser] Context: ...${input.slice(
              Math.max(0, startPos - 10),
              startPos
            )}[${value}]${input.slice(current, current + 10)}...`
          );
        }

        tokens.push({
          type: "identifier",
          value,
          line,
          column: startColumn,
        });
        continue;
      }

      if (char === "(") {
        if (this.options.debug) {
          console.log(`[DEBUG] Starting property list at position ${current}`);
        }

        const startColumn = column;
        let value = "";
        let depth = 1;
        let propLine = line;
        let propColumn = column;
        current++;
        column++;
        const propStartPos = current;

        while (current < input.length && depth > 0) {
          if (current - propStartPos > 1000) {
            if (this.options.debug) {
              console.log("[DEBUG] Property list too long or unclosed");
            }
            throw new BlueprintError(
              "Property list too long or unclosed parenthesis",
              propLine,
              propColumn
            );
          }

          char = input[current];

          if (char === "(") depth++;
          if (char === ")") depth--;

          if (depth === 0) break;

          value += char;
          if (char === "\n") {
            line++;
            column = 1;
          } else {
            column++;
          }
          current++;
        }

        if (depth > 0) {
          if (this.options.debug) {
            console.log("[DEBUG] Unclosed parenthesis detected");
          }
          throw new BlueprintError(
            "Unclosed parenthesis in property list",
            propLine,
            propColumn
          );
        }

        tokens.push({
          type: "props",
          value: value.trim(),
          line,
          column: startColumn,
        });

        current++;
        column++;
        continue;
      }

      if (char === '"' || char === "'") {
        if (this.options.debug) {
          console.log(`[DEBUG] Starting string at position ${current}`);
        }

        const startColumn = column;
        const startLine = line;
        const quote = char;
        let value = "";
        const stringStartPos = current;

        current++;
        column++;

        while (current < input.length) {
          if (current - stringStartPos > 1000) {
            if (this.options.debug) {
              console.log("[DEBUG] String too long or unclosed");
            }
            throw new BlueprintError(
              "String too long or unclosed quote",
              startLine,
              startColumn
            );
          }

          char = input[current];

          if (char === "\n") {
            line++;
            column = 1;
            value += char;
          } else if (char === quote && input[current - 1] !== "\\") {
            break;
          } else {
            value += char;
            column++;
          }

          current++;
        }

        tokens.push({
          type: "text",
          value,
          line: startLine,
          column: startColumn,
        });

        current++;
        column++;
        continue;
      }

      if (char === "{" || char === "}") {
        if (this.options.debug) {
          console.log(`[DEBUG] Found brace: ${char} at position ${current}`);
        }

        tokens.push({
          type: "brace",
          value: char,
          line,
          column,
        });
        current++;
        column++;
        continue;
      }

      if (this.options.debug) {
        console.log(
          `[DEBUG] Unexpected character at position ${current}: "${char}"`
        );
      }
      throw new BlueprintError(`Unexpected character: ${char}`, line, column);
    }

    if (this.options.debug) {
      console.log("\n[TokenParser] Tokenization complete");
      console.log(`[TokenParser] Total tokens generated: ${tokens.length}`);
      console.log(
        "[TokenParser] Token summary:",
        tokens.map((t) => `${t.type}:${t.value}`).join(", ")
      );
    }

    this.validateBraces(tokens);
    return tokens;
  }

  /**
   * Validates that all braces in the token stream are properly matched.
   * This function walks the token stream, counting the number of open and
   * close braces. If it encounters an unmatched brace, it throws an error.
   * If it encounters an extra closing brace, it throws an error.
   * @throws {BlueprintError} - If there is a brace mismatch
   */
  validateBraces(tokens) {
    let braceCount = 0;
    let lastOpenBrace = { line: 1, column: 1 };
    const braceStack = [];

    if (this.options.debug) {
      console.log("\n[TokenParser] Starting brace validation");
    }

    for (const token of tokens) {
      if (token.type === "brace") {
        if (token.value === "{") {
          braceCount++;
          braceStack.push({ line: token.line, column: token.column });
          lastOpenBrace = { line: token.line, column: token.column };
          if (this.options.debug) {
            console.log(
              `[TokenParser] Opening brace at line ${token.line}, column ${token.column}, depth: ${braceCount}`
            );
          }
        } else if (token.value === "}") {
          braceCount--;
          const matchingOpen = braceStack.pop();
          if (this.options.debug) {
            console.log(
              `[TokenParser] Closing brace at line ${token.line}, column ${token.column}, depth: ${braceCount}`
            );
            if (matchingOpen) {
              console.log(
                `[TokenParser] Matches opening brace at line ${matchingOpen.line}, column ${matchingOpen.column}`
              );
            }
          }
        }
      }
    }

    if (braceCount !== 0) {
      if (this.options.debug) {
        console.log(
          `[TokenParser] Brace mismatch detected: ${
            braceCount > 0 ? "unclosed" : "extra"
          } braces`
        );
        console.log(`[TokenParser] Brace stack:`, braceStack);
      }
      if (braceCount > 0) {
        throw new BlueprintError(
          "Unclosed brace",
          lastOpenBrace.line,
          lastOpenBrace.column
        );
      } else {
        throw new BlueprintError(
          "Extra closing brace",
          tokens[tokens.length - 1].line,
          tokens[tokens.length - 1].column
        );
      }
    }

    if (this.options.debug) {
      console.log("[TokenParser] Brace validation complete - all braces match");
    }
  }
}

module.exports = TokenParser;
