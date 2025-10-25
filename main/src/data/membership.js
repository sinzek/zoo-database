export const MEMBERSHIPS_DATA = [
  {
    title: "Family & Friends Premium",
    price: "349",
    details: "3 adults + guests",
    bestValue: true,
    image: "/images/capybara.jpg",
    link: "/membership/premium",
    id: "premium",

    fullDetails: {
      description: "Bring friends and family with you to the Zoo for free! 3 named adults for a total of up to 10 people admitted per day to the Zoo. At least one named adult must be present.",
      benefits: [
        "Kid Keeper/Nanny option allows you to send up to 6 children ages 3-12 to the Zoo with one adult caregiver when you cannot come yourself.",
        "4 single, one-time use Wildlife Carousel passes",
        "15% Zoo Store discount (some restrictions may apply)"
      ]
    }
  },
  {
    title: "Family",
    price: "239",
    details: "2 adults + 3 children",
    bestValue: false,
    image: "/images/penguin.jpg",
    link: "/membership/family",
    id: "family",

    fullDetails: {
      description: "The perfect membership for a household! Includes admission for 2 named adults and up to 3 children (ages 3-17) per visit.",
      benefits: [
        "Unlimited free admission for one year.",
        "Discounts on Zoo Camps and education programs.",
        "10% Zoo Store discount (some restrictions may apply).",
        "Reciprocal admission to over 150 AZA-accredited Zoos and Aquariums."
      ]
    }
  },
  {
    title: "Individual Plus",
    price: "169",
    details: "1 adult + 1 guest",
    bestValue: false,
    image: "/images/leopard.jpg",
    link: "/membership/individualplus",
    id: "individualplus",

    fullDetails: {
      description: "A great option for individuals who like to bring a friend. Includes admission for 1 named adult and one additional guest per visit.",
      benefits: [
        "Unlimited free admission for the named adult and one guest for one year.",
        "Invitation to Member-Only previews and events.",
        "Subscription to the quarterly member magazine.",
        "One complimentary Giraffe Feeding ticket."
      ]
    }
  },
  {
    title: "Senior 65+",
    price: "189",
    details: "2 adults + 5 children",
    bestValue: false,
    image: "/images/quail.jpg",
    link: "/membership/senior",
    id: "senior",

    fullDetails: {
      description: "A value membership for households with adults aged 65 or older. Includes admission for 2 named adults (at least one must be 65+) and up to 5 children (ages 3-17) per visit.",
      benefits: [
        "Unlimited free admission for one year.",
        "Senior-only exclusive early morning access on select days.",
        "Discounted rates on stroller and wheelchair rentals.",
        "10% discount at all Zoo food concessions."
      ]
    }
  },
  {
    title: "Flock - $190+ Donor Club",
    price: "190",
    details: "For 21+ and Young Professionals",
    bestValue: false,
    image: "/images/flamingos.jpg",
    link: "/membership/flock",
    id: "flock",

    fullDetails: {
      description: "A donor club for young professionals (ages 21+) to support the Zoo's conservation efforts. Contribution starts at $190.",
      benefits: [
        "All benefits of the 'Individual Plus' membership.",
        "Exclusive invitations to 'Flock' networking and social events.",
        "Complimentary first drink at special after-hours events.",
        "Recognition in the annual Donor Honor Roll."
      ]
    }
  },
  {
    title: "Asante Society - $1,500+ Donor Club",
    price: "1,500",
    details: "Exclusive Events, Private Animal Tour",
    bestValue: false,
    image: "/images/tiger.jpg",
    link: "/membership/asante",
    id: "asante",

    fullDetails: {
      description: "Our premier leadership giving society for patrons dedicated to advancing the Zoo’s mission. Membership begins with an annual gift of $1,500.",
      benefits: [
        "All benefits of the 'Family & Friends Premium' membership.",
        "Personalized, private, behind-the-scenes animal experience for your group (up to 6 people).",
        "Exclusive invitations to the annual Asante Society Dinner with the Zoo Director.",
        "Private Zoo entrance access during peak season.",
        "Concierge service for booking special events and programs."
      ]
    }
  }
];
