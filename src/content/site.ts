/**
 * All site copy, links and contact details live here so the site can be
 * updated without touching components.
 *
 * Items marked TODO need real values (booking links, photos, prices,
 * timetables) before going live.
 */

export type Program = {
  slug: string;
  name: string;
  audience: string;
  summary: string;
  points: string[];
  /** Optional photo. Path in /public (e.g. "/images/academy.jpg") or an allowed remote URL. */
  image?: string;
};

export const coachesIntro =
  "All coaches are qualified, accredited, and active players, bringing both technical expertise and on-court experience to every session.";

export const coaches = [
  { name: "Arthur Lee", image: "/images/coaches/arthur-lee.jpg" },
  { name: "Apoorv Mathur", image: "/images/coaches/apoorv.jpg" },
];

export const gallery = [
  { src: "/images/gallery/courts1.jpg", alt: "Nine courts under high ceilings" },
  { src: "/images/academy/academy27jan.jpg", alt: "Academy players and coaches" },
  { src: "/images/home/home2.jpg", alt: "Players on court" },
  { src: "/images/socials/fbwall.jpg", alt: "Social players group photo" },
  { src: "/images/gallery/location-building.jpg", alt: "Brisbane Badminton building in Crestmead" },
  { src: "/images/academy/training2.jpg", alt: "Training session" },
  { src: "/images/gallery/pro-shop2.jpg", alt: "Pro shop wall of racquets and apparel" },
  { src: "/images/coaches/pavan.jpg", alt: "Coach-led drills at the net" },
];

