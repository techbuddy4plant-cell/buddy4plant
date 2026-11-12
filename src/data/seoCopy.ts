/**
 * Buddy4Plant search-engine wording (titles + meta descriptions) - ONE place for all of it.
 * Used by scripts/generate-seo.ts (what Google gets in the HTML) and by the pages themselves
 * (what the browser tab shows), so the two always match.
 *
 * Keyword plan (Lucknow-first, then Kanpur / Uttar Pradesh / Delhi / India):
 *  - shop:     "buy plants online in Lucknow", "plant nursery in Lucknow", "indoor plants online",
 *              "<category> online in Lucknow", "plants home delivery Lucknow", "pots and planters online"
 *  - services: "landscaping company in Lucknow", "gardening services Lucknow", "garden maintenance / AMC",
 *              "garden design", "vertical garden", "Miyawaki plantation", "Kanpur", "Uttar Pradesh", "Delhi"
 *  - gifting:  "corporate plant gifting Lucknow", "plant gifts online", "Diwali plant gifts"
 *  - local:    "plant nursery near me", "nursery in Vikas Nagar Lucknow"
 * Titles stay under ~60 characters where possible, descriptions under ~158.
 */

export const BRAND = 'Buddy4Plant';

export const HOME_SEO = {
  title: 'Buddy4Plant: Plant Nursery & Landscaping in Lucknow | Buy Plants Online',
  description:
    'Buy indoor & outdoor plants, pots, soil and plant food online from Buddy4Plant, a plant nursery in Lucknow. Home delivery, plus landscaping & garden AMC in UP.',
};

export const ALL_PLANTS_SEO = {
  title: 'Buy Plants Online in Lucknow | Plant Nursery Home Delivery',
  description:
    'Buy healthy indoor, outdoor, flowering, fruit and XL plants online from our Lucknow nursery. Home delivery in Lucknow and Kanpur, shipping across India.',
};

export const COLLECTIONS_SEO = {
  title: 'Shop Plants, Pots & Gardening Supplies Online | Buddy4Plant',
  description:
    'Shop all Buddy4Plant collections: indoor plants, pots and planters, soil, fertilisers, pest control, garden tools and gift packs, delivered from Lucknow.',
};

