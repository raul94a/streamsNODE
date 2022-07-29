const { createReadStream, createWriteStream, writeFileSync, ReadStream, } = require('fs');

const { Transform, PassThrough, pipeline } = require('stream');
const { createBrotliCompress } = require('zlib');

//read 
const path = 'london_crime_by_lsoa.csv'
const reader = createReadStream(path, {})
///1. Contador de crímenes por año
//Definimos un Map
const yearlyCrimeMap = new Map();
const years = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016].map(e => e.toString())
const object = {};
const containsYear = (element) => {
    if (
        element >= 2008 && element <= 2016
    ) {
        let years = yearlyCrimeMap.get(element)
        if (years) {
            yearlyCrimeMap.set(element, ++years)
        } else {
            yearlyCrimeMap.set(element, 1)
        }
        return true;
    }
    return false;

}

// console.log(year)
// reader.pipe(new PassThrough({
//     transform(chunk, enc, cb) {

//             let stringChunk = chunk.toString('utf-8')

//             // stringChunk.some(containsYear)
//             let array = stringChunk.split(',')
//             console.log(array)
//             for (let element of array) {

//                 if (year.includes(element)) {

//                    let number = yearlyCrimeMap.get(element) + 1|| 0 + 1;

//                     yearlyCrimeMap.has(element) ? yearlyCrimeMap.set(element, number) : yearlyCrimeMap.set(element, 1)
//                 }else{
//                     continue;
//                 }
//             }
//             this.push('');
//             cb()

//     }


// })).pipe(createWriteStream('copy.csv')).on('finish', () => {
//     console.log(yearlyCrimeMap)
//     console.log(Array.from(yearlyCrimeMap.values()).reduce((prev, c) => prev + c))
// })



class CustomTransformer extends Transform {
    constructor(transformHandler,map) {
        super()
        this.map = map;
     
        this.transformHandler = transformHandler;
    }
    _transform(chunk, enc, cb) {
        let concat = chunk.toString('utf-8');
        // this.tail = chunk.toString('utf-8')
        this.transformHandler(concat,this.map)
        this.push('');
        cb();
    }
    _flush(cb){
        this.push()
        cb();
    }
}

/**
 * @param {WriteStream} stream 
 * @param {Function} cb 
 * @returns {Map<string,number>}
 */
function promisifyStream(stream,cb){
    
    return new Promise((res,rej) => {
        stream.on('finish', ()=>{
            res(cb())
        })
    })
}

function splitByBreaklines(stringifyChunk){
    return stringifyChunk.split('\n')
}
function mapCrimeZones(stringifyChunk, map){
    let lines = splitByBreaklines(stringifyChunk);
    for (let line of lines) {
        writeFileSync('lines.txt',line + '\n')
        let place = line.split(',')[1]
        let ocurrences  = map.get(place)
        if (ocurrences) {
            ++ocurrences
        } else {
            ocurrences = 1
        }
        map.set(place, ocurrences)
    }
}
/**
 * 
 * @param {Map<string,number>} map 
 */
function filterMapByNumber(map, number){
     let keys = Array.from(map.keys())
        let filteredKeys = keys.filter(el => map.get(el) > number)
        const newObject = new Map();
        for(let k of filteredKeys) {
            newObject.set(k,map.get(k))
        }   
        return newObject;
}

async function londonCrime(path, transformHandler,filter, minimunOcurrencesToShow){
    const map = new Map()
    //1. Define the reader
    const reader = createReadStream(path)
    //2. Define how the data is gonna be transformed. What do we need?
    // const transformer = new CustomTransformer(); //Not my ideal solution, lets do directly
    const transformer = new CustomTransformer(
        
      transformHandler, map
        
        
    )
    //3. Exit of the chunks...
    const writer = createWriteStream('empty.txt')
    const stream = reader.pipe(transformer).pipe(writer)
    return promisifyStream(stream, ()=>{
        if(filter && minimunOcurrencesToShow){
            // if(config.setMinimun){
            //     return filter(map, config.number ? config.number : 0);
            // }
            return filter(map, minimunOcurrencesToShow)
        }
        return map;
    });
}

londonCrime('london_crime_by_lsoa.csv',mapCrimeZones)
    .then(map => console.log(map))

// londonCrime(path, (stringifyChunk, map)=>{
//     let lines = splitByBreaklines(stringifyChunk);
//     function includesYear(splitted){
    
//         return years.includes(splitted)
//     }
//     for(let line of lines){
//         let splittedLine = line.split(',');
//         let year = includesYear(splittedLine[5]) ? splittedLine[5] : splittedLine[4]
//         if(!years.includes(year)) continue;
//         let ocurrences = map.get(year);
//         if (ocurrences) {
//             ++ocurrences
//         } else {
//             ocurrences = 1
//         }
//         map.set(year, ocurrences)
//     }

// }).then(map => console.log(Array.from(map.values()).reduce((p,r) => p + r)))


