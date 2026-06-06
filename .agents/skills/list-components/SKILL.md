---
name: list-components
description: List React component files in a project's components folder, optionally limited to a named subdirectory, with inferred one-line descriptions and a summary count. Use when the user asks to list, inventory, or inspect project components.
---

# List Components

List all React component files (.tsx, .ts, .jsx, .js) in the components folder.

If a subdirectory is provided, only list files in that subdirectory.

## Output Format

- Numbered list of files with relative paths
- Brief one-line description of each (infer from filename)
- Summary count at the end

If no files found, say "No components found."