/** title + description per category slug (keyword-first). Unknown slugs fall back to a generic pattern. */
const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  'indoor-plants': {
    title: 'Buy Indoor Plants Online in Lucknow | Plants for Home & Office',
    description: 'Indoor plants for home and office: money plant, snake plant, peace lily, ZZ and more from our Lucknow nursery. Easy care, home delivery across Lucknow & India.',
  },
  'air-purifying': {
    title: 'Air Purifying Plants Online in Lucknow | Buddy4Plant',
    description: 'Buy air purifying plants like snake plant, areca palm and peace lily online. Healthy plants from a Lucknow nursery, delivered to your home.',
  },
  'low-maintenance': {
    title: 'Low Maintenance Plants Online | Easy Plants for Beginners',
    description: 'Hard-to-kill, low maintenance plants for beginners and busy people. Buy easy indoor plants online from Buddy4Plant, Lucknow, with home delivery.',
  },
  'cacti-succulents': {
    title: 'Buy Succulents & Cactus Plants Online in Lucknow',
    description: 'Succulents and cactus plants in stylish pots for desks, windowsills and balconies. Buy online from Buddy4Plant nursery, Lucknow.',
  },
  'flowering-plants': {
    title: 'Flowering Plants Online in Lucknow | Balcony & Garden Flowers',
    description: 'Buy flowering plants online: hibiscus, jasmine, rose, bougainvillea and seasonal flowers for balconies and gardens, from our Lucknow plant nursery.',
  },
  'hanging-plants': {
    title: 'Hanging Plants Online | Trailing Plants for Balcony & Home',
    description: 'Hanging and trailing plants like pothos, string of pearls and ferns for baskets, balconies and shelves. Buy online from Buddy4Plant, Lucknow.',
  },
  'pet-friendly': {
    title: 'Pet Friendly Plants Online | Safe Plants for Cats & Dogs',
    description: 'Non-toxic, pet friendly indoor plants that are safe around cats and dogs. Buy online from Buddy4Plant nursery in Lucknow with home delivery.',
  },
  'pots-planters': {
    title: 'Buy Pots & Planters Online in Lucknow | Ceramic, Plastic, Hanging',
    description: 'Ceramic pots, plastic planters, self-watering pots, hanging planters and plant stands for home and garden. Buy pots online from Buddy4Plant, Lucknow.',
  },
  'plant-care': {
    title: 'Plant Care Products Online | Soil, Fertiliser & Pest Control',
    description: 'Potting mix, vermicompost, organic fertilisers, neem oil and pest sprays for healthy plants. Buy plant care products online from Buddy4Plant, Lucknow.',
  },
  combos: {
    title: 'Plant Gift Combos Online | Plant Gift Packs | Buddy4Plant',
    description: 'Plant combos and gift packs in premium pots for birthdays, housewarmings and festivals. Order plant gifts online from Buddy4Plant, Lucknow.',
  },
  'outdoor-shrubs': {
    title: 'Outdoor Plants & Shrubs Online in Lucknow | Garden Plants',
    description: 'Hardy outdoor plants and shrubs for gardens, hedges, balconies and terraces. Buy garden plants online from our Lucknow nursery.',
  },
  'xl-plants': {
    title: 'Big Indoor Plants Online in Lucknow | Large & Tall XL Plants',
    description: 'Large and tall statement plants (3-6 ft) for living rooms, offices and lobbies. Buy big indoor plants online from Buddy4Plant nursery, Lucknow.',
  },
  'plant-bundles': {
    title: 'Plant Bundles Online | Sets of Indoor Plants at Best Price',
    description: 'Sets of 2, 3 and 6 easy indoor plants at a better price - perfect for new homes and offices. Buy plant bundles online from Buddy4Plant, Lucknow.',
  },
  'low-light-plants': {
    title: 'Low Light Indoor Plants Online | Plants for Rooms Without Sun',
    description: 'Plants that grow well in low light and away from windows: snake plant, ZZ, pothos and more. Buy low light plants online from Buddy4Plant, Lucknow.',
  },
  'fruit-plants': {
    title: 'Buy Fruit Plants Online in Lucknow | Grafted Fruit Plants',
    description: 'Grafted fruit plants for terrace and garden: mango, lemon, guava, chikoo and more in grow bags. Buy fruit plants online from our Lucknow nursery.',
  },
  'ceramic-pots': {
    title: 'Ceramic Pots Online in Lucknow | Designer Ceramic Planters',
    description: 'Glazed designer ceramic pots and planters for tables, shelves and living rooms. Buy ceramic pots online from Buddy4Plant, Lucknow.',
  },
  'plastic-pots': {
    title: 'Plastic Pots & Planters Online | Lightweight Garden Pots',
    description: 'Strong, lightweight plastic pots and planters with drainage holes for home and garden. Buy plastic pots online from Buddy4Plant, Lucknow.',
  },
  'hanging-planters': {
    title: 'Hanging Planters & Baskets Online | Balcony Hanging Pots',
    description: 'Hanging planters, pots and baskets for balconies, windows and ceilings. Buy hanging planters online from Buddy4Plant, Lucknow.',
  },
  'planter-stands': {
    title: 'Plant Stands Online | Metal & Wooden Planter Stands',
    description: 'Metal and wooden plant stands to display your plants at different heights. Buy planter stands online from Buddy4Plant, Lucknow.',
  },
  fertilizers: {
    title: 'Organic Fertilisers & Plant Food Online | Vermicompost',
    description: 'Organic fertilisers, vermicompost, bone meal and plant food for strong growth and more flowers. Buy online from Buddy4Plant nursery, Lucknow.',
  },
  'potting-soil': {
    title: 'Potting Soil & Potting Mix Online | Cocopeat, Compost',
    description: 'Ready potting mix, garden soil, cocopeat and compost for pots and garden beds. Buy potting soil online from Buddy4Plant, Lucknow.',
  },
  'pest-control': {
    title: 'Plant Pest Control Online | Neem Oil & Organic Sprays',
    description: 'Neem oil and organic pest control sprays for mealybugs, aphids, fungus and other plant pests. Buy online from Buddy4Plant, Lucknow.',
  },
  'garden-tools': {
    title: 'Garden Tools Online | Gardening Tool Kits | Buddy4Plant',
    description: 'Gardening tools for home gardeners: trowels, pruners, cultivators and tool kits. Buy garden tools online from Buddy4Plant, Lucknow.',
  },
  'watering-tools': {
    title: 'Watering Cans, Sprayers & Garden Watering Tools Online',
    description: 'Watering cans, spray bottles, sprinklers and self-watering solutions for plants. Buy watering tools online from Buddy4Plant, Lucknow.',
  },
  'garden-decor': {
    title: 'Garden Decor Online | Balcony & Garden Decoration Items',
    description: 'Garden decor and balcony decoration items to finish your green corner. Buy garden decor online from Buddy4Plant, Lucknow.',
  },
};

