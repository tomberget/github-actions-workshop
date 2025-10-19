/**
 * Simple build script for the workshop
 * Simulates a build process
 */

const fs = require("fs");
const path = require("path");

console.log("🔨 Starting build process...\n");

const distDir = path.join(__dirname, "dist");

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log("✅ Created dist directory");
}

// Copy source files
const srcDir = path.join(__dirname, "src");
const files = fs.readdirSync(srcDir);

files.forEach((file) => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(distDir, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`✅ Copied ${file}`);
});

// Create a build manifest
const manifest = {
  buildTime: new Date().toISOString(),
  version: require("./package.json").version,
  files: files,
  environment: process.env.NODE_ENV || "development",
};

fs.writeFileSync(
  path.join(distDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("✅ Created build manifest");

console.log("\n🎉 Build completed successfully!");
console.log(`📦 Output: ${distDir}`);
