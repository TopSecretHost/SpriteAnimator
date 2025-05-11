const timelineContainer = document.createElement('div');
timelineContainer.id = 'timeline-container';
document.body.appendChild(timelineContainer);

const timeline = document.createElement('div');
timeline.id = 'timeline';
timelineContainer.appendChild(timeline);

function updateTimeline() {
    timeline.innerHTML = '';
    frames.forEach((frame, index) => {
        const frameElement = document.createElement('div');
        frameElement.classList.add('timeline-frame');
        frameElement.style.width = `${100 / frames.length}%`;
        frameElement.innerText = index + 1;
        timeline.appendChild(frameElement);
    });
}

updateTimeline();
