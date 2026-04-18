/**
 * SyncStay Co-Living Platform — Database Seed Script
 * ─────────────────────────────────────────────────────
 * Run with:  npm run db:seed
 *
 * Insertion order (dependency-safe):
 *  1. locations
 *  2. properties
 *  3. amenities
 *  4. propertyAmenities
 *  5. tags
 *  6. users   (auth-schema)
 *  7. accounts (auth-schema — credential rows for Better Auth)
 *  8. userProfiles
 *  9. userTags
 * 10. pods
 * 11. podMembers
 */

import { config } from "dotenv";
config({ path: ".env" });

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { faker } from "@faker-js/faker";
import * as schema from "../schema";
import * as authSchema from "../../auth-schema";

// ── Deterministic seed ────────────────────────────────────────────
faker.seed(42);

// ── DB connection ─────────────────────────────────────────────────
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { ...schema, ...authSchema } });

// ── Helpers ───────────────────────────────────────────────────────

function uuid() {
  return faker.string.uuid();
}

/** Returns the first day of a calendar month N months from now (ISO date string). */
function monthOffset(n: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10); // "YYYY-MM-01"
}

/** Picks N unique random items from an array. */
function pickN<T>(arr: T[], n: number): T[] {
  return faker.helpers.arrayElements(arr, n);
}

/** Picks one random item from an array. */
function pickOne<T>(arr: T[]): T {
  return faker.helpers.arrayElement(arr);
}

/** Builds a deterministic DiceBear avatar URL for seeded users. */
function profileImageUrl(seed: string): string {
  const params = new URLSearchParams({ seed });
  return `https://api.dicebear.com/9.x/lorelei/svg?${params.toString()}`;
}

/** Builds a deterministic Picsum URL using a curated static image id. */
function propertyImageUrl(imageId: number): string {
  return `https://picsum.photos/id/${imageId}/1600/900`;
}

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) return false;
  return !["0", "false", "no"].includes(value.toLowerCase());
}

function hasOverwriteFlag(): boolean {
  return (
    process.argv.slice(2).some((arg) => arg === "overwrite" || arg === "--overwrite") ||
    isTruthyFlag(process.env.npm_config_overwrite)
  );
}

async function clearExistingData() {
  console.log("🧹 Overwrite enabled. Removing existing seed data...");

  await db.delete(schema.podMembers);
  await db.delete(schema.pods);
  await db.delete(schema.userTags);
  await db.delete(schema.userProfiles);
  await db.delete(authSchema.accounts);
  await db.delete(authSchema.sessions);
  await db.delete(authSchema.verifications);
  await db.delete(authSchema.users);
  await db.delete(schema.propertyAmenities);
  await db.delete(schema.amenities);
  await db.delete(schema.properties);
  await db.delete(schema.tags);
  await db.delete(schema.locations);
}

async function syncSeedProperties(
  propertyData: ReturnType<typeof buildProperties>
) {
  for (const property of propertyData) {
    await db
      .update(schema.properties)
      .set({
        locationId: property.locationId,
        name: property.name,
        description: property.description,
        imageUrl: property.imageUrl,
        totalRooms: property.totalRooms,
        minOccupancy: property.minOccupancy,
        pricePerRoomCents: property.pricePerRoomCents,
      })
      .where(eq(schema.properties.id, property.id!));
  }
}

async function syncSeedUsers(
  userData: ReturnType<typeof buildUsers>
) {
  for (const user of userData) {
    await db
      .update(authSchema.users)
      .set({
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      })
      .where(eq(authSchema.users.id, user.id));
  }
}

async function verifySeedImages() {
  const [propertyStats] = await sql<{
    total: number | string;
    with_images: number | string;
    null_images: number | string;
  }[]>`
    select
      count(*)::int as total,
      count(image_url)::int as with_images,
      count(*) filter (where image_url is null)::int as null_images
    from properties
  `;

  const [userStats] = await sql<{
    total: number | string;
    with_images: number | string;
    null_images: number | string;
  }[]>`
    select
      count(*)::int as total,
      count(image)::int as with_images,
      count(*) filter (where image is null)::int as null_images
    from users
  `;

  const propertyNullImages = Number(propertyStats.null_images);
  const userNullImages = Number(userStats.null_images);

  if (propertyNullImages > 0 || userNullImages > 0) {
    throw new Error(
      `Seed verification failed: properties with NULL image_url=${propertyNullImages}, users with NULL image=${userNullImages}`
    );
  }

  console.log("🖼️ Verified property and profile images are populated.");
}

// ── 1. Location data ──────────────────────────────────────────────

function buildLocations() {
  return [
    { id: uuid(), name: "Lisbon", country: "Portugal", slug: "lisbon" },
    { id: uuid(), name: "Porto", country: "Portugal", slug: "porto" },
    { id: uuid(), name: "Valencia", country: "Spain", slug: "valencia" },
    { id: uuid(), name: "Barcelona", country: "Spain", slug: "barcelona" },
    { id: uuid(), name: "Málaga", country: "Spain", slug: "malaga" },
    { id: uuid(), name: "Palma de Mallorca", country: "Spain", slug: "palma" },
    { id: uuid(), name: "Athens", country: "Greece", slug: "athens" },
    { id: uuid(), name: "Split", country: "Croatia", slug: "split" },
  ];
}

// ── 2. Property data ──────────────────────────────────────────────

