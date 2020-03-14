setInterval(function(){
  if(player.generators[0].prestigeAmount.logarithm == Infinity){
    resetGame();
    player.resetBoost*=2;
  }
},1);
