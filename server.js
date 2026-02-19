const express = require('express');
const cors = require('cors');
const http = require('http')
const { Server } = require('socket.io');
const app = express();
const httpServer = http.createServer(app);
const serverPort = 'http://192.168.1.82:3000';
const controlPanelPort = 'http://192.168.1.82:5173';

let characters = [
  { id: 'char1', name: 'El verdadero', player: 'Lucas', hp_current: 28, hp_max: 35 },
  { id: 'char2', name: 'B12',    player: 'Sol',   hp_current: 30, hp_max: 30 }
];
let rolls = [];

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
    socket.emit('initialData', { characters, rolls });
});

httpServer.listen(serverPort.slice(-4), () => {
  console.log(`Server is running on port ${serverPort.slice(-4)}`);
});

app.use(cors({origin: '*'}));
app.use(express.json());

// io connection

//Landing
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

//character array
app.get('/api/characters', (req, res) => {
  res.status(200).json(characters);
});

app.put('/api/characters/:id/hp', (req, res) => {
    const charId = req.params.id;
    const { hp_current } = req.body;

    const character = characters.find(c => c.id === charId);
    if (!character) {
        return res.status(404).json({ error: 'Character not found' });
    }
    character.hp_current = hp_current;
    io.emit('hp_updated', { character, hp_current });
    return res.status(200).json(character);
});

app.post('/api/rolls', (req, res) => {
    const { charId, result, sides } = req.body;
    const modifier = req.body.modifier ?? 0;
    const rollResult = result + modifier;
    rolls.push({ charId, result, modifier, rollResult });
    io.emit('dice_rolled', { charId, result, modifier, rollResult, sides });
    console.log('Roll received:', req.body);
    return res.status(201).json({ charId, rollResult, sides });
});