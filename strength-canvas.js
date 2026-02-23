(() => {
  const canvas = document.getElementById("meterCanvas");
  const ctx = canvas?.getContext("2d");
  let score01 = 0;

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function getLevel(score) {
    if (score < 0.25) return { text: "Debil", light: "red" };
    if (score < 0.5) return { text: "Media", light: "yellow" };
    if (score < 0.75) return { text: "Fuerte", light: "green" };
    return { text: "Muy fuerte", light: "green" };
  }

  function resize() {
    if (!canvas || !ctx) return { w: 0, h: 0 };
    const w = Math.max(1, Math.round(canvas.clientWidth || canvas.width));
    const h = Math.max(1, Math.round(canvas.clientHeight || canvas.height));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { w, h };
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function drawLight(cx, cy, r, color, active) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = active ? color : "rgba(255,255,255,0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function draw() {
    if (!canvas || !ctx) return;
    const { w, h } = resize();
    const level = getLevel(score01);

    ctx.clearRect(0, 0, w, h);

    const bodyW = Math.min(120, w * 0.35);
    const bodyH = Math.min(180, h * 0.8);
    const bodyX = (w - bodyW) / 2;
    const bodyY = Math.max(6, (h - bodyH) / 2 - 6);

    roundRect(bodyX, bodyY, bodyW, bodyH, 18);
    ctx.fillStyle = "rgba(20,28,26,0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(234,255,234,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const cx = w / 2;
    const r = Math.min(18, bodyW * 0.22);
    const y1 = bodyY + bodyH * 0.24;
    const y2 = bodyY + bodyH * 0.5;
    const y3 = bodyY + bodyH * 0.76;

    drawLight(cx, y1, r, "#ff4d4d", level.light === "red");
    drawLight(cx, y2, r, "#ffb547", level.light === "yellow");
    drawLight(cx, y3, r, "#5aff8c", level.light === "green");

    ctx.fillStyle = "rgba(234,255,234,0.78)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "13px ui-monospace, Menlo, Consolas, monospace";
    ctx.fillText(level.text, w / 2, h - 12);
  }

  function setStrength(nextScore) {
    score01 = clamp01(nextScore);
    draw();
  }

  window.addEventListener("resize", draw);
  draw();
  window.StrengthCanvas = { setStrength };
})();
