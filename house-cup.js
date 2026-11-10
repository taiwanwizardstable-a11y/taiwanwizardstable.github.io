
/* =====================================
   TWT HOUSE CUP
   Magical Crystal Collection

   固定積分比例版本
===================================== */

document.addEventListener("DOMContentLoaded", function () {

  const houseCards = document.querySelectorAll(".house-card");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =====================================
     積分與動畫設定
     日後可以從這裡調整
  ===================================== */

  const SETTINGS = {

    // 多少積分達到寶石滿格基準
    scoreCap: 20000,

    // 滿格時佔玻璃櫃高度的比例
    // 0.85 = 85%
    maxFillRatio: 0.85,

    // 寶石累積動畫時間
    // 8000 = 8秒
    fillDuration: 8000,

    // 第一顆寶石開始掉落的延遲
    startDelay: 500,

    // 單顆寶石落下的時間
    fallDurationMin: 700,
    fallDurationMax: 1200,

    // 每顆寶石約代表多少積分
    pointsPerGem: 35,

    // 落地後持續柔和發光
    enableAmbientGlow: true

  };

  /* =====================================
     四學院寶石配色
  ===================================== */

  const palettes = {

    gryffindor: [
      "#8e171d",
      "#d43c42",
      "#f47778",
      "#ffb4a0"
    ],

    slytherin: [
      "#075c46",
      "#13976e",
      "#43d9a0",
      "#b2ffe0"
    ],

    ravenclaw: [
      "#123b91",
      "#2873dc",
      "#65a7ff",
      "#c0dcff"
    ],

    hufflepuff: [
      "#98600a",
      "#dca521",
      "#ffd34f",
      "#fff0a0"
    ]

  };

  /* =====================================
     固定隨機數
     讓每次載入排列自然且穩定
  ===================================== */

  function seededRandom(seed) {

    let value = seed >>> 0;

    return function () {

      value = (
        value * 1664525 + 1013904223
      ) >>> 0;

      return value / 4294967296;

    };

  }

  /* =====================================
     分數緩慢增加
  ===================================== */

  function animateScore(element, target) {

    if (!element) return;

    if (reduceMotion) {
      element.textContent = target;
      return;
    }

    const start = performance.now()
      + SETTINGS.startDelay;

    function update(now) {

      if (now < start) {
        requestAnimationFrame(update);
        return;
      }

      const progress = Math.min(
        (now - start) / SETTINGS.fillDuration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 2);

      element.textContent = Math.round(
        target * eased
      );

      if (progress < 1) {

        requestAnimationFrame(update);

      } else {

        element.textContent = target;

      }

    }

    requestAnimationFrame(update);

  }

  /* =====================================
     建立單顆立體寶石
  ===================================== */

  function createGem(random, colors, index) {

    const gem = document.createElement("span");

    gem.className = "magic-gem";

    const size = 9 + random() * 6;

    const rotation = -35 + random() * 70;

    gem.style.setProperty(
      "--gem-size",
      size + "px"
    );

    gem.style.setProperty(
      "--gem-rotation",
      rotation + "deg"
    );

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
      (-random() * 9).toFixed(2) + "s"
    );

    gem.style.setProperty(
      "--twinkle-duration",
      (4 + random() * 7).toFixed(2) + "s"
    );

    gem.style.zIndex = index;

    return gem;

  }

  /* =====================================
     建立寶石堆
  ===================================== */

  function buildGemPile(card, finalScore, index) {

    const glass = card.querySelector(
      ".gem-glass"
    );

    const pile = card.querySelector(
      ".gem-pile"
    );

    if (!glass || !pile) return;

    pile.innerHTML = "";

    const house = card.dataset.house;

    const colors =
      palettes[house] || palettes.ravenclaw;

    const random = seededRandom(
      2026 + index * 173 + finalScore
    );

    const glassHeight = glass.clientHeight;

    /* =====================================
       固定積分比例計算

       20,000分 = 85%高度
       超過20,000分不溢出
    ===================================== */

    const scoreRatio = Math.min(
      finalScore / SETTINGS.scoreCap,
      1
    );

    const availableHeight = Math.max(
      0,
      glassHeight - 24
    );

    const maxPileHeight = Math.min(
      glassHeight * SETTINGS.maxFillRatio,
      availableHeight
    );

    const targetHeight = finalScore <= 0
      ? 0
      : Math.max(
          8,
          scoreRatio * maxPileHeight
        );

    pile.style.height = targetHeight + "px";

    if (finalScore <= 0) return;

    /* =====================================
       寶石排列
    ===================================== */

    const pileWidth = pile.clientWidth;

    const columns = Math.max(
      5,
      Math.floor(pileWidth / 14)
    );

    const rowHeight = 12;

    const rows = Math.max(
      1,
      Math.ceil(targetHeight / rowHeight)
    );

    const maxGems = Math.max(
      1,
      Math.ceil(
        finalScore / SETTINGS.pointsPerGem
      )
    );

    const totalGems = Math.min(
      maxGems,
      columns * rows
    );

    const gems = [];

    /* =====================================
       計算寶石堆積位置
    ===================================== */

    for (let i = 0; i < totalGems; i++) {

      const gem = createGem(
        random,
        colors,
        i
      );

      const row = Math.floor(
        i / columns
      );

      const column = i % columns;

      const stagger =
        row % 2 ? 0.5 : 0;

      const x = (
        (column + stagger + 0.5) /
        columns
      ) * pileWidth;

      const jitterX =
        (random() - 0.5) * 5;

      const jitterY =
        (random() - 0.5) * 3;

      const bottom = Math.min(
        Math.max(0, targetHeight - 8),
        row * rowHeight + jitterY
      );

      gem.style.left = Math.max(
        3,
        Math.min(
          pileWidth - 8,
          x + jitterX
        )
      ) + "px";

      gem.style.bottom = Math.max(
        0,
        bottom
      ) + "px";

      pile.appendChild(gem);

      gems.push(gem);

    }

    /* =====================================
       減少動態設定
    ===================================== */

    if (reduceMotion) return;

    /* =====================================
       寶石緩慢掉落
    ===================================== */

    gems.forEach(function (gem, i) {

      const progress =
        gems.length <= 1
          ? 0
          : i / (gems.length - 1);

      const delay =
        SETTINGS.startDelay +
        progress * SETTINGS.fillDuration;

      const duration =
        SETTINGS.fallDurationMin +
        random() * (
          SETTINGS.fallDurationMax -
          SETTINGS.fallDurationMin
        );

      const fallDistance =
        glassHeight -
        parseFloat(gem.style.bottom) +
        30;

      gem.animate(
        [
          {
            transform:
              `translateY(${-fallDistance}px) rotate(-90deg) scale(0.8)`,
            opacity:0
          },
          {
            offset:0.12,
            opacity:1
          },
          {
            offset:0.8,
            transform:
              "translateY(4px) rotate(10deg) scale(1.04)",
            opacity:1
          },
          {
            offset:0.92,
            transform:
              "translateY(-3px) rotate(-4deg) scale(0.98)",
            opacity:1
          },
          {
            transform:
              "translateY(0) rotate(0deg) scale(1)",
            opacity:1
          }
        ],
        {
          duration:duration,
          delay:delay,
          easing:
            "cubic-bezier(.25,.65,.35,1)",
          fill:"backwards"
        }
      );

      /* =====================================
         落地後持續微光
      ===================================== */

      if (SETTINGS.enableAmbientGlow) {

        gem.animate(
          [
            {
              filter:"brightness(1)"
            },
            {
              filter:"brightness(1.22)"
            },
            {
              filter:"brightness(1)"
            }
          ],
          {
            duration:
              4500 + random() * 4500,
            delay:
              delay + duration,
            iterations:Infinity,
            easing:"ease-in-out"
          }
        );

      }

    });

  }

  /* =====================================
     初始化四學院
  ===================================== */

  houseCards.forEach(function (card, index) {

    const finalScore = Math.max(
      0,
      Number(card.dataset.score) || 0
    );

    const scoreNumber = card.querySelector(
      ".score-number"
    );

    buildGemPile(
      card,
      finalScore,
      index
    );

    if (scoreNumber) {

      animateScore(
        scoreNumber,
        finalScore
      );

    }

  });

});
