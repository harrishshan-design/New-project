const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "out");
const distDir = path.join(root, "dist");

const rootExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".json",
  ".txt",
  ".xml",
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

const rootDirs = new Set(["assets", "backend", "css", "dashboard", "js", "models"]);
const skipDirs = new Set([
  ".git",
  ".vercel",
  ".idea",
  ".vscode",
  ".next",
  "app",
  "dist",
  "node_modules",
  "out",
  "real-estate-ai",
  "realtygenius-saas",
  "scratch"
]);

const skipRootFiles = new Set([
  "layout_structure.txt",
  "merge-next-static.js",
  "next-env.d.ts",
  "next.config.mjs",
  "orchestrator.js",
  "package-lock.json",
  "package.json",
  "parse_dom.js",
  "playwright.config.js",
  "postcss.config.mjs",
  "rollback_theme.js",
  "serve.js",
  "server.js",
  "struct.txt",
  "temp_diff.txt",
  "test.txt",
  "top_level.txt",
  "tsconfig.json",
  "tsconfig.tsbuildinfo",
  "workspace.code-workspace"
]);

const skipRootPrefixes = [
  "add_",
  "apply_",
  "check_",
  "debug",
  "execute_",
  "find_",
  "fix_",
  "hook_",
  "hotfix_",
  "inject_",
  "patch_",
  "perf_",
  "prep_",
  "remove_",
  "restore_",
  "revert_",
  "scan_",
  "split_",
  "temp_",
  "unhide_",
  "update_",
  "upgrade_",
  "wire_"
];

function shouldSkipRootFile(name) {
  return skipRootFiles.has(name) || skipRootPrefixes.some((prefix) => name.startsWith(prefix));
}

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) return;
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

function publicConfigValue(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return String(value);
  }
  return "";
}

function writeRuntimeConfig() {
  const config = {
    SUPABASE_URL: (publicConfigValue("REALTYGENIUS_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_PUBLIC_URL", "SUPABASE_URL") || "https://tjmvbgdgddscbilfkggu.supabase.co").replace(/\/rest\/v1\/?$/, ""),
    SUPABASE_PUBLISHABLE_KEY: publicConfigValue("REALTYGENIUS_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY") || "sb_publishable_gdHnuY0_2GgMZJMNuVxC2g_g0ZB0mmJ",
    API_BASE: publicConfigValue("REALTYGENIUS_API_BASE", "NEXT_PUBLIC_REALTYGENIUS_API_BASE", "VITE_API_URL") || "https://hh-empire.onrender.com/api",
    AGENT_PRODUCT_KEYS: publicConfigValue("REALTYGENIUS_AGENT_PRODUCT_KEYS", "NEXT_PUBLIC_AGENT_PRODUCT_KEYS") || "RG-AGENT-FULL-2026"
  };
  const body = `window.REALTYGENIUS_CONFIG = Object.assign(window.REALTYGENIUS_CONFIG || {}, ${JSON.stringify(config, null, 2)});\n`;
  fs.writeFileSync(path.join(distDir, "rg-config.js"), body, "utf8");
}

if (!fs.existsSync(outDir)) {
  throw new Error("Next export output directory not found: out");
}

fs.rmSync(distDir, { recursive: true, force: true });
copyDirectory(outDir, distDir);

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (skipDirs.has(entry.name)) continue;
  if (!entry.isDirectory() && shouldSkipRootFile(entry.name)) continue;
  const source = path.join(root, entry.name);
  const target = path.join(distDir, entry.name);

  if (entry.isDirectory()) {
    if (rootDirs.has(entry.name)) copyDirectory(source, target);
    continue;
  }

  if (entry.name === "index.html") continue;
  if (rootExtensions.has(path.extname(entry.name).toLowerCase())) {
    copyFile(source, target);
  }
}

writeRuntimeConfig();

console.log("Next homepage and static RealityGenius pages written to dist/");
