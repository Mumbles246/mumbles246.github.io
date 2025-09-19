// Theme switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle-button');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? 'Mode: Dark' : 'Mode: Light';
    themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? 'Mode: Dark' : 'Mode: Light';
    });
});

// CPS checker functionality - Nothing Changed Here
var p1InputArray = [];
var p2InputArray = [];

var p1Rule1Breaks = [];
var p2Rule1Breaks = [];
var p1Rule2Breaks = [];
var p2Rule2Breaks = [];
var p1Rule3Breaks = [];
var p2Rule3Breaks = [];

var p1Rule2MaxCull = [];
var p2Rule2MaxCull = [];
var p1Rule3MaxCull = [];
var p2Rule3MaxCull = [];

var p1Rule2MinCull = [];
var p2Rule2MinCull = [];
var p1Rule3MinCull = [];
var p2Rule3MinCull = [];

var p1SwiftClicks = [];
var p1InverseSwiftClicks = [];
var p2SwiftClicks = [];
var p2InverseSwiftClicks = [];
var p1SeparatedMacro = [];
var p2SeparatedMacro = [];

var timewarpInfo = [];
var currentTimewarp = 1;

var framerate;
var macroName = '<not provided>';

document.getElementById('textbox').value = '';
document.getElementById('outbox1').value = '';
document.getElementById('outbox2').value = '';

document.getElementById('checkButton').addEventListener('click', async () =>{
    const macroTxt = document.getElementById('textbox').value;
    if(macroTxt === ''){
       return alert('Please provide a macro');
    }

    if(!validMacro(macroTxt)){
        document.getElementById('invalid-text').style.display = 'block';
        return;
    }
    document.getElementById('invalid-text').style.display = 'none';

    parseInputsToP1P2Array(macroTxt);
    splitMacro(macroTxt);
    extractSwiftsFromP1Macro();
    extractSwiftsFromP2Macro();

    document.getElementById('fps-text').textContent = 'FPS: ' + framerate;
    document.getElementById('fps-text').style.display = 'block';
    document.getElementById('fps-text').style.fontWeight = 'bold';
    document.getElementById('checkboxes').style.display = 'block';
    document.getElementById('p1swiftsbox').style.visibility='visible';

        document.getElementById('p1st').style.visibility='visible';
        document.getElementById('p1inverseswiftsbox').style.visibility='visible';
        document.getElementById('p1ist').style.visibility='visible';
        document.getElementById('p2swiftsbox').style.visibility='visible';
        document.getElementById('p2st').style.visibility='visible';
        document.getElementById('p2inverseswiftsbox').style.visibility='visible';
        document.getElementById('p2ist').style.visibility='visible';
        document.getElementById('totalswifttext').style.visibility='visible';
        document.getElementById('totalinverseswifttext').style.visibility='visible';
        document.getElementById('totalswiftandinversetext').style.visibility='visible';

    checkP1CpsBreaks();
    checkP2CpsBreaks();

    reportP1Results();
    reportP2Results();
    reportP1SwiftInfo();
    reportP2SwiftInfo();
    document.getElementById('totalswifttext').textContent = 'Total swift clicks: ' + (p1SwiftClicks.length + p2SwiftClicks.length);
    document.getElementById('totalinverseswifttext').textContent = 'Total swift releases: ' + (p1InverseSwiftClicks.length + p2InverseSwiftClicks.length);
    document.getElementById('totalswiftandinversetext').textContent = 'Total swift clicks and releases: ' + (p1SwiftClicks.length + p2SwiftClicks.length + p1InverseSwiftClicks.length + p2InverseSwiftClicks.length);

    disable();

    document.getElementById('downloadButton').style.pointerEvents = 'fill';
});

