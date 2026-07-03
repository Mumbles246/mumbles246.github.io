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

// To hold objects with the same format
const violationsP1 = [];
const violationsP2 = [];

let chart1;
let chart2;

const historyStack = [];
const MAX_HISTORY = 100; // prevent memory issues

let activePlayer = "p1";
let actionLog = [];

let p1FixesComputed = false;
let p2FixesComputed = false;

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

    //console.log("Start");
    //console.time("parse");
    parseInputsToP1P2Array(macroTxt);
    //console.timeEnd("parse");
    //console.time("split and extract swifts");
    splitMacro(macroTxt);
    extractSwiftsFromP1Macro();
    extractSwiftsFromP2Macro();
    //console.timeEnd("split and extract swifts");

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
    // Added sort here because people would upload UNSORTED MACROS
    //console.time("sort");
    p1InputArray.sort((a, b) => a-b);
    p2InputArray.sort((a, b) => a-b);
    //console.timeEnd("sort");
    
    //console.time("p1 cps");
    checkP1CpsBreaks();
    //console.timeEnd("p1 cps");
    //console.time("p2 cps");
    checkP2CpsBreaks();
    //console.timeEnd("p2 cps");

    //console.time("report cps results");
    reportP1Results();
    reportP2Results();
    //console.timeEnd("report cps results");
    //console.time("report swift info");
    reportP1SwiftInfo();
    reportP2SwiftInfo();
    //console.timeEnd("report swift info");
    //console.log('Finished');

    document.getElementById('totalswifttext').textContent = 'Total swift clicks: ' + (p1SwiftClicks.length + p2SwiftClicks.length);
    document.getElementById('totalinverseswifttext').textContent = 'Total swift releases: ' + (p1InverseSwiftClicks.length + p2InverseSwiftClicks.length);
    document.getElementById('totalswiftandinversetext').textContent = 'Total swift clicks and releases: ' + (p1SwiftClicks.length + p2SwiftClicks.length + p1InverseSwiftClicks.length + p2InverseSwiftClicks.length);

    disable();

    document.getElementById('downloadButton').style.pointerEvents = 'fill';
    document.getElementById('generateButtonContainer').style.display = 'block';
});

document.getElementById("generateButton").addEventListener("click", () => {
    generateInitialGraphs();
    document.getElementById('everything-graph-related').style.display = 'block';
    document.getElementById('generateButton').style.pointerEvents = 'none';
});

function generateInitialGraphs(){
    const p1groups = groupClicks(p1InputArray);
    const p1groupsWithTime = addTimes(p1groups);
    const p1result = computeRollingCPS_Time(p1groupsWithTime);

    const p2groups = groupClicks(p2InputArray);
    const p2GroupsWithTime = addTimes(p2groups);
    const p2result = computeRollingCPS_Time(p2GroupsWithTime);
    
    const bothPlayerInputs = [...p1InputArray, ...p2InputArray];
    bothPlayerInputs.sort((a,b) => a-b);
    const bothGroups = groupClicks(bothPlayerInputs);
    const bothGroupsWithTime = addTimes(bothGroups);
    const bothresult = computeRollingCPS_Time(bothGroupsWithTime);

    const p1FramesWithTime = addTimes2(p1InputArray);
    let p1result2 = computeBurstCPS(p1FramesWithTime);
    p1result2 = collapseByTime(p1result2);
    p1result2 = capInfiniteValues(p1result2);

    const p2FramesWithTime = addTimes2(p2InputArray);
    let p2result2 = computeBurstCPS(p2FramesWithTime);
    p2result2 = collapseByTime(p2result2);
    p2result2 = capInfiniteValues(p2result2);

    const bothInputsWithTime = addTimes2(bothPlayerInputs);
    let bothresult2 = computeBurstCPS_Combined(bothInputsWithTime);
    bothresult2 = collapseByTime(bothresult2);
    bothresult2 = capInfiniteValues(bothresult2);

    chart1 = createGraph(p1result, p2result, bothresult); // Graph 1
    chart2 = createGraph2(p1result2, p2result2, bothresult2) // Graph 2
}

function getMinMaxX(datasets) {
  const allX = [];

  for (const data of datasets) {
    if (data && data.length > 0) {
      for (const p of data) {
        allX.push(p.x);
      }
    }
  }

  if (allX.length === 0) {
    // Fallback if absolutely no data
    return { minX: 0, maxX: 1 };
  }

  const min = Math.min(...allX);
  const max = Math.max(...allX);

  return {
    minX: Math.max(min - 0.1, 0), // small padding
    maxX: max + 0.1
  };
}

function groupClicks(clicks) {
  let groups = [];

  for (let frame of clicks) {
    let last = groups[groups.length - 1];

    if (last && last.frame === frame) {
      last.count++;
    } else {
      groups.push({ frame: frame, count: 1 });
    }
  }

  return groups;
}

function addTimes(groups) {
  return groups.map(g => ({
    frame: g.frame,
    count: g.count,
    time: getRealTime(g.frame)/*g.frame / framerate*/
  }));
}

function addTimes2(frames) {
  return frames.map(f => ({
    frame: f,
    time: getRealTime(f)/*g.frame / framerate*/
  }));
}

function getRealTime(frame) {
  let time = 0;
  let prevFrame = 0;
  let currentFactor = 1;

  for (let i = 0; i < timewarpInfo.length; i++) {
    const tw = timewarpInfo[i];

    // If target frame is before this timewarp
    if (frame < tw[0]) {
      time += (frame - prevFrame) / (framerate * currentFactor);
      return time;
    }

    // Add time up to this timewarp
    time += (tw[0] - prevFrame) / (framerate * currentFactor);

    prevFrame = tw[0];
    currentFactor = Math.max(tw[1], 1);
  }

  // After last timewarp
  time += (frame - prevFrame) / (framerate * currentFactor);

  return time;
}

function computeRollingCPS_Time(groupsWithTime) {
  let result = [];
  let left = 0;
  let currentClicks = 0;

  for (let right = 0; right < groupsWithTime.length; right++) {
    let current = groupsWithTime[right];

    // Add clicks at this frame
    currentClicks += current.count;

    // Remove clicks older than 1 second (REAL TIME)
    while (groupsWithTime[left].time < current.time - 1) {
      currentClicks -= groupsWithTime[left].count;
      left++;
    } 

    result.push({
      time: current.time,
      frame: current.frame,
      cps: currentClicks,
      count: current.count
    });
  }

  return result;
}

function computeBurstCPS(framesWithTime) {
  const results = [];
  const n = framesWithTime.length;

  for (let j = 0; j < n; j++) {
    let best = null;

    // Check lengths 5 → 16
    for (let k = 5; k <= 16; k++) {
      const i = j - k + 1;
      if (i < 0) break;

      const end = framesWithTime[j];
      const start = framesWithTime[i];

      const deltaTime = end.time - start.time;

      // Only consider stints within 1 second
      if (deltaTime > 1) break;

      let cps;
      let isInfinite = false;

      if (deltaTime === 0) {
        cps = Infinity;
        isInfinite = true;
      } else {
        cps = (k - 1) / deltaTime;
      }

      // Track best (with tiebreaker)
      if (
        !best ||
        cps > best.cps ||
        (cps === best.cps && k > best.length)
      ) {
        best = {
          cps,
          length: k,
          startIndex: i,
          endIndex: j,
          isInfinite
        };
      }
    }

    // Push best result for this ending click
    if (best) {
      const end = framesWithTime[j];
      const start = framesWithTime[best.startIndex];

      results.push({
        x: end.time,                 // REAL TIME (for chart x-axis)
        y: best.cps,                 // CPS (may be Infinity)
        frame: end.frame,            // for tooltip
        length: best.length,
        startFrame: start.frame,
        startTime: start.time,
        isInfinite: best.isInfinite
      });
    }
  }

  return results;
}

function computeBurstCPS_Combined(framesWithTime) {
  const results = [];
  const n = framesWithTime.length;

  for (let j = 0; j < n; j++) {
    let best = null;

    // Check lengths 5 → 16
    for (let k = 5; k <= 32; k++) {
      const i = j - k + 1;
      if (i < 0) break;

      const end = framesWithTime[j];
      const start = framesWithTime[i];

      const deltaTime = end.time - start.time;

      // Only consider stints within 1 second
      if (deltaTime > 1) break;

      let cps;
      let isInfinite = false;

      if (deltaTime === 0) {
        cps = Infinity;
        isInfinite = true;
      } else {
        cps = (k - 1) / deltaTime;
      }

      // Track best (with tiebreaker)
      if (
        !best ||
        cps > best.cps ||
        (cps === best.cps && k > best.length)
      ) {
        best = {
          cps,
          length: k,
          startIndex: i,
          endIndex: j,
          isInfinite
        };
      }
    }

    // Push best result for this ending click
    if (best) {
      const end = framesWithTime[j];
      const start = framesWithTime[best.startIndex];

      results.push({
        x: end.time,                 // REAL TIME (for chart x-axis)
        y: best.cps,                 // CPS (may be Infinity)
        frame: end.frame,            // for tooltip
        length: best.length,
        startFrame: start.frame,
        startTime: start.time,
        isInfinite: best.isInfinite
      });
    }
  }

  return results;
}

function collapseByTime(data) {
  const map = new Map();

  for (const p of data) {
    const key = p.x; // time

    if (!map.has(key)) {
      map.set(key, p);
    } else {
      const existing = map.get(key);

      // Keep the better one
      if (
        p.y > existing.y ||
        (p.y === existing.y && p.length > existing.length)
      ) {
        map.set(key, p);
      }
    }
  }

  return Array.from(map.values());
}

function capInfiniteValues(data) {
  // Get all finite CPS values
  const finiteValues = data
    .filter(p => Number.isFinite(p.y))
    .map(p => p.y);

  let cap;  
  if(finiteValues.length === 0){
    cap = 100;
  }
  else{
    const maxFinite = Math.max(...finiteValues);
    cap = maxFinite * 1.1;
  }

  for (const p of data) {
    if (!Number.isFinite(p.y)) {
      p.y = cap; // ONLY modify y for graphing
    }
  }

  return data;
}

