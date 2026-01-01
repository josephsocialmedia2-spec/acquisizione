import { pickQa, buildCaption, getChannel, advanceChannel } from "./engine.js";

const preview = document.getElementById("preview");
const questionEl = document.getElementById("question");
const prompterEl = document.getElementById("prompter");
const timerEl = document.getElementById("timer");
const captionEl = document.getElementById("caption");
const libraryEl = document.getElementById("library");

const btnRec = document.getElementById("btnRec");
const btnStop = document.getElementById("btnStop");
const btnCopy = document.getElementById("btnCopy");
const btnWA = document.getElementById("btnWA");
const upload = document.getElementById("upload");

const btnHelp = document.getElementById("btnHelp");
const helpModal = document.getElementById("helpModal");
const btnCloseHelp = document.getElementById("btnCloseHelp");

let durationSec = 120;
let stream, recorder, chunks = [];
let t0 = 0, rafId = null, stopTimeout = null;
let currentQa = null;
let lastBlobUrl = null;

const takes = [];

function fmtTime(s){
  const m = String(Math.floor(s/60)).padStart(2,"0");
  const r = String(Math.floor(s%60)).padStart(2,"0");
  return `${m}:${r}`;
}

function setWhatsAppLink() {
  const phone = "393713798294";
  const text = encodeURIComponent("Invia per pubblicazione");
  btnWA.href = `https://wa.me/${phone}?text=${text}`;
}

function setActiveChannelUI() {
  const ch = getChannel();
  document.querySelectorAll(".ch").forEach(el => {
    el.classList.toggle("active", el.dataset.ch === ch);
  });
}

function renderPrompter(text){
  const words = text.split(/\s+/).filter(Boolean);
  prompterEl.innerHTML = words.map(w => `<span class="w">${escapeHtml(w)}</span>`).join(" ");
  prompterEl.dataset.wordCount = String(words.length);
  prompterEl.scrollTop = 0;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

function updateKaraokeAndScroll(progress01){
  const totalWords = Number(prompterEl.dataset.wordCount || 0);
  if (!totalWords) return;

  const idx = Math.min(totalWords-1, Math.floor(progress01 * totalWords));
  const spans = prompterEl.querySelectorAll(".w");

  spans.forEach((s, i) => s.classList.toggle("hl", i === idx));

  const active = spans[idx];
  if (active) {
    const box = prompterEl.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    const delta = (a.top - box.top) - (box.height * 0.35);
    prompterEl.scrollTop += delta * 0.08;
  }
}

function tick(){
  const elapsed = (performance.now() - t0) / 1000;
  const capped = Math.min(elapsed, durationSec);

  timerEl.textContent = `${fmtTime(capped)} / ${fmtTime(120)}`;

  const p = Math.max(0, Math.min(1, capped / durationSec));
  updateKaraokeAndScroll(p);

  rafId = requestAnimationFrame(tick);
}

async function initMedia(){
  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  preview.srcObject = stream;
}

function pickNewContent(){
  currentQa = pickQa();
  questionEl.textContent = currentQa.q;
  renderPrompter(currentQa.a);

  captionEl.value = buildCaption(currentQa.q);
  setWhatsAppLink();
  setActiveChannelUI();
}

function addTake(blob){
  if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
  const url = URL.createObjectURL(blob);
  lastBlobUrl = url;

  const item = {
    createdAt: new Date().toISOString(),
    channel: getChannel(),
    question: currentQa?.q || "",
    blob,
    url
  };
  takes.unshift(item);
  renderLibrary();
}

function renderLibrary(){
  libraryEl.innerHTML = "";
  takes.forEach((t) => {
    const card = document.createElement("div");
    card.className = "card";

    const v = document.createElement("video");
    v.src = t.url;
    v.controls = true;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<div><b>${t.channel.toUpperCase()}</b> • ${new Date(t.createdAt).toLocaleString()}</div>
                      <div>${escapeHtml(t.question)}</div>`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const dl = document.createElement("button");
    dl.className = "pill";
    dl.textContent = "Download";
    dl.onclick = () => {
      const a = document.createElement("a");
      a.href = t.url;
      a.download = `${t.channel}_${t.createdAt.replace(/[:.]/g,"-")}.webm`;
      a.click();
    };

    actions.appendChild(dl);
    card.appendChild(v);
    card.appendChild(meta);
    card.appendChild(actions);
    libraryEl.appendChild(card);
  });
}

function startRecording(){
  chunks = [];
  recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    addTake(blob);
    advanceChannel();
    pickNewContent();
  };

  recorder.start();
  btnRec.disabled = true;
  btnStop.disabled = false;

  t0 = performance.now();
  prompterEl.scrollTop = 0;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);

  stopTimeout = setTimeout(() => stopRecording(), durationSec * 1000);
}

function stopRecording(){
  if (!recorder || recorder.state !== "recording") return;

  clearTimeout(stopTimeout);
  cancelAnimationFrame(rafId);

  recorder.stop();
  btnRec.disabled = false;
  btnStop.disabled = true;

  timerEl.textContent = `00:00 / ${fmtTime(120)}`;
}

document.querySelectorAll(".pill[data-dur]").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".pill[data-dur]").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    durationSec = Number(b.dataset.dur);
  });
});

btnRec.addEventListener("click", startRecording);
btnStop.addEventListener("click", stopRecording);

btnCopy.addEventListener("click", async () => {
  await navigator.clipboard.writeText(captionEl.value);
  btnCopy.textContent = "Copiato!";
  setTimeout(() => btnCopy.textContent = "Copia", 900);
});

upload.addEventListener("change", () => {
  const f = upload.files?.[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  takes.unshift({
    createdAt: new Date().toISOString(),
    channel: getChannel(),
    question: "UPLOAD MANUALE",
    blob: f,
    url
  });
  renderLibrary();
  upload.value = "";
});

btnHelp.addEventListener("click", () => helpModal.classList.remove("hidden"));
btnCloseHelp.addEventListener("click", () => helpModal.classList.add("hidden"));

(async function main(){
  await initMedia();
  pickNewContent();
})();
