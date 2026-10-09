import type { BlogPost } from '../services/blogService';

export const BLOG_SECTIONS: Record<string, string> = {
  "plant-care": "Plants & Plant Care",
  "gardening": "Gardening & Soil",
  "landscaping": "Landscaping & Miyawaki",
  "projects": "Projects & Nursery"
};

/** The 10 SEO pillar articles (Buddy4Plant SEO + AI Search Blog Strategy, Month 1). */
export const PILLAR_ARTICLES: BlogPost[] = [
  {
    "id": "pillar-01",
    "slug": "best-plants-for-home-india",
    "section": "plant-care",
    "category": "Plants & Plant Care",
    "title": "Best Plants for Home in India: 50+ Plants for Balcony, Garden, Terrace & Indoor Spaces",
    "seoTitle": "Best Plants for Home in India: 50+ Indoor & Balcony Picks",
    "metaDescription": "The best plants for Indian homes, sorted by light and space: 50+ indoor, balcony, terrace, flowering and low-maintenance plants with care basics.",
    "primaryKeyword": "best plants for home in India",
    "excerpt": "The right plant depends on light, not looks. Here are 50+ plants that actually thrive in Indian homes - sorted by sunlight, space and effort.",
    "readTime": "5 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/plant-photos/areca-palm-plant.jpg",
    "imageAlt": "Areca palm in a white and black ceramic pot on a wooden table",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** The best plants for most Indian homes are the ones that match your light. For low-light rooms choose snake plant, ZZ plant, money plant, peace lily or aglaonema. For bright indoor spots choose areca palm, rubber plant, monstera or fiddle leaf fig. For sunny balconies and terraces choose hibiscus, bougainvillea, jasmine, tulsi, adenium and curry leaf.",
      "At Buddy4Plant we grow and sell plants for homes, offices and campuses across Lucknow and Uttar Pradesh. The list below is based on what survives real Indian conditions - 45°C summers, heavy monsoon humidity, cold winter nights and busy owners.",
      "## How do I choose the right plant for my home?",
      "Check three things before you buy:",
      "- **Light:** How many hours of direct sun does the spot get? Direct sun means the sun itself falls on the leaves.\n- **Space:** Table top, floor corner, hanging, railing or ground bed?\n- **Your time:** Can you water every 2-3 days, or only once a week?",
      "| Your spot | Light it gets | Best plant types |\n|---|---|---|\n| Bedroom or office far from windows | Low light, no direct sun | Snake plant, ZZ plant, pothos, peace lily, aglaonema |\n| Living room near a window | Bright indirect light | Areca palm, rubber plant, monstera, calathea, dracaena |\n| East-facing balcony | 2-4 hours of morning sun | Money plant, ferns, syngonium, anthurium, begonia |\n| West or south balcony / terrace | 5+ hours of direct sun | Hibiscus, bougainvillea, jasmine, adenium, tulsi, succulents |\n| Garden / ground bed | Full sun | Flowering shrubs, fruit plants, palms, hedges, trees |",
      "## Which plants grow well indoors in low light?",
      "These tolerate rooms with no direct sun and forgiving watering:",
      "| Plant | Water | Why it works indoors |\n|---|---|---|\n| [Snake plant (Sansevieria)](/product/snake-plant-green) | Every 10-15 days | Stores water in leaves, survives neglect |\n| [ZZ plant](/product/zz-plant) | Every 10-14 days | Thick rhizomes, very low light tolerance |\n| [Money plant (pothos)](/product/money-plant-golden) | When top soil is dry | Fast growing, trails or climbs, grows in water too |\n| [Peace lily](/product/peace-lily-plant) | Keep lightly moist | Flowers indoors, droops to tell you it is thirsty |\n| Aglaonema | When top 1 inch is dry | Colourful leaves without needing sun |\n| Philodendron | When top 1 inch is dry | Heart-shaped leaves, easy climber |\n| Syngonium | Keep lightly moist | Pink, white and green varieties |\n| Chinese evergreen | Weekly | Tough and slow growing |\n| Spider plant | Weekly | Easy, makes baby plants for sharing |\n| Dracaena | Every 7-10 days | Upright, good for corners |",
      "## Which plants need bright indirect light?",
      "Place these within 1-2 metres of a bright window, but out of harsh afternoon sun:",
      "- [Areca palm](/product/areca-palm-plant) - soft, feathery fronds for living rooms\n- [Rubber plant](/product/rubber-plant) - glossy dark leaves, grows into a small tree\n- [Monstera deliciosa](/product/monstera-deliciosa-plant) - big split leaves, needs space\n- [Fiddle leaf fig](/product/fiddle-leaf-fig-plant) - dramatic, but dislikes being moved\n- Calathea - patterned leaves, likes humidity\n- Bamboo palm - good for AC rooms\n- Anthurium - long-lasting red or pink flowers\n- Croton - bright yellow-red leaves need the brightest window\n- Lucky bamboo - grows in water or soil\n- Jade plant - needs a very bright window or balcony",
      "## What are the best balcony plants in India?",
      "For a balcony with **4+ hours of sun**:",
      "| Plant | Type | Season it shines |\n|---|---|---|\n| Hibiscus | Flowering shrub | Almost all year |\n| Bougainvillea | Flowering climber | Summer to winter, loves heat |\n| Jasmine (mogra) | Fragrant shrub | Summer |\n| Tulsi | Herb | All year, protect in cold nights |\n| Adenium (desert rose) | Succulent | Summer |\n| Portulaca | Groundcover | Summer and monsoon |\n| Curry leaf | Kitchen herb | All year |\n| Aloe vera | Succulent | All year |\n| Rose | Flowering shrub | Winter and spring |\n| Marigold | Seasonal flower | Winter |",
      "For a **shaded balcony** (less than 3 hours of sun), use [money plant](/product/money-plant-golden), ferns, syngonium, philodendron, spider plant and begonia.",
      "## Which plants suit a terrace or garden?",
      "Terraces are hotter and windier than balconies. Choose plants that handle full sun, and use bigger pots or grow bags so the soil does not dry out in a day.",
      "- **Fruit plants:** lemon, guava, pomegranate, chiku, mango (dwarf/grafted), papaya\n- **Palms:** areca, foxtail, bottle palm, royal palm (for ground)\n- **Flowering shrubs:** ixora, tecoma, kaner, duranta, champa (plumeria), hamelia\n- **Hedges and borders:** duranta, ficus panda, clerodendrum, murraya\n- **Shade trees (ground only):** neem, amaltas, kadam, jamun",
      "See our [fruit plants in grow bags](/plants/fruit-plants) for terrace orchards.",
      "## Which plants are the lowest maintenance?",
      "If you travel or forget to water, start with these eight: snake plant, ZZ plant, jade, aloe vera, money plant, spider plant, adenium and cactus. They store water in leaves or roots and forgive missed watering far better than they forgive over-watering.",
      "## Which plants flower indoors?",
      "Very few plants flower well without some direct sun. The reliable indoor bloomers are **peace lily, anthurium, kalanchoe and bromeliads**. Everything else - hibiscus, jasmine, rose, bougainvillea - needs a sunny balcony to flower.",
      "## Are indoor plants safe for pets?",
      "Some common houseplants are mildly toxic to cats and dogs if chewed, including pothos, philodendron, peace lily, dieffenbachia, ZZ plant and aglaonema. Pet-friendlier choices include spider plant, areca palm, calathea, bamboo palm and most ferns. Keep any plant out of reach if your pet likes to chew.",
      "## Our shortlist by room",
      "| Room | Top 3 picks |\n|---|---|\n| Bedroom | Snake plant, ZZ plant, peace lily |\n| Living room | Areca palm, rubber plant, monstera |\n| Study / office desk | Money plant, jade, succulents |\n| Bathroom with a window | Ferns, pothos, spider plant |\n| Kitchen window | Tulsi, curry leaf, mint |\n| Sunny balcony | Hibiscus, bougainvillea, jasmine |",
      "Not sure where to start? Tell us your room and light on WhatsApp and our nursery team will suggest the right plants and pot size."
    ],
    "tags": [
      "Indoor Plants",
      "Balcony Plants",
      "Low Maintenance",
      "Flowering Plants"
    ],
    "faqs": [
      {
        "q": "Which is the easiest indoor plant for beginners in India?",
        "a": "The snake plant and ZZ plant are the easiest. Both handle low light and need water only every 10-15 days."
      },
      {
        "q": "Which plants can survive in a room with no sunlight?",
        "a": "Snake plant, ZZ plant, pothos (money plant), peace lily and aglaonema tolerate low light. A room with no light at all will not support any plant for long, so give them at least some daylight or a grow light."
      },
      {
        "q": "What are the best plants for a sunny balcony?",
        "a": "Hibiscus, bougainvillea, jasmine, adenium, tulsi, curry leaf, aloe vera and portulaca handle 4 or more hours of direct sun."
      }
    ],
    "related": [
      "complete-plant-care-guide-indian-weather",
      "best-plants-for-lucknow",
      "gardening-essentials-shopping-list-india"
    ],
    "cta": {
      "label": "Shop indoor plants",
      "path": "/plants/indoor-plants"
    }
  },
  {
    "id": "pillar-02",
    "slug": "kitchen-garden-india-beginners-guide",
    "section": "gardening",
    "category": "Gardening & Soil",
    "title": "How to Start a Kitchen Garden in India: Complete Beginner's Guide",
    "seoTitle": "How to Start a Kitchen Garden in India: Beginner's Guide",
    "metaDescription": "Start a kitchen garden at home in India: containers, soil mix, compost, seeds, sunlight, watering and a month-by-month vegetable calendar for North India.",
    "primaryKeyword": "kitchen garden in India",
    "excerpt": "You need only 4-6 hours of sun, a few containers and the right soil mix to grow your own vegetables, herbs and greens at home.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/plant-photos/lemon-plant-with-grow-bag.jpg",
    "imageAlt": "Young lemon plant in a black grow bag on a wooden floor",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** To start a kitchen garden in India, pick a spot with at least 4-6 hours of direct sun, use containers or grow bags at least 12 inches deep for fruiting vegetables, fill them with a mix of garden soil, compost and cocopeat, and start with easy crops for the current season - leafy greens and herbs in winter, gourds and okra in summer and monsoon.",
      "## How much space and sunlight do I need?",
      "A kitchen garden can be a balcony railing, a terrace or a strip of ground. What matters most is sunlight:",
      "| Sunlight per day | What you can grow |\n|---|---|\n| 2-3 hours | Mint, coriander, spinach, lettuce, methi |\n| 4-6 hours | Most leafy greens, chillies, beans, herbs |\n| 6+ hours | Tomato, brinjal, okra, gourds, capsicum, fruit plants |",
      "## Which containers should I use?",
      "Depth matters more than width. Roots need room to grow.",
      "| Crop | Minimum container | Example |\n|---|---|---|\n| Microgreens | 1-2 inch tray | [Microgreens growing tray](/product/microgreens-growing-tray) |\n| Leafy greens (palak, methi, dhaniya, lettuce) | 6-8 inch deep, wide | Rectangular planter |\n| Herbs (mint, tulsi, curry leaf) | 8-10 inch pot | Round plastic pot |\n| Chilli, brinjal, tomato, capsicum | 12-15 inch deep (10-15 litres) | Grow bag 12x12 |\n| Radish, carrot | 12 inch deep | Deep planter |\n| Gourds (lauki, tori, karela), cucumber | 15-18 inch deep + trellis | Grow bag 15x15 or larger |\n| Lemon, guava, pomegranate | 18-24 inch | Large grow bag or drum |",
      "Every container must have drainage holes. Grow bags are light, cheap and keep roots cool - ideal for terraces. See our [plastic pots](/plants/plastic-pots).",
      "## What soil mix should I use?",
      "Do not fill pots with plain garden soil - it compacts and waterlogs. A simple, reliable kitchen-garden mix:",
      "- **40% garden soil** (for body and minerals)\n- **30% compost or vermicompost** (for nutrients)\n- **30% cocopeat** (keeps the mix light and holds water)",
      "Add a handful of [neem cake powder](/product/neem-cake-powder-1-kg) per pot to discourage soil pests. Read our full [soil and compost guide](/blog/gardening/best-soil-compost-for-plants-india) for ratios for every plant type.",
      "## What should I grow in each season in North India?",
      "| Season | Sowing time | Easy crops |\n|---|---|---|\n| Winter (Rabi) | September - November | Tomato, palak, methi, dhaniya, carrot, radish, peas, cauliflower, cabbage, broccoli, lettuce, onion greens |\n| Summer (Zaid) | February - March | Okra (bhindi), lauki, tori, karela, cucumber, chillies, beans |\n| Monsoon (Kharif) | June - July | Okra, brinjal, chillies, beans, gourds, maize |\n| All year | Any time | Mint, curry leaf, tulsi, lemongrass, microgreens |",
      "**Beginner tip:** start with 5 crops - coriander, methi, chillies, tomato and mint. They are fast, forgiving and used every day.",
      "## Seeds or saplings?",
      "- **Sow seeds directly:** palak, methi, dhaniya, radish, carrot, peas, beans, okra, gourds.\n- **Start in trays and transplant:** tomato, brinjal, chillies, capsicum, cauliflower, cabbage. Transplant when seedlings have 4-6 true leaves (about 3-5 weeks).\n- **Buy saplings:** curry leaf, lemon, guava, and other fruit plants - grafted plants fruit years sooner than seed-grown ones.",
      "## How often should I water?",
      "Check the soil with your finger. Water when the top inch is dry.",
      "| Season | Typical watering for containers |\n|---|---|\n| Summer (April - June) | Daily, early morning; large pots may need evening water too |\n| Monsoon | Only when soil is dry; check drainage after heavy rain |\n| Winter | Every 2-3 days, around midday |",
      "Mulch the soil surface with dry leaves or cocopeat to cut water loss in summer.",
      "## How do I feed my vegetables?",
      "- Add 1-2 handfuls of [vermicompost](/product/vermicompost) per pot every 3-4 weeks.\n- For fruiting crops (tomato, chilli, brinjal), a potash-rich organic feed at flowering helps fruit set.\n- Liquid feeds such as diluted compost tea every 2 weeks keep leafy greens growing fast.",
      "## How do I control pests organically?",
      "| Pest | Signs | Organic control |\n|---|---|---|\n| Aphids | Tiny green/black insects on new shoots | Spray [neem oil](/product/neem-oil-100-ml) solution (5 ml per litre with a drop of soap) |\n| Mealybugs | White cottony clusters | Wipe off, then neem oil spray weekly |\n| Whitefly | Tiny white flies under leaves | Yellow sticky traps + neem spray |\n| Caterpillars | Holes in leaves | Pick by hand, spray neem |\n| Fungal leaf spots | Brown/black spots in monsoon | Remove affected leaves, improve air flow |",
      "Spray in the evening, never in hot sun.",
      "## When do I harvest?",
      "| Crop | Days to first harvest (approx.) |\n|---|---|\n| Microgreens | 7-14 |\n| Methi, dhaniya, palak | 25-40 |\n| Radish | 30-45 |\n| Okra | 45-60 |\n| Tomato, brinjal, chilli | 60-90 |\n| Gourds | 55-75 |",
      "Harvest leafy greens by cutting outer leaves so the plant keeps producing."
    ],
    "tags": [
      "Kitchen Garden",
      "Terrace Gardening",
      "Vegetables",
      "Organic"
    ],
    "faqs": [
      {
        "q": "What is the easiest vegetable to grow at home in India?",
        "a": "Coriander, methi, spinach, chillies and mint are the easiest. Methi and coriander are ready in 3-5 weeks."
      },
      {
        "q": "How deep should a pot be for tomatoes?",
        "a": "At least 12-15 inches deep, holding about 10-15 litres of soil, with support for the plant."
      },
      {
        "q": "Can I grow vegetables on a balcony with little sun?",
        "a": "With 2-3 hours of sun you can grow mint, coriander, spinach, lettuce and methi. Fruiting vegetables such as tomato and brinjal need 6 or more hours."
      }
    ],
    "related": [
      "best-soil-compost-for-plants-india",
      "gardening-essentials-shopping-list-india",
      "best-plants-for-lucknow"
    ],
    "cta": {
      "label": "Shop potting soil & compost",
      "path": "/collections/potting-soil"
    }
  },
  {
    "id": "pillar-03",
    "slug": "complete-plant-care-guide-indian-weather",
    "section": "plant-care",
    "category": "Plants & Plant Care",
    "title": "Complete Plant Care Guide for Indian Weather",
    "seoTitle": "Complete Plant Care Guide for Indian Weather | Buddy4Plant",
    "metaDescription": "How to care for plants in Indian weather: watering, sunlight, soil, fertilizer, pruning, propagation, pests and fixes for yellow leaves and root rot.",
    "primaryKeyword": "plant care",
    "excerpt": "Most plants die from too much water, not too little. This guide covers watering, light, soil, feeding, pests and common problems through Indian seasons.",
    "readTime": "5 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/plant-photos/peace-lily-plant.jpg",
    "imageAlt": "Peace lily with white flowers in a white and black pot",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** Healthy plants in India need four things done right: water only when the top inch of soil is dry, give each plant the light it is suited to, use a loose soil mix with drainage, and feed with organic compost every 30-45 days during the growing season. Adjust all four with the season - more water in summer, much less in monsoon and winter.",
      "## How often should I water my plants?",
      "There is no fixed schedule. Use the **finger test**: push a finger 1 inch (2-3 cm) into the soil. If it is dry, water. If it is cool or damp, wait.",
      "| Plant type | Water when | Summer | Monsoon | Winter |\n|---|---|---|---|---|\n| Succulents, cactus, snake plant, ZZ | Soil fully dry | Every 7-10 days | Every 15-20 days | Every 15-20 days |\n| Most foliage plants (money plant, aglaonema, philodendron) | Top 1 inch dry | Every 2-3 days | Every 5-7 days | Every 5-7 days |\n| Moisture lovers (peace lily, ferns, calathea) | Surface just dry | Daily or alternate days | Every 3-4 days | Every 3-4 days |\n| Flowering and fruiting plants in sun | Top 1 inch dry | Daily | When dry | Every 2-3 days |",
      "**How to water:** water slowly until it drains out of the bottom, then empty the saucer after 15 minutes. Small sips every day keep the top wet and the roots dry.",
      "## How much light does my plant need?",
      "| Light level | Where you find it | Suits |\n|---|---|---|\n| Low | Middle of a room, north-facing window | Snake plant, ZZ, pothos, aglaonema |\n| Medium / bright indirect | Near an east window, or a bright room without sun on leaves | Monstera, rubber plant, areca palm, peace lily |\n| Direct sun (4+ hours) | Balcony, terrace, south or west window | Hibiscus, bougainvillea, succulents, fruit and vegetables |",
      "Signs of too little light: long stretched stems, small new leaves, variegated leaves turning plain green. Signs of too much: bleached or brown scorched patches.",
      "## What soil should I use?",
      "Use a loose, well-draining potting mix, not plain garden soil. A good all-purpose mix is 40% garden soil, 30% compost or vermicompost and 30% cocopeat. Cactus and succulents need extra grit or perlite. Full ratios are in our [soil and compost guide](/blog/gardening/best-soil-compost-for-plants-india).",
      "## When and how should I fertilize?",
      "| Season | Feeding |\n|---|---|\n| February - October (growing season) | Organic compost every 30-45 days; liquid feed every 2-3 weeks for fast growers |\n| November - January (slow growth) | Feed lightly or pause, especially indoors |\n| Just after repotting | Wait 3-4 weeks before feeding |",
      "- **Vermicompost:** 1-2 handfuls around the plant, mixed into the top soil.\n- **Neem cake:** 1 tablespoon per medium pot monthly - feeds and deters soil pests.\n- **Flowering plants:** a phosphorus/potash-rich feed before and during bloom.\n- **Never** feed a dry plant - water first, then feed.",
      "Our [Buddy4Plant Plant Food](/product/buddy4plant-plant-food) and [vermicompost](/product/buddy4plant-vermicompost-50kg) are made for this routine.",
      "## How do I prune plants?",
      "- Remove yellow, dry or diseased leaves at the base with clean scissors.\n- Pinch the tips of trailing plants (money plant, syngonium) to make them bushy.\n- Prune flowering shrubs such as hibiscus and bougainvillea right after a flowering flush, or in late winter (February).\n- Never remove more than a third of a plant at once.",
      "## How do I propagate my plants?",
      "| Method | Plants | How |\n|---|---|---|\n| Stem cuttings in water | Money plant, philodendron, syngonium, tradescantia | Cut below a node, keep in water; roots in 2-3 weeks |\n| Stem cuttings in soil | Hibiscus, bougainvillea, croton, jade | Cut 6 inches, remove lower leaves, plant in moist mix |\n| Leaf cuttings | Snake plant, succulents | Let the cut dry a day, then place on soil |\n| Division | Peace lily, spider plant, ZZ, ferns | Split the root ball while repotting |\n| Offsets / pups | Aloe vera, spider plant babies | Separate and pot up |",
      "Monsoon (July - August) is the fastest season for rooting cuttings.",
      "## How do I identify and treat pests?",
      "| Pest | What you see | Treatment |\n|---|---|---|\n| Mealybugs | White cotton-like clusters on stems and leaf joints | Dab with cotton + rubbing alcohol, then spray neem oil weekly for 3 weeks |\n| Spider mites | Fine webbing, speckled pale leaves (common in dry summer) | Wash leaves, raise humidity, neem spray |\n| Aphids | Clusters of tiny insects on new growth | Strong water spray, then neem oil |\n| Scale | Brown bumps stuck to stems | Scrape off, neem oil |\n| Fungus gnats | Tiny flies around wet soil | Let soil dry out; top layer of sand |\n| Snails and slugs | Holes and slime trails in monsoon | Hand pick at night; ring of ash or eggshell |",
      "A safe general spray: 5 ml [neem oil](/product/neem-oil-100-ml) + 2-3 drops of liquid soap in 1 litre of water, sprayed in the evening every 7-10 days.",
      "## Why are my plant's leaves turning yellow?",
      "| Problem | Most likely cause | Fix |\n|---|---|---|\n| Lower leaves yellow and soft, soil wet | Over-watering | Let soil dry; check drainage holes |\n| Leaves yellow and crispy, soil dry | Under-watering | Water deeply; move away from heat |\n| New leaves pale, veins green | Nutrient deficiency | Feed with compost; Epsom salt 1 tsp per litre once a month for foliage plants |\n| Brown leaf tips | Dry air, salt build-up or irregular watering | Flush soil with plain water; mist in dry months |\n| Drooping in the afternoon | Heat stress | Shade in the afternoon; water early morning |\n| Mushy black stem base | Root rot | Cut rotten roots, repot in fresh dry mix |",
      "## How should I change care through Indian seasons?",
      "- **Summer (April - June):** water early morning, mulch the soil, move delicate plants out of afternoon sun, use 50% shade net on terraces.\n- **Monsoon (July - September):** cut watering, clear drainage, watch for fungus and snails, best time to repot and take cuttings.\n- **Winter (November - February):** water less and at midday, stop heavy feeding, keep tropical indoor plants away from cold windows and cover sensitive plants on the coldest nights.",
      "## When should I repot?",
      "Repot when roots come out of the drainage holes, water runs straight through, or the plant has been in the same pot for 2 years. Move up only 1-2 inches in pot size. The best time is February - March or the monsoon."
    ],
    "tags": [
      "Plant Care",
      "Watering",
      "Pests",
      "Fertilizer",
      "Monsoon Care"
    ],
    "faqs": [
      {
        "q": "How do I know if I am over-watering my plant?",
        "a": "Yellow, soft lower leaves, soil that stays wet for days, and a mushy stem base are signs of over-watering. Let the soil dry and check that the pot drains."
      },
      {
        "q": "What is the best organic fertilizer for indoor plants in India?",
        "a": "Vermicompost is the safest all-round organic fertilizer. Use 1-2 handfuls every 30-45 days in the growing season."
      },
      {
        "q": "How do I get rid of mealybugs naturally?",
        "a": "Wipe them off with cotton dipped in rubbing alcohol, then spray neem oil solution (5 ml per litre with a drop of soap) every 7 days for 3 weeks."
      }
    ],
    "related": [
      "best-soil-compost-for-plants-india",
      "best-plants-for-home-india",
      "gardening-essentials-shopping-list-india"
    ],
    "cta": {
      "label": "Shop plant care products",
      "path": "/collections/plant-care"
    }
  },
  {
    "id": "pillar-04",
    "slug": "best-soil-compost-for-plants-india",
    "section": "gardening",
    "category": "Gardening & Soil",
    "title": "Best Soil & Compost for Plants in India: Potting Mix, Vermicompost & Plant Food Guide",
    "seoTitle": "Best Soil & Compost for Plants in India: Potting Mix Guide",
    "metaDescription": "Best soil for plants in India: potting mix ratios for indoor plants, vegetables, succulents and fruit plants, plus how to use cocopeat, vermicompost and plant food.",
    "primaryKeyword": "best soil for plants in India",
    "excerpt": "Plain garden soil suffocates potted plants. Here are tested potting-mix ratios for every plant type, and how much compost and plant food to add.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/editorial/b4p-vermicompost-50kg.jpg",
    "imageAlt": "Buddy4Plant vermicompost bag",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** The best all-purpose soil for potted plants in India is a mix of **40% garden soil, 30% vermicompost or compost and 30% cocopeat**. It holds enough water, drains well and feeds the plant. Succulents need extra grit; vegetables need extra compost; big fruit plants need more soil for weight and stability.",
      "## Why can't I use plain garden soil in pots?",
      "Garden soil in a pot compacts after a few waterings. Roots get no air, water sits at the bottom, and the plant slowly rots. A potting mix stays loose because cocopeat and compost add air spaces, while the soil adds body and minerals.",
      "## What are the main ingredients?",
      "| Ingredient | What it does | Use it for |\n|---|---|---|\n| Garden / red soil | Body, minerals, holds the plant upright | Base of every mix |\n| [Vermicompost](/product/vermicompost) | Slow, gentle nutrients and soil life | Every mix; top-dressing every 30-45 days |\n| [Cocopeat](/product/cocopeat-block) | Keeps the mix light, holds water | Indoor plants, seedlings, hanging baskets |\n| [Perlite](/product/perlite-250-g) | Air pockets and fast drainage | Succulents, aroids, indoor plants |\n| Coarse sand / grit | Drainage | Cactus, succulents, adenium |\n| [Neem cake](/product/neem-cake-powder-1-kg) | Mild nutrients, deters soil pests | Add a handful per pot |\n| [Bone meal](/product/bone-meal-1-kg) | Phosphorus for roots and flowers | Flowering and fruit plants |\n| [LECA balls](/product/hydrostone-leca-balls-6-litre) | Drainage layer, semi-hydro growing | Bottom of large pots, indoor plants |",
      "## Which potting mix should I use for each plant?",
      "| Plant type | Soil | Compost | Cocopeat | Extra |\n|---|---|---|---|---|\n| Indoor foliage plants | 40% | 30% | 30% | A handful of perlite |\n| Aroids (monstera, philodendron, pothos) | 30% | 30% | 30% | 10% perlite or bark |\n| Vegetables and herbs | 40% | 40% | 20% | Neem cake |\n| Succulents and cactus | 40% | 10% | 20% | 30% coarse sand or perlite |\n| Flowering shrubs (hibiscus, rose) | 50% | 30% | 20% | Bone meal at planting |\n| Fruit plants in grow bags | 50% | 30% | 20% | Neem cake + bone meal |\n| Seed starting | - | 50% | 50% | Keep fine and moist |",
      "For ready-made options, see [garden soil mix](/product/garden-soil-mix), [organic veggie mix](/product/organic-veggie-mix-5-kg) and [cactus & succulent mix](/product/cactus-succulent-potting-mix-5-kg).",
      "## How do I use cocopeat correctly?",
      "Compressed cocopeat blocks must be soaked before use. Place the block in a bucket with water - it expands 5-7 times. Squeeze out extra water, break it up, then mix. Cocopeat alone has almost no nutrients, so always combine it with compost and soil.",
      "## How much vermicompost should I add?",
      "| Pot size | At planting | Every 30-45 days |\n|---|---|---|\n| 4-6 inch | 2-3 tablespoons | 1 tablespoon |\n| 8-10 inch | 1 cup | 1-2 handfuls |\n| 12-15 inch / grow bag | 2-3 cups | 2-3 handfuls |\n| Ground bed | 2-3 kg per sq m | 1 kg per sq m |",
      "Mix it into the top inch of soil and water afterwards. Vermicompost does not burn roots, so it is the safest feed for beginners.",
      "## What is the difference between compost, manure and plant food?",
      "- **Compost / vermicompost:** improves soil and feeds slowly. The base of every routine.\n- **Cow manure:** good soil conditioner; always use well-rotted, dry manure, never fresh.\n- **Plant food (fertilizer):** a concentrated nutrient boost for growth or flowering. Use it on top of compost, not instead of it.",
      "A simple routine for most home plants: vermicompost every 30-45 days, plus a plant food during active growth. Our [Buddy4Plant Plant Food](/product/buddy4plant-plant-food) is made for exactly this.",
      "## How do I fix bad soil?",
      "| Problem | Sign | Fix |\n|---|---|---|\n| Hard, cracked soil | Water runs off the top | Loosen with a fork; add compost and cocopeat |\n| Waterlogged soil | Stays wet for days, sour smell | Repot with perlite/sand; check drainage holes |\n| White crust on top | Salt build-up from hard water or fertilizer | Scrape off; flush with plain water |\n| Soil pulling away from the pot | Mix has dried out completely | Soak the pot in a bucket for 20 minutes |\n| Alkaline (usar) soil in UP | Poor growth, pale leaves | Add plenty of compost; gypsum for ground beds |",
      "## When should I change the soil?",
      "Refresh the top 2 inches of soil every year, and repot completely every 2 years or when roots fill the pot. February - March and the monsoon are the best times."
    ],
    "tags": [
      "Soil",
      "Compost",
      "Vermicompost",
      "Cocopeat",
      "Potting Mix"
    ],
    "faqs": [
      {
        "q": "What is the best potting mix ratio for indoor plants?",
        "a": "40% garden soil, 30% vermicompost and 30% cocopeat, with a handful of perlite for extra drainage."
      },
      {
        "q": "Can I use only cocopeat for plants?",
        "a": "No. Cocopeat has almost no nutrients and can stay too wet on its own. Always mix it with soil and compost."
      },
      {
        "q": "How often should I add vermicompost to potted plants?",
        "a": "Every 30-45 days during the growing season, mixed into the top inch of soil and watered in."
      }
    ],
    "related": [
      "kitchen-garden-india-beginners-guide",
      "complete-plant-care-guide-indian-weather",
      "gardening-essentials-shopping-list-india"
    ],
    "cta": {
      "label": "Shop soil, compost & plant food",
      "path": "/collections/fertilizers"
    }
  },
  {
    "id": "pillar-05",
    "slug": "landscaping-cost-india",
    "section": "landscaping",
    "category": "Landscaping & Miyawaki",
    "title": "Landscaping Cost in India: Complete Guide to Garden Design, Plants, Irrigation & Maintenance",
    "seoTitle": "Landscaping Cost in India (2026): Garden, Lawn & AMC Guide",
    "metaDescription": "How much does landscaping cost in India? Indicative 2026 rates for garden design, lawns, plants, paving, irrigation, lighting and annual maintenance (AMC).",
    "primaryKeyword": "landscaping cost in India",
    "excerpt": "What does a garden really cost? Indicative per-sq-ft rates for design, lawn, plants, paving, irrigation and maintenance for homes, offices and institutions.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/projects/up112-landscaping.jpg",
    "imageAlt": "Illustration of a landscaped institutional campus with lawns, hedges and trees",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** In India, landscaping typically costs about **₹150-₹400 per sq ft for a basic garden, ₹450-₹1,000 per sq ft for a mid-range garden, and ₹1,100-₹2,500+ per sq ft for premium work**, according to published 2026 industry cost guides. The biggest cost drivers are hardscape (paving, walls, pergolas), the size of plants you start with, irrigation, and whether the site needs soil work. Yearly maintenance is a separate, recurring cost.",
      "These are indicative ranges only. Every site is different - an exact quote needs a site visit.",
      "## What decides the cost of landscaping?",
      "- **Area and access:** larger areas cost less per sq ft; difficult access (terraces, narrow lanes) costs more.\n- **Soil condition:** rubble, construction waste or alkaline soil needs excavation and new soil.\n- **Softscape vs hardscape:** plants and lawn are cheaper per sq ft than stone paving, walls and structures.\n- **Plant size:** a 10-foot palm costs many times more than a 3-foot sapling of the same species.\n- **Systems:** drip or sprinkler irrigation, lighting and drainage add cost but save money later.\n- **Maintenance plan:** a garden without an AMC usually declines within a year.",
      "## What does each component cost?",
      "Indicative 2026 ranges from published Indian landscaping cost guides:",
      "| Component | Typical range |\n|---|---|\n| Lawn installation (natural grass) | ₹25 - ₹60 per sq ft |\n| Groundcover planting | ₹15 - ₹40 per sq ft |\n| Shrubs | ₹60 - ₹400 per plant |\n| Large specimen trees | ₹2,500 - ₹25,000 each |\n| Basic paving (concrete, kota) | ₹80 - ₹160 per sq ft |\n| Mid paving (granite, sandstone) | ₹180 - ₹400 per sq ft |\n| Drip irrigation | ₹15 - ₹45 per sq ft |\n| Lawn sprinklers | ₹25 - ₹60 per sq ft |\n| Garden lighting | ₹8 - ₹40 per sq ft |\n| Drainage | ₹20 - ₹70 per sq ft |\n| Pergola | ₹350 - ₹4,000 per sq ft of cover |\n| Design fees | ₹15 - ₹80 per sq ft, or 8-15% of build cost |",
      "## How much does landscaping cost for different projects?",
      "| Project type | What is usually included | Main cost drivers |\n|---|---|---|\n| Home garden / front yard | Lawn, borders, a few trees, pots, simple path | Plant size, paving choice |\n| Terrace garden | Waterproofing check, planters, lightweight soil, drip system | Load limits, planters, irrigation |\n| Office / commercial | Entrance landscaping, lawns, hedges, planters, indoor plants | Hardscape finish, maintenance frequency |\n| Institutional / government campus | Lawns, green belts, avenue trees, hedges, plantation drives | Area, soil work, water source, AMC scope |\n| Industrial unit | Green belt, boundary plantation, lawns near offices | Scale, hardy species, irrigation |",
      "## How much does garden maintenance (AMC) cost?",
      "Industry guides put yearly maintenance at roughly **₹40,000-₹85,000 for a basic home garden**, **₹1-2.4 lakh for a mid-sized garden**, and more for large or premium sites. For campuses and institutions the AMC is usually priced on area, gardener deployment and scope.",
      "A typical AMC covers:",
      "- Lawn mowing, edging and weeding\n- Pruning and shaping of hedges and shrubs\n- Manuring and organic feeding\n- Pest and disease control\n- Seasonal flower plantation\n- Replacement of dead plants\n- Monthly work reports",
      "## How can I reduce landscaping cost?",
      "1. **Start with younger plants.** A 3-4 foot tree establishes faster and costs a fraction of a mature one.\n2. **Choose native and hardy species.** Neem, amaltas, kadam, duranta, hibiscus and bougainvillea cope with UP summers on less water.\n3. **Use less lawn.** Lawns need the most water and labour; replace some with groundcover, gravel or mulched beds.\n4. **Install drip irrigation early.** It saves water and labour every month after.\n5. **Phase the work.** Do soil, irrigation and trees first; add décor, lighting and seasonal beds later.\n6. **Sign an AMC from day one.** It protects the investment you just made.",
      "## What does the process look like?",
      "| Step | What happens |\n|---|---|\n| 1. Site visit | Measure the area, check sunlight, soil, water source and drainage |\n| 2. Design & quotation | Layout, plant list, materials and a line-item quote |\n| 3. Soil preparation | Clearing, excavation if needed, fresh soil and compost |\n| 4. Hardscape & irrigation | Paths, edging, pipes and drip lines |\n| 5. Plantation & lawn | Trees, shrubs, hedges, groundcover, grass |\n| 6. Handover & AMC | Care schedule and regular maintenance |",
      "Buddy4Plant has carried out landscaping and AMC work for government offices, training institutes, a defence-corridor manufacturing unit and fuel stations across Lucknow, Kanpur and Uttar Pradesh. See our [project case studies](/blog/projects/buddy4plant-landscaping-projects-case-studies) or [plan your garden with us](/garden-services).",
      "*Cost ranges are indicative, based on [published 2026 Indian landscaping cost guides](https://www.studiomatrx.org/guides/landscape-cost-guide-india), and vary by city, site and specification.*"
    ],
    "tags": [
      "Landscaping",
      "Garden Design",
      "Cost Guide",
      "AMC",
      "Irrigation"
    ],
    "faqs": [
      {
        "q": "What is the landscaping cost per sq ft in India?",
        "a": "Roughly ₹150-₹400 per sq ft for a basic garden, ₹450-₹1,000 for mid-range and ₹1,100-₹2,500+ for premium work, according to published 2026 industry guides. A site visit is needed for an exact quote."
      },
      {
        "q": "How much does lawn installation cost in India?",
        "a": "Natural lawn installation is typically ₹25-₹60 per sq ft, depending on grass type, soil preparation and area."
      },
      {
        "q": "What is included in a garden AMC?",
        "a": "Mowing, weeding, pruning, manuring, pest control, seasonal plantation, replacement of dead plants and regular reports, depending on the agreed scope."
      }
    ],
    "related": [
      "garden-design-ideas-indian-homes",
      "buddy4plant-landscaping-projects-case-studies",
      "miyawaki-plantation-india-guide"
    ],
    "cta": {
      "label": "Plan your garden with us",
      "path": "/garden-services"
    }
  },
  {
    "id": "pillar-06",
    "slug": "best-plants-for-lucknow",
    "section": "plant-care",
    "category": "Plants & Plant Care",
    "title": "Best Plants for Lucknow: 50 Trees, Flowers, Palms & Shrubs for the Local Climate",
    "seoTitle": "Best Plants for Lucknow: 50 Trees, Flowers, Palms & Shrubs",
    "metaDescription": "50 plants that thrive in Lucknow and UP: trees, flowering plants, palms, hedges, winter flowers and low-maintenance picks for hot summers and cold winters.",
    "primaryKeyword": "best plants for Lucknow",
    "excerpt": "Lucknow's 45°C summers, heavy monsoon and foggy winters rule out many plants. These 50 handle all three.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/plant-photos/bird-of-paradise-plant-xl.jpg",
    "imageAlt": "Bird of paradise plant in a white and black pot",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** The best plants for Lucknow are heat-hardy species that also survive cold, foggy winter nights. For trees choose neem, amaltas, jamun, kadam, arjun and champa; for flowers choose bougainvillea, hibiscus, kaner, tecoma and ixora (plus marigold, petunia and calendula in winter); for hedges choose duranta, ficus panda and murraya; and for palms choose areca, foxtail and bottle palm.",
      "## What is Lucknow's climate like for plants?",
      "- **Summer (April - June):** very hot and dry, often above 40°C with hot loo winds.\n- **Monsoon (July - September):** humid with heavy rain; waterlogging in low areas.\n- **Winter (December - January):** cool days, cold nights and dense fog; tender tropical plants suffer.\n- **Soil:** mostly alluvial loam, fertile but sometimes alkaline (usar) in patches.",
      "A good Lucknow plant must handle heat, heavy rain and a cold snap - so we favour native and well-proven species.",
      "## Which trees grow best in Lucknow?",
      "| Tree | Why plant it | Size |\n|---|---|---|\n| Neem | Hardy, shade, native, low water | Large |\n| Amaltas (Indian laburnum) | Yellow flower chains in summer | Medium |\n| Jamun | Fruit, dense shade | Large |\n| Kadam | Fast growing, fragrant ball flowers | Large |\n| Arjun | Native, tolerant of wet soil | Large |\n| Champa (plumeria) | Fragrant flowers, small gardens | Small |\n| Gulmohar | Red summer canopy | Medium-large |\n| Kachnar | Orchid-like flowers in spring | Medium |\n| Harsingar (parijat) | Night-scented flowers in autumn | Small |\n| Bel | Native, sacred, very hardy | Medium |\n| Mango (grafted) | Fruit, shade | Large |\n| Guava | Fruit, fits home gardens | Small |",
      "## Which flowering plants suit Lucknow?",
      "**Summer and monsoon (heat-lovers):**",
      "| Plant | Flowers |\n|---|---|\n| Bougainvillea | Pink, magenta, white, orange - thrives in heat |\n| Hibiscus | Red, pink, yellow - almost all year |\n| Kaner (oleander) | Pink, white, yellow - very tough |\n| Tecoma | Yellow trumpets |\n| Ixora | Red/orange clusters, likes partial shade |\n| Hamelia | Orange flowers loved by butterflies |\n| Portulaca | Groundcover, full sun |\n| Vinca (sadabahar) | Almost all year |\n| Mogra (jasmine) | Fragrant summer flowers |\n| Adenium | Desert rose for pots |",
      "**Winter season (sow/plant October - November):**",
      "| Plant | Notes |\n|---|---|\n| Marigold (genda) | Easiest winter flower |\n| Petunia | Pots and hanging baskets |\n| Calendula | Orange/yellow, very reliable |\n| Dahlia | Big blooms, plant tubers in October |\n| Chrysanthemum | Pots, flowers Nov - Dec |\n| Pansy | Cool season only |\n| Sweet alyssum | Fragrant edging |\n| Salvia | Red spikes |\n| Dianthus | Borders and pots |\n| Rose | Best flush from December to March |",
      "## Which palms do well in Lucknow?",
      "| Palm | Best use | Winter note |\n|---|---|---|\n| Areca palm | Pots, screens, indoors | Protect young plants from cold wind |\n| Foxtail palm | Driveways, avenues | Hardy once established |\n| Bottle palm | Feature plant | Needs full sun |\n| Royal palm | Avenues, campuses | Large, for ground only |\n| Fishtail palm | Shade gardens | Keep out of frost |\n| Date palm (ornamental) | Dry, sunny areas | Very hardy |",
      "## What are the best hedge and border plants?",
      "- **Duranta (golden and green)** - fast, easy to shape\n- **Ficus panda** - dense, glossy, formal hedges\n- **Murraya (kamini)** - fragrant white flowers\n- **Clerodendrum inerme** - salt and heat tolerant\n- **Acalypha** - colourful foliage border\n- **Hamelia** - informal flowering hedge\n- **Bougainvillea** - thorny boundary hedge",
      "## What are the easiest low-maintenance plants for Lucknow homes?",
      "Snake plant, ZZ plant, money plant, aloe vera, jade, adenium, bougainvillea, kaner, lemongrass and curry leaf all survive Lucknow summers with little fuss.",
      "## How do I protect plants in Lucknow's summer and winter?",
      "**Summer:**",
      "- Water early morning; large pots may need a second evening watering in May-June.\n- Mulch pots and beds with dry leaves or cocopeat.\n- Use 50% green shade net for terrace plants and seedlings.\n- Do not repot or prune heavily in peak heat.",
      "**Winter:**",
      "- Water less, at midday.\n- Move areca palms, anthuriums, crotons and other tropicals away from cold, foggy winds.\n- Cover delicate plants with cloth or a plastic sheet on the coldest nights (late December - mid January).\n- Stop heavy fertilizing until February.",
      "## When is the best time to plant in Lucknow?",
      "| Plant type | Best planting time |\n|---|---|\n| Trees and shrubs | July - September (monsoon) or February - March |\n| Winter flowers | Sow September - October, transplant October - November |\n| Summer flowers | February - March |\n| Lawns | February - April or July - August |\n| Indoor plants | Any time except peak winter |",
      "Buddy4Plant is based in Lucknow and has landscaped campuses across the city, including UP 112, Van Nigam, the State Archaeology Department and Nagar Nigam projects. If you are planning a garden in Lucknow or nearby districts, [plan your garden with us](/garden-services)."
    ],
    "tags": [
      "Lucknow",
      "Uttar Pradesh",
      "Trees",
      "Flowering Plants",
      "Palms"
    ],
    "faqs": [
      {
        "q": "Which trees grow fastest in Lucknow?",
        "a": "Kadam, neem, arjun and gulmohar grow quickly in Lucknow when planted in the monsoon and watered through the first summer."
      },
      {
        "q": "Which flowers bloom in Lucknow in winter?",
        "a": "Marigold, petunia, calendula, dahlia, chrysanthemum, pansy, salvia, dianthus and roses bloom through Lucknow winters."
      },
      {
        "q": "How do I protect plants from Lucknow winter cold?",
        "a": "Water less and at midday, keep tropical plants away from cold winds and cover delicate plants on the coldest nights of late December and January."
      }
    ],
    "related": [
      "best-plants-for-home-india",
      "miyawaki-plantation-india-guide",
      "garden-design-ideas-indian-homes"
    ],
    "cta": {
      "label": "Talk to our Lucknow team",
      "path": "/garden-services"
    }
  },
  {
    "id": "pillar-07",
    "slug": "miyawaki-plantation-india-guide",
    "section": "landscaping",
    "category": "Landscaping & Miyawaki",
    "title": "Miyawaki Plantation in India: Complete Guide to Method, Plants, Cost & Maintenance",
    "seoTitle": "Miyawaki Plantation in India: Method, Plants, Cost Guide",
    "metaDescription": "How to create a Miyawaki forest in India: site survey, native plant list for UP, 3-5 saplings per sq m, soil preparation, mulching, watering, maintenance and cost.",
    "primaryKeyword": "Miyawaki plantation",
    "excerpt": "A Miyawaki forest packs 3-5 native saplings into every square metre. Here is the full method, a native plant list for Uttar Pradesh, and what it costs.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/projects/namami-gange-jal-nigam.jpg",
    "imageAlt": "Illustration of a dense green plantation site",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** The Miyawaki method creates a dense, native mini-forest by planting **3-5 saplings of many different native species in every square metre** on deeply prepared, compost-rich soil, then mulching heavily and watering regularly for the first 2-3 years. After that the forest usually sustains itself. It needs as little as 100 sq m of land to start.",
      "## What is the Miyawaki method?",
      "It was developed by Japanese botanist Dr Akira Miyawaki, who studied which species grow naturally in a region and planted them densely together. Close planting makes saplings compete for light, so they grow upward fast, and the mix of species builds a multi-layered forest that shades out weeds and holds moisture.",
      "## Why are Miyawaki forests popular in Indian cities?",
      "- They fit small urban plots, school campuses, factory boundaries and road edges.\n- They create shade, habitat for birds and insects, and a cooler micro-climate.\n- They help meet green-belt requirements for industries and CSR goals.\n- Once established, they need no fertilizer and very little care.",
      "## Which native plants should I use in Uttar Pradesh?",
      "Use 30-50 species if possible, mixed across four layers. Examples for UP and the Indo-Gangetic plains:",
      "| Layer | Role | Native species (examples) |\n|---|---|---|\n| Canopy (tallest) | Top cover | Peepal, banyan, neem, sheesham, semal, mahua, arjun |\n| Tree | Main forest body | Jamun, kadam, amla, bel, gular, pilkhan, kachnar, amaltas |\n| Sub-tree | Middle layer | Harsingar, karonda, custard apple, moringa, kaner, gudhal (hibiscus) |\n| Shrub | Ground cover and edges | Adusa (vasaka), karonda, murraya, tulsi, lemongrass |",
      "Avoid exotic ornamentals and invasive species. Buy healthy saplings about 60-90 cm tall with strong roots.",
      "## How do I prepare the soil?",
      "1. **Survey the site:** check soil type, water source, sunlight and drainage.\n2. **Excavate:** dig the planting area about 60 cm - 1 m deep.\n3. **Mix biomass:** blend the dug soil with organic material - for example rice husk or dry leaves (for air), cocopeat (for water holding) and compost or cow manure (for nutrients).\n4. **Refill and level:** make a raised, loose bed that drains well.",
      "This soil work is the most important step - and the biggest cost.",
      "## How do I plant a Miyawaki forest?",
      "- Plant **3-5 saplings per square metre**, randomly mixed - never two of the same species side by side, and never in straight rows.\n- Place taller canopy species in the middle and shrubs toward the edges.\n- Tie each sapling to a thin stick for the first months.\n- Cover the entire surface with a **thick mulch layer of straw or dry leaves** to keep moisture in and weeds out.",
      "## How much water and maintenance does it need?",
      "| Period | Care |\n|---|---|\n| First 3 months | Water daily (twice in peak summer), replace any dead saplings |\n| Months 3 - 12 | Water every 2-3 days, weed, top up mulch |\n| Year 2 - 3 | Water in dry months only, remove weeds, keep the area fenced |\n| After 3 years | Usually self-sustaining - leave it alone |",
      "Do not prune or remove fallen leaves; they become the forest's own mulch.",
      "## How much does a Miyawaki plantation cost in India?",
      "Cost depends mainly on soil preparation, sapling size, number of species, irrigation and fencing. Published Indian estimates put a Miyawaki forest at roughly **₹300-₹350 per sq ft**, and a planted sapling (including potting mix, care and wastage) at around **₹120 per plant** before site work. A proper quote needs a site survey.",
      "| Cost head | Share of budget (typical) |\n|---|---|\n| Soil excavation and biomass | Highest |\n| Saplings (3-5 per sq m) | High |\n| Mulch, stakes, tools | Low |\n| Irrigation setup | Medium |\n| Fencing | Medium |\n| 2-3 years of maintenance | Medium |",
      "## What are common mistakes?",
      "- Using a few fast-growing exotic species instead of many natives.\n- Skipping soil preparation to save money.\n- No mulch, or mulch that is too thin.\n- Stopping watering after the first monsoon.\n- Removing leaf litter to \"keep it clean\".",
      "Buddy4Plant does large-scale plantation and landscaping for government departments and institutions in Uttar Pradesh. If you are planning a Miyawaki forest for a campus, factory green belt or CSR project, [talk to our team](/garden-services).",
      "*Cost figures are indicative, based on [published Indian Miyawaki cost estimates](https://www.crowdforesting.org/expense-of-miyawaki-forests), and vary by site.*"
    ],
    "tags": [
      "Miyawaki",
      "Urban Forest",
      "Native Plants",
      "Plantation",
      "CSR"
    ],
    "faqs": [
      {
        "q": "How many plants are planted per square metre in the Miyawaki method?",
        "a": "3 to 5 saplings per square metre, using many different native species mixed randomly."
      },
      {
        "q": "How long does a Miyawaki forest need maintenance?",
        "a": "About 2-3 years of watering, weeding and mulching. After that it is usually self-sustaining."
      },
      {
        "q": "What is the minimum area for a Miyawaki forest?",
        "a": "Around 100 square metres is a practical minimum, though smaller demonstration plots are possible."
      }
    ],
    "related": [
      "best-plants-for-lucknow",
      "landscaping-cost-india",
      "buddy4plant-landscaping-projects-case-studies"
    ],
    "cta": {
      "label": "Plan a Miyawaki plantation",
      "path": "/garden-services"
    }
  },
  {
    "id": "pillar-08",
    "slug": "garden-design-ideas-indian-homes",
    "section": "landscaping",
    "category": "Landscaping & Miyawaki",
    "title": "25 Garden Design Ideas for Indian Homes: Small, Modern & Low-Maintenance Gardens",
    "seoTitle": "25 Garden Design Ideas for Indian Homes (Small & Modern)",
    "metaDescription": "25 practical garden design ideas for Indian homes: front gardens, small spaces, terraces, balconies, modern and low-maintenance designs for Indian weather.",
    "primaryKeyword": "garden design ideas",
    "excerpt": "From a 5-foot front strip to a full terrace, these 25 ideas are designed for Indian heat, monsoon and busy owners.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/projects/state-archaeology-department.jpg",
    "imageAlt": "Illustration of a landscaped garden with lawn, path and flower beds",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** Good Indian garden design starts with shade, water and upkeep, not décor. Use trees or pergolas for shade, group plants by water need, keep lawn small, choose native and heat-hardy plants, and add a path and seating so the garden gets used. The 25 ideas below are grouped by the space you have.",
      "## Front garden ideas",
      "1. **Layered border along the boundary** - tall palms or kamini at the back, hibiscus in the middle, groundcover in front.\n2. **Paver path with grass joints** - softer than a full slab, lets rain soak in.\n3. **Single statement tree** - a champa or kachnar near the gate gives shade and identity.\n4. **Potted entrance** - a pair of large planters with bougainvillea or areca palms either side of the door.\n5. **Gravel and succulents** - almost zero watering for small, sunny front strips.",
      "## Small garden ideas",
      "6. **Vertical garden on a boundary wall** - wall planters or a trellis with money plant or creepers.\n7. **Raised beds** - better soil, easier weeding, neat edges.\n8. **One focal point** - a water bowl, a big pot or a bench, not five small décor items.\n9. **Mirror or light walls** - make a narrow side yard feel wider.\n10. **Multi-use plants** - curry leaf, lemon, tulsi and mint are beautiful and useful.",
      "## Terrace and balcony ideas",
      "11. **Grow-bag kitchen garden** - light, cheap and movable. See our [kitchen garden guide](/blog/gardening/kitchen-garden-india-beginners-guide).\n12. **Shade net pergola** - 50% green shade net over a steel frame makes summer terraces usable.\n13. **Railing planters** - add colour without using floor space.\n14. **Deck tiles and a small seating corner** - turns a terrace into a room.\n15. **Drip irrigation with a timer** - essential if you travel.",
      "## Modern garden ideas",
      "16. **Clean geometry** - rectangular lawn, straight hedges, repeated planters.\n17. **Limited palette** - three or four plant types in bold groups.\n18. **Grasses and palms** - foxtail palm, lemongrass and ornamental grasses look contemporary.\n19. **Stone-finish planters** - large grey or sand-coloured planters look modern and weather well.\n20. **Warm garden lighting** - uplights on trees and path lights for evenings.",
      "## Low-maintenance ideas",
      "21. **Less lawn, more mulched beds** - lawns need the most water and mowing.\n22. **Native and hardy plants** - duranta, bougainvillea, kaner, hamelia, neem.\n23. **Group plants by water need** - succulents together, moisture lovers together.\n24. **Hedges that need trimming only a few times a year** - murraya and ficus panda.\n25. **An AMC or scheduled gardener visit** - the simplest way to keep any garden looking its best.",
      "## What should I plan before designing a garden?",
      "| Question | Why it matters |\n|---|---|\n| Where does the sun fall in summer and winter? | Decides which plants go where |\n| Where is the water source? | Plans irrigation and saves pipe cost |\n| How does rain water drain? | Avoids monsoon waterlogging |\n| How will the space be used? | Seating, play, parking, kitchen garden |\n| Who will maintain it and how often? | Decides lawn size and plant choice |\n| What is the budget? | See our [landscaping cost guide](/blog/landscaping/landscaping-cost-india) |",
      "## Which plants suit each design style?",
      "| Style | Plants |\n|---|---|\n| Traditional Indian | Tulsi, mogra, hibiscus, marigold, champa, mango, kamini |\n| Modern | Foxtail palm, snake plant, ZZ, ornamental grasses, ficus panda hedges |\n| Tropical | Areca palm, monstera, heliconia, bird of paradise, ferns |\n| Dry / low water | Bougainvillea, adenium, agave, aloe, kaner, portulaca |\n| Edible | Lemon, guava, curry leaf, chillies, herbs, gourds on trellis |",
      "Want a garden like this for your home, office or campus? Buddy4Plant designs and builds gardens across Lucknow and Uttar Pradesh. [Plan your garden with us](/garden-services)."
    ],
    "tags": [
      "Garden Design",
      "Small Gardens",
      "Terrace Garden",
      "Front Garden",
      "Low Maintenance"
    ],
    "faqs": [
      {
        "q": "How can I design a small garden in India?",
        "a": "Use vertical space with wall planters and trellises, keep one focal point, use raised beds, and choose multi-use plants such as curry leaf, lemon and herbs."
      },
      {
        "q": "What is a low-maintenance garden design?",
        "a": "A design with less lawn, more mulched beds, native and hardy plants grouped by water need, drip irrigation, and hedges that need only occasional trimming."
      },
      {
        "q": "Which plants are best for a modern garden?",
        "a": "Foxtail palm, snake plant, ZZ plant, ornamental grasses and neat ficus panda hedges suit clean, modern layouts."
      }
    ],
    "related": [
      "landscaping-cost-india",
      "best-plants-for-home-india",
      "best-plants-for-lucknow"
    ],
    "cta": {
      "label": "Get a garden design",
      "path": "/garden-services"
    }
  },
  {
    "id": "pillar-09",
    "slug": "gardening-essentials-shopping-list-india",
    "section": "gardening",
    "category": "Gardening & Soil",
    "title": "Gardening Essentials: Complete Shopping List for Beginners in India",
    "seoTitle": "Gardening Essentials: Beginner Shopping List for India",
    "metaDescription": "Gardening essentials for beginners in India: pots, soil, compost, plant food, tools, watering and pest control, plus what to buy first and what to skip.",
    "primaryKeyword": "gardening essentials",
    "excerpt": "Everything a new gardener in India actually needs - and what you can skip - from pots and soil to tools, watering and organic pest control.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/editorial/b4p-plant-food-1.jpg",
    "imageAlt": "Buddy4Plant plant food pack",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** A beginner in India needs only a short list to start: pots with drainage holes, a good potting mix (soil, compost and cocopeat), vermicompost or plant food, a trowel, a pair of pruning scissors, a watering can or spray bottle, gloves, and neem oil for pests. Buy these first; add everything else as your garden grows.",
      "## What should I buy first?",
      "| Item | Why you need it | Buddy4Plant pick |\n|---|---|---|\n| Pots with drainage holes | Prevents root rot | [Square Table Pot](/product/buddy4plant-square-plastic-pot-white), [Self-Watering Planter](/product/buddy4plant-side-self-watering-planter) |\n| Potting mix | Loose, draining soil | [Garden soil mix](/product/garden-soil-mix) |\n| Cocopeat | Keeps the mix light and moist | [Cocopeat block](/product/cocopeat-block) |\n| Vermicompost | Safe, slow organic food | [Vermicompost](/product/vermicompost) |\n| Plant food | Extra boost during growth | [Buddy4Plant Plant Food](/product/buddy4plant-plant-food) |\n| Trowel | Potting and digging | [Trowel with PVC handle](/product/trowel-with-pvc-handle) |\n| Pruner / scissors | Removing dead leaves, shaping | [Handy bypass pruner](/product/handy-bypass-pruner) |\n| Spray bottle | Misting and neem spray | [Hand trigger pump](/product/hand-trigger-pump-500-ml) |\n| Neem oil | Organic pest control | [Neem oil 100 ml](/product/neem-oil-100-ml) |\n| Gloves | Protects hands | [Gardening gloves](/product/gardening-hand-gloves) |",
      "## Which pots should beginners choose?",
      "- **Plastic pots:** light, cheap, hold moisture longer - good for most indoor plants and balconies. [Browse plastic pots](/plants/plastic-pots).\n- **Ceramic pots:** heavy and decorative - choose ones with drainage holes. [Browse ceramic pots](/plants/ceramic-pots).\n- **Self-watering pots:** a water reservoir below the soil - ideal if you travel or forget to water.\n- **Grow bags:** best for vegetables and fruit plants on terraces.",
      "Choose a pot 1-2 inches wider than the plant's current root ball. A pot that is too big stays wet and causes rot.",
      "## Which tools do I really need?",
      "| Level | Tools |\n|---|---|\n| Starter (balcony / indoor) | Trowel, pruner, spray bottle, gloves |\n| Growing garden | Add cultivator, weeder, hand rake, watering can with rose |\n| Terrace / ground garden | Add hose with spray gun, sickle, pressure sprayer, wheel barrow |",
      "See all [garden tools](/collections/garden-tools) and [watering tools](/collections/watering-tools).",
      "## What do I need for plant nutrition?",
      "- **Vermicompost** - the everyday base feed.\n- **Neem cake** - soil conditioner and pest deterrent.\n- **Bone meal** - for roots, flowers and fruit.\n- **Plant food** - a quick boost in the growing season.\n- **Epsom salt** - occasional magnesium for foliage plants.",
      "Our [soil and compost guide](/blog/gardening/best-soil-compost-for-plants-india) explains how much of each to use.",
      "## What do I need for pest control?",
      "Start organic:",
      "- Neem oil (mix 5 ml per litre with a drop of liquid soap)\n- A spray bottle\n- Yellow sticky traps for whitefly and gnats",
      "Keep stronger chemical pesticides as a last resort, follow the label exactly, and keep them away from children and pets. See [pest control](/collections/pest-control).",
      "## What can beginners skip?",
      "- Expensive soil testing kits for pots\n- Fancy decorative planters without drainage holes\n- Several different fertilizers at once\n- Large power tools for a balcony garden",
      "## A starter kit by space",
      "| Space | Starter kit |\n|---|---|\n| Indoor corner (3-4 plants) | 3-4 pots, 10 kg potting mix, 1 kg vermicompost, spray bottle, pruner |\n| Balcony (8-10 plants) | Pots + railing planters, potting mix, cocopeat block, vermicompost, trowel, gloves, neem oil |\n| Terrace kitchen garden | Grow bags, soil + compost + cocopeat, neem cake, seeds, hose + spray gun, pressure sprayer |",
      "Need help putting together a kit? Message our nursery team on WhatsApp with your space and we will suggest what to buy."
    ],
    "tags": [
      "Gardening Essentials",
      "Beginners",
      "Tools",
      "Pots",
      "Plant Food"
    ],
    "faqs": [
      {
        "q": "What are the basic gardening tools for beginners?",
        "a": "A trowel, a pruner or scissors, a spray bottle or watering can, and gloves are enough to start."
      },
      {
        "q": "Which fertilizer is best for beginners?",
        "a": "Vermicompost is the safest because it feeds slowly and does not burn roots. Add a plant food during the growing season for an extra boost."
      },
      {
        "q": "Should I buy plastic or ceramic pots?",
        "a": "Plastic pots are light, cheap and hold moisture longer. Ceramic pots look premium but are heavy; always check that they have drainage holes."
      }
    ],
    "related": [
      "best-soil-compost-for-plants-india",
      "kitchen-garden-india-beginners-guide",
      "complete-plant-care-guide-indian-weather"
    ],
    "cta": {
      "label": "Shop gardening essentials",
      "path": "/collections/plant-care"
    }
  },
  {
    "id": "pillar-10",
    "slug": "buddy4plant-landscaping-projects-case-studies",
    "section": "projects",
    "category": "Projects & Nursery",
    "title": "Buddy4Plant Landscaping Projects: Real Project Case Studies",
    "seoTitle": "Buddy4Plant Landscaping Projects & Case Studies | Lucknow",
    "metaDescription": "Real landscaping, gardening and AMC projects by Buddy4Plant for UP 112, GITI campuses, BrahMos unit, Van Nigam, Nagar Nigam Lucknow and more across Uttar Pradesh.",
    "primaryKeyword": "landscaping company Lucknow",
    "excerpt": "Government offices, training institutes, a defence-corridor unit and fuel stations: a look at the landscaping and maintenance work we've done across Uttar Pradesh.",
    "readTime": "4 min read",
    "publishDate": "Sep 29, 2026",
    "isoDate": "2026-09-29",
    "updatedDate": "2026-09-29",
    "image": "/projects/giti-campuses.jpg",
    "imageAlt": "Illustration of a landscaped campus with lawns and trees",
    "author": {
      "name": "Buddy4Plant Gardening Team",
      "role": "Nursery & landscaping experts, Lucknow",
      "avatar": "/logo.png"
    },
    "content": [
      "**Quick answer:** Buddy4Plant is a Lucknow-based nursery and landscaping company. We have delivered landscaping, gardening and Annual Maintenance Contract (AMC) work for government departments, training institutes, a defence-corridor manufacturing unit, municipal bodies and fuel stations across Lucknow, Kanpur and other districts of Uttar Pradesh.",
      "## Which projects has Buddy4Plant completed?",
      "| # | Project | Location | Type of work |\n|---|---|---|---|\n| 1 | UP 112 | Lucknow | Landscaping |\n| 2 | UP Sahkari Gram Vikas Bank | Lucknow | AMC + landscaping |\n| 3 | GITI campuses (8 sites) | Hardoi, Atroli, Mohanlalganj, Sidhauli, Charbagh, Mahila Aliganj, Sandila, Gondlamau | Gardening + landscaping |\n| 4 | BrahMos manufacturing unit | UP Defence Corridor, Lucknow node | Landscaping |\n| 5 | SSTRC ITOT | Lucknow | Landscaping |\n| 6 | Van Vibhag head office | Narahi, Lucknow | Gardening + landscaping |\n| 7 | Van Nigam head office | Lucknow | Gardening + landscaping |\n| 8 | Indian Oil and HPCL petrol pumps | Uttar Pradesh | Forecourt landscaping |\n| 9 | Centurion Defence Academy | Lucknow | Campus landscaping |\n| 10 | State Archaeology Department | Lucknow | Gardening + landscaping |\n| 11 | GITI Kanpur, Pandu Nagar | Kanpur | Gardening + landscaping |\n| 12 | MDDIT Railway Training Institute | Kanpur | Landscaping |\n| 13 | GB Pant Polytechnic | Lucknow | Campus landscaping |\n| 14 | Namami Gange - Jal Nigam | Uttar Pradesh | Landscaping + plantation |\n| 15 | Nagar Nigam Lucknow | Lucknow | Public landscaping + plantation |",
      "## What kind of sites do we work on?",
      "- **Government offices and departments** - UP 112, Van Vibhag, Van Nigam, State Archaeology, Nagar Nigam, Jal Nigam.\n- **Training and education campuses** - GITI campuses, SSTRC ITOT, MDDIT, GB Pant Polytechnic, Centurion Defence Academy.\n- **Defence and industrial** - the BrahMos manufacturing unit in the UP Defence Corridor.\n- **Commercial** - Indian Oil and HPCL fuel stations.\n- **Banking** - UP Sahkari Gram Vikas Bank (AMC).",
      "## What does multi-site maintenance look like?",
      "The GITI contract covers eight campuses in different towns. Running work across many sites needs:",
      "- One consistent standard of care at every campus\n- Seasonal plantation plans for each site\n- Regular gardener visits and supervision\n- Replacement of plants lost to heat, flooding or damage\n- Reporting to the client",
      "This is the same approach we bring to any institution with more than one location.",
      "## What does every Buddy4Plant project include?",
      "| Stage | What we do |\n|---|---|\n| Site survey | Area, sunlight, soil, water source, drainage |\n| Plan & quote | Layout, plant palette, materials, costing |\n| Soil preparation | Clearing, excavation, compost and new soil where needed |\n| Execution | Lawns, hedges, green belts, trees, flower beds, irrigation |\n| Handover | Care schedule for the client |\n| AMC | Mowing, pruning, manuring, pest control, seasonal flowers, replacements |",
      "## How do we choose plants for institutional sites?",
      "Large campuses in UP need plants that survive 45°C summers, monsoon waterlogging and cold winter nights with limited daily care. Our usual palette includes neem, amaltas, kadam, arjun and jamun for trees; foxtail and royal palms for avenues; duranta, ficus panda and murraya for hedges; and bougainvillea, hibiscus, kaner and seasonal flowers for colour. Read more in [Best Plants for Lucknow](/blog/plant-care/best-plants-for-lucknow).",
      "## Detailed case studies (coming soon)",
      "We are adding detailed case studies for individual projects, each with:",
      "- Location and site area\n- The client's objective\n- Site condition before work\n- Design and plant palette\n- Soil preparation and irrigation\n- Materials used\n- Execution photographs\n- The finished result",
      "Browse the full project list with photos on our [Gardening Services page](/garden-services).",
      "## Planning a project?",
      "Whether it is a government office, a training institute, an industrial green belt or a home garden, we will visit the site and send a clear plan and quotation. [Plan your garden with us](/garden-services) or read our [landscaping cost guide](/blog/landscaping/landscaping-cost-india) first."
    ],
    "tags": [
      "Case Studies",
      "Landscaping Projects",
      "AMC",
      "Lucknow",
      "Government Projects"
    ],
    "faqs": [
      {
        "q": "Does Buddy4Plant take government landscaping contracts?",
        "a": "Yes. We have delivered landscaping and AMC work for UP 112, Van Nigam, Van Vibhag, Nagar Nigam Lucknow, the State Archaeology Department, Namami Gange - Jal Nigam and several training institutes."
      },
      {
        "q": "Which areas does Buddy4Plant serve?",
        "a": "Across Uttar Pradesh and Delhi - Lucknow, Kanpur and nearby districts such as Hardoi, Sitapur and Barabanki, plus Delhi NCR."
      },
      {
        "q": "Do you provide Annual Maintenance Contracts (AMC)?",
        "a": "Yes. Our AMCs cover mowing, pruning, weeding, manuring, pest control, seasonal plantation, plant replacement and regular reporting."
      }
    ],
    "related": [
      "landscaping-cost-india",
      "miyawaki-plantation-india-guide",
      "garden-design-ideas-indian-homes"
    ],
    "cta": {
      "label": "See all projects",
      "path": "/garden-services"
    }
  }
];
