const express = require('express')
const http = require('http')
const path = require('path');
const socketio = require('socket.io')
const badWords = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = new express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.port || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory))
app.get('', (req, res) => {
    res.render('index.html')
})

app.get('/chat', (req, res) => {
    res.render('chat.html')
})

io.on('connection', (socket) => {
    console.log('Socket IO connected')

    //Random user id
    //let user = Math.round(Math.random()*100)

    // Join to a room with username
    socket.on('join', (options, cb) => {
        const {user, error} = addUser({
            id: socket.id,
            ...options
        })

        if(error) {
            return cb(error)
        }
        socket.join(user.room)
        socket.emit('newUserConnected', generateMessage('Welcome ' + user.username))
        // Tell all users that a new user has come
        socket.broadcast.to(user.room).emit('newUserAll', generateMessage(''),user) // send to all except to this user
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        cb()
    })

    // Show message of a user to all users
    socket.on('sendMessage',(message, callback) => {
        const user = getUser(socket.id)
        console.log(getUsersInRoom('mmm'))
        console.log(user)
        io.to(user.room).emit('sendMessageToAll', generateMessage(message), user)
        callback('Delivered')
    })

    socket.on('sendLocation',(coords, cb) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('sendLocationMessageToAll', generateMessage(''), coords, user)
        cb('Location shared !')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('newUserConnected', generateMessage(`${user.username} Disconnected !`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    /**
     * io.emit - send to all
     * socket.emit - send to itself who connected
     * socket.broadcast.emit - send to all except who connected
     * socket.join()
     * io.to.emit()
     * socket.broadcast.to.emit
     */
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})