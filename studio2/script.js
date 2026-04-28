(function(){
    'use strict';

    const videoPlayer = document.querySelector('#cat-video');

    async function updateVideoForDate(selectedDate) {
        try {
            const response = await fetch('checkyourself.json');
            const data = await response.json();

            // Format date to match JSON (e.g., "1" becomes "2026-04-01")
            const formattedDate = `2026-04-${selectedDate.padStart(2, '0')}`;
            
            // Find the data for the clicked day
            const dayData = data.cat_logs.find(log => log.date === formattedDate);

            if (dayData && dayData.visits.length > 0) {
                // Sort by time to ensure we get the earliest visit
                const sortedVisits = dayData.visits.sort((a, b) => a.time.localeCompare(b.time));

                // Get the video_src from the first (earliest) visit
                const earliestVideo = sortedVisits[0].video_src;

                // Update and play
                videoPlayer.src = earliestVideo;
                videoPlayer.load();
                videoPlayer.play();
                
                // Make video visible if you have it hidden initially
                videoPlayer.style.opacity = "1";
            } else {
                // If no visits, clear the player or show a "no cat" state
                videoPlayer.pause();
                videoPlayer.src = "";
                videoPlayer.style.opacity = "0";
            }
        } catch (error) {
            console.error("Error fetching or parsing cat data:", error);
        }
    }

    function init() {
        const days = document.querySelectorAll('.day-num');
        
        for (const day of days) {
            // Only add clicks to days that actually have a number
            if (day.innerText.trim() !== "") {
                day.addEventListener('click', function() {
                    updateVideoForDate(day.innerText);
                });
            }
        }
    }

    init();
})();