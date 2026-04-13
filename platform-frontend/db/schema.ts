import {
  pgTable,
  pgEnum,
  text,
  integer,
  smallint,
  date,
  timestamp,
  uniqueIndex,
  index,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../auth-schema";

// ── Enums ────────────────────────────────────────────────────────

export const podStatusEnum = pgEnum("pod_status", ["OPEN", "LOCKED", "FULL"]);

export const memberStatusEnum = pgEnum("member_status", [
  "PENDING",
  "CONFIRMED",
  "WITHDRAWN",
]);

export const chronotypeEnum = pgEnum("chronotype", [
  "EARLY_BIRD",
  "STANDARD",
  "NIGHT_OWL",
]);

export const budgetTierEnum = pgEnum("budget_tier", [
  "BUDGET",
  "MID_RANGE",
  "PREMIUM",
]);

export const workStyleEnum = pgEnum("work_style", [
  "DEEP_FOCUS",
  "MIXED",
  "MOSTLY_CALLS",
  "LIGHT",
]);

// ── User Profiles (MVP matching factors) ─────────────────────────

export const userProfiles = pgTable("user_profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  birthday: date("birthday"),

  bio: text("bio"),
  embedding: vector("embedding", { dimensions: 3072 }),

  chronotype: chronotypeEnum("chronotype"),
  workStartHour: smallint("work_start_hour"), // 0-23
  workEndHour: smallint("work_end_hour"),     // 0-23
  workStyle: workStyleEnum("work_style"),

  cleanliness: smallint("cleanliness"), // 1-5 Likert

  socialEnergy: smallint("social_energy"), // 1-5 (1=introvert, 5=extrovert)

  budgetTier: budgetTierEnum("budget_tier"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ── Locations ────────────────────────────────────────────────────

export const locations = pgTable("locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  country: text("country").notNull(),
  slug: text("slug").notNull().unique(),
});

// ── Properties ───────────────────────────────────────────────────

export const properties = pgTable("properties", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  locationId: text("location_id")
    .references(() => locations.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  totalRooms: integer("total_rooms").notNull(),
  minOccupancy: integer("min_occupancy").notNull(),
  pricePerRoomCents: integer("price_per_room_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ── Amenities ────────────────────────────────────────────────────

export const amenities = pgTable("amenities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull().unique(),
  icon: text("icon"),
});

export const propertyAmenities = pgTable(
  "property_amenities",
  {
    propertyId: text("property_id")
      .references(() => properties.id, { onDelete: "cascade" })
      .notNull(),
    amenityId: text("amenity_id")
      .references(() => amenities.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    uniqueIndex("property_amenities_idx").on(table.propertyId, table.amenityId),
  ],
);

// ── Tags (user interest labels for AI embedding context) ─────────

export const tags = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull().unique(),
});

export const userTags = pgTable(
  "user_tags",
  {
    profileId: text("profile_id")
      .references(() => userProfiles.id, { onDelete: "cascade" })
      .notNull(),
    tagId: text("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_tags_idx").on(table.profileId, table.tagId),
    index("user_tags_profile_idx").on(table.profileId),
  ],
);

// ── Pods ─────────────────────────────────────────────────────────

export const pods = pgTable(
  "pods",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    propertyId: text("property_id")
      .references(() => properties.id, { onDelete: "cascade" })
      .notNull(),
    month: date("month").notNull(),
    status: podStatusEnum("status").default("OPEN").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    filledAt: timestamp("filled_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("pods_property_month_idx").on(table.propertyId, table.month),
  ],
);

// ── Pod Members ──────────────────────────────────────────────────

export const podMembers = pgTable(
  "pod_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    podId: text("pod_id")
      .references(() => pods.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    status: memberStatusEnum("status").default("PENDING").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("pod_members_pod_user_idx").on(table.podId, table.userId),
    index("pod_members_user_idx").on(table.userId),
  ],
);

// ── Relations ────────────────────────────────────────────────────

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  interests: many(userTags),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  location: one(locations, {
    fields: [properties.locationId],
    references: [locations.id],
  }),
  pods: many(pods),
  propertyAmenities: many(propertyAmenities),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  propertyAmenities: many(propertyAmenities),
}));

export const propertyAmenitiesRelations = relations(
  propertyAmenities,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyAmenities.propertyId],
      references: [properties.id],
    }),
    amenity: one(amenities, {
      fields: [propertyAmenities.amenityId],
      references: [amenities.id],
    }),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  userTags: many(userTags),
}));

export const userTagsRelations = relations(userTags, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [userTags.profileId],
    references: [userProfiles.id],
  }),
  tag: one(tags, {
    fields: [userTags.tagId],
    references: [tags.id],
  }),
}));

export const podsRelations = relations(pods, ({ one, many }) => ({
  property: one(properties, {
    fields: [pods.propertyId],
    references: [properties.id],
  }),
  members: many(podMembers),
}));

export const podMembersRelations = relations(podMembers, ({ one }) => ({
  pod: one(pods, {
    fields: [podMembers.podId],
    references: [pods.id],
  }),
  user: one(users, {
    fields: [podMembers.userId],
    references: [users.id],
  }),
}));