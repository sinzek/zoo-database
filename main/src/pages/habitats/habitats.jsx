import "./habitats.css";
import { Link } from "../../components/link";
import { BackgroundDots } from "../home/components/backgroundDots";
import habitats from "../../data/habitats";

export default function HabitatsPage() {
  return (
    <div className="page habitats-page">
      <div className="hero-container habitat-hero">
        <img
          className="hero-image"
          src="/images/habitats/habitats-hero.webp"
          alt="Habitats Hero"
        />
        <div className="accent-bar" />
        <h4 className="hero-pre-text">Explore our environments</h4>
        <h1 className="hero-main-text">Habitats</h1>
        <p className="hero-sub-text">
          From sun-kissed savannas to misty wetlands, discover where our animals
          live and thrive.
        </p>
        <div className="hero-btn-list">
          <Link to="/animals" className="btn btn-green" href="/animals">
            Animals
          </Link>
          <Link to="/" className="btn btn-outline" href="/">
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
          <div className="habitat-grid">
            {habitats.map((h) => (
              <div className="habitat-card" key={h.id}>
                <img src={h.img} alt={h.name} className="habitat-img" />
                <h3>{h.name}</h3>
                <p>{h.desc}</p>
                <div className="card-actions">
                  <Link
                    to={`/habitats/${h.id}`}
                    href={`/habitats/${h.id}`}
                    className="text-link"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
