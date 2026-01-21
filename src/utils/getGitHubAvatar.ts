/**
 * Extracts GitHub username from a GitHub URL and returns the avatar URL.
 * Supports various GitHub URL formats:
 * - https://github.com/username
 * - https://github.com/username/
 * - github.com/username
 * - @username
 */
export function getGitHubAvatarUrl(githubUrl?: string): string | undefined {
  if (!githubUrl) return undefined;

  // Handle @username format
  if (githubUrl.startsWith('@')) {
    const username = githubUrl.slice(1);
    return `https://github.com/${username}.png`;
  }

  // Extract username from URL
  const match = githubUrl.match(/github\.com\/([^\/\?]+)/);
  if (!match) return undefined;

  const username = match[1];
  // GitHub avatar API: https://github.com/{username}.png
  return `https://github.com/${username}.png`;
}