export function categorySeo(slug: string, name: string, description?: string) {
  const c = CATEGORY_SEO[slug];
  if (c) return c;
  return {
    title: `${name} Online in Lucknow | ${BRAND}`,
    description: (description || `Shop ${name.toLowerCase()} online from ${BRAND}, a plant nursery in Lucknow, with home delivery.`).slice(0, 158),
  };
}

const PLANT_WORDS = /plant|palm|fern|tree|succulent|cactus|bonsai|lily|ivy|pothos|monstera|ficus|money|snake|aglaonema|croton|philodendron|syngonium|jade|bamboo|herb|tulsi|rose|hibiscus|jasmine|mogra|bougainvillea|mango|lemon|guava|aloe/i;

/** Product pages: "Buy <name> Online in Lucknow | ₹price" */
export function productSeo(p: { name: string; price: number; shortDescription?: string; category?: string }) {
  const isPlant = PLANT_WORDS.test(p.name) || /plant|succulent|flower|fruit|shrub|xl|bundle|light|pet|hanging|air|maintenance|indoor/i.test(p.category || '');
  const where = isPlant ? 'Online in Lucknow' : 'Online';
  let title = `Buy ${p.name} ${where} | ₹${p.price}`;
  if (title.length > 65) title = `${p.name} | Buy Online ₹${p.price}`;
  const lead = (p.shortDescription || '').replace(/\s+/g, ' ').trim();
  const tail = ` Price ₹${p.price}. Buy ${p.name} online from ${BRAND}, Lucknow - home delivery & safe packing.`;
  const description = (lead ? `${lead}${/[.!?]$/.test(lead) ? '' : '.'}${tail}` : tail.trim());
  return { title, description: description.length > 158 ? description.slice(0, 157).replace(/\s+\S*$/, '') + '…' : description };
}

export const GIFTING_SEO: Record<string, { title: string; description: string }> = {
  '/gifting': {
    title: 'Plant Gifts Online in Lucknow | Gift Plants for Every Occasion',
    description: 'Send plant gifts in premium pots for birthdays, anniversaries, housewarmings and festivals. Order plant gifts online from Buddy4Plant, Lucknow.',
  },
  '/gifting/corporate': {
    title: 'Corporate Plant Gifting in Lucknow | Bulk Plant Gifts',
    description: 'Corporate plant gifts in bulk for employees, clients and events, with custom branding. Corporate gifting from Buddy4Plant, Lucknow - delivery across UP & India.',
  },
  '/gifting/festive': {
    title: 'Diwali & Festive Plant Gifts Online | Buddy4Plant',
    description: 'Festive plant gift hampers for Diwali, Rakhi, New Year and more - plants in decorative pots, delivered from Buddy4Plant, Lucknow.',
  },
  '/gifting/green': {
    title: 'Green Gifts Online | Eco-Friendly Plant Gifts | Buddy4Plant',
    description: 'Eco-friendly green gifts - living plants instead of flowers that fade. Order green gifts online from Buddy4Plant nursery, Lucknow.',
  },
};

export const SERVICES_SEO = {
  title: 'Landscaping Company in Lucknow | Garden Design & Maintenance (AMC)',
  description:
    'Landscaping, garden design, garden maintenance (AMC), vertical gardens and Miyawaki plantation for homes, offices and campuses in Lucknow, Kanpur, UP & Delhi.',
};

export const PROJECTS_SEO = {
  title: 'Landscaping Projects in Lucknow & Uttar Pradesh | Buddy4Plant',
  description:
    'Landscaping, plantation and garden AMC projects by Buddy4Plant for government offices, institutes, industries and commercial campuses across Uttar Pradesh and Delhi.',
};

export const ABOUT_SEO = {
  title: 'About Buddy4Plant | Plant Nursery & Landscaping Company, Lucknow',
  description:
    'Buddy4Plant is a Lucknow plant nursery and landscaping company that grows plants, delivers them to homes and builds and maintains gardens across Uttar Pradesh.',
};

export const STORE_SEO = {
  title: 'Plant Nursery in Lucknow (Vikas Nagar) | Visit Buddy4Plant',
  description:
    'Visit the Buddy4Plant plant nursery in Vikas Nagar, Lucknow for indoor plants, outdoor plants, pots and soil. Get directions on Google Maps or WhatsApp us.',
};

export const BLOG_SEO = {
  title: 'Gardening Tips & Plant Care Guides for India | Buddy4Plant Blog',
  description:
    'Practical gardening tips and plant care guides for Indian homes: indoor plants, kitchen gardens, soil and compost, landscaping costs and Miyawaki forests.',
};
