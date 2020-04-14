let model, video, keypoints, predictions=[];

function preload() {
    Sprite.loadImages();
    video = createCapture(VIDEO, () => {
        video.size(320, 240);
        video.elt.addEventListener('loadeddata', (event) => {
            loadHandTrackingModel();
        });
    });
    
    video.hide();
}

const playBtn = document.getElementById("play-btn");
const playImg = document.getElementById("bgtitle");
const playAgain = document.getElementById("play-again-button");
const playMulti = document.getElementById("play-btn2");

function playButtonHandler(){
    if (GameManager.loading) {
        return;
    }
    GameManager.gameMode = "single";
    GameManager.myId = "player";
    playBtn.style.display = "none";
    playImg.style.display = "none";
    playAgain.style.display = "none";
    setTimeout(()=> {
        GameManager.lastTimestamp = millis();
        GameManager.reset();
    }, 1000);
}
playBtn.addEventListener("click", playButtonHandler);

playAgain.addEventListener("click", () => {
    if (GameManager.loading) {
        return;
    }
    
    GameManager.reset();
    if(GameManager.gameMode == "multi") room.send({newRound:true});
});

playMulti.addEventListener("click", () => {
    if (GameManager.loading) {
        return;
    }
    playBtn.style.display = "none";
    playImg.style.display = "none";
    playAgain.style.display = "none";
    playMulti.style.display = "none";
    GameManager.gameMode = "multi";
    GameManager.lastTimestamp = millis();
    tryToJoinRoom();
    setTimeout(()=>{
        room.send({playerStatus:1});
        GameManager.reset();
    }, 500);
    
});

function setup() {
    let myCanvas = createCanvas(848, 480);
    myCanvas.parent("p5-canvas");
    pixelDensity(1);
}

let textPos = 0;
function draw() {
    background(0);
    image(Animations['arena-back'], 0, height-Animations['arena-back'].height);
    if(GameManager.roundState == "winner") {
        Animations.selectAnimation();
        Animations.displayWinner();
        GameManager.gameState = 4;
    }else{
        if(GameManager.gameMode == "single"){
            showEnemyThumb(GameManager.computerChoice);
            
        }else{
            if(Object.keys(players).length > 1 ){
                
                let e = -1;
                for(let p in players){
                    if(players[p].sessionId != GameManager.myId && players[p].selection != null){
                        console.log("ENEMY SELECTION", players[p].selection)
                        e = players[p].selection;
                    }
                }
                showEnemyThumb(e);
            }
        }  
        Animations.clearAnimation();
    }
    
    if (predictions.length > 0) {
        // drawKeypoints(predictions[0]);
        // drawSkeleton(predictions[0].annotations);
        if(GameManager.roundState != "winner") showPlayerThumb(predictions[0].annotations);
    }else{
        if(GameManager.roundState != "winner") image(Animations["thumbs"]["question"], 100, 100);
    }
    

    if(GameManager.gameMode != "single" && players){
        textPos = 0;
        for(var k in players){
            var p = players[k];
            fill(255)
            textSize(23)
            text("Player: " + p.sessionId , textPos, 20)
            text(commands[p.selection]||"###", textPos, 60)
            text("Victories:" + p.victories, textPos, 100)
            textPos = width-200;
        }
    }

    if( (GameManager.gameState == 2 && GameManager.gameMode == "single") || 
        (GameManager.gameState == 2 && GameManager.gameMode == "multi" && GameManager.arePlayersReady())){
        GameManager.timeElapsed = millis() - GameManager.lastTimestamp;
        let time = round((GameManager.countDown - GameManager.timeElapsed) / 1000);
        fill(255);
        textAlign(CENTER);
        textSize(50);
        text(time < 0 ? "GO" : time, width/2, 100);
        if (GameManager.timeElapsed/1000 > GameManager.countDown/1000) {
            GameManager.gameState = 3;
            setTimeout(calculateMatch, 1000);
        }
        
        
    }
    if(GameManager.gameState == 4){
        shoWinner();
    }
    image(Animations['arena-front'], 0, height-Animations['arena-front'].height);
    
}



let lastRandom = 0;
function getNonRepeatRand() {
  while (true) {
    let randomNum = int(random(4));
    if (randomNum == lastRandom) {
      continue;
    }
    else {
      lastRandom = randomNum;
      return randomNum;
    }
  }
}

function calculateMatch(){

    if(GameManager.gameMode == "single"){
        GameManager.computerChoice = getNonRepeatRand();
        GameManager.playerChoice = GameManager.getAverageSelection();
        console.log("GameManager.computerChoice", GameManager.computerChoice);
        console.log("GameManager.playerChoice", GameManager.playerChoice);
        GameManager.winner = "";
        setTimeout(() => {
            if( GameManager.checkSingleMatch(GameManager.playerChoice, GameManager.computerChoice) ){
                GameManager.winner = GameManager.myId;
            }
            if( GameManager.checkSingleMatch(GameManager.computerChoice, GameManager.playerChoice) ){
                GameManager.winner = "computer";
            }
            if(GameManager.winner !== ""){
                GameManager.roundState = "winner";
                GameManager.gameState = 4;
            }else{
                GameManager.reset();
            }
        }, 1000);
        
    }else{
        GameManager.send();
        if(GameManager.roundState == "winner") GameManager.gameState = 4;
    }
    
    console.log("######## DONE #######");
    
}
function showPlayerThumb(hand){
    let index = -1;
    if(hand) index = getHandSelectionIndex(hand);

    if(index != -1) image(Animations["thumbs"][commands[index]], 100, 100);
    else image(Animations["thumbs"]["question"], 100, 100);
   
}

var enemyRollete = 0;

function showVSText(){
    fill(100 + (0.3 * sin(millis()/500) * 250) , 250 , 250);
    
    textSize(70 + (0.1 * sin(millis()/500) * 70) );
    textAlign(CENTER);
    text("VS", width/2,250);
}
function showEnemyThumb(index){
    showVSText();
    push();
    translate(width, 0);
    scale(-1,1);
    if(index > -1){
        console.log("show enemy ", index, commands[index])
        image(Animations["thumbs"][commands[index]], 130, 100);
    }else{
        image(Animations["thumbs"][commands[enemyRollete]], 130, 100);
        if(int(millis()) % 3 == 0) enemyRollete+=1;
        if(enemyRollete == 5){
            enemyRollete = 0;
        }
    }
    pop();
    
}
function shoWinner(){
    let winnerLabel = GameManager.myId == GameManager.winner ? "You Win!" : "You Lose!";
    fill(255);
    textSize(40);
    textAlign(CENTER)
    text(winnerLabel, width/2,100);
    playAgain.style.display = "block";
    

}
function keyPressed() {
    if (key === "r") {
        GameManager.reset();
        //room.send({newRound:true});
    }
    if (key === "s") {
        GameManager.gameState = 2;
        GameManager.lastTimestamp = millis();
        GameManager.winner = "";
        GameManager.roundState = "waiting";
        // room.send({newRound:true});
    }
}

async function loadHandTrackingModel() {
    // Load the MediaPipe handpose model.
    model = await handpose.load();
    predictHand();
    GameManager.loading = false;
    playBtn.innerHTML = "PLAY SINGLE";
    playMulti.style.display = "block";
    console.log("Model Loaded and Ready", playBtn);
}


async function predictHand() {
    predictions = await model.estimateHands(video.elt);
    if(predictions.length > 0 && GameManager.gameState == 3){
        setHandSelection(predictions[0].annotations);
    }
    
    setTimeout(() => predictHand(), 100);
}