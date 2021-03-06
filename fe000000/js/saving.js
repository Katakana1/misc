let Saving = {
  saveGame () {
    localStorage.setItem('fe000000-save', btoa(JSON.stringify(player)))
  },
  loadGame(s, offlineProgress) {
    // offlineProgress = null means leave it up to the save.
    player = JSON.parse(atob(s));
    if (offlineProgress === null) {
      offlineProgress = player.options.offlineProgress;
    }
    this.fixPlayer();
    this.convertSaveToDecimal();
    // We can do this after fixing Decimal.
    let now = Date.now();
    if (offlineProgress) {
      this.simulateTime((now - player.lastUpdate) / 1024);
    }
    player.lastUpdate = now;
    this.saveGame();
    updateDisplaySaveLoadSetup();
  },
  simulateTime(totalDiff) {
    let baseTickLength = 1 / 16;
    let ticks = Math.ceil(Math.min(totalDiff / baseTickLength, 1024));
    let tickLength = totalDiff / ticks;
    for (let i = 0; i < ticks; i++) {
      gameLoop(tickLength, false);
    }
  },
  fixPlayer() {
    if (player.version < 1.25) {
      // The first line here fixes a bug, the rest are due to new content.
      player.prestigePower = Decimal.max(1, player.prestigePower);
      player.infinityPoints = new Decimal(0);
      player.infinities = 0;
      player.infinityStars = new Decimal(1);
      player.infinityGenerators = initialInfinityGenerators();
      player.highestInfinityGenerator = 0;
      player.infinityUpgrades = [0, 0];
      player.version = 1.25;
    }
    if (player.version < 1.3125) {
      player.sacrificeMultiplier = new Decimal(1);
      player.stats = {
        totalStarsProduced: new Decimal(0),
        timeSincePurchase: 0,
        timeSinceSacrifice: 0,
        timeSincePrestige: 0,
        timeSinceInfinity: 0,
        timeSinceGameStart: 0,
        peakIPPerSec: new Decimal(0)
      };
      player.version = 1.3125;
    }
    if (player.version < 1.375) {
      player.currentChallenge = 0;
      player.challengesCompleted = [
        false, false, false, false, false, false,
        false, false, false, false, false, false,
      ];
      player.breakInfinity = false;
      player.stats.purchasesThisInfinity = 0;
      player.version = 1.375;
    }
    if (player.version < 1.40625) {
      player.stats.totalIPProduced = new Decimal(0);
      player.stats.fastestInfinity = Math.pow(2, 256);
      player.stats.timeSinceLastPeakIPPerSec = Math.pow(2, 256);
      player.stats.lastTenInfinities = [
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
        [-1, new Decimal(-1), new Decimal(-1)], [-1, new Decimal(-1), new Decimal(-1)],
      ];
      player.version = 1.40625;
    }
    if (player.version < 1.4375) {
      player.autobuyers = initialAutobuyers();
      // this is usable for testing and for cheaters
      player.cheats = {
        gameSpeed: 1,
      };
      player.version = 1.4375;
    }
    if (player.version < 1.453125) {
      player.currentInfinityChallenge = 0;
      player.infinityChallengesCompleted = [
        false, false, false, false, false, false, false, false,
      ];
      // Eternity hasn't been added yet, so this is clearly correct.
      player.stats.totalStarsProducedThisEternity = player.stats.totalStarsProduced;
      player.version = 1.453125;
    }
    if (player.version < 1.4609375) {
      player.stats.prestigesThisInfinity = 0;
      player.version = 1.4609375;
    }
    if (player.version < 1.46875) {
      player.stats.purchasesThisInfinityByType = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      player.version = 1.46875;
    }
  },
  convertSaveToDecimal() {
    player.stars = new Decimal(player.stars);
    for (let i = 0; i < 8; i++) {
      player.generators[i].amount = new Decimal(player.generators[i].amount);
    }
    player.sacrificeMultiplier = new Decimal(player.sacrificeMultiplier);
    player.prestigePower = new Decimal(player.prestigePower);
    player.infinityPoints = new Decimal(player.infinityPoints);
    player.infinityStars = new Decimal(player.infinityStars);
    for (let i = 0; i < 8; i++) {
      player.infinityGenerators[i].amount = new Decimal(player.infinityGenerators[i].amount);
    }
    player.stats.totalStarsProduced = new Decimal(player.stats.totalStarsProduced);
    player.stats.totalStarsProducedThisEternity = new Decimal(player.stats.totalStarsProducedThisEternity);
    player.stats.totalIPProduced = new Decimal(player.stats.totalIPProduced);
    player.stats.peakIPPerSec = new Decimal(player.stats.peakIPPerSec);
    for (let i = 0; i < 10; i++) {
      if (player.stats.lastTenInfinities[i] !== -1) {
        player.stats.lastTenInfinities[i][1] = new Decimal(player.stats.lastTenInfinities[i][1]);
        player.stats.lastTenInfinities[i][2] = new Decimal(player.stats.lastTenInfinities[i][2]);
      }
    }
    for (let i = 9; i < 12; i++) {
      player.autobuyers[i].priority = new Decimal(player.autobuyers[i].priority);
    }
  },
  loadGameStorage () {
    if (!localStorage.getItem('fe000000-save')) {
      this.resetGame();
    } else {
      try {
        // We're loading from storage, player.options.offlineProgress isn't set yet.
        this.loadGame(localStorage.getItem('fe000000-save'), null);
      } catch (ex) {
        console.log('Exception while loading game, please report this.', ex);
        this.resetGame();
      }
    }
  },
  loadGamePrompt() {
    try {
      let save = prompt('Enter your save:');
      if (save && !(/^\s+$/.test(save))) {
        this.loadGame(save, player.options.offlineProgress);
      } else if (save !== null) {
        alert('The save you entered appears to be empty.');
      }
    } catch(ex) {
      alert('The save you entered does not seem to be valid. The error was ' + ex);
    }
  },
  exportGame () {
    let output = document.getElementById('export-output');
    let parent = output.parentElement;
    parent.style.display = "";
    output.value = btoa(JSON.stringify(player));
    output.focus();
    output.select();
    try {
      document.execCommand('copy');
    } catch(ex) {
      alert('Copying to clipboard failed.');
    }
  },
  resetGame() {
    // The false here sets Date.now() to when the game was reset
    // rather than when the window was loaded.
    this.loadGame(btoa(JSON.stringify(initialPlayer)), false);
  },
  resetGameWithConfirmation() {
    if (confirm('Do you really want to reset the game? You will lose all your progress, and get no benefit.')) {
      this.resetGame();
    }
  }
}
