#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { existsSync, statSync } from "fs";
import { getFileInfo, searchFiles } from "./handlers.js";

// Configuration
interface Config {
  allowedDirectories: string[];
  followSymlinks: boolean;
  showHiddenFiles: boolean;
}

// Parse configuration from environment or arguments
function parseConfig(): Config {
  const config: Config = {
    allowedDirectories: [],
    followSymlinks: true,
    showHiddenFiles: false,
  };

  // Parse allowed directories from command line arguments
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (existsSync(arg) && statSync(arg).isDirectory()) {
      config.allowedDirectories.push(path.resolve(arg));
    }
  }

  // Parse from environment variables if available
  if (process.env.MCP_ALLOWED_DIRS) {
    const dirs = process.env.MCP_ALLOWED_DIRS.split(":");
    for (const dir of dirs) {
      if (existsSync(dir) && statSync(dir).isDirectory()) {
        config.allowedDirectories.push(path.resolve(dir));
      }
    }
  }

  if (process.env.MCP_FOLLOW_SYMLINKS) {
    config.followSymlinks = process.env.MCP_FOLLOW_SYMLINKS === "true";
  }

  if (process.env.MCP_SHOW_HIDDEN) {
    config.showHiddenFiles = process.env.MCP_SHOW_HIDDEN === "true";
  }

  return config;
}

const config = parseConfig();

// Validate path is within allowed directories
function isPathAllowed(filePath: string): boolean {
  const resolvedPath = path.resolve(filePath);
  return config.allowedDirectories.some((dir) =>
    resolvedPath.startsWith(dir)
  );
}

