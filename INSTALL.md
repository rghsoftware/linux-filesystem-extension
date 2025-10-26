# Installation Guide - Linux Filesystem Extension

## Quick Start

### Option 1: Install Pre-built Extension (Recommended)

1. **Locate the packaged extension**
   ```bash
   cd /home/rghamilton3/workspace/linux-filesystem-extension
   ls dist/linux-filesystem.mcpb
   ```

2. **Open Claude Desktop**
   - Launch the Claude Desktop application

3. **Install the Extension**
   - Go to Settings → Extensions
   - Click "Install Extension..."
   - Navigate to and select: `dist/linux-filesystem.mcpb`

4. **Configure Allowed Directories**
   - When prompted, select one or more directories the extension should access
   - The directory picker supports multiple selections
   - Examples: `/home/user/documents`, `/home/user/workspace`, `/home/user/projects`
   - Directories can be added, removed, or modified later in extension settings

### Option 2: Manual Configuration

If you prefer to configure the extension manually in Claude Desktop's config:

1. **Edit Claude Desktop Config**
   ```bash
   # Location varies by installation
   ~/.config/claude-desktop/config.json
   ```

2. **Add the Configuration**
   ```json
   {
     "mcpServers": {
       "linux-filesystem": {
         "command": "node",
         "args": [
           "/home/rghamilton3/workspace/linux-filesystem-extension/build/index.js",
           "/home/user/documents",
           "/home/user/projects"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## Verify Installation

After installation, you can test the extension by asking Claude:

```
Can you list the files in my documents directory?
```

or

```
Please read the contents of myfile.txt
```

## Configuration Options

### Environment Variables

Set these before starting Claude Desktop (for manual configuration):

```bash
# Multiple directories (colon-separated)
export MCP_ALLOWED_DIRS="/home/user/docs:/home/user/projects"

# Follow symbolic links
export MCP_FOLLOW_SYMLINKS=true

# Show hidden files (files starting with .)
export MCP_SHOW_HIDDEN=true
```

### Security Settings

**Important**: Only add directories that you trust Claude to access. The extension:
- Can read, write, and delete files in allowed directories
- Runs with your user's permissions
- Cannot access files outside allowed directories
- Validates all paths to prevent directory traversal

## Troubleshooting

### Extension Won't Install
- Ensure Claude Desktop is up to date
- Check file permissions on the .mcpb file
- **Linux users**: Verify Node.js is installed and in PATH: `node --version` (should be v18+)
  - Node.js ships with Claude Desktop on macOS/Windows, but Linux requires system Node.js
  - Install: `sudo apt install nodejs` (Ubuntu/Debian) or `sudo dnf install nodejs` (Fedora)

### "No allowed directories" Error
- You must configure at least one allowed directory
- Paths must be absolute (start with `/`)
- Directories must exist and be readable

### "Access denied" Errors
- Requested path must be within an allowed directory
- Check that your user has permission to access the directory
- Verify symbolic links don't point outside allowed directories

### Extension Not Appearing in Claude
- Restart Claude Desktop completely
- Check the error logs in Claude Desktop's developer console
- Ensure the .mcpb file isn't corrupted (should be ~0.76 MB)

## Uninstalling

1. Open Claude Desktop
2. Go to Settings → Extensions
3. Find "Linux Filesystem" in the list
4. Click "Uninstall" or "Remove"

## Next Steps

- Read the [README.md](README.md) for full feature documentation
- See available tools and their parameters
- Learn about Linux-specific features (symlinks, chmod, etc.)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the [README.md](README.md) documentation
- File an issue on the project repository