function createGraph(result1, result2, result3){
    const dataPoints = result1.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame,
        count: p.count
    }));

    const dataPoints2 = result2.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame,
        count: p.count
    }));

    const dataPoints3 = result3.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame,
        count: p.count
    }));

    /*const minX = Math.max(dataPoints[0].x - 10, 0);
    const maxX = dataPoints[dataPoints.length - 1].x + 10; */
    const {minX, maxX} = getMinMaxX([dataPoints, dataPoints2]);
    
    const canvas = document.getElementById('cpsChart');
    // Make it wide (scrollable)
    const pixelsPerFrame = 0.1;
    canvas.width = 2000;//(maxX-minX) * pixelsPerFrame; 2000
    canvas.height = 500;

    const ctx = canvas.getContext('2d');

    const frameHoverPlugin = {
        id: "frameHover",

        afterDraw(chart, args, options) {
            const { ctx, chartArea, scales } = chart;
            const xScale = scales.x;

            if (chart._hoverX == null) return;

            const time = xScale.getValueForPixel(chart._hoverX);

            const frame = getFrameFromTime(time);
            chart._currentFrame = frame;
            let player = activePlayer.toUpperCase();

            ctx.save();

            ctx.globalAlpha = 0.6;
            ctx.fillStyle = "white";
            ctx.font = "16px monospace";

            let text = `Frame: ${frame}`;

            // CTRL → add
            if (options.ctrlActive()) {
                const active = chart.getActiveElements();

                let snappedFrame = null;

                if (active.length > 0) {
                    const { datasetIndex, index } = active[0];
                    const point = chart.data.datasets[datasetIndex].data[index];

                    // Allow snapping no matter what dataset the point belongs to
                    snappedFrame = point.frame;
                }

                if (snappedFrame !== null) {
                    text = `Frame: ${snappedFrame} → Click to add for ${player}`;
                    chart._currentFrame = snappedFrame;
                }
                else{
                    text = `Frame: ${frame} → Click to add for ${player}`;
                    chart._currentFrame = frame;
                }
            }
            // ALT → remove (ONLY if frame exists for active player)
            else if (options.altActive()) {
                const active = chart.getActiveElements();

                let snappedFrame = null;

                if (active.length > 0) {
                    const { datasetIndex, index } = active[0];
                    const point = chart.data.datasets[datasetIndex].data[index];

                    // only allow snapping to selected player
                    const datasetLabel = chart.data.datasets[datasetIndex].label;

                    if (
                    (options.activePlayer() === "p1" && datasetLabel.includes("Player 1")) ||
                    (options.activePlayer() === "p2" && datasetLabel.includes("Player 2"))
                    ) {
                    snappedFrame = point.frame;
                    }
                }

                if (snappedFrame !== null) {
                    text = `Frame: ${snappedFrame} → Click to remove for ${player}`;
                    chart._currentFrame = snappedFrame;
                }
                else{
                    const hasClick =
                        options.activePlayer() === "p1"
                        ? options.p1Frames().includes(frame)
                        : options.p2Frames().includes(frame);

                    if (hasClick) {
                        text = `Frame: ${frame} → Click to remove for ${player}`;
                        chart._currentFrame = frame;
                    }
                }
            }
            else{
                const active = chart.getActiveElements();

                let snappedFrame = null;

                if (active.length > 0) {
                    const { datasetIndex, index } = active[0];
                    const point = chart.data.datasets[datasetIndex].data[index];

                    // Allow snapping no matter what dataset the point belongs to
                    snappedFrame = point.frame;
                }

                if (snappedFrame !== null) {
                    text = `Frame: ${snappedFrame}`;
                    chart._currentFrame = snappedFrame;
                }
                else{
                    text = `Frame: ${frame}`;
                    chart._currentFrame = frame;
                }
            }

            ctx.fillText(
            text,
            chartArea.left + 8,
            chartArea.bottom - 8
            );

            ctx.restore();
        }
    };

    const timewarpPlugin = {
        id: 'timewarpLines',

        afterDraw(chart, args, options) {
            if (!options || !options.show) return;

            const { ctx, chartArea, scales } = chart;
            const xScale = scales.x;

            ctx.save();

            timewarpInfo.forEach(tw => {
            const x = xScale.getPixelForValue(getRealTime(tw[0]));

             // Clip to chart area
            ctx.beginPath();
            ctx.rect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top
            );
            ctx.clip();

            // Draw vertical line
            ctx.beginPath();
            ctx.moveTo(x, chartArea.top);
            ctx.lineTo(x, chartArea.bottom);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // dashed line
            ctx.stroke();

            // Draw label
            ctx.fillStyle = 'yellow';
            ctx.font = '12px Arial';
            ctx.fillText(`${tw[1]}x`, x + 5, chartArea.top + 12);
            });

            ctx.restore();
        }
    };

    const cpsLimitPlugin = {
        id: 'cpsLimitLine',

        afterDraw(chart, args, options) {
            if (!options || !options.show) return;

            const { ctx, chartArea, scales } = chart;
            const yScale = scales.y;

            const yValue = options.value || 16;
            const y = yScale.getPixelForValue(yValue);

            ctx.save();

            // Clip to chart area
            ctx.beginPath();
            ctx.rect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top
            );
            ctx.clip();

            // Draw horizontal line
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.strokeStyle = options.color || 'black';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke();

            // Draw label
            ctx.fillStyle = options.color || 'black';
            ctx.font = '12px Arial';
            ctx.fillText(`${yValue} CPS`, chartArea.left + 5, y - 5);

            ctx.restore();
        }
    };

    const overlayTooltipPlugin = {
        id: 'overlayTooltip',

        afterEvent(chart, args) {
            const event = args.event;
            const { chartArea, scales } = chart;

            const cpsOptions = chart.options.plugins.cpsLimitLine;
            const twOptions = chart.options.plugins.timewarpLines;

            const x = event.x;
            const y = event.y;

            chart.$mouse = {x, y};

            // If hovering a real point, prioritize default tooltip
            const elements = chart.getElementsAtEventForMode(
                event,
                'nearest',
                { intersect: true },
                false
            );

            if (elements.length > 0) {
                chart.$overlayTooltip = null;
                chart.draw();
                return;
            }

            if (
                x < chartArea.left ||
                x > chartArea.right ||
                y < chartArea.top ||
                y > chartArea.bottom
            ){
                chart.$overlayTooltip = null;
                chart.draw();
                return;
            }

            let tooltipText = null;

            // --- Check 16 CPS line ---
            if(cpsOptions?.show){
                const yScale = scales.y;
                const yLine = yScale.getPixelForValue(16);

                if (Math.abs(y - yLine) < 5) {
                tooltipText = "Rule 1 limit: 16 CPS";
                }
            }

            // --- Check timewarp lines ---
            if(twOptions?.show){
                const xScale = scales.x;

                timewarpInfo.forEach(tw => {
                const xLine = xScale.getPixelForValue(getRealTime(tw[0]));

                if (Math.abs(x - xLine) < 5) {
                    tooltipText = `Timewarp: frame ${tw[0]}, ${tw[1]}x`;
                }
                });
            }

            chart.$overlayTooltip = tooltipText;
            chart.draw();
        },

        afterDraw(chart) {
            const text = chart.$overlayTooltip;
            const mouse = chart.$mouse;
            if (!text || !mouse) return;

            const { ctx } = chart;

            const x = mouse.x;
            const y = mouse.y;

            ctx.save();

            // Tooltip box
            ctx.fillStyle = 'black';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(x + 10, y + 10, 200, 30);

            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(text, x + 15, y + 30);

            ctx.restore();
        }
    };

    const customTitlesPlugin = {
        id: 'customTitles',

        afterDraw(chart) {
            const { ctx, chartArea, canvas } = chart;

            if (!chartArea) return;

            const centerX = (chartArea.left + chartArea.right) / 2;

            ctx.save();

            // MAIN TITLE
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#ffffff'; // change maybe
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            ctx.fillText(
            'Rolling CPS (1-Second Window)',
            centerX/2.9,
            chartArea.top - 10
            );

            // X-AXIS TITLE
            ctx.font = '14px Arial';
            ctx.textBaseline = 'top';

            ctx.fillText(
            'Time',
            centerX/2.9,
            chartArea.bottom + 40
            );

            ctx.restore();
        }
        };

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                label: 'Player 1 CPS',
                player: 'p1',
                data: dataPoints,
                parsing: false,
                tension: 0.1,
                borderColor:'blue',
                backgroundColor:'blue',
                pointBackgroundColor: (ctx) => {
                    const p = ctx.raw;
                    if (!p || p.count === undefined) {
                        return ctx.dataset.borderColor;
                    }
                    return p.count > 3 ? "red" : ctx.dataset.borderColor;
                },
                 pointRadius: (ctx) => {
                    const p = ctx.raw;
                    if (!p || p.count === undefined) {
                        return 3;
                    }
                    return p.count > 3 ? 6 : 3;
                },
                pointBorderColor: (ctx) => {
                    const p = ctx.raw;
                    if (!p || p.count === undefined) {
                        return ctx.dataset.borderColor;
                    }
                    return p.count > 3 ? "darkred" : ctx.dataset.borderColor;
                }
            },
             {
                label: 'Player 2 CPS',
                player: 'p2',
                data: dataPoints2,
                parsing: false, // IMPORTANT
                tension: 0.1,
                borderColor:'green',
                backgroundColor:'green',
                pointBackgroundColor: (ctx) => {
                    const p = ctx.raw;
                    if (!p || p.count === undefined) {
                        return ctx.dataset.borderColor;
                    }
                    return p.count > 3 ? "red" : ctx.dataset.borderColor;
                },
                 pointRadius: (ctx) => {
                    const p = ctx.raw;
                    if (!p || p.count === undefined) {
                        return 3;
                    }
                    return p.count > 3 ? 6 : 3;
                },
                pointBorderColor: (ctx) => {
                    const p = ctx.raw;
                    if (!p || p.count === undefined) {
                        return ctx.dataset.borderColor;
                    }
                    return p.count > 3 ? "darkred" : ctx.dataset.borderColor;
                }
            },
              {
                label: 'Combined player CPS',
                player: 'combined',
                data: dataPoints3,
                parsing: false, // IMPORTANT
                tension: 0.1,
                borderColor:'pink',
                backgroundColor:'pink',
                hidden:true
            }
            ]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: minX,
                    max: maxX,
                    title: {
                        display: false,
                        text: 'Time',
                        align:'end'
                    },
                    ticks:{
                        stepSize:1,
                    }
                },
                y: {
                    title: {
                        display: false,
                        text: 'CPS'
                    }
                }
            },
            plugins: {
                frameHover: {
                ctrlActive: () => ctrlPressed,
                altActive: () => altPressed,

                activePlayer: () => activePlayer,

                p1Frames: () => p1InputArray,
                p2Frames: () => p2InputArray
            },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',   // only horizontal
                        modifierKey: null // allows drag without holding a key
                    },
                    zoom: {
                        wheel: {
                        enabled: true // scroll to zoom
                        },
                        pinch: {
                        enabled: true // mobile
                        },
                        mode: 'xy',

                        onZoomStart({ chart, event }) {
                            if (event.shiftKey) {
                            // Shift held → Y-axis zoom only
                            chart.options.plugins.zoom.zoom.mode = 'y';
                            } else {
                            // Default → X-axis zoom only
                            chart.options.plugins.zoom.zoom.mode = 'x';
                            }
                        }
                    }
                },
                cpsLimitLine: {
                    show: true,
                    value: 16,
                    color: 'red',
                },
                timewarpLines: {
                    show: true
                },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const p = items[0].raw;
                            return `Frame: ${p.frame}`;
                        },

                        label: (ctx) => {
                            return `${ctx.dataset.label}: ${ctx.parsed.y}`;
                        },

                        /*afterBody: (items) => {
                            const p = items[0].raw;
                            return `Time: ${p.x.toFixed(3)}s\n`;
                        } */
                       afterBody: (items) => {
                            if (!items.length) return;

                            const first = items[0].raw;

                            let lines = [];

                            // --- Time ---
                            lines.push(`Time: ${first.x.toFixed(3)}s`);

                            let p1Count = null;
                            let p2Count = null;
                            let combinedCount = null;

                            // --- Extract counts from datasets ---
                            for (const item of items) {
                                const p = item.raw;
                                const ds = item.dataset;

                                if (p.count === undefined) continue;

                                if (ds.player === "p1") {
                                p1Count = p.count;
                                } else if (ds.player === "p2") {
                                p2Count = p.count;
                                } else if (ds.player === "combined") {
                                combinedCount = p.count;
                                }
                            }

                            // --- Show per-player counts ---
                            if (p1Count !== null) {
                                lines.push(`P1 clicks this frame: ${p1Count}`);
                            }

                            if (p2Count !== null) {
                                lines.push(`P2 clicks this frame: ${p2Count}`);
                            }

                            // --- Combined clicks if available
                            if (combinedCount !== null) {
                                lines.push(`Combined clicks this frame: ${combinedCount}`);
                            }

                            // --- Rule 2 violations (ONLY for individual players) ---
                            if (p1Count !== null && p1Count > 3) {
                                lines.push(`⚠ Rule 2 violation for P1`);
                            }

                            if (p2Count !== null && p2Count > 3) {
                                lines.push(`⚠ Rule 2 violation for P2`);
                            }

                            return lines;
                        }
                    }
                },
                title:{
                    display:false,
                    text: 'Please work',
                    align: 'end',
                }
            }
        },
        plugins: [cpsLimitPlugin, timewarpPlugin, overlayTooltipPlugin, frameHoverPlugin]
        });

    document.addEventListener("keydown", (e) => {
        const prevCtrl = ctrlPressed;
        const prevAlt = altPressed;

        ctrlPressed = e.ctrlKey;
        altPressed = e.altKey;

        // only redraw if something actually changed
        if (prevCtrl !== ctrlPressed || prevAlt !== altPressed) {
            chart.draw();
        }
        });

        document.addEventListener("keyup", (e) => {
        const prevCtrl = ctrlPressed;
        const prevAlt = altPressed;

        ctrlPressed = e.ctrlKey;
        altPressed = e.altKey;

        if (prevCtrl !== ctrlPressed || prevAlt !== altPressed) {
            chart.draw();
        }
    });
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        chart._hoverX = e.clientX - rect.left;

        chart.draw();
    });
    canvas.addEventListener("mouseleave", (e) => {
        chart._hoverX = null;
        chart.draw();
    });
    canvas.addEventListener("click", (e) => {
        const frame = chart._currentFrame;

        if (frame == null) return;

        // CTRL → add
        if (ctrlPressed) {
            handleAdd(frame);
        }

        // ALT → remove
        else if (altPressed) {
            handleRemove(frame);
        }
    });
    function handleAdd(frame) {
        saveState();
        if (activePlayer === "p1") {
            p1InputArray.push(frame);
        } else {
            p2InputArray.push(frame);
        }
        // Update log
        addToLog(`add ${activePlayer} ${frame}`);
        recomputeAndRender();
    }
    function handleRemove(frame) {
        const targetArray = activePlayer === "p1" ? p1InputArray : p2InputArray;

        const index = targetArray.indexOf(frame);

        if (index === -1) return; // nothing to remove

        saveState();
        targetArray.splice(index, 1);
        // Update log
        addToLog(`remove ${activePlayer} ${frame}`);
        recomputeAndRender();
    }
    function toggleDataset(index, visible) {
        chart.setDatasetVisibility(index, visible);
        chart.update();
    }
    document.getElementById('toggleP1').onchange = (e) => {
    toggleDataset(0, e.target.checked);
    };

    document.getElementById('toggleP2').onchange = (e) => {
    toggleDataset(1, e.target.checked);
    };

    document.getElementById('toggleCombined').onchange = (e) => {
    toggleDataset(2, e.target.checked);
    };

    document.getElementById('toggleLimit').onchange = (e) => {
        chart.options.plugins.cpsLimitLine.show = e.target.checked;
        chart.update();
    };    

    document.getElementById('toggleTimewarps').onchange = (e) => {
        chart.options.plugins.timewarpLines.show = e.target.checked;
        chart.update();
    };

    document.getElementById('resetZoomBtn').addEventListener('click', () => {
        chart.resetZoom();
    });
    return chart;
}

