import React from "react";
import cities from "./data/cities.json";
import "./PlacesTab.css";
/*
  PlacesTab
  - Imports data from src/data/cities.json
  - Renders a responsive grid of city cards
  - Each card shows: image, city name, hot place, short description
  - To add more cities: edit src/data/cities.json (no code changes required)
*/

export default function PlacesTab() {
  return (
    
    <div className="places-root">
    <div className="info-bar">
              <span>About Project</span>
            </div>
            <h2>Welcome to UzFinder Hub</h2>
            <p>Explore places, learn basic Uzbek phrases, discover food, and generate Uzbek
              names — click any tile above to get started.</p>

      <h2 className="places-title">Must-Visit Cities</h2>

      <div className="places-grid" role="list">
        {cities.map((c, i) => (
          <article className="city-card" key={c.name +1} role="listitem">
            <div className="city-media">
              <img
                src={c.image}
                alt={`${c.name} - ${c.hotPlace}`}
                loading="lazy"
                className="city-img"
             />
            </div>

            <div className="city-body">
              <h3 className="city-name">{c.name}</h3>
              <p className="city-hotplace">
                <strong>Top spot: <strong/>{c.hotPlace}</strong>
              </p>
              <p className="city-desc">{c.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}