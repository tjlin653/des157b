// Application Central State Management Tracking Arrays
let activeMetricsDataset = null;
let currentScreenIndex = 1;
let currentVisualizationState = "macro";
let globalCalculatedShares = { macro: [], micro: [] };
let activeTippyInstances = [];

// DOM Initialization Event Binding Hooks
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCognitiveDataset();
    initializeStatDisplays();
});

// Asynchronous File Loader Fetching for project Dataset Requirements
async function fetchCognitiveDataset() {
    try {
        const response = await fetch("data.json");
        activeMetricsDataset = await response.json();
    } catch (err) {
        console.error("Critical Dataset initialization failure:", err);
        activeMetricsDataset = {
            constants: { lifespan_horizon_years: 50, notifications_per_screen_hour: 11.5, seconds_per_notification_check: 22, social_media_ad_ratio: 0.25 },
            benchmarks: { global_social_daily_minutes: 143, refocus_delay_seconds: 1395, scroll_distance_feet: 300 }
        };
    }
}

function initializeStatDisplays() {
    const b = activeMetricsDataset.benchmarks;
    document.getElementById("stat-social-hours").innerText = `${Math.floor(b.global_social_daily_minutes / 60)}h ${b.global_social_daily_minutes % 60}m`;
    document.getElementById("stat-focus-tax").innerText = `${Math.floor(b.refocus_delay_seconds / 60)}m ${b.refocus_delay_seconds % 60}s`;
    document.getElementById("stat-scroll-depth").innerText = `${b.scroll_distance_feet}ft`;
}