function createGraph2(result1, result2, result3){
    /*const dataPoints = result1.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame
    }));

    const dataPoints2 = result2.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame
    }));

    const dataPoints3 = result3.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame
    })); */

    /*const minX = Math.max(result1[0].x - 10, 0);
    const maxX = result1[result1.length - 1].x + 10;*/
    const {minX, maxX} = getMinMaxX([result1, result2]);
    
    const canvas = document.getElementById('cpsChart2');
    // Make it wide (scrollable)
    const pixelsPerFrame = 0.1;
    canvas.width = 2000;//(maxX-minX) * pixelsPerFrame; 2000
    canvas.height = 500;

    const ctx = canvas.getContext('2d');

    const frameHoverPlugin = {
        id: "frameHover",

        afterDraw(chart, args, options) {
            const { ctx, chartArea, scales } = chart;
            const xScale = scales.x;

            if (chart._hoverX == null) return;

            const time = xScale.getValueForPixel(chart._hoverX);

            const frame = getFrameFromTime(time);

            ctx.save();

            ctx.globalAlpha = 0.6;
            ctx.fillStyle = "white";
            ctx.font = "16px monospace";

            let text = `Frame: ${frame}`;

            // Snap to any point being hovered
            
                const active = chart.getActiveElements();

                let snappedFrame = null;

                if (active.length > 0) {
                    const { datasetIndex, index } = active[0];
                    const point = chart.data.datasets[datasetIndex].data[index];

                    // Allow snapping no matter what dataset the point belongs to
                    snappedFrame = point.frame;
                }

                if (snappedFrame !== null) {
                    text = `Frame: ${snappedFrame}`;
                }
                else{
                    text = `Frame: ${frame}`;
                }

            ctx.fillText(
            text,
            chartArea.left + 8,
            chartArea.bottom - 8
            );

            ctx.restore();
        }
    };

    const timewarpPlugin = {
        id: 'timewarpLines',

        afterDraw(chart, args, options) {
            if (!options || !options.show) return;

            const { ctx, chartArea, scales } = chart;
            const xScale = scales.x;

            ctx.save();

            timewarpInfo.forEach(tw => {
            const x = xScale.getPixelForValue(getRealTime(tw[0]));

             // Clip to chart area
            ctx.beginPath();
            ctx.rect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top
            );
            ctx.clip();

            // Draw vertical line
            ctx.beginPath();
            ctx.moveTo(x, chartArea.top);
            ctx.lineTo(x, chartArea.bottom);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // dashed line
            ctx.stroke();

            // Draw label
            ctx.fillStyle = 'yellow';
            ctx.font = '12px Arial';
            ctx.fillText(`${tw[1]}x`, x + 5, chartArea.top + 12);
            });

            ctx.restore();
        }
        };

    const cpsLimitPlugin = {
        id: 'cpsLimitLine',

        afterDraw(chart, args, options) {
            if (!options || !options.show) return;

            const { ctx, chartArea, scales } = chart;
            const yScale = scales.y;

            const yValue = options.value || 48;
            const y = yScale.getPixelForValue(yValue);

            ctx.save();

            // Clip to chart area
            ctx.beginPath();
            ctx.rect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top
            );
            ctx.clip();

            // Draw horizontal line
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.strokeStyle = options.color || 'black';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke();

            // Draw label
            ctx.fillStyle = options.color || 'black';
            ctx.font = '12px Arial';
            ctx.fillText(`${yValue} CPS`, chartArea.left + 5, y - 5);

            ctx.restore();
        }
    };

    const overlayTooltipPlugin = {
        id: 'overlayTooltip',

        afterEvent(chart, args) {
            const event = args.event;
            const { chartArea, scales } = chart;

            const cpsOptions = chart.options.plugins.cpsLimitLine;
            const twOptions = chart.options.plugins.timewarpLines;

            const x = event.x;
            const y = event.y;

            chart.$mouse = {x, y};

            // If hovering a real point, prioritize default tooltip
            const elements = chart.getElementsAtEventForMode(
                event,
                'nearest',
                { intersect: true },
                false
            );

            if (elements.length > 0) {
                chart.$overlayTooltip = null;
                chart.draw();
                return;
            }

            if (
                x < chartArea.left ||
                x > chartArea.right ||
                y < chartArea.top ||
                y > chartArea.bottom
            ){
                chart.$overlayTooltip = null;
                chart.draw();
                return;
            }

            let tooltipText = null;

            // --- Check 48 CPS line ---
            if(cpsOptions?.show){
                const yScale = scales.y;
                const yLine = yScale.getPixelForValue(48);

                if (Math.abs(y - yLine) < 5) {
                tooltipText = "Rule 3 limit: 48 CPS";
                }
            }

            // --- Check timewarp lines ---
            if(twOptions?.show){
                const xScale = scales.x;

                timewarpInfo.forEach(tw => {
                const xLine = xScale.getPixelForValue(getRealTime(tw[0]));

                if (Math.abs(x - xLine) < 5) {
                    tooltipText = `Timewarp: frame ${tw[0]}, ${tw[1]}x`;
                }
                });
            }

            chart.$overlayTooltip = tooltipText;
            chart.draw();
        },

        afterDraw(chart) {
            const text = chart.$overlayTooltip;
            const mouse = chart.$mouse;
            if (!text || !mouse) return;

            const { ctx } = chart;

            const x = mouse.x;
            const y = mouse.y;

            ctx.save();

            // Tooltip box
            ctx.fillStyle = 'black';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(x + 10, y + 10, 200, 30);

            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(text, x + 15, y + 30);

            ctx.restore();
        }
    };

    const customTitlesPlugin = {
        id: 'customTitles',

        afterDraw(chart) {
            const { ctx, chartArea, canvas } = chart;

            if (!chartArea) return;

            const centerX = (chartArea.left + chartArea.right) / 2;

            ctx.save();

            // MAIN TITLE
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#ffffff'; // change maybe
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            ctx.fillText(
            'Rolling CPS (1-Second Window)',
            centerX/2.9,
            chartArea.top - 10
            );

            // X-AXIS TITLE
            ctx.font = '14px Arial';
            ctx.textBaseline = 'top';

            ctx.fillText(
            'Time',
            centerX/2.9,
            chartArea.bottom + 40
            );

            ctx.restore();
        }
        };

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                label: 'Player 1 CPS',
                data: result1,
                parsing: false,
                tension: 0.1,
                borderColor:'blue',
                backgroundColor:'blue'
            },
             {
                label: 'Player 2 CPS',
                data: result2,
                parsing: false, // IMPORTANT
                tension: 0.1,
                borderColor:'green',
                backgroundColor:'green'
            },
              {
                label: 'Combined player CPS',
                data: result3,
                parsing: false, // IMPORTANT
                tension: 0.1,
                borderColor:'pink',
                backgroundColor:'pink',
                hidden:true
            }
            ]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: minX,
                    max: maxX,
                    title: {
                        display: false,
                        text: 'Time',
                        align:'end'
                    },
                    ticks:{
                        stepSize:1,
                    }
                },
                y: {
                    title: {
                        display: false,
                        text: 'CPS'
                    }
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',   // only horizontal
                        modifierKey: null // allows drag without holding a key
                    },
                    zoom: {
                        wheel: {
                        enabled: true // scroll to zoom
                        },
                        pinch: {
                        enabled: true // mobile
                        },
                        mode: 'xy',

                        onZoomStart({ chart, event }) {
                            if (event.shiftKey) {
                            // Shift held → Y-axis zoom only
                            chart.options.plugins.zoom.zoom.mode = 'y';
                            } else {
                            // Default → X-axis zoom only
                            chart.options.plugins.zoom.zoom.mode = 'x';
                            }
                        }
                    }
                },
                cpsLimitLine: {
                    show: true,
                    value: 48,
                    color: 'red'
                },
                timewarpLines: {
                    show: true
                },
                tooltip: {
                    callbacks: {

                        // Top line → ending frame
                        title: (items) => {
                        const p = items[0].raw;
                        return `Frame: ${p.frame}`;
                        },

                        // Main body
                        label: (ctx) => {
                            const p = ctx.raw;

                            const cpsText = p.isInfinite
                                ? "Infinite"
                                : p.y.toFixed(3);

                            return [
                                `${ctx.dataset.label}: ${cpsText}`
                            ];
                        },

                        // Extra info
                        afterBody: (items) => {
                            const p = items[0].raw;

                            const deltaTime = p.x - p.startTime;

                            return [
                                `Time: ${p.x.toFixed(3)}s`,
                                `Start Frame: ${p.startFrame}`,
                                `Stint Length: ${p.length}`,
                                `\u0394T: ${deltaTime.toFixed(3)}s`,
                            ];
                        }
                    }
                },
                title:{
                    display:false,
                    text: 'Please work',
                    align: 'end',
                }
            }
        },
        plugins: [cpsLimitPlugin, timewarpPlugin, overlayTooltipPlugin, frameHoverPlugin]
        });
    
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        chart._hoverX = e.clientX - rect.left;

        chart.draw();
    });
    canvas.addEventListener("mouseleave", (e) => {
        chart._hoverX = null;
        chart.draw();
    });
    function toggleDataset(index, visible) {
        chart.setDatasetVisibility(index, visible);
        chart.update();
    }
    document.getElementById('toggleP1-2').onchange = (e) => {
    toggleDataset(0, e.target.checked);
    };

    document.getElementById('toggleP2-2').onchange = (e) => {
    toggleDataset(1, e.target.checked);
    };

    document.getElementById('toggleCombined-2').onchange = (e) => {
    toggleDataset(2, e.target.checked);
    };

    document.getElementById('toggleLimit-2').onchange = (e) => {
        chart.options.plugins.cpsLimitLine.show = e.target.checked;
        chart.update();
    };    

    document.getElementById('toggleTimewarps-2').onchange = (e) => {
        chart.options.plugins.timewarpLines.show = e.target.checked;
        chart.update();
    };

    document.getElementById('resetZoomBtn-2').addEventListener('click', () => {
        chart.resetZoom();
    });
    return chart;
}

