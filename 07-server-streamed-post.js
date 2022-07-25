
const { createWriteStream, createReadStream } = require('fs');
const { createServer } = require('http');
const { basename, join } = require('path');
const { Transform, pipeline } = require('stream');


const server = createServer((req, res) => {
    //definimos el destino

    let transformation = '';

    const transf = new Transform({

        transform(chunk, enc, cb) {
            let chunkToTransform = chunk.toString().toUpperCase();
            transformation += chunkToTransform;
            this.push(chunkToTransform)
            cb();
        }
    })

    //una vez tengamos el destino, cuando escuchemos un sending de data ddeberiamos escribir...
    req
    .on('data',(ch)=>{
        console.log(ch)
    })
    .on('end', () => {
        console.log('FINISH', transformation);
        res.writeHead(200, 'application/json');
        res.end(JSON.stringify({ status: 'Streamed response has been completed with exit' }))
    })
});


server.listen(3000, () => console.log('server started'))