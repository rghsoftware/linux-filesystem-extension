// Additional tool handlers for Linux filesystem extension

import * as fs from "fs/promises";
import * as path from "path";

export async function getFileInfo(filePath: string) {
  const stats = await fs.lstat(filePath);

  const info = {
    path: filePath,
    type: stats.isDirectory()
      ? "directory"
      : stats.isSymbolicLink()
      ? "symlink"
      : stats.isFile()
      ? "file"
      : "other",
    size: stats.size,
    created: stats.birthtime.toISOString(),
    modified: stats.mtime.toISOString(),
    accessed: stats.atime.toISOString(),
    permissions: {
      mode: stats.mode.toString(8).slice(-3),
      uid: stats.uid,
      gid: stats.gid,
    },
  };

  return info;
}

export async function searchFiles(
  searchPath: string,
  pattern: string,
  showHiddenFiles: boolean,
  isPathAllowed: (p: string) => boolean
) {
  const results: string[] = [];

  async function searchRecursive(dir: string) {
    if (!isPathAllowed(dir)) return;

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!showHiddenFiles && entry.name.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      // Simple pattern matching
      if (entry.name.includes(pattern) || entry.name.match(new RegExp(pattern))) {
        results.push(fullPath);
      }

      if (entry.isDirectory()) {
        await searchRecursive(fullPath);
      }
    }
  }

  await searchRecursive(searchPath);
  return results;
}
