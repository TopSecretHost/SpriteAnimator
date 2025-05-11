const undoStack = [];
const redoStack = [];

function saveState() {
    const state = {
        frames: JSON.parse(JSON.stringify(frames)),
        uploadedImages: uploadedImages.slice(),
        spriteSheet: spriteSheet ? spriteSheet.src : null,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        currentFrame: currentFrame,
        zoomLevel: zoomLevel,
        offsetX: offsetX,
        offsetY: offsetY,
        gridOffsetX: gridOffsetX,
        gridOffsetY: gridOffsetY,
        canvasColor: canvasColor
    };
    undoStack.push(state);
    redoStack.length = 0; // Clear the redo stack
}

function restoreState(state) {
    frames = JSON.parse(JSON.stringify(state.frames));
    uploadedImages = state.uploadedImages.slice();
    if (state.spriteSheet) {
        spriteSheet = new Image();
        spriteSheet.src = state.spriteSheet;
    } else {
        spriteSheet = null;
    }
    frameWidth = state.frameWidth;
    frameHeight = state.frameHeight;
    currentFrame = state.currentFrame;
    zoomLevel = state.zoomLevel;
    offsetX = state.offsetX;
    offsetY = state.offsetY;
    gridOffsetX = state.gridOffsetX;
    gridOffsetY = state.gridOffsetY;
    canvasColor = state.canvasColor;
    adjustZoomLevel();
    drawGrid();
    if (isLivePreviewEnabled) {
        startPreview();
    }
}

document.getElementById('undoAction').addEventListener('click', () => {
    if (undoStack.length > 0) {
        const state = undoStack.pop();
        redoStack.push(state);
        restoreState(state);
    }
});

document.getElementById('redoAction').addEventListener('click', () => {
    if (redoStack.length > 0) {
        const state = redoStack.pop();
        undoStack.push(state);
        restoreState(state);
    }
});
