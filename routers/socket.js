var listId = [];
var clients = {};
var listSocket = [];
var listImageMessageId = [];

const User = require('../models/user')
const Image = require('../models/image')
const ImageController = require('../controllers/image');

module.exports = (app, io) => {
    io.on("connection", (socket) => {

        socket.on('sigin', (id) => {
            clients[id] = socket;
        })
        socket.on('message', async (data) => {
            if (data.isImage) {
                const imageUrl = await ImageController.getUrl(data.message)
                listImageMessageId.push(data.message)
                data.message = imageUrl
            }
            console.log(data);
            let targetId = data.targetId;
            if (clients[targetId])
                clients[targetId].emit('message', data);
        })

        socket.on('connectId', (data) => {
            listId.push(data);
            console.log(listId);

            if (listId.length >= 2) {
                var sourceId = listId.splice(0, 1);
                var targetID = listId.splice(0, 1);
                console.log(sourceId + '  123  ' + targetID);
                //console.log(sourceId);
                if (clients[sourceId]) {
                    clients[sourceId].emit('toConversation', targetID);
                }
                if (clients[targetID]) {
                    clients[targetID].emit('toConversation', sourceId);
                }
            }

        })

        socket.on('deleteId', (id) => {
            listId.splice(listId.indexOf(id), 1);
            console.log(listId);
        })

        socket.on('updateState', async (id) => {
            console.log(id)
            const user = await User.findById(id)
            var listFriendId = user.listFriendId
            listFriendId.forEach((e) => {
                if (clients[e]) {
                    clients[e].emit('updateState', (id))
                }
            })
        })

        socket.on('disconnectRoom', (targerId) => {
            //console.log(listImageMessageId)

            listImageMessageId.forEach(async (id) => {
                await ImageController.destroyImage(id)
                const image = Image.findById(id)
                image.remove()
            })
            listImageMessageId.length = 0;
            console.log(listImageMessageId)
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


        ///////media area
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
            console.log('addSong' + id);
            if (clients[id])
                clients[id].emit('addSong', song);
        })

        socket.on('deleteSong', (song, id) => {
            console.log('deleteSong');
            if (clients[id])
                clients[id].emit('deleteSong', song);
        })

        ///////invite area
        socket.on('invite', (userId, friendId) => {
            // const user = await User.findById(userId)
            if (clients[friendId])
                clients[friendId].emit('invite', (userId))
        })

        socket.on('acceptConversation', (sourceId, targetID) => {

            if (clients[targetID]) {
                clients[targetID].emit('acceptConversation', sourceId);
            }
        })
    })
}