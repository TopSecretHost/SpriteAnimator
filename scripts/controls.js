document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            spriteSheet = new Image();
            spriteSheet.onload = () => {
                uploadedImages = [spriteSheet]; // Clear uploaded images and add new sprite sheet
                adjustZoomLevel();
                centerImage();
                drawGrid();
            };
            spriteSheet.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('multiFileInput').addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length) {
        uploadedImages = [];
        let loadedImages = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    uploadedImages.push(img);
                    loadedImages++;
                    if (loadedImages === files.length) {
                        combineImages();
                        adjustZoomLevel();
                        centerImage();
                        drawGrid();
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
});

document.getElementById('frameWidth').addEventListener('input', () => {
    frameWidth = parseInt(document.getElementById('frameWidth').value);
    drawGrid();
});

document.getElementById('frameHeight').addEventListener('input', () => {
    frameHeight = parseInt(document.getElementById('frameHeight').value);
    drawGrid();
});

document.getElementById('livePreview').addEventListener('change', (event) => {
    isLivePreviewEnabled = event.target.checked;
    if (isLivePreviewEnabled) {
        startPreview();
    } else {
        stopPreview();
    }
});

document.getElementById('zoomLevel').addEventListener('input', (event) => {
    zoomLevel = parseFloat(event.target.value);
    adjustOffsetsForZoom();
    drawGrid();
});

document.getElementById('resetSetup').addEventListener('click', () => {
    if (previewInterval) {
        clearInterval(previewInterval);
    }
    isAnimating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    if (uploadedImages.length) {
        centerImage();
        drawGrid();
    }
    document.getElementById('fileInput').value = '';
    document.getElementById('multiFileInput').value = '';
    document.getElementById('frameWidth').value = '';
    document.getElementById('frameHeight').value = '';
    document.getElementById('frameCount').value = '';
    document.getElementById('livePreview').checked = false;
    document.getElementById('zoomLevel').value = 1;
    document.getElementById('fps').value = 10;
    spriteSheet = null;
    frameWidth = null;
    frameHeight = null;
    frames = [];
    isLivePreviewEnabled = false;
    zoomLevel = 1;
    offsetX = 0;
    offsetY = 0;
    isPanning = false;
    startPanX = 0;
    startPanY = 0;
    gridOffsetX = 0;
    gridOffsetY = 0;
    canvasColor = '#ffffff'; // Reset canvas color to default
    uploadedImages = [];
});

document.getElementById('canvasColor').addEventListener('input', (event) => {
    canvasColor = event.target.value;
    drawGrid();
    if (isLivePreviewEnabled) {
        drawPreviewFrame();
    }
});

const gifScript = document.createElement('script');
gifScript.src = "js/gif.js";
gifScript.onload = () => {
    GIF.setOptions({
        workerScript: 'js/gif.worker.js'
    });
};
document.head.appendChild(gifScript);

document.getElementById('exportAnimation').addEventListener('click', () => {
    const baseFileName = prompt("Enter base file name:");
    if (!baseFileName) {
        alert('Please enter a valid file name.');
        return;
    }

    if (!uploadedImages.length) {
        alert('Please upload images first.');
        return;
    }
    if (frames.length === 0) {
        alert('Please select frames for the animation.');
        return;
    }

    const exportType = prompt("Enter export type: 'frames' or 'gif'");
    if (exportType === 'frames') {
        exportFrames(baseFileName);
    } else if (exportType === 'gif') {
        exportGif(baseFileName);
    } else {
        alert('Invalid export type.');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'd' || event.key === 'D') {
        isDraggingKeyDown = true;
    }
    if (event.key === 'c' || event.key === 'C') {
        isCopyKeyDown = true;
    }
    if (event.key === 'v' || event.key === 'V') {
        isPasteKeyDown = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'd' || event.key === 'D') {
        isDraggingKeyDown = false;
    }
    if (event.key === 'c' || event.key === 'C') {
        isCopyKeyDown = false;
    }
    if (event.key === 'v' || event.key === 'V') {
        isPasteKeyDown = false;
    }
});

