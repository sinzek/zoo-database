import "./habitats.css";
import { Link } from "../../components/link";
import { BackgroundDots } from "../home/components/backgroundDots";

export default function HabitatsPage() {
  const habitats = [
    {
      name: "African Savanna",
      img: "/images/savanna.webp",
      desc: "Grassy plains dotted with acacia trees. Home to lions, zebras, and giraffes.",
    },
    {
      name: "Tropical Rainforest",
      img: "/images/rainforest.webp",
      desc: "Dense canopy and lush greenery housing parrots, monkeys, and frogs.",
    },
    {
      name: "Arctic Tundra",
      img: "/images/tundra.webp",
      desc: "Cold, windswept plains where arctic foxes and caribou thrive.",
    },
    {
      name: "Coastal Wetlands",
      img: "/images/wetlands.webp",
      desc: "Shallow pools and marsh grasses supporting otters, herons, and amphibians.",
    },
    {
      name: "Mountain Highlands",
      img: "/images/mountains.webp",
      desc: "Steep cliffs and rocky slopes where snow leopards and mountain goats live.",
    },
    {
      name: "Coral Reef",
      img: "/images/coralreef.webp",
      desc: "Vibrant underwater worlds teeming with fish, coral, and sea turtles.",
    },
    {
      name: "Grasslands",
      img: "/images/grasslands.webp",
      desc: "Wide open plains with tall grasses where elephants and antelopes roam.",
    },
    {
      name: "Temperate Forest",
      img: "/images/forest.webp",
      desc: "Deciduous and conifer trees with deer, bears, and diverse birdlife.",
    },
  ];

  return (
    <div className="page habitats-page">
      <div className="hero-container habitat-hero">
        <img
          className="hero-image"
          src="/images/habitats-hero.webp"
          alt="Habitats Hero"
        />
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
              <div className="habitat-card" key={h.name}>
                <img src={h.img} alt={h.name} className="habitat-img" />
                <h3>{h.name}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