document.getElementById('downloadButton').addEventListener('click', async () =>{
    var resultString = 'Macro name:\n' + macroName +'\n';
    resultString += '\nFPS:\n' + framerate +'\n\n';
    //resultString += '\nCulling:\n' + document.getElementById('culling').value +'\n\n';

    resultString += '** Player 1 CPS Violations: **\n';
    const content1 = document.getElementById('outbox1').value;
    resultString += content1;

    resultString += '\n\n** Player 2 CPS Violations: **\n';
    const content2 = document.getElementById('outbox2').value;
    resultString += content2;
    
    const link = document.createElement("a");
    const file = new Blob([resultString], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "cpsbreaks.txt";
    link.click();
    URL.revokeObjectURL(link.href);
});

document.getElementById('refreshButton').addEventListener('click', async () =>{
    location.reload();
});

function reportP1SwiftInfo(){
    document.getElementById('p1st').textContent = 'Player 1 swift clicks: ' + p1SwiftClicks.length;
    document.getElementById('p1swiftsbox').value = '';
    document.getElementById('p1swiftsbox').value = document.getElementById('p1swiftsbox').value + "[";
    for(var i = 0; i < p1SwiftClicks.length; i++){
        document.getElementById('p1swiftsbox').value = document.getElementById('p1swiftsbox').value + p1SwiftClicks[i];
        if(i < p1SwiftClicks.length-1){
            document.getElementById('p1swiftsbox').value = document.getElementById('p1swiftsbox').value + ", ";
        }
    }
    document.getElementById('p1swiftsbox').value = document.getElementById('p1swiftsbox').value + "]";

    document.getElementById('p1ist').textContent = 'Player 1 swift releases: ' + p1InverseSwiftClicks.length;
    document.getElementById('p1inverseswiftsbox').value = '';
    document.getElementById('p1inverseswiftsbox').value = document.getElementById('p1inverseswiftsbox').value + "[";
    for(var i = 0; i < p1InverseSwiftClicks.length; i++){
        document.getElementById('p1inverseswiftsbox').value = document.getElementById('p1inverseswiftsbox').value + p1InverseSwiftClicks[i];
        if(i < p1InverseSwiftClicks.length-1){
            document.getElementById('p1inverseswiftsbox').value = document.getElementById('p1inverseswiftsbox').value + ", ";
        }
    }
    document.getElementById('p1inverseswiftsbox').value = document.getElementById('p1inverseswiftsbox').value + "]";
}

function reportP2SwiftInfo(){
    document.getElementById('p2st').textContent = 'Player 2 swift clicks: ' + p2SwiftClicks.length;
    document.getElementById('p2swiftsbox').value = '';
    document.getElementById('p2swiftsbox').value = document.getElementById('p2swiftsbox').value + "[";
    for(var i = 0; i < p2SwiftClicks.length; i++){
        document.getElementById('p2swiftsbox').value = document.getElementById('p2swiftsbox').value + p2SwiftClicks[i];
        if(i < p2SwiftClicks.length-1){
            document.getElementById('p2swiftsbox').value = document.getElementById('p2swiftsbox').value + ", ";
        }
    }
    document.getElementById('p2swiftsbox').value = document.getElementById('p2swiftsbox').value + "]";

    document.getElementById('p2ist').textContent = 'Player 2 swift releases: ' + p2InverseSwiftClicks.length;
    document.getElementById('p2inverseswiftsbox').value = '';
    document.getElementById('p2inverseswiftsbox').value = document.getElementById('p2inverseswiftsbox').value + "[";
    for(var i = 0; i < p2InverseSwiftClicks.length; i++){
        document.getElementById('p2inverseswiftsbox').value = document.getElementById('p2inverseswiftsbox').value + p2InverseSwiftClicks[i];
        if(i < p2InverseSwiftClicks.length-1){
            document.getElementById('p2inverseswiftsbox').value = document.getElementById('p2inverseswiftsbox').value + ", ";
        }
    }
    document.getElementById('p2inverseswiftsbox').value = document.getElementById('p2inverseswiftsbox').value + "]";
}

function reportP1Results(){
    document.getElementById('outbox1').value = '';
    if(p1Rule1Breaks.length == 0 && p1Rule2Breaks.length == 0
        && p1Rule3Breaks.length == 0){
        document.getElementById('check1').style.visibility = 'visible';
        document.getElementById('outbox1').value = "Rule 1 violations:\n[none]\n\n";
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n[none]\n\n";
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n[none]";
    }
    else{
        if(p1Rule1Breaks.length == 0){
            document.getElementById('outbox1').value = "Rule 1 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 1 violations:\n";
            for(var i = 0; i < p1Rule1Breaks.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule1Breaks[i];
            }
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "\n";
        }
        if(p1Rule2Breaks.length == 0){
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n";
            for(var i = 0; i < p1Rule2Breaks.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule2Breaks[i];
            }
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "\n";
        }
        if(p1Rule3Breaks.length == 0){
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n[none]";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n";
            for(var i = 0; i < p1Rule3Breaks.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule3Breaks[i];
            }
        }
        document.getElementById('cross1').style.visibility = 'visible';
    }
}

function reportP2Results(){
    document.getElementById('outbox2').value = '';
    if(p2Rule1Breaks.length == 0 && p2Rule2Breaks.length == 0
        && p2Rule3Breaks.length == 0){
        document.getElementById('check2').style.visibility = 'visible';
        document.getElementById('outbox2').value = "Rule 1 violations:\n[none]\n\n";
        document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n[none]\n\n";
        document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 3 violations:\n[none]";
    }
    else{
        if(p2Rule1Breaks.length == 0){
            document.getElementById('outbox2').value = "Rule 1 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 1 violations:\n";
            for(var i = 0; i < p2Rule1Breaks.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule1Breaks[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        if(p2Rule2Breaks.length == 0){
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n";
            for(var i = 0; i < p2Rule2Breaks.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule2Breaks[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        if(p2Rule3Breaks.length == 0){
            document.getElementById('outbox2').value = document.getElementById('outbox2').value +"Rule 3 violations:\n[none]";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 3 violations:\n";
            for(var i = 0; i < p2Rule3Breaks.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule3Breaks[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        document.getElementById('cross2').style.visibility = 'visible';
    }
}

function disable(){
   document.getElementById('upload').style.pointerEvents = 'none';
   document.getElementById('checkButton').style.pointerEvents = 'none';
   document.getElementById('textbox').setAttribute('readonly', 'readonly');
}

function checkP1CpsBreaks(){
    derive(p1InputArray, p1Rule1Breaks);
    Derive(p1InputArray, p1Rule2Breaks, p1Rule3Breaks, p1Rule2MaxCull, 
        p1Rule3MaxCull, p1Rule2MinCull, p1Rule3MinCull);
}

function checkP2CpsBreaks(){ 
    derive(p2InputArray, p2Rule1Breaks);
    Derive(p2InputArray, p2Rule2Breaks, p2Rule3Breaks, p2Rule2MaxCull, 
        p2Rule3MaxCull, p2Rule2MinCull, p2Rule3MinCull);
}

function derive(inputFrames, breakArray) {
    var hasTimeWarps = timewarpInfo.length > 0;
    for (var i = 0; i < inputFrames.length; i++) {
        var firstClickFrame = inputFrames[i];
        var timewarpFactor = 1;
        var indexChecked = 0;
        var runningTimeTotal = 0;
        var bottomThing = firstClickFrame;
        if(hasTimeWarps){
            timewarpFactor = Math.max(determineTimewarpFactor(firstClickFrame)[0], 1); 
            indexChecked = determineTimewarpFactor(firstClickFrame)[1];
        }
        var frameOneSecondLater = firstClickFrame + timewarpFactor*framerate;
        var previousTimewarpFactor = timewarpFactor;
        if(indexChecked < timewarpInfo.length){
            while(timewarpInfo[indexChecked][0] < frameOneSecondLater && indexChecked < timewarpInfo.length){
                var framesLeft = frameOneSecondLater - timewarpInfo[indexChecked][0];
                framesLeft *= (Math.max(timewarpInfo[indexChecked][1], 1))/previousTimewarpFactor;
                frameOneSecondLater = timewarpInfo[indexChecked][0] + framesLeft;
                runningTimeTotal += (timewarpInfo[indexChecked][0] - bottomThing) / (previousTimewarpFactor * framerate);
                bottomThing = timewarpInfo[indexChecked][0];
                previousTimewarpFactor = Math.max(timewarpInfo[indexChecked][1], 1);
                indexChecked++;
                if(indexChecked >= timewarpInfo.length){
                    break;
                }
            }
        }
        /* Old loop
        frameOneSecondLater = Math.floor(frameOneSecondLater);
        var numClicks = 0;
        var lastClickWithinTime = firstClickFrame;
        for (var j = 0; j < inputFrames.length; j++) {
            if (inputFrames[i + j] < frameOneSecondLater) {
                lastClickWithinTime = inputFrames[i + j];
                numClicks++;
            } else if (inputFrames[i + j] > frameOneSecondLater) {
                break;
            } else if (inputFrames[i + j] == frameOneSecondLater) {
                lastClickWithinTime = inputFrames[i + j];
                numClicks++;
                break; // Consider not breaking here
            }
        } */
        frameOneSecondLater = Math.floor(frameOneSecondLater);
        var numClicks = 0;
        var lastClickWithinTime = firstClickFrame;
        for (var j = 0; j < inputFrames.length; j++) {
            if (inputFrames[i + j] <= frameOneSecondLater) {
                lastClickWithinTime = inputFrames[i + j];
                numClicks++;
            } else{
                break;
            }
        }
        runningTimeTotal += parseFloat((lastClickWithinTime - bottomThing)) / (previousTimewarpFactor * framerate);
        //var timeBetween = parseFloat((lastClickWithinTime - firstClickFrame)) / framerate;
        if (numClicks > 16) { // Originally 15
            breakArray.push("- " + numClicks + " clicks in 1s: [frame " + firstClickFrame + " to " + frameOneSecondLater +
                "]: (" + runningTimeTotal.toFixed(3) + "s between first and last)\n");
        }
    }
}

 function Derive(inputFrames, breakArrayRule2, breakArrayRule3, rule2Max, rule3Max, rule2Min, rule3Min) {
    var framesThatBreakRule2 = [];
    var hasTimeWarps = timewarpInfo.length > 0;
    for (var i = 0; i < inputFrames.length; i++) {
        var min = true;
        var max = false;
        var _2break = false, _3break = false;
        inputFramesWithinASecond = [];

        var firstClickFrame = inputFrames[i];
        var timewarpFactor = 1;
        var indexChecked = 0;
        var runningTimeTotal = 0;
        var bottomThing = firstClickFrame;
        if(hasTimeWarps){
            timewarpFactor = Math.max(determineTimewarpFactor(firstClickFrame)[0], 1); 
            indexChecked = determineTimewarpFactor(firstClickFrame)[1];
        }
        var frameOneSecondLater = firstClickFrame + timewarpFactor*framerate;
        var previousTimewarpFactor = timewarpFactor;
        var latestClick = firstClickFrame;

        if(indexChecked < timewarpInfo.length){
            while(timewarpInfo[indexChecked][0] < frameOneSecondLater && indexChecked < timewarpInfo.length){
                var framesLeft = frameOneSecondLater - timewarpInfo[indexChecked][0];
                framesLeft *= (Math.max(timewarpInfo[indexChecked][1], 1))/previousTimewarpFactor;
                frameOneSecondLater = timewarpInfo[indexChecked][0] + framesLeft;
                runningTimeTotal += (timewarpInfo[indexChecked][0] - bottomThing) / (previousTimewarpFactor * framerate);
                bottomThing = timewarpInfo[indexChecked][0];
                previousTimewarpFactor = Math.max(timewarpInfo[indexChecked][1], 1);
                indexChecked++;
                if(indexChecked >= timewarpInfo.length){
                    break;
                }
            }
        }
        frameOneSecondLater = Math.floor(frameOneSecondLater);
        
        for (var j = 0; j < inputFrames.length; j++) { // Retrieves all clicks up to a second after the click in question, including the one in question
            if (inputFrames[i + j] < frameOneSecondLater) {
                latestClick = inputFrames[i + j];
                inputFramesWithinASecond.push(inputFrames[i + j]);
            } else {
                break;
            }
        }

        if (inputFramesWithinASecond.length >= 5) {  // Ignores stints of less than 5 clicks
        var possibleNumberOfStints = Math.min(inputFramesWithinASecond.length - 4, 12); // Number of stints to check per set of clicks within a second. 11 for 15
        // Don't need to worry about stints longer than 16 clicks, as if there are more than 16 clicks within a second it will be caught by the rule 1 check

        for (var j = 0, noClicks = 5; j < possibleNumberOfStints; j++, noClicks++) {
            var stintStart = inputFramesWithinASecond[0];
            var stintEnd = inputFramesWithinASecond[j + 4];

            // Hopefully the magic
            var timewarpFactor = 1;
            var indexChecked = 0;
            var runningTimeTotal = 0;
            var bottomThing = stintStart;
            if(hasTimeWarps){
                timewarpFactor = Math.max(determineTimewarpFactor(stintStart)[0], 1); 
                indexChecked = determineTimewarpFactor(stintStart)[1];
            }
            var previousTimewarpFactor = timewarpFactor;

            if(indexChecked < timewarpInfo.length){
                while(timewarpInfo[indexChecked][0] < stintEnd && indexChecked < timewarpInfo.length){
                    runningTimeTotal += (timewarpInfo[indexChecked][0] - bottomThing) / (previousTimewarpFactor * framerate);
                    bottomThing = timewarpInfo[indexChecked][0];
                    previousTimewarpFactor = Math.max(timewarpInfo[indexChecked][1], 1);
                    indexChecked++;
                    if(indexChecked >= timewarpInfo.length){
                        break;
                    }
                }
            }
            runningTimeTotal += parseFloat((stintEnd - bottomThing)) / (previousTimewarpFactor * framerate);

            //var timeBetweenClicks = parseFloat(stintEnd - stintStart) / framerate;
            var cps = (noClicks-1) / runningTimeTotal; // Actual number of clicks instead of 5. Added minus 1

            if (cps > 48) {
                breakArrayRule3.push('- ' + cps.toFixed(3) + " cps rate for the " + noClicks + " click stint from frames " + stintStart + " to " + stintEnd + " (" + runningTimeTotal.toFixed(3) + "s)\n");
                _3break = true;
                max = true;
                min = false;
            }
        }
    }
        // Rule 2 check
         var numberOfClicksOnSameFrame = 1;
         for (var j = 1; i + j < inputFrames.length; j++) { 
            if(inputFrames[i] == inputFrames[i + j]){
                numberOfClicksOnSameFrame ++;
            }
            else{
                break;
            }
        } 
        if (numberOfClicksOnSameFrame > 3 && !framesThatBreakRule2.includes(inputFrames[i])) {
            breakArrayRule2.push('- ' + numberOfClicksOnSameFrame + " clicks detected on frame " + inputFrames[i] + "\n");
            framesThatBreakRule2.push(inputFrames[i]);
            _2break = true;
            max = true;
            min = false;
        }

        /*for (var j = 0; j < inputFramesWithinASecond.length; j++) { 
            var frameTime = inputFramesWithinASecond[j] - inputFramesWithinASecond[j - 1];
            var clicksInFrame = Math.floor(1 / frameTime);
            if (clicksInFrame > 3) {
                var numClicks = j + 1;
                var stintStart = inputFramesWithinASecond[0];
                var stintEnd = inputFramesWithinASecond[j];
                var timeBetweenClicks = parseFloat(stintEnd - stintStart) / framerate;
                var cps = numClicks / timeBetweenClicks;

                breakArrayRule2.push('- ' + cps.toFixed(3) + " cps rate for the " + numClicks + " click stint from " + stintStart + " to " + stintEnd + " (" + timeBetweenClicks.toFixed(3) + "s)\n");
                _2break = true;
                max = true;
                min = false;
                }
        } */

        /*if (max == true) {
            if (_2break == true) {
                rule2Max.push('- More than 3 clicks per frame detected.\n');
            } else if (_3break == true) {
                rule3Max.push('- More than 45 cps for 5-click stint detected.\n');
            }
        } */
    }
}

function determineTimewarpFactor(firstClickFrame){
    if(timewarpInfo.length == 1){
        if(firstClickFrame < timewarpInfo[0][0]) {
            return [1, 0];
        }
        else{
            return [timewarpInfo[0][1], 1];
        }
    }
    else{
        if(firstClickFrame < timewarpInfo[0][0]) {
            return [1, 0];
        }
        for(var i = 0; i < timewarpInfo.length-1; i++){
            if(firstClickFrame >= timewarpInfo[i][0] && firstClickFrame < timewarpInfo[i+1][0]) {
                return [timewarpInfo[i][1], i+1];
            }
        }
        return [timewarpInfo[timewarpInfo.length-1][1], timewarpInfo.length];
    }
}


function validMacro(macro){
    const arrayOfLines = macro.trim().split('\n');
    if(arrayOfLines.length < 2){ return false; }
    for(var i = 0; i < arrayOfLines.length; i++){
        var potentialLine = arrayOfLines[i].trim();
        if(matchesTimewarpRegex(potentialLine) && i > 0){
            continue;
        }
        else{
            var lineChoppedUp1 = arrayOfLines[i].trim().split(/(\s+)/);
            var lineChoppedUp = lineChoppedUp1.filter(n => isANumber(n));
            if(i == 0){
            if(lineChoppedUp.length != 1 || !isANumber(lineChoppedUp[0])){
                return false;
            }
            }
            else{
                if(lineChoppedUp.length != 3 || !isANumber(lineChoppedUp[0])
                || !isANumber(lineChoppedUp[1]) || !isANumber(lineChoppedUp[2])){
                    return false;
                }
            }
        }
    }
    return true;
}

function matchesTimewarpRegex(str){
    const pattern = new RegExp('^\\d+\\s+[Tt]\\s*=\\s*\\d+(\\.\\d+)?$');
    //console.log(pattern.test(str));
    return pattern.test(str);
    //return !/\D/.test(str);
  }

function isANumber(str){
    const pattern = new RegExp('^-?\\d*(\\.\\d+)?$');
    //console.log(pattern.test(str));
    return pattern.test(str);
    //return !/\D/.test(str);
  }

function parseInputsToP1P2Array(macroTxt){
    const lineArray = macroTxt.trim().split('\n');
    for(var i = 0; i < lineArray.length; i++){
        var potentialLine = lineArray[i].trim();
        if(matchesTimewarpRegex(potentialLine)){
            var splitInfo = potentialLine.split(/\s*[Tt]\s*=\s*/);
            //timewarpInfo.push([parseInt(splitInfo[0],10), parseFloat(splitInfo[1])]);
            timewarpInfo.splice(findIndexToInsert(timewarpInfo, parseInt(splitInfo[0],10)), 0, [parseInt(splitInfo[0],10), parseFloat(splitInfo[1])]);
            continue;
        }
        var lineAsInts1 = lineArray[i].trim().split(/(\s+)/);
        var lineAsInts= lineAsInts1.filter(n => isANumber(n));
        if(i == 0){
            framerate = parseFloat(lineArray[0]);//parseInt(lineAsInts, 10);
            continue;
        }
        if(parseInt(lineAsInts[1],10) == 1 && parseInt(lineAsInts[2]) == 0){ //P1 input
            p1InputArray.push(parseInt(lineAsInts[0],10));
        }
        else if(parseInt(lineAsInts[1],10) == 1 && parseInt(lineAsInts[2]) == 1){ //P2 input
            p2InputArray.push(parseInt(lineAsInts[0],10));
        }
    }
    //console.log(timewarpInfo);
}

function findIndexToInsert(array, element) {
    for (let i = 0; i < array.length; i++) {
      if (element <= array[i][0]) {
        return i;
      }
    }
    return array.length;
  }

function splitMacro(macroTxt){
    const lineArray = macroTxt.trim().split('\n');
    for(var i = 1; i < lineArray.length; i++){
        var potentialLine = lineArray[i].trim();
        if(matchesTimewarpRegex(potentialLine)){
            continue;
        }
        else{
            var lineAsInts1 = lineArray[i].trim().split(/(\s+)/);
            var lineAsInts= lineAsInts1.filter(n => isANumber(n));
            if(parseInt(lineAsInts[1],10) == 1 && parseInt(lineAsInts[2]) == 0){ //P1 click
                p1SeparatedMacro.push(parseInt(lineAsInts[0],10) + " c");
            }
            else if(parseInt(lineAsInts[1],10) == 0 && parseInt(lineAsInts[2]) == 0){ //P1 release
                p1SeparatedMacro.push(parseInt(lineAsInts[0],10) + " r");
            }
            else if(parseInt(lineAsInts[1],10) == 1 && parseInt(lineAsInts[2]) == 1){ //P2 click
                p2SeparatedMacro.push(parseInt(lineAsInts[0],10) + " c");
            }
            else if(parseInt(lineAsInts[1],10) == 0 && parseInt(lineAsInts[2]) == 1){ //P2 release
                p2SeparatedMacro.push(parseInt(lineAsInts[0],10) + " r");
            }
        }
    }
}

function extractSwiftsFromP1Macro(){
    for(var i = 0; i < p1SeparatedMacro.length - 1; i++){
        var lineSplit1 = p1SeparatedMacro[i].trim().split(/(\s+)/);
        var lineSplit2 = p1SeparatedMacro[i+1].trim().split(/(\s+)/);
        if(parseInt(lineSplit1[0], 10) == parseInt(lineSplit2[0], 10)){ // If the next action happens on the same frame as the first
            if(lineSplit1[2] === "c" && lineSplit2[2] === "r"){ // Swift! (2 because 1 is a space)
                p1SwiftClicks.push(parseInt(lineSplit1[0], 10));
            }
            if(lineSplit1[2] === "r" && lineSplit2[2] === "c"){ // Inverse swift! (2 because 1 is a space)
                p1InverseSwiftClicks.push(parseInt(lineSplit1[0], 10));
            }
        }
    }
}

function extractSwiftsFromP2Macro(){
    for(var i = 0; i < p2SeparatedMacro.length - 1; i++){
        var lineSplit1 = p2SeparatedMacro[i].trim().split(/(\s+)/);
        var lineSplit2 = p2SeparatedMacro[i+1].trim().split(/(\s+)/);
        if(parseInt(lineSplit1[0], 10) == parseInt(lineSplit2[0], 10)){ // If the next action happens on the same frame as the first
            if(lineSplit1[2] === "c" && lineSplit2[2] === "r"){ // Swift! (2 because 1 is a space)
                p2SwiftClicks.push(parseInt(lineSplit1[0], 10));
            }
            if(lineSplit1[2] === "r" && lineSplit2[2] === "c"){ // Inverse swift! (2 because 1 is a space)
                p2InverseSwiftClicks.push(parseInt(lineSplit1[0], 10));
            }
        }
    }
}

document.getElementById('upload').addEventListener('change', async () =>{
    const fr = new FileReader();
    const file = document.getElementById('in').files[0];
    fr.readAsText(file);
    fr.onload = (() => {
        document.getElementById('textbox').value = fr.result;    
        document.getElementById('noFile').innerHTML = file.name;
        document.getElementById('noFile').style.fontWeight = 'bold';
        document.getElementById('noFile').style.fontSize = '15px';
        macroName = file.name.split('.').slice(0,-1).join('.');
    });     
});

document.getElementById('showSwiftsBox').addEventListener('change', async () =>{
    if(document.getElementById('showSwiftsBox').checked == true){
        document.getElementById('p1swiftsbox').style.visibility='visible';
        document.getElementById('p1st').style.visibility='visible';
        document.getElementById('p1inverseswiftsbox').style.visibility='visible';
        document.getElementById('p1ist').style.visibility='visible';
        document.getElementById('p2swiftsbox').style.visibility='visible';
        document.getElementById('p2st').style.visibility='visible';
        document.getElementById('p2inverseswiftsbox').style.visibility='visible';
        document.getElementById('p2ist').style.visibility='visible';
        document.getElementById('totalswifttext').style.visibility='visible';
        document.getElementById('totalinverseswifttext').style.visibility='visible';
        document.getElementById('totalswiftandinversetext').style.visibility='visible';
    }   
    else{
        document.getElementById('p1swiftsbox').style.visibility='hidden';
        document.getElementById('p1st').style.visibility='hidden';
        document.getElementById('p1inverseswiftsbox').style.visibility='hidden';
        document.getElementById('p1ist').style.visibility='hidden';
        document.getElementById('p2swiftsbox').style.visibility='hidden';
        document.getElementById('p2st').style.visibility='hidden';
        document.getElementById('p2inverseswiftsbox').style.visibility='hidden';
        document.getElementById('p2ist').style.visibility='hidden';
        document.getElementById('totalswifttext').style.visibility='hidden';
        document.getElementById('totalinverseswifttext').style.visibility='hidden';
        document.getElementById('totalswiftandinversetext').style.visibility='hidden';
    }
});

document.getElementById('help-area').addEventListener('click', async () =>{
    document.getElementById('help-box').style.display='block';
});

document.getElementById('close-button').addEventListener('click', async () =>{
    document.getElementById('help-box').style.display='none';
});

document.getElementById('help-area-2').addEventListener('click', async () =>{
    document.getElementById('help-box-2').style.display='block';
});

document.getElementById('close-button-2').addEventListener('click', async () =>{
    document.getElementById('help-box-2').style.display='none';
});

document.getElementById('help-area-3').addEventListener('click', async () =>{
    document.getElementById('help-box-3').style.display='block';
});

document.getElementById('close-button-3').addEventListener('click', async () =>{
    document.getElementById('help-box-3').style.display='none';
});

document.getElementById('help-area-4').addEventListener('click', async () =>{
    document.getElementById('help-box-4').style.display='block';
});

document.getElementById('close-button-4').addEventListener('click', async () =>{
    document.getElementById('help-box-4').style.display='none';
});

/*document.getElementById('culling').addEventListener('change', async () =>{
    if(document.getElementById('culling').value === 'Min'){
        reportP1MinResults();
        reportP2MinResults();
    }
    else if(document.getElementById('culling').value === 'Max'){
        reportP1MaxResults();
        reportP2MaxResults();
    }
    else{
        reportP1Results();
        reportP2Results();
    }
}); */

function reportP1MinResults(){
    document.getElementById('outbox1').value = '';
    if(p1Rule1Breaks.length == 0 && p1Rule2MinCull.length == 0
        && p1Rule3MinCull.length == 0){
        document.getElementById('check1').style.visibility = 'visible';
        document.getElementById('outbox1').value = "Rule 1 violations:\n[none]\n\n";
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n[none]\n\n";
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n[none]";
    }
    else{
        if(p1Rule1Breaks.length == 0){
            document.getElementById('outbox1').value = "Rule 1 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 1 violations:\n";
            for(var i = 0; i < p1Rule1Breaks.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule1Breaks[i];
            }
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "\n";
        }
        if(p1Rule2MinCull.length == 0){
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n";
            for(var i = 0; i < p1Rule2MinCull.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule2MinCull[i];
            }
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "\n";
        }
        if(p1Rule3MinCull.length == 0){
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n[none]";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n";
            for(var i = 0; i < p1Rule3MinCull.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule3MinCull[i];
            }
        }
        document.getElementById('cross1').style.visibility = 'visible';
    }
}

function reportP2MinResults(){
    document.getElementById('outbox2').value = '';
    if(p2Rule1Breaks.length == 0 && p2Rule2Breaks.length == 0
        && p2Rule3Breaks.length == 0){
        document.getElementById('check2').style.visibility = 'visible';
        document.getElementById('outbox2').value = "Rule 1 violations:\n[none]\n\n";
        document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n[none]\n\n";
        document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 3 violations:\n[none]";
    }
    else{
        if(p2Rule1Breaks.length == 0){
            document.getElementById('outbox2').value = "Rule 1 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 1 violations:\n";
            for(var i = 0; i < p2Rule1Breaks.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule1Breaks[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        if(p2Rule2MinCull.length == 0){
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n";
            for(var i = 0; i < p2Rule2MinCull.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule2MinCull[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        if(p2Rule3MinCull.length == 0){
            document.getElementById('outbox2').value = document.getElementById('outbox2').value +"Rule 3 violations:\n[none]";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 3 violations:\n";
            for(var i = 0; i < p2Rule3MinCull.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule3MinCull[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        document.getElementById('cross2').style.visibility = 'visible';
    }
}

function reportP1MaxResults(){
    document.getElementById('outbox1').value = '';
    if(p1Rule1Breaks.length == 0 && p1Rule2MaxCull.length == 0
        && p1Rule3MaxCull.length == 0){
        document.getElementById('check1').style.visibility = 'visible';
        document.getElementById('outbox1').value = "Rule 1 violations:\n[none]\n\n";
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n[none]\n\n";
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n[none]";
    }
    else{
        if(p1Rule1Breaks.length == 0){
            document.getElementById('outbox1').value = "Rule 1 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 1 violations:\n";
            for(var i = 0; i < p1Rule1Breaks.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule1Breaks[i];
            }
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "\n";
        }
        if(p1Rule2MaxCull.length == 0){
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 2 violations:\n";
            for(var i = 0; i < p1Rule2MaxCull.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule2MaxCull[i];
            }
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "\n";
        }
        if(p1Rule3MaxCull.length == 0){
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n[none]";
        }
        else{
            document.getElementById('outbox1').value = document.getElementById('outbox1').value + "Rule 3 violations:\n";
            for(var i = 0; i < p1Rule3MaxCull.length; i++){
                document.getElementById('outbox1').value = document.getElementById('outbox1').value + p1Rule3MaxCull[i];
            }
        }
        document.getElementById('cross1').style.visibility = 'visible';
    }
}

function reportP2MaxResults(){
    document.getElementById('outbox2').value = '';
    if(p2Rule1Breaks.length == 0 && p2Rule2MaxCull.length == 0
        && p2Rule3MaxCull.length == 0){
        document.getElementById('check2').style.visibility = 'visible';
        document.getElementById('outbox2').value = "Rule 1 violations:\n[none]\n\n";
        document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n[none]\n\n";
        document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 3 violations:\n[none]";
    }
    else{
        if(p2Rule1Breaks.length == 0){
            document.getElementById('outbox2').value = "Rule 1 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 1 violations:\n";
            for(var i = 0; i < p2Rule1Breaks.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule1Breaks[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        if(p2Rule2MaxCull.length == 0){
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n[none]\n\n";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 2 violations:\n";
            for(var i = 0; i < p2Rule2MaxCull.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule2MaxCull[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        if(p2Rule3MaxCull.length == 0){
            document.getElementById('outbox2').value = document.getElementById('outbox2').value +"Rule 3 violations:\n[none]";
        }
        else{
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "Rule 3 violations:\n";
            for(var i = 0; i < p2Rule3MaxCull.length; i++){
                document.getElementById('outbox2').value = document.getElementById('outbox2').value + p2Rule3MaxCull[i];
            }
            document.getElementById('outbox2').value = document.getElementById('outbox2').value + "\n";
        }
        document.getElementById('cross2').style.visibility = 'visible';
    }
}
