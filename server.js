const http = require('http');
const app = require('./app');
const user = require('./models/user');
const port = process.env.port || 3000;

const server = http.createServer(app);
var io = require('socket.io')(server);

require("./routers/socket")(app,io);

// var listId = [];
// var clients = {};
// var listSocket = [];
// //connect socket
// io.on("connection",(socket)=>{    

//     socket.on('sigin',(id)=>{
//         console.log(clients[id]);
//         clients[id] = socket;
//         console.log(clients);
//         //console.log(clients[id])
//         //console.log(clients);
//     })
//     socket.on('message',(data) => {
//         console.log(data);
//         let targetId = data.targetId;
//         if(clients[targetId])
//             clients[targetId].emit('message',data);
//     })

//     socket.on('connectId',(data) => {
//         listId.push(data);
//         console.log(listId);

//         if(listId.length >= 2){
//             //console.log(listId);
//             //emit event to conversation
    
//             //console.log(listId);
    
//             let sourceId = listId.splice(0,1);
//             let targetID = listId.splice(0,1);
//             console.log(sourceId+'  123  '+targetID);
//             console.log(listId);
//             if(clients[sourceId]){
//                 console.log('1');
//                 clients[sourceId].emit('toConversation',targetID);
//             }
//             if(clients[targetID]){
//                 console.log('2');
//                 clients[targetID].emit('toConversation',sourceId);
//             }
//         }
    
//     })
//     socket.on('deleteId',(id)=>{
//         // if(clients[id])
//         //     clients[id] = {};
//         delete clients[id];
//         console.log(clients);
//         console.log(listId.indexOf(id));
//         listId.splice(listId.indexOf(id), 1);
//         console.log(listId);
//     })
// })

server.listen(port);