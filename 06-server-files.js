const { createWriteStream, createReadStream, renameSync } = require('fs');
const { createServer, IncomingMessage } = require('http');
const { basename, join } = require('path');
const { Transform, pipeline, Readable, Writable } = require('stream');
const formidable = require('formidable');

const server = createServer((req, res) => {
    const form = new formidable.IncomingForm({ multiples: true })
    form.uploadDir = 'files'
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log('some error', err)
        } else if (!files.file) {
            console.log('no file received')
        } else {
            console.log(files)
            let fileList = files.file;
            for (let file of fileList) {
                console.log(file)
                renameSync(file.filepath, 'files/' + file.originalFilename)

                console.log('saved file to', file.path)
                console.log('original name', file.name)
                console.log('type', file.type)
                console.log('size', file.size)
            }


        }
    })
    let data = [];
    //parseemos el tema
    req.on('data', (chunk) => {
        data.push(chunk);
    })
    req.on('end', () => {
        return res.end(JSON.stringify({ STATUS: 'todo ok' }));
    })
    // //definimos el destino
    // const filename = req.headers['x-filename'];

    // const destFile = join('files',filename);
    // const transf = new Transform({
    //     transform(chunk,enc,cb){
    //         this.push(Buffer.from(chunk).toString('base64'))
    //     }
    // })

    // //una vez tengamos el destino, cuando escuchemos un sending de data ddeberiamos escribir...

    // req.pipe(createWriteStream(destFile)).on('finish',()=>{console.log('finished');
    // req.destroy();
    // res.writeHead(201, 'plain/text');
    // return res.end('{"status": "file has been sent with success"}');

})



server.listen(3000, () => console.log('server started'))