setInterval(function(){
  if(player.generators[0].prestigeAmount.logarithm == Infinity){
    resetGame();
    player.resetVal*=2;
  }
},1);
