const { createReadStream, createWriteStream, fstat, writeFileSync } = require('fs');
const { Transform, PassThrough } = require('stream');
const zlib = require('zlib')
const { gzipSync, brotliCompressSync, deflateSync } = zlib;
//process.argv[2] => file
//process.argv[3] => destfile
//File to be transformed
const path = process.argv[2]
//Destiny
const destFile = process.argv[3]
console.log(path, destFile)
/**
 * El ejercicio consiste en comprimir un archivo con Deflate, Brotli y Gzip
 * Se debe de obtener el tiempo de ejecución de cada uno para ver
 * cuál de los sistemas de compresión es más eficiente
 */

//Creamos el stream de lectura
const reader = createReadStream(path)
let startDate;
reader.on('open', () => {
    startDate = Date.now()
    console.log(startDate)
})
reader.pipe(new Transform({
    transform(chunk, enc, cb) {
        this.push(gzipSync(chunk));
        cb();
    }
})).pipe(createWriteStream('./' + path + '.zip', { autoClose: true })).on('finish', () => {
    let finishMillis = Date.now();
    let message = 'ZIP compression: ' + (finishMillis - startDate) +  ' ms\n'
    writeFileSync('stats.txt',message, {flag: 'a'});
    reader.on('open', () => {
        startDate = Date.now()
        console.log(startDate)
    })
    reader.pipe(new Transform({
        transform(chunk, enc, cb) {
            this.push(deflateSync(chunk));
            cb();
        }
    })).pipe(createWriteStream('./' + path + '.DEFLATE', { autoClose: true })).on('finish', () => {
        let finishMillis = Date.now();
        let message = 'Deflate compression: ' + (finishMillis - startDate) +  ' ms\n'
        writeFileSync('stats.txt',message, {flag: 'a'});
        
          
reader.on('open', () => {
    startDate = Date.now()
    console.log(startDate)
})
reader.pipe(new Transform({
    transform(chunk, enc, cb) {
        this.push(brotliCompressSync(chunk));
        cb();
    }
})).pipe(createWriteStream('./' + path + '.BR', { autoClose: true })).on('finish', () => {
    let finishMillis = Date.now();
    let message = 'Brotli compression: ' + (finishMillis - startDate) +  ' ms\n'
    writeFileSync('stats.txt',message, {flag: 'a'});
      
})
    })
    
})

reader.on('open', () => {
    startDate = Date.now()
    console.log(startDate)
})
reader.pipe(new Transform({
    transform(chunk, enc, cb) {
        this.push(brotliCompressSync(chunk));
        cb();
    }
})).pipe(createWriteStream('./' + path + '.BR', { autoClose: true })).on('finish', () => {
    let finishMillis = Date.now();
    let message = 'Brotli compression: ' + (finishMillis - startDate) +  ' ms\n'
    writeFileSync('stats.txt',message, {flag: 'a'});
      
})


