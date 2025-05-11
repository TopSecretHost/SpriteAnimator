function exportFrames(baseFileName) {
    const zip = new JSZip();
    const isTransparent = document.getElementById('transparentBackground').checked;

    // Calculate bounding box size
    const boundingBox = calculateBoundingBox(frames);

    frames.forEach((frame, i) => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCanvas.width = boundingBox.width;
        tempCanvas.height = boundingBox.height;
        
        if (!isTransparent) {
            tempCtx.fillStyle = canvasColor;
            tempCtx.fillRect(0, 0, boundingBox.width, boundingBox.height);
        }

        drawImages(tempCtx, frame.x, frame.y, frame.width, frame.height, 0, 0);

        const dataUrl = tempCanvas.toDataURL('image/png');
        const imgData = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
        zip.file(`${baseFileName}_${i + 1}.png`, imgData, { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseFileName}_animation_frames.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function exportGif(baseFileName) {
    const fps = parseInt(document.getElementById('fps').value);
    const delay = 1000 / fps;
    const isTransparent = document.getElementById('transparentBackground').checked;

    const gif = new GIF({
        workers: 2,
        quality: 10,
        transparent: isTransparent ? 0x00000000 : null,
        workerScript: 'js/gif.worker.js'
    });

    const progressBar = createProgressBar(); // Add this line to create a progress bar

    // Calculate bounding box size
    const boundingBox = calculateBoundingBox(frames);

    frames.forEach((frame) => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCanvas.width = boundingBox.width;
        tempCanvas.height = boundingBox.height;
        
        if (!isTransparent) {
            tempCtx.fillStyle = canvasColor;
            tempCtx.fillRect(0, 0, boundingBox.width, boundingBox.height); // Ensure canvas color background
        }

        drawImages(tempCtx, frame.x, frame.y, frame.width, frame.height, 0, 0);

        gif.addFrame(tempCanvas, { copy: true, delay: delay });
    });

    gif.on('progress', (p) => {
        updateProgressBar(progressBar, p * 100); // Update progress bar during rendering
    });

    gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseFileName}_animation.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        removeProgressBar(progressBar); // Add this line to remove the progress bar after completion
    });

    gif.render();
}

// Function to create and show a progress bar
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.position = 'fixed';
    progressBar.style.top = '50%';
    progressBar.style.left = '50%';
    progressBar.style.transform = 'translate(-50%, -50%)';
    progressBar.style.width = '300px';
    progressBar.style.height = '30px';
    progressBar.style.backgroundColor = '#ccc';
    progressBar.style.borderRadius = '5px';
    progressBar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

    const progress = document.createElement('div');
    progress.style.width = '0%';
    progress.style.height = '100%';
    progress.style.backgroundColor = '#61dafb';
    progress.style.borderRadius = '5px';

    progressBar.appendChild(progress);
    document.body.appendChild(progressBar);

    return progressBar;
}

// Function to update the progress bar
function updateProgressBar(progressBar, value) {
    const progress = progressBar.firstChild;
    progress.style.width = `${value}%`;
}

// Function to remove the progress bar
function removeProgressBar(progressBar) {
    document.body.removeChild(progressBar);
}
