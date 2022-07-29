
const { Socket } = require('dgram');
const { createReadStream, writeFileSync } = require('fs');
const { connect } = require('net');
const { PassThrough } = require('stream');

///Vamos a enviar el CSV de los crímenes de Londres mediante TCP

/**
 *  Estrategia:
 * 1. Activaremos con un PassThrough vacío el envío de información al servidor
 * 
 * 
 */

function sendToServer() {
    let connectionStream = new PassThrough();
    let port = 4040
    const socket = connect(port, () => {

    })
    return [socket, connectionStream]
}
const [socket, connectionStream] = sendToServer();

const sources = ['stats.txt', 'st2.csv'];
let openChannels = sources.length;
let cc = null
let iter = 0;
let size = 0;
let readerr = createReadStream(sources[0])
readerr.on('readable', function reader() {
    let chunk;
    while ((chunk = this.read()) !== null) {
        iter++;
        size += chunk.length;
        if(iter % 10 == 0){
            console.log(`Se han subido ${(size / 1000)} KB`)
        }
        // iter++;
        // if(iter === 4){
        //     this.close();
        //     this.end();
        //     break;
        // }
        let name = sources[0];
        //         //1 byte para la longitud del nombre del archivo
        //         //4 bytes para la longitud del chunk + nombre del archivo
        //         //el nombre

        //         //el chunk
        const outbuf = Buffer.alloc(1 + name.length + 4 + chunk.length);
        outbuf.writeUInt8(name.length, 0);
        const nameB = Buffer.from(name);
        nameB.copy(outbuf,1 )
        outbuf.writeUInt32BE(chunk.length,1 + name.length)
        //         // outbuf.writeUint16BE(name,6)
        chunk.copy(outbuf,5 + name.length)



        //         socket.write(outbuf)
        // writeFileSync('./log.txt', outbuf.toString('utf-8'),{flag:'a'})
        socket.write(outbuf)
        // socket.pipe(socket)
    }
   
   

}).on('end',function end(){
    console.log('se ha terminado de mandar esto')
    readerr.close()
    socket.destroy();
 
})

.on('error', function close(){
  
}).on('finish', function close(){
    this.close()
    this.end();
})
// .on('data',(chunk)=>{
//         let name = sources[1];
//         //1 byte para la longitud del nombre del archivo
//         //4 bytes para la longitud del chunk + nombre del archivo
//         //el nombre

//         //el chunk
//         const outbuf = Buffer.alloc(1 + 5 + chunk.length);
//         outbuf.writeUInt8(name.length,0);
//         outbuf.writeUInt32BE(chunk.length,1)
//         // outbuf.writeUint16BE(name,6)
//         const nameB = Buffer.from(name);
//         nameB.copy(outbuf,5)
//         chunk.copy(outbuf,5 + name.length)



//         socket.write(outbuf)

// })




/*.on('data', (chunk) => {
    let name = sources[1];
    //vamos a reservar 50 bytes para el header
    const headerBytes = 50;
    
    const outBuffer = Buffer.alloc(headerBytes + chunk.length)
    outBuffer.write(name, 0,headerBytes)
    console.log(outBuffer)
    outBuffer.write(chunk.toString(), headerBytes)


    // chunk.copy(outBuff, chunk.length * 8)


    console.log('Sending packet to chanel ', name);
    socket.write(

      outBuffer
    )


})*/


