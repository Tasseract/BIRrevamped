const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// Create public directory
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Helper to copy file
const copyFile = (fileName) => {
    const src = path.join(rootDir, fileName);
    const dest = path.join(publicDir, fileName);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${fileName} to public/`);
    }
};

// Helper to copy directory
const copyDir = (dirName) => {
    const src = path.join(rootDir, dirName);
    const dest = path.join(publicDir, dirName);
    
    if (fs.existsSync(src)) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                // recursive copy not implemented for simplicity, assuming flat assets or just copy top level
                // For robust recursive copy, we'd need a function. 
                // But for now let's just copy files in the dir.
                 if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
                 fs.readdirSync(srcPath).forEach(file => {
                     fs.copyFileSync(path.join(srcPath, file), path.join(destPath, file));
                 });
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
        console.log(`Copied ${dirName}/ to public/`);
    }
};

// Read all files in root
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    // Copy HTML, CSS, JS (including api-config.js which was just generated)
    if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
        // Exclude server.js and scripts/ config files if we don't want them in frontend
        if (file !== 'server.js' && file !== 'package.json' && file !== 'package-lock.json') {
            copyFile(file);
        }
    }
});

// Copy assets folder if it exists
copyDir('assets');
copyDir('images'); // Just in case

console.log('Vercel build preparation complete.');
