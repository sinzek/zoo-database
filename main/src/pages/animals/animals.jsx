import "./animals.css";
import { Link } from "../../components/link";
import { BackgroundDots } from "../home/components/backgroundDots";

const animals = [
  {
    id: "lion",
    name: "African Lion",
    img: "/images/animals/lion.jpg",
    desc: "Powerful apex predator of the savanna.",
  },
  {
    id: "tiger",
    name: "Bengal Tiger",
    img: "/images/animals/tiger.jpg",
    desc: "Stealthy striped cat native to the Indian subcontinent.",
  },
  {
    id: "cheetah",
    name: "Cheetah",
    img: "/images/animals/cheetah.jpg",
    desc: "Fastest land animal with incredible acceleration.",
  },
  {
    id: "jaguar",
    name: "Jaguar",
    img: "/images/animals/jaguar.jpg",
    desc: "Robust big cat known for its powerful bite.",
  },
  {
    id: "leopard",
    name: "Leopard",
    img: "/images/animals/leopard.jpg",
    desc: "Adaptable climber with iconic rosettes.",
  },
  {
    id: "elephant",
    name: "African Elephant",
    img: "/images/animals/elephant.jpg",
    desc: "Largest land mammal with complex social lives.",
  },
  {
    id: "giraffe",
    name: "Giraffe",
    img: "/images/animals/giraffe.jpg",
    desc: "Tallest animal, using long necks to browse treetops.",
  },
  {
    id: "zebra",
    name: "Plains Zebra",
    img: "/images/animals/zebra.jpg",
    desc: "Striped grazers with strong herd behavior.",
  },
  {
    id: "rhino",
    name: "White Rhinoceros",
    img: "/images/animals/rhino.jpg",
    desc: "Massive herbivore with a square lip for grazing.",
  },
  {
    id: "hippo",
    name: "Hippopotamus",
    img: "/images/animals/hippo.jpg",
    desc: "Semi-aquatic heavyweight of African rivers.",
  },
  {
    id: "gorilla",
    name: "Western Lowland Gorilla",
    img: "/images/animals/gorilla.jpg",
    desc: "Gentle giants with tight family groups.",
  },
  {
    id: "chimpanzee",
    name: "Chimpanzee",
    img: "/images/animals/chimpanzee.jpg",
    desc: "Highly intelligent great ape with tool use.",
  },
  {
    id: "orangutan",
    name: "Bornean Orangutan",
    img: "/images/animals/orangutan.jpg",
    desc: "Solitary arboreal ape of Southeast Asia.",
  },
  {
    id: "red-panda",
    name: "Red Panda",
    img: "/images/animals/red-panda.jpg",
    desc: "Shy, tree-dwelling bamboo specialist.",
  },
  {
    id: "sloth",
    name: "Two-toed Sloth",
    img: "/images/animals/sloth.jpg",
    desc: "Deliberately slow canopy dweller.",
  },
  {
    id: "meerkat",
    name: "Meerkat",
    img: "/images/animals/meerkat.jpg",
    desc: "Alert sentinels of the Kalahari.",
  },
  {
    id: "kangaroo",
    name: "Red Kangaroo",
    img: "/images/animals/kangaroo.jpg",
    desc: "Marsupial powerhouse with epic hops.",
  },
  {
    id: "koala",
    name: "Koala",
    img: "/images/animals/koala.jpg",
    desc: "Eucalyptus-eating tree specialist.",
  },
  {
    id: "penguin",
    name: "Humboldt Penguin",
    img: "/images/animals/penguin.jpg",
    desc: "Charismatic coastal diver from South America.",
  },
  {
    id: "polar-bear",
    name: "Polar Bear",
    img: "/images/animals/polar-bear.jpg",
    desc: "Arctic apex predator and strong swimmer.",
  },
  {
    id: "flamingo",
    name: "Greater Flamingo",
    img: "/images/animals/flamingo.jpg",
    desc: "Iconic wader with pink plumage.",
  },
  {
    id: "eagle",
    name: "Bald Eagle",
    img: "/images/animals/eagle.jpg",
    desc: "Majestic raptor with a massive wingspan.",
  },
  {
    id: "owl",
    name: "Great Horned Owl",
    img: "/images/animals/owl.jpg",
    desc: "Nocturnal hunter with piercing gaze.",
  },
  {
    id: "crocodile",
    name: "Nile Crocodile",
    img: "/images/animals/crocodile.jpg",
    desc: "Armored ambush predator of waterways.",
  },
  {
    id: "tortoise",
    name: "Aldabra Giant Tortoise",
    img: "/images/animals/tortoise.jpg",
    desc: "Long-lived grazer with a domed shell.",
  },
  {
    id: "boa",
    name: "Boa Constrictor",
    img: "/images/animals/boa.jpg",
    desc: "Muscular snake that subdues by constriction.",
  },
  {
    id: "lemur",
    name: "Ring-tailed Lemur",
    img: "/images/animals/lemur.jpg",
    desc: "Social primate endemic to Madagascar.",
  },
  {
    id: "ant",
    name: "Leafcutter Ant",
    img: "/images/animals/ant.jpg",
    desc: "Remarkable farmers that cultivate fungus gardens.",
  },
];

export default function AnimalsPage() {
  return (
    <div className="page animals-page">
      <div className="hero-container animal-hero">
        <img
          className="hero-image"
          src="/images/animals/animals-hero.webp"
          alt="Animals Hero"
        />
        <div className="accent-bar" />
        <h4 className="hero-pre-text">Meet our residents</h4>
        <h1 className="hero-main-text">Animals</h1>
        <p className="hero-sub-text">
          Lions, lemurs, and leafcutter ants — browse the species that call our
          zoo home.
        </p>
        <div className="hero-btn-list">
          <Link to="/habitats" href="/habitats" className="btn btn-green">
            Habitats
          </Link>
          <Link to="/" href="/" className="btn btn-outline">
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
          <div className="animal-grid">
            {animals.map((a) => (
              <div className="animal-card" key={a.id}>
                <img
                  src={a.img}
                  alt={a.name}
                  className="animal-img"
                  onError={(e) => {
                    e.currentTarget.src = "/images/animals/placeholder.jpg";
                  }}
                />
                <h3>{a.name}</h3>
                <p>{a.desc}</p>
                <div className="card-actions">
                  <Link
                    to={`/animals/${a.id}`}
                    href={`/animals/${a.id}`}
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
