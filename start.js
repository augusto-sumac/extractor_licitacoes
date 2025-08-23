#!/usr/bin/env node

// Polyfill para File class ANTES de qualquer import
if (typeof global !== 'undefined') {
    if (!global.File) {
        global.File = class File {
            constructor(bits, name, options = {}) {
                this.name = name;
                this.size = bits.length;
                this.type = options.type || '';
                this.lastModified = options.lastModified || Date.now();
            }
        };
    }
}

// Agora importar o servidor
require('./server-simple.js');