document.addEventListener('keydown', function(event) {
    if (event.altKey) {
        event.preventDefault();
    }
});

document.querySelectorAll('input[name="draw-target"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    activePlayer = e.target.value;
  });
});

let ctrlPressed = false;
let altPressed = false;

function getFrameFromTime(time) {
  if (time <= 0) return 0;

  let currentFrame = 0;
  let currentTime = 0;
  let currentSpeed = 1;

  for (let i = 0; i <= timewarpInfo.length; i++) {
    const nextWarp = timewarpInfo[i];
    const nextFrame = nextWarp ? nextWarp[0] : Infinity;

    // duration of this segment in frames
    const frameSpan = nextFrame - currentFrame;

    // time per frame in this segment
    const timePerFrame = (1 / framerate) / currentSpeed;

    const segmentTime = frameSpan * timePerFrame;

    // does target time fall inside this segment?
    if (currentTime + segmentTime >= time) {
      const remainingTime = time - currentTime;
      const framesIntoSegment = remainingTime / timePerFrame;
      return Math.round(currentFrame + framesIntoSegment);
    }

    // otherwise move to next segment
    currentTime += segmentTime;
    currentFrame = nextFrame;

    if (nextWarp) {
      currentSpeed = nextWarp[1]; // update speed
    }
  }

  return Math.round(currentFrame);
}

function updateLogUI() {
  const logBox = document.getElementById("log-output");
  logBox.value = actionLog.join(" ");
  logBox.scrollTop = logBox.scrollHeight;
}

function addToLog(entry) {
  actionLog.push(entry);
  updateLogUI();
}

const editor = document.getElementById("batch-input");
editor.addEventListener("input", updateHighlight);
editor.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
});
editor.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    // insert a newline manually
    document.execCommand("insertLineBreak");
  }
});

function updateHighlight() {
  const selection = saveCaretPosition(editor);

  const text = editor.innerText;

  editor.innerHTML = highlightSyntax(text);

  restoreCaretPosition(editor, selection);
}

function saveCaretPosition(container) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  const preRange = range.cloneRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.endContainer, range.endOffset);

  return preRange.toString().length;
}

function restoreCaretPosition(container, offset) {
  const selection = window.getSelection();
  const range = document.createRange();

  let currentOffset = 0;

  function traverse(node) {
    if (node.nodeType === 3) {
      const nextOffset = currentOffset + node.length;

      if (offset <= nextOffset) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }

      currentOffset = nextOffset;
    } else {
      for (let child of node.childNodes) {
        if (traverse(child)) return true;
      }
    }
    return false;
  }

  traverse(container);
}

function highlightSyntax(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

      .replace(/\b(add|remove)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(p1|p2)\b/g, '<span class="player">$1</span>')
      .replace(/\btw\b/g, '<span class="timewarp">tw</span>')
      .replace(/\ball\b/g, '<span class="special">all</span>');
  }

function showInfo(graphId) {
  document.getElementById(`${graphId}-info`).style.display = "block";
}

function hideInfo(graphId) {
  document.getElementById(`${graphId}-info`).style.display = "none";
}

document.getElementById("undo-btn").addEventListener("click", undo);

function undo() {
  if (historyStack.length === 0) {
    alert("Nothing to undo");
    return;
  }

  const prev = historyStack.pop();

  p1InputArray = [...prev.p1Frames];
  p2InputArray = [...prev.p2Frames];
  timewarpInfo = prev.timewarps.map(tw => [...tw]);

  // Remove last log entry
  actionLog.pop();
  updateLogUI();  

  recomputeAndRender();
}

function saveState() {
  historyStack.push({
    p1Frames: [...p1InputArray],
    p2Frames: [...p2InputArray],
    timewarps: timewarpInfo.map(tw => [...tw])
  });

  // limit size
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift();
  }
}

document.querySelectorAll('.slider').forEach(slider => {
  const color = slider.getAttribute('data-color');
  slider.style.setProperty('--toggle-color', color);
});

const sandbox = document.getElementById("sandbox-container");
const header = document.getElementById("drag-handle");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Mouse down → start dragging
header.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = sandbox.getBoundingClientRect();

  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
});

// Mouse move → move element
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
    sandbox.style.left = `${e.clientX + window.scrollX - offsetX}px`;
    sandbox.style.top = `${e.clientY + window.scrollY - offsetY}px`;
});

// Mouse up → stop dragging
document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.getElementById("apply-batch").addEventListener("click", () => {
  const input = document.getElementById("batch-input").innerText;

  try {
    const tokens = tokenize(input);
    const operations = parse(tokens);
    if(operations.length === 0) throw new Error(`No operations to perform`);
    validateOperationsSequential(operations);
    saveState();
    applyOperations(operations);
    // Add to log
    addToLog(tokens.join(" "));
    recomputeAndRender();

  } catch (err) {
    alert(err.message);
  }
});

function validateOperationsSequential(operations) {
  const temp = cloneState();

  for (const op of operations) {

    // =========================
    // TARGET-LEVEL REMOVE ALL
    // =========================
    if (op.action === "remove" && op.allTarget) {

      if (op.target === "p1") temp.p1 = [];
      else if (op.target === "p2") temp.p2 = [];
      else if (op.target === "tw") temp.tw = [];

      continue;
    }

    // =========================
    // CLICKS
    // =========================
    if (op.target === "p1" || op.target === "p2") {

      const arr = op.target === "p1" ? temp.p1 : temp.p2;

      if (op.action === "add") {
        const count = op.count === "all" ? 1 : op.count;

        for (let i = 0; i < count; i++) {
          arr.push(op.frame);
        }

      } else if (op.action === "remove") {

        const exists = arr.includes(op.frame);

        if (!exists) {
          throw new Error(
            `Cannot remove ${op.target} at frame ${op.frame} (does not exist at this step)`
          );
        }

        if (op.count === "all") {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === op.frame) arr.splice(i, 1);
          }

        } else {
          let toRemove = op.count;

          for (let i = arr.length - 1; i >= 0 && toRemove > 0; i--) {
            if (arr[i] === op.frame) {
              arr.splice(i, 1);
              toRemove--;
            }
          }
        }
      }
    }

    // =========================
    // TIMEWARPS
    // =========================
    if (op.target === "tw") {

      if (op.action === "add") {

        const index = temp.tw.findIndex(tw => tw[0] === op.frame);
        if (index !== -1) temp.tw.splice(index, 1);

        temp.tw.push([op.frame, op.factor]);

      } else if (op.action === "remove") {

        const exists = temp.tw.some(tw => tw[0] === op.frame);

        if (!exists) {
          throw new Error(
            `Cannot remove timewarp at frame ${op.frame} (does not exist at this step)`
          );
        }

        const index = temp.tw.findIndex(tw => tw[0] === op.frame);
        temp.tw.splice(index, 1);
      }
    }
  }
}

function cloneState() {
  return {
    p1: [...p1InputArray],
    p2: [...p2InputArray],
    tw: timewarpInfo.map(tw => [...tw])
  };
}

