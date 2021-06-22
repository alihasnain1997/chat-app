const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
var Filter = require('bad-words')
const { generateMsg, generateLocationMsg } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')



const app = express()
const server = http.createServer(app)
const filter = new Filter();

const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath));

let count = 0;

//start connection
io.on('connection', (socket) => {

    // //emit message to the connected client
    // socket.emit('message', generateMsg('Welcome!'))

    // //emit message to the all connected clients except the cient who initated this
    // socket.broadcast.emit('message', generateMsg('A new use has joined the chat!'))

    socket.on('join', (options, callback) => {

        const { error, user } = addUser({
            id: socket.id,
            ...options
        })
        if (error) {

            return callback(error)
        }

        socket.join(user.room)

        //emit message to the connected client
        socket.emit('message', generateMsg(`Welcome ${user.userName}`))

        //emit message to the all connected clients except the cient who initated this
        socket.broadcast.to(user.room).emit('message', generateMsg(`${user.userName} has joined the chat!`))

        callback()
    })

    //listen for specific event
    socket.on('sendMessage', (msg, callback) => {

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        else {
            io.to('test').emit('message', generateMsg(msg))
            callback()
        }
        //emit message to all clients


    })

    socket.on('sendLocation', (location, callback) => {
        // console.log("inside socket of server reciever",location)
        // socket.broadcast.emit('sendLocation', location)
        io.emit('locationMessage', generateLocationMsg(`https://google.com/maps?q=${location.latitude},${location.longitude}`))

        callback('shared')


    })


    //listen for client disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMsg(`${user.userName} has left!`))
        } else {

        }
    })

})



server.listen(port, () => {
    console.log(`server started at port ${port}`)
})