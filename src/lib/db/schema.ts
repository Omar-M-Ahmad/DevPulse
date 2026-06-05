import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  githubId: integer('github_id').notNull().unique(),
  login: text('login').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  staleDays: integer('stale_days').default(22).notNull(),
  issueUrgencyThreshold: integer('issue_urgency_threshold')
    .default(10)
    .notNull(),
  emailAlerts: boolean('email_alerts').default(false).notNull(),
  weeklyDigest: boolean('weekly_digest').default(true).notNull(),
  terminalTheme: text('terminal_theme').default('dark-green').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const repos = pgTable(
  'repos',
  {
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
  },
  (t) => [
    // Speeds up all dashboard queries that filter repos by owner
    index('repos_user_id_idx').on(t.userId),
    // Speeds up sorting by last activity on the dashboard overview
    index('repos_user_id_last_commit_idx').on(t.userId, t.lastCommitAt),
  ],
);

export const commits = pgTable(
  'commits',
  {
    id: serial('id').primaryKey(),
    repoId: integer('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    sha: text('sha').notNull().unique(),
    message: text('message').notNull(),
    committedAt: timestamp('committed_at').notNull(),
    url: text('url').notNull(),
  },
  (t) => [
    // Speeds up activity feed + single repo commit list
    index('commits_repo_id_idx').on(t.repoId),
    // Speeds up the cross-repo recent-commits query (JOIN repos WHERE userId)
    index('commits_repo_id_committed_at_idx').on(t.repoId, t.committedAt),
  ],
);

export const issues = pgTable(
  'issues',
  {
    id: serial('id').primaryKey(),
    repoId: integer('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    githubNumber: integer('github_number').notNull(),
    title: text('title').notNull(),
    labels: text('labels').array().default([]).notNull(),
    createdAt: timestamp('created_at').notNull(),
    url: text('url').notNull(),
  },
  (t) => [
    // Speeds up issues list + single repo issues section
    index('issues_repo_id_idx').on(t.repoId),
  ],
);

export const syncLogs = pgTable(
  'sync_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    reposSynced: integer('repos_synced').default(0),
    error: text('error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    // Speeds up getLastSyncTime() which is called on every dashboard layout render
    index('sync_logs_user_id_created_at_idx').on(t.userId, t.createdAt),
  ],
);

// Exported types used across the codebase
export type RepoStatus = 'active' | 'cooling' | 'stale';
export type User = typeof users.$inferSelect;
export type Repo = typeof repos.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
