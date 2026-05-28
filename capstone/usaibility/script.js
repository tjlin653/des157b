let activeMetricsDataset = null;
let currentVisualizationState = "macro";

let userCalculatedShares = {
    macro: [],
    micro: []
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("data.json");
        activeMetricsDataset = await response.json();
        initializeEventListeners();
    } catch (err) {
        console.error("Critical dataset loading error:", err);
    }
});

function initializeEventListeners() {
    document.getElementById("btnDismissOverlay").addEventListener("click", () => {
        document.getElementById("testingOverlay").classList.remove("active");
    });

    document.getElementById("btnGenerate").addEventListener("click", () => {
        processUserInputs();
        transitionScreen("setupScreen", "matrixScreen");
    });

    document.getElementById("btnBackToInputs").addEventListener("click", () => {
        transitionScreen("matrixScreen", "setupScreen");
    });

    document.getElementById("btnStateMacro").addEventListener("click", () => {
        switchState("macro");
    });

    document.getElementById("btnStateMicro").addEventListener("click", () => {
        switchState("micro");
    });
}

function transitionScreen(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    setTimeout(() => {
        document.getElementById(showId).classList.add("active");
    }, 200);
}

function processUserInputs() {
    const screenHours = parseFloat(document.getElementById("inputScreenTime").value) || 0;
    const socialHours = parseFloat(document.getElementById("inputSocialTime").value) || 0;
    const sleepHours = parseFloat(document.getElementById("inputSleepTime").value) || 0;

    const totalDayHours = 24;
    const horizonYears = activeMetricsDataset.constants.lifespan_horizon_years;

    const calculatedNotificationsCount = screenHours * activeMetricsDataset.constants.notifications_per_screen_hour;
    
    const handlingSecondsPerCheck = activeMetricsDataset.constants.seconds_per_notification_check;
    const dailyNotificationOverheadHours = (calculatedNotificationsCount * handlingSecondsPerCheck) / 3600;

    const dailyAdHours = socialHours * activeMetricsDataset.constants.social_media_ad_ratio;
    const pureSocialHours = Math.max(0, socialHours - dailyAdHours);
    const otherDigitalHours = Math.max(0, screenHours - socialHours - dailyNotificationOverheadHours);
    const everythingElseHours = Math.max(0, totalDayHours - screenHours - sleepHours);

    const totalWeeksCount = 52 * horizonYears;

    userCalculatedShares.macro = [
        { type: "online", count: Math.round((screenHours / totalDayHours) * totalWeeksCount), color: "var(--color-online)", label: "Online Screen Time" },
        { type: "sleep", count: Math.round((sleepHours / totalDayHours) * totalWeeksCount), color: "var(--color-sleep)", label: "Average Sleep" },
        { type: "everything-else", count: 0, color: "var(--color-everything-else)", label: "Everything Else" }
    ];

    let currentSum = userCalculatedShares.macro[0].count + userCalculatedShares.macro[1].count;
    userCalculatedShares.macro[2].count = Math.max(0, totalWeeksCount - currentSum);

    userCalculatedShares.micro = [
        { type: "social", count: Math.round((pureSocialHours / totalDayHours) * totalWeeksCount), color: "var(--color-social)", label: "Social Media Channels" },
        { type: "ads", count: Math.round((dailyAdHours / totalDayHours) * totalWeeksCount), color: "var(--color-ads)", label: "Ad Content Consumption" },
        { type: "notifications", count: Math.round((dailyNotificationOverheadHours / totalDayHours) * totalWeeksCount), color: "var(--color-notifications)", label: "Notification Overhead" },
        { type: "other-digital", count: Math.round((otherDigitalHours / totalDayHours) * totalWeeksCount), color: "var(--color-other-digital)", label: "Other Digital Activity" },
        { type: "grayed-out", count: totalWeeksCount - (userCalculatedShares.macro[1].count + userCalculatedShares.macro[2].count), color: "var(--color-grayed-out)", label: "Reclaimed Lifespan (Sleep / Physical Worlds)" }
    ];
    
    let microSum = userCalculatedShares.micro[0].count + userCalculatedShares.micro[1].count + userCalculatedShares.micro[2].count + userCalculatedShares.micro[3].count;
    userCalculatedShares.micro[4].count = totalWeeksCount - microSum;

    window.summaryData = {
        notifications: calculatedNotificationsCount,
        socialYears: (pureSocialHours * 365.25 * horizonYears / 24) / 365.25,
        adYears: (dailyAdHours * 365.25 * horizonYears / 24) / 365.25,
        notifDays: (dailyNotificationOverheadHours * 365.25 * horizonYears) / 24,
        screenYears: (screenHours * 365.25 * horizonYears / 24) / 365.25,
        sleepYears: (sleepHours * 365.25 * horizonYears / 24) / 365.25
    };

    generateGridShell(totalWeeksCount);
    generateAxisLabels(horizonYears);
    switchState("macro");
}