function buildProperties(
  locations: ReturnType<typeof buildLocations>
): (typeof schema.properties.$inferInsert)[] {
  const loc = (slug: string) =>
    locations.find((l) => l.slug === slug)!.id;

  return [
    {
      id: uuid(),
      locationId: loc("lisbon"),
      name: "Casa da Luz — Alfama Retreat",
      description:
        "A fully restored 18th-century townhouse perched above Alfama's terracotta rooftops. Three wraparound terraces spill into each other, framing sweeping views of the Tagus estuary at golden hour. The whitewashed interiors fuse Azulejo heritage with bespoke mid-century furniture hand-selected in Cascais. Fast symmetrical fiber, a cedar garden studio for deep work, and a rooftop plunge pool make this Lisbon's most coveted creative retreat.",
      imageUrl: propertyImageUrl(1067),
      totalRooms: 5,
      minOccupancy: 3,
      pricePerRoomCents: 189000,
    },
    {
      id: uuid(),
      locationId: loc("lisbon"),
      name: "Miradouro House — Príncipe Real",
      description:
        "Hidden behind a wrought-iron gate in Príncipe Real's most sought-after block, this four-bedroom manor is a love letter to slow mornings and inspired evenings. Original herringbone parquet, statement arched windows, and a courtyard fig tree anchor the space. The kitchen is a chef's dream — marble island, professional range, espresso alcove. Three minutes walk to the Sunday organic market.",
      imageUrl: propertyImageUrl(1048),
      totalRooms: 4,
      minOccupancy: 2,
      pricePerRoomCents: 149000,
    },
    {
      id: uuid(),
      locationId: loc("porto"),
      name: "Ribeira Loft Collective",
      description:
        "A converted 19th-century wine warehouse steps from the Douro River, reimagined as an airy loft collective with exposed granite walls and steel mezzanines. Each room opens onto a shared gallery walkway overlooking the soaring original nave. The ground level hosts a fully equipped podcast studio, a vinyl lounge, and a professional coffee bar. UNESCO-listed Cais da Ribeira begins at the front door.",
      imageUrl: propertyImageUrl(1031),
      totalRooms: 6,
      minOccupancy: 4,
      pricePerRoomCents: 129000,
    },
    {
      id: uuid(),
      locationId: loc("porto"),
      name: "Vila das Flores — Bonfim Studio House",
      description:
        "A sun-drenched early-20th-century villa in Porto's creative Bonfim quarter, lovingly converted into a six-room coliving sanctuary. The double-height garden pavilion doubles as a serene co-working studio by day and an intimate screening room by night. Locally roasted coffee is permanently stocked, the garden produces herbs year-round, and the tram to the beach departs from the corner.",
      imageUrl: propertyImageUrl(1025),
      totalRooms: 6,
      minOccupancy: 4,
      pricePerRoomCents: 119000,
    },
    {
      id: uuid(),
      locationId: loc("valencia"),
      name: "El Carmen Social House",
      description:
        "Inside Valencia's medieval walled quarter, this jaw-dropping 16th-century palacete has been restored with obsessive precision — original stone arches, hand-painted ceilings, and a tranquil inner cloister courtyard where jasmine climbs the walls. The four bedrooms are built for focus; the communal rooftop is built for life. Five-minute bike ride to the city's co-working strip along Colón.",
      imageUrl: propertyImageUrl(1018),
      totalRooms: 4,
      minOccupancy: 3,
      pricePerRoomCents: 139000,
    },
    {
      id: uuid(),
      locationId: loc("barcelona"),
      name: "Eixample Skyline Penthouse",
      description:
        "A full-floor penthouse crowning an early Modernisme building in the heart of Eixample — Gaudí's neighbourhood, your creative laboratory. Floor-to-ceiling windows frame an unbroken panorama from Tibidabo to the sea. The interiors are a deliberate counterpoint: warm walnut, linen, and copper tones that ground the soaring space. Two private work pods with standing desks and monitor screens ensure focus never competes with the view.",
      imageUrl: propertyImageUrl(1008),
      totalRooms: 4,
      minOccupancy: 2,
      pricePerRoomCents: 219000,
    },
    {
      id: uuid(),
      locationId: loc("barcelona"),
      name: "Poblenou Maker Loft",
      description:
        "Barcelona's fastest-evolving tech quarter hosts this 300 m² live/work loft, converted from a 1960s printing house. Polished concrete meets Bauhaus-inspired furniture; the original overhead cranes are now sculptural bookmarks in the double-height workspace. A private rooftop deck, on-site film darkroom, and 2 Gbps symmetrical fiber make this the studio where digital creators come to produce their best work.",
      imageUrl: propertyImageUrl(1005),
      totalRooms: 5,
      minOccupancy: 3,
      pricePerRoomCents: 179000,
    },
    {
      id: uuid(),
      locationId: loc("malaga"),
      name: "Sol y Mar — Málaga Centro",
      description:
        "A light-flooded Andalusian townhouse in Málaga's buzzing historic centre, one block from the Picasso Museum. The five en-suite bedrooms are wrapped in hand-glazed terracotta and linen — cool even in deepest summer. A rooftop hammam terrace with a heated plunge pool presides over a roofscape of orange trees and church domes. Fibre broadband, a private courtyard, and daily fresh-squeezed orange juice are standard.",
      imageUrl: propertyImageUrl(999),
      totalRooms: 5,
      minOccupancy: 3,
      pricePerRoomCents: 109000,
    },
    {
      id: uuid(),
      locationId: loc("palma"),
      name: "Finca Digital — Sineu Valley",
      description:
        "Thirty minutes from Palma's old town, this restored Mallorcan finca sits in an almond grove with unfettered views across the Tramuntana foothills. Stone walls, exposed timber beams, and a saltwater infinity pool overlooking silent countryside. An on-site yoga shala opens at dawn; the chef-grade kitchen hosts weekly communal dinners. The island's best beaches are 25 minutes away — so is Palma airport.",
      imageUrl: propertyImageUrl(988),
      totalRooms: 6,
      minOccupancy: 4,
      pricePerRoomCents: 159000,
    },
    {
      id: uuid(),
      locationId: loc("athens"),
      name: "Acropolis View Collective",
      description:
        "A fully renovated neoclassical mansion in Athens's artsy Koukaki district, where every window frames the floodlit Parthenon after dark. Marble floors cooled by Mediterranean breezes, a rooftop al-fresco kitchen for evening gatherings, and an underground library stocked with philosophy, architecture, and design volumes. The neighbourhood is dense with microbreweries, natural-wine bars, and independent bookshops — Athens at its most liveable.",
      imageUrl: propertyImageUrl(976),
      totalRooms: 5,
      minOccupancy: 3,
      pricePerRoomCents: 99000,
    },
    {
      id: uuid(),
      locationId: loc("athens"),
      name: "Monastiraki Tech House",
      description:
        "In the shadow of the ancient Agora, this four-storey townhouse pulses with the energy of Athens's booming startup scene. Each floor has been converted into a self-contained suite with private kitchenette and a dedicated 4K monitor workspace. The shared rooftop bar is the city's worst-kept secret — sunset cocktails with the Acropolis as your backdrop, six nights a week.",
      imageUrl: propertyImageUrl(944),
      totalRooms: 4,
      minOccupancy: 2,
      pricePerRoomCents: 89000,
    },
    {
      id: uuid(),
      locationId: loc("split"),
      name: "Dioklecijan House — Diocletian's Quarter",
      description:
        "Embedded within the living walls of Diocletian's Palace — a UNESCO site dating to 305 AD — this extraordinary residence puts 1,700 years of history at your doorstep. Vaulted Roman ceilings, stone walls a metre thick, and a private terrace above the Peristyle square are complemented by thoroughly modern amenities: 10 Gbps fibre, Sonos throughout, and an architect-designed co-working loft in the old stables. The Adriatic is a four-minute walk.",
      imageUrl: propertyImageUrl(930),
      totalRooms: 5,
      minOccupancy: 3,
      pricePerRoomCents: 134000,
    },
  ];
}

