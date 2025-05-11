function enableImageEditingTools() {
    const brightnessInput = document.createElement('input');
    brightnessInput.type = 'range';
    brightnessInput.min = '-100';
    brightnessInput.max = '100';
    brightnessInput.value = '0';
    brightnessInput.id = 'brightness';
    brightnessInput.title = 'Adjust Brightness';
    document.body.appendChild(brightnessInput);

    const contrastInput = document.createElement('input');
    contrastInput.type = 'range';
    contrastInput.min = '-100';
    contrastInput.max = '100';
    contrastInput.value = '0';
    contrastInput.id = 'contrast';
    contrastInput.title = 'Adjust Contrast';
    document.body.appendChild(contrastInput);

    brightnessInput.addEventListener('input', () => {
        applyImageAdjustments();
    });

    contrastInput.addEventListener('input', () => {
        applyImageAdjustments();
    });

    function applyImageAdjustments() {
        const brightness = parseInt(brightnessInput.value, 10);
        const contrast = parseInt(contrastInput.value, 10);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(data[i] + brightness, 0, 255);
            data[i + 1] = clamp(data[i + 1] + brightness, 0, 255);
            data[i + 2] = clamp(data[i + 2] + brightness, 0, 255);

            data[i] = clamp(data[i] * (contrast / 100 + 1), 0, 255);
            data[i + 1] = clamp(data[i + 1] * (contrast / 100 + 1), 0, 255);
            data[i + 2] = clamp(data[i + 2] * (contrast / 100 + 1), 0, 255);
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

enableImageEditingTools();
