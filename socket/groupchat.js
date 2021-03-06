module.exports = function(io, User, _) {
    const users = new User();


    io.on('connection', (socket) => {
        socket.on('join', (params, callback) => {
            socket.join(params.room);
            
            users.AddUserData(socket.id, params.sender.username, params.room, params.sender);
            
            io.to(params.room).emit('usersList', users.GetUsersList(params.room));
            
            let message = `This is the room for ${params.room} fans. Messages in this room are not saved. You can now start sending messages in this room.`
            io.to(params.room).emit('welcomeMsg', message)
            
            socket.join(params.sender.username);
            
            callback();
        });

        socket.on('createMessage', (message) => {
            io.to(message.room).emit('newMessage', {
                text: message.text,
                room: message.room,
                from: message.sender
            });
        });
        
        socket.on('add-image', (message) => {
            io.to(message.room).emit('newMessage', {
                text: message.text,
                room: message.room,
                from: message.sender,
                image: message.image
            });
        });
        
        socket.on('request', (friend) => {
            io.to(friend.receiver).emit('newFriend', {
               from: friend.sender,
               to: friend.receiver
            }); 
        });
        
        socket.on('refresh', (friend) => {
            io.emit('refreshPage', {}) 
        });

        

        socket.on('disconnect', () => {
            const user = users.RemoveUser(socket.id);
            if(user){
                const userData = users.GetUsersList(user.room);
                io.to(user.room).emit('usersList', userData);
            }
        })
    });
}
