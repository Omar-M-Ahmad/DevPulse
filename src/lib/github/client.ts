const GITHUB_API = 'https://api.github.com';

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

async function githubFetch<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 300 }, // cache 5 minutes
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
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