function applyOperations(operations) {
  for (const op of operations) {

    // =====================================================
    // 🟨 NEW: TARGET-LEVEL REMOVE ALL
    // =====================================================
    if (op.action === "remove" && op.allTarget) {

      if (op.target === "p1") {
        p1InputArray.length = 0;
      }

      else if (op.target === "p2") {
        p2InputArray.length = 0;
      }

      else if (op.target === "tw") {
        timewarpInfo.length = 0;
      }

      continue; // 🔥 VERY IMPORTANT
    }

    // =====================================================
    // CLICKS (p1 / p2)
    // =====================================================
    if (op.target === "p1" || op.target === "p2") {
      const arr = op.target === "p1" ? p1InputArray : p2InputArray;

      if (op.action === "add") {
        const count = op.count === "all" ? 1 : op.count;

        for (let i = 0; i < count; i++) {
          arr.push(op.frame);
        }

      } else if (op.action === "remove") {

        if (op.count === "all") {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === op.frame) {
              arr.splice(i, 1);
            }
          }

        } else {
          let toRemove = op.count;

          for (let i = arr.length - 1; i >= 0 && toRemove > 0; i--) {
            if (arr[i] === op.frame) {
              arr.splice(i, 1);
              toRemove--;
            }
          }
        }
      }
    }

    // =====================================================
    // 🟪 TIMEWARPS
    // =====================================================
    if (op.target === "tw") {

      if (op.action === "add") {

        const index = timewarpInfo.findIndex(tw => tw[0] === op.frame);
        if (index !== -1) {
          timewarpInfo.splice(index, 1);
        }

        timewarpInfo.push([op.frame, op.factor]);

      } else if (op.action === "remove") {

        const index = timewarpInfo.findIndex(tw => tw[0] === op.frame);
        if (index !== -1) {
          timewarpInfo.splice(index, 1);
        }
      }
    }
  }
}

// Old apply operations
/*function applyOperations(operations) {
  for (const op of operations) {

    // =====================================================
    // CLICKS (p1 / p2)
    // =====================================================
    if (op.target === "p1" || op.target === "p2") {
      const arr = op.target === "p1" ? p1InputArray : p2InputArray;

      if (op.action === "add") {
        const count = op.count === "all" ? 1 : op.count;

        for (let i = 0; i < count; i++) {
          arr.push(op.frame);
        }

      } else if (op.action === "remove") {

        if (op.count === "all") {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === op.frame) {
              arr.splice(i, 1);
            }
          }

        } else {
          let toRemove = op.count;

          for (let i = arr.length - 1; i >= 0 && toRemove > 0; i--) {
            if (arr[i] === op.frame) {
              arr.splice(i, 1);
              toRemove--;
            }
          }
        }
      }
    }

    // =====================================================
    // 🟣 TIMEWARPS
    // =====================================================
    if (op.target === "tw") {

      if (op.action === "add") {

        // Replace existing timewarp at same frame
        const index = timewarpInfo.findIndex(tw => tw[0] === op.frame);
        if (index !== -1) {
          timewarpInfo.splice(index, 1);
        }

        timewarpInfo.push([op.frame, op.factor]);

      } else if (op.action === "remove") {

        const index = timewarpInfo.findIndex(tw => tw[0] === op.frame);
        if (index !== -1) {
          timewarpInfo.splice(index, 1);
        }
      }
    }
  }
}*/

function parse(tokens) {
  const operations = [];

  let currentAction = null;
  let currentTarget = null;

  for (let token of tokens) {

    // --- ACTION ---
    if (token === "add" || token === "remove") {
      currentAction = token;
      currentTarget = null;
      continue;
    }

    // --- TARGET ---
    if (token === "p1" || token === "p2" || token === "tw") {
      currentTarget = token;
      continue;
    }

    // --- ARGUMENT ---
    if (!currentAction || !currentTarget) {
      throw new Error(`Invalid syntax near "${token}" (missing action or target)`);
    }

    // =====================================================
    // 🟨 NEW: TARGET-LEVEL "all"
    // =====================================================
    if (token === "all") {

      if (currentAction !== "remove") {
        throw new Error(`"all" is only valid with "remove"`);
      }

      operations.push({
        action: "remove",
        target: currentTarget,
        allTarget: true
      });

      continue;
    }

    // =====================================================
    // NORMAL ARGUMENT PARSING
    // =====================================================

    const [frameStr, modifier] = token.split(":");
    const frame = Number(frameStr);

    if (!Number.isInteger(frame) || frame < 0) {
      throw new Error(`Invalid frame "${frameStr}"`);
    }

    // =====================================================
    // 🟪 TIMEWARP LOGIC
    // =====================================================
    if (currentTarget === "tw") {

      if (currentAction === "add") {
        if (modifier === undefined) {
          throw new Error(`Timewarp requires a factor (use frame:factor)`);
        }

        const factor = Number(modifier);

        if (isNaN(factor) || factor <= 0) {
          throw new Error(`Invalid timewarp factor "${modifier}"`);
        }

        operations.push({
          action: "add",
          target: "tw",
          frame,
          factor
        });

      } else if (currentAction === "remove") {
        operations.push({
          action: "remove",
          target: "tw",
          frame
        });
      }

      continue;
    }

    // =====================================================
    // 🔵 CLICK LOGIC (p1 / p2)
    // =====================================================

    let count = 1;

    if (modifier !== undefined) {
      if (modifier === "all") {
        count = "all";
      } else {
        const num = Number(modifier);
        if (!Number.isInteger(num) || num <= 0) {
          throw new Error(`Invalid count "${modifier}"`);
        }
        count = num;
      }
    }

    operations.push({
      action: currentAction,
      target: currentTarget,
      frame,
      count
    });
  }

  return operations;
}

// Old parse
/*function parse(tokens) {
  const operations = [];

  let currentAction = null;
  let currentTarget = null;

  for (let token of tokens) {

    // --- ACTION ---
    if (token === "add" || token === "remove") {
      currentAction = token;
      currentTarget = null;
      continue;
    }

    // --- TARGET ---
    if (token === "p1" || token === "p2" || token === "tw") {
      currentTarget = token;
      continue;
    }

    // --- ARGUMENT ---
    if (!currentAction || !currentTarget) {
      throw new Error(`Invalid syntax near "${token}" (missing action or target)`);
    }

    const [frameStr, modifier] = token.split(":");
    const frame = Number(frameStr);

    if (!Number.isInteger(frame) || frame < 0) {
      throw new Error(`Invalid frame "${frameStr}"`);
    }

    // =====================================================
    // 🟣 TIMEWARP LOGIC
    // =====================================================
    if (currentTarget === "tw") {

      if (currentAction === "add") {
        if (modifier === undefined) {
          throw new Error(`Timewarp requires a factor (use frame:factor)`);
        }

        const factor = Number(modifier);

        if (isNaN(factor) || factor <= 0) {
          throw new Error(`Invalid timewarp factor "${modifier}"`);
        }

        operations.push({
          action: "add",
          target: "tw",
          frame,
          factor
        });

      } else if (currentAction === "remove") {
        operations.push({
          action: "remove",
          target: "tw",
          frame
        });
      }

      continue;
    }

    // =====================================================
    // 🔵 CLICK LOGIC (p1 / p2)
    // =====================================================

    let count = 1;

    if (modifier !== undefined) {
      if (modifier === "all") {
        count = "all";
      } else {
        const num = Number(modifier);
        if (!Number.isInteger(num) || num <= 0) {
          throw new Error(`Invalid count "${modifier}"`);
        }
        count = num;
      }
    }

    operations.push({
      action: currentAction,
      target: currentTarget,
      frame,
      count
    });
  }

  return operations;
} */

function tokenize(input) {
  return input
    .replace(/,/g, " ")        // allow commas
    .trim()
    .split(/\s+/)              // split on ANY whitespace (spaces, newlines, tabs)
    .filter(token => token.length > 0);
}

document.getElementById("add-click").addEventListener("click", () => {
  const player = document.getElementById("click-player").value;
  const frameInput = document.getElementById("click-frame").value.trim();

  // --- Validation ---
  if (frameInput === "") {
    alert("Please enter a frame.");
    return;
  }

  const frame = Number(frameInput);

  if (!Number.isInteger(frame)) {
    alert("Frame must be an integer.");
    return;
  }

  if (frame < 0) {
    alert("Frame must be ≥ 0.");
    return;
  }

  // --- Add click ---
  if (player === "p1") {
    saveState();
    p1InputArray.push(frame);
  } else if (player === "p2") {
    saveState();
    p2InputArray.push(frame);
  }

  // Update log
  addToLog(`add ${player} ${frame}`);

  // --- Recompute + update graphs ---
  recomputeAndRender();
});

document.getElementById("remove-click").addEventListener("click", () => {
  const player = document.getElementById("click-player").value;
  const frameInput = document.getElementById("click-frame").value.trim();

  // --- Validation ---
  if (frameInput === "") {
    alert("Please enter a frame.");
    return;
  }

  const frame = Number(frameInput);

  if (!Number.isInteger(frame)) {
    alert("Frame must be an integer.");
    return;
  }

  if (frame < 0) {
    alert("Frame must be ≥ 0.");
    return;
  }

  // --- Select correct array ---
  const arr = player === "p1" ? p1InputArray : p2InputArray;

  // --- Check if frame exists ---
  const index = arr.indexOf(frame);

  if (index === -1) {
    alert(`No click found at frame ${frame} for ${player.toUpperCase()}.`);
    return;
  }

  // --- Remove ONE instance ---
  saveState();
  arr.splice(index, 1);

  // Update log
  addToLog(`remove ${player} ${frame}`);

  // --- Recompute + update graphs ---
  recomputeAndRender();
});

document.getElementById("add-tw").addEventListener("click", () => {
  const frameInput = document.getElementById("tw-frame").value.trim();
  const factorInput = document.getElementById("tw-factor").value.trim();

  // --- Validation: frame ---
  if (frameInput === "") {
    alert("Please enter a frame.");
    return;
  }

  const frame = Number(frameInput);

  if (!Number.isInteger(frame)) {
    alert("Frame must be an integer.");
    return;
  }

  if (frame < 0) {
    alert("Frame must be ≥ 0.");
    return;
  }

  // --- Validation: factor ---
  if (factorInput === "") {
    alert("Please enter a timewarp factor.");
    return;
  }

  const factor = Number(factorInput);

  if (isNaN(factor)) {
    alert("Timewarp factor must be a number.");
    return;
  }

  if (factor <= 0) {
    alert("Timewarp factor must be > 0.");
    return;
  }

    // Remove existing timewarp at same frame (if any)
    const existingIndex = timewarpInfo.findIndex(tw => tw[0] === frame);
    saveState();

    if (existingIndex !== -1) {
    timewarpInfo.splice(existingIndex, 1);
    }

  // --- Add timewarp ---
  timewarpInfo.push([frame,factor]);

  // Update log
  addToLog(`add tw ${frame}:${factor}`);

  // --- Recompute + update graphs ---
  recomputeAndRender();
});

document.getElementById("remove-tw").addEventListener("click", () => {
  const frameInput = document.getElementById("tw-frame").value.trim();

  // --- Validation ---
  if (frameInput === "") {
    alert("Please enter a frame.");
    return;
  }

  const frame = Number(frameInput);

  if (!Number.isInteger(frame)) {
    alert("Frame must be an integer.");
    return;
  }

  if (frame < 0) {
    alert("Frame must be ≥ 0.");
    return;
  }

  // --- Find timewarp ---
  const index = timewarpInfo.findIndex(tw => tw[0] === frame);

  if (index === -1) {
    alert(`No timewarp found at frame ${frame}.`);
    return;
  }

  // --- Remove it ---
  saveState();
  timewarpInfo.splice(index, 1);

  // Update log
  addToLog(`remove tw ${frame}`);

  // --- Recompute + update graphs ---
  recomputeAndRender();
});

