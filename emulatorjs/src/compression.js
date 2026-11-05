class EJS_COMPRESSION {
    constructor(EJS) {
        this.EJS = EJS;
    }
    isCompressed(data) { //https://www.garykessler.net/library/file_sigs.html
        //todo. Use hex instead of numbers
        if ((data[0] === 80 && data[1] === 75) && ((data[2] === 3 && data[3] === 4) || (data[2] === 5 && data[3] === 6) || (data[2] === 7 && data[3] === 8))) {
            return "zip";
        } else if (data[0] === 55 && data[1] === 122 && data[2] === 188 && data[3] === 175 && data[4] === 39 && data[5] === 28) {
            return "7z";
        } else if ((data[0] === 82 && data[1] === 97 && data[2] === 114 && data[3] === 33 && data[4] === 26 && data[5] === 7) && ((data[6] === 0) || (data[6] === 1 && data[7] == 0))) {
            return "rar";
        }
        return null;
    }
    decompress(data, updateMsg, fileCbFunc) {
        const compressed = this.isCompressed(data.slice(0, 10));
        if (compressed === null) {
            if (typeof fileCbFunc === "function") {
                fileCbFunc("!!notCompressedData", data);
            }
            return new Promise(resolve => resolve({ "!!notCompressedData": data }));
        }
        return this.decompressFile(compressed, data, updateMsg, fileCbFunc);
    }
    getWorkerFile(method) {
        // Return the chrome-extension:// URL of the static worker file directly.
        // blob: worker URLs are forbidden by MV3 CSP (worker-src 'self' only).
        const base = this.EJS.config.dataPath + 'compression/';
        if (method === '7z')  return Promise.resolve(base + 'extract7z.js');
        if (method === 'zip') return Promise.resolve(base + 'extractzip.js');
        if (method === 'rar') return Promise.resolve(base + 'libunrar-worker.js');
        return Promise.reject(new Error('Unknown compression method: ' + method));
    }
    decompressFile(method, data, updateMsg, fileCbFunc) {
        return new Promise(async callback => {
            const workerUrl = await this.getWorkerFile(method);
            const worker = new Worker(workerUrl);
            const files = {};
            worker.onmessage = (data) => {
                if (!data.data) return;
                //data.data.t/ 4=progress, 2 is file, 1 is zip done
                if (data.data.t === 4) {
                    const pg = data.data;
                    const num = Math.floor(pg.current / pg.total * 100);
                    if (isNaN(num)) return;
                    const progress = " " + num.toString() + "%";
                    updateMsg(progress, true);
                }
                if (data.data.t === 2) {
                    if (typeof fileCbFunc === "function") {
                        fileCbFunc(data.data.file, data.data.data);
                        files[data.data.file] = true;
                    } else {
                        files[data.data.file] = data.data.data;
                    }
                }
                if (data.data.t === 1) {
                    callback(files);
                }
            }
            worker.postMessage(data);
        });
    }
}

window.EJS_COMPRESSION = EJS_COMPRESSION;
