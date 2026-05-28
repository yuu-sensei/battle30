(() => {
  const $ = (s) => document.querySelector(s);
  const startAudio = new Audio("start.mp3");
  const endAudio = new Audio("end.mp3");
  const bgm = new Audio("bgm.mp3");

  let remaining = 30;
  let intervalId = null;

  // --- Audio Context でビープ音生成 ---
  function playBeep(freq, duration) {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + duration);
    } catch (e) {}
  }

  // --- 画面切り替え ---
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(`#${id}`).classList.add("active");
  }

  // --- スタートボタン ---
  $("#btn-start").addEventListener("click", startCountdown);
  $("#btn-again").addEventListener("click", () => {
    showScreen("ready-screen");
  });

  function startCountdown() {
    remaining = 30;
    $("#count-number").textContent = "30";
    $("#count-number").className = "count-number";
    $("#count-bar").style.width = "100%";

    showScreen("countdown-screen");

    // 開始ゴング → BGM開始
    startAudio.currentTime = 0;
    startAudio.play().catch(() => {});

    // ゴングの後にBGM開始（0.8秒後）
    setTimeout(() => {
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
    }, 800);

    // カウントダウン開始
    intervalId = setInterval(() => {
      remaining--;

      // 表示更新
      $("#count-number").textContent = String(remaining);

      // プログレスバー
      $("#count-bar").style.width = ((remaining / 30) * 100) + "%";

      // ラスト5秒: ビープ + 赤く点滅
      if (remaining <= 5 && remaining > 0) {
        $("#count-number").className = "count-number last5";
        playBeep(1000, 0.15);
        // アニメーションリセット
        void $("#count-number").offsetWidth;
        $("#count-number").className = "count-number last5";
      }

      // 終了
      if (remaining <= 0) {
        clearInterval(intervalId);

        // BGM を即停止
        bgm.pause();
        bgm.currentTime = 0;

        // 0 を表示
        $("#count-number").textContent = "0";
        $("#count-number").className = "count-number last5";

        // 少し間を空けてから終了ゴングを確実に再生
        setTimeout(() => {
          endAudio.currentTime = 0;
          endAudio.volume = 1.0;
          endAudio.play().catch(() => {});
        }, 200);

        // TIME UP 画面はゴングが鳴ってから表示
        setTimeout(() => {
          showScreen("done-screen");
        }, 2000);
      }
    }, 1000);
  }

  // --- Service Worker ---
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
