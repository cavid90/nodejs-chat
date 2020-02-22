const users = [];
// add user
const addUser = ({id, username, room}) => {
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    // validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        return {
            error: 'Username exists in the room'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user};
}

// remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// get user
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// get users in room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}