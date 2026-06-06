const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "dist");
const rootExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".json",
  ".webmanifest",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".glb",
  ".usdz"
]);
const rootDirs = new Set(["backend", "css", "dashboard", "js"]);
const skipDirs = new Set([
  ".git",
  ".vercel",
  ".idea",
  ".vscode",
  "dist",
  "node_modules",
  "real-estate-ai",
  "realtygenius-saas",
  "scratch"
]);

function resetOutput() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
}

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(source, target);
      continue;
    }

    if (rootExtensions.has(path.extname(entry.name).toLowerCase())) {
      copyFile(source, target);
    }
  }
}

resetOutput();

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (skipDirs.has(entry.name)) continue;
  const source = path.join(root, entry.name);
  const target = path.join(outDir, entry.name);

  if (entry.isDirectory()) {
    if (rootDirs.has(entry.name)) copyDirectory(source, target);
    continue;
  }

  if (rootExtensions.has(path.extname(entry.name).toLowerCase())) {
    copyFile(source, target);
  }
}

console.log("Static RealityGenius build written to dist/");
