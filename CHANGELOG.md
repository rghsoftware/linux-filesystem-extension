=31;OK# Changelog

## [1.1.0] - 2025-10-25

### Added

- **Multiple Directory Support**: Users can now configure multiple allowed directories through the Claude Desktop UI
  - Uses `type: "directory"` with `multiple: true` (not `type: "array"`)
  - Claude Desktop presents a multi-select directory picker during installation
  - Users can add, remove, or modify directories in extension settings
  - Maintains backward compatibility with command-line arguments and environment variables

- **Improved Tool Discoverability**: Enhanced tool descriptions to help Claude automatically recognize and use this extension
  - Fixed critical issue: Source code had generic descriptions while manifest had improved ones
  - All tool descriptions in both manifest.json AND src/index.ts now emphasize Linux-specific features
  - Descriptions highlight: permissions, symlinks, UID/GID, metadata, chmod
  - Claude should now automatically recognize when filesystem tools are available
  - Distinguishes this extension from other filesystem MCP servers

### Fixed

- **Critical**: Fixed "Failed to save configuration" error during installation
  - Added required `default` field to `user_config.allowed_directories`
  - Per MCPB spec, fields with `multiple: true` must provide default array value
  - Default set to `[]` (empty array) to match official examples

- **Critical**: Fixed variable expansion using correct MCPB syntax
  - Changed from incorrect `${...user_config.allowed_directories}` (spread syntax)
  - To correct `${user_config.allowed_directories}` (no spread operator)
  - Claude Desktop automatically expands multiple values into separate args when `multiple: true`
  - Based on official anthropics/mcpb file-system-node example

- **Important**: User config variables only work in `args`, not `env`
  - Removed `MCP_ALLOWED_DIRS` environment variable approach
  - Environment variables don't support `${user_config.*}` template expansion
  - All directory values now passed via command-line arguments
  - Server already parses directories from args correctly

- **UX**: Dramatically improved error message when no directories are configured
  - Clear, formatted error message with step-by-step instructions
  - Shows debug information (args, environment variables) to help troubleshoot
  - Provides actionable tips for resolving the issue
  - Replaces generic "Server disconnected" error with helpful guidance

### Technical Details

- Correct syntax: `"args": ["${__dirname}/build/index.js", "${user_config.allowed_directories}"]`
- The manifest schema supports multiple values via the `multiple: true` property, not array types
- Valid user_config types are: 'string', 'number', 'boolean', 'directory', 'file'
- When `multiple: true`, each selected directory becomes a separate command-line argument automatically

## [1.0.3] - 2025-10-25

### Fixed

- **Critical**: Fixed "Server disconnected" error caused by missing transitive dependencies
  - Updated build script to copy ALL node_modules (not just @modelcontextprotocol)
  - Now includes all MCP SDK dependencies: ajv, ajv-formats, ajv-draft-04, etc.
  - Package size increased from 0.76 MB to 8.46 MB due to complete dependency tree
  - Server now starts successfully with both built-in and system Node.js

### Technical Details

The MCP SDK has transitive dependencies (like `ajv` for JSON schema validation) that weren't being bundled. The server would start but immediately crash with `ERR_MODULE_NOT_FOUND` when trying to import these packages. The build script now copies the entire node_modules directory with filtering to exclude test/doc files.

## [1.0.2] - 2025-10-25

### Fixed

- **Critical**: Fixed user_config schema validation errors
  - Changed from array type (unsupported) to single directory type
  - Removed invalid 'items' key from user_config
  - Changed compatibility back to object format (not array)
  - Updated mcp_config args to reference ${user_config.primary_directory}

### Changed

- Configuration now uses a single "Primary Directory" instead of multiple directories during setup
- Additional directories can be added manually by editing the extension configuration
- Improved user experience with clearer configuration prompts

## [1.0.1] - 2025-10-25

### Fixed

- **Critical**: Fixed manifest.json to comply with official MCPB schema
  - Changed `schemaVersion` to `manifest_version` (required field)
  - Added required `author` field with name
  - Restructured `server` configuration to use proper schema:
    - Added `type: "node"`
    - Added `entry_point` field
    - Moved server config to `mcp_config` object
  - Added `tools` array listing all available tools
  - Restructured configuration as `user_config` array (instead of `configuration` object)
  - Added `compatibility` section specifying platform support and minimum Claude Desktop version
  - Added `keywords` for discoverability
  - Added `long_description` field

### Changed

- User configuration now properly integrates with Claude Desktop's UI
- allowedDirectories configuration now shows as directory picker in Claude Desktop
- Platform restrictions now properly enforced (Linux-only)

### Technical Details

The previous manifest used an incorrect schema that caused Claude Desktop to reject the extension with "Please ensure the DXT file is valid and try again" error. The new manifest follows the official MCPB 0.1 specification from anthropics/mcpb repository.

## [1.0.0] - 2025-10-25

### Added

- Initial release
- Core filesystem operations (read, write, create, list, move, delete)
- Linux-specific features (symlinks, chmod)
- Directory access controls
- Detailed file information including permissions and ownership
- File search functionality
- Support for hidden files (optional)
- Symbolic link following (optional)
