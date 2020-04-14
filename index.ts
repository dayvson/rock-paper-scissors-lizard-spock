import path from 'path';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';


//Game
import { GameRoom } from "./GameRoom";



const port = Number(process.env.PORT || 2567);
const app = express()

app.use(cors());
app.use(express.json())

const gameServer = new Server({
  server: createServer(app),
  express: app,
  pingInterval: 0,
});

// register your room handlers
// Register ChatRoom as "chat"
gameServer.define("GameRoom", GameRoom);

app.use('/', express.static(path.join(__dirname, "static")));


// (optional) attach web monitoring panel
app.use('/colyseus', monitor());

gameServer.onShutdown(function(){
  console.log(`game server is going down.`);
});

gameServer.listen(port);


console.log(`Listening on http://localhost:${ port }`);
