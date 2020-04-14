var Animations = {
    'thumbs':[],
    'paper-rock':[],
    'paper-spock':[],
    'rock-lizard':[],
    'rock-scissors':[],
    'scissors-lizard':[],
    'scissors-paper':[],
    'spock-rock':[],
    'spock-scissors':[],
    'lizard-spock':[],
    'lizard-paper':[],
    sprite:null,
    selectAnimation:function(){
        
        if(Animations.sprite != null) return;
        var label = [];
        if(GameManager.gameMode == "single"){
            label = [commands[GameManager.playerChoice], commands[GameManager.computerChoice]];
        }else{
            for(let k in players){
                if(players[k].selection !== -1) label.push(commands[players[k].selection]);
            }
            if(label.length < 1) return;
        }
        Animations.sprite = new Sprite(Animations[label.join("-")], 130, 20, 0.1, 467, 350);

    },
    clearAnimation:function(){
        Animations.sprite = null;
    },

    displayWinner:function(){
        if(GameManager.winner == "computer" && Animations.sprite){
            push();
            translate(width, 0);
            scale(-1,1);
            Animations.sprite.display();
            pop();
        }else{
            if(Animations.sprite)Animations.sprite.display();
        }
    }

};
var commands=["rock", "paper", "scissors", "lizard", "spock"];

class Sprite {
    static loadImages(){

        let baseURL = "/imgs/";
        var preloadImages = function(numFrame, label1, label2){
            for(let i = 1; i<=numFrame; i++){
                let l = label1+"-"+label2;
                Animations[l].push(loadImage(baseURL+l+"-"+i+".png"));
            }
            Animations[label2+"-"+label1] = Animations[label1+"-"+label2];
        }

        preloadImages(5, "paper","rock");
        preloadImages(9, "paper","spock");
        preloadImages(6, "rock","lizard");
        preloadImages(7, "rock","scissors");
        preloadImages(5, "scissors","lizard");
        preloadImages(7, "scissors","paper");
        preloadImages(5, "spock","rock");
        preloadImages(2, "spock","scissors");
        preloadImages(3, "lizard","spock");
        preloadImages(6, "lizard","paper");

        Animations['thumbs']['question'] = loadImage(baseURL+"question_thumb.png");
        Animations['thumbs']['rock'] = loadImage(baseURL+"rock_thumb.png");
        Animations['thumbs']['paper'] = loadImage(baseURL+"paper_thumb.png");
        Animations['thumbs']['scissors'] = loadImage(baseURL+"scissors_thumb.png");
        Animations['thumbs']['lizard'] = loadImage(baseURL+"lizard_thumb.png");
        Animations['thumbs']['spock'] = loadImage(baseURL+"spock_thumb.png");

        Animations['arena-back'] = loadImage(baseURL+"arena-back.png");
        Animations['arena-front'] = loadImage(baseURL+"arena-front.png");

        Animations['start_screen'] = loadImage(baseURL+"start_screen.jpeg");
        
    }
    
    constructor(animation, x, y, speed, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.animation = animation;
        this.len = this.animation.length;
        this.speed = speed;
        this.index = 0;
    }

    display() {
        let index = floor(this.index) % this.len;
        image(this.animation[index], this.x, this.y, this.w, this.h);
        this.index += this.speed;
    }

}



class GameManager{
    static round = 1;
    static countDown = 3000;
    static gameState = 1;
    static timeElapsed;
    static choices = [0,0,0,0,0];
    static lastTimestamp = 0;
    static round = 0;
    static winner = "";
    static myId = "";
    static gameMode = "single";
    static playerChoice = -1;
    static computerChoice = -1;
    static loading = true;
    static roundState = "waiting";

    static addSelectionToPool(sel){
        GameManager.choices[sel]+=1;
    }

    static getAverageSelection(){
        var result = -1;
        var lastValue = 0;
        for(var i = 0; i<GameManager.choices.length; i++){
            let c = GameManager.choices[i];
            if(lastValue < c){
                result = i;
                lastValue = c; 
            }
        }
        return result;
    }

    static reset(){
        GameManager.choices = [0,0,0,0,0];
        GameManager.winner = "";
        GameManager.roundState = "waiting";
        GameManager.playerChoice = -1;
        GameManager.computerChoice = -1;
        GameManager.gameState = 2;
        console.log("RESET");
    }

    static send(){

        let sel = GameManager.getAverageSelection();
        Animations.clearAnimation();
        room.send({select: sel});
        GameManager.reset();
    }

    static checkSingleMatch(sel1, sel2){
        let result = false;
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
}