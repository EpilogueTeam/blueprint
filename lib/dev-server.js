const BlueprintServer = require("./server");

const args = process.argv.slice(2);
const options = {
  port: args.includes("--port")
    ? parseInt(args[args.indexOf("--port") + 1])
    : 3000,
  liveReload: args.includes("--live"),
  minified: !args.includes("--readable"),
  srcDir: "./src",
  outDir: "./dist",
};

const server = new BlueprintServer(options);
server.start();
