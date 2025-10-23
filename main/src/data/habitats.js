const habitats = [
  {
    id: "african-savanna",
    name: "African Savanna",
    img: "/images/habitats/savanna.webp",
    desc: "Grassy plains dotted with acacia trees. Home to lions, zebras, and giraffes.",
    details:
      "Our African Savanna exhibit recreates the wide grasslands of Africa with open views for giraffes, zebras, and antelopes. Visitors can watch lions resting on rock outcrops and observe natural behaviors in a shared space designed for animal safety and comfort.",
    weather:
      "Warm and dry with gentle breezes and open sunlight throughout the day.",
    featuredAnimals: ["Giraffe", "Zebra", "Lion", "Antelope"],
    funFact:
      "Giraffes only need about 30 minutes of sleep per day, often standing up!",
  },
  {
    id: "tropical-rainforest",
    name: "Tropical Rainforest",
    img: "/images/habitats/rainforest.webp",
    desc: "Dense canopy and lush greenery housing parrots, monkeys, and frogs.",
    details:
      "Step into the Rainforest Habitat, a warm, humid enclosure filled with lush plants, waterfalls, and vibrant wildlife. Guests can see colorful parrots, playful monkeys swinging through the trees, and exotic frogs in a climate-controlled environment.",
    weather:
      "Humid with daily misting to mimic tropical rainfall and 80 °F temperatures.",
    featuredAnimals: ["Capuchin Monkey", "Macaw", "Tree Frog", "Sloth"],
    funFact:
      "More than half of all known animal species live in tropical rainforests.",
  },
  {
    id: "arctic-tundra",
    name: "Arctic Tundra",
    img: "/images/habitats/tundra.webp",
    desc: "Cold, windswept plains where arctic foxes and caribou thrive.",
    details:
      "The Arctic Tundra exhibit brings the chill of the polar north to the zoo. It features large rock formations, snow-like flooring, and chilled pools where animals like arctic foxes and reindeer can stay cool while visitors learn about cold-climate adaptations.",
    weather: "Kept below 45 °F with snow machines and cool breezes.",
    featuredAnimals: ["Arctic Fox", "Reindeer", "Snowy Owl"],
    funFact:
      "Arctic foxes can survive temperatures as low as −58 °F thanks to their dense fur.",
  },
  {
    id: "coastal-wetlands",
    name: "Coastal Wetlands",
    img: "/images/habitats/wetlands.webp",
    desc: "Shallow pools and marsh grasses supporting otters, herons, and amphibians.",
    details:
      "Our Coastal Wetlands area includes shallow ponds and flowing streams that mimic real marshes. Otters dive and play through underwater viewing windows, while herons and amphibians live among the reeds in a naturally filtered water system.",
    weather: "Cool and humid with light mist and gentle water sounds.",
    featuredAnimals: ["River Otter", "Great Blue Heron", "Bullfrog"],
    funFact:
      "Wetlands filter pollutants and provide homes for nearly half of all bird species.",
  },
  {
    id: "mountain-highlands",
    name: "Mountain Highlands",
    img: "/images/habitats/mountains.webp",
    desc: "Steep cliffs and rocky slopes where snow leopards and mountain goats live.",
    details:
      "The Mountain Highlands habitat simulates a rugged alpine landscape. It has rocky cliffs for snow leopards to climb and cool shaded areas for mountain goats to graze, giving visitors a close-up view of life at high elevations.",
    weather: "Cool and breezy with artificial rock faces and shaded ledges.",
    featuredAnimals: ["Snow Leopard", "Mountain Goat", "Golden Eagle"],
    funFact: "Snow leopards can leap up to 50 feet in a single bound!",
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    img: "/images/habitats/coralreef.webp",
    desc: "Vibrant underwater worlds teeming with fish, coral, and sea turtles.",
    details:
      "In the Coral Reef Aquarium, guests can explore the underwater beauty of coral ecosystems through large panoramic tanks. Colorful fish, sea turtles, and living coral structures thrive in a precisely balanced saltwater environment.",
    weather: "Warm 78 °F water with bright reef lighting and gentle currents.",
    featuredAnimals: ["Sea Turtle", "Clownfish", "Moray Eel", "Coral"],
    funFact:
      "Coral reefs cover less than 1% of the ocean but support 25% of marine life.",
  },
  {
    id: "grasslands",
    name: "Grasslands",
    img: "/images/habitats/grasslands.webp",
    desc: "Wide open plains with tall grasses where elephants and antelopes roam.",
    details:
      "The Grasslands exhibit offers a spacious outdoor enclosure where elephants and antelopes move freely across open plains. Elevated viewing decks let guests safely observe these large animals in a recreated natural setting.",
    weather: "Sunny with mild winds and occasional misting for cooling.",
    featuredAnimals: ["Elephant", "Gazelle", "Ostrich"],
    funFact:
      "Elephants communicate through low-frequency rumbles that travel long distances.",
  },
  {
    id: "temperate-forest",
    name: "Temperate Forest",
    img: "/images/habitats/forest.webp",
    desc: "Deciduous and conifer trees with deer, bears, and diverse birdlife.",
    details:
      "Our Temperate Forest habitat features cool, shaded woodlands with dense trees and winding trails. Black bears, deer, and owls live here in carefully managed spaces designed to resemble a North American forest.",
    weather:
      "Mild temperatures with filtered sunlight and seasonal leaf color changes.",
    featuredAnimals: ["Black Bear", "White-tailed Deer", "Owl"],
    funFact:
      "Black bears are excellent tree climbers and can run up to 30 mph.",
  },
];

export default habitats;
