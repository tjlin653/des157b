(function () {
    'use strict';

    const videoPlayer = document.querySelector('#cat-video');
    const timelineLayer = document.querySelector('#paw-print-layer');

    function timeToPercent(timeStr) {
        const timeParts = timeStr.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const totalMinutes = (hours * 60) + minutes;
        return (totalMinutes / 1440) * 100;
    }

    async function updateDashboard(dayNumber) {
        try {
            const response = await fetch('checkyourself.json');
            const data = await response.json();

            const formattedDate = '2026-04-' + dayNumber.padStart(2, '0');

            const dayData = data.cat_logs.find(function (log) {
                return log.date === formattedDate;
            });

            timelineLayer.innerHTML = '';

            if (dayData && dayData.visits.length > 0) {
                const sortedVisits = dayData.visits.sort(function (a, b) {
                    return a.time.localeCompare(b.time);
                });

                videoPlayer.src = sortedVisits[0].video_src;
                videoPlayer.load();
                videoPlayer.play();

                for (let i = 0; i < sortedVisits.length; i++) {
                    const visit = sortedVisits[i];
                    const paw = document.createElement('span');

                    paw.className = 'paw-icon';
                    paw.innerHTML = '<img src="images/paw.webp" alt="Paw Icon" width="24" height="24">';
                    paw.style.left = timeToPercent(visit.time) + '%';

                    paw.onclick = (function(playVideo) {
                        return function() {
                            videoPlayer.src = playVideo.video_src;
                            videoPlayer.load();
                            videoPlayer.play();
                        };
                    })(visit);

                    timelineLayer.appendChild(paw);
                }
            } else {
                videoPlayer.pause();
                videoPlayer.src = "";
            }
        } catch (error) {
            console.error("Error loading JSON:", error);
        }
    }

    function init() {
        const dayButtons = document.querySelectorAll('.day-num');

        for (let i = 0; i < dayButtons.length; i++) {
            const day = dayButtons[i];
            if (day.innerText.trim() !== "") {
                day.onclick = function () {
                    updateDashboard(this.innerText);
                };
            }
        }
    }

    init();
})();