// ── 3. Amenities ──────────────────────────────────────────────────

const AMENITY_DEFS = [
  { label: "High-Speed Fibre (1 Gbps+)", icon: "wifi" },
  { label: "Rooftop Terrace", icon: "sun" },
  { label: "Private Ensuite Bathroom", icon: "bath" },
  { label: "Dedicated Co-Working Studio", icon: "laptop" },
  { label: "Saltwater Pool", icon: "waves" },
  { label: "Plunge Pool", icon: "droplet" },
  { label: "Air Conditioning", icon: "wind" },
  { label: "Chef-Grade Kitchen", icon: "chef-hat" },
  { label: "Espresso Bar", icon: "coffee" },
  { label: "Standing Desks & Monitors (4K)", icon: "monitor" },
  { label: "Podcast / Recording Studio", icon: "mic" },
  { label: "Yoga Shala", icon: "activity" },
  { label: "Laundry In-Unit", icon: "shirt" },
  { label: "Bike Storage & Rental", icon: "bike" },
  { label: "Secure Underground Parking", icon: "car" },
  { label: "Hammam / Sauna", icon: "flame" },
  { label: "Outdoor Cinema", icon: "film" },
  { label: "Communal Vegetable Garden", icon: "leaf" },
  { label: "Vinyl Lounge", icon: "music" },
  { label: "EV Charging", icon: "zap" },
] as const;

function buildAmenities() {
  return AMENITY_DEFS.map((a) => ({ id: uuid(), label: a.label, icon: a.icon }));
}

/** Assign a curated set of amenities to each property. */
function buildPropertyAmenities(
  properties: ReturnType<typeof buildProperties>,
  amenities: ReturnType<typeof buildAmenities>
) {
  const find = (label: string) => amenities.find((a) => a.label === label)!.id;

  // Base amenities every property has
  const base = [
    "High-Speed Fibre (1 Gbps+)",
    "Air Conditioning",
    "Laundry In-Unit",
  ];

  // Curated extras per property index
  const extras: string[][] = [
    // 0 — Casa da Luz, Lisbon
    ["Rooftop Terrace", "Plunge Pool", "Dedicated Co-Working Studio", "Chef-Grade Kitchen", "Espresso Bar"],
    // 1 — Miradouro House, Lisbon
    ["Rooftop Terrace", "Chef-Grade Kitchen", "Espresso Bar", "Bike Storage & Rental"],
    // 2 — Ribeira Loft Collective, Porto
    ["Podcast / Recording Studio", "Vinyl Lounge", "Espresso Bar", "Dedicated Co-Working Studio"],
    // 3 — Vila das Flores, Porto
    ["Dedicated Co-Working Studio", "Communal Vegetable Garden", "Espresso Bar", "Outdoor Cinema"],
    // 4 — El Carmen Social House, Valencia
    ["Rooftop Terrace", "Chef-Grade Kitchen", "Bike Storage & Rental", "Communal Vegetable Garden"],
    // 5 — Eixample Skyline Penthouse, Barcelona
    ["Rooftop Terrace", "Standing Desks & Monitors (4K)", "Espresso Bar", "Hammam / Sauna", "EV Charging"],
    // 6 — Poblenou Maker Loft, Barcelona
    ["Dedicated Co-Working Studio", "Standing Desks & Monitors (4K)", "Rooftop Terrace", "Podcast / Recording Studio"],
    // 7 — Sol y Mar, Málaga
    ["Rooftop Terrace", "Hammam / Sauna", "Plunge Pool", "Espresso Bar", "Chef-Grade Kitchen"],
    // 8 — Finca Digital, Palma
    ["Saltwater Pool", "Yoga Shala", "Chef-Grade Kitchen", "Communal Vegetable Garden", "Outdoor Cinema", "Secure Underground Parking"],
    // 9 — Acropolis View, Athens
    ["Rooftop Terrace", "Chef-Grade Kitchen", "Espresso Bar", "Dedicated Co-Working Studio"],
    // 10 — Monastiraki Tech House, Athens
    ["Rooftop Terrace", "Standing Desks & Monitors (4K)", "Espresso Bar"],
    // 11 — Dioklecijan House, Split
    ["Dedicated Co-Working Studio", "Standing Desks & Monitors (4K)", "Rooftop Terrace", "Espresso Bar", "Bike Storage & Rental"],
  ];

  const rows: { propertyId: string; amenityId: string }[] = [];

  properties.forEach((prop, i) => {
    const allLabels = [...base, ...(extras[i] ?? [])];
    const unique = [...new Set(allLabels)];
    for (const label of unique) {
      rows.push({ propertyId: prop.id!, amenityId: find(label) });
    }
  });

  return rows;
}

// ── 4. Tags (interest labels) ─────────────────────────────────────

const TAG_LABELS = [
  "Surfing", "Yoga", "Hiking", "Photography", "Gaming",
  "Reading", "Music Production", "Cooking", "Rock Climbing", "Diving",
  "Skateboarding", "Art & Design", "Writing", "Dancing", "Martial Arts",
  "Cycling", "Coffee Culture", "Mindfulness", "Travel Hacking", "Film",
  "Entrepreneurship", "Open Source", "Web3", "Language Learning", "Wine",
];

function buildTags() {
  return TAG_LABELS.map((label) => ({ id: uuid(), label }));
}

// ── 5. User + profile data ────────────────────────────────────────

interface TravelerSpec {
  name: string;
  email: string;
  birthday: string;
  bio: string;
  chronotype: "EARLY_BIRD" | "STANDARD" | "NIGHT_OWL";
  workStartHour: number;
  workEndHour: number;
  workStyle: "DEEP_FOCUS" | "MIXED" | "MOSTLY_CALLS" | "LIGHT";
  cleanliness: number;
  socialEnergy: number;
  budgetTier: "BUDGET" | "MID_RANGE" | "PREMIUM";
  interests: string[];
}

