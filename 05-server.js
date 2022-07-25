
const { createWriteStream, createReadStream } = require('fs');
const {createServer} = require('http');
const {basename, join} = require('path');
const { Transform, pipeline } = require('stream');


const server = createServer((req,res) => {
    //definimos el destino
    const filename = req.headers['x-filename'];
    const destFile = join('files',filename);
    const transf = new Transform({
        transform(chunk,enc,cb){
            this.push(Buffer.from(chunk).toString('base64'))
        }
    })

    //una vez tengamos el destino, cuando escuchemos un sending de data ddeberiamos escribir...
  
    req.pipe(createWriteStream(destFile)).on('finish',()=>{console.log('finished');
    req.destroy();
    res.writeHead(201, 'plain/text');
    return res.end('{"status": "file has been sent with success"}');

})
});


server.listen(3000, ()=> console.log('server started'))