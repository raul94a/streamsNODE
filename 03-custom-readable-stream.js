const {Readable} = require('stream');
const Chance = require('chance')

const chance = new Chance();

class RandomStream extends Readable{
    constructor(options){
        super(options)
        this.emittedBytes = 0;
    }
    _read(size){
        const chunk = chance.string({length: size});
        this.push(chunk, 'utf8');
        this.emittedBytes += chunk.length;
        if(chance.bool({likelihood: 5})){
            this.push(null)
        }
    }
}

const rs = new RandomStream();

rs.on('data', (chunk) => {
    console.log(`Chunk read (${chunk.length} bytes): "${chunk.toString()}" `)
})
.on('end',()=>{
    console.log(`Produced ${rs.emittedBytes} bytes of random data`)
})