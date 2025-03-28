const crypto = require('crypto');
const StringUtils = require("../utils/StringUtils");

/**
 * Generates server-side Express.js routes for server blocks.
 */
class ServerCodeGenerator {
  /**
   * Creates a new server code generator.
   * @param {Object} options - Options for the generator
   */
  constructor(options = {}) {
    this.options = options;
    this.serverRoutes = new Map();
    this.hasServerCode = false;
  }

  /**
   * Registers a server-side route to be executed when requested.
   * @param {string} elementId - The ID of the element that triggers the route
   * @param {string} code - The JavaScript code to execute
   * @param {Array<string>} params - The input parameters to retrieve from the client
   */
  addServerRoute(elementId, code, params = []) {
    if (this.options.debug) {
      console.log(`[ServerCodeGenerator] Adding server route for element ${elementId}`);
      if (params.length > 0) {
        console.log(`[ServerCodeGenerator] Route parameters: ${params.join(", ")}`);
      }
    }
    
    const endpoint = this.generateEndpointPath(elementId);
    
    this.serverRoutes.set(elementId, {
      endpoint,
      code,
      params
    });
    
    this.hasServerCode = true;
  }

  /**
   * Generates a unique endpoint path for a server route.
   * @param {string} elementId - The element ID for the route
   * @returns {string} - A unique endpoint path
   */
  generateEndpointPath(elementId) {
    const hash = crypto.createHash('sha256')
      .update(elementId + Math.random().toString())
      .digest('hex')
      .substring(0, 12);
    
    return `/api/${StringUtils.toKebabCase(elementId)}-${hash}`;
  }

  /**
   * Generates client-side JavaScript for making API calls to server routes.
   * @returns {string} - JavaScript code for making API calls
   */
  generateClientAPICalls() {
    if (this.serverRoutes.size === 0) {
      return '';
    }

    let apiCode = `
const _bp_api = {
  post: async function(url, data) {
    try {
      const serverPort = window.blueprintServerPort || 3001;
      
      const fullUrl = \`http://\${window.location.hostname}:\${serverPort}\${url}\`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(\`API request failed: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[Blueprint API]', error);
      return { error: error.message };
    }
  }
};


`;


    this.serverRoutes.forEach((route, elementId) => {
      const { endpoint, params } = route;
      
      apiCode += `async function _bp_serverAction_${elementId}(e) {
  const data = {};
${params.map(param => `  const ${param}_element = document.getElementById('${param}');
  if (${param}_element) {
    console.log('Found element: ${param}', ${param}_element);
    if (${param}_element.type === 'checkbox') {
      data.${param} = ${param}_element.checked;
      console.log('Checkbox ${param} value:', ${param}_element.checked);
    } else if (${param}_element.type === 'radio') {
      data.${param} = ${param}_element.checked;
    } else if (${param}_element.value !== undefined) {
      data.${param} = ${param}_element.value;
    } else {
      data.${param} = ${param}_element.textContent;
    }
  } else {
    console.error('[Blueprint] Element with ID ${param} not found');
    data.${param} = null;
  }`).join('\n')}
  
  console.log('Submitting data:', data);
  
  try {
    const result = await _bp_api.post('${endpoint}', data);
    console.log('[Blueprint API] Server response:', result);
    
    if (result && typeof result === 'object') {
      Object.keys(result).forEach(key => {
        if (window[key] && typeof window[key].set === 'function') {
          window[key].set(result[key]);
        } 
        else {
          const element = document.getElementById(key);
          if (element) {
            if (element.tagName.toLowerCase() === 'input') {
              element.value = result[key];
            } else {
              element.textContent = result[key];
            }
            console.log(\`[Blueprint API] Updated element #\${key} with value: \${result[key]}\`);
          }
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('[Blueprint API] Error in server action:', error);
  }
}\n`;
    });

    return apiCode;
  }

  /**
   * Generates Express.js server code for all registered server routes.
   * @returns {string} - Express.js server code
   */
  generateServerCode() {
    if (this.serverRoutes.size === 0) {
      return '';
    }

    let serverCode = `
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

function createBlueprintApiServer(port = 3001) {
  const app = express();
  
  app.use(cors());
  app.use(bodyParser.json());
  
  app.use((req, res, next) => {
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
    next();
  });

`;

    this.serverRoutes.forEach((route, elementId) => {
      const { endpoint, code, params } = route;
      
      serverCode += `
  app.post('${endpoint}', async (req, res) => {
    try {
      ${params.map(param => {
        return `const ${param} = req.body.${param} !== undefined ? req.body.${param} : null;
      if (${param} === null) {
        console.error(\`Missing parameter: ${param}\`);
      }`;
      }).join('\n      ')}
      
      let result;
      try {
        ${code}
      } catch (error) {
        console.error(\`Error in server block \${error.message}\`);
        return res.status(500).json({ error: error.message });
      }
      
      return res.json(result || {});
    } catch (error) {
      console.error(\`Error processing request: \${error.message}\`);
      return res.status(500).json({ error: error.message });
    }
  });`;
    });

    serverCode += `

  app.listen(port, () => {
    console.log(\`Blueprint API server running at http://localhost:\${port}\`);
  });
  
  return app;
}

module.exports = createBlueprintApiServer;
`;

    return serverCode;
  }

  /**
   * Checks if there is any server code to generate.
   * @returns {boolean} - Whether there is server code
   */
  hasServerCodeToGenerate() {
    return this.hasServerCode;
  }
}

module.exports = ServerCodeGenerator; 