canvas.addEventListener('mousedown', (event) => {
    if (!isAnimating) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - offsetX) / zoomLevel;
        const y = (event.clientY - rect.top - offsetY) / zoomLevel;

        const isGridSnap = document.getElementById('gridSnap').checked;

        if (event.ctrlKey && event.button === 0) {
            isDraggingGrid = true;
            startPanX = event.clientX;
            startPanY = event.clientY;
            canvas.style.cursor = 'grabbing';
        } else if (event.button === 0) {
            if (event.shiftKey) {
                selectedFrameIndex = getTopFrameIndex(x, y);
                if (selectedFrameIndex !== -1) {
                    isResizingFrame = true;
                    resizeDirection = getResizeDirection(event.clientX, event.clientY);
                    originalMouseX = event.clientX;
                    originalMouseY = event.clientY;
                }
            } else if (isDraggingKeyDown) {
                selectedFrameIndex = getTopFrameIndex(x, y);
                if (selectedFrameIndex !== -1) {
                    isDraggingFrame = true;
                    originalMouseX = event.clientX;
                    originalMouseY = event.clientY;
                }
            } else if (isCopyKeyDown) {
                selectedFrameIndex = getTopFrameIndex(x, y);
                if (selectedFrameIndex !== -1) {
                    copiedFrame = frames[selectedFrameIndex];
                    displayTooltip(`Copied Frame Size: ${copiedFrame.width} x ${copiedFrame.height}`);
                }
            } else if (isPasteKeyDown) {
                if (copiedFrame) {
                    const newFrameX = x - copiedFrame.width / 2;
                    const newFrameY = y - copiedFrame.height / 2;
                    const frame = new Frame(newFrameX, newFrameY, copiedFrame.width, copiedFrame.height, frames.length);
                    frames.push(frame);
                    drawGrid();
                }
            } else {
                let frameX, frameY;

                if (isGridSnap) {
                    // Snap to grid
                    frameX = Math.floor((x - gridOffsetX) / frameWidth) * frameWidth + gridOffsetX;
                    frameY = Math.floor((y - gridOffsetY) / frameHeight) * frameHeight + gridOffsetY;
                } else {
                    // Center frame at mouse pointer
                    frameX = x - frameWidth / 2;
                    frameY = y - frameHeight / 2;
                }

                // Check if the frame already exists
                if (!frames.some(frame => frame.contains(frameX + 1, frameY + 1) || frame.contains(frameX + frameWidth - 1, frameY + frameHeight - 1))) {
                    const frame = new Frame(frameX, frameY, frameWidth, frameHeight, frames.length);
                    frames.push(frame);
                    drawGrid();
                }
            }
        } else if (event.button === 2) { // Right mouse button
            const frameIndex = getTopFrameIndex(x, y);
            if (frameIndex !== -1) {
                frames.splice(frameIndex, 1);
                drawGrid();
            }
        }
    }
    if (event.button === 1) { // Middle mouse button for panning
        isPanning = true;
        startPanX = event.clientX;
        startPanY = event.clientY;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDraggingGrid) {
        const dx = (event.clientX - startPanX) / zoomLevel;
        const dy = (event.clientY - startPanY) / zoomLevel;
        startPanX = event.clientX;
        startPanY = event.clientY;
        gridOffsetX += dx;
        gridOffsetY += dy;
        drawGrid();
    }
    if (isPanning) {
        const dx = event.clientX - startPanX;
        const dy = event.clientY - startPanY;
        startPanX = event.clientX;
        startPanY = event.clientY;
        offsetX += dx / zoomLevel;
        offsetY += dy / zoomLevel;
        drawGrid();
    }
    if (isResizingFrame && selectedFrameIndex !== -1) {
        const dx = (event.clientX - originalMouseX) / zoomLevel;
        const dy = (event.clientY - originalMouseY) / zoomLevel;
        frames[selectedFrameIndex].resize(resizeDirection, dx, dy);
        originalMouseX = event.clientX;
        originalMouseY = event.clientY;
        drawGrid();
    }
    if (isDraggingFrame && selectedFrameIndex !== -1) {
        const dx = (event.clientX - originalMouseX) / zoomLevel;
        const dy = (event.clientY - originalMouseY) / zoomLevel;
        frames[selectedFrameIndex].move(dx, dy);
        originalMouseX = event.clientX;
        originalMouseY = event.clientY;
        drawGrid();
    }
});

canvas.addEventListener('mouseup', () => {
    isDraggingGrid = false;
    isPanning = false;
    isResizingFrame = false;
    isDraggingFrame = false;
    selectedFrameIndex = -1;
    canvas.style.cursor = 'grab';
    drawGrid();
});

canvas.addEventListener('mouseleave', () => {
    isDraggingGrid = false;
    isPanning = false;
    isResizingFrame = false;
    isDraggingFrame = false;
    selectedFrameIndex = -1;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Combine multiple images into a single canvas and center it
function combineImages() {
    let totalWidth = 0;
    let maxHeight = 0;

    uploadedImages.forEach(img => {
        totalWidth += img.width;
        if (img.height > maxHeight) {
            maxHeight = img.height;
        }
    });

    const combinedCanvas = document.createElement('canvas');
    const combinedCtx = combinedCanvas.getContext('2d');
    combinedCanvas.width = totalWidth;
    combinedCanvas.height = maxHeight;

    let currentX = 0;
    uploadedImages.forEach(img => {
        combinedCtx.drawImage(img, currentX, 0);
        currentX += img.width;
    });

    const combinedImage = new Image();
    combinedImage.src = combinedCanvas.toDataURL();
    combinedImage.onload = () => {
        uploadedImages = [combinedImage];
        centerImage();
        drawGrid();
    };
}

function startPreview() {
    const fps = parseInt(document.getElementById('fps').value);
    if (previewInterval) {
        clearInterval(previewInterval);
    }
    previewInterval = setInterval(() => drawPreviewFrame(), 1000 / fps);
}

function stopPreview() {
    if (previewInterval) {
        clearInterval(previewInterval);
    }
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
}
