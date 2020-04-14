
function IsFingerOpen(finger, palms){
    let indexFLast = finger[3];
    let indexFFirst = finger[1];
    let palm = palms[0];
    let indexDistL = dist(indexFLast[0], indexFLast[1], indexFLast[2], palm[0],palm[1],palm[2]);
    let indexDistF = dist(indexFFirst[0], indexFFirst[1], indexFFirst[2], palm[0],palm[1],palm[2]);
    return !(indexDistL < indexDistF)
}

function IsjointNear(fingerA, fingerB){
    let dA = dist(fingerA[0][0], fingerA[0][1],fingerA[0][2],fingerB[0][0], fingerB[0][1],fingerB[0][2]);
    let dB = dist(fingerA[1][0], fingerA[1][1],fingerA[1][2],fingerB[1][0], fingerB[1][1],fingerB[1][2]); 
    return dB < (dA*1.5);
    
}

function IsPointyNear(fingerA, fingerB){
    let dA = dist(fingerA[3][0], fingerA[3][1],fingerA[3][2],fingerB[3][0], fingerB[3][1],fingerB[3][2]);
    let dB = dist(fingerA[3][0], fingerA[3][1],fingerA[3][2],fingerB[1][0], fingerB[1][1],fingerB[1][2]);
    
    let dC = dist(fingerB[3][0], fingerB[3][1],fingerB[3][2],fingerA[1][0], fingerA[1][1],fingerA[1][2])
    return dA < dB && dA < dC;
    
}

function isRock(hand){
    var t = !IsFingerOpen(hand.ringFinger, hand.palmBase) &&
    !IsFingerOpen(hand.pinky, hand.palmBase) &&
    !IsFingerOpen(hand.middleFinger, hand.palmBase) &&
    !IsFingerOpen(hand.indexFinger, hand.palmBase);
    
    return t;
    
}

function isScissor(hand){
    var t = !IsFingerOpen(hand.ringFinger, hand.palmBase) &&
    !IsFingerOpen(hand.pinky, hand.palmBase) &&
    IsFingerOpen(hand.middleFinger, hand.palmBase) &&
    IsFingerOpen(hand.indexFinger, hand.palmBase);
    
    return t;  
}

function isSpock(hand){
    var t = IsFingerOpen(hand.ringFinger, hand.palmBase) &&
    IsFingerOpen(hand.pinky, hand.palmBase) &&
    IsFingerOpen(hand.middleFinger, hand.palmBase) &&
    IsFingerOpen(hand.indexFinger, hand.palmBase);
    var joinNearA = IsjointNear(hand.indexFinger, hand.middleFinger)
    var joinNearB = IsjointNear(hand.middleFinger, hand.ringFinger)
    var joinNearC = IsjointNear(hand.pinky, hand.ringFinger);
    
    return t && joinNearA && !joinNearB && joinNearC;
        
}

function isPaper(hand){
    var t = IsFingerOpen(hand.ringFinger, hand.palmBase) &&
    IsFingerOpen(hand.pinky, hand.palmBase) &&
    IsFingerOpen(hand.middleFinger, hand.palmBase) &&
    IsFingerOpen(hand.indexFinger, hand.palmBase);
    return t && !isSpock(hand) && !isLizard(hand);
}

function isLizard(hand){
    var joinNearA = IsPointyNear(hand.indexFinger, hand.thumb)
    var joinNearB = IsPointyNear(hand.middleFinger, hand.thumb)
    var joinNearC = IsPointyNear(hand.ringFinger,hand.thumb);
    var joinNearD = IsPointyNear(hand.pinky, hand.thumb);
    
    return joinNearA && joinNearB && joinNearC && joinNearD && !isRock(hand);
}

function getHandSelectionIndex(hand){
    let index = -1;
    if(isRock(hand)){
        index = 0
    }else if(isScissor(hand)){
        index = 2;
    }else if(isSpock(hand)){
        index = 4;
    }else if(isPaper(hand)){
        index = 1;
    }else if(isLizard(hand)){
        index = 3;
    }
    return index;
}
function setHandSelection(hand){
    let index = getHandSelectionIndex(hand);
    if(index!=-1)GameManager.addSelectionToPool(index);

}

// A function to draw ellipses over the detected keypoints
function drawKeypoints(hand)  {
    for (let j = 0; j < hand.landmarks.length; j++) {
        let keypoint = hand.landmarks[j];
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint[0], keypoint[1], 10, 10);
    }
}


// A function to draw the skeletons
function drawSkeleton(hand) {
    stroke(255, 0, 0);
    for (let j = 0; j < hand.thumb.length - 1; j++) {
        line(hand.thumb[j][0], hand.thumb[j][1], hand.thumb[j + 1][0], hand.thumb[j + 1][1]);
    }
    for (let j = 0; j < hand.indexFinger.length - 1; j++) {
        line(hand.indexFinger[j][0], hand.indexFinger[j][1], hand.indexFinger[j + 1][0], hand.indexFinger[j + 1][1]);
    }
    for (let j = 0; j < hand.middleFinger.length - 1; j++) {
        line(hand.middleFinger[j][0], hand.middleFinger[j][1], hand.middleFinger[j + 1][0], hand.middleFinger[j + 1][1]);
    }
    for (let j = 0; j < hand.ringFinger.length - 1; j++) {
        line(hand.ringFinger[j][0], hand.ringFinger[j][1], hand.ringFinger[j + 1][0], hand.ringFinger[j + 1][1]);
    }
    for (let j = 0; j < hand.pinky.length - 1; j++) {
        line(hand.pinky[j][0], hand.pinky[j][1], hand.pinky[j + 1][0], hand.pinky[j + 1][1]);
    }

    line(hand.palmBase[0][0], hand.palmBase[0][1], hand.thumb[0][0], hand.thumb[0][1]);
    line(hand.palmBase[0][0], hand.palmBase[0][1], hand.indexFinger[0][0], hand.indexFinger[0][1]);
    line(hand.palmBase[0][0], hand.palmBase[0][1], hand.middleFinger[0][0], hand.middleFinger[0][1]);
    line(hand.palmBase[0][0], hand.palmBase[0][1], hand.ringFinger[0][0], hand.ringFinger[0][1]);
    line(hand.palmBase[0][0], hand.palmBase[0][1], hand.pinky[0][0], hand.pinky[0][1]);

}