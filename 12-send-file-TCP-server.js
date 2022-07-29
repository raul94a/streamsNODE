const { createWriteStream, existsSync, writeFileSync: w, createReadStream, WriteStream, writeFileSync } = require('fs');
const { createServer } = require('net');
const { Readable, Writable } = require('stream');

/**
 * Necesito un clase gestora de las peticiones al servidor.
 * Cada instancia de esta clase tendrá los datos suficientes para
 * gestionar el Stream. Ya no se utilizaran las variabels cc y cl de forma global
 * si no que cada instancia tendrá un CC, una CL y un stream, de tal forma que al decodificar
 * la señal podremos saber el stream al que pertenece, su longitud y su current length
 * De esta forma podrán gestionarse n- archivos de forma simultanea
 */
class StreamManager{
    constructor(channel){
        this.channel = channel
        this.writer = createWriteStream('./files/' + this.channel);
    }
}
const streamController = []
const files = {}
let size = 0;
function removeNullBytes(str) {
    return str.split("").filter(char => char.codePointAt(0)).join("")
}
function createWriter(file) {

    files[file] = createWriteStream('./files/' + file);
    return files[file];
}
let cc = null
let cl = null
let file = null
// const writer = createWriteStream('./files/mycopy.csv');
const server = createServer(socket => {
let iter = 0;

    socket.on('readable', () => {
        let chunk;
        let writer;
        let streamManager;
        if (cc === null) {
            chunk = socket.read(1)
            cc = chunk && chunk.readUInt8(0);
           

            // if(!file['length']){
            //     console.log('en file length no existe')
            //     // file = { length: cc }

            // }


        }else{
            // console.log('NO CC es nul!!!!!!!!!!!!!!!!!!!!!!!!!11 en', iter )

        }
        if(file === null){
            // console.log('CC vale esto =>', cc)
            file = socket.read(cc)
            if(file === null) return null;
            let filename = file.toString('utf-8')
            console.log(filename)
            if(!files[file]){
               createWriter(file)
            }
         
      
            file = filename.trim()
            
        }
   
        if (cl === null) {
            chunk = socket.read(4);
            cl = chunk && chunk.readUInt32BE(0)
            // console.log('cl: ', chunk.toString('utf-8'))
            if (cl === null) return null;
        }

      

        chunk = socket.read(cl);

        if (chunk === null) {
            return null;
        }
        writer = files[file]
        writer.write(chunk);
        cc = null;
        file = null;
        cl = null;

    }).on('end', () => {
        for(let writer in files){
            console.log('Cerrando flujo hacia', writer)
            files[writer].close()

        }
        socket.destroy();
        // server.close()
        console.log('Socket cerrado')
    })
    // socket.on('data', (chunk) => {
    //     if (chunk === null) return null;
    //      let writer;
    //     let c = chunk.readUint8(0)
    //     let filename = (chunk.subarray(5, c + 5)).toString('utf-8');
    //     console.log(c,filename)
    //   createWriter(filename);

    //   let b = chunk.readUInt32BE(0);
    //   console.log(chunk.toString('utf-8',0,b))
    //   let ca = chunk.toString('utf-8', c+ 6,c + 6 +b)
    //   console.log(ca)
    //   writer = files[filename]
    //   writer.on('finish', ()=>{writer.close(); writer.end()})
    //     writer.write(ca);






    // }).on('finish', function closeSocket(){
    //     socket.end();
    // })
    // socket.on('error', (err) => { })
})

server.listen(4040, () => {
    console.log('Server: ON');
})
    .on('connection', () => {
        console.log('Un cliente se ha conectado');
    })
    .on('close', () => {
        console.log('Server: OFF');
    })
    .on('error', (err) => console.log(err))



