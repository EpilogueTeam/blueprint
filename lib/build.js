const BlueprintBuilder = require("./BlueprintBuilder");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const options = {
  minified: !args.includes("--readable"),
  srcDir: "./src",
  outDir: "./dist",
  debug: args.includes("--debug"),
};

const builder = new BlueprintBuilder(options);

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else if (file.endsWith(".bp")) {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(options.srcDir);

let success = true;
const errors = [];

console.log("Building Blueprint files...");
const startTime = Date.now();

for (const file of files) {
  const relativePath = path.relative(options.srcDir, file);
  const outputPath = path.join(
    options.outDir,
    relativePath.replace(/\.bp$/, ".html")
  );
  ensureDirectoryExistence(outputPath);

  console.log(`Building ${file}...`);
  const result = builder.build(file, path.dirname(outputPath));
  if (!result.success) {
    success = false;
    errors.push({ file, errors: result.errors });
  }
}

const totalTime = Date.now() - startTime;

if (success) {
  console.log(`All files built successfully in ${totalTime}ms!`);
} else {
  console.error("Build failed with errors:");
  errors.forEach(({ file, errors }) => {
    console.error(`\nFile: ${file}`);
    errors.forEach((err) => {
      console.error(`  ${err.message} (${err.line}:${err.column})`);
    });
  });
  process.exit(1);
}
