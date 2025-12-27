import React, { use, useMemo, useState } from "react";
import phrasesData from "./data/phrases.json";
import "./LanguageTab.css";
/*
 LanguageTab
 - Loads categories from src/data/phrases.json
 - Category pills on top, search/filter, list of phrases
 - Buttons: Copy phrase, Play (TTS) - best-effort using speechSynthesis
 - To add categories or phrases: edit src/data/phrases.json
*/

function speakText(text) {
  if (!("speechSynthesis" in window)) return false;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    // try Uzbek locale; browser may not have Uzbek voice and will fallback
    utter.lang = "uz-UZ";
    window.speechSynthesis.cancel(); // cancel ongoing
    window.speechSynthesis.speak(utter);
    return true;
  } catch (e) {
    return false;
  }
}

export default function LanguageTab() {
  const [activeCategory, setActiveCategory] = useState(phrasesData[0]?.category || "");
  const [q, setQ] = useState("");

  const categories = useMemo(() => phrasesData.map((c) => c.category), []);

  const activeList = useMemo(
    () => phrasesData.find((c) => c.category === activeCategory)?.phrases || [],
    [activeCategory]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if(!term) return activeList;
    return activeList.filter(
      (p) => p.uz.toLowerCase().includes(term) ||
      (p.translit && p.translit.toLowerCase().includes(term)) ||
      (p.en && p.en.toLowerCase().includes(term))
    );
  }, [activeList, q ]);

  function handleCopy(p) {
    const text = `${p.uz}${p.translit ? " — " + p.translit : ""}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => {
          // brief feedback could be added
        },
        () => {
          // fallback
        }
      );
    }
  }

  function handlePlay(p){
    // prefer Uzbek text; if not available use transliteration or English
    const text = p.uz || p.translit || p.en || "";
    const ok = speakText(text);
    if (!ok) {
      // optional: provide visual feedback if TTS not available
      alert("Speech synthesis is not available in this browser.");
    }
  }

  return (
    <div className="lang-root">
      <div className="lang-controls">
        <div className="category-pills" role="tablist" aria-label="Phrase categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill ${cat === activeCategory ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat);
                setQ("");
              }}
              role="tab"
              aria-selected={cat === activeCategory}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <input
            type="search"
            placeholder="Search phrase, translit, or translation..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search phrases"
          />
        </div>
      </div>

      <div className="phrases-list" role="list">
        {filtered.length === 0 && <div className="empty">No phrases found.</div>}

        {filtered.map((p, i) => (
          <div className="phrase-row" key={(p.uz || p.en) + i} role="listitem">
            <div className="phrase-left">
              <div className="phrase-uz">{p.uz}</div>
              {p.translit && <div className="phrase-translit">{p.translit}</div>}
              {p.en && <div className="phrase-en">{p.en}</div>}
            </div>

            <div className="phrase-actions">
              <button
                className="btn icon"
                title="Play"
                onClick={() => handlePlay(p)}
                aria-label={`Play phrase ${p.uz}`}
              >
                ▶
              </button>
              <button
                className="btn icon"
                title="Copy"
                onClick={() => handleCopy(p)}
                aria-label={`Copy phrase ${p.uz}`}
              >
                ⧉
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}