const TRAVELER_SPECS: TravelerSpec[] = [
  {
    name: "Mia Bauer",
    email: "mia.bauer@example.com",
    birthday: "1997-03-14",
    bio: "Product designer from Berlin. Mornings for yoga, evenings for cooking experiments. I need calm, focused housemates who also like occasional surf trips and gallery visits.",
    chronotype: "EARLY_BIRD",
    workStartHour: 8,
    workEndHour: 17,
    workStyle: "DEEP_FOCUS",
    cleanliness: 4,
    socialEnergy: 3,
    budgetTier: "MID_RANGE",
    interests: ["Yoga", "Surfing", "Cooking", "Art & Design", "Photography"],
  },
  {
    name: "Luca Esposito",
    email: "luca.esposito@example.com",
    birthday: "1994-07-22",
    bio: "Full-stack engineer from Naples. I work hard 10–7 then cook elaborate pasta and argue about espresso. Strong opinions on everything except house rules — chill about those.",
    chronotype: "STANDARD",
    workStartHour: 10,
    workEndHour: 19,
    workStyle: "DEEP_FOCUS",
    cleanliness: 3,
    socialEnergy: 4,
    budgetTier: "MID_RANGE",
    interests: ["Cooking", "Coffee Culture", "Film", "Cycling", "Open Source"],
  },
  {
    name: "Zoë Andersen",
    email: "zoe.andersen@example.com",
    birthday: "2000-11-05",
    bio: "UX researcher and podcast host. Obsessed with human behaviour and third-wave coffee. I record interviews from home so I need a quiet space — but I'm the life of the party after 7 PM.",
    chronotype: "STANDARD",
    workStartHour: 9,
    workEndHour: 18,
    workStyle: "MOSTLY_CALLS",
    cleanliness: 4,
    socialEnergy: 5,
    budgetTier: "PREMIUM",
    interests: ["Coffee Culture", "Writing", "Dancing", "Travel Hacking", "Mindfulness"],
  },
  {
    name: "Kai Nakamura",
    email: "kai.nakamura@example.com",
    birthday: "1996-02-28",
    bio: "Indie iOS developer from Kyoto, now permanently nomadic. Ship code 6–14, hit the water by 3. Minimal footprint, zero drama. Looking for housemates who understand that silence is community.",
    chronotype: "EARLY_BIRD",
    workStartHour: 6,
    workEndHour: 14,
    workStyle: "DEEP_FOCUS",
    cleanliness: 5,
    socialEnergy: 2,
    budgetTier: "MID_RANGE",
    interests: ["Surfing", "Diving", "Mindfulness", "Photography", "Open Source"],
  },
  {
    name: "Amara Osei",
    email: "amara.osei@example.com",
    birthday: "1999-08-17",
    bio: "Climate-tech founder from Accra. I run morning runs and board meetings with equal energy. My ideal pod is ambitious, values-aligned, and doesn't leave dishes in the sink.",
    chronotype: "EARLY_BIRD",
    workStartHour: 7,
    workEndHour: 18,
    workStyle: "MIXED",
    cleanliness: 5,
    socialEnergy: 4,
    budgetTier: "PREMIUM",
    interests: ["Entrepreneurship", "Hiking", "Yoga", "Language Learning", "Coffee Culture"],
  },
  {
    name: "Sébastien Moreau",
    email: "sebastien.moreau@example.com",
    birthday: "1992-12-03",
    bio: "Freelance motion designer from Lyon. My hours are flexible and my taste is not. I make beats on weekends, cook French food on Sundays, and need my workspace to be sacred territory.",
    chronotype: "NIGHT_OWL",
    workStartHour: 13,
    workEndHour: 22,
    workStyle: "DEEP_FOCUS",
    cleanliness: 4,
    socialEnergy: 3,
    budgetTier: "MID_RANGE",
    interests: ["Music Production", "Art & Design", "Film", "Cooking", "Dancing"],
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    birthday: "1998-04-11",
    bio: "Content strategist & travel writer from Mumbai. I'm on calls with London in the afternoon and writing from cafés in the morning. One espresso in hand, one chapter in progress, always.",
    chronotype: "STANDARD",
    workStartHour: 9,
    workEndHour: 19,
    workStyle: "MIXED",
    cleanliness: 3,
    socialEnergy: 4,
    budgetTier: "MID_RANGE",
    interests: ["Writing", "Coffee Culture", "Travel Hacking", "Photography", "Language Learning"],
  },
  {
    name: "Felix Wagner",
    email: "felix.wagner@example.com",
    birthday: "1995-09-30",
    bio: "DevOps engineer from Hamburg. I automate infrastructure by day and climb walls by night. Not here for the social program — here for the Wi-Fi, the view, and the crew who gets it.",
    chronotype: "STANDARD",
    workStartHour: 9,
    workEndHour: 17,
    workStyle: "DEEP_FOCUS",
    cleanliness: 3,
    socialEnergy: 2,
    budgetTier: "BUDGET",
    interests: ["Rock Climbing", "Hiking", "Gaming", "Open Source", "Cycling"],
  },
  {
    name: "Nadia El-Amin",
    email: "nadia.elamin@example.com",
    birthday: "2001-01-20",
    bio: "Fashion photographer from Cairo. My days revolve around locations, golden hour, and deadlines. I'm social when the shoot is done — expect impromptu gallery crawls and late rooftop dinners.",
    chronotype: "STANDARD",
    workStartHour: 10,
    workEndHour: 19,
    workStyle: "LIGHT",
    cleanliness: 4,
    socialEnergy: 4,
    budgetTier: "MID_RANGE",
    interests: ["Photography", "Art & Design", "Dancing", "Film", "Language Learning"],
  },
  {
    name: "Tom Eriksson",
    email: "tom.eriksson@example.com",
    birthday: "1993-06-08",
    bio: "Serial bootstrapper from Stockholm. Three exits, currently building number four in the health-tech space. I'm looking for a pod that has ambition in the water and doesn't take itself too seriously.",
    chronotype: "EARLY_BIRD",
    workStartHour: 6,
    workEndHour: 16,
    workStyle: "MIXED",
    cleanliness: 4,
    socialEnergy: 4,
    budgetTier: "PREMIUM",
    interests: ["Entrepreneurship", "Mindfulness", "Cycling", "Coffee Culture", "Wine"],
  },
  {
    name: "Isabel Vázquez",
    email: "isabel.vazquez@example.com",
    birthday: "1997-10-25",
    bio: "UX/UI designer from Mexico City. Speaks three languages, surfs badly, cooks well. My design process is loud with music and quiet with distractions — Spotify playing, Slack on Do Not Disturb.",
    chronotype: "STANDARD",
    workStartHour: 10,
    workEndHour: 19,
    workStyle: "DEEP_FOCUS",
    cleanliness: 3,
    socialEnergy: 4,
    budgetTier: "MID_RANGE",
    interests: ["Surfing", "Cooking", "Music Production", "Art & Design", "Dancing"],
  },
  {
    name: "Arjun Mehta",
    email: "arjun.mehta@example.com",
    birthday: "1996-05-17",
    bio: "Backend Rust developer from Bangalore. I code from midnight to noon and sleep like a human from 1–8 PM. If you're a night owl running async from Asia, we'll get along perfectly.",
    chronotype: "NIGHT_OWL",
    workStartHour: 0,
    workEndHour: 12,
    workStyle: "DEEP_FOCUS",
    cleanliness: 3,
    socialEnergy: 2,
    budgetTier: "BUDGET",
    interests: ["Gaming", "Open Source", "Reading", "Martial Arts", "Coffee Culture"],
  },
  {
    name: "Clara Bonnet",
    email: "clara.bonnet@example.com",
    birthday: "2000-03-03",
    bio: "Food & hospitality consultant from Paris. I believe the kitchen is the heart of any home and that a shared meal solves almost everything. Extremely clean, extremely French about food.",
    chronotype: "STANDARD",
    workStartHour: 9,
    workEndHour: 17,
    workStyle: "MIXED",
    cleanliness: 5,
    socialEnergy: 5,
    budgetTier: "PREMIUM",
    interests: ["Cooking", "Wine", "Language Learning", "Art & Design", "Mindfulness"],
  },
  {
    name: "Marcus Thompson",
    email: "marcus.thompson@example.com",
    birthday: "1994-08-12",
    bio: "Cybersecurity consultant from Austin. I work remotely for three US clients across time zones, which makes me a professional night person. Weekend hiker, occasional trail runner, habitual overthinker.",
    chronotype: "NIGHT_OWL",
    workStartHour: 14,
    workEndHour: 23,
    workStyle: "DEEP_FOCUS",
    cleanliness: 3,
    socialEnergy: 2,
    budgetTier: "MID_RANGE",
    interests: ["Hiking", "Rock Climbing", "Reading", "Open Source", "Mindfulness"],
  },
  {
    name: "Yuki Tanaka",
    email: "yuki.tanaka@example.com",
    birthday: "1999-12-19",
    bio: "Illustrator and visual storyteller from Osaka. I paint in silence and talk in colour. Looking for a home that values beauty, quiet mornings, and the occasional midnight brainstorm.",
    chronotype: "NIGHT_OWL",
    workStartHour: 13,
    workEndHour: 22,
    workStyle: "DEEP_FOCUS",
    cleanliness: 4,
    socialEnergy: 2,
    budgetTier: "MID_RANGE",
    interests: ["Art & Design", "Photography", "Writing", "Film", "Mindfulness"],
  },
  {
    name: "Santiago Rojas",
    email: "santiago.rojas@example.com",
    birthday: "1995-01-29",
    bio: "Growth hacker and entrepreneur from Bogotá. I split my time between strategy decks and salsa dancing. I work hard, play louder, and need housemates who can tell the difference between my two modes.",
    chronotype: "STANDARD",
    workStartHour: 9,
    workEndHour: 18,
    workStyle: "MOSTLY_CALLS",
    cleanliness: 3,
    socialEnergy: 5,
    budgetTier: "MID_RANGE",
    interests: ["Dancing", "Entrepreneurship", "Travel Hacking", "Web3", "Language Learning"],
  },
  {
    name: "Leila Hassan",
    email: "leila.hassan@example.com",
    birthday: "1998-07-04",
    bio: "Environmental lawyer and activist from Beirut. My work is serious; my evenings are not. Champion of communal dinners, terrible at small talk, excellent in deep conversation after 10 PM.",
    chronotype: "STANDARD",
    workStartHour: 8,
    workEndHour: 17,
    workStyle: "MIXED",
    cleanliness: 4,
    socialEnergy: 3,
    budgetTier: "PREMIUM",
    interests: ["Yoga", "Reading", "Wine", "Cooking", "Language Learning"],
  },
  {
    name: "Finn O'Sullivan",
    email: "finn.osullivan@example.com",
    birthday: "1993-04-16",
    bio: "Freelance data journalist from Dublin. I find stories in spreadsheets and tell them with graphs. Coffee-shop nomad by preference, early bird by constitution, craft beer connoisseur by culture.",
    chronotype: "EARLY_BIRD",
    workStartHour: 7,
    workEndHour: 16,
    workStyle: "LIGHT",
    cleanliness: 3,
    socialEnergy: 3,
    budgetTier: "BUDGET",
    interests: ["Writing", "Coffee Culture", "Cycling", "Reading", "Travel Hacking"],
  },
  {
    name: "Hana Kovář",
    email: "hana.kovar@example.com",
    birthday: "2001-09-07",
    bio: "Brand strategist from Prague. I run on black coffee and morning markets. My best creative breakthroughs happen in transit — airports, trains, ferries. Always one carry-on, zero checked bags.",
    chronotype: "EARLY_BIRD",
    workStartHour: 7,
    workEndHour: 16,
    workStyle: "MIXED",
    cleanliness: 4,
    socialEnergy: 3,
    budgetTier: "MID_RANGE",
    interests: ["Photography", "Coffee Culture", "Art & Design", "Language Learning", "Mindfulness"],
  },
  {
    name: "Dmitri Volkov",
    email: "dmitri.volkov@example.com",
    birthday: "1992-11-24",
    bio: "Quantitative trader from Moscow, now stateless by choice. I think in probabilities and act with precision. Need total silence until 2 PM. After that, I'm surprisingly fun at dinner tables.",
    chronotype: "NIGHT_OWL",
    workStartHour: 0,
    workEndHour: 14,
    workStyle: "DEEP_FOCUS",
    cleanliness: 5,
    socialEnergy: 2,
    budgetTier: "PREMIUM",
    interests: ["Reading", "Chess", "Wine", "Mindfulness", "Film"],
  },
  {
    name: "Chiara Ricci",
    email: "chiara.ricci@example.com",
    birthday: "1997-02-14",
    bio: "Travel photographer from Florence. Chasing light from dawn to dusk, editing until midnight. Looking for housemates who appreciate a kitchen that smells of garlic and a living room that looks like a mood board.",
    chronotype: "EARLY_BIRD",
    workStartHour: 6,
    workEndHour: 15,
    workStyle: "LIGHT",
    cleanliness: 4,
    socialEnergy: 4,
    budgetTier: "MID_RANGE",
    interests: ["Photography", "Art & Design", "Cooking", "Film", "Hiking"],
  },
  {
    name: "Ben Okafor",
    email: "ben.okafor@example.com",
    birthday: "1996-06-30",
    bio: "Web3 developer from Lagos. I build in Solidity and Rust and believe the next internet is decentralised. Night-shift coder, morning meditator. Gym before the laptop, always.",
    chronotype: "NIGHT_OWL",
    workStartHour: 15,
    workEndHour: 23,
    workStyle: "DEEP_FOCUS",
    cleanliness: 3,
    socialEnergy: 3,
    budgetTier: "MID_RANGE",
    interests: ["Web3", "Open Source", "Mindfulness", "Martial Arts", "Gaming"],
  },
  {
    name: "Alma Lindqvist",
    email: "alma.lindqvist@example.com",
    birthday: "2000-06-02",
    bio: "Wellness tech founder from Stockholm. I build apps that help people sleep better — which is ironic since I work until 1 AM. Passionate about biohacking, cold plunges, and group saunas.",
    chronotype: "NIGHT_OWL",
    workStartHour: 12,
    workEndHour: 22,
    workStyle: "MOSTLY_CALLS",
    cleanliness: 5,
    socialEnergy: 5,
    budgetTier: "PREMIUM",
    interests: ["Entrepreneurship", "Mindfulness", "Yoga", "Web3", "Dancing"],
  },
  {
    name: "Ryo Fujimoto",
    email: "ryo.fujimoto@example.com",
    birthday: "1998-10-14",
    bio: "Game developer at an indie studio from Tokyo. I spend 10 hours in flow state, emerge for ramen and green tea, then do it again. Ultra-clean workspace, zero tolerance for chaos.",
    chronotype: "STANDARD",
    workStartHour: 10,
    workEndHour: 20,
    workStyle: "DEEP_FOCUS",
    cleanliness: 5,
    socialEnergy: 2,
    budgetTier: "MID_RANGE",
    interests: ["Gaming", "Music Production", "Art & Design", "Reading", "Cooking"],
  },
  {
    name: "Nina Petrović",
    email: "nina.petrovic@example.com",
    birthday: "2002-04-01",
    bio: "Graphic novelist from Belgrade. I world-build from 9 to 5 and then I need people and noise — markets, bars, live music. My pod should be a library by day and a living room by night.",
    chronotype: "STANDARD",
    workStartHour: 9,
    workEndHour: 17,
    workStyle: "DEEP_FOCUS",
    cleanliness: 3,
    socialEnergy: 5,
    budgetTier: "MID_RANGE",
    interests: ["Art & Design", "Writing", "Film", "Dancing", "Travel Hacking"],
  },
  {
    name: "Lorenzo Bianchi",
    email: "lorenzo.bianchi@example.com",
    birthday: "1994-03-19",
    bio: "Venture capitalist turned solopreneur from Milan. Left the fund to build a media brand for the next generation of European founders. Obsessive about podcasting, wine, and early Tuesday mornings.",
    chronotype: "EARLY_BIRD",
    workStartHour: 6,
    workEndHour: 14,
    workStyle: "MOSTLY_CALLS",
    cleanliness: 4,
    socialEnergy: 5,
    budgetTier: "PREMIUM",
    interests: ["Entrepreneurship", "Wine", "Podcast / Recording Studio", "Coffee Culture", "Cycling"],
  },
  {
    name: "Aisha Traoré",
    email: "aisha.traore@example.com",
    birthday: "1999-09-11",
    bio: "Social media strategist and dancer from Dakar. I create content in the golden hours and choreograph evenings. Warm, loud, and infectiously enthusiastic — with the headphones to match.",
    chronotype: "STANDARD",
    workStartHour: 10,
    workEndHour: 19,
    workStyle: "LIGHT",
    cleanliness: 3,
    socialEnergy: 5,
    budgetTier: "BUDGET",
    interests: ["Dancing", "Music Production", "Photography", "Language Learning", "Cooking"],
  },
  {
    name: "Callum Reid",
    email: "callum.reid@example.com",
    birthday: "1995-12-08",
    bio: "Principal engineer at a fully remote SaaS company from Edinburgh. I value autonomy, directness, and excellent coffee. Working from the same house as my housemates is a feature, not a bug.",
    chronotype: "EARLY_BIRD",
    workStartHour: 8,
    workEndHour: 17,
    workStyle: "MIXED",
    cleanliness: 4,
    socialEnergy: 3,
    budgetTier: "MID_RANGE",
    interests: ["Hiking", "Rock Climbing", "Coffee Culture", "Open Source", "Cycling"],
  },
  {
    name: "Valentina Cruz",
    email: "valentina.cruz@example.com",
    birthday: "1996-08-23",
    bio: "Creative director and brand consultant from Buenos Aires. I think in concepts, speak in metaphors, and dress in linen. My mornings are sacred (do not disturb). My evenings are yours.",
    chronotype: "STANDARD",
    workStartHour: 10,
    workEndHour: 18,
    workStyle: "DEEP_FOCUS",
    cleanliness: 4,
    socialEnergy: 4,
    budgetTier: "PREMIUM",
    interests: ["Art & Design", "Film", "Photography", "Wine", "Language Learning"],
  },
  {
    name: "Jonas Müller",
    email: "jonas.mueller@example.com",
    birthday: "1991-05-05",
    bio: "Machine learning engineer from Stuttgart, ex-FAANG. I work on model training, which means my laptop fans scream while I actually have nothing to do. Quiet, precise, pathologically organised.",
    chronotype: "STANDARD",
    workStartHour: 9,
    workEndHour: 18,
    workStyle: "DEEP_FOCUS",
    cleanliness: 5,
    socialEnergy: 2,
    budgetTier: "MID_RANGE",
    interests: ["Open Source", "Rock Climbing", "Cycling", "Reading", "Coffee Culture"],
  },
];

