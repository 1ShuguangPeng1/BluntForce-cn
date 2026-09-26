import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  date,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ============================================================
// 1. 用户扩展资料（Supabase auth.users 存认证信息，此表存公开资料）
// ============================================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password_hash: text("password_hash").notNull(),
  avatar_url: text("avatar_url"),
  bio: text("bio").default(""),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 2. 宠物档案
// ============================================================
export const pets = pgTable(
  "pets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    owner_id: uuid("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    species: text("species").notNull(), // dog, cat, rabbit, bird, other
    breed: text("breed").default(""),
    gender: text("gender").default(""),
    birth_date: date("birth_date"),
    avatar_url: text("avatar_url"),
    is_archived: boolean("is_archived").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("pets_owner_idx").on(table.owner_id),
  }),
);

// ============================================================
// 3. 健康记录（疫苗/疾病/体检/用药）
// ============================================================
export const healthRecords = pgTable(
  "health_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pet_id: uuid("pet_id")
      .references(() => pets.id, { onDelete: "cascade" })
      .notNull(),
    record_type: text("record_type").notNull(), // vaccine, illness, checkup, medication
    title: text("title").notNull(),
    description: text("description").default(""),
    record_date: date("record_date").notNull(),
    next_due: date("next_due"),
    attachment_urls: jsonb("attachment_urls").$type<string[]>().default([]),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    petIdx: index("health_records_pet_idx").on(table.pet_id),
    typeIdx: index("health_records_type_idx").on(table.record_type),
  }),
);

// ============================================================
// 4. 帖子
// ============================================================
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    author_id: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(), // experience, knowledge, question, daily
    tags: text("tags").array().default([]),
    image_urls: jsonb("image_urls").$type<string[]>().default([]),
    is_pinned: boolean("is_pinned").default(false),
    view_count: integer("view_count").default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    authorIdx: index("posts_author_idx").on(table.author_id),
    categoryIdx: index("posts_category_idx").on(table.category),
    createdIdx: index("posts_created_idx").on(table.created_at.desc()),
  }),
);

// ============================================================
// 5. 评论（支持二层嵌套回复）
// ============================================================
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    post_id: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    author_id: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    parent_id: uuid("parent_id"), // NULL=一级评论，非NULL=回复某条评论
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    postIdx: index("comments_post_idx").on(table.post_id),
    parentIdx: index("comments_parent_idx").on(table.parent_id),
  }),
);

// ============================================================
// 6. 点赞（帖子或评论）
// ============================================================
export const likes = pgTable(
  "likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    comment_id: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    postLike: uniqueIndex("likes_post_unique").on(table.user_id, table.post_id),
    commentLike: uniqueIndex("likes_comment_unique").on(table.user_id, table.comment_id),
  }),
);

// ============================================================
// 7. 收藏（书签）
// ============================================================
export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    post_id: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueFav: uniqueIndex("favorites_unique").on(table.user_id, table.post_id),
  }),
);

// ============================================================
// 8. 好友关系
// ============================================================
export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requester_id: uuid("requester_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    addressee_id: uuid("addressee_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status").default("pending").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    requesterIdx: index("friendships_requester_idx").on(table.requester_id),
    addresseeIdx: index("friendships_addressee_idx").on(table.addressee_id),
  }),
);

// ============================================================
// 9. 一对一私信
// ============================================================
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sender_id: uuid("sender_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    receiver_id: uuid("receiver_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    is_read: boolean("is_read").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index("messages_conversation_idx").on(
      table.sender_id,
      table.receiver_id,
      table.created_at,
    ),
    unreadIdx: index("messages_unread_idx").on(table.receiver_id, table.is_read),
  }),
);