// Seamless Unified Scroll Interface Hook Controller
function scrollToNextScreen(targetIndex) {
    currentScreenIndex = targetIndex;
    const targetSection = document.getElementById(`screen-${targetIndex}`);
    if (!targetSection) return;

    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Main Calculation System Logic Engine Block
function generateMatrixTrajectory() {
    const screenHours = parseFloat(document.getElementById("inputScreenTime").value) || 0;
    const socialHours = parseFloat(document.getElementById("inputSocialTime").value) || 0;
    const sleepHours = parseFloat(document.getElementById("inputSleepTime").value) || 0;

    const totalDayHours = 24;
    const c = activeMetricsDataset.constants;
    const horizonYears = c.lifespan_horizon_years;
    const totalWeeksCount = 52 * horizonYears;

    const dailyNotifications = screenHours * c.notifications_per_screen_hour;
    const notificationOverheadHours = (dailyNotifications * c.seconds_per_notification_check) / 3600;
    
    const dailyAdHours = socialHours * c.social_media_ad_ratio;
    const pureSocialHours = Math.max(0, socialHours - dailyAdHours);
    const otherDigitalHours = Math.max(0, screenHours - socialHours - notificationOverheadHours);

    globalCalculatedShares.macro = [
        { type: "online", count: Math.round((screenHours / totalDayHours) * totalWeeksCount), color: "var(--color-online)", label: "Online Screen Presence", desc: "spent tied to digital interfaces" },
        { type: "sleep", count: Math.round((sleepHours / totalDayHours) * totalWeeksCount), color: "var(--color-sleep)", label: "Physical Sleep Recovery", desc: "spent in physical sleep cycles" },
        { type: "everything-else", count: 0, color: "var(--color-everything-else)", label: "Everything Else", desc: "remaining for intentional real-world agency" }
    ];
    let macroSum = globalCalculatedShares.macro[0].count + globalCalculatedShares.macro[1].count;
    globalCalculatedShares.macro[2].count = Math.max(0, totalWeeksCount - macroSum);

    globalCalculatedShares.micro = [
        { type: "social", count: Math.round((pureSocialHours / totalDayHours) * totalWeeksCount), color: "var(--color-social)", label: "Organic Social Interaction", desc: "scrolling interpersonal timelines" },
        { type: "ads", count: Math.round((dailyAdHours / totalDayHours) * totalWeeksCount), color: "var(--color-ads)", label: "Targeted Advertisement Feeds", desc: "swallowed by corporate marketing feeds" },
        { type: "notifications", count: Math.round((notificationOverheadHours / totalDayHours) * totalWeeksCount), color: "var(--color-notifications)", label: "Notification Micro-Tax", desc: "lost strictly to clearing alert popups" },
        { type: "other-digital", count: Math.round((otherDigitalHours / totalDayHours) * totalWeeksCount), color: "var(--color-other-digital)", label: "General Screen Activity", desc: "consumed by searches, apps, and workflows" },
        { type: "grayed-out", count: totalWeeksCount - (globalCalculatedShares.macro[0].count), color: "var(--color-grayed-out)", label: "Reclaimed Real-World Horizon", desc: "untouched by digital ecosystem tracks" }
    ];

    window.calculationMetrics = { dailyNotifications, totalWeeksCount, horizonYears, screenHours, socialHours, sleepHours };

    buildGridShellStructure();
    buildLabeledAxesFramework();
    
    // Distribute data details smoothly before layout page visual execution
    switchState("macro", false); 

    // Advance viewport layout view seamlessly
    scrollToNextScreen(6);
    
    // Fire unified block fade category waterfall action sequences
    triggerCategoryWaterfallCascade();
    
    // Dynamic Slider configuration
    configureDynamicSliderBounds(screenHours);
}

function buildGridShellStructure() {
    const grid = document.getElementById("weeksGrid");
    grid.innerHTML = "";
    for (let i = 0; i < window.calculationMetrics.totalWeeksCount; i++) {
        const cell = document.createElement("div");
        cell.className = "week-node";
        cell.id = `node-${i}`;
        grid.appendChild(cell);
    }
}

function buildLabeledAxesFramework() {
    const xAxis = document.getElementById("xAxisLabels");
    const yAxis = document.getElementById("yAxisLabels");
    const miniYAxis = document.getElementById("miniYAxisLabels");
    
    xAxis.innerHTML = "";
    yAxis.innerHTML = "";
    if (miniYAxis) miniYAxis.innerHTML = "";

    for (let w = 1; w <= 52; w++) {
        const tick = document.createElement("div");
        tick.innerText = (w === 1 || w % 5 === 0) && w !== 50 ? w : (w === 52 ? w : "");
        xAxis.appendChild(tick);
    }

    const baseStartingAge = 20;
    for (let y = 0; y < window.calculationMetrics.horizonYears; y++) {
        const trackingAge = baseStartingAge + y;
        const displayLabelText = (trackingAge === baseStartingAge || trackingAge % 5 === 0 || trackingAge === 70) ? trackingAge : "";
        
        const mainTick = document.createElement("div");
        mainTick.innerText = displayLabelText;
        yAxis.appendChild(mainTick);

        if (miniYAxis) {
            const miniTick = document.createElement("div");
            miniTick.innerText = displayLabelText;
            miniYAxis.appendChild(miniTick);
        }
    }
}

// CLEAN PURE COLOR CATEGORY SEQUENTIAL POP ENGINE
function triggerCategoryWaterfallCascade() {
    const activeTrack = globalCalculatedShares[currentVisualizationState];
    let rollingIndexOffset = 0;
    let sequenceDelayAccumulator = 0;

    activeTrack.forEach((bucket) => {
        if (bucket.count <= 0) return;

        // Collect all DOM elements corresponding to this specific color block
        const categoryNodes = [];
        for (let c = 0; c < bucket.count; c++) {
            const el = document.getElementById(`node-${rollingIndexOffset + c}`);
            if (el) categoryNodes.push(el);
        }

        // Entire color block fires all at once to match your color-at-a-time specification
        setTimeout(() => {
            categoryNodes.forEach(node => {
                node.classList.add("reveal-active");
            });
        }, sequenceDelayAccumulator);

        rollingIndexOffset += bucket.count;
        sequenceDelayAccumulator += 350; // Stagger separation pause metric between full color layers
    });
}

function switchState(targetState, autoReveal = true) {
    currentVisualizationState = targetState;
    document.getElementById("btnStateMacro").classList.toggle("active", targetState === "macro");
    document.getElementById("btnStateMicro").classList.toggle("active", targetState === "micro");
    
    renderLegendDisplay();
    repaintGridCanvasNodes();

    if (autoReveal) {
        document.querySelectorAll('.week-node').forEach(node => node.classList.add("reveal-active"));
    }
}

function renderLegendDisplay() {
    const legend = document.getElementById("legendContainer");
    const headline = document.getElementById("narrativeHeadline");
    legend.innerHTML = "";

    const activeTrack = globalCalculatedShares[currentVisualizationState];
    activeTrack.forEach(item => {
        const itemRow = document.createElement("div");
        itemRow.className = "legend-row-item";
        itemRow.innerHTML = `<span class="color-swatch-box" style="background-color: ${item.color}"></span><span>${item.label} (${item.count} Weeks)</span>`;
        legend.appendChild(itemRow);
    });

    const m = window.calculationMetrics;
    if (currentVisualizationState === "macro") {
        headline.innerHTML = `Your data trajectory maps out a stark ecosystem partition. Over your next 50 years, you will spend <strong>${((globalCalculatedShares.macro[0].count / m.totalWeeksCount) * m.horizonYears).toFixed(1)} years</strong> facing digital tracking interfaces directly.`;
    } else {
        headline.innerHTML = `Our engine extracts a hidden toll: based on screen presence behaviors, you handle an estimated <strong>${Math.round(m.dailyNotifications)} notifications daily</strong>. This overhead creates <strong>${globalCalculatedShares.micro[2].count} weeks</strong> of mental context-switching drag, alongside <strong>${globalCalculatedShares.micro[1].count} weeks</strong> reading targeted corporate advertisements.`;
    }
}

function repaintGridCanvasNodes() {
    activeTippyInstances.forEach(instance => instance.destroy());
    activeTippyInstances = [];

    const nodes = Array.from(document.querySelectorAll('.week-node'));
    const activeTrack = globalCalculatedShares[currentVisualizationState];
    let processingAbsoluteIndex = 0;

    activeTrack.forEach(bucket => {
        for (let c = 0; c < bucket.count && processingAbsoluteIndex < nodes.length; c++) {
            const el = nodes[processingAbsoluteIndex];
            el.style.backgroundColor = bucket.color;
            const computedAgeOffset = 20 + Math.floor(processingAbsoluteIndex / 52);

            const instance = tippy(el, {
                content: `<span style="font-family: monospace;"><strong>Age ${computedAgeOffset}</strong> — This week is ${bucket.desc} (${bucket.count} weeks total volume).</span>`,
                allowHTML: true,
                placement: 'top',
                arrow: true,
                theme: 'dark'
            });
            activeTippyInstances.push(instance);
            processingAbsoluteIndex++;
        }
    });
}

// SYSTEM SIMULATION CALCULATOR PATHWAY (SLIDE 7 ALIGNMENTS)
function configureDynamicSliderBounds(userTotalScreenHours) {
    const slider = document.getElementById("reclamationSlider");
    const totalMinutesInput = Math.round(userTotalScreenHours * 60);

    slider.min = 0;
    slider.max = totalMinutesInput; 
    slider.value = 0;
    slider.step = totalMinutesInput > 60 ? 15 : 5;

    initializeReclamationCanvas();
}

function initializeReclamationCanvas() {
    const container = document.getElementById("miniWeeksGrid");
    container.innerHTML = "";
    for (let i = 0; i < window.calculationMetrics.totalWeeksCount; i++) {
        const minNode = document.createElement("div");
        minNode.className = "mini-node";
        minNode.id = `mini-${i}`;
        container.appendChild(minNode);
    }
    updateReclamationSimulation(0);
}

function updateReclamationSimulation(minutesToRescueDaily) {
    const hours = Math.floor(minutesToRescueDaily / 60);
    const mins = minutesToRescueDaily % 60;
    document.getElementById("sliderValueText").innerText = `${hours}h ${mins}m / Day`;

    const m = window.calculationMetrics;
    const hoursRescuedDaily = minutesToRescueDaily / 60;
    const totalDayHours = 24;
    
    const totalHorizonWeeks = m.totalWeeksCount;
    const totalRescuedWeeksCalculated = Math.round((hoursRescuedDaily / totalDayHours) * totalHorizonWeeks);
    const equivalentYearsRescued = (totalRescuedWeeksCalculated / 52);

    document.getElementById("txtRescuedWeeks").innerText = totalRescuedWeeksCalculated;
    document.getElementById("txtRescuedYears").innerText = equivalentYearsRescued.toFixed(1);

    const baselineUnreclaimedScreenTimeCount = globalCalculatedShares.macro[0].count;
    const newlyRescuedPivotBoundaryIndex = Math.max(0, baselineUnreclaimedScreenTimeCount - totalRescuedWeeksCalculated);

    for (let i = 0; i < totalHorizonWeeks; i++) {
        const cell = document.getElementById(`mini-${i}`);
        if (!cell) continue;

        if (i < newlyRescuedPivotBoundaryIndex) {
            cell.style.backgroundColor = "var(--color-online)";
        } else if (i < baselineUnreclaimedScreenTimeCount) {
            cell.style.backgroundColor = "var(--neon-green)";
        } else {
            cell.style.backgroundColor = "var(--border-subtle)";
        }
    }
}