export const site = {
  name: "Brisbane Badminton",
  tagline: "Built for badminton",
  strapline: "Play. Improve. Compete.",
  description:
    "Queensland's first dedicated badminton venue. Nine BWF-standard courts, court hire seven days a week, a coaching academy, social play and club membership in Crestmead, Brisbane.",
  url: "https://www.badmintonbrisbane.com.au",

  links: {
    // TODO: replace with the real online court-booking URL.
    /** Online court booking (YepBooking). */
    bookCourt: "https://badmintonbrisbane.yepbooking.com.au/",
    academyEnrol: "/portal/classes",
    portal: "/portal",
    // TODO: replace with the club registration form URL.
    clubJoin: "/club#join",
  },

  contact: {
    address: "39 Quilton Pl, Crestmead QLD 4132",
    addressFull: "39 Quilton Pl, Crestmead QLD 4132, Australia",
    /** Searching by business name shows the Google Business pin, name and rating. */
    mapsQuery: "Brisbane Badminton, 39 Quilton Pl, Crestmead QLD 4132",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Brisbane+Badminton+39+Quilton+Pl+Crestmead+QLD+4132",
    phones: [
      { label: "General enquiries", number: "+61433300506", display: "+61 433 300 506" },
      { label: "Academy", number: "+61433300506", display: "+61 433 300 506" },
    ],
    email: "admin@badmintonbrisbane.com.au",
    whatsapp: "+61433300506",
    whatsappDisplay: "0433 300 506",
    facebook: "https://www.facebook.com/profile.php?id=61565851985037",
    instagram: "https://www.instagram.com/brisbanebadminton/",
  },

  hours: [
    { days: "Monday – Friday", time: "10:00am – 11:00pm" },
    { days: "Saturday", time: "6:00am – 11:00pm" },
    { days: "Sunday", time: "6:00am – 9:00pm" },
  ],

  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/court-hire", label: "Court Hire" },
    { href: "/academy", label: "Academy" },
    { href: "/socials", label: "Socials" },
    { href: "/services", label: "Services" },
    { href: "/club", label: "Club" },
    { href: "/pro-shop", label: "Pro Shop" },
    { href: "/contact", label: "Contact" },
  ],

  highlights: [
    { icon: "courts", label: "9 BWF-standard courts" },
    { icon: "academy", label: "Coaching academy" },
    { icon: "award", label: "QBA-affiliated club" },
    { icon: "ticket", label: "PlayOn vouchers accepted" },
    { icon: "community", label: "Community focused" },
    { icon: "value", label: "Best-value court hire" },
  ],

  stats: [
    { value: "9", label: "BWF-standard courts" },
    { value: "7", label: "days a week" },
    { value: "100+", label: "academy members" },
    { value: "$15", label: "per hour off-peak, from" },
  ],

  courtHire: {
    points: [
      "Open 7 days a week, year-round",
      "Air-conditioned facility",
      "Queensland's highest-ceiling badminton courts",
      "Instant online booking",
      "From $15/hr off-peak",
      "Great for events, corporate badminton and school programs",
    ],
    // Weekday rates as shown on the booking system. TODO: confirm weekend and public holiday rates.
    rates: [
      { label: "Off-peak", price: "$15", unit: "per court / hour", note: "Weekdays, before 2pm" },
      { label: "Afternoon", price: "$20", unit: "per court / hour", note: "Weekdays, 2pm – 5pm" },
      { label: "Peak", price: "$25", unit: "per court / hour", note: "Weekdays, from 5pm" },
    ],
  },

  academy: {
    // TODO: add bank transfer details (account name, BSB, account number) if you accept transfers.
    paymentInstructions:
      "Pay at the front desk before your first class. Once paid, our team will mark it as paid in your portal.",
    points: [
      "Structured training programs",
      "Junior development pathway",
      "Personal and group training",
      "Skill development for all ages",
      "Individual player assessments",
      "Flexible training schedules",
    ],
    // TODO: confirm program details, ages, times and prices.
    programs: [
      {
        slug: "little-smashers",
        image: "/images/academy/little-smashers.jpg",
        name: "Little Smashers",
        audience: "Young beginners",
        summary: "A fun first step into badminton for young kids, building coordination, footwork and a love of the game.",
        points: ["Games-based learning", "Beginner friendly", "Builds coordination"],
      },
      {
        slug: "junior-squad",
        image: "/images/academy/weekly-group-training.jpg",
        name: "Weekly Group Training",
        audience: "Juniors",
        summary: "Term-based group sessions that build technique, fitness and match play along a clear development pathway.",
        points: ["Term programs", "Skill-level groups", "Regular assessments"],
      },
      {
        slug: "adult-terms",
        image: "/images/academy/adults-terms.jpg",
        name: "Adult Term Classes",
        audience: "Adults",
        summary: "Never played, or getting back into it? Learn proper grips, strokes and footwork with coaches in a relaxed setting.",
        points: ["Beginner to intermediate", "Term-based", "Social and supportive"],
      },
      {
        slug: "personal-training",
        image: "/images/academy/personal-training-2.jpg",
        name: "Personal Training",
        audience: "All levels",
        summary: "One-on-one or small-group coaching tailored to your game, from technique fixes to tournament preparation.",
        points: ["Tailored to your game", "One-on-one or small group", "Flexible times"],
      },
      {
        slug: "sparring",
        image: "/images/academy/sparring.jpg",
        name: "Sparring Sessions",
        audience: "Competitive players",
        summary: "High-intensity match practice against players at your level, with coach-led drills and feedback.",
        points: ["Match play focus", "Coach supervised", "Tournament prep"],
      },
      {
        slug: "holiday-camps",
        image: "/images/academy/kids-group-training.jpg",
        name: "School Holiday Camps",
        audience: "Juniors",
        summary: "Full or half-day camps during the school holidays. Coaching, games and plenty of court time.",
        points: ["School holidays", "All abilities", "Coaching and games"],
      },
    ] as Program[],
  },

  socials: {
    points: [
      "Open to all communities, ages and skill levels",
      "Mixed and open groups welcome",
      "Suitable for regular community bookings",
      "Professional facility with front-desk support",
    ],
    // TODO: confirm social session days, times and prices.
    sessions: [
      { name: "Friday Night League", detail: "Friendly league matches to end the week. Teams and individuals welcome." },
      { name: "Open social play", detail: "Turn up, get rotated onto courts and play with people at your level." },
      { name: "Community group bookings", detail: "Regular court blocks for clubs, cultural groups and friends." },
    ],
  },

  services: {
    restringing: [
      "Best-value restringing in Queensland",
      "Same-day and express service",
      "4-knot method",
      "Wide range of strings available",
      "Bring your own string",
    ],
    // TODO: confirm which of these services are offered.
    other: [
      { name: "Corporate events", detail: "Team-building badminton with courts, equipment and optional coaching." },
      { name: "School programs", detail: "Curriculum sport, carnivals and after-school programs at a dedicated venue." },
      { name: "Birthday parties", detail: "Court time and games for kids' parties. Ask us about packages." },
    ],
  },

  club: {
    points: [
      "QBA-affiliated club recognised by Badminton Australia",
      "Safe, structured environment for junior and adult players",
      "Access to QBA-sanctioned tournaments and competitions",
      "Eligible to compete in affiliated events across Queensland and Australia",
      "Insurance cover at QBA tournaments and affiliated clubs",
      "Pathways to state squads, coaching programs and representative teams",
    ],
  },

  faqs: [
    {
      // TODO: confirm racquet hire is offered.
      q: "Do I need to bring my own racquet?",
      a: "Bring your own if you have one. If not, ask the front desk about racquet hire.",
    },
    {
      q: "How do I book a court?",
      a: "Courts can be booked instantly online. You can also call in or message us on WhatsApp.",
    },
    {
      q: "Do you accept PlayOn vouchers?",
      a: "Yes, PlayOn vouchers are accepted. Contact us to check which programs are eligible.",
    },
    {
      q: "What should I wear?",
      a: "Comfortable sportswear and non-marking indoor court shoes. Running shoes with black soles can damage the court surface.",
    },
    {
      q: "I'm a complete beginner. Where should I start?",
      a: "Try a social session or an adult term class. Our coaches and front-desk team can point you to the right level.",
    },
  ],
} as const;

export type Site = typeof site;