function buildUsers(specs: TravelerSpec[]) {
  const now = new Date();
  return specs.map((s) => ({
    id: uuid(),
    name: s.name,
    email: s.email,
    emailVerified: true as boolean,
    image: profileImageUrl(s.name),
    createdAt: now,
    updatedAt: now,
  }));
}

/** Credential rows — Better Auth credential provider format. */
function buildAccounts(users: ReturnType<typeof buildUsers>) {
  const now = new Date();
  // Use a fixed bcrypt-style hash of "password123" for all seed users.
  // Better Auth uses its own hashing layer; for seeding we store a recognisable
  // placeholder. In a real seed you'd call betterAuth.hashPassword() — here we
  // note it in comments for easy replacement.
  const PLACEHOLDER_PASSWORD_HASH =
    "$2b$10$SEEDEDHASHDOESNOTMATCHREALLOGINBUTISVALIDFORDBCONSTRAINT";

  return users.map((u) => ({
    id: uuid(),
    accountId: u.id,
    providerId: "credential",
    userId: u.id,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    idToken: null as string | null,
    accessTokenExpiresAt: null as Date | null,
    refreshTokenExpiresAt: null as Date | null,
    scope: null as string | null,
    password: PLACEHOLDER_PASSWORD_HASH,
    createdAt: now,
    updatedAt: now,
  }));
}

