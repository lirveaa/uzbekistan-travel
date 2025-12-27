import React, { useState } from "react";
import PlacesTab from "./PlacesTab";
import LanguageTab from "./LanguageTab";
import FoodTab from "./FoodTab";
import NameGeneratorTab from "./NameGeneratorTab";
import "./App.css"; // We'll also give you a minimal App.css

/*
  Updated App.js:
  - Tiles now include inline SVG icons.
  - Tiles animate on hover and show a gentle "float" animation when active.
  - Icons are implemented as small React components (no extra dependencies).
*/

function IconPlace() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2C9.2386 2 7 4.2386 7 7c0 4.4183 5 11 5 11s5-6.5817 5-11c0-2.7614-2.2386-5-5-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="1.6" fill="currentColor"/>
    </svg>
  );
}

function IconBook() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 2H8.5A2.5 2.5 0 0 0 6 4.5v15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconFood() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 2v11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 2v11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 15c1.5 1.5 4 2.5 8 2.5s6.5-1 8-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const tiles = [
  { key: "places", label: "Places", Icon: IconPlace },
  { key: "language", label: "Learn Uzbek", Icon: IconBook },
  { key: "namegen", label: "Uzbek Name Generator", Icon: IconUser },
  { key: "food", label: "Food & Recipes", Icon: IconFood }
];

/**
 * Modern light-themed single page layout.
 * Tiles control which component appears in the "tile-content" area.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState(""); // "", "places", "language", "food", "namegen"

  function renderContent(){
    switch(activeTab){
      case "places":
        return <PlacesTab />;
      case "language":
        return <LanguageTab />;
      case "food":
        return <FoodTab />;
      case "namegen":
        return <NameGeneratorTab />;
      default:
        return <PlacesTab/>;
    }
  }

  return (
    <div className="app-container">
      <div className="container">
        <header className="site-header"> 
          <div className="brand">
            <div className="brand-mark" aria-hidden/>
            <div className="brand-text">
              <h1 ><a href="#">UzFinder Hub</a></h1>
              <p className="subtitle">Travel . Language . Food . Names</p>
            </div>
          </div>
        </header>
        <nav className="tiles" aria-label="Main sections">
          {tiles.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`tile ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
              aria-pressed={activeTab === key}
            >
              <span className="tile-icon" aria-hidden>
                <Icon />
              </span>
              <span className="tile-label">{label}</span>
            </button>
          ))}
        </nav>

        

        <main className="hero" >
          {/* <div className="hero-left">
            <ul className="city-list">
              <li>Samarkand</li>
              <li>Tashkent</li>
              <li>Khiva</li>
              <li>Other city pictures</li>
            </ul>
            <a className="learn-more" href="#about-uzb">Learn more about</a>
          </div> */}

          {/* <div
            className="hero-right"
            aria-hidden
            
          /> */}
        </main>

        <section className="tile-content">{renderContent()}</section>

     

        <footer className="footer">
          <p>© {new Date().getFullYear()} UzFinder Hub — Created By Husen Mansurov</p>
        </footer>
      </div>
    </div>
  );
}