function recomputeAndRender() {
  // --- 1. Sort raw inputs ---
  p1InputArray.sort((a, b) => a - b);
  p2InputArray.sort((a, b) => a - b);
  timewarpInfo.sort((a, b) => a[0] - b[0]);

    const p1groups = groupClicks(p1InputArray);
    const p1groupsWithTime = addTimes(p1groups);
    const p1result = computeRollingCPS_Time(p1groupsWithTime);

    const p2groups = groupClicks(p2InputArray);
    const p2GroupsWithTime = addTimes(p2groups);
    const p2result = computeRollingCPS_Time(p2GroupsWithTime);
    
    const bothPlayerInputs = [...p1InputArray, ...p2InputArray];
    bothPlayerInputs.sort((a,b) => a-b);
    const bothGroups = groupClicks(bothPlayerInputs);
    const bothGroupsWithTime = addTimes(bothGroups);
    const bothresult = computeRollingCPS_Time(bothGroupsWithTime);

    const p1FramesWithTime = addTimes2(p1InputArray);
    let p1result2 = computeBurstCPS(p1FramesWithTime);
    p1result2 = collapseByTime(p1result2);
    p1result2 = capInfiniteValues(p1result2);

    const p2FramesWithTime = addTimes2(p2InputArray);
    let p2result2 = computeBurstCPS(p2FramesWithTime);
    p2result2 = collapseByTime(p2result2);
    p2result2 = capInfiniteValues(p2result2);

    const bothInputsWithTime = addTimes2(bothPlayerInputs);
    let bothresult2 = computeBurstCPS_Combined(bothInputsWithTime);
    bothresult2 = collapseByTime(bothresult2);
    bothresult2 = capInfiniteValues(bothresult2);

  // =========================================================
  // AXIS RANGE (safe for empty datasets)
  // =========================================================

  const dataPoints = p1result.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame,
        count: p.count
    }));

    const dataPoints2 = p2result.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame,
        count: p.count
    }));

    const dataPoints3 = bothresult.map(p => ({
        x: p.time,
        y: p.cps,
        frame: p.frame,
        count: p.count
    }));

    const {minX, maxX} = getMinMaxX([dataPoints, dataPoints2]);
    const {minX2, maxX2} = getMinMaxX([p1result2, p2result2]);

    // New logic for keeping current view
    let xMin1 = chart1.scales.x.min;
    let xMax1 = chart1.scales.x.max;
    let yMin1 = chart1.scales.y.min;
    let yMax1 = chart1.scales.y.max;

    let xMin2 = chart2.scales.x.min;
    let xMax2 = chart2.scales.x.max;
    let yMin2 = chart2.scales.y.min;
    let yMax2 = chart2.scales.y.max;

  // =========================================================
  // UPDATE GRAPH 1
  // =========================================================

  chart1.data.datasets[0].data = dataPoints;
  chart1.data.datasets[1].data = dataPoints2;
  chart1.data.datasets[2].data = dataPoints3;

  /*chart1.options.scales.x.min = minX;
  chart1.options.scales.x.max = maxX; */

    if(xMin1 !== undefined && xMax1 !== undefined){
        chart1.options.scales.x.min = xMin1;
        chart1.options.scales.x.max = xMax1;
    }
    if(yMin1 !== undefined && yMax1 !== undefined){
        chart1.options.scales.y.min = yMin1;
        chart1.options.scales.y.max = yMax1;
    }

  chart1.update('none');

  // =========================================================
  // UPDATE GRAPH 2
  // =========================================================

  chart2.data.datasets[0].data = p1result2;
  chart2.data.datasets[1].data = p2result2;
  chart2.data.datasets[2].data = bothresult2;

  /*chart2.options.scales.x.min = minX2;
  chart2.options.scales.x.max = maxX2;*/

    if(xMin2 !== undefined && xMax2 !== undefined){
        chart2.options.scales.x.min = xMin2;
        chart2.options.scales.x.max = xMax2;
    }
    if(yMin2 !== undefined && yMax2 !== undefined){
        chart2.options.scales.y.min = yMin2;
        chart2.options.scales.y.max = yMax2;
    }

  chart2.update('none');
}

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

// Old again
/*function reportP1FixInfo(){
    violationsP1.sort((a, b) => a.end - b.end);
    // Array to store point fixes: { frame: number, count: number }
    const fixes = [];

    // Process each violation
    for (const v of violationsP1) {
        // How much of this violation is already covered by existing fixes
        let covered = 0;
        for (const f of fixes) {
            if (f.frame >= v.start && f.frame <= v.end) {
            covered += f.count;
            }
        }

        const needed = v.excess - covered;

        // If some clicks are still needed, add a fix at the end of the violation
        if (needed > 0) {
            fixes.push({
            frame: v.end,
            count: needed
            });
        }
    }
    //console.log(fixes);

    const remaining = violationsP1.map(v => ({
        ...v,
        remaining: v.excess
    }));

    const results = [];

    for (const fix of fixes) {
    // Find violations this fix can contribute to
    const candidates = remaining.filter(v =>
        v.remaining > 0 &&
        fix.frame >= v.start &&
        fix.frame <= v.end
    );

    if (candidates.length > 0) {
        // Intersection of all candidates gives start and end of range
        let start = candidates[0].start;
        let end = candidates[0].end;

        for (const v of candidates) {
        start = Math.max(start, v.start);
        end = Math.min(end, v.end);
        }

        results.push({
        start,
        end,
        count: fix.count
        });

        // Reduce remaining coverage for these violations
        let remainingToAssign = fix.count;
        for (const v of candidates) {
        if (remainingToAssign <= 0) break;

        const used = Math.min(v.remaining, remainingToAssign);
        v.remaining -= used;
        remainingToAssign -= used;
        }
    }
    }

    const mergedResults = [];

    for (const r of results) {
    // Try to find an existing entry with same range
    const existing = mergedResults.find(
        m => m.start === r.start && m.end === r.end
    );

    if (existing) {
        // Add counts together
        existing.count += r.count;
    } else {
        // Create new entry
        mergedResults.push({ ...r });
    }
    }
    
    const fixBox = document.getElementById('player1fixbox');
    const lines = [];
    for (let i = 0; i < mergedResults.length; i++) {
        const r = mergedResults[i];

        const clickString = r.count === 1 ? "click" : "clicks";
        const betweenString =
            r.start === r.end
                ? `on frame ${r.start}`
                : `between frames ${r.start}-${r.end}`;

        lines.push(`- Remove ${r.count} ${clickString} ${betweenString}`);

        if (i < mergedResults.length - 1) {
            lines.push("\n");
        }
    }
    renderTextChunked(lines, fixBox);
} */

function reportP1FixInfo() {
    const input = p1InputArray;
    input.sort((a, b) => a - b);

    // --- Build frameCounts ---
    const frameCounts = new Map();
    for (const f of input) {
        frameCounts.set(f, (frameCounts.get(f) || 0) + 1);
    }

    // =====================================================
    // STEP 1: ORIGINAL LOGIC (minimal fixes, unchanged)
    // =====================================================
    violationsP1.sort((a, b) => a.end - b.end);

    const fixes = [];

    for (const v of violationsP1) {
        let covered = 0;

        for (const f of fixes) {
            if (f.frame >= v.start && f.frame <= v.end) {
                covered += f.count;
            }
        }

        const needed = v.excess - covered;

        if (needed > 0) {
            fixes.push({
                frame: v.end,
                count: needed
            });
        }
    }

    // =====================================================
    // STEP 2: DISTRIBUTE FIXES ON REAL CLICKS
    // =====================================================
    const usedRemovals = new Map(); // frame → used count
    const distributedFixes = [];

    for (const fix of fixes) {
        let needed = fix.count;

        // walk backwards through real clicks
        for (let i = input.length - 1; i >= 0 && needed > 0; i--) {
            const frame = input[i];

            if (frame < fix.frame - 1000000) break; // safety (never hit)
            if (frame > fix.frame) continue;

            const available = frameCounts.get(frame) || 0;
            const used = usedRemovals.get(frame) || 0;

            if (used < available) {
                usedRemovals.set(frame, used + 1);

                distributedFixes.push({
                    frame: frame,
                    count: 1
                });

                needed--;
            }
        }
    }

    // =====================================================
    // STEP 3: SAME RANGE MERGING LOGIC (UNCHANGED)
    // =====================================================
    const remaining = violationsP1.map(v => ({
        ...v,
        remaining: v.excess
    }));

    const results = [];

    for (const fix of distributedFixes) {
        const candidates = [];

        for (let i = 0; i < remaining.length; i++) {
            const v = remaining[i];
            if (
                v.remaining > 0 &&
                fix.frame >= v.start &&
                fix.frame <= v.end
            ) {
                candidates.push(v);
            }
        }

        if (candidates.length > 0) {
            let start = candidates[0].start;
            let end = candidates[0].end;

            for (let i = 1; i < candidates.length; i++) {
                const v = candidates[i];
                if (v.start > start) start = v.start;
                if (v.end < end) end = v.end;
            }

            results.push({
                start,
                end,
                count: 1
            });

            let remainingToAssign = 1;

            for (let i = 0; i < candidates.length && remainingToAssign > 0; i++) {
                const v = candidates[i];
                const used = Math.min(v.remaining, remainingToAssign);
                v.remaining -= used;
                remainingToAssign -= used;
            }
        }
    }

    // =====================================================
    // MERGE IDENTICAL RANGES
    // =====================================================
    const mergedMap = new Map();

    for (const r of results) {
        const key = `${r.start}-${r.end}`;
        if (mergedMap.has(key)) {
            mergedMap.get(key).count += r.count;
        } else {
            mergedMap.set(key, { ...r });
        }
    }

    const mergedResults = Array.from(mergedMap.values());

    // =====================================================
    // OUTPUT (UNCHANGED)
    // =====================================================
    const fixBox = document.getElementById('player1fixbox');
    const lines = [];

    for (let i = 0; i < mergedResults.length; i++) {
        const r = mergedResults[i];

        const clickString = r.count === 1 ? "click" : "clicks";
        const betweenString =
            r.start === r.end
                ? `on frame ${r.start}`
                : `between frames ${r.start}-${r.end}`;

        lines.push(`- Remove ${r.count} ${clickString} ${betweenString}`);

        if (i < mergedResults.length - 1) {
            lines.push("\n");
        }
    }

    renderTextChunked(lines, fixBox);
}

