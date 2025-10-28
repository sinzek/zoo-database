import "./attractions.css";
import { Link } from "../../components/link";
import { BackgroundDots } from "../home/components/backgroundDots";
import { useState } from "react";

export default function AttractionsPage() {
  const [active, setActive] = useState("All");

  const categories = ["All", "Kids", "Hands-On", "Shows", "Tours"];

  const attractions = [
    {
      name: "Safari Tram Tour",
      img: "/images/attractions/safari-tram.webp",
      desc: "Guided ride through open-range habitats with live narration.",
      tag: "Tours",
    },
    {
      name: "Reptile Encounter",
      img: "/images/attractions/reptile-encounter.webp",
      desc: "Meet snakes and lizards up close with a keeper talk.",
      tag: "Hands-On",
    },
    {
      name: "Birds in Flight Show",
      img: "/images/attractions/birds-show.webp",
      desc: "Raptors and parrots demonstrate natural behaviors on cue.",
      tag: "Shows",
    },
    {
      name: "Kids Discovery Zone",
      img: "/images/attractions/kids-zone.webp",
      desc: "Hands-on exhibits, climbing nets, and splash pads for families.",
      tag: "Kids",
    },
    {
      name: "Aquatic Tunnel Walk",
      img: "/images/attractions/aquatic-tunnel.webp",
      desc: "Walk beneath sharks and rays in a panoramic tunnel.",
      tag: "Tours",
    },
    {
      name: "Evening Lantern Trail",
      img: "/images/attractions/lantern-trail.webp",
      desc: "Seasonal after-dark path with illuminated animal sculptures.",
      tag: "Shows",
    },
  ];

  const visible =
    active === "All"
      ? attractions
      : attractions.filter((a) => a.tag === active);

  return (
    <div className="page attractions-page">
      <div className="hero-container attractions-hero">
        <img
          className="hero-image"
          src="/images/attractions/attractions-hero.webp"
          alt="Attractions Hero"
        />
        <div className="accent-bar" />
        <h4 className="hero-pre-text">Experiences & shows</h4>
        <h1 className="hero-main-text">Attractions</h1>
        <p className="hero-sub-text">
          From keeper talks to immersive tours—find something for everyone.
        </p>
        <div className="hero-btn-list">
          <Link to="/animals" className="btn btn-green btn-lg" href="/animals">
            Animals
          </Link>
          <Link to="/" className="btn btn-outline btn-lg" href="/">
            ← Home
          </Link>
        </div>
      </div>

      <div className="bottom-wrap">
        <div className="bottom-dots left-dots" aria-hidden="true">
          <BackgroundDots />
        </div>
        <div className="bottom-dots right-dots" aria-hidden="true">
          <BackgroundDots />
        </div>

        <div className="section">
          <div className="filter-row">
            {categories.map((cat) => (
              <button
                key={cat}
                className={"filter-pill" + (active === cat ? " is-active" : "")}
                onClick={() => setActive(cat)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="attractions-grid">
            {visible.map((a) => (
              <div className="attraction-card two-col" key={a.name}>
                <div className="media-wrap">
                  <img src={a.img} alt={a.name} className="attraction-img" />
                </div>
                <div className="content-wrap">
                  <div className="eyebrow">{a.tag}</div>
                  <h3>{a.name}</h3>
                  <p>{a.desc}</p>
                  <div className="card-actions">
                    <a href="#" className="text-link">
                      Learn more →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
