(function() {
    'use strict';

    const content = {
        "MINISTUDIOS": `
            <nav>
                <ol>
                    <li><a href="./studio1/index.html">Blockbuster Video</a></li>
                    <li><a href="./studio2/index.html">Check Yourself</a></li>
                    <li><a href="#">Library Liberty</a></li>
                </ol>
            </nav>
        `,
        "TOOLKIT": `
            <nav>
                <ol>
                    <li><a href="./libraries/index.html">Libraries</a></li>
                    <li><a href="#">Friends List</a></li>
                </ol>
            </nav>
        `,
        "RESEARCH": `
            <nav>
                <ul>
                    <li><a href="https://www.figma.com/board/inJez1SzI0TRa6xjvVashd/Capstone-Project-Brainstorming--Copy-?node-id=0-1&t=hjMiHyyvtqKRRLPc-1">Brainstorm</a></li>
                    <li><a href="#">Comparative Analysis</a></li>
                    <li><a href="#">Annotated Bibliography</a></li>
                    <li><a href="#">Feasibility Report</a></li>
                    <li><a href="#">Usability Results</a></li>
                </ul>
            </nav>
        `,
        "DEVELOPMENT": `
            <nav>
                <ul>
                    <li><a href="#">Proposal</a></li>
                    <li><a href="#">Sketches</a></li>
                    <li><a href="#">User Flows</a></li>
                    <li><a href="#">Design Progress</a></li>
                    <li><a href="#">LoFi Sketches</a></li>
                    <li><a href="#">Version 1</a></li>
                    <li><a href="#">Usability Test</a></li>
                    <li><a href="#">Version 2</a></li>
                </ul>
            </nav>
        `,
        "CAPSTONE": `
            <nav>
                <ul>
                    <li><a href="#">Case Study</a></li>
                    <li><a href="#">Project</a></li>
                </ul>
            </nav>
        `
    };

    const titles = document.querySelectorAll('.title h3');
    const infoSection = document.getElementById('my-info');

    for (const title of titles) {
        title.addEventListener('click', function() {
            const sectionName = this.textContent.trim();
            document.getElementById('nav-display').innerHTML = content[sectionName];
        });
    }

    const button = document.querySelector('button');
    const body = document.querySelector('body');
    const banner = document.querySelector('#banner');
    const sections = document.querySelectorAll('section');
    const images = document.querySelectorAll('#image-strip img');
    let mode = 'light';

    button.addEventListener('click', function() {
        if (mode === 'light') {
            body.className = 'switch';
            button.className = 'switch';
            for (const section of sections) {
                section.className = 'switch';
            }
            mode = 'dark';
            for (const img of images) {
                img.src = img.src.replace('.jpg', '-alt.jpg');
            }
        } else {
            body.removeAttribute('class');
            button.removeAttribute('class');
            for (const section of sections) {
                section.removeAttribute('class');
            }
            mode = 'light';
            for (const img of images) {
                img.src = img.src.replace('-alt.jpg', '.jpg');
            }
        }
    })
})()