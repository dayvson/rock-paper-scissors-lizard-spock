import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    constructor(id:any){
        super();
        this.sessionId = id;
    }
    @type("number")
    x = Math.floor(Math.random() * 400);

    @type("number")
    y = Math.floor(Math.random() * 400);

    @type("number")
    selection = -1;

    @type("number")
    victories = 0;

    @type("string")
    sessionId = "";
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();
    @type("string")
    public roundState = "waiting";
    @type("number")
    public round = 0;
    @type("string")
    public winner = "";
    whoWins(sel1:number, sel2:number){
        let result = false;
        if(sel1 == -1 || sel2 == -1) return false;

        if(sel1 == 0 && sel2 == 2 || sel2 == 3){
            result = true;    
        }else if(sel1 == 1 &&  (sel2 == 0 || sel2 == 4)){
            result = true;    
        }else if(sel1 == 2 &&  (sel2 == 1 || sel2 == 3)){
            result = true;    
        }else if(sel1 == 3 &&  (sel2 == 1 || sel2 == 4)){
            result = true;    
        }else if(sel1 == 4 &&  (sel2 == 0 || sel2 == 2)){
            result = true;    
        }
        return result;
    }
    checkMatch(){
        
       
        let bothPlayers: Array<any> = [];

        for (let id in this.players) {
            const player: Player = this.players[id];
            bothPlayers.push(player);
        }
        if(bothPlayers.length < 2){
            console.log("We don't have two players yet");
            this.roundState = "waiting";
        }else{
            this.roundState = "ready";
        }

        if(this.roundState == "waiting" || bothPlayers[0].selection == -1 || bothPlayers[1].selection == -1 ){
            return;
        }

        let winningPlayer:Player;
        console.log("CHECK MATCH:", bothPlayers[0].selection, bothPlayers[1].selection);
        if( this.whoWins( bothPlayers[0].selection, bothPlayers[1].selection) ){
            winningPlayer = bothPlayers[0];
            winningPlayer.victories += 1;
            console.log("Player 1 wins");
        }
        if( this.whoWins(bothPlayers[1].selection, bothPlayers[0].selection) ){
            winningPlayer = bothPlayers[1];
            winningPlayer.victories += 1;
            console.log("Player 2 wins");
        }
        if(winningPlayer){
            this.winner = winningPlayer.sessionId;
            console.log("Player Wins", winningPlayer)
            this.roundState = "winner";
        }else{
            console.log("Not a winner yet");


        }
    }

    createPlayer (id: string) {
        this.players[ id ] = new Player(id);
    }

    removePlayer (id: string) {
        delete this.players[ id ];
    }

    selectCharacter (id: string, selection: any) {
        console.log("selectCharacter", selection, id);
        this.players[ id ].selection = selection;
        this.checkMatch();
    }

    gotoNextRound(){
        for (let id in this.players) {
            const player: Player = this.players[id];
            player.selection = -1;
        }
        this.round += 1;
        this.winner = "";
        this.roundState = "waiting";
    }
}

export class GameRoom extends Room<State> {
    maxClients = 2;

    onCreate (options: any) {
        console.log("GameRoom created!", options);

        this.setState(new State());
    }

    onAuth(client:Client, options:any, req:any) {
        console.log(req.headers.cookie);
        return true;
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId);
        this.state.winner = "";
        this.state.roundState = "waiting";
    }

    onLeave (client:Client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client:Client, data:any) {
        console.log("GameRoom received message from", client.sessionId, ":", data);
        if(data.newRound){
            this.state.gotoNextRound();
        }else{
            this.state.selectCharacter(client.sessionId, data.select);
        }
    }

    onDispose () {
        console.log("Dispose GameRoom");
    }

}