import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  githubId: integer('github_id').notNull().unique(),
  login: text('login').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const repos = pgTable('repos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  githubId: integer('github_id').notNull().unique(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  private: boolean('private').default(false).notNull(),
  description: text('description'),
  language: text('language'),
  stars: integer('stars').default(0).notNull(),
  openIssues: integer('open_issues').default(0).notNull(),
  status: text('status', { enum: ['active', 'cooling', 'stale'] })
    .default('active')
    .notNull(),
  lastCommitAt: timestamp('last_commit_at'),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
})

export const commits = pgTable('commits', {
  id: serial('id').primaryKey(),
  repoId: integer('repo_id')
    .notNull()
    .references(() => repos.id, { onDelete: 'cascade' }),
  sha: text('sha').notNull().unique(),
  message: text('message').notNull(),
  committedAt: timestamp('committed_at').notNull(),
  url: text('url').notNull(),
})

export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  repoId: integer('repo_id')
    .notNull()
    .references(() => repos.id, { onDelete: 'cascade' }),
  githubNumber: integer('github_number').notNull(),
  title: text('title').notNull(),
  labels: text('labels').array().default([]).notNull(),
  createdAt: timestamp('created_at').notNull(),
  url: text('url').notNull(),
})

export const syncLogs = pgTable('sync_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  reposSynced: integer('repos_synced').default(0),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Types
export type RepoStatus = 'active' | 'cooling' | 'stale'