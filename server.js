require("dotenv").config();
const express = require('express')
const app = express()
    // const cors = require('cors')
    // app.use(cors())
const axios = require('axios')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const { v4: uuidV4 } = require('uuid')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {

   
        let roomId = uuidV4()
        res.redirect(`/${roomId}`)
   
       
})
app.get('/login', (req, res) => {
    res.render('login');
})
var userName;
app.post('/authenticate', (req, res) => {
    let email = req.body.uname;
    let password = req.body.psw;
    let roomIdByUser = req.body.roomId;
    axios.post('https://www.bharatinformatics.in/bussiness/authenticate/authenticateUser.php', {
        "email": email,
        "password": password
    }).then((response) => {

        if (response.data.message == 'Authentication Successful') {

            let roomId;
            if (roomIdByUser == "" || roomIdByUser == null) {
                roomId = "artbrushbyIshaLive"
                axios.post('https://www.bharatinformatics.in/bussiness/bussinessOperations/registerRoom.php', {
                    "emailId": email,
                    "roomId": roomId,
                    "name": response.data.name
                }).then(resb => {

                    userName = response.data.name;
                    res.redirect(`${roomId}?usertoken=${response.headers.hardtoken}&softtoken=${response.headers.softtoken}&email=${email}`)
                }, err => {
                    console.log(err)
                    res.render('error')
                })

            } else {
                roomId = roomIdByUser;
                axios.post('https://www.bharatinformatics.in/bussiness/bussinessOperations/authenticateRoom.php', {
                    "emailId": email,
                    "roomId": roomId,
                    "name": response.data.name
                }).then(resb => {

                    userName = response.data.name;
                    res.redirect(`/${roomId}?usertoken=${response.headers.hardtoken}&softtoken=${response.headers.softtoken}&email=${email}`)
                }, err => {
                    res.render('error', { Message: 'You dont have rights to connect to this channel. Contact Channel owner.' })
                })

            }


        } else {
            res.render('error')
        }
    }, (error) => {

        res.render('error', { Message: 'Wrong user/password' })

    });
})

app.get('/:room', (req, res) => {
    
            res.render('room', { roomId: req.params.room,name:'User'})
       
           
    



})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, name) => {



        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId, name);

        socket.on('message', (message, name) => {
            //send message to the same room

            io.to(roomId).emit('createMessage', message, name)
        });






        /*socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId);
        // messages
        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })*/
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId, name)
        })
    })
})
const port = process.env.PORT || 3030
server.listen(port)
console.log("runnin on port " + port)
