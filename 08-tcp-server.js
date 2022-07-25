const net = require('net');
const server = net.createServer(function socket(socket) {});
server.listen(3500, () => {
    console.log('Se ha iniciado el servidor TCP')
})
//listener
server.on('connection', ()=>{
    console.log('Un cliente se ha conectado')
})