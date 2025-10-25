# Changelog

## [1.1.0] - 2025-10-25

### Added
- **Multiple Directory Support**: The extension now supports configuring multiple allowed directories through the Claude Desktop UI
  - Previously limited to a single `primary_directory` in the configuration
  - Now accepts an array of directories via `allowed_directories` config
  - Users can add, remove, or modify directories independently in the extension settings
  - Maintains backward compatibility with environment variables and command-line arguments

### Changed
- Updated `manifest.json` to use `allowed_directories` array instead of single `primary_directory`
- Enhanced documentation (README.md, INSTALL.md) to clarify multiple directory configuration options
- Improved installation instructions to reflect new multi-directory capability

### Technical Details
- Modified `user_config` in manifest.json to accept array type with directory items
- Updated `mcp_config.args` to spread multiple directories from configuration
- Code already supported multiple directories internally via command-line args and environment variables; this change exposes the capability in the Claude Desktop UI

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
