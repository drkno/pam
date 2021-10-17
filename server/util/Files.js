const { resolve } = require('path');
const { readdir } = require('fs').promises;

// derived from https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
module.exports.walkFileTree = async function* (directory) {
    const dirents = await readdir(directory, {
        withFileTypes: true
    });
    for (const dirent of dirents) {
        const path = resolve(directory, dirent.name);
        if (dirent.isDirectory()) {
            yield* module.exports.walkFileTree(path);
        }
        else {
            yield path;
        }
    }
};
