
const { createReadStream, readdirSync } = require('fs');
const { connect } = require('net');
const { PassThrough } = require('stream');

///Vamos a enviar el CSV de los crímenes de Londres mediante TCP

/**
 *  Estrategia:
 * 1. Activaremos con un PassThrough vacío el envío de información al servidor
 * 
 * 
 */
let localhost = '127.0.0.1'
let other = '192.168.1.138'
function sendToServer() {
    let connectionStream = new PassThrough();
    let port = 4040
    const socket = connect({port:port, host:localhost }, () => {

    })
    socket.on('connect', (err)=>{
        console.log('Connected:',err)
    })

    return [socket, connectionStream]
}
const [socket, connectionStream] = sendToServer();


const streamSources = [
    // { reader: createReadStream('00-read-stdin.js'), name: '00-read-stdin.js' },
    // { reader: createReadStream('01-read-stdin-flowing.js'), name: '01-read-stdin.js' },
    // { reader: createReadStream('02-async-iterator.js'), name: '02-read-stdin.js' },
    // { reader: createReadStream('stats.txt'), name: 'stats.txt' },
    // {reader: createReadStream('Doritos.jpg'), name:'doris.jpg'},
    // { reader: createReadStream('st2.csv'), name: 'st2.csv' },
    // {reader: createReadStream('london_crime_by_lsoa.csv'), name: 'crimes.csv'},
]
let openChannels = streamSources.length;
console.log('OPEN READERS:', openChannels)
let cc = null
let iter = 0;
let size = 0;
let  files = readdirSync('.',{},'.js').filter(e=>e.endsWith('.js') || e.endsWith('.jpg') || e.endsWith('.png'))
console.log(files)
streamSources.push({reader: createReadStream('st2.csv'), name: 'st2.csv'})
for(let f of files){
    streamSources.push({reader:createReadStream(f), name:f})
}
 // let readerr = createReadStream(sources[0])

function releaseStreaming() {
    // if (streamSources.length === 0) {
        //     socket.end();
        //     socket.destroy();
        //     console.log('Se ha acabado todo...')
        //     return;
        // }
        let streamer = streamSources.shift();
        socket.setKeepAlive(true)
    console.log('fetch stream with path', streamer.name)
    streamer.reader.on('readable', function reader() {
        let chunk;
        while ((chunk = this.read()) !== null) {
            if (chunk === null) {
                this.end();
                return;
            }
           
            size += chunk.length;
            if (size % 1000 == 0) {
                // console.log(`Se han subido ${(size / 1000)} KB`)
            }
            // iter++;
            // if(iter === 4){
            //     this.close();
            //     this.end();
            //     break;
            // }
            let name = streamer.name


            //         //1 byte para la longitud del nombre del archivo
            //         //4 bytes para la longitud del chunk + nombre del archivo
            //         //el nombre

            //         //el chunk
            const outbuf = Buffer.alloc(1 + name.length + 4 + chunk.length);
            outbuf.writeUInt8(name.length, 0);
            const nameB = Buffer.from(name);
            nameB.copy(outbuf, 1)
            outbuf.writeUInt32BE(chunk.length, 1 + name.length)
            //         // outbuf.writeUint16BE(name,6)
            chunk.copy(outbuf, 5 + name.length)



            //         socket.write(outbuf)
            // writeFileSync('./log.txt', outbuf.toString('utf-8'),{flag:'a'})
            socket.write(outbuf)
            // socket.pipe(socket)
        }



    }).on('end', () => {
        // streamer.reader.close();
       
    }).on('close',()=>{
        size=0
        console.log('cerrando: ', streamer.name)
        if (streamSources.length > 0) {
            // console.log('llamadno al siguiente archivo')
            //crucial!
            setTimeout(()=>{
                // socket.destroy();
                releaseStreaming()

            },1200)

        }else{
            setTimeout(()=>{
                socket.destroy();

            },2000)
        }
    })
}
releaseStreaming();


