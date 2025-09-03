type Parsed = { baseUrl: string; projectPath: string; iid: number }; 

export function parseMrUrl(mrUrl: string): Parsed {
  const u = new URL(mrUrl);
  const parts = u.pathname.split("/").filter(Boolean);
  // supports .../<namespace>/<project>/-/merge_requests/<iid>
  const iid = Number(parts[parts.length - 1]);
  const projectPath = parts.slice(0, parts.indexOf("-")).join("/");
  if (!iid || !projectPath) throw new Error("Invalid MR URL format.");
  return { baseUrl: `${u.protocol}//${u.host}`, projectPath, iid };
} 

export async function getProjectId(baseUrl: string, projectPath: string, token: string): Promise<number> {
  const encoded = encodeURIComponent(projectPath);
  const res = await fetch(`${baseUrl}/api/v4/projects/${encoded}`, {
    headers: { "PRIVATE-TOKEN": token }
  });
  if (!res.ok) throw new Error(`GitLab project lookup failed: ${res.status}`);
  const data = await res.json();
  return data.id;
} 

export async function fetchMrDiff(baseUrl: string, projectId: number, iid: number, token: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/v4/projects/${projectId}/merge_requests/${iid}/changes`, {
    headers: { "PRIVATE-TOKEN": token }
  });
  if (!res.ok) throw new Error(`GitLab MR changes failed: ${res.status}`);
  const data = await res.json();
  const changes = data?.changes as Array<{ old_path: string; new_path: string; diff: string }>;
  if (!Array.isArray(changes) || changes.length === 0) return "";
  const parts: string[] = [];
  for (const ch of changes) {
    parts.push(`--- a/${ch.old_path}\n+++ b/${ch.new_path}\n${ch.diff}\n`);
  }
  return parts.join("\n");
}