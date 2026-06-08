(function(){
    'use strict';
    
    /* ==========================================
       GLOBAL
       ========================================== */
    let activeMetricsDataset = null;
    let currentScreenIndex = 1;
    let currentVisualizationState = "macro";
    let globalCalculatedShares = { macro: [], micro: [] };
    let activeTippyInstances = [];
    let replacementActivities = [];
    const replacementPalette = ["#39ff14", "#00f0ff", "#ccff00", "#ff9500", "#af52de", "#e5e5ea"];

    /* ==========================================
       INITIALIZATION & DATA (slides 2-4)
       ========================================== */
    document.addEventListener("DOMContentLoaded", async () => {
        await fetchCognitiveDataset();
        initializeStatDisplays();
    });

    async function fetchCognitiveDataset() {
        try {
            const response = await fetch("data.json");
            activeMetricsDataset = await response.json();
        } catch (err) {
            // hardcoded defaults if data.json is missing
            activeMetricsDataset = {
                constants: { lifespan_horizon_years: 50, notifications_per_screen_hour: 11.5, seconds_per_notification_check: 22, social_media_ad_ratio: 0.25 },
                benchmarks: { global_social_daily_minutes: 143, refocus_delay_seconds: 1395, scroll_distance_feet: 300 }
            };
        }
    }

    // connects benchmarks to the <span> IDs in slides 2-4
    function initializeStatDisplays() {
        const b = activeMetricsDataset.benchmarks;
        document.getElementById("stat-social-hours").innerText = `${Math.floor(b.global_social_daily_minutes / 60)}h ${b.global_social_daily_minutes % 60}m`;
        document.getElementById("stat-focus-tax").innerText = `${Math.floor(b.refocus_delay_seconds / 60)}m ${b.refocus_delay_seconds % 60}s`;
        document.getElementById("stat-scroll-depth").innerText = `${b.scroll_distance_feet}ft`;
    }

    /* ==========================================
       NAVIGATION & QUESTIONS (all slides + slides 2-4)
       ========================================== */
    window.scrollToNextScreen = function(targetIndex) {
        currentScreenIndex = targetIndex;
        const targetSection = document.getElementById(`screen-${targetIndex}`);
        if (!targetSection) return;
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // slides 2-4 transitions after a Yes/No click
    window.unlockNext = function(slideNum, answer) {
        console.log(`Slide ${slideNum} response: ${answer}`);
        scrollToNextScreen(slideNum + 1);
    };

    /* ==========================================
       PREDICTION & ACTUAL INPUTS (slide 5)
       ========================================== */
    window.showActualInputs = function() {
        const guess = document.getElementById('guessHours').value;
        if (!guess) { alert("Please enter a guess first!"); return; }
        
        // Hide prediction div, show actual div
        document.getElementById('intake-step-guess').classList.add('hidden');
        document.getElementById('intake-step-actual').classList.remove('hidden');
    };

    /* ==========================================
       LIFESPAN MATRIX/CALENDAR (slide 6)
       ========================================== */
    window.generateMatrixTrajectory = function() {
        const screenHours = parseFloat(document.getElementById("inputScreenTime").value) || 0;
        const socialHours = parseFloat(document.getElementById("inputSocialTime").value) || 0;
        const sleepHours = parseFloat(document.getElementById("inputSleepTime").value) || 0;

        const totalDayHours = 24;
        const c = activeMetricsDataset.constants;
        const totalWeeksCount = 52 * c.lifespan_horizon_years;

        // Hidden screen-time mechanics calculated from slide 5 inputs + data.json constants
        const dailyNotifications = screenHours * c.notifications_per_screen_hour;
        const notificationOverheadHours = (dailyNotifications * c.seconds_per_notification_check) / 3600;
        const cappedSocialHours = Math.min(socialHours, screenHours);

        // splits the full matrix/calendar into 3 main sections
        globalCalculatedShares.macro = [
            { type: "online", count: Math.round((screenHours / totalDayHours) * totalWeeksCount), color: "var(--color-online)", label: "Online Activity", desc: "tied to digital screens" },
            { type: "sleep", count: Math.round((sleepHours / totalDayHours) * totalWeeksCount), color: "var(--color-sleep)", label: "Sleep", desc: "spent in physical sleep" },
            { type: "everything-else", count: 0, color: "var(--color-everything-else)", label: "All Else", desc: "remaining for intentional living" }
        ];
        let macroSum = globalCalculatedShares.macro[0].count + globalCalculatedShares.macro[1].count;
        globalCalculatedShares.macro[2].count = Math.max(0, totalWeeksCount - macroSum);

        // splits only the online activities section into 4 main sections
        const onlineCount = globalCalculatedShares.macro[0].count;
        const socialMediaCount = Math.min(onlineCount, Math.round((cappedSocialHours / totalDayHours) * totalWeeksCount));
        const adCount = Math.round(socialMediaCount * c.social_media_ad_ratio);
        const coreSocialCount = Math.max(0, socialMediaCount - adCount);
        const notificationCount = Math.min(
            Math.max(0, onlineCount - socialMediaCount),
            Math.round((notificationOverheadHours / totalDayHours) * totalWeeksCount)
        );
        const otherDigitalCount = Math.max(0, onlineCount - coreSocialCount - adCount - notificationCount);

        globalCalculatedShares.micro = [
            { type: "social-core", count: coreSocialCount, color: "var(--color-social)", label: "Social Media", desc: "active social platform consumption after sponsored ad space is separated" },
            { type: "ads", count: adCount, color: "var(--color-ads)", label: "Ad Exposure", desc: "the attention tax isolated by the social media ad ratio" },
            { type: "notifications", count: notificationCount, color: "var(--color-notifications)", label: "Notification Checking", desc: "glancing, clearing, and context switching from device interruptions" },
            { type: "other-digital", count: otherDigitalCount, color: "var(--color-other-digital)", label: "Other Digital Activities", desc: "maps, email, browsing, streaming, and unclassified screen time" },
            { type: "grayed-out", count: totalWeeksCount - onlineCount, color: "var(--color-grayed-out)", label: "Non-Online Time", desc: "time outside the personalized screen-time total" }
        ];

        window.calculationMetrics = {
            dailyNotifications,
            notificationOverheadHours,
            socialMediaAdRatio: c.social_media_ad_ratio,
            totalWeeksCount,
            horizonYears: c.lifespan_horizon_years,
            screenHours,
            socialHours: cappedSocialHours,
            sleepHours
        };

        buildGridShellStructure();
        buildLabeledAxesFramework();
        switchState("macro", false);
        scrollToNextScreen(6);
        triggerCategoryWaterfallCascade();
        initializeReclamationCanvas();
    };

    /* ==========================================
       MATRIX/CALENDAR CONSTRUCTION (slide 6)
       ========================================== */
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
        xAxis.innerHTML = ""; yAxis.innerHTML = "";

        for (let w = 1; w <= 52; w++) {
            const tick = document.createElement("div");
            tick.innerText = (w === 1 || w % 5 === 0) && w !== 50 ? w : (w === 52 ? w : "");
            xAxis.appendChild(tick);
        }

        for (let y = 0; y < window.calculationMetrics.horizonYears; y++) {
            const trackingAge = 20 + y;
            const displayLabelText = (trackingAge === 20 || trackingAge % 5 === 0 || trackingAge === 70) ? trackingAge : "";
            const mainTick = document.createElement("div");
            mainTick.innerText = displayLabelText;
            yAxis.appendChild(mainTick);
        }
    }

    /* ==========================================
       MATRIX ANIMATION & VIEW SWITCHING (slide 6)
       ========================================== */
    function triggerCategoryWaterfallCascade() {
        const activeTrack = globalCalculatedShares[currentVisualizationState];
        let rollingIndexOffset = 0;
        let sequenceDelay = 0;

        activeTrack.forEach((bucket) => {
            if (bucket.count <= 0) return;
            const nodes = [];
            for (let c = 0; c < bucket.count; c++) {
                const el = document.getElementById(`node-${rollingIndexOffset + c}`);
                if (el) nodes.push(el);
            }

            setTimeout(() => {
                nodes.forEach(n => n.classList.add("reveal-active"));
            }, sequenceDelay);

            rollingIndexOffset += bucket.count;
            sequenceDelay += 400; // time between colors
        });
    }

    window.switchState = function(targetState, autoReveal = true) {
        currentVisualizationState = targetState;
        document.getElementById("btnStateMacro").classList.toggle("active", targetState === "macro");
        document.getElementById("btnStateMicro").classList.toggle("active", targetState === "micro");
        renderLegendDisplay();
        repaintGridCanvasNodes();
        if (autoReveal) {
            document.querySelectorAll('.week-node').forEach(node => node.classList.add("reveal-active"));
        }
    };

    /* ==========================================
       MATRIX LEGEND, HEADLINE & TOOLTIPS (slide 6)
       ========================================== */
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
            headline.innerHTML = `You will spend <strong>${((globalCalculatedShares.macro[0].count / m.totalWeeksCount) * m.horizonYears).toFixed(1)} years</strong> on digital interfaces.`;
        } else {
            const onlineYears = ((globalCalculatedShares.macro[0].count / m.totalWeeksCount) * m.horizonYears).toFixed(1);
            const adWeeks = globalCalculatedShares.micro[1].count;
            const notificationWeeks = globalCalculatedShares.micro[2].count;
            headline.innerHTML = `Ad exposure is split from social media by <strong>${Math.round(m.socialMediaAdRatio * 100)}%</strong>, creating <strong>${adWeeks} weeks</strong> of ads. <br>Notification checking uses <strong>${m.screenHours.toFixed(1)} screen hrs x ${activeMetricsDataset.constants.notifications_per_screen_hour} alerts/hr x ${activeMetricsDataset.constants.seconds_per_notification_check}s</strong>, creating <strong>${notificationWeeks} weeks</strong> of checking and context switching.`;
        }
    }

    function repaintGridCanvasNodes() {
        activeTippyInstances.forEach(instance => instance.destroy());
        activeTippyInstances = [];
        const nodes = Array.from(document.querySelectorAll('.week-node'));
        const activeTrack = globalCalculatedShares[currentVisualizationState];
        let processingIndex = 0;

        activeTrack.forEach(bucket => {
            for (let c = 0; c < bucket.count && processingIndex < nodes.length; c++) {
                const el = nodes[processingIndex];
                el.style.backgroundColor = bucket.color;
                const age = 20 + Math.floor(processingIndex / 52);
                activeTippyInstances.push(tippy(el, {
                    content: `<span style="font-family: monospace;">Age ${age}: ${bucket.desc}</span>`,
                    allowHTML: true, theme: 'dark'
                }));
                processingIndex++;
            }
        });
    }

    /* ==========================================
       RECLAMATION MATRIX/CALENDAR (slide 7)
       ========================================== */
    function initializeReclamationCanvas() {
        replacementActivities = [];
        const container = document.getElementById("dayMatrixGrid");
        if (!container) return;
        container.innerHTML = "";
        for (let i = 0; i < 96; i++) {
            const dayNode = document.createElement("div");
            dayNode.className = "day-node";
            dayNode.id = `day-node-${i}`;
            container.appendChild(dayNode);
        }
        document.getElementById("replacementForm").classList.add("hidden");
        document.getElementById("rescueMetricsPanel").classList.add("hidden");
        document.getElementById("replacementList").innerHTML = "";
        renderDayReclamationMatrix();
        configureReplacementSlider();
    }

    function getOnlineBlockCount() {
        return Math.min(96, Math.max(0, Math.round(window.calculationMetrics.screenHours * 4)));
    }

    /* ==========================================
       REPLACEMENT ACTIVITY (slide 7)
       ========================================== */
    function getReplacedMinutes() {
        return replacementActivities.reduce((sum, activity) => sum + activity.minutes, 0);
    }

    function getRemainingOnlineMinutes() {
        return Math.max(0, (getOnlineBlockCount() * 15) - getReplacedMinutes());
    }

    function formatDayMinutes(minutes) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs && mins) return `${hrs}h ${mins}m`;
        if (hrs) return `${hrs}h`;
        return `${mins}m`;
    }

    /* ==========================================
       DAY MATRIX/CALENDAR RENDERING (slide 7)
       ========================================== */
    function renderDayReclamationMatrix(previewMinutes = 0) {
        const nodes = Array.from(document.querySelectorAll(".day-node"));
        const onlineBlocks = getOnlineBlockCount();
        const replacementBlocks = [];
        const previewBlocks = Math.round(previewMinutes / 15);

        replacementActivities.forEach(activity => {
            const blocks = Math.round(activity.minutes / 15);
            for (let i = 0; i < blocks; i++) {
                replacementBlocks.push(activity);
            }
        });

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            node.className = "day-node";
            node.style.backgroundColor = "var(--color-grayed-out)";
            node.title = "Non-online time";

            if (i < onlineBlocks) {
                const replacement = replacementBlocks[i];
                if (replacement) {
                    node.style.backgroundColor = replacement.color;
                    node.title = replacement.name;
                } else if (i < replacementBlocks.length + previewBlocks) {
                    node.style.backgroundColor = "var(--neon-green)";
                    node.classList.add("preview");
                    node.title = "Preview replacement";
                } else {
                    node.style.backgroundColor = "var(--color-online)";
                    node.title = "Online activity";
                }
            }
        }

        const replacedMinutes = getReplacedMinutes();
        const remainingMinutes = getRemainingOnlineMinutes();
        document.getElementById("daySummary").innerHTML = `
            <span><strong>${formatDayMinutes(onlineBlocks * 15)}</strong> online</span>
            <span><strong>${formatDayMinutes(replacedMinutes)}</strong> replaced</span>
            <span><strong>${formatDayMinutes(remainingMinutes)}</strong> left</span>
        `;
        renderReplacementList();
        updateRescueMetrics();
    }

    function renderReplacementList() {
        const list = document.getElementById("replacementList");
        list.innerHTML = "";
        replacementActivities.forEach(activity => {
            const row = document.createElement("div");
            row.className = "replacement-row";
            row.innerHTML = `<span class="color-swatch-box" style="background-color: ${activity.color}"></span><span>${activity.name}</span><strong>${formatDayMinutes(activity.minutes)}</strong>`;
            list.appendChild(row);
        });
    }

    /* ==========================================
       REPLACEMENT FORM + SLIDER INTERACTIONS (slide 7)
       ========================================== */
    function configureReplacementSlider() {
        const slider = document.getElementById("reclamationSlider");
        const remainingMinutes = getRemainingOnlineMinutes();
        const cappedMinutes = Math.max(15, remainingMinutes);
        slider.max = cappedMinutes;
        slider.value = Math.min(15, cappedMinutes);
        slider.disabled = remainingMinutes <= 0;
        document.getElementById("showReplacementBtn").disabled = remainingMinutes <= 0;
        document.getElementById("showReplacementBtn").innerText = remainingMinutes <= 0 ? "Online Time Fully Replaced" : "Add Replacement Activity";
        document.getElementById("sliderValueText").innerText = `${formatDayMinutes(parseInt(slider.value, 10))} / Day`;
        if (!document.getElementById("replacementForm").classList.contains("hidden")) {
            window.updateReplacementPreview(slider.value);
        }
    }

    window.showReplacementForm = function() {
        if (getRemainingOnlineMinutes() <= 0) return;
        document.getElementById("replacementForm").classList.remove("hidden");
        document.getElementById("rescueMetricsPanel").classList.remove("hidden");
        document.getElementById("replacementName").focus();
        configureReplacementSlider();
    };

    window.updateReplacementPreview = function(minutes) {
        const selectedMinutes = parseInt(minutes, 10) || 0;
        document.getElementById("sliderValueText").innerText = `${formatDayMinutes(selectedMinutes)} / Day`;
        renderDayReclamationMatrix(selectedMinutes);
    };

    window.addReplacementActivity = function() {
        const remainingMinutes = getRemainingOnlineMinutes();
        if (remainingMinutes <= 0) return;
        const nameInput = document.getElementById("replacementName");
        const slider = document.getElementById("reclamationSlider");
        const selectedMinutes = Math.min(parseInt(slider.value, 10) || 15, remainingMinutes);
        const activityName = nameInput.value.trim() || `Replacement ${replacementActivities.length + 1}`;

        replacementActivities.push({
            name: activityName,
            minutes: selectedMinutes,
            color: replacementPalette[replacementActivities.length % replacementPalette.length]
        });

        nameInput.value = "";
        if (getRemainingOnlineMinutes() <= 0) {
            document.getElementById("replacementForm").classList.add("hidden");
        }
        renderDayReclamationMatrix();
        configureReplacementSlider();
    };

    /* ==========================================
       REGAINED TIME METRICS (slide 7)
       ========================================== */
    function updateRescueMetrics() {
        const m = window.calculationMetrics;
        const rescuedWeeks = Math.round(((getReplacedMinutes() / 60) / 24) * m.totalWeeksCount);
        document.getElementById("txtRescuedWeeks").innerText = rescuedWeeks;
        document.getElementById("txtRescuedYears").innerText = (rescuedWeeks / 52).toFixed(1);
    }

})();