function reportP2FixInfo() {
    const input = p2InputArray;
    input.sort((a, b) => a - b);

    // --- Build frameCounts ---
    const frameCounts = new Map();
    for (const f of input) {
        frameCounts.set(f, (frameCounts.get(f) || 0) + 1);
    }

    // =====================================================
    // STEP 1: ORIGINAL LOGIC (minimal fixes, unchanged)
    // =====================================================
    violationsP2.sort((a, b) => a.end - b.end);

    const fixes = [];

    for (const v of violationsP2) {
        let covered = 0;

        for (const f of fixes) {
            if (f.frame >= v.start && f.frame <= v.end) {
                covered += f.count;
            }
        }

        const needed = v.excess - covered;

        if (needed > 0) {
            fixes.push({
                frame: v.end,
                count: needed
            });
        }
    }

    // =====================================================
    // STEP 2: DISTRIBUTE FIXES ON REAL CLICKS
    // =====================================================
    const usedRemovals = new Map(); // frame → used count
    const distributedFixes = [];

    for (const fix of fixes) {
        let needed = fix.count;

        // walk backwards through real clicks
        for (let i = input.length - 1; i >= 0 && needed > 0; i--) {
            const frame = input[i];

            if (frame < fix.frame - 1000000) break; // safety (never hit)
            if (frame > fix.frame) continue;

            const available = frameCounts.get(frame) || 0;
            const used = usedRemovals.get(frame) || 0;

            if (used < available) {
                usedRemovals.set(frame, used + 1);

                distributedFixes.push({
                    frame: frame,
                    count: 1
                });

                needed--;
            }
        }
    }

    // =====================================================
    // STEP 3: SAME RANGE MERGING LOGIC (UNCHANGED)
    // =====================================================
    const remaining = violationsP2.map(v => ({
        ...v,
        remaining: v.excess
    }));

    const results = [];

    for (const fix of distributedFixes) {
        const candidates = [];

        for (let i = 0; i < remaining.length; i++) {
            const v = remaining[i];
            if (
                v.remaining > 0 &&
                fix.frame >= v.start &&
                fix.frame <= v.end
            ) {
                candidates.push(v);
            }
        }

        if (candidates.length > 0) {
            let start = candidates[0].start;
            let end = candidates[0].end;

            for (let i = 1; i < candidates.length; i++) {
                const v = candidates[i];
                if (v.start > start) start = v.start;
                if (v.end < end) end = v.end;
            }

            results.push({
                start,
                end,
                count: 1
            });

            let remainingToAssign = 1;

            for (let i = 0; i < candidates.length && remainingToAssign > 0; i++) {
                const v = candidates[i];
                const used = Math.min(v.remaining, remainingToAssign);
                v.remaining -= used;
                remainingToAssign -= used;
            }
        }
    }

    // =====================================================
    // MERGE IDENTICAL RANGES
    // =====================================================
    const mergedMap = new Map();

    for (const r of results) {
        const key = `${r.start}-${r.end}`;
        if (mergedMap.has(key)) {
            mergedMap.get(key).count += r.count;
        } else {
            mergedMap.set(key, { ...r });
        }
    }

    const mergedResults = Array.from(mergedMap.values());

    // =====================================================
    // OUTPUT (UNCHANGED)
    // =====================================================
    const fixBox = document.getElementById('player2fixbox');
    const lines = [];

    for (let i = 0; i < mergedResults.length; i++) {
        const r = mergedResults[i];

        const clickString = r.count === 1 ? "click" : "clicks";
        const betweenString =
            r.start === r.end
                ? `on frame ${r.start}`
                : `between frames ${r.start}-${r.end}`;

        lines.push(`- Remove ${r.count} ${clickString} ${betweenString}`);

        if (i < mergedResults.length - 1) {
            lines.push("\n");
        }
    }

    renderTextChunked(lines, fixBox);
}

// Old again
/*function reportP2FixInfo(){
    violationsP2.sort((a, b) => a.end - b.end);
    // Array to store point fixes: { frame: number, count: number }
    const fixes = [];

    // Process each violation
    for (const v of violationsP2) {
        // How much of this violation is already covered by existing fixes
        let covered = 0;
        for (const f of fixes) {
            if (f.frame >= v.start && f.frame <= v.end) {
            covered += f.count;
            }
        }

        const needed = v.excess - covered;

        // If some clicks are still needed, add a fix at the end of the violation
        if (needed > 0) {
            fixes.push({
            frame: v.end,
            count: needed
            });
        }
    }
    //console.log(fixes);

    const remaining = violationsP2.map(v => ({
        ...v,
        remaining: v.excess
    }));

    const results = [];

    for (const fix of fixes) {
    // Find violations this fix can contribute to
    const candidates = remaining.filter(v =>
        v.remaining > 0 &&
        fix.frame >= v.start &&
        fix.frame <= v.end
    );

    if (candidates.length > 0) {
        // Intersection of all candidates gives start and end of range
        let start = candidates[0].start;
        let end = candidates[0].end;

        for (const v of candidates) {
        start = Math.max(start, v.start);
        end = Math.min(end, v.end);
        }

        results.push({
        start,
        end,
        count: fix.count
        });

        // Reduce remaining coverage for these violations
        let remainingToAssign = fix.count;
        for (const v of candidates) {
        if (remainingToAssign <= 0) break;

        const used = Math.min(v.remaining, remainingToAssign);
        v.remaining -= used;
        remainingToAssign -= used;
        }
    }
    }

    const mergedResults = [];

    for (const r of results) {
    // Try to find an existing entry with same range
    const existing = mergedResults.find(
        m => m.start === r.start && m.end === r.end
    );

    if (existing) {
        // Add counts together
        existing.count += r.count;
    } else {
        // Create new entry
        mergedResults.push({ ...r });
    }
    }

    const fixBox = document.getElementById('player2fixbox');
    const lines = [];
    for (let i = 0; i < mergedResults.length; i++) {
        const r = mergedResults[i];

        const clickString = r.count === 1 ? "click" : "clicks";
        const betweenString =
            r.start === r.end
                ? `on frame ${r.start}`
                : `between frames ${r.start}-${r.end}`;

        lines.push(`- Remove ${r.count} ${clickString} ${betweenString}`);

        if (i < mergedResults.length - 1) {
            lines.push("\n");
        }
    }
    renderTextChunked(lines, fixBox);
}*/

// Old
/*function reportP1SwiftInfo(){
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
} */

function reportP1SwiftInfo() {
    const swiftsBox = document.getElementById('p1swiftsbox');
    const inverseBox = document.getElementById('p1inverseswiftsbox');

    document.getElementById('p1st').textContent =
        'Player 1 swift clicks: ' + p1SwiftClicks.length;

    document.getElementById('p1ist').textContent =
        'Player 1 swift releases: ' + p1InverseSwiftClicks.length;

    // --- Build swift clicks text ---
    const swiftLines = ["["];

    for (let i = 0; i < p1SwiftClicks.length; i++) {
        swiftLines.push(String(p1SwiftClicks[i]));
        if (i < p1SwiftClicks.length - 1) {
            swiftLines.push(", ");
        }
    }

    swiftLines.push("]");

    // --- Build inverse swift clicks text ---
    const inverseLines = ["["];

    for (let i = 0; i < p1InverseSwiftClicks.length; i++) {
        inverseLines.push(String(p1InverseSwiftClicks[i]));
        if (i < p1InverseSwiftClicks.length - 1) {
            inverseLines.push(", ");
        }
    }

    inverseLines.push("]");

    // --- Chunked render ---
    renderTextChunked(swiftLines, swiftsBox);
    renderTextChunked(inverseLines, inverseBox);
}    

function reportP2SwiftInfo() {
    const swiftsBox = document.getElementById('p2swiftsbox');
    const inverseBox = document.getElementById('p2inverseswiftsbox');

    document.getElementById('p2st').textContent =
        'Player 2 swift clicks: ' + p2SwiftClicks.length;

    document.getElementById('p2ist').textContent =
        'Player 2 swift releases: ' + p2InverseSwiftClicks.length;

    // --- Build swift clicks text ---
    const swiftLines = ["["];

    for (let i = 0; i < p2SwiftClicks.length; i++) {
        swiftLines.push(String(p2SwiftClicks[i]));
        if (i < p2SwiftClicks.length - 1) {
            swiftLines.push(", ");
        }
    }

    swiftLines.push("]");

    // --- Build inverse swift clicks text ---
    const inverseLines = ["["];

    for (let i = 0; i < p2InverseSwiftClicks.length; i++) {
        inverseLines.push(String(p2InverseSwiftClicks[i]));
        if (i < p2InverseSwiftClicks.length - 1) {
            inverseLines.push(", ");
        }
    }

    inverseLines.push("]");

    // --- Chunked render ---
    renderTextChunked(swiftLines, swiftsBox);
    renderTextChunked(inverseLines, inverseBox);
}

// Old
/*function reportP2SwiftInfo(){
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
} */

// Old
/*function reportP1Results(){
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
        document.getElementById('checkboxP1').style.visibility = 'visible';
    }
} */

function renderTextChunked(lines, element, chunkSize = 500) {
    let index = 0;
    element.value = "";

    function renderChunk() {
        const chunk = lines.slice(index, index + chunkSize).join("");
        element.value += chunk;

        index += chunkSize;

        if (index < lines.length) {
            requestAnimationFrame(renderChunk);
        }
    }

    renderChunk();
}

function pushAll(target, source) {
    for (let i = 0; i < source.length; i++) {
        target.push(source[i]);
    }
}

function reportP1Results() {
    const outbox = document.getElementById('outbox1');
    outbox.value = '';

    const lines = [];

    const noViolations =
        p1Rule1Breaks.length === 0 &&
        p1Rule2Breaks.length === 0 &&
        p1Rule3Breaks.length === 0;

    if (noViolations) {
        document.getElementById('check1').style.visibility = 'visible';

        lines.push("Rule 1 violations:\n[none]\n\n");
        lines.push("Rule 2 violations:\n[none]\n\n");
        lines.push("Rule 3 violations:\n[none]");
    } else {
        // --- Rule 1 ---
        if (p1Rule1Breaks.length === 0) {
            lines.push("Rule 1 violations:\n[none]\n\n");
        } else {
            lines.push("Rule 1 violations:\n");
            pushAll(lines, p1Rule1Breaks);
            lines.push("\n");
        }

        // --- Rule 2 ---
        if (p1Rule2Breaks.length === 0) {
            lines.push("Rule 2 violations:\n[none]\n\n");
        } else {
            lines.push("Rule 2 violations:\n");
            pushAll(lines, p1Rule2Breaks);
            lines.push("\n");
        }

        // --- Rule 3 ---
        if (p1Rule3Breaks.length === 0) {
            lines.push("Rule 3 violations:\n[none]");
        } else {
            lines.push("Rule 3 violations:\n");
            pushAll(lines, p1Rule3Breaks);
        }

        document.getElementById('cross1').style.visibility = 'visible';
        document.getElementById('checkboxP1').style.visibility = 'visible';
    }

    // 🚀 CHUNKED RENDERING
    renderTextChunked(lines, outbox);
}

