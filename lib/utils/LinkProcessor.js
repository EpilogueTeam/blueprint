/**
 * LinkProcessor provides utilities for processing link elements.
 */
class LinkProcessor {
  /**
   * Creates a new link processor instance.
   * @param {Object} [options] - Options object
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(options = {}) {
    this.options = {
      debug: false,
      ...options,
    };
  }

  /**
   * Processes a link node and extracts the href attribute.
   * Converts to an internal link if it doesn't start with http:// or https://.
   * 
   * @param {Object} node - The link node to process
   * @returns {Object} - An object containing link properties
   */
  processLink(node) {
    if (this.options.debug) {
      console.log("\n[LinkProcessor] Processing link node");
    }

    const hrefProp = node.props.find((p) => p.startsWith("href:"));
    let href = "#";

    if (hrefProp) {
      let hrefTarget = hrefProp
        .substring(hrefProp.indexOf(":") + 1)
        .trim()
        .replace(/^"|"$/g, "");
      
      if (!hrefTarget.startsWith("http://") && !hrefTarget.startsWith("https://")) {
        hrefTarget = "/" + hrefTarget;
        if (this.options.debug) {
          console.log(`[LinkProcessor] Converted to internal link: "${hrefTarget}"`);
        }
      } else {
        if (this.options.debug) {
          console.log(`[LinkProcessor] External link detected: "${hrefTarget}"`);
        }
      }
      href = hrefTarget;
    } else {
      if (this.options.debug) {
        console.log("[LinkProcessor] No href property found, using default: '#'");
      }
    }

    return { 
      href,
      isExternal: href.startsWith("http://") || href.startsWith("https://")
    };
  }

  /**
   * Gets appropriate HTML attributes for a link based on its type
   * @param {Object} linkInfo - Link information object
   * @returns {string} - HTML attributes for the link
   */
  getLinkAttributes(linkInfo) {
    if (linkInfo.isExternal) {
      return ` href="${linkInfo.href}" target="_blank" rel="noopener noreferrer"`;
    } else {
      return ` href="${linkInfo.href}"`;
    }
  }

  /**
   * Gets the click handler for a button inside a link
   * @param {Object} linkInfo - Link information object
   * @returns {string} - onclick attribute value
   */
  getButtonClickHandler(linkInfo) {
    if (linkInfo.isExternal) {
      return ` onclick="window.open('${linkInfo.href}', '_blank', 'noopener,noreferrer')"`;
    } else {
      return ` onclick="window.location.href='${linkInfo.href}'"`;
    }
  }
}

module.exports = LinkProcessor; 