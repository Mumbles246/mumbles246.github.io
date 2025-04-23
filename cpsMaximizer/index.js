var p1InputArray = [];
var p2InputArray = [];

var successfulArrays = [];
var nodesAdded = 0;
var inputsToUse = [];
var currentTreeValue = [];
var currentlyAddedNodes = [];

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

    if(document.getElementById('p1box').checked == true){
        inputsToUse = p1InputArray;
    }
    else{
        inputsToUse = p2InputArray;
    }

    document.getElementById('fps-text').textContent = 'FPS: ' + framerate;
    document.getElementById('fps-text').style.display = 'block';
    document.getElementById('fps-text').style.fontWeight = 'bold';
    document.getElementById('recurse').style.display = 'block';
    document.getElementById('nodeCountText').style.display = 'block';

    checkP1CpsBreaks();
    //checkP2CpsBreaks();

    reportP1Results("");
    //reportP2Results();

    var sel = document.getElementById("recursing");
    sel.length = 0;

    for(var i = 0; i < successfulArrays.length; i++){
        var opt = document.createElement("option");
        opt.value = i;
        opt.text = successfulArrays[i][1];
        sel.add(opt);
    }

    disable();

    document.getElementById('downloadButton').style.pointerEvents = 'fill';
});

document.getElementById('downloadButton').addEventListener('click', async () =>{
    var resultString = 'Macro Name:\n' + macroName +'\n';
    resultString += '\nFPS:\n' + framerate +'\n\n';

    if(document.getElementById('p1box').checked == true){
        resultString += 'Using Player 1 Inputs\n\n';
    }
    else{
        resultString += 'Using Player 2 Inputs\n\n'
    }

    resultString += '** Step-By-Step Additions of Singular Nodes: **\n';
    const content1 = document.getElementById('outbox1').value;
    resultString += content1;

    resultString += '\n\n** Summary: **\n\n';

    resultString += 'The following ' + nodesAdded + ' node(s): \n[' + currentlyAddedNodes + '] \nwere added to the tree.\n\n';
    resultString += 'The new tree containing these additions is: \n[' + currentTreeValue + ']\n\n';
    
    const link = document.createElement("a");
    const file = new Blob([resultString], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "cpsmaximizing.txt";
    link.click();
    URL.revokeObjectURL(link.href);
});

document.getElementById('refreshButton').addEventListener('click', async () =>{
    if(successfulArrays.length == 0){
        document.getElementById('refreshButton').style.pointerEvents = 'none';
        return;
    }
    document.getElementById('onlyGroup').style.pointerEvents = 'fill';
    nodesAdded ++;
    document.getElementById('nodeCountText').textContent = "Nodes added: " + nodesAdded;

    var indexOfSuccessToUse = document.getElementById("recursing").value;
    inputsToUse = successfulArrays[indexOfSuccessToUse][0];
    numToGiveResults = successfulArrays[indexOfSuccessToUse][1];

    currentTreeValue = successfulArrays[indexOfSuccessToUse][0];
    currentlyAddedNodes.splice(findIndexToInsert(currentlyAddedNodes, numToGiveResults), 0, numToGiveResults);

    if(document.getElementById('onlyAddedBox').checked == true){
        document.getElementById('treeBox').value = "[" + currentlyAddedNodes + "]";
    }
    else{
        document.getElementById('treeBox').value = "[" + currentTreeValue + "]";
    }

    successfulArrays = [];
    checkP1CpsBreaks();
    reportP1Results("-> [" + numToGiveResults + "]\n\n");

    var sel = document.getElementById("recursing");
    sel.length = 0;

    for(var i = 0; i < successfulArrays.length; i++){
        var opt = document.createElement("option");
        opt.value = i;
        opt.text = successfulArrays[i][1];
        sel.add(opt);
    }
});

function reportP1Results(prepend){
    //document.getElementById('outbox1').value = '';
    if(successfulArrays.length > 0){
        document.getElementById('refreshButton').style.pointerEvents = 'fill';
        document.getElementById('check1').style.visibility = 'visible';
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + prepend + successfulArrays.length + " possible insertions.\n"
    }
    else{
        document.getElementById('outbox1').value = document.getElementById('outbox1').value + prepend + "No more nodes can be inserted."
        document.getElementById('cross1').style.visibility = 'visible';
        document.getElementById('check1').style.visibility = 'hidden';
        document.getElementById('refreshButton').style.pointerEvents = 'none';
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
   document.getElementById('checkboxes').style.pointerEvents = 'none';
}

function findIndexToInsert(array, element) {
    for (let i = 0; i < array.length; i++) {
      if (element <= array[i]) {
        return i;
      }
    }
    return array.length;
  }

function checkP1CpsBreaks(){
    for(var i = 0, num = inputsToUse[0]; i <= inputsToUse[inputsToUse.length - 1] - inputsToUse[0]; i++, num++){
        var testArray = inputsToUse.toSpliced(findIndexToInsert(inputsToUse, num), 0, num);

        if(derive(testArray) == false && Derive(testArray) == false){
            successfulArrays.push([testArray, num]);
        }
    }

    if(successfulArrays.length == 0){
        document.getElementById('refreshButton').style.pointerEvents = 'none';
        if(nodesAdded > 0){
            document.getElementById('maximumText').style.display = 'block';
        }
    }

    /*var successfulArrays2 = []; //logic works but explodes exponentially
    for(var i = 0; i < successfulArrays.length; i++){
        for(var j = 0, num = successfulArrays[i][0]; j <= successfulArrays[i][successfulArrays[i].length - 1] - successfulArrays[i][0]; j++, num++){
            var testArray = successfulArrays[i].toSpliced(findIndexToInsert(successfulArrays[i], num), 0, num);
    
            if(derive(testArray) == false && Derive(testArray) == false){
                successfulArrays2.push(testArray);
            }
        }
    } */

    //console.log(successfulArrays);
    //console.log(successfulArrays2); 
}

function checkP2CpsBreaks(){ 
    derive(p2InputArray);
    Derive(p2InputArray);
}

function derive(inputFrames) {
    for (var i = 0; i < inputFrames.length; i++) {
        var firstClickFrame = inputFrames[i];
        var frameOneSecondLater = firstClickFrame + framerate;
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
                break;
            }
        }
        if (numClicks > 15) {
            return true;
        }
    }
    return false;
}

 function Derive(inputFrames) {
    var framesThatBreakRule2 = [];
    for (var i = 0; i < inputFrames.length; i++) {
        var min = true;
        var max = false;
        var _2break = false, _3break = false;
        inputFramesWithinASecond = [];
        var firstClickFrame = inputFrames[i];
        var frameOneSecondLater = firstClickFrame + framerate;
        var latestClick = firstClickFrame;
        
        for (var j = 0; j < inputFrames.length; j++) { // Retrieves all clicks up to a second after the click in question, including the one in question
            if (inputFrames[i + j] < frameOneSecondLater) {
                latestClick = inputFrames[i + j];
                inputFramesWithinASecond.push(inputFrames[i + j]);
            } else {
                break;
            }
        }

        if (inputFramesWithinASecond.length >= 5) {  // Ignores stints of less than 5 clicks
        var possibleNumberOfStints = Math.min(inputFramesWithinASecond.length - 4, 11); // Number of stints to check per set of clicks within a second
        // Don't need to worry about stints longer than 15 clicks, as if there are more than 15 clicks within a second it will be caught by the rule 1 check

        for (var j = 0, noClicks = 5; j < possibleNumberOfStints; j++, noClicks++) {
            var stintStart = inputFramesWithinASecond[0];
            var stintEnd = inputFramesWithinASecond[j + 4];
            var timeBetweenClicks = parseFloat(stintEnd - stintStart) / framerate;
            var cps = noClicks / timeBetweenClicks; // Actual number of clicks instead of 5

            if (cps > 45) {
                return true;
            }
        }
    }

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
           return true;
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
    return false;
}


function validMacro(macro){
    const arrayOfLines = macro.trim().split('\n');
    if(arrayOfLines.length < 2){ return false; }
    for(var i = 0; i < arrayOfLines.length; i++){
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
    return true;
}

function isANumber(str){
    return !/\D/.test(str);
  }

function parseInputsToP1P2Array(macroTxt){
    const lineArray = macroTxt.trim().split('\n');
    for(var i = 0; i < lineArray.length; i++){
        var lineAsInts1 = lineArray[i].trim().split(/(\s+)/);
        var lineAsInts= lineAsInts1.filter(n => isANumber(n));
        if(i == 0){
            framerate = parseInt(lineAsInts, 10);
            continue;
        }
        if(parseInt(lineAsInts[1],10) == 1 && parseInt(lineAsInts[2]) == 0){ //P1 input
            p1InputArray.push(parseInt(lineAsInts[0],10));
        }
        else if(parseInt(lineAsInts[1],10) == 1 && parseInt(lineAsInts[2]) == 1){ //P2 input
            p2InputArray.push(parseInt(lineAsInts[0],10));
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

document.getElementById('onlyAddedBox').addEventListener('change', async () =>{
    if(document.getElementById('onlyAddedBox').checked == true){
        document.getElementById('treeBox').value = "[" + currentlyAddedNodes + "]";
    }   
    else{
        document.getElementById('treeBox').value = "[" + currentTreeValue + "]";
    }
});

document.getElementById('p1box').addEventListener('change', async () =>{
    if(document.getElementById('p1box').checked == false){
        document.getElementById('p2box').checked = true;
    }   
    else{
        document.getElementById('p2box').checked = false;
    }
});

document.getElementById('p2box').addEventListener('change', async () =>{
    if(document.getElementById('p2box').checked == false){
        document.getElementById('p1box').checked = true;
    }
    else{
        document.getElementById('p1box').checked = false;
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