// Create server instance
const server = new Server(
  {
    name: "linux-filesystem",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: "read_file",
    description: "Read the complete contents of a file from the filesystem",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file to read",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file, creating it if it doesn't exist",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file to write",
        },
        content: {
          type: "string",
          description: "Content to write to the file",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "create_directory",
    description: "Create a new directory or ensure a directory exists",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the directory to create",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "list_directory",
    description: "List all files and directories in a specified path",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the directory to list",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "move_file",
    description: "Move or rename files and directories",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          description: "Source path",
        },
        destination: {
          type: "string",
          description: "Destination path",
        },
      },
      required: ["source", "destination"],
    },
  },
  {
    name: "delete_file",
    description: "Delete a file or empty directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to delete",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "get_file_info",
    description: "Get detailed information about a file or directory including permissions and ownership",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to get info for",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "search_files",
    description: "Search for files matching a pattern in a directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Directory to search in",
        },
        pattern: {
          type: "string",
          description: "Search pattern (supports wildcards)",
        },
      },
      required: ["path", "pattern"],
    },
  },
  {
    name: "create_symlink",
    description: "Create a symbolic link (Linux-specific)",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Target path",
        },
        linkPath: {
          type: "string",
          description: "Path for the symbolic link",
        },
      },
      required: ["target", "linkPath"],
    },
  },
  {
    name: "read_symlink",
    description: "Read the target of a symbolic link (Linux-specific)",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the symbolic link",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "chmod",
    description: "Change file permissions (Linux-specific)",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file",
        },
        mode: {
          type: "string",
          description: "Permission mode in octal (e.g., '755', '644')",
        },
      },
      required: ["path", "mode"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Validate path access for all operations
    if (args && "path" in args && typeof args.path === "string") {
      if (!isPathAllowed(args.path)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Access denied. Path "${args.path}" is not within allowed directories.`,
            },
          ],
        };
      }
    }

    switch (name) {
      case "read_file": {
        const filePath = args?.path as string;
        const content = await fs.readFile(filePath, "utf-8");
        return {
          content: [{ type: "text", text: content }],
        };
      }

      case "write_file": {
        const filePath = args?.path as string;
        const content = args?.content as string;
        await fs.writeFile(filePath, content, "utf-8");
        return {
          content: [
            { type: "text", text: `Successfully wrote to ${filePath}` },
          ],
        };
      }

      case "create_directory": {
        const dirPath = args?.path as string;
        await fs.mkdir(dirPath, { recursive: true });
        return {
          content: [
            { type: "text", text: `Successfully created directory ${dirPath}` },
          ],
        };
      }

      case "list_directory": {
        const dirPath = args?.path as string;
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        const formattedEntries = await Promise.all(
          entries
            .filter((entry) => {
              if (!config.showHiddenFiles && entry.name.startsWith(".")) {
                return false;
              }
              return true;
            })
            .map(async (entry) => {
              const fullPath = path.join(dirPath, entry.name);
              const type = entry.isDirectory()
                ? "DIR"
                : entry.isSymbolicLink()
                ? "LINK"
                : "FILE";

              let extra = "";
              if (entry.isSymbolicLink()) {
                try {
                  const target = await fs.readlink(fullPath);
                  extra = ` -> ${target}`;
                } catch {
                  extra = " -> [broken]";
                }
              }

              return `[${type}] ${entry.name}${extra}`;
            })
        );

        return {
          content: [
            {
              type: "text",
              text: formattedEntries.join("\n") || "Directory is empty",
            },
          ],
        };
      }

      case "move_file": {
        const source = args?.source as string;
        const destination = args?.destination as string;

        if (!isPathAllowed(destination)) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Access denied. Destination "${destination}" is not within allowed directories.`,
              },
            ],
          };
        }

        await fs.rename(source, destination);
        return {
          content: [
            {
              type: "text",
              text: `Successfully moved ${source} to ${destination}`,
            },
          ],
        };
      }

      case "delete_file": {
        const filePath = args?.path as string;
        const stats = await fs.lstat(filePath);

        if (stats.isDirectory()) {
          await fs.rmdir(filePath);
        } else {
          await fs.unlink(filePath);
        }

        return {
          content: [
            { type: "text", text: `Successfully deleted ${filePath}` },
          ],
        };
      }

      case "get_file_info": {
        const filePath = args?.path as string;
        const info = await getFileInfo(filePath);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      case "search_files": {
        const searchPath = args?.path as string;
        const pattern = args?.pattern as string;

        const results = await searchFiles(
          searchPath,
          pattern,
          config.showHiddenFiles,
          isPathAllowed
        );

        return {
          content: [
            {
              type: "text",
              text: results.length > 0
                ? results.join("\n")
                : "No files found matching the pattern",
            },
          ],
        };
      }

      case "create_symlink": {
        const target = args?.target as string;
        const linkPath = args?.linkPath as string;

        if (!isPathAllowed(linkPath)) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Access denied. Link path "${linkPath}" is not within allowed directories.`,
              },
            ],
          };
        }

        await fs.symlink(target, linkPath);
        return {
          content: [
            {
              type: "text",
              text: `Successfully created symlink ${linkPath} -> ${target}`,
            },
          ],
        };
      }

      case "read_symlink": {
        const linkPath = args?.path as string;
        const target = await fs.readlink(linkPath);
        return {
          content: [
            {
              type: "text",
              text: `Symlink ${linkPath} points to: ${target}`,
            },
          ],
        };
      }

      case "chmod": {
        const filePath = args?.path as string;
        const mode = args?.mode as string;

        // Convert octal string to number
        const modeNum = parseInt(mode, 8);
        await fs.chmod(filePath, modeNum);

        return {
          content: [
            {
              type: "text",
              text: `Successfully changed permissions of ${filePath} to ${mode}`,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  if (config.allowedDirectories.length === 0) {
    console.error(
      "Error: No allowed directories specified. Please provide directories as command-line arguments or set MCP_ALLOWED_DIRS environment variable."
    );
    process.exit(1);
  }

  console.error("Linux Filesystem MCP Server starting...");
  console.error("Allowed directories:", config.allowedDirectories);
  console.error("Follow symlinks:", config.followSymlinks);
  console.error("Show hidden files:", config.showHiddenFiles);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Server started successfully");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
