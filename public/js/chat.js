// const { isObject } = require("util");

// isObject()
const socket = io()

const form = document.querySelector('#msg-form');
const formButton = form.querySelector('button')
const formInput = form.querySelector('input')
const messagesDiv = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const { userName,room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
// const { userName,room } = qs.parse(location.search, { ignoreQueryPrefix: true })

// const user = Qs.parse(location.search, { ignoreQueryPrefix: true })


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    messagesDiv.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationMessageTemplate, {
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm:ss a')

    });
    messagesDiv.insertAdjacentHTML('beforeend', html)
})

// let btn = document.querySelector("#send")
// btn.addEventListener('click',()=>{
//     console.log("click")
//     socket.emit('increment')
// }) 

//options

form.addEventListener('submit', (e) => {
    formButton.setAttribute('disabled', 'disabled')
    e.preventDefault()
    // const msg = document.querySelector('#msg').value
    const msg = e.target.elements.msg.value
    socket.emit('sendMessage', msg, (ack) => {
        formButton.removeAttribute('disabled')
        formInput.value = ''
        formInput.focus()

        if (ack) {
            return console.log(ack)
        }
        console.log("Delivered the message")
    })
})

const locationButton = document.querySelector('#location')
locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert(`Location Isn't supported by your browser`)
    }

    navigator.geolocation.getCurrentPosition((position) => {
        locationButton.setAttribute('disabled', 'disabled')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (ack) => {
            locationButton.removeAttribute('disabled')
            if (ack) {
                return console.log(ack)
            }
            console.log("Location shared")
        })
    })
})
socket.on('sendLocation', (pos) => {
    console.log(pos)
})


socket.emit('join', { userName,room },(error)=>{

})