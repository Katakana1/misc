function gameLoop(diff, display) {
  if (typeof diff !== 'number') {
    let now = Date.now();
    diff = (now - player.lastUpdate) / 1024 * player.cheats.gameSpeed;
    player.lastUpdate = now;
  }
  if (!InfinityPrestigeLayer.mustInfinity()) {
    for (let i = 8; i >= 1; i--) {
      Generator(i).produce(diff);
    }
  }
  for (let i = 8; i >= 1; i--) {
    InfinityGenerator(i).produce(diff);
  }
  Stats.addToTimeStats(diff);
  InfinityPrestigeLayer.updatePeakIPPerSec();
  Autobuyers.tick();
  if (display !== false) {
    updateDisplay();
  }
}
