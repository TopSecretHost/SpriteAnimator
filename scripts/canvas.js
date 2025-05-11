const canvas = document.getElementById('spriteCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
let spriteSheet, frameWidth, frameHeight;
let currentFrame = 0;
let previewInterval;
let isAnimating = false;
let isDragging = false;
let isLivePreviewEnabled = false;
let zoomLevel = 1;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let isDraggingGrid = false;
let startPanX = 0;
let startPanY = 0;
let gridOffsetX = 0;
let gridOffsetY = 0;
let canvasColor = '#ffffff'; // Default canvas color
let isResizingFrame = false;
let isDraggingFrame = false;
let resizeDirection = '';
let originalMouseX, originalMouseY;
let frames = [];
let selectedFrameIndex = -1;
let isDraggingKeyDown = false;
let copiedFrame = null;
let isCopyKeyDown = false;
let isPasteKeyDown = false;
let uploadedImages = [];
const colors = ['rgba(0, 255, 0, 0.3)', 'rgba(0, 0, 255, 0.3)', 'rgba(255, 0, 255, 0.3)', 'rgba(255, 165, 0, 0.3)'];

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas with selected color
    ctx.setTransform(zoomLevel, 0, 0, zoomLevel, offsetX, offsetY);

    // Draw images
    uploadedImages.forEach((img) => {
        ctx.drawImage(img, 0, 0);
    });

    // Draw the frames with different colors
    frames.forEach((frame, index) => {
        frame.draw(ctx, colors[index % colors.length]);
    });

    // Draw the grid on top of images and frames
    if (frameWidth && frameHeight) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width / zoomLevel; x += frameWidth) {
            ctx.moveTo(x + gridOffsetX, 0);
            ctx.lineTo(x + gridOffsetX, canvas.height / zoomLevel);
        }
        for (let y = 0; y < canvas.height / zoomLevel; y += frameHeight) {
            ctx.moveTo(0, y + gridOffsetY);
            ctx.lineTo(canvas.width / zoomLevel, y + gridOffsetY);
        }
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'; // More bold and pronounced grid lines
        ctx.lineWidth = 2; // Increase the line width for grid lines
        ctx.stroke();
        ctx.closePath();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawImages(ctx, srcX, srcY, srcWidth, srcHeight, destX, destY) {
    let currentX = 0;
    let currentY = 0;
    const maxCanvasWidth = canvas.width / zoomLevel;

    uploadedImages.forEach((img) => {
        if (currentX + img.width > maxCanvasWidth) {
            currentX = 0;
            currentY += img.height;
        }
        ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, destX, destY, srcWidth, srcHeight);
        currentX += img.width;
    });
}

function drawPreviewFrame() {
    if (uploadedImages.length && frames.length > 0) {
        const maxFrame = calculateBoundingBox(frames);
        previewCanvas.width = maxFrame.width;
        previewCanvas.height = maxFrame.height;
        
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.fillStyle = canvasColor;
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height); // Fill preview canvas with selected color
        
        let frameIndex = currentFrame % frames.length;
        const frame = frames[frameIndex];
        drawImages(previewCtx, frame.x, frame.y, frame.width, frame.height, 0, 0);
        currentFrame = (currentFrame + 1) % frames.length;
    }
}

function centerImage() {
    if (uploadedImages.length) {
        const boundingBox = calculateBoundingBox(uploadedImages);
        offsetX = (canvas.width - boundingBox.width * zoomLevel) / 2;
        offsetY = (canvas.height - boundingBox.height * zoomLevel) / 2;
        gridOffsetX = offsetX / zoomLevel;
        gridOffsetY = offsetY / zoomLevel;
        ctx.setTransform(zoomLevel, 0, 0, zoomLevel, offsetX, offsetY);
        drawGrid();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

function adjustZoomLevel() {
    const boundingBox = calculateBoundingBox(uploadedImages);
    const maxZoomOutLevel = Math.min(canvas.width / boundingBox.width, canvas.height / boundingBox.height);
    document.getElementById('zoomLevel').min = maxZoomOutLevel;
    zoomLevel = Math.max(zoomLevel, maxZoomOutLevel);
    document.getElementById('zoomLevel').value = zoomLevel;
}

function calculateBoundingBox(images) {
    let maxWidth = 0;
    let maxHeight = 0;

    images.forEach(img => {
        if (img.width > maxWidth) maxWidth = img.width;
        if (img.height > maxHeight) maxHeight = img.height;
    });

    return { width: maxWidth, height: maxHeight };
}

function adjustOffsetsForZoom() {
    const boundingBox = calculateBoundingBox(uploadedImages);
    const centerX = (canvas.width / zoomLevel - boundingBox.width) / 2;
    const centerY = (canvas.height / zoomLevel - boundingBox.height) / 2;

    offsetX = centerX * zoomLevel;
    offsetY = centerY * zoomLevel;
    gridOffsetX = centerX;
    gridOffsetY = centerY;
}

function getTopFrameIndex(x, y) {
    for (let i = frames.length - 1; i >= 0; i--) {
        if (frames[i].contains(x, y)) {
            return i;
        }
    }
    return -1;
}

function getResizeDirection(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - offsetX) / zoomLevel;
    const y = (clientY - rect.top - offsetY) / zoomLevel;
    const frame = frames[selectedFrameIndex];

    const margin = 20 / zoomLevel; // Increased sensitivity margin
    if (Math.abs(x - frame.x) < margin && Math.abs(y - frame.y) < margin) return 'top-left';
    if (Math.abs(x - (frame.x + frame.width)) < margin && Math.abs(y - frame.y) < margin) return 'top-right';
    if (Math.abs(x - frame.x) < margin && Math.abs(y - (frame.y + frame.height)) < margin) return 'bottom-left';
    if (Math.abs(x - (frame.x + frame.width)) < margin && Math.abs(y - (frame.y + frame.height)) < margin) return 'bottom-right';
    if (Math.abs(x - frame.x) < margin) return 'left';
    if (Math.abs(x - (frame.x + frame.width)) < margin) return 'right';
    if (Math.abs(y - frame.y) < margin) return 'top';
    if (Math.abs(y - (frame.y + frame.height)) < margin) return 'bottom';
    return '';
}

function displayTooltip(message) {
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = message;
    tooltip.style.display = 'block';
    setTimeout(() => {
        tooltip.style.display = 'none';
    }, 3000);
}