function buildUserProfiles(
  specs: TravelerSpec[],
  users: ReturnType<typeof buildUsers>
): (typeof schema.userProfiles.$inferInsert)[] {
  const now = new Date();
  return specs.map((s, i) => ({
    id: uuid(),
    userId: users[i].id,
    birthday: s.birthday,
    bio: s.bio,
    embedding: null,
    chronotype: s.chronotype,
    workStartHour: s.workStartHour,
    workEndHour: s.workEndHour,
    workStyle: s.workStyle,
    cleanliness: s.cleanliness,
    socialEnergy: s.socialEnergy,
    budgetTier: s.budgetTier,
    createdAt: now,
    updatedAt: now,
  }));
}

function buildUserTags(
  specs: TravelerSpec[],
  profiles: ReturnType<typeof buildUserProfiles>,
  tags: ReturnType<typeof buildTags>
) {
  const tagMap = new Map(tags.map((t) => [t.label, t.id]));
  const rows: { profileId: string; tagId: string }[] = [];

  specs.forEach((s, i) => {
    const profileId = profiles[i].id;
    for (const interest of s.interests) {
      const tagId = tagMap.get(interest);
      if (tagId) rows.push({ profileId: profileId!, tagId });
    }
  });

  return rows;
}

// ── 6. Pods & Pod Members ─────────────────────────────────────────

