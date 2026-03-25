# PostToolUse hook: runs svelte-check on .svelte/.ts edits in control-panel/
# Called by Claude Code after Write/Edit tool use.
# Claude Code sets CLAUDE_TOOL_INPUT_FILE_PATH env var for the edited file.

$f = $env:CLAUDE_TOOL_INPUT_FILE_PATH

if (-not $f) { exit 0 }
if ($f -notmatch 'control-panel') { exit 0 }
if ($f -notmatch '\.(svelte|ts)$') { exit 0 }

Push-Location "C:\Users\Sol\Desktop\PITCH\OVERLAYS\control-panel"
bunx svelte-check --threshold warning --output human-verbose
$exitCode = $LASTEXITCODE
Pop-Location

exit $exitCode
