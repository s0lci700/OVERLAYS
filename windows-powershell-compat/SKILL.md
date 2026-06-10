---
name: windows-powershell-compat
description: Best practices for running shell commands and filters in the TableRelay project's Windows 11 / PowerShell environment.
---

## When to Use
- Running build scripts, tests, or git commands via the CLI.
- Filtering tool output (like `svelte-check` or `ls`).
- Accessing files outside the primary workspace.

## Procedure

1. **Chain Commands Safely**:
   - Avoid using `&&` for command chaining, as it is not supported in all PowerShell versions.
   - Use `;` or run commands as separate steps.
   ```powershell
   # Incorrect
   git status && git add .

   # Correct
   git status; git add .
   ```

2. **Filter Output with Select-String**:
   - Do not use `grep` (unless explicitly installed as a standalone tool).
   - Use `Select-String` with the `-Pattern` parameter.
   ```powershell
   # Incorrect
   bun run svelte-check | grep "Error"

   # Correct
   bun run svelte-check | Select-String -Pattern "Error"
   ```

3. **Exclude Patterns (Negative Match)**:
   - Use the `-NotMatch` flag with `Select-String`.
   ```powershell
   # Filter for "Character" but exclude "stories"
   bun run svelte-check | Select-String "Character" | Select-String "stories" -NotMatch
   ```

4. **Access External Paths**:
   - Many high-level tools (like `grep_search` or `read_file`) are restricted to the project workspace.
   - Use `run_shell_command` with absolute paths and standard shell tools (`cat`, `dir`, `ls`) to inspect files on other drives (e.g., `D:\`) when requested.

5. **Target Specific Python Environments**:
   - If an error log provides a specific Python executable path (e.g., in `AppData\Local\Python`), use that full path for `pip install` or script execution to ensure you are in the correct virtual environment.

## Pitfalls and Fixes
- **Token Errors**: `'&&' no es un separador de instrucciones válido`.
  - *Fix*: Replace `&&` with `;`.
- **Command Not Found**: `grep : El término 'grep' no se reconoce`.
  - *Fix*: Use `Select-String`.
- **Path Restrictions**: `resolves outside the allowed workspace directories`.
  - *Fix*: Use `run_shell_command` with `cat` or `dir` and the absolute path.

## Verification
- Run a chained command with `;` and confirm both parts execute.
- Use `Select-String` to successfully filter a large output.