function reportP2Results() {
    const outbox = document.getElementById('outbox2');
    outbox.value = '';

    const lines = [];

    const noViolations =
        p2Rule1Breaks.length === 0 &&
        p2Rule2Breaks.length === 0 &&
        p2Rule3Breaks.length === 0;

    if (noViolations) {
        document.getElementById('check2').style.visibility = 'visible';

        lines.push("Rule 1 violations:\n[none]\n\n");
        lines.push("Rule 2 violations:\n[none]\n\n");
        lines.push("Rule 3 violations:\n[none]");
    } else {
        // --- Rule 1 ---
        if (p2Rule1Breaks.length === 0) {
            lines.push("Rule 1 violations:\n[none]\n\n");
        } else {
            lines.push("Rule 1 violations:\n");
            pushAll(lines, p2Rule1Breaks);
            lines.push("\n");
        }

        // --- Rule 2 ---
        if (p2Rule2Breaks.length === 0) {
            lines.push("Rule 2 violations:\n[none]\n\n");
        } else {
            lines.push("Rule 2 violations:\n");
            pushAll(lines, p2Rule2Breaks);
            lines.push("\n");
        }

        // --- Rule 3 ---
        if (p2Rule3Breaks.length === 0) {
            lines.push("Rule 3 violations:\n[none]");
        } else {
            lines.push("Rule 3 violations:\n");
            pushAll(lines, p2Rule3Breaks);
        }

        document.getElementById('cross2').style.visibility = 'visible';
        document.getElementById('checkboxP2').style.visibility = 'visible';
    }

    // 🚀 CHUNKED RENDERING
    renderTextChunked(lines, outbox);
}

// Old
/*
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
        document.getElementById('checkboxP2').style.visibility = 'visible';
    }
} */

function disable(){
   document.getElementById('upload').style.pointerEvents = 'none';
   document.getElementById('checkButton').style.pointerEvents = 'none';
   document.getElementById('textbox').setAttribute('readonly', 'readonly');
}

function checkP1CpsBreaks(){
    derive(p1InputArray, p1Rule1Breaks, violationsP1);
    Derive(p1InputArray, p1Rule2Breaks, p1Rule3Breaks, violationsP1);
}

function checkP2CpsBreaks(){ 
    derive(p2InputArray, p2Rule1Breaks, violationsP2);
    Derive(p2InputArray, p2Rule2Breaks, p2Rule3Breaks, violationsP2);
}

// Old
/*function derive(inputFrames, breakArray, violations) {
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
        if (numClicks > 16) { // Rule 1 break
            breakArray.push("- " + numClicks + " clicks in 1s: [frame " + firstClickFrame + " to " + frameOneSecondLater +
                "]: (" + runningTimeTotal.toFixed(3) + "s between first and last)\n");
            violations.push({
                start: firstClickFrame,
                end: lastClickWithinTime,
                excess: numClicks - 16
            });    
        }
    }
}*/

function derive(inputFrames, breakArray, violations) {
    const hasTimeWarps = timewarpInfo.length > 0;

    let j = 0;

    for (let i = 0; i < inputFrames.length; i++) {

        const firstClickFrame = inputFrames[i];

        if (j < i) j = i;

        // Compute 1-second window end (same as before)
        const frameOneSecondLater = computeEndFrame(firstClickFrame, hasTimeWarps);

        while (j < inputFrames.length && inputFrames[j] <= frameOneSecondLater) {
            j++;
        }

        const numClicks = j - i;

        if (numClicks > 16) {

            const lastClickWithinTime = inputFrames[j - 1];

            // ✅ Accurate time calculation
            const runningTimeTotal = computeTimeBetweenFrames(
                firstClickFrame,
                lastClickWithinTime
            );

            breakArray.push(
                "- " + numClicks + " clicks in 1s: [frame " +
                firstClickFrame + " to " + frameOneSecondLater +
                "]: (" + runningTimeTotal.toFixed(3) +
                "s between first and last)\n"
            );

            violations.push({
                start: firstClickFrame,
                end: lastClickWithinTime,
                excess: numClicks - 16
            });
        }
    }
}

function computeTimeBetweenFrames(startFrame, endFrame) {

    let [timewarpFactor, indexChecked] = getTimewarp(startFrame);
    timewarpFactor = Math.max(timewarpFactor, 1);

    let previousTimewarpFactor = timewarpFactor;
    let runningTimeTotal = 0;
    let bottomThing = startFrame;

    while (
        indexChecked < timewarpInfo.length &&
        timewarpInfo[indexChecked][0] < endFrame
    ) {
        const twFrame = timewarpInfo[indexChecked][0];
        const twFactor = Math.max(timewarpInfo[indexChecked][1], 1);

        runningTimeTotal +=
            (twFrame - bottomThing) / (previousTimewarpFactor * framerate);

        bottomThing = twFrame;
        previousTimewarpFactor = twFactor;

        indexChecked++;
    }

    // Final segment → now ends at lastClickWithinTime ✅
    runningTimeTotal +=
        (endFrame - bottomThing) /
        (previousTimewarpFactor * framerate);

    return runningTimeTotal;
}

function computeEndFrame(firstClickFrame, hasTimeWarps) {

    let timewarpFactor = 1;
    let indexChecked = 0;

    if (hasTimeWarps) {
        const result = getTimewarp(firstClickFrame);
        timewarpFactor = Math.max(result[0], 1);
        indexChecked = result[1];
    }

    let frameOneSecondLater = firstClickFrame + timewarpFactor * framerate;

    let previousTimewarpFactor = timewarpFactor;

    while (
        indexChecked < timewarpInfo.length &&
        timewarpInfo[indexChecked][0] < frameOneSecondLater
    ) {
        const twFrame = timewarpInfo[indexChecked][0];
        const twFactor = Math.max(timewarpInfo[indexChecked][1], 1);

        let framesLeft = frameOneSecondLater - twFrame;
        framesLeft *= twFactor / previousTimewarpFactor;

        frameOneSecondLater = twFrame + framesLeft;

        previousTimewarpFactor = twFactor;

        indexChecked++;
    }

    return Math.floor(frameOneSecondLater);
}

function Derive(inputFrames, breakArrayRule2, breakArrayRule3, violations) {

    const hasTimeWarps = timewarpInfo.length > 0;

    let j = 0;

    // =====================================================
    // 🟣 RULE 3 (Sliding window)
    // =====================================================
    for (let i = 0; i < inputFrames.length; i++) {

        const firstClickFrame = inputFrames[i];

        if (j < i) j = i;

        const frameOneSecondLater = computeEndFrame(firstClickFrame, hasTimeWarps);

        // Expand window
        while (j < inputFrames.length && inputFrames[j] <= frameOneSecondLater) {
            j++;
        }

        const windowSize = j - i;

        // Only consider ≥ 5 clicks
        if (windowSize >= 5) {

            const maxStints = Math.min(windowSize - 4, 12);

            for (let k = 0; k < maxStints; k++) {

                const noClicks = 5 + k;

                const stintStart = inputFrames[i];
                const stintEnd = inputFrames[i + k + 4];

                const runningTimeTotal = computeTimeBetweenFrames(
                    stintStart,
                    stintEnd
                );

                const cps = (noClicks - 1) / runningTimeTotal;

                if (cps > 48) {

                    const res = Number.isFinite(cps)
                        ? cps.toFixed(3)
                        : "\u221E";

                    breakArrayRule3.push(
                        '- ' + res + " cps rate for the " +
                        noClicks + " click stint from frames " +
                        stintStart + " to " + stintEnd +
                        " (" + runningTimeTotal.toFixed(3) + "s)\n"
                    );

                    let s;
                    if (runningTimeTotal === 0) {
                        s = noClicks - 3;
                    } else {
                        s = Math.min(
                            noClicks - Math.floor(48 * runningTimeTotal + 1),
                            noClicks - 4
                        );
                    }

                    violations.push({
                        start: stintStart,
                        end: stintEnd,
                        excess: s
                    });
                }
            }
        }
    }

    // =====================================================
    // 🔵 RULE 2 (Single pass)
    // =====================================================
    let i = 0;

    while (i < inputFrames.length) {

        const frame = inputFrames[i];
        let count = 1;
        let j = i + 1;

        while (j < inputFrames.length && inputFrames[j] === frame) {
            count++;
            j++;
        }

        if (count > 3) {
            breakArrayRule2.push(
                '- ' + count + " clicks detected on frame " + frame + "\n"
            );

            violations.push({
                start: frame,
                end: frame,
                excess: count - 3
            });
        }

        i = j; // skip entire block
    }
}

 /*function Derive(inputFrames, breakArrayRule2, breakArrayRule3, violations) {
    var framesThatBreakRule2 = [];
    var hasTimeWarps = timewarpInfo.length > 0;
    for (var i = 0; i < inputFrames.length; i++) {
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
        var possibleNumberOfStints = Math.min(inputFramesWithinASecond.length - 4, 12); // Number of stints to check per set of clicks within a second.
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

            var cps = (noClicks-1) / runningTimeTotal;
            if (cps > 48) {
                var res = Number.isFinite(cps) ? cps.toFixed(3) : "\u221E";
                breakArrayRule3.push('- ' + res + " cps rate for the " + noClicks + " click stint from frames " + stintStart + " to " + stintEnd + " (" + runningTimeTotal.toFixed(3) + "s)\n");
                var s;
                if(runningTimeTotal == 0){
                    s = noClicks - 3;
                }
                else{
                    s = Math.min(noClicks - Math.floor(48 * runningTimeTotal + 1), noClicks - 4);
                }
                violations.push({
                    start: stintStart,
                    end: stintEnd,
                    excess: s
                });   
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
            violations.push({
                start: inputFrames[i],
                end: inputFrames[i],
                excess: numberOfClicksOnSameFrame - 3
            });   
        }
    }
}*/

// New
function getTimewarp(frame) {
    let left = 0;
    let right = timewarpInfo.length - 1;
    let resultIndex = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (timewarpInfo[mid][0] <= frame) {
            resultIndex = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (resultIndex === -1) return [1, 0];

    return [timewarpInfo[resultIndex][1], resultIndex + 1];
}

// Old
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

/*document.getElementById('showP1FixBox').addEventListener('change', async () =>{
    if(document.getElementById('showP1FixBox').checked == true){
        if(!p1FixesComputed){
            reportP1FixInfo();
        }
        document.getElementById('player1fixbox').style.display='block';
    }   
    else{
        document.getElementById('player1fixbox').style.display='none';
    }
}); */

document.getElementById('showP1FixBox').addEventListener('change', async () =>{
    if(document.getElementById('showP1FixBox').checked == false){
        document.getElementById('player1fixbox').style.display='none';
        return;
    }   
    document.getElementById('player1fixbox').style.display='block';

    if(p1FixesComputed){
        return;
    }

    document.getElementById('player1fixbox').value = "Computing...";

    setTimeout(() => {
        reportP1FixInfo();
        p1FixesComputed = true;
    }, 0);
});

document.getElementById('showP2FixBox').addEventListener('change', async () =>{
    if(document.getElementById('showP2FixBox').checked == false){
        document.getElementById('player2fixbox').style.display='none';
        return;
    }   
    document.getElementById('player2fixbox').style.display='block';

    if(p2FixesComputed){
        return;
    }

    document.getElementById('player2fixbox').value = "Computing...";

    setTimeout(() => {
        reportP2FixInfo();
        p2FixesComputed = true;
    }, 0);
});

/*document.getElementById('showP2FixBox').addEventListener('change', async () =>{
    if(document.getElementById('showP2FixBox').checked == true){
        if(!p2FixesComputed){
            reportP2FixInfo();
        }
        document.getElementById('player2fixbox').style.display='block';
    }   
    else{
        document.getElementById('player2fixbox').style.display='none';
    }
}); */

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
