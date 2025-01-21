const express = require("express");
const expressWs = require("express-ws");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const BlueprintBuilder = require("./BlueprintBuilder");

class BlueprintServer {
  constructor(options = {}) {
    this.app = express();
    this.wsInstance = expressWs(this.app);
    this.options = {
      port: 3000,
      srcDir: "./src",
      outDir: "./dist",
      liveReload: false,
      minified: true,
      ...options,
    };
    this.clients = new Map();
    this.filesWithErrors = new Set();
    this.setupServer();
    if (this.options.liveReload) {
      const watcher = chokidar.watch([], {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
      });

      setTimeout(() => {
        watcher.add(this.options.srcDir);
        this.setupWatcher(watcher);
      }, 1000);
    }
  }

  log(tag, message, color) {
    const colorCodes = {
      blue: "\x1b[34m",
      green: "\x1b[32m",
      red: "\x1b[31m",
      orange: "\x1b[33m",
      lightGray: "\x1b[90m",
      reset: "\x1b[0m",
      bgBlue: "\x1b[44m",
    };
    console.log(
      `${colorCodes.bgBlue} BP ${colorCodes.reset} ${
        colorCodes[color] || ""
      }${message}${colorCodes.reset}`
    );
  }

  async buildAll() {
    this.log("INFO", "Building all Blueprint files...", "lightGray");
    if (fs.existsSync(this.options.outDir)) {
      fs.rmSync(this.options.outDir, { recursive: true });
    }
    fs.mkdirSync(this.options.outDir, { recursive: true });

    const files = this.getAllFiles(this.options.srcDir);
    let success = true;
    const errors = [];
    const startTime = Date.now();
    for (const file of files) {
      const relativePath = path.relative(this.options.srcDir, file);
      const outputPath = path.join(
        this.options.outDir,
        relativePath.replace(/\.bp$/, ".html")
      );
      this.ensureDirectoryExistence(outputPath);

      const builder = new BlueprintBuilder({ minified: this.options.minified });
      const result = builder.build(file, path.dirname(outputPath));
      if (!result.success) {
        success = false;
        errors.push({ file, errors: result.errors });
      }
    }
    const totalTime = Date.now() - startTime;
    if (success) {
      this.log(
        "SUCCESS",
        `All files built successfully in ${totalTime}ms!`,
        "green"
      );
    } else {
      this.log("ERROR", "Build failed with errors:", "red");
      errors.forEach(({ file, errors }) => {
        this.log("ERROR", `File: ${file}`, "red");
        errors.forEach((err) => {
          this.log(
            "ERROR",
            `${err.type} at line ${err.line}, column ${err.column}: ${err.message}`,
            "red"
          );
        });
      });
      process.exit(1);
    }
  }

  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }

  getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
      if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
        arrayOfFiles = this.getAllFiles(path.join(dirPath, file), arrayOfFiles);
      } else if (file.endsWith(".bp")) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    });

    return arrayOfFiles;
  }

  setupServer() {
    this.app.use((req, res, next) => {
      const isHtmlRequest =
        req.path.endsWith(".html") || !path.extname(req.path);

      if (this.options.liveReload && isHtmlRequest) {
        const htmlPath = req.path.endsWith(".html")
          ? path.join(this.options.outDir, req.path)
          : path.join(this.options.outDir, req.path + ".html");

        fs.readFile(htmlPath, "utf8", (err, data) => {
          if (err) return next();
          let html = data;
         const script = `
            <script>
              (function() {
                let currentPage = window.location.pathname.replace(/^\\//, '') || 'index.html';
                console.log('Current page:', currentPage);
                
                const ws = new WebSocket('ws://' + window.location.host + '/live-reload');
                
                ws.onopen = () => {
                  console.log('Live reload connected');
                  ws.send(JSON.stringify({ type: 'register', page: currentPage+".html" }));
                };

                ws.onmessage = (event) => {
                  console.log('Received message:', event.data);
                  const data = JSON.parse(event.data);
                  if (data.type === 'reload' && data.content) {
                    console.log('Received new content, updating DOM...');
                    const parser = new DOMParser();
                    const newDoc = parser.parseFromString(data.content, 'text/html');
                    
                    if (document.title !== newDoc.title) {
                      document.title = newDoc.title;
                    }

                    const stylePromises = [];
                    const newStyles = Array.from(newDoc.getElementsByTagName('link'))
                      .filter(link => link.rel === 'stylesheet');

                    newStyles.forEach(style => {
                      const newHref = style.href + '?t=' + Date.now();
                      stylePromises.push(new Promise((resolve, reject) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = newHref;
                        link.onload = () => resolve(link);
                        link.onerror = reject;
                        link.media = 'print';
                        document.head.appendChild(link);
                      }));
                    });

                    Promise.all(stylePromises)
                      .then(newLinks => {
                        Array.from(document.getElementsByTagName('link'))
                          .forEach(link => {
                            if (link.rel === 'stylesheet' && !newLinks.includes(link)) {
                              link.remove();
                            }
                          });

                        newLinks.forEach(link => {
                          link.media = 'all';
                        });

                        document.body.innerHTML = newDoc.body.innerHTML;
                        
                        Array.from(newDoc.getElementsByTagName('script'))
                          .forEach(script => {
                            if (!script.src && script.parentElement.tagName === 'BODY') {
                              const newScript = document.createElement('script');
                              newScript.textContent = script.textContent;
                              document.body.appendChild(newScript);
                            }
                          });
                        
                        console.log('DOM update complete');
                      })
                      .catch(error => {
                        console.error('Error loading new stylesheets:', error);
                        window.location.reload();
                      });
                  }
                };

                ws.onclose = () => {
                  console.log('Live reload connection closed, attempting to reconnect...');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                };
              })();
            </script>
          `;
          html = html.replace("</head>", script + "</head>");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          return res.send(html);
        });
      } else {
        next();
      }
    });

    this.app.use(express.static(this.options.outDir));

    this.app.get("*", (req, res, next) => {
      if (path.extname(req.path)) return next();

      const htmlPath = path.join(this.options.outDir, req.path + ".html");
      if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
      } else if (req.path === "/") {
        const pages = fs
          .readdirSync(this.options.outDir)
          .filter((f) => f.endsWith(".html"))
          .map((f) => f.replace(".html", ""));
        res.send(`
          <html>
            <head>
              <title>Blueprint Pages</title>
              <style>
                body {
                  font-family: -apple-system, system-ui, sans-serif;
                  max-width: 800px;
                  margin: 2rem auto;
                  padding: 0 1rem;
                  background: #0d1117;
                  color: #e6edf3;
                }
                h1 { margin-bottom: 2rem; }
                ul { list-style: none; padding: 0; }
                li { margin: 1rem 0; }
                a {
                  color: #3b82f6;
                  text-decoration: none;
                  font-size: 1.1rem;
                }
                a:hover {
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <h1>Blueprint Pages</h1>
              <ul>
                ${pages
                  .map((page) => `<li><a href="/${page}">${page}</a></li>`)
                  .join("")}
              </ul>
            </body>
          </html>
        `);
      } else {
        next();
      }
    });

    if (this.options.liveReload) {
      this.app.ws("/live-reload", (ws, req) => {
        ws.on("message", (msg) => {
          try {
            const data = JSON.parse(msg);
            if (data.type === "register" && data.page) {
              this.clients.set(ws, data.page);
            }
          } catch (error) {}
        });

        ws.on("close", () => {
          this.clients.delete(ws);
        });

        ws.on("error", (error) => {
          this.log("ERROR", "WebSocket error:", "red");
          this.clients.delete(ws);
        });
      });
    }
  }

  setupWatcher(watcher) {
    watcher.on("change", async (filepath) => {
      if (filepath.endsWith(".bp")) {
        this.log("INFO", `File ${filepath} has been changed`, "blue");
        try {
          const builder = new BlueprintBuilder({
            minified: this.options.minified,
            debug: this.options.debug,
          });
          const relativePath = path.relative(this.options.srcDir, filepath);
          const outputPath = path.join(
            this.options.outDir,
            relativePath.replace(/\.bp$/, ".html")
          );
          this.ensureDirectoryExistence(outputPath);
          const result = builder.build(filepath, path.dirname(outputPath));

          if (result.success) {
            this.log("SUCCESS", "Rebuilt successfully", "green");

            this.filesWithErrors.delete(filepath);

            const htmlFile = relativePath.replace(/\.bp$/, ".html");
            const htmlPath = path.join(this.options.outDir, htmlFile);

            try {
              const newContent = fs.readFileSync(htmlPath, "utf8");

              for (const [client, page] of this.clients.entries()) {
                if (
                  page === htmlFile.replace(/\\/g, "/") &&
                  client.readyState === 1
                ) {
                  try {
                    client.send(
                      JSON.stringify({
                        type: "reload",
                        content: newContent,
                      })
                    );
                  } catch (error) {
                    this.log("ERROR", "Error sending content:", "red");
                    this.clients.delete(client);
                  }
                }
              }
            } catch (error) {
              this.log("ERROR", "Error reading new content:", "red");
            }
          } else {
            this.filesWithErrors.add(filepath);
            this.log("ERROR", `Build failed: ${result.errors.map(e => e.message).join(", ")}`, "red");
            this.log("INFO", "Waiting for next file change...", "orange");

            for (const [client, page] of this.clients.entries()) {
              const htmlFile = relativePath.replace(/\.bp$/, ".html");
              if (
                page === htmlFile.replace(/\\/g, "/") &&
                client.readyState === 1
              ) {
                try {
                  client.send(
                    JSON.stringify({
                      type: "buildError",
                      errors: result.errors,
                    })
                  );
                } catch (error) {
                  this.log("ERROR", "Error sending error notification:", "red");
                  this.clients.delete(client);
                }
              }
            }
          }
        } catch (error) {
          this.log("ERROR", "Unexpected error during build:", "red");
          this.filesWithErrors.add(filepath);
        }
      }
    });

    watcher.on("add", async (filepath) => {
      if (filepath.endsWith(".bp")) {
        this.log("INFO", `New file detected: ${filepath}`, "lightGray");
        try {
          const builder = new BlueprintBuilder({
            minified: this.options.minified,
            debug: this.options.debug,
          });
          const relativePath = path.relative(this.options.srcDir, filepath);
          const outputPath = path.join(
            this.options.outDir,
            relativePath.replace(/\.bp$/, ".html")
          );
          this.ensureDirectoryExistence(outputPath);
          const result = builder.build(filepath, path.dirname(outputPath));
          if (result.success) {
            this.log("SUCCESS", "Built new file successfully", "green");
            this.filesWithErrors.delete(filepath);
          } else {
            this.filesWithErrors.add(filepath);
            this.log("ERROR", "Build failed for new file", "red");
          }
        } catch (error) {
          this.log("ERROR", "Unexpected error building new file:", "red");
          this.filesWithErrors.add(filepath);
        }
      }
    });

    watcher.on("unlink", async (filepath) => {
      if (filepath.endsWith(".bp")) {
        this.log("INFO", `File ${filepath} removed`, "orange");
        const relativePath = path.relative(this.options.srcDir, filepath);
        const htmlPath = path.join(
          this.options.outDir,
          relativePath.replace(/\.bp$/, ".html")
        );
        const cssPath = path.join(
          this.options.outDir,
          relativePath.replace(/\.bp$/, ".css")
        );
        if (fs.existsSync(htmlPath)) {
          fs.unlinkSync(htmlPath);
        }
        if (fs.existsSync(cssPath)) {
          fs.unlinkSync(cssPath);
        }
        const dirPath = path.dirname(htmlPath);
        if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
          fs.rmdirSync(dirPath);
        }
      }
    });
  }

  async start() {
    await this.buildAll();
    this.app.listen(this.options.port, () => {
      this.log(
        "INFO",
        `Blueprint dev server running at http://localhost:${this.options.port}`,
        "green"
      );
      this.log(
        "INFO",
        `Mode: ${this.options.minified ? "Minified" : "Human Readable"}`,
        "lightGray"
      );
      if (this.options.liveReload) {
        this.log(
          "INFO",
          "Live reload enabled - watching for changes...",
          "lightGray"
        );
      }
    });
  }
}

module.exports = BlueprintServer;
