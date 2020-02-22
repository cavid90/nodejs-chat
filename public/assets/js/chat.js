const socket = io()

socket.on('newUserConnected', (message) => {
    const html = Mustache.render(messagesTemplate, {
        user: 'System',
        message: message.text,
        time: moment(message.createdAt).format('hh:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('newUserAll', (message, user) => {
    const connectedUser = `${user.username}`;
    const messageText = `${connectedUser} joined to us !`

    console.log(message)
    const html = Mustache.render(messagesTemplate, {
        user: 'System',
        message: messageText,
        time: moment(message.createdAt).format('hh:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('sendMessageToAll', (message, user) => {
    const messageText = message.text
    console.log(messageText)
    const html = Mustache.render(messagesTemplate, {
        user: user.username,
        message: messageText,
        time: moment(message.createdAt).format('hh:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sendLocationMessageToAll', (message, coords, user) => {
    const html = Mustache.render(messagesTemplateLocation, {
        user: user.username,
        lat:coords[0],
        long:coords[1],
        time: moment(message.createdAt).format('hh:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    $sidebar.innerHTML = html
})

// Elements
const $chatForm = document.querySelector('#chat')
const $messageInput = document.querySelector('#message')
const $sendButton = document.querySelector('#send')
const $shareLocationButton = document.querySelector('#shareLocation')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messagesTemplate = document.querySelector('#message-template').innerHTML
const messagesTemplateLocation = document.querySelector('#message-template-location').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMmessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if((containerHeight-newMmessageHeight) <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

$chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $sendButton.setAttribute('disabled', 'disabled')
    let message = e.target.elements.message.value;
    if(message.length < 3) {
        $sendButton.removeAttribute('disabled')
        return alert('Message lenght should be greater than 3 characters !')
    }
    //console.log('Clicked ' + message)
    socket.emit('sendMessage', message, (returnMessage) => {
        $sendButton.removeAttribute('disabled')
        $messageInput.value = '';
        $messageInput.focus()
        console.log('Message was delivered - '+returnMessage)
    })
})

document.querySelector('#shareLocation').addEventListener('click', (e) => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser !')
    }

    $shareLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        $shareLocationButton.removeAttribute('disabled')
        const coords = [position.coords.latitude, position.coords.longitude]
        socket.emit('sendLocation', coords, (acknowledgement) => {
            console.log(acknowledgement)
        })
    })
})

socket.emit('join', {username, room}, (error) => {

})