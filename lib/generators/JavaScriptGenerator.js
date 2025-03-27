const StringUtils = require("../utils/StringUtils");

/**
 * Generates JavaScript code for client and server blocks with reactive data handling.
 */
class JavaScriptGenerator {
  /**
   * Creates a new JavaScript generator.
   * @param {Object} options - Options for the generator
   * @param {ServerCodeGenerator} [serverGenerator] - Server code generator instance
   */
  constructor(options = {}, serverGenerator = null) {
    this.options = options;
    this.clientScripts = new Map();
    this.serverScripts = [];
    this.reactiveElements = new Set();
    this.serverGenerator = serverGenerator;
  }

  /**
   * Sets the server code generator instance
   * @param {ServerCodeGenerator} serverGenerator - Server code generator instance
   */
  setServerGenerator(serverGenerator) {
    this.serverGenerator = serverGenerator;
  }

  /**
   * Registers a client-side script to be executed when an element is clicked.
   * @param {string} elementId - The ID of the element to attach the event to
   * @param {string} code - The JavaScript code to execute
   */
  addClientScript(elementId, code) {
    if (this.options.debug) {
      console.log(`[JavaScriptGenerator] Adding client script for element ${elementId}`);
    }
    this.clientScripts.set(elementId, code);
  }

  /**
   * Adds a server-side script to be executed on the server.
   * @param {string} elementId - The ID of the element that triggers the server action
   * @param {string} code - The JavaScript code to execute
   * @param {Array<string>} params - The input parameters to retrieve from the client
   */
  addServerScript(elementId, code, params = []) {
    if (this.options.debug) {
      console.log(`[JavaScriptGenerator] Adding server script for element ${elementId}`);
      if (params.length > 0) {
        console.log(`[JavaScriptGenerator] Script parameters: ${params.join(", ")}`);
      }
    }
    
    this.serverScripts.push({
      elementId,
      code,
      params
    });
    
    if (this.serverGenerator) {
      this.serverGenerator.addServerRoute(elementId, code, params);
    }
    
    this.clientScripts.set(elementId, `_bp_serverAction_${elementId}(e);`);
  }

  /**
   * Registers an element as reactive, meaning it will have state management functions
   * @param {string} elementId - The ID of the element to make reactive
   */
  registerReactiveElement(elementId) {
    if (this.options.debug) {
      console.log(`[JavaScriptGenerator] Registering reactive element: ${elementId}`);
    }
    this.reactiveElements.add(elementId);
  }

  /**
   * Generates a unique element ID.
   * @returns {string} - A unique element ID with bp_ prefix
   */
  generateElementId() {
    return StringUtils.generateRandomId();
  }

  /**
   * Generates the reactive store and helper functions for state management
   * @returns {string} - JavaScript code for reactive functionality
   */
  generateReactiveStore() {
    if (this.reactiveElements.size === 0) {
      return '';
    }

    return `
const _bp_store = {
  listeners: new Map(),
  subscribe: function(id, callback) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, []);
    }
    this.listeners.get(id).push(callback);
  },
  notify: function(id, newValue) {
    if (this.listeners.has(id)) {
      this.listeners.get(id).forEach(callback => callback(newValue));
    }
  }
};

function _bp_makeElementReactive(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.log(\`[Blueprint] Element with ID \${id} not found\`);
    return null;
  }

  return {
    element: element,
    get value() {
      return element.textContent;
    },
    set: function(newValue) {
      const valueString = String(newValue);
      element.textContent = valueString;
      _bp_store.notify(id, valueString);
      return this;
    },
    setNumber: function(num) {
      const valueString = String(Number(num));
      element.textContent = valueString;
      _bp_store.notify(id, valueString);
      return this;
    },
    setHtml: function(html) {
      element.innerHTML = html;
      _bp_store.notify(id, html);
      return this;
    },
    setStyle: function(property, value) {
      element.style[property] = value;
      return this;
    },
    setClass: function(className, add = true) {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
      return this;
    },
    on: function(event, callback) {
      element.addEventListener(event, callback);
      return this;
    },
    subscribe: function(callback) {
      _bp_store.subscribe(id, callback);
      return this;
    },
    get textValue() {
      return element.textContent;
    },
    get numberValue() {
      return Number(element.textContent);
    },
    get booleanValue() {
      const text = element.textContent.toLowerCase();
      return text === 'true' || text === '1' || text === 'yes';
    }
  };
}

// Initialize reactive elements`;
  }

  /**
   * Generates initialization code for reactive elements
   * @returns {string} - JavaScript initialization code for reactive elements
   */
  generateReactiveElementInit() {
    if (this.reactiveElements.size === 0) {
      return '';
    }

    const initCode = Array.from(this.reactiveElements)
      .map(id => `const ${id} = _bp_makeElementReactive('${id}');`)
      .join('\n  ');

    return `
  ${initCode}`;
  }

  /**
   * Generates all client-side JavaScript code.
   * @returns {string} - The generated JavaScript code
   */
  generateClientScripts() {
    if (this.clientScripts.size === 0 && this.reactiveElements.size === 0 && !this.serverGenerator) {
      return '';
    }

    let initCode = '';
    if (this.reactiveElements.size > 0) {
      initCode = this.generateReactiveElementInit();
    }

    let scripts = '';
    this.clientScripts.forEach((code, elementId) => {
      scripts += `  document.getElementById('${elementId}').addEventListener('click', function(e) {
    ${code}
  });\n`;
    });

    let serverClientCode = '';
    if (this.serverGenerator) {
      serverClientCode = this.serverGenerator.generateClientAPICalls();
    }

    return `<script>
${this.generateReactiveStore()}
${serverClientCode}

document.addEventListener('DOMContentLoaded', function() {
${initCode}

${scripts}});
</script>`;
  }

  /**
   * Gets all server-side scripts.
   * @returns {Array<Object>} - Array of server-side script objects
   */
  getServerScripts() {
    return this.serverScripts;
  }
}

module.exports = JavaScriptGenerator;