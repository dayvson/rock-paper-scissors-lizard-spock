var host = window.document.location.host.replace(/:.*/, '');
var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
var room;
var players = {};


function tryToJoinRoom(){
    if(location.hash){
        console.log(location.hash.substring(1));
        client.joinById(location.hash.substring(1)).then(JoinRoom).catch((error)=> {
            client.joinOrCreate("GameRoom" ).then(JoinRoom);
        });
    }else{
        client.joinOrCreate("GameRoom" ).then(JoinRoom);
    }
}


function JoinRoom(room_instance, err) {
    room = room_instance    
    // listen to patches coming from the server
    room.state.players.onAdd = function (player, sessionId) {
        players[sessionId] = player;
    }

    room.state.players.onRemove = function (player, sessionId) {
        delete players[sessionId];
    }

    room.state.onChange = function(){
        GameManager.round = room.state.round;
        GameManager.winner = room.state.winner;
        GameManager.myId = room.sessionId;   
        GameManager.roundState = room.state.roundState;
        if(GameManager.roundState == "draw"){
            GameManager.reset();
            //room.send({newRound:true});
        }
    }

    room.state.players.onChange = function (player, sessionId) {
        players[sessionId] = player;
        GameManager.round = room.state.round;
        GameManager.winner = room.state.winner;
        GameManager.myId = room.sessionId;
        GameManager.roundState = room.state.roundState;
    }
    location.hash = room.id;
    console.log("My ID:", room.sessionId, room.state.round, room.state.winner);
};

tryToJoinRoom();