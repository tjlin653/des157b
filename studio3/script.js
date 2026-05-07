let completedStars = 0;
let completed = false;

$( "#star1" ).draggable({ revert: "invalid", snap: "#parent div" });
$( "#star2" ).draggable({ revert: "invalid", snap: "#parent div" });
$( "#star3" ).draggable({ revert: "invalid", snap: "#parent div" });
$( "#star4" ).draggable({ revert: "invalid", snap: "#parent div" });
$( "#star5" ).draggable({ revert: "invalid", snap: "#parent div" });
$( "#star6" ).draggable({ revert: "invalid", snap: "#parent div" });
$( "#star7" ).draggable({ revert: "invalid", snap: "#parent div" });

$(".guide").droppable({
    accept: ".fa-solid",
    tolerance: "touch",
    drop: function(event, ui) {
        if ($(this).hasClass("filled")) return;
        $(this).addClass("filled");
        ui.draggable.offset($(this).offset());
        ui.draggable.draggable("disable");
        ui.draggable.addClass("locked");
        completedStars++;
        checkCompletion();
    }
});

function checkCompletion() {
    if (completedStars === 7 && !completed) {
        completed = true;
        animateConstellation();
    }
}

function animateConstellation() {
    gsap.to(".locked", {
        scale: 2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        color: "#fff4a3",
        textShadow: `
            0 0 5px white,
            0 0 10px white,
            0 0 20px gold,
            0 0 40px gold,
            0 0 80px gold
        `
    });
}