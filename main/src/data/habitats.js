const habitats = [
	{
		habitatId: 'african-savanna',
		name: 'African Savanna',
		imageUrl: '/images/habitats/savanna.webp',
		description:
			'Grassy plains dotted with acacia trees. Home to lions, zebras, and giraffes.',
		extraDetails:
			'Our African Savanna exhibit recreates the wide grasslands of Africa with open views for giraffes, zebras, and antelopes. Visitors can watch lions resting on rock outcrops and observe natural behaviors in a shared space designed for animal safety and comfort.',
		climate:
			'Warm and dry with gentle breezes and open sunlight throughout the day.',

		funFact:
			'Giraffes only need about 30 minutes of sleep per day, often standing up!',
	},
	{
		habitatId: 'tropical-rainforest',
		name: 'Tropical Rainforest',
		imageUrl: '/images/habitats/rainforest.webp',
		description:
			'Dense canopy and lush greenery housing parrots, monkeys, and frogs.',
		extraDetails:
			'Step into the Rainforest Habitat, a warm, humid enclosure filled with lush plants, waterfalls, and vibrant wildlife. Guests can see colorful parrots, playful monkeys swinging through the trees, and exotic frogs in a climate-controlled environment.',
		climate:
			'Humid with daily misting to mimic tropical rainfall and 80 °F temperatures.',

		funFact:
			'More than half of all known animal species live in tropical rainforests.',
	},
	{
		habitatId: 'arctic-tundra',
		name: 'Arctic Tundra',
		imageUrl: '/images/habitats/tundra.webp',
		description:
			'Cold, windswept plains where arctic foxes and caribou thrive.',
		extraDetails:
			'The Arctic Tundra exhibit brings the chill of the polar north to the zoo. It features large rock formations, snow-like flooring, and chilled pools where animals like arctic foxes and reindeer can stay cool while visitors learn about cold-climate adaptations.',
		climate: 'Kept below 45 °F with snow machines and cool breezes.',

		funFact:
			'Arctic foxes can survive temperatures as low as −58 °F thanks to their dense fur.',
	},
	{
		habitatId: 'coastal-wetlands',
		name: 'Coastal Wetlands',
		imageUrl: '/images/habitats/wetlands.webp',
		description:
			'Shallow pools and marsh grasses supporting otters, herons, and amphibians.',
		extraDetails:
			'Our Coastal Wetlands area includes shallow ponds and flowing streams that mimic real marshes. Otters dive and play through underwater viewing windows, while herons and amphibians live among the reeds in a naturally filtered water system.',
		climate: 'Cool and humid with light mist and gentle water sounds.',

		funFact:
			'Wetlands filter pollutants and provide homes for nearly half of all bird species.',
	},
	{
		habitatId: 'mountain-highlands',
		name: 'Mountain Highlands',
		imageUrl: '/images/habitats/mountains.webp',
		description:
			'Steep cliffs and rocky slopes where snow leopards and mountain goats live.',
		extraDetails:
			'The Mountain Highlands habitat simulates a rugged alpine landscape. It has rocky cliffs for snow leopards to climb and cool shaded areas for mountain goats to graze, giving visitors a close-up view of life at high elevations.',
		climate:
			'Cool and breezy with artificial rock faces and shaded ledges.',

		funFact: 'Snow leopards can leap up to 50 feet in a single bound!',
	},
	{
		habitatId: 'coral-reef',
		name: 'Coral Reef',
		imageUrl: '/images/habitats/coralreef.webp',
		description:
			'Vibrant underwater worlds teeming with fish, coral, and sea turtles.',
		extraDetails:
			'In the Coral Reef Aquarium, guests can explore the underwater beauty of coral ecosystems through large panoramic tanks. Colorful fish, sea turtles, and living coral structures thrive in a precisely balanced saltwater environment.',
		climate:
			'Warm 78 °F water with bright reef lighting and gentle currents.',

		funFact:
			'Coral reefs cover less than 1% of the ocean but support 25% of marine life.',
	},
	{
		habitatId: 'grasslands',
		name: 'Grasslands',
		imageUrl: '/images/habitats/grasslands.webp',
		description:
			'Wide open plains with tall grasses where elephants and antelopes roam.',
		extraDetails:
			'The Grasslands exhibit offers a spacious outdoor enclosure where elephants and antelopes move freely across open plains. Elevated viewing decks let guests safely observe these large animals in a recreated natural setting.',
		climate: 'Sunny with mild winds and occasional misting for cooling.',

		funFact:
			'Elephants communicate through low-frequency rumbles that travel long distances.',
	},
	{
		habitatId: 'temperate-forest',
		name: 'Temperate Forest',
		imageUrl: '/images/habitats/forest.webp',
		description:
			'Deciduous and conifer trees with deer, bears, and diverse birdlife.',
		extraDetails:
			'Our Temperate Forest habitat features cool, shaded woodlands with dense trees and winding trails. Black bears, deer, and owls live here in carefully managed spaces designed to resemble a North American forest.',
		climate:
			'Mild temperatures with filtered sunlight and seasonal leaf color changes.',

		funFact:
			'Black bears are excellent tree climbers and can run up to 30 mph.',
	},
];

export default habitats;
