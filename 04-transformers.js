const { Readable, Writable, Transform, pipeline } = require('stream');
const { createReadStream, createWriteStream, renameSync, rename } = require('fs');
const zlib = require('zlib');



const comprimidor = new Transform({
    transform(chunk, enc, done) {
        return this.push(zlib.gzip(chunk,done))

    }
})




const transformador = new Transform({
    transform(chunk, encoding, cb) {
       
        return this.push(chunk)
    }
})
function finishCallback(fileExtension, file) {
    renameSync(fileExtension + '.rar', file + '.rar')
}

function manageError(err) {
    if (err) {
        console.log(err)
    }
}
// createReadStream('./The-Hero-of-Ages.txt').pipe(comprimidor).pipe(createWriteStream('./file.txt.rar'))
// .on('finish', ()=> rename('./file.txt.rar','file.rar',(err)=>{console.log(err)}))

createReadStream('./The-Hero-of-Ages.txt').pipe(comprimidor).on('data', (chunk) => {
    const writer = new Writable({
        write(chunk,encoding, err){
            this.write(chunk);
        }
    })
  

 
})
// const file = 'The-Hero-of-Ages';
// const extension = '.txt'
// const fileExtension = file + extension;
// pipeline(
//     createReadStream(fileExtension),
//     comprimidor, 
//     createWriteStream(`${fileExtension}.rar`), 
//     (err) => manageError(err))
// .on('finish', finishCallback.bind(this, fileExtension, file))