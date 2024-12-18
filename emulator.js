let wasmInstance;

// Load WebAssembly-based emulator
async function loadEmulator() {
    try {
        const response = await fetch('dolphin.wasm');
        const buffer = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(buffer);
        wasmInstance = instance;

        document.getElementById('status').textContent = "Emulator loaded. Ready to play!";
    } catch (error) {
        console.error("Failed to load the emulator:", error);
        document.getElementById('status').textContent = "Failed to load the emulator.";
    }
}

// Handle ROM loading
document.getElementById('rom-loader').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (file) {
        const arrayBuffer = await file.arrayBuffer();

        // Send ROM data to WebAssembly instance
        if (wasmInstance && wasmInstance.exports && wasmInstance.exports.loadROM) {
            wasmInstance.exports.loadROM(new Uint8Array(arrayBuffer));
            document.getElementById('status').textContent = "ROM loaded successfully! Starting...";
            startEmulation();
        } else {
            document.getElementById('status').textContent = "Emulator not ready to load ROM.";
        }
    }
});

// Start the emulator
function startEmulation() {
    if (wasmInstance && wasmInstance.exports && wasmInstance.exports.run) {
        const canvas = document.getElementById('emulator-canvas');
        const ctx = canvas.getContext('2d');

        function drawFrame() {
            wasmInstance.exports.run();
            // Draw graphics from WebAssembly to the canvas
            // This is a placeholder; exact implementation depends on the emulator
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
        }

        drawFrame();
    } else {
        document.getElementById('status').textContent = "Emulation failed to start.";
    }
}

// Load the emulator on page load
loadEmulator();
