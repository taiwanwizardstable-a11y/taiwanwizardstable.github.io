
/* =====================================
   TWT HOUSE CUP
   Magical Crystal Collection
===================================== */

document.addEventListener("DOMContentLoaded", function () {

  const houseCards = document.querySelectorAll(".house-card");

  const scores = Array.from(houseCards).map(card =>
    Math.max(0, Number(card.dataset.score) || 0)
  );

  const maxScore = Math.max(...scores, 1);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const palettes = {
    gryffindor: ["#8e171d", "#d43c42", "#f47778", "#ffb4a0"],
    slytherin: ["#075c46", "#13976e", "#43d9a0", "#b2ffe0"],
    ravenclaw: ["#123b91", "#2873dc", "#65a7ff", "#c0dcff"],
    hufflepuff: ["#98600a", "#dca521", "#ffd34f", "#fff0a0"]
  };

  /* 可重現的隨機排列 */

  function seededRandom(seed) {
    let value = seed >>> 0;

    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  /* 分數動畫 */

  function animateScore(element, target, duration) {

    if (reduceMotion) {
      element.textContent = target;
      return;
    }

    const start = performance.now();

    function update(now) {

      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      element.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }

    }

    requestAnimationFrame(update);
  }

  /* 生成單顆寶石 */

  function createGem(random, colors, index) {

    const gem = document.createElement("span");

    gem.className = "magic-gem";

    const size = 9 + random() * 7;
    const rotation = -40 + random() * 80;

    gem.style.setProperty("--gem-size", size + "px");
    gem.style.setProperty("--gem-rotation", rotation + "deg");

    gem.style.setProperty(
      "--gem-dark",
      colors[0]
    );

    gem.style.setProperty(
      "--gem-main",
      colors[1]
    );

    gem.style.setProperty(
      "--gem-light",
      colors[2]
    );

    gem.style.setProperty(
      "--gem-flash",
      colors[3]
    );

    gem.style.setProperty(
      "--twinkle-delay",
      (random() * -7).toFixed(2) + "s"
    );

    gem.style.setProperty(
      "--twinkle-duration",
      (3 + random() * 5).toFixed(2) + "s"
    );

    gem.style.zIndex = index;

    return gem;
  }

  /* 寶石堆積 */

  function buildGemPile(card, finalScore, index) {

    const glass = card.querySelector(".gem-glass");
    const pile = card.querySelector(".gem-pile");

    if (!glass || !pile) return;

    pile.innerHTML = "";

    const house = card.dataset.house;
    const colors = palettes[house] || palettes.ravenclaw;

    const random = seededRandom(
      2026 + index * 173 + finalScore
    );

    const glassHeight = glass.clientHeight;

    const maxHeight = Math.max(
      40,
      Math.min(180, glassHeight - 35)
    );

    const targetHeight = finalScore <= 0
      ? 0
      : Math.max(
          22,
          (finalScore / maxScore) * maxHeight
        );

    pile.style.height = targetHeight + "px";

    if (finalScore <= 0) return;

    const pileWidth = pile.clientWidth;

    const columns = Math.max(
      5,
      Math.floor(pileWidth / 13)
    );

    const rowHeight = 10;
    const rows = Math.max(
      1,
      Math.floor(targetHeight / rowHeight)
    );

    const totalGems = Math.min(
      180,
      Math.ceil(rows * columns * 0.88)
    );

    const gems = [];

    for (let i = 0; i < totalGems; i++) {

      const gem = createGem(
        random,
        colors,
        i
      );

      const row = Math.floor(i / columns);
      const column = i % columns;

      const stagger = row % 2 ? 0.5 : 0;

      const x = (
        (column + stagger + 0.5) / columns
      ) * pileWidth;

      const jitterX = (random() - 0.5) * 6;
      const jitterY = (random() - 0.5) * 5;

      const bottom = Math.min(
        targetHeight - 8,
        row * rowHeight + jitterY
      );

      gem.style.left = Math.max(
        3,
        Math.min(pileWidth - 8, x + jitterX)
      ) + "px";

      gem.style.bottom = Math.max(
        0,
        bottom
      ) + "px";

      const duration = 650 + random() * 650;

      const delay = (
        i / totalGems
      ) * 1700 + random() * 120;

      gems.push({
        element: gem,
        duration,
        delay,
        rotation: gem.style.getPropertyValue(
          "--gem-rotation"
        )
      });

      pile.appendChild(gem);
    }

    if (reduceMotion) return;

    /* 寶石從上方落下 */

    gems.forEach(item => {

      const gem = item.element;

      const fallDistance =
        glassHeight - parseFloat(gem.style.bottom) + 25;

      gem.animate(
        [
          {
            transform:
              `translateY(${-fallDistance}px) rotate(-95deg) scale(0.85)`,
            opacity: 0
          },
          {
            offset: 0.12,
            opacity: 1
          },
          {
            offset: 0.78,
            transform:
              "translateY(5px) rotate(12deg) scale(1.04)",
            opacity: 1
          },
          {
            offset: 0.9,
            transform:
              "translateY(-4px) rotate(-5deg) scale(0.98)",
            opacity: 1
          },
          {
            transform:
              "translateY(0) rotate(0deg) scale(1)",
            opacity: 1
          }
        ],
        {
          duration: item.duration,
          delay: 250 + item.delay,
          easing: "cubic-bezier(.24,.65,.35,1)",
          fill: "backwards"
        }
      );

    });

  }

  /* 四學院初始化 */

  houseCards.forEach(function (card, index) {

    const finalScore = Math.max(
      0,
      Number(card.dataset.score) || 0
    );

    const scoreNumber = card.querySelector(
      ".score-number"
    );

    buildGemPile(card, finalScore, index);

    if (scoreNumber) {
      animateScore(
        scoreNumber,
        finalScore,
        2300
      );
    }

  });

});
