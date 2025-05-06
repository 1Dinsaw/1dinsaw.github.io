function showGame(gameName) {
    const iframe = document.getElementById('playframe');
    iframe.src = ""; // Clear the iframe source
    document.getElementById('game-list').style.display = "none";
    document.getElementById('game-container').style.display = "block";
}

function goBack() {
    document.getElementById('game-container').style.display = "none";
    document.getElementById('game-list').style.display = "block";
    const iframe = document.getElementById('playframe');
    iframe.src = ""; // Clear the iframe source
}

function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
}

setInterval(updateClock, 1000);
updateClock(); // Initialize clock immediately

function filterGames(category) {
    console.log(`Filtering games by category: ${category}`);
    // Add logic to filter games based on the category
}
