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
        this.writer = createWriteStream('./files/' + this.channel)
    }
    drain(socket){
        socket.emit('drain')
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


        }
        if(file === null){
            // console.log('CC vale esto =>', cc)
            file = socket.read(cc)
            if(file === null) return null;
            let filename = file.toString('utf-8')
            // console.log(filename)
            let channelExists = false;
        
            streamManager = streamController.filter(element => element.channel === filename)[0];
            if(!streamManager){
                console.log('No existe un canal para', filename)    
            }else{
                // console.log('Existe canal para',filename)
                channelExists = true;
            }
         
            if(!channelExists){
                console.log('Creando el canal para el archivo', filename)
                streamManager = new StreamManager(filename)
                streamController.push(streamManager);
            }
            // console.log(filename)
            // if(!files[file]){
            //    createWriter(file)
            // }
         
      
            file = filename.trim()
            
        }
   
        if (cl === null) {
            chunk = socket.read(4);
            cl = chunk && chunk.readUInt32BE(0)
            // console.log('cl: ', chunk.toString('utf-8'))
            if (cl === null) return ;
        }

      

        chunk = socket.read(cl);


        if (chunk === null) {
        
            // console.log('Chunk es null para el canal',file)
            // console.log('La razon es', cl, chunk)
       
           // socket.emit('drain');
            socket.on('drain',()=>{
                console.log('Drained with ', file)
            })
            return null;
        }
        // writer = files[file]
        // console.log(file);
        writer = streamController.filter(element => element.channel === file)[0]
        let writerclass=writer;
        let path = writer.channel
        writer = writer.writer;
        // console.log(writer);
        // console.log(`Escribinedo en el canal ${path}`)
        writer.write(chunk);
       // writerclass.drain(socket)
        cc = null;
        file = null;
        cl = null;

    })/*.on('end', () => {
        for(let stream of streamController){
            console.log('Cerrando flujo hacia', stream.channel)
            stream.writer.close();

        }
        socket.destroy();
        server.close()
        console.log('Socket cerrado')
    })*/
})

server.listen(4040, () => {
    console.log('Server: ON');
}).on('readable',()=>{
    console.log('server read')
})
    .on('connection', () => {
        console.log('Un cliente se ha conectado');
    })
    .on('close', () => {
        console.log('Server: OFF');
    })
    .on('error', (err) => console.log(err))