function generateGridShell(totalCount) {
    const container = document.getElementById("weeksGrid");
    container.innerHTML = "";
    
    for (let i = 0; i < totalCount; i++) {
        const block = document.createElement("div");
        block.className = "week-node";
        block.id = `wk-${i}`;
        container.appendChild(block);
    }
}

function generateAxisLabels(totalYears) {
    const xAxisContainer = document.getElementById("xAxisLabels");
    const yAxisContainer = document.getElementById("yAxisLabels");
    
    xAxisContainer.innerHTML = "";
    yAxisContainer.innerHTML = "";

    for (let wk = 1; wk <= 52; wk++) {
        const label = document.createElement("div");
        label.innerText = (wk === 1 || wk % 5 === 0) ? wk : "";
        xAxisContainer.appendChild(label);
    }

    const baseAgeStart = 20;
    for (let yr = 0; yr < totalYears; yr++) {
        const currentAge = baseAgeStart + yr;
        const label = document.createElement("div");
        label.innerText = (currentAge === baseAgeStart || currentAge % 5 === 0) ? `${currentAge}` : "";
        yAxisContainer.appendChild(label);
    }
}

function switchState(targetState) {
    currentVisualizationState = targetState;
    
    document.getElementById("btnStateMacro").classList.toggle("active", targetState === "macro");
    document.getElementById("btnStateMicro").classList.toggle("active", targetState === "micro");

    renderLegendAndHeadline();
    paintGridNodes();
}

function renderLegendAndHeadline() {
    const legend = document.getElementById("legendContainer");
    const headline = document.getElementById("narrativeHeadline");
    legend.innerHTML = "";

    const activeList = userCalculatedShares[currentVisualizationState];
    
    activeList.forEach(item => {
        const row = document.createElement("div");
        row.className = "legend-item";
        row.innerHTML = `<span class="legend-color" style="background-color: ${item.color}"></span><span>${item.label} (${item.count} Weeks)</span>`;
        legend.appendChild(row);
    });

    const data = window.summaryData;
    if (currentVisualizationState === "macro") {
        headline.innerHTML = `Over your next <strong>50 year horizon</strong>, your current day-to-day rhythm commands a massive footprint: You will spend <strong>${data.screenYears.toFixed(1)} years</strong> tethered to an online display, balanced alongside <strong>${data.sleepYears.toFixed(1)} years</strong> of sleep recovery.`;
    } else {
        headline.innerHTML = `Based on Pew Research and DataReportal user behavior models, your device handles roughly <strong>${Math.round(data.notifications)} background notifications daily</strong>. Your online footprint translates to: <strong>${data.socialYears.toFixed(1)} years</strong> scrolling platforms, <strong>${data.adYears.toFixed(1)} years</strong> looking at targeted advertisements, and <strong>${data.notifDays.toFixed(0)} full days</strong> just interacting with alert popups.`;
    }
}

function paintGridNodes() {
    const targetArr = userCalculatedShares[currentVisualizationState];
    let absoluteIndex = 0;

    targetArr.forEach(bucket => {
        for (let c = 0; c < bucket.count; c++) {
            const blockElement = document.getElementById(`wk-${absoluteIndex}`);
            if (blockElement) {
                blockElement.style.backgroundColor = bucket.color;
            }
            absoluteIndex++;
        }
    });
}