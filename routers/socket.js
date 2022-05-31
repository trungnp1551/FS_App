var listId = [];
var clients = {};
var listSocket = [];

module.exports = (app, io) => {
    io.on("connection", (socket) => {

        socket.on('sigin', (id) => {
            //console.log(clients[id]);
            clients[id] = socket;
            console.log(clients);
            //console.log(clients[id])
            //console.log(clients);
        })
        socket.on('message', (data) => {
            console.log(data);
            let targetId = data.targetId;
            if (clients[targetId])
                clients[targetId].emit('message', data);
        })

        socket.on('connectId', (data) => {
            listId.push(data);
            console.log(listId);

            if (listId.length >= 2) {
                //console.log(listId);
                //emit event to conversation

                //console.log(listId);
                var sourceId = listId.splice(0, 1);
                var targetID = listId.splice(0, 1);
                console.log(sourceId + '  123  ' + targetID);
                //console.log(sourceId);
                if (clients[sourceId]) {
                    //console.log(clients[sourceId]);
                    clients[sourceId].emit('toConversation', targetID);
                }
                if (clients[targetID]) {
                    //console.log(clients[targetID]);
                    clients[targetID].emit('toConversation', sourceId);
                }
            }

        })
        socket.on('deleteId', (id) => {
            listId.splice(listId.indexOf(id), 1);
            console.log(listId);
        })
        socket.on('disconnectRoom', (targerId) => {
            if (clients[targerId])
                clients[targerId].emit('beDisconnectRoom', '');
        })

        socket.on('logout', (id) => {
            listId.splice(listId.indexOf(id), 1);
            //console.log(listId);
            if (clients[id])
                delete clients[id];
            console.log(clients);
        })

        socket.on('play', (id) => {
            console.log('play');
            if (clients[id])
                clients[id].emit('play');
        })

        socket.on('pause', (id) => {
            console.log('pause');
            if (clients[id])
                clients[id].emit('pause');
        })

        socket.on('addSong', (song, id) => {
            console.log('addSong'+ id);
            if (clients[id])
                clients[id].emit('addSong', song);
        })

        socket.on('deleteSong', (song, id) => {
            console.log('deleteSong');
            if (clients[id])
                clients[id].emit('deleteSong', song);
        })

    })

}