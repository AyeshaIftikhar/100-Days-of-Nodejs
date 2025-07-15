const fs = require('fs');
const path = require('path');
const config = require('../config');

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
}

function generateDirectoryListing(dirPath, urlPath) {
  const files = fs.readdirSync(dirPath);
  const items = files.map(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    const isDir = stat.isDirectory();
    
    return {
      name: file,
      path: path.join(urlPath, file),
      size: isDir ? '-' : formatFileSize(stat.size),
      modified: stat.mtime.toLocaleString(),
      isDirectory: isDir
    };
  });

  // Sort directories first
  items.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

function directoryMiddleware(req, res, next) {
  if (!config.SHOW_DIRECTORY) return next();
  
  const requestedPath = path.join(config.PUBLIC_DIR, req.path);
  
  try {
    const stat = fs.statSync(requestedPath);
    if (!stat.isDirectory()) return next();
    
    // Check for index files
    for (const indexFile of config.INDEX_FILES) {
      const indexPath = path.join(requestedPath, indexFile);
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    
    // Generate directory listing
    const items = generateDirectoryListing(requestedPath, req.path);
    const parentPath = path.dirname(req.path.replace(/\/$/, ''));
    
    // Simple HTML response (you could use a template engine here)
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Index of ${req.path}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          a { text-decoration: none; color: #0366d6; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Index of ${req.path}</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Modified</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add parent directory link
    if (req.path !== '/') {
      html += `
        <tr>
          <td><a href="${parentPath}">../</a></td>
          <td>-</td>
          <td>-</td>
        </tr>
      `;
    }
    
    // Add files and directories
    items.forEach(item => {
      html += `
        <tr>
          <td>
            <a href="${item.path}${item.isDirectory ? '/' : ''}">
              ${item.name}${item.isDirectory ? '/' : ''}
            </a>
          </td>
          <td>${item.size}</td>
          <td>${item.modified}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    res.type('html').send(html);
  } catch (err) {
    next();
  }
}

module.exports = directoryMiddleware;