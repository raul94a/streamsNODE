const pumpify = require('pumpify')
const { createReadStream, createWriteStream, writeFileSync, } = require('fs');
const { Transform } = require('stream')
const { gzipSync, deflateSync, brotliCompressSync } = require('zlib');

/**
 * Este es el ejercicio bien resuelto
 * Como principal conclusión la compresion Brotli es más lenta
 * Deflate y ZIP son similares
 * Si combinamos deflate / ZIP con Brotli, los primeros se relantizan (misma velocidad que Brotli)
 * Si combinamos ZIP y Deflate, la performance se ve disminuida muy poco (el doble de lento, es decir, de 80ms a 150ms aprox)
 * Si combinamos los tres se relantiza también
 * El cuello de botella es Brotli. Si  ejecutamos varias conversiones de Brotli los tiempos de compresión se suman
 * 
 * Tiempo de compresion Brotli para archivos .txt
 *  t = size (KB) * K
 *  Donde K es una constante que vale 1.165 ms / Kb
 * Si se tienen paralelamente más brotli, se multiplica el tiempo calculado x el numero de Brotli para 
 * obtener el tiempo total
 */
class CompressionManager {

    constructor() {

    }
    copy(){
        return this;
    }
    #writeStats(message) {
        writeFileSync('stats.txt', message + '\n', { flag: 'a' })
    }
    reader(path) {
        return createReadStream(path)
    }
    writer(destFile, path, extension, startDate = Date.now()) {
        return createWriteStream(destFile + '/' + path + extension).on('finish', () => {
            const endDate = Date.now();
            let type = extension  ==='.zip' ? 'ZIP': extension === '.BR' ? 'Brotli': 'Deflate' 
            const message = `${type} compression performance: ${(endDate - startDate)} ms.`
            this.#writeStats(message);

        })
    }
    ZIPCompressionStream(path, destFile) {
        //1. Prepare the reader

        const startDate = Date.now()
        const reader = this.reader(path)

        //2. Transform the chunks with the compression Transform stream
        const zipTransformer = new Transform({
            objectMode: true,
            transform(chunk, enc, cb) {
                this.push(gzipSync(chunk))
                cb();
            }
        })
        //3. Writer
        const extension = '.zip'
        const writer = this.writer(destFile, file, extension, startDate)
        const combinedStream = pumpify(reader, zipTransformer, writer)
        return combinedStream;
    }
    BrotliCompressionStream(path,destFile){
        const startDate = Date.now()
        const extension = '.BR'
        const reader = createReadStream(path)//this.reader(path);
        const brotliTransformer = new Transform({
            objectMode: true,
            transform(chunk, enc, cb) {
                this.push(brotliCompressSync(chunk))
                cb();
            }
        })
        const writer = createWriteStream(destFile + '/' + path + extension).on('finish', () => {
            writer.close()
            const endDate = Date.now();
           // let type = extension  ==='.zip' ? 'ZIP': extension === '.BR' ? 'Brotli': 'Deflate' 
            const message = `Brotli compression performance: ${(endDate - startDate)} ms.`
            this.#writeStats(message);

        })//this.writer(destFile, file, extension, startDate)
        const combinedStream = pumpify(reader, brotliTransformer, writer)
        return combinedStream;
    }

    DeflateCompressionStream(path,destfile){
        const startDate = Date.now()
        const extension = '.DEFLATE'
        const reader = this.reader(path);
        const deflateTransform = new Transform({
            objectMode: true,
            transform(chunk, enc, cb) {
                this.push(deflateSync(chunk))
                cb();
            }
        })
        const writer = this.writer(destFile, file, extension, startDate)
        const combinedStream = pumpify(reader, deflateTransform, writer)
        return combinedStream;
    }

}
const file = process.argv[2]
const destFile = process.argv[3]
const compressor = new CompressionManager()
// compressor.BrotliCompressionStream(file,destFile);
// compressor.DeflateCompressionStream(file,destFile);
// // compressor.ZIPCompressionStream(file,destFile);
const compressor2 = new CompressionManager()
// compressor2.ZIPCompressionStream(file,destFile)
compressor.BrotliCompressionStream(file,destFile)
// compressor2.BrotliCompressionStream(file,destFile)
// compressor2.ZIPCompressionStream(file,destFile)
// compressor.BrotliCompressionStream(file,destFile)
// compressor2.BrotliCompressionStream(file,destFile)
// compressor2.ZIPCompressionStream(file,destFile)
// compressor.BrotliCompressionStream(file,destFile)
// compressor2.BrotliCompressionStream(file,destFile)
// compressor2.ZIPCompressionStream(file,destFile)
// compressor.BrotliCompressionStream(file,destFile)
// compressor2.BrotliCompressionStream(file,destFile)



