# Linux Filesystem Extension for Claude Desktop

Enhanced filesystem access MCP server for Linux with support for symbolic links, permissions, and Linux-specific features.

## Features

### Core Filesystem Operations
- **Read/Write Files**: Read and write file contents
- **Directory Management**: Create, list, and navigate directories
- **File Operations**: Move, rename, and delete files
- **File Information**: Get detailed file metadata including permissions and ownership

### Linux-Specific Features
- **Symbolic Links**: Create and read symbolic links
- **Permission Management**: Change file permissions with chmod
- **Hidden Files**: Optional support for showing/hiding dotfiles
- **Extended Information**: Access UID, GID, and detailed permission bits

## Installation

### Prerequisites
- **Node.js 18 or later** (must be installed and in system PATH on Linux)
  - Check: `node --version`
  - Install: `sudo apt install nodejs npm` (Ubuntu/Debian) or `sudo dnf install nodejs npm` (Fedora)
- Claude Desktop app
- Linux operating system

### Quick Install (Recommended)

1. Download the `linux-filesystem.mcpb` file
2. Open Claude Desktop
3. Go to Settings > Extensions
4. Click "Install Extension..."
5. Select the downloaded `.mcpb` file
6. Configure one or more allowed directories when prompted

### Build from Source

```bash
# Clone or download the repository
git clone <repository-url>
cd linux-filesystem-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Package as .mcpb
npm run pack-mcpb

# The packaged extension will be in dist/linux-filesystem.mcpb
```

## Configuration

### Allowed Directories

The extension requires you to specify which directories it can access. You can configure this in multiple ways:

1. **Via Claude Desktop** (Recommended):
   - When installing the .mcpb file, you'll be prompted to add one or more directories
   - Click "Add Directory" to include multiple locations
   - Each directory can be added, removed, or modified independently

2. **Via Environment Variables** (for manual setup):
   ```bash
   export MCP_ALLOWED_DIRS="/home/user/documents:/home/user/projects"
   ```

3. **Via Command Line Arguments**:
   ```bash
   node build/index.js /path/to/dir1 /path/to/dir2 /path/to/dir3
   ```

### Additional Options

- **Follow Symlinks**: Set `MCP_FOLLOW_SYMLINKS=true` to follow symbolic links
- **Show Hidden Files**: Set `MCP_SHOW_HIDDEN=true` to show dotfiles

## Available Tools

### read_file
Read the complete contents of a file.
```json
{
  "path": "/path/to/file.txt"
}
```

### write_file
Write content to a file (creates if doesn't exist).
```json
{
  "path": "/path/to/file.txt",
  "content": "File contents here"
}
```

### create_directory
Create a directory (with recursive support).
```json
{
  "path": "/path/to/new/directory"
}
```

### list_directory
List all files and directories in a path.
```json
{
  "path": "/path/to/directory"
}
```

### move_file
Move or rename files and directories.
```json
{
  "source": "/path/to/source",
  "destination": "/path/to/destination"
}
```

### delete_file
Delete a file or empty directory.
```json
{
  "path": "/path/to/file"
}
```

### get_file_info
Get detailed information about a file including permissions.
```json
{
  "path": "/path/to/file"
}
```

Returns:
```json
{
  "path": "/path/to/file",
  "type": "file",
  "size": 1234,
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z",
  "accessed": "2024-01-01T00:00:00.000Z",
  "permissions": {
    "mode": "644",
    "uid": 1000,
    "gid": 1000
  }
}
```

### search_files
Search for files matching a pattern.
```json
{
  "path": "/path/to/search",
  "pattern": "*.txt"
}
```

### create_symlink (Linux-specific)
Create a symbolic link.
```json
{
  "target": "/path/to/target",
  "linkPath": "/path/to/link"
}
```

### read_symlink (Linux-specific)
Read the target of a symbolic link.
```json
{
  "path": "/path/to/symlink"
}
```

### chmod (Linux-specific)
Change file permissions.
```json
{
  "path": "/path/to/file",
  "mode": "755"
}
```

## Security

### Directory Access Control
The extension uses a strict allowlist approach:
- Only directories explicitly configured as "allowed" can be accessed
- All file operations validate paths against the allowed directory list
- Attempts to access files outside allowed directories are blocked

### Permission Handling
- The extension runs with your user's permissions
- It cannot perform operations your user account cannot perform
- Symbolic links are validated to ensure they don't escape allowed directories

## Development

### Project Structure
```
linux-filesystem-extension/
├── src/
│   ├── index.ts          # Main server implementation
│   └── handlers.ts       # Helper functions
├── scripts/
│   ├── copy-node-modules.js  # Build script
│   └── pack-mcpb.js          # Packaging script
├── build/                # Compiled output (generated)
├── dist/                 # Packaged .mcpb (generated)
├── manifest.json         # Extension manifest
├── package.json
├── tsconfig.json
└── README.md
```

### Build Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Watch mode for development
npm run dev

# Package as .mcpb
npm run pack-mcpb
```

### Testing

Run the server manually for testing:

```bash
npm run build
node build/index.js /path/to/allowed/dir
```

## Troubleshooting

### "No allowed directories specified" error
- Ensure you've configured at least one allowed directory
- Check that the directory paths are correct and exist
- Verify environment variables are set correctly

### "Access denied" errors
- The requested path must be within one of your configured allowed directories
- Check symbolic links aren't pointing outside allowed directories
- Verify your user has the necessary permissions

### Extension won't install
- Ensure you're running a compatible version of Claude Desktop
- Verify the .mcpb file isn't corrupted
- Check that Node.js is installed on your system

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Comparison with Official Filesystem Server

This extension builds upon the official `@modelcontextprotocol/server-filesystem` with:
- Linux-specific features (symlinks, chmod)
- Enhanced file information (UID/GID, detailed permissions)
- Optimized for Linux environments
- Platform-restricted for security (Linux-only)
