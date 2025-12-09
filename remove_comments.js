const fs = require('fs');
const path = require('path');

function removeJSComments(content) {
    let result = [];
    let i = 0;
    const backslash = String.fromCharCode(92);
    
    while (i < content.length) {
        const char = content[i];
        const nextChar = i + 1 < content.length ? content[i + 1] : '';
        
        if (char === "'" || char === '"') {
            let quote = char;
            result.push(quote);
            i++;
            while (i < content.length) {
                if (content[i] === quote) {
                    result.push(quote);
                    i++;
                    break;
                } else if (content[i] === backslash && i + 1 < content.length) {
                    result.push(content[i], content[i+1]);
                    i += 2;
                } else {
                    result.push(content[i]);
                    i++;
                }
            }
        } else if (char === '`') {
            result.push(char);
            i++;
            while (i < content.length) {
                if (content[i] === '`') {
                    result.push('`');
                    i++;
                    break;
                } else if (content[i] === backslash && i + 1 < content.length) {
                    result.push(content[i], content[i+1]);
                    i += 2;
                } else {
                    result.push(content[i]);
                    i++;
                }
            }
        } else if (char === '/' && nextChar === '/') {
            let newlineIdx = content.indexOf('\n', i);
            if (newlineIdx !== -1) {
                result.push('\n');
                i = newlineIdx + 1;
            } else {
                i = content.length;
            }
        } else if (char === '/' && nextChar === '*') {
            let endIdx = content.indexOf('*/', i + 2);
            if (endIdx !== -1) {
                i = endIdx + 2;
            } else {
                i = content.length;
            }
        } else {
            result.push(char);
            i++;
        }
    }
    return result.join('');
}

function removeCSSComments(content) {
    let result = [];
    let i = 0;
    while (i < content.length) {
        if (content[i] === '/' && i + 1 < content.length && content[i+1] === '*') {
            let endIdx = content.indexOf('*/', i + 2);
            if (endIdx !== -1) {
                i = endIdx + 2;
            } else {
                i = content.length;
            }
        } else {
            result.push(content[i]);
            i++;
        }
    }
    return result.join('');
}

function removeHTMLComments(content) {
    return content.replace(/<!--[\s\S]*?-->/g, '');
}

function removeJSONComments(content) {
    return removeJSComments(content);
}

function cleanBlankLines(content) {
    let lines = content.split('\n');
    let result = [];
    let prevBlank = false;
    for (let line of lines) {
        let isBlank = line.trim() === '';
        if (isBlank && prevBlank) {
            continue;
        }
        result.push(line);
        prevBlank = isBlank;
    }
    return result.join('\n');
}

function processFile(filepath) {
    try {
        let content = fs.readFileSync(filepath, 'utf-8');
        let originalContent = content;

        if (/\.(tsx?|jsx?)$/.test(filepath)) {
            content = removeJSComments(content);
        } else if (/\.css$/.test(filepath)) {
            content = removeCSSComments(content);
        } else if (/\.html$/.test(filepath)) {
            content = removeHTMLComments(content);
        } else if (/\.json$/.test(filepath)) {
            content = removeJSONComments(content);
        }

        content = cleanBlankLines(content);

        if (content !== originalContent) {
            fs.writeFileSync(filepath, content, 'utf-8');
            return true;
        }
        return false;
    } catch (e) {
        console.error(`Error: ${filepath} - ${e.message}`);
        return false;
    }
}

function walkDir(dir, extensions) {
    let files = [];
    try {
        let entries = fs.readdirSync(dir);
        for (let entry of entries) {
            let fullPath = path.join(dir, entry);
            try {
                let stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    if (!['.git', 'node_modules', 'dist', '.next'].includes(entry)) {
                        files.push(...walkDir(fullPath, extensions));
                    }
                } else if (extensions.some(ext => fullPath.endsWith(ext))) {
                    files.push(fullPath);
                }
            } catch (e) {}
        }
    } catch (e) {}
    return files;
}

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.html'];
let allFiles = walkDir('.', extensions);
allFiles = allFiles.filter((f, idx, arr) => arr.indexOf(f) === idx);

let modified = [];
for (let file of allFiles) {
    if (processFile(file)) {
        modified.push(file);
    }
}

console.log(`\nModified ${modified.length} files:\n`);
modified.sort().forEach(f => console.log(f));
