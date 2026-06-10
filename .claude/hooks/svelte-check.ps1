# PostToolUse hook: runs svelte-check on .svelte/.ts edits in control-panel/
# Reads file path from stdin JSON (Claude Code hook input format).

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }
$json = $raw | ConvertFrom-Json
$f = $json.tool_input.file_path

if (-not $f) { exit 0 }
if ($f -notmatch 'control-panel') { exit 0 }
if ($f -notmatch '\.(svelte|ts)$') { exit 0 }

Push-Location "C:\Users\Sol\Desktop\PITCH\OVERLAYS\control-panel"
bunx svelte-check --threshold warning --output human-verbose
$exitCode = $LASTEXITCODE
Pop-Location

exit $exitCode
