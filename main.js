(() => {
  const elLen = document.getElementById("len");
  const elLenVal = document.getElementById("lenVal");
  const elPwd = document.getElementById("pwd");

  const lower = document.getElementById("lower");
  const upper = document.getElementById("upper");
  const nums = document.getElementById("nums");
  const syms = document.getElementById("syms");

  const btnGen = document.getElementById("gen");
  const btnCopy = document.getElementById("copy");

  const label = document.getElementById("label");
  const bitsEl = document.getElementById("bits");
  const toast = document.getElementById("toast");
  const EMPTY_PASSWORD_TEXT = "Presiona Generar para crear una contrasena";
  let currentPassword = "";

  const sets = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    nums: "0123456789",
    syms: "!@#$%^&*()-_=+[]{};:,.?/|~"
  };

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 900);
  }

  function setPasswordDisplay(value) {
    currentPassword = value;
    if (value) {
      elPwd.textContent = value;
      elPwd.dataset.empty = "false";
      return;
    }
    elPwd.textContent = EMPTY_PASSWORD_TEXT;
    elPwd.dataset.empty = "true";
  }

  function buildCharset() {
    let charset = "";
    if (lower.checked) charset += sets.lower;
    if (upper.checked) charset += sets.upper;
    if (nums.checked) charset += sets.nums;
    if (syms.checked) charset += sets.syms;
    return charset;
  }

  // Entropia aproximada: bits = L * log2(|charset|)
  function estimateBits(length, charsetSize) {
    if (length <= 0 || charsetSize <= 1) return 0;
    return length * Math.log2(charsetSize);
  }

  function classify(bits) {
    if (bits < 35) return ["Debil", 0.20];
    if (bits < 55) return ["Media", 0.45];
    if (bits < 80) return ["Fuerte", 0.75];
    return ["Muy fuerte", 1.00];
  }

  function estimateCharsetSizeFromPassword(password) {
    if (!password) return 0;
    let hasLower = false;
    let hasUpper = false;
    let hasNums = false;
    let hasSyms = false;

    for (const ch of password) {
      if (!hasLower && sets.lower.includes(ch)) hasLower = true;
      else if (!hasUpper && sets.upper.includes(ch)) hasUpper = true;
      else if (!hasNums && sets.nums.includes(ch)) hasNums = true;
      else if (!hasSyms && sets.syms.includes(ch)) hasSyms = true;
    }

    let size = 0;
    if (hasLower) size += sets.lower.length;
    if (hasUpper) size += sets.upper.length;
    if (hasNums) size += sets.nums.length;
    if (hasSyms) size += sets.syms.length;
    return size;
  }

  function updateStrengthFromCurrentPassword() {
    if (!currentPassword) {
      label.textContent = "-";
      bitsEl.textContent = "0 bits";
      window.StrengthCanvas?.setStrength(0);
      return;
    }

    const charsetSize = estimateCharsetSizeFromPassword(currentPassword);
    const bits = estimateBits(currentPassword.length, charsetSize);
    const [txt, score01] = classify(bits);

    label.textContent = txt;
    bitsEl.textContent = `${Math.round(bits)} bits`;
    window.StrengthCanvas?.setStrength(score01);
  }

  function genPassword(length, charset) {
    // Si no hay charset, devolvemos vacio
    if (!charset) return "";

    const out = [];
    // crypto si esta disponible (mas "correcto"), si no Math.random
    const useCrypto = window.crypto && crypto.getRandomValues;

    if (useCrypto) {
      const buf = new Uint32Array(length);
      crypto.getRandomValues(buf);
      for (let i = 0; i < length; i++) {
        out.push(charset[buf[i] % charset.length]);
      }
    } else {
      for (let i = 0; i < length; i++) {
        out.push(charset[(Math.random() * charset.length) | 0]);
      }
    }
    return out.join("");
  }

  function update() {
    const length = Number(elLen.value);
    elLenVal.textContent = String(length);
    const min = Number(elLen.min);
    const max = Number(elLen.max);
    const percent = ((length - min) / (max - min)) * 100;
    elLen.style.setProperty("--fill", `${percent}%`);
    updateStrengthFromCurrentPassword();
  }

  btnGen.addEventListener("click", () => {
    const length = Number(elLen.value);
    const charset = buildCharset();

    if (!charset) {
      setPasswordDisplay("");
      showToast("Elegi al menos un tipo de caracteres.");
      update();
      return;
    }

    setPasswordDisplay(genPassword(length, charset));
    showToast("Contrasena generada");
    update();
  });

  btnCopy.addEventListener("click", async () => {
    if (!currentPassword) return showToast("Nada para copiar");
    try {
      await navigator.clipboard.writeText(currentPassword);
      showToast("Copiado");
    } catch {
      showToast("No se pudo copiar (permiso)");
    }
  });

  // listeners
  [elLen, lower, upper, nums, syms].forEach(el => {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  // init
  setPasswordDisplay("");
  update();
  btnGen.click();
})();
