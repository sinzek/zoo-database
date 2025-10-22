import "../habitats/habitats.css";
import habitats from "../../data/habitats";
import { Link } from "../../components/link";
import { BackgroundDots } from "../home/components/backgroundDots";

function slug(s) {
  return String(s).toLowerCase().trim().replace(/\s+/g, "-");
}

export default function HabitatDetailsPage({ id }) {
  const decoded = decodeURIComponent(String(id)).toLowerCase();

  let habitat =
    habitats.find((h) => String(h.id).toLowerCase() === decoded) ||
    habitats.find((h) => slug(h.name) === decoded);

  if (!habitat) {
    return (
      <div className="page habitats-page section">
        <h2>Habitat not found</h2>
        <p>The habitat you’re looking for doesn’t exist.</p>
        <Link to="/habitats" href="/habitats" className="btn btn-outline">
          ← Back to Habitats
        </Link>
      </div>
    );
  }

  return (
    <div className="page habitats-page">
      <div className="hero-container habitat-hero">
        <img className="hero-image" src={habitat.img} alt={habitat.name} />
        <div className="accent-bar" />
        <h4 className="hero-pre-text">Habitat</h4>
        <h1 className="hero-main-text">{habitat.name}</h1>
        <p className="hero-sub-text">{habitat.desc}</p>
        <div className="hero-btn-list">
          <Link to="/habitats" href="/habitats" className="btn btn-outline">
            ← Back
          </Link>
          <Link to="/" href="/" className="btn btn-green">
            Home
          </Link>
        </div>
      </div>

      <div className="details-bottom-wrap">
        <div className="bottom-dots left-dots" aria-hidden="true">
          <BackgroundDots />
        </div>
        <div className="bottom-dots right-dots" aria-hidden="true">
          <BackgroundDots />
        </div>

        <div className="details-wrap">
          <div className="details-grid">
            <div className="details-card">
              <h2>Details</h2>
              <p>{habitat.details}</p>
            </div>

            <div className="details-card">
              <h2>Weather</h2>
              <p>{habitat.weather}</p>
            </div>

            <div className="details-card">
              <h2>Featured Animals</h2>
              <ul>
                {habitat.featuredAnimals?.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <div className="details-card">
              <h2>Fun Fact</h2>
              <p>{habitat.funFact}</p>
            </div>
          </div>

          <div className="details-footer">
            <Link to="/habitats" href="/habitats" className="btn btn-outline">
              ← Back to Habitats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
