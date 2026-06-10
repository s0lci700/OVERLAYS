/**
 * V1: Surface Badge
 *
 * FileDecorationProvider that stamps every file in the explorer and editor
 * tabs with a single-letter badge + ThemeColor for its TableRelay surface.
 * Eliminates the "where am I?" disorientation across 284+ components.
 *
 *   S = Stage    (yellow)
 *   C = Cast     (green)
 *   A = Audience (blue)
 *   B = Backend  (purple)
 *   ◇ = Contracts(orange)
 *   U = UI Kit   (red)
 */
import * as vscode from 'vscode';
import { detectSurface, SURFACE_BADGES, SURFACE_COLORS } from '../utils/surfaceDetect.js';

export class SurfaceBadgeProvider implements vscode.FileDecorationProvider {
  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    const surface = detectSurface(uri.fsPath);
    if (!surface) return undefined;

    return {
      badge:   SURFACE_BADGES[surface],
      color:   new vscode.ThemeColor(SURFACE_COLORS[surface]),
      tooltip: `TableRelay — ${surface}`,
    };
  }
}
