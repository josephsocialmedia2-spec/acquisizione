import { CONTENT } from "../../data/contentData.js";

const LS = {
  channelIndex: "tv_channel_idx",
  usedQa: "tv_used_qa",
  usedTags: "tv_used_tags"
};

const load = (k, fb) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fb; }
  catch { return fb; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export function getChannel() {
  const idx = Number(localStorage.getItem(LS.channelIndex) || 0);
  return CONTENT.channelRotation[idx % CONTENT.channelRotation.length];
}

export function advanceChannel() {
  const idx = Number(localStorage.getItem(LS.channelIndex) || 0) + 1;
  localStorage.setItem(LS.channelIndex, String(idx));
  return getChannel();
}

export function pickQa() {
  const used = new Set(load(LS.usedQa, []));
  const all = CONTENT.qaPairs;
  if (!all.length) return { id: 0, q: "Nessuna domanda caricata", a: "Aggiungi qaPairs in data/contentData.js" };

  if (used.size >= all.length) used.clear();

  const available = all.filter(x => !used.has(x.id));
  const picked = available[Math.floor(Math.random() * available.length)];

  used.add(picked.id);
  save(LS.usedQa, [...used]);
  return picked;
}

function classify(question) {
  const q = question.toLowerCase();
  for (const rule of CONTENT.routingRules) {
    if (rule.keywords.some(kw => q.includes(kw))) return rule.category;
  }
  return "realestate_core";
}

function pickUnique(pool, n, usedGlobal) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const out = [];

  for (const t of shuffled) {
    if (out.length >= n) break;
    if (!usedGlobal.has(t)) { out.push(t); usedGlobal.add(t); }
  }

  if (out.length < n) {
    for (const t of shuffled) {
      if (out.length >= n) break;
      if (!out.includes(t)) out.push(t);
    }
  }
  return out;
}

export function buildTags(question) {
  const used = new Set(load(LS.usedTags, []));
  const channel = getChannel();
  const cat = classify(question);

  const brand = CONTENT.brandTags;
  const format = CONTENT.formatTagsByChannel[channel] || [];
  const pool = CONTENT.tagPools[cat] || CONTENT.tagPools.realestate_core;

  const pickedFormat = pickUnique(format, 3, used);
  const pickedPool = pickUnique(pool, 8, used);

  save(LS.usedTags, [...used]);
  return [...new Set([...brand, ...pickedFormat, ...pickedPool])];
}

export function buildCaption(question) {
  const tags = buildTags(question);
  return `🎯 ${question}\n\nRisposta chiara, basata su mercato e dati reali.\n\n${tags.join(" ")}`;
}
