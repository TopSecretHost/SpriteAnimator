document.getElementById('saveProject').addEventListener('click', () => {
    const projectData = {
        frames: frames,
        uploadedImages: uploadedImages.map(img => img.src),
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
    const json = JSON.stringify(projectData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sprite_project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById('loadProject').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const projectData = JSON.parse(e.target.result);
                frames = projectData.frames.map(frame => new Frame(frame.x, frame.y, frame.width, frame.height, frame.index));
                uploadedImages = projectData.uploadedImages.map(src => {
                    const img = new Image();
                    img.src = src;
                    return img;
                });
                if (projectData.spriteSheet) {
                    spriteSheet = new Image();
                    spriteSheet.src = projectData.spriteSheet;
                } else {
                    spriteSheet = null;
                }
                frameWidth = projectData.frameWidth;
                frameHeight = projectData.frameHeight;
                currentFrame = projectData.currentFrame;
                zoomLevel = projectData.zoomLevel;
                offsetX = projectData.offsetX;
                offsetY = projectData.offsetY;
                gridOffsetX = projectData.gridOffsetX;
                gridOffsetY = projectData.gridOffsetY;
                canvasColor = projectData.canvasColor;
                adjustZoomLevel();
                drawGrid();
                if (isLivePreviewEnabled) {
                    startPreview();
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
});