/** Creates one pod per property per month (months 0–5 from today). */
function buildPods(properties: ReturnType<typeof buildProperties>) {
  const rows: (typeof schema.pods.$inferInsert)[] = [];

  for (let m = 0; m < 6; m++) {
    const month = monthOffset(m);
    for (const prop of properties) {
      rows.push({
        id: uuid(),
        propertyId: prop.id!,
        month,
        status: "OPEN",
        createdAt: new Date(),
        lockedAt: null,
        filledAt: null,
      });
    }
  }

  return rows;
}

/**
 * Assigns travelers to pods to produce realistic sample bookings.
 * Strategy:
 *  - Months 0–1: several pods get enough members to be LOCKED (≥ minOccupancy met).
 *  - Months 2–4: pods partially filled (OPEN), seeding AI gravity.
 *  - Month 5: mostly empty — future horizon.
 */
function buildPodMemberships(
  pods: ReturnType<typeof buildPods>,
  properties: ReturnType<typeof buildProperties>,
  users: ReturnType<typeof buildUsers>
): {
  podMembers: (typeof schema.podMembers.$inferInsert)[];
  podStatusUpdates: { id: string; status: "OPEN" | "LOCKED" | "FULL"; lockedAt: Date | null; filledAt: Date | null }[];
} {
  const propMap = new Map(properties.map((p) => [p.id, p]));
  const memberRows: (typeof schema.podMembers.$inferInsert)[] = [];
  const statusUpdates: { id: string; status: "OPEN" | "LOCKED" | "FULL"; lockedAt: Date | null; filledAt: Date | null }[] = [];

  const now = new Date();
  const assigned = new Set<string>();
  const podCounts = new Map<string, number>();

  function addMembers(pod: (typeof pods)[0], userIds: string[]) {
    for (const userId of userIds) {
      const key = `${pod.id}:${userId}`;
      if (!assigned.has(key)) {
        assigned.add(key);
        memberRows.push({
          id: uuid(),
          podId: pod.id!,
          userId,
          status: "PENDING",
          joinedAt: now,
        });
        podCounts.set(pod.id!, (podCounts.get(pod.id!) || 0) + 1);
      }
    }
  }

  const months: string[] = [];
  for (let m = 0; m < 6; m++) months.push(monthOffset(m));

  function findPod(propIndex: number, monthIdx: number) {
    return pods.find(
      (p) =>
        p.propertyId === properties[propIndex].id &&
        p.month === months[monthIdx]
    )!;
  }

  // ─── Month 0 (current month) — several LOCKED & full pods ───
  addMembers(findPod(0, 0), [users[0].id, users[2].id, users[6].id, users[16].id, users[28].id]);
  addMembers(findPod(2, 0), [users[1].id, users[5].id, users[10].id, users[14].id]);
  addMembers(findPod(5, 0), [users[3].id, users[12].id, users[24].id]);
  addMembers(findPod(9, 0), [users[7].id, users[13].id]);
  addMembers(findPod(11, 0), [users[4].id, users[9].id, users[20].id]);

  // ─── Month 1 — more locked pods ───
  addMembers(findPod(1, 1), [users[8].id, users[18].id]);
  addMembers(findPod(3, 1), [users[11].id, users[15].id, users[21].id, users[25].id]);
  addMembers(findPod(4, 1), [users[17].id, users[22].id, users[26].id]);
  addMembers(findPod(6, 1), [users[19].id, users[27].id]);
  addMembers(findPod(8, 1), [users[23].id, users[29].id, users[6].id, users[2].id]);
  addMembers(findPod(10, 1), [users[0].id]);

  // ─── Month 2 — AI gravity: partially filled pods ───
  addMembers(findPod(0, 2), [users[12].id, users[16].id]);
  addMembers(findPod(2, 2), [users[3].id, users[9].id, users[20].id]);
  addMembers(findPod(5, 2), [users[24].id, users[13].id, users[28].id]);
  addMembers(findPod(9, 2), [users[1].id, users[14].id]);
  addMembers(findPod(11, 2), [users[5].id, users[10].id, users[15].id]);

  // ─── Month 3 — moderate activity ───
  addMembers(findPod(1, 3), [users[6].id, users[7].id, users[17].id]);
  addMembers(findPod(3, 3), [users[8].id, users[18].id]);
  addMembers(findPod(4, 3), [users[19].id, users[22].id]);
  addMembers(findPod(6, 3), [users[11].id, users[23].id, users[29].id]);
  addMembers(findPod(8, 3), [users[0].id, users[4].id, users[21].id, users[26].id]);

  // ─── Month 4 — light seeding ───
  addMembers(findPod(0, 4), [users[25].id]);
  addMembers(findPod(5, 4), [users[2].id, users[27].id]);
  addMembers(findPod(9, 4), [users[3].id]);
  addMembers(findPod(11, 4), [users[13].id, users[28].id]);

  // Month 5 — intentionally empty (future horizon — for AI gravity demo)

  // ─── Auto-Calculate Status & Data Integrity ───
  for (const pod of pods) {
    const prop = propMap.get(pod.propertyId)!;
    const count = podCounts.get(pod.id!) || 0;

    if (count >= prop.totalRooms!) {
      statusUpdates.push({ id: pod.id!, status: "FULL", lockedAt: now, filledAt: now });
      memberRows.filter((m) => m.podId === pod.id).forEach((m) => m.status = "CONFIRMED");
    } else if (count >= prop.minOccupancy!) {
      statusUpdates.push({ id: pod.id!, status: "LOCKED", lockedAt: now, filledAt: null });
      memberRows.filter((m) => m.podId === pod.id).forEach((m) => m.status = "CONFIRMED");
    }
  }

  return { podMembers: memberRows, podStatusUpdates: statusUpdates };
}

