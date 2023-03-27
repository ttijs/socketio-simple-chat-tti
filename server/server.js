import express from "express";
import { Server } from 'socket.io';

const app      = express();
const port     = 3000;
const server   = app.listen(port, () => { console.log('Server running'); });
const io       = new Server(server);

const sockets  = [];
const users    = [];
const messages = [];

app.use(express.static('public'));
app.use(express.urlencoded({ extended:true }));
app.use(express.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  res.redirect(`/chat/${req.body.username}`);
});  

app.get('/chat/:username', (req, res) => {
  console.log("usn = " + req.params.username);
  res.render('chat', { username:req.params.username });
});


io.on('connection', (socket) => {                                         // Er werd een nieuwe connectie met SocketIO gedetecteerd

  sockets[socket.id] = socket;                                            // Sla nieuwe socket op in associatieve array genaamd 'sockets'

  socket.on('join', (username) => {
    users[socket.id] = username;                                          // Voeg username toe aan lijst
    io.emit('join', { username:username, users:Object.values(users) });   // Verstuur 'join' bericht aan alle clients
  });  

  socket.on('disconnect', (reason) => {
    const username = users[socket.id];                                    // Haal username op van de disconnect user 
    delete sockets[socket.id];                                            // Verwijder socket en username uit de lijsten
    delete users[socket.id];        
    io.emit('leave', { username:username, users:Object.values(users) });  // Verstuur 'leave' bericht aan resterende clients
  });

  socket.on('message', (data) => {
    const { messenger, message } = data;                                  // Haal variabelen messenger en message op uit data
    console.log('message in server.js = ' + messenger );
    io.emit('message', data);                                             // Verstuur 'message' bericht aan alle clients
  });

});