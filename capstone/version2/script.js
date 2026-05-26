// State tracking variables for Chart.js instances
let leftChartInstance = null;
let rightChartInstance = null;
let benchmarkData = null;

// Initial setup on document ready
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('data.json');
        benchmarkData = await response.json();
        
        // Initial build using baseline defaults
        updateDashboard();
    } catch (error) {
        console.error("Error loading benchmark dataset elements:", error);
    }

    // Attach event listener to the main form action
    document.getElementById("updateBtn").addEventListener("click", updateDashboard);
});

function updateDashboard() {
    if (!benchmarkData) return;

    // 1. Capture and convert raw form inputs
    const screenHours = parseFloat(document.getElementById("screenTime").value) || 0;
    const socialHours = parseFloat(document.getElementById("socialMedia").value) || 0;
    const notificationsCount = parseInt(document.getElementById("notifications").value) || 0;
    const sleepHours = parseFloat(document.getElementById("sleepHours").value) || 0;
    
    // Convert to explicit minute balances for deep computation
    const screenMinutes = screenHours * 60;
    const socialMinutes = socialHours * 60;
    const sleepMinutes = sleepHours * 60;
    const totalDayMinutes = 24 * 60;

    // 2. Derive secondary data elements from reference statistics
    // Ad visibility density based on DataReportal behavior metrics
    const adPercentage = benchmarkData.us_averages_2026.ad_time_percentage_of_social / 100;
    const adMinutes = socialMinutes * adPercentage;

    // Notification operational overhead calculated via Pew action averages
    const alertDismissSec = benchmarkData.us_averages_2026.notification_dismissal_seconds;
    const notificationMinutes = (notificationsCount * alertDismissSec) / 60;

    // Remaining operational focus metrics
    const coreScreenRemainder = Math.max(0, screenMinutes - socialMinutes - notificationMinutes);
    const nonDigitalRemainder = Math.max(0, totalDayMinutes - screenMinutes - sleepMinutes);

    // 3. Render Chart One: The Whole Day Context Split
    renderLeftChart(screenMinutes, sleepMinutes, nonDigitalRemainder);

    // 4. Render Chart Two: Inner Online Allocation Details
    renderRightChart(socialMinutes, adMinutes, notificationMinutes, coreScreenRemainder);

    // 5. Compute Long-Range Trajectories over a 50-year horizon
    calculateFutureProjections(socialHours, adMinutes, notificationsCount, alertDismissSec);
}

function renderLeftChart(onlineMins, sleepMins, restMins) {
    const ctx = document.getElementById("leftChart").getContext("2d");
    
    if (leftChartInstance) {
        leftChartInstance.destroy();
    }

    leftChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Online Screen Time', 'Average Sleep', 'Everything Else'],
            datasets: [{
                data: [onlineMins, sleepMins, restMins],
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
                borderWidth: 1,
                borderColor: '#2a2a30'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#f5f5f7' } }
            }
        }
    });
}

function renderRightChart(socialMins, adMins, notesMins, restScreenMins) {
    const ctx = document.getElementById("rightChart").getContext("2d");

    if (rightChartInstance) {
        rightChartInstance.destroy();
    }

    // Isolate pure non-ad social space for structural accuracy
    const pureSocialMins = Math.max(0, socialMins - adMins);

    rightChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Social Engagement', 'Time Viewing Ads', 'Handling Notifications', 'Other Digital Browsing'],
            datasets: [{
                data: [pureSocialMins, adMins, notesMins, restScreenMins],
                backgroundColor: ['#ff9f40', '#ffcd56', '#4bc0c0', '#9966ff'],
                borderWidth: 1,
                borderColor: '#2a2a30'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#f5f5f7' } }
            }
        }
    });
}

function calculateFutureProjections(socialHours, adMinutes, notificationsCount, alertDismissSec) {
    const trackingHorizonYears = 50;
    const daysInYear = 365.25;

    // Calculate long-term scroll volume totals
    const totalSocialHoursLifetime = socialHours * daysInYear * trackingHorizonYears;
    const scrollYears = (totalSocialHoursLifetime / 24) / daysInYear;

    // Calculate time spent looking at advertisements
    const dailyAdHours = adMinutes / 60;
    const totalAdHoursLifetime = dailyAdHours * daysInYear * trackingHorizonYears;
    const adYears = (totalAdHoursLifetime / 24) / daysInYear;

    // Compute total lifespan impact handling system triggers
    const dailyNotificationSeconds = notificationsCount * alertDismissSec;
    const totalNotificationSecondsLifetime = dailyNotificationSeconds * daysInYear * trackingHorizonYears;
    const notificationDays = totalNotificationSecondsLifetime / (24 * 3600);

    // Render output message directly into placeholder
    const projectionElement = document.getElementById("projectionText");
    projectionElement.innerHTML = `Based on your metrics, over the next <strong>${trackingHorizonYears} years</strong>, your current digital interaction pattern means you will spend approximately: 
    <br><br>
    🚀 <strong>${scrollYears.toFixed(1)} years</strong> actively scrolling social platforms, 
    <br>
    📺 <strong>${adYears.toFixed(1)} years</strong> processing digital advertisements, and 
    <br>
    🔔 <strong>${notificationDays.toFixed(0)} days</strong> entirely dedicated to evaluating and dismissing notifications.`;
}