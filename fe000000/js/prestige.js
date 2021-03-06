let Prestige = {
  prestigePower() {
    return player.prestigePower;
  },
  setPrestigePower(x) {
    player.prestigePower = x;
  },
  multiplier() {
    return this.prestigePower();
  },
  isPrestigeDisabled() {
    return Challenge.isChallengeRunning(10);
  },
  prestigePowerExponent() {
    if (this.isPrestigeDisabled()) {
      return 0;
    }
    let isPrestigePowerSquareRooted = [8, 11].indexOf(Challenge.currentChallenge()) !== -1 ||
      [2, 7].indexOf(InfinityChallenge.currentInfinityChallenge()) !== -1;
    let expComponents = [
      InfinityChallenge.isInfinityChallengeRunning(3) ? InfinityChallenge.infinityChallenge3PrestigePowerExponent() : 1,
      InfinityChallenge.isInfinityChallengeRunning(6) ? InfinityChallenge.infinityChallenge6PrestigePowerExponent() : 1,
      InfinityChallenge.isInfinityChallengeCompleted(6) ? InfinityChallenge.infinityChallenge6Reward() : 1,
      isPrestigePowerSquareRooted ? 0.5 : 1
    ];
    return expComponents.reduce((a, b) => a * b);
  },
  prestigeRequirement() {
    return Decimal.pow(2, Math.max(128, 96 + 16 * Decimal.log2(this.prestigePower()) / this.prestigePowerExponent()));
  },
  canPrestige() {
    return player.stars.gte(this.prestigeRequirement()) && !InfinityPrestigeLayer.mustInfinity() && !this.isPrestigeDisabled();
  },
  isVisible() {
    return (this.canPrestige() || this.prestigePower().gt(1) || player.infinities > 0) && !this.isPrestigeDisabled();
  },
  newPrestigePower() {
    return this.canPrestige() ? Decimal.pow(2, this.prestigePowerExponent() * (player.stars.log(2) - 96) / 16) : this.prestigePower();
  },
  prestigePowerGain() {
    return this.newPrestigePower().minus(this.prestigePower());
  },
  prestigePowerMultGain() {
    return this.newPrestigePower().div(this.prestigePower());
  },
  prestige() {
    if (!this.canPrestige()) return;
    this.setPrestigePower(this.newPrestigePower());
    player.stats.prestigesThisInfinity++;
    this.prestigeReset();
  },
  prestigeReset() {
    player.stars = new Decimal(2);
    player.boost = {bought: 0};
    player.generators = initialGenerators();
    player.highestGenerator = 0;
    player.sacrificeMultiplier = new Decimal(1);
    player.stats.timeSincePurchase = 0;
    player.stats.timeSinceSacrifice = 0;
    player.stats.timeSincePrestige = 0;
  }
}