// ── Main seed function ────────────────────────────────────────────

async function seed() {
  const overwrite = hasOverwriteFlag();
  console.log(`🌱 Starting SyncStay seed${overwrite ? " (overwrite mode)" : ""}...\n`);

  if (overwrite) {
    await clearExistingData();
    console.log("");
  }

  // 1. Locations
  const locationData = buildLocations();
  console.log(`📍 Inserting ${locationData.length} locations...`);
  const locationInsert = db
    .insert(schema.locations)
    .values([...locationData]);
  await (overwrite ? locationInsert : locationInsert.onConflictDoNothing());

  // 2. Properties
  const propertyData = buildProperties(locationData);
  console.log(`🏠 Inserting ${propertyData.length} properties...`);
  const propertyInsert = db.insert(schema.properties).values(propertyData);
  await (overwrite ? propertyInsert : propertyInsert.onConflictDoNothing());
  await syncSeedProperties(propertyData);

  // 3. Amenities
  const amenityData = buildAmenities();
  console.log(`✨ Inserting ${amenityData.length} amenities...`);
  const amenityInsert = db.insert(schema.amenities).values(amenityData);
  await (overwrite ? amenityInsert : amenityInsert.onConflictDoNothing());

  // 4. Property ↔ Amenities linking
  const propertyAmenityData = buildPropertyAmenities(propertyData, amenityData);
  console.log(`🔗 Inserting ${propertyAmenityData.length} property-amenity links...`);
  const propertyAmenityInsert = db
    .insert(schema.propertyAmenities)
    .values(propertyAmenityData);
  await (overwrite ? propertyAmenityInsert : propertyAmenityInsert.onConflictDoNothing());

  // 5. Tags
  const tagData = buildTags();
  console.log(`🏷️  Inserting ${tagData.length} tags...`);
  const tagInsert = db.insert(schema.tags).values(tagData);
  await (overwrite ? tagInsert : tagInsert.onConflictDoNothing());

  // 6. Users (auth schema)
  const userData = buildUsers(TRAVELER_SPECS);
  console.log(`👤 Inserting ${userData.length} users...`);
  const userInsert = db.insert(authSchema.users).values(userData);
  await (overwrite ? userInsert : userInsert.onConflictDoNothing());
  await syncSeedUsers(userData);

  // 7. Accounts (credential rows)
  const accountData = buildAccounts(userData);
  console.log(`🔐 Inserting ${accountData.length} credential accounts...`);
  const accountInsert = db
    .insert(authSchema.accounts)
    .values(accountData);
  await (overwrite ? accountInsert : accountInsert.onConflictDoNothing());

  // 8. User profiles
  const profileData = buildUserProfiles(TRAVELER_SPECS, userData);
  console.log(`📋 Inserting ${profileData.length} user profiles...`);
  const profileInsert = db
    .insert(schema.userProfiles)
    .values(profileData);
  await (overwrite ? profileInsert : profileInsert.onConflictDoNothing());

  // 9. User tags (interests)
  const userTagData = buildUserTags(TRAVELER_SPECS, profileData, tagData);
  console.log(`🎯 Inserting ${userTagData.length} user-tag links...`);
  const userTagInsert = db.insert(schema.userTags).values(userTagData);
  await (overwrite ? userTagInsert : userTagInsert.onConflictDoNothing());

  // 10. Pods (1 per property × 6 months = 72)
  const podData = buildPods(propertyData);
  console.log(`🫙 Inserting ${podData.length} pods...`);
  const podInsert = db.insert(schema.pods).values(podData);
  await (overwrite ? podInsert : podInsert.onConflictDoNothing());

  // 11. Pod members + status updates
  const { podMembers: podMemberData, podStatusUpdates } = buildPodMemberships(
    podData,
    propertyData,
    userData
  );

  console.log(`🤝 Inserting ${podMemberData.length} pod memberships...`);
  const podMemberInsert = db
    .insert(schema.podMembers)
    .values(podMemberData);
  await (overwrite ? podMemberInsert : podMemberInsert.onConflictDoNothing());

  // 12. Update pod statuses (LOCKED / FULL) after members are inserted
  console.log(`🔄 Updating ${podStatusUpdates.length} pod statuses...`);
  for (const update of podStatusUpdates) {
    await db
      .update(schema.pods)
      .set({ status: update.status, lockedAt: update.lockedAt, filledAt: update.filledAt })
      .where(eq(schema.pods.id, update.id));
  }

  await verifySeedImages();

  console.log("\n✅ Seed complete!");
  console.log(`   Locations   : ${locationData.length}`);
  console.log(`   Properties  : ${propertyData.length}`);
  console.log(`   Amenities   : ${amenityData.length}`);
  console.log(`   Tags        : ${tagData.length}`);
  console.log(`   Users       : ${userData.length}`);
  console.log(`   Profiles    : ${profileData.length}`);
  console.log(`   Pods        : ${podData.length}`);
  console.log(`   Memberships : ${podMemberData.length}`);
  if (overwrite) {
    console.log("   Mode        : overwrite");
  }
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
