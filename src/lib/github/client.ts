const GITHUB_API = 'https://api.github.com';

/** How long to wait (ms) before retrying a rate-limited request. */
const MAX_RETRY_WAIT_MS = 60_000;

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  pushed_at: string | null;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  labels: Array<{ name: string }>;
  created_at: string;
  html_url: string;
}

/**
 * Core fetch wrapper for the GitHub REST API.
 *
 * Retry strategy:
 *   - 429 (secondary rate limit) or 403 with x-ratelimit-remaining: 0
 *     → wait for the time GitHub specifies in retry-after / x-ratelimit-reset
 *     → retry up to MAX_RETRIES times with exponential back-off as a floor
 *   - Any other non-ok response → throw immediately (no retry)
 */
async function githubFetch<T>(
  path: string,
  accessToken: string,
  retries = 3,
): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 300 },
  });

  // Rate-limited: respect GitHub's back-off headers and retry
  const isRateLimited =
    response.status === 429 ||
    (response.status === 403 &&
      response.headers.get('x-ratelimit-remaining') === '0');

  if (isRateLimited && retries > 0) {
    const waitMs = resolveWaitMs(response);
    await sleep(waitMs);
    return githubFetch<T>(path, accessToken, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

/** Derives how long to wait from GitHub's response headers. */
function resolveWaitMs(response: Response): number {
  // retry-after is seconds; x-ratelimit-reset is a Unix timestamp in seconds
  const retryAfter = response.headers.get('retry-after');
  const resetAt = response.headers.get('x-ratelimit-reset');

  if (retryAfter) {
    return Math.min(parseInt(retryAfter, 10) * 1000, MAX_RETRY_WAIT_MS);
  }
  if (resetAt) {
    const msUntilReset = parseInt(resetAt, 10) * 1000 - Date.now();
    return Math.min(Math.max(msUntilReset, 0), MAX_RETRY_WAIT_MS);
  }

  // Fallback: exponential back-off starting at 5 s
  return Math.min(5_000 * 2 ** (3 - 1), MAX_RETRY_WAIT_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchUserRepos(
  accessToken: string,
): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    '/user/repos?per_page=100&sort=pushed&affiliation=owner',
    accessToken,
  );
}

export async function fetchRepoCommits(
  fullName: string,
  accessToken: string,
): Promise<GitHubCommit[]> {
  return githubFetch<GitHubCommit[]>(
    `/repos/${fullName}/commits?per_page=10`,
    accessToken,
  );
}

export async function fetchRepoIssues(
  fullName: string,
  accessToken: string,
): Promise<GitHubIssue[]> {
  return githubFetch<GitHubIssue[]>(
    `/repos/${fullName}/issues?state=open&per_page=20`,
    accessToken,
  );
}
