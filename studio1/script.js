(function (){
    'use strict';

    const myVid = document.getElementById('myVid');

    let timeout;
    myVid.pause();
    document.addEventListener('mousemove', function() {
        myVid.play();
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            myVid.pause();
        }, 200);
    });

    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const poem = {
        start: [1, 3],
        stop: [5, 7],
        line: [line1, line2]
    }

    const intervalID = setInterval(checkTime, 1000);
    function checkTime() {
        for (let i=0; i<poem.start.length; i++) {
            if (poem.start[i] < myVid.currentTime && myVid.currentTime < poem.stop[i]) {
                poem.line[i].className = 'showing';
            } else {
                poem.line[i].className = 'hidden';
            }
        }
    }

    const loading = document.querySelector('.fa-sun');
    myVid.addEventListener('loadeddata', function() {
        loading.style.display = 'none';
    })
})();