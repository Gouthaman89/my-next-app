const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const releaseDir = path.join(__dirname, 'release');

// Step 1: Run Next.js build
console.log('🔧 Running Next.js build...');
execSync('npm run build', { stdio: 'inherit' });

// Step 2: Clean and create release folder
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true });
}
fs.mkdirSync(path.join(releaseDir, '.next'), { recursive: true });
console.log('✅ Created release/.next folder');

// Step 3: Copy standalone files
const standaloneDir = path.join(__dirname, '.next', 'standalone');
if (fs.existsSync(standaloneDir)) {
  execSync(`cp -R ${standaloneDir}/* ${releaseDir}`);
  console.log('✅ Copied .next/standalone/* to release/');
} else {
  console.error('❌ .next/standalone does not exist');
}

// Step 4: Copy static assets
const staticDir = path.join(__dirname, '.next', 'static');
if (fs.existsSync(staticDir)) {
  execSync(`cp -R ${staticDir} ${path.join(releaseDir, '.next')}`);
  console.log('✅ Copied .next/static to release/.next/');
} else {
  console.warn('⚠️ .next/static not found');
}

// Step 5: Copy public folder if exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  execSync(`cp -R ${publicDir} ${path.join(releaseDir, 'public')}`);
  console.log('✅ Copied public/ to release/public/');
} else {
  console.log('ℹ️ No public/ folder found');
}

console.log('🎉 Release folder is ready!');
