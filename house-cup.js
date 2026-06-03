const houseCards = document.querySelectorAll(".house-card");

const scores = Array.from(houseCards).map(function(card){
  return Number(card.dataset.score);
});

const maxScore = Math.max(...scores);

houseCards.forEach(function(card){

  const finalScore = Number(card.dataset.score);
  const scoreNumber = card.querySelector(".score-number");
  const magicSand = card.querySelector(".magic-sand");

  const sandHeight = Math.max((finalScore / maxScore) * 88, 8);

  setTimeout(function(){
    magicSand.style.height = sandHeight + "%";
  }, 300);

  let currentScore = 0;

  const step = Math.max(1, Math.ceil(finalScore / 80));

  const counter = setInterval(function(){

    currentScore += step;

    if(currentScore >= finalScore){
      currentScore = finalScore;
      clearInterval(counter);
    }

    scoreNumber.textContent = currentScore;

  }, 18);

});
