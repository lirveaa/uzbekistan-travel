import React, { useEffect, useState } from "react";
import "./NameGeneratorTab.css";
import { Button, Form, Row, Col, Container, OverlayTrigger, Tooltip } from "react-bootstrap";

/*
  NameGeneratorTab
  - Fetches CSV from /data/uzbek_names.csv
  - Parses rows into objects { name, gender, meaning_keywords: [], vibe_keywords: [] }
  - Form inputs: your_name, your_MBTI, your_fav_color, your_fav_num, your_gender
  - Generation logic:
      * filter by gender if specified
      * map favorite color -> associated vibes (color_vibe_map)
      * prefer names that match those vibes
      * deterministic selection using a simple string hash of inputs
  - Fallbacks and helpful messages included
*/

// Utility: simple deterministic hash -> integer
function hashStringToInt(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// CSV parsing heuristic:
// Header expected: name,gender,meaning_keywords,vibe_keywords
// But your CSV rows may contain variable number of comma-separated keyword columns.
// Heuristic used:
// - split line by comma
// - name = parts[0], gender = parts[1]
// - meaning_keywords = parts[2] (as single string -> array of trimmed words)
// - vibe_keywords = parts.slice(3) (everything after index 2)
function parseNamesCsv(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // detect header & start from next line if first line looks like header
  const header = lines[0].toLowerCase();
  const dataLines = header.startsWith("name,") ? lines.slice(1) : lines;

  const rows = [];
  dataLines.forEach((line) => {
    // Some CSV lines may have commas inside fields (rare for your simple file).
    // We'll do a simple split — this works for your provided dataset shape.
    const parts = line.split(",").map(p => p.trim()).filter(() => true);
    if (parts.length < 2) return; // skip malformed

    const name = parts[0];
    const gender = (parts[1] || "").toLowerCase();

    // meaning_keywords: try to parse parts[2] as comma/semicolon-separated keywords (if exists)
    let meaning_keywords = [];
    if (parts.length >= 3) {
      // If the 3rd field itself contains multiple keywords (rare in your sample), split on semicolon or pipe.
      meaning_keywords = parts[2]
        .split(/;|\|/)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      // If that produced only one keyword but there are more parts remaining,
      // assume the remaining parts are vibe keywords (common pattern in your CSV)
    }

    // vibe_keywords: everything after index 2 are treated as vibes
    let vibe_keywords = [];
    if (parts.length > 3) {
      vibe_keywords = parts.slice(3).map(s => s.trim().toLowerCase()).filter(Boolean);
    } else {
      // attempt to parse the 3rd field for multiple comma-separated vibes if meaning_keywords appears empty
      if (meaning_keywords.length <= 1 && parts.length === 3) {
        // maybe 3rd field contained "a,b,c" — try splitting by comma inside it
        const possible = parts[2].split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
        if (possible.length > 1) {
          // take the first as meaning keyword, rest as vibes
          meaning_keywords = possible.slice(0, 1);
          vibe_keywords = possible.slice(1);
        }
      }
    }

    // final normalization: ensure arrays, dedupe
    meaning_keywords = Array.from(new Set((meaning_keywords || []).map(s => s.toLowerCase())));
    vibe_keywords = Array.from(new Set((vibe_keywords || []).map(s => s.toLowerCase())));

    rows.push({
      name,
      gender,
      meaning_keywords,
      vibe_keywords
    });
  });

  return rows;
}

// Color -> vibes mapping (same idea as your Django code)
const colorVibeMap = {
  blue: ["calm", "peaceful", "deep"],
  green: ["vibrant", "natural", "growth"],
  red: ["strong", "brave", "passionate"],
  yellow: ["bright", "happy", "optimistic"],
  purple: ["royal", "mysterious", "elegant"],
  black: ["dark", "mysterious", "strong"],
  white: ["pure", "bright", "peaceful"],
  gold: ["golden", "precious", "vibrant"],
  pink: ["gentle", "charming", "beautiful"],
  orange: ["vibrant", "energetic", "bright"],
  brown: ["resilient", "strong", "earthy"],
  silver: ["elegant", "bright", "precious"],
};

export default function NameGeneratorTab() {
  const [namesData, setNamesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Form state
  const [yourName, setYourName] = useState("");
  const [yourMBTI, setYourMBTI] = useState("");
  const [yourFavColor, setYourFavColor] = useState("");
  const [yourFavNum, setYourFavNum] = useState("");
  const [yourGender, setYourGender] = useState(""); // "male" | "female" | ""

  // Result
  const [result, setResult] = useState(null);
  const [showBrowse, setShowBrowse] = useState(false);

  useEffect(() => {
    // fetch CSV from public/data/uzbek_names.csv
    async function loadCsv() {
      setLoading(true);
      try {
        const res = await fetch("/data/uzbek_names.csv");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const txt = await res.text();
        const parsed = parseNamesCsv(txt);
        setNamesData(parsed);
        setLoadError(null);
      } catch (err) {
        console.error("Failed to load CSV:", err);
        setLoadError("Could not load names CSV. Make sure file is at public/data/uzbek_names.csv");
        setNamesData([]);
      } finally {
        setLoading(false);
      }
    }
    loadCsv();
  }, []);

  function generateName(e) {
    e && e.preventDefault();

    if (!namesData || namesData.length === 0) {
      setResult({ error: "No names loaded." });
      return;
    }

    // start with a copy
    let possible = [...namesData];

    // 1. Filter by gender
    if (yourGender && (yourGender === "male" || yourGender === "female")) {
      possible = possible.filter(n => (n.gender || "").toLowerCase() === yourGender.toLowerCase());
    }

    if (possible.length === 0) {
      setResult({ error: "No names match the selected gender." });
      return;
    }

    // 2. Color -> vibes priority
    const color = (yourFavColor || "").toLowerCase().trim();
    const colorAssociatedVibes = colorVibeMap[color] || [];

    if (colorAssociatedVibes.length > 0) {
      const colorFiltered = possible.filter(n =>
        (n.vibe_keywords || []).some(v => colorAssociatedVibes.includes(v))
      );
      if (colorFiltered.length > 0) {
        possible = colorFiltered;
      }
    }

    // 3. Optional: We could also use MBTI to prefer meanings/vibes — not implemented here (simple)
    // 4. Deterministic selection using hash of inputs (so same inputs -> same name)
    const seedString = `${yourName || ""}|${yourMBTI || ""}|${yourFavColor || ""}|${yourFavNum || ""}|${yourGender || ""}`;
    const seed = hashStringToInt(seedString);
    const selected = possible[seed % possible.length];

    setResult({
      generated_name: selected.name,
      generated_meaning: (selected.meaning_keywords || []).map(s => capitalize(s)).join(", "),
      selected_obj: selected,
      pool_size: possible.length
    });
  }

  function clearForm() {
    setYourName("");
    setYourMBTI("");
    setYourFavColor("");
    setYourFavNum("");
    setYourGender("");
    //setResult(null);
  }


  function capitalize(s) {
    if (!s) return "";
    return s[0].toUpperCase() + s.slice(1);
  }

  function copyName() {
    if (!result?.generated_name) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(result.generated_name);
    }
  }

  return (
    <div className="namegen-root">
      <h2>Uzbek Name Generator</h2>

      <div className="namegen-grid">
        <Form className="namegen-form" onSubmit={generateName}>
          <Form.Group>
            <Form.Label>Your name</Form.Label>
            <Form.Control 
              type="text"
              value={yourName} 
              onChange={e => setYourName(e.target.value)} 
              placeholder="Your name (used as seed)" 
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>MBTI (optional)</Form.Label>
            <Form.Control 
              type="text"
              value={yourMBTI} 
              onChange={e => setYourMBTI(e.target.value)} 
              placeholder="e.g. INFP" 
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Favorite color (optional)</Form.Label>
            <Form.Control 
              type="text"
              value={yourFavColor} 
              onChange={e => setYourFavColor(e.target.value)} 
              placeholder="blue, red, green..." 
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Favorite number (optional)</Form.Label>
            <Form.Control 
              type="text"
              value={yourFavNum}
              onChange={e => setYourFavNum(e.target.value)} 
              placeholder="e.g. 7" 
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Preferred gender (optional)</Form.Label>
            <Form.Select 
              value={yourGender} 
              onChange={e => setYourGender(e.target.value)}
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Form.Select>
          </Form.Group>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Loading..." : "Generate"}
            </Button>
            <Button variant="secondary" onClick={() => {
              //setYourName(prev => prev ? prev : "visitor");
              //generateName();
              clearForm();
            }}>
              Clear
            </Button>
          </div>
        </Form>

        <div className="namegen-result">
          <div className="result-card">
          {loadError && <div className="error">{loadError}</div>}
          {!loadError && loading && <div className="muted">Loading names...</div>}

          {!loading && !loadError && (
            <>
            {!result && <div className="muted">Fill the form and click Generate to get a name.</div>}

            {result && result.error && <div className="error">{result.error}</div>}

            {result && result.generated_name && (
              <>
              <div className="generated-name">{result.generated_name}</div>
              <div className="generated-meaning"><strong>Meaning:</strong> {result.generated_meaning || "N/A"}</div>

              <div className="result-meta">
                {/* <div>Pool size: {result.pool_size}</div> */}
                    <div className="result-actions">
                      <button className="btn" onClick={copyName}>Copy</button>
                      <button className="btn" onClick={() => {
                        // try another deterministic variation by altering favnum
                        const altSeed = String((parseInt(yourFavNum || "0") + 1));
                        setYourFavNum(altSeed);
                        // regenerate with new state
                        setTimeout(generateName, 0);
                      }}>Next</button>
                    </div>
                  </div>

                  {result.selected_obj && (
                    <div className="selected-details">
                      <div><strong>Vibe keywords:</strong> {(result.selected_obj.vibe_keywords || []).join(", ") || "N/A"}</div>
                      <div><strong>Meaning keywords:</strong> {(result.selected_obj.meaning_keywords || []).join(", ") || "N/A"}</div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      </div>

      {namesData.length > 0 && (
        <>
          <div className="browse-toggle">
            <button 
              className="btn primary" 
              onClick={() => setShowBrowse(!showBrowse)}
            >
              {showBrowse ? "Hide Browse Names" : "Browse Names"}
            </button>
          </div>
          
          {showBrowse && <BrowseNamesByLetter namesData={namesData} />}
        </>
      )}
    </div>
  );
}

// Simple browser by first letter of the name
function BrowseNamesByLetter({ namesData }) {
  const [activeLetter, setActiveLetter] = useState("");

  const letters = Array.from(
    new Set(
      (namesData || [])
        .map((n) => (n.name || "").toUpperCase().charAt(0))
        .filter(Boolean)
    )
  ).sort();

  const filtered = (namesData || []).filter((n) => {
    if (!activeLetter) return true;
    return (n.name || "").toUpperCase().startsWith(activeLetter);
  });

  return (
    <div className="browse-by-letter">
      <div className="browse-header">
        <h4>Browse Names ({filtered.length})</h4>
        <p className="text-muted">Click a letter to filter names</p>
      </div>
      
      <div className="letters">
        <Button
          variant={activeLetter === "" ? "primary" : "outline-secondary"}
          size="sm"
          className="me-1 mb-1"
          onClick={() => setActiveLetter("")}
          title="Show all names"
        >
          All
        </Button>
        {letters.map((l) => (
          <Button
            key={l}
            variant={activeLetter === l ? "primary" : "outline-secondary"}
            size="sm"
            className="me-1 mb-1"
            onClick={() => setActiveLetter(l)}
            title={`Names starting with ${l}`}
          >
            {l}
          </Button>
        ))}
      </div>

      <div className="names-list-container mt-3">
        {filtered.length === 0 ? (
          <div className="alert alert-info">No names found for letter "{activeLetter}"</div>
        ) : (
          <>
            {filtered.length > 200 && (
              <div className="alert alert-warning">
                Showing first 200 of {filtered.length} names
              </div>
            )}
            <ul className="list-group">
              {filtered.slice(0, 200).map((n, idx) => {
                const meaningText = (n.meaning_keywords || []).join(", ") || "No meaning available";
                const vibeText = (n.vibe_keywords || []).join(", ") || "No vibes";
                const tooltipContent = (
                  <div className="text-start">
                    <strong>Meaning:</strong> {meaningText}<br />
                    <strong>Vibes:</strong> {vibeText}
                  </div>
                );

                return (
                  <OverlayTrigger
                    key={`${n.name}-${idx}`}
                    placement="top"
                    overlay={<Tooltip id={`tooltip-${idx}`}>{tooltipContent}</Tooltip>}
                  >
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold">{n.name}</span>
                        <span className="badge bg-secondary ms-2">
                          {n.gender === "male" ? "♂ Male" : n.gender === "female" ? "♀ Female" : ""}
                        </span>
                      </div>
                      {n.meaning_keywords && n.meaning_keywords.length > 0 && (
                        <span className="text-muted small">{n.meaning_keywords[0]}</span>
                      )}
                    </li>
                  </OverlayTrigger>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}