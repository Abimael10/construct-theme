/**
 * @file Workbench builder — semantic palette → VS Code `colors` map.
 *
 * Produces the editor-chrome colour dictionary (the `colors` key of a theme).
 * Every value is derived from a named role in the resolved palette; there are
 * no literal colours here. Translucent washes are used wherever VS Code paints
 * a state on top of content (selections, hovers, drop targets) so the canvas
 * tints rather than flips, preserving the low-contrast field.
 *
 * Keys are grouped by surface to mirror the VS Code reference and keep the map
 * auditable. Anything intentionally left to VS Code's sensible default is
 * omitted rather than set to a guess.
 */

import { hex, alpha, mix, lighten, darken } from '../color/hsl.mjs';

/**
 * @param {import('../design/semantics.mjs').Palette} p
 * @returns {Record<string, string>}
 */
export const buildWorkbench = (p) => {
  const { n, a, status, vcs } = p;
  const H = hex;
  // Shorthands for the two most common operations in this map.
  const wash = (c, alphaValue) => H(alpha(c, alphaValue));
  const sel = (alphaValue) => wash(a.base, alphaValue);

  return {
    // ── Base ──────────────────────────────────────────────────────────────
    foreground: H(n.subtle),
    descriptionForeground: H(n.muted),
    errorForeground: H(status.error),
    'icon.foreground': H(n.ui),
    focusBorder: H(alpha(a.base, 0.6)),
    'selection.background': sel(0.3),
    'sash.hoverBorder': H(a.base),
    'widget.border': H(n.border),
    'widget.shadow': H(alpha(p.depth.mode === 'light' ? darken(n.canvas, 40) : n.canvasDeep, 0.4)),
    'scrollbar.shadow': H(alpha(n.canvasDeep, 0.5)),

    // ── Text & links ─────────────────────────────────────────────────────
    'textLink.foreground': H(a.base),
    'textLink.activeForeground': H(a.bright),
    'textPreformat.foreground': H(p.syn.callable),
    'textPreformat.background': H(alpha(a.base, 0.08)),
    'textBlockQuote.background': H(n.surface),
    'textBlockQuote.border': H(a.dim),
    'textCodeBlock.background': H(n.surface),
    'textSeparator.foreground': H(n.border),

    // ── Buttons ──────────────────────────────────────────────────────────
    'button.background': H(a.base),
    'button.foreground': H(a.on),
    'button.hoverBackground': H(a.bright),
    'button.secondaryBackground': H(n.surfaceHi),
    'button.secondaryForeground': H(n.text),
    'button.secondaryHoverBackground': H(lighten(n.surfaceHi, p.isLight ? -4 : 4)),
    'button.border': H(alpha(a.base, 0)),
    'checkbox.background': H(n.overlay),
    'checkbox.foreground': H(n.text),
    'checkbox.border': H(n.border),

    // ── Dropdowns & inputs ───────────────────────────────────────────────
    'dropdown.background': H(n.overlay),
    'dropdown.listBackground': H(n.surfaceHi),
    'dropdown.foreground': H(n.text),
    'dropdown.border': H(n.border),
    'input.background': H(n.overlay),
    'input.foreground': H(n.text),
    'input.border': H(n.border),
    'input.placeholderForeground': H(n.muted),
    'inputOption.activeBackground': H(alpha(a.base, 0.24)),
    'inputOption.activeForeground': H(n.textHi),
    'inputOption.activeBorder': H(alpha(a.base, 0.6)),
    'inputValidation.errorBackground': H(mix(n.surface, status.error, 0.2)),
    'inputValidation.errorBorder': H(status.error),
    'inputValidation.warningBackground': H(mix(n.surface, status.warning, 0.2)),
    'inputValidation.warningBorder': H(status.warning),
    'inputValidation.infoBackground': H(mix(n.surface, status.info, 0.2)),
    'inputValidation.infoBorder': H(status.info),

    // ── Scrollbar & minimap ──────────────────────────────────────────────
    'scrollbarSlider.background': H(alpha(n.ui, 0.22)),
    'scrollbarSlider.hoverBackground': H(alpha(n.ui, 0.34)),
    'scrollbarSlider.activeBackground': H(alpha(a.base, 0.4)),
    'minimap.background': H(alpha(n.canvas, 0.6)),
    'minimap.selectionHighlight': H(alpha(a.base, 0.5)),
    'minimap.findMatchHighlight': H(alpha(p.syn.number, 0.6)),
    'minimap.errorHighlight': H(alpha(status.error, 0.6)),
    'minimap.warningHighlight': H(alpha(status.warning, 0.6)),
    'minimapSlider.background': H(alpha(n.ui, 0.14)),
    'minimapSlider.hoverBackground': H(alpha(n.ui, 0.24)),
    'minimapSlider.activeBackground': H(alpha(a.base, 0.3)),

    // ── Editor core ──────────────────────────────────────────────────────
    'editor.background': H(n.canvas),
    'editor.foreground': H(n.text),
    'editorLineNumber.foreground': H(n.line),
    'editorLineNumber.activeForeground': H(n.subtle),
    'editorCursor.foreground': H(a.bright),
    'editorCursor.background': H(n.canvas),
    'editor.selectionBackground': sel(0.32),
    'editor.selectionHighlightBackground': sel(0.16),
    'editor.inactiveSelectionBackground': sel(0.18),
    'editor.wordHighlightBackground': H(alpha(a.support, 0.16)),
    'editor.wordHighlightStrongBackground': H(alpha(a.support, 0.26)),
    'editor.findMatchBackground': H(alpha(p.syn.number, 0.34)),
    'editor.findMatchHighlightBackground': H(alpha(p.syn.number, 0.18)),
    'editor.findRangeHighlightBackground': H(alpha(a.base, 0.1)),
    'editor.hoverHighlightBackground': H(alpha(a.base, 0.14)),
    'editor.lineHighlightBackground': H(alpha(p.isLight ? darken(n.canvas, 7) : lighten(n.canvas, 4), 0.6)),
    'editor.lineHighlightBorder': H(alpha(n.canvas, 0)),
    'editor.rangeHighlightBackground': H(alpha(a.base, 0.08)),
    'editorWhitespace.foreground': H(n.guide),
    'editorIndentGuide.background1': H(n.guide),
    'editorIndentGuide.activeBackground1': H(n.border),
    'editorRuler.foreground': H(alpha(n.border, 0.6)),
    'editorBracketMatch.background': H(alpha(a.base, 0.18)),
    'editorBracketMatch.border': H(alpha(a.base, 0.65)),
    'editorLink.activeForeground': H(a.bright),

    // ── Bracket-pair colourisation (cool→warm, low saturation) ───────────
    'editorBracketHighlight.foreground1': H(p.syn.callable),
    'editorBracketHighlight.foreground2': H(p.syn.type),
    'editorBracketHighlight.foreground3': H(p.syn.keyword),
    'editorBracketHighlight.foreground4': H(p.syn.string),
    'editorBracketHighlight.foreground5': H(p.syn.number),
    'editorBracketHighlight.foreground6': H(p.syn.property),
    'editorBracketHighlight.unexpectedBracket.foreground': H(status.error),

    // ── Gutter / diff / overview ─────────────────────────────────────────
    'editorGutter.background': H(n.canvas),
    'editorGutter.modifiedBackground': H(alpha(vcs.modified, 0.8)),
    'editorGutter.addedBackground': H(alpha(vcs.added, 0.8)),
    'editorGutter.deletedBackground': H(alpha(vcs.deleted, 0.8)),
    'editorError.foreground': H(status.error),
    'editorWarning.foreground': H(status.warning),
    'editorInfo.foreground': H(status.info),
    'editorHint.foreground': H(status.hint),
    'editorOverviewRuler.border': H(alpha(n.border, 0)),
    'editorOverviewRuler.findMatchForeground': H(alpha(p.syn.number, 0.6)),
    'editorOverviewRuler.errorForeground': H(status.error),
    'editorOverviewRuler.warningForeground': H(status.warning),
    'editorOverviewRuler.infoForeground': H(status.info),
    'editorOverviewRuler.addedForeground': H(alpha(vcs.added, 0.7)),
    'editorOverviewRuler.modifiedForeground': H(alpha(vcs.modified, 0.7)),
    'editorOverviewRuler.deletedForeground': H(alpha(vcs.deleted, 0.7)),
    'diffEditor.insertedTextBackground': H(alpha(vcs.added, 0.12)),
    'diffEditor.removedTextBackground': H(alpha(vcs.deleted, 0.12)),
    'diffEditor.insertedLineBackground': H(alpha(vcs.added, 0.08)),
    'diffEditor.removedLineBackground': H(alpha(vcs.deleted, 0.08)),
    'diffEditor.diagonalFill': H(alpha(n.border, 0.5)),

    // ── Squiggles ────────────────────────────────────────────────────────
    'editorError.background': H(alpha(status.error, 0)),
    'editorUnnecessaryCode.opacity': H(alpha(n.canvasDeep, 0.55)),
    'editorGhostText.foreground': H(n.muted),

    // ── Widgets (find, suggest, hover, peek) ─────────────────────────────
    'editorWidget.background': H(n.surfaceHi),
    'editorWidget.foreground': H(n.text),
    'editorWidget.border': H(n.border),
    'editorSuggestWidget.background': H(n.surfaceHi),
    'editorSuggestWidget.border': H(n.border),
    'editorSuggestWidget.foreground': H(n.text),
    'editorSuggestWidget.highlightForeground': H(a.base),
    'editorSuggestWidget.selectedBackground': H(alpha(a.base, 0.16)),
    'editorSuggestWidget.focusHighlightForeground': H(a.bright),
    'editorHoverWidget.background': H(n.surfaceHi),
    'editorHoverWidget.border': H(n.border),
    'editorHoverWidget.foreground': H(n.text),
    'peekView.border': H(alpha(a.base, 0.5)),
    'peekViewEditor.background': H(n.surface),
    'peekViewEditor.matchHighlightBackground': H(alpha(p.syn.number, 0.22)),
    'peekViewResult.background': H(n.surface),
    'peekViewResult.foreground': H(n.subtle),
    'peekViewResult.matchHighlightForeground': H(n.textHi),
    'peekViewResult.selectionBackground': H(alpha(a.base, 0.14)),
    'peekViewResult.selectionForeground': H(n.textHi),
    'peekViewTitle.background': H(n.surfaceHi),
    'peekViewTitleLabel.foreground': H(n.text),
    'peekViewTitleDescription.foreground': H(n.muted),

    // ── Activity bar ─────────────────────────────────────────────────────
    'activityBar.background': H(n.canvasDeep),
    'activityBar.foreground': H(n.subtle),
    'activityBar.inactiveForeground': H(n.ui),
    'activityBar.border': H(alpha(n.border, 0)),
    'activityBar.activeBorder': H(a.base),
    'activityBar.activeBackground': H(alpha(a.base, 0.1)),
    'activityBarBadge.background': H(a.base),
    'activityBarBadge.foreground': H(a.on),

    // ── Side bar ─────────────────────────────────────────────────────────
    'sideBar.background': H(n.surface),
    'sideBar.foreground': H(n.subtle),
    'sideBar.border': H(alpha(n.border, 0.5)),
    'sideBarTitle.foreground': H(n.muted),
    'sideBarSectionHeader.background': H(alpha(n.surfaceHi, 0)),
    'sideBarSectionHeader.foreground': H(n.muted),
    'sideBarSectionHeader.border': H(alpha(n.border, 0.4)),

    // ── Lists & trees ────────────────────────────────────────────────────
    'list.activeSelectionBackground': H(alpha(a.base, 0.16)),
    'list.activeSelectionForeground': H(n.textHi),
    'list.activeSelectionIconForeground': H(a.base),
    'list.inactiveSelectionBackground': H(alpha(n.ui, 0.1)),
    'list.inactiveSelectionForeground': H(n.text),
    'list.hoverBackground': H(alpha(n.ui, 0.08)),
    'list.hoverForeground': H(n.text),
    'list.focusBackground': H(alpha(a.base, 0.18)),
    'list.focusForeground': H(n.textHi),
    'list.focusOutline': H(alpha(a.base, 0)),
    'list.highlightForeground': H(a.base),
    'list.dropBackground': H(alpha(a.base, 0.16)),
    'list.errorForeground': H(status.error),
    'list.warningForeground': H(status.warning),
    'list.invalidItemForeground': H(status.error),
    'tree.indentGuidesStroke': H(n.guide),
    'tree.inactiveIndentGuidesStroke': H(alpha(n.guide, 0.5)),
    'listFilterWidget.background': H(n.surfaceHi),
    'listFilterWidget.outline': H(a.base),
    'listFilterWidget.noMatchesOutline': H(status.error),

    // ── Editor groups & tabs ─────────────────────────────────────────────
    'editorGroup.border': H(alpha(n.border, 0.6)),
    'editorGroupHeader.tabsBackground': H(n.canvasDeep),
    'editorGroupHeader.tabsBorder': H(alpha(n.border, 0)),
    'editorGroupHeader.noTabsBackground': H(n.canvasDeep),
    'editorGroup.dropBackground': H(alpha(a.base, 0.14)),
    'tab.activeBackground': H(n.canvas),
    'tab.activeForeground': H(n.textHi),
    'tab.activeBorderTop': H(a.base),
    'tab.activeBorder': H(alpha(n.canvas, 0)),
    'tab.inactiveBackground': H(n.canvasDeep),
    'tab.inactiveForeground': H(n.muted),
    'tab.hoverBackground': H(n.surface),
    'tab.hoverForeground': H(n.text),
    'tab.unfocusedActiveForeground': H(n.subtle),
    'tab.unfocusedInactiveForeground': H(n.ui),
    'tab.border': H(alpha(n.border, 0.4)),
    'tab.activeModifiedBorder': H(vcs.modified),
    'tab.lastPinnedBorder': H(n.border),
    'editorPane.background': H(n.canvas),

    // ── Breadcrumbs ──────────────────────────────────────────────────────
    'breadcrumb.background': H(n.canvas),
    'breadcrumb.foreground': H(n.muted),
    'breadcrumb.focusForeground': H(n.text),
    'breadcrumb.activeSelectionForeground': H(a.base),
    'breadcrumbPicker.background': H(n.surfaceHi),

    // ── Panel (terminal, problems, output) ───────────────────────────────
    'panel.background': H(n.surface),
    'panel.border': H(alpha(n.border, 0.6)),
    'panelTitle.activeForeground': H(n.textHi),
    'panelTitle.activeBorder': H(a.base),
    'panelTitle.inactiveForeground': H(n.muted),
    'panelSectionHeader.background': H(n.surfaceHi),

    // ── Status bar ───────────────────────────────────────────────────────
    'statusBar.background': H(n.canvasDeep),
    'statusBar.foreground': H(n.subtle),
    'statusBar.border': H(alpha(n.border, 0)),
    'statusBar.debuggingBackground': H(p.syn.number),
    'statusBar.debuggingForeground': H(a.on),
    'statusBar.noFolderBackground': H(n.canvasDeep),
    'statusBarItem.hoverBackground': H(alpha(n.ui, 0.12)),
    'statusBarItem.activeBackground': H(alpha(n.ui, 0.2)),
    'statusBarItem.prominentBackground': H(alpha(a.base, 0.2)),
    'statusBarItem.prominentForeground': H(n.textHi),
    'statusBarItem.remoteBackground': H(a.base),
    'statusBarItem.remoteForeground': H(a.on),
    'statusBarItem.errorBackground': H(alpha(status.error, 0)),
    'statusBarItem.errorForeground': H(status.error),
    'statusBarItem.warningBackground': H(alpha(status.warning, 0)),
    'statusBarItem.warningForeground': H(status.warning),

    // ── Title bar ────────────────────────────────────────────────────────
    'titleBar.activeBackground': H(n.canvasDeep),
    'titleBar.activeForeground': H(n.subtle),
    'titleBar.inactiveBackground': H(n.canvasDeep),
    'titleBar.inactiveForeground': H(n.ui),
    'titleBar.border': H(alpha(n.border, 0)),

    // ── Menus ────────────────────────────────────────────────────────────
    'menu.background': H(n.surfaceHi),
    'menu.foreground': H(n.text),
    'menu.border': H(n.border),
    'menu.separatorBackground': H(n.border),
    'menu.selectionBackground': H(alpha(a.base, 0.18)),
    'menu.selectionForeground': H(n.textHi),
    'menubar.selectionBackground': H(alpha(n.ui, 0.12)),
    'menubar.selectionForeground': H(n.text),

    // ── Command palette / quick input ────────────────────────────────────
    'quickInput.background': H(n.surfaceHi),
    'quickInput.foreground': H(n.text),
    'quickInputList.focusBackground': H(alpha(a.base, 0.16)),
    'quickInputList.focusForeground': H(n.textHi),
    'quickInputList.focusIconForeground': H(a.base),
    'pickerGroup.foreground': H(a.base),
    'pickerGroup.border': H(n.border),
    'keybindingLabel.background': H(alpha(n.ui, 0.12)),
    'keybindingLabel.foreground': H(n.subtle),
    'keybindingLabel.border': H(alpha(n.border, 0.4)),
    'keybindingLabel.bottomBorder': H(n.border),

    // ── Badges & progress ────────────────────────────────────────────────
    'badge.background': H(a.base),
    'badge.foreground': H(a.on),
    'progressBar.background': H(a.base),

    // ── Notifications ────────────────────────────────────────────────────
    'notificationCenter.border': H(n.border),
    'notificationCenterHeader.background': H(n.surfaceHi),
    'notificationCenterHeader.foreground': H(n.muted),
    'notifications.background': H(n.surfaceHi),
    'notifications.foreground': H(n.text),
    'notifications.border': H(n.border),
    'notificationLink.foreground': H(a.base),
    'notificationsErrorIcon.foreground': H(status.error),
    'notificationsWarningIcon.foreground': H(status.warning),
    'notificationsInfoIcon.foreground': H(status.info),

    // ── Git decorations ──────────────────────────────────────────────────
    'gitDecoration.modifiedResourceForeground': H(vcs.modified),
    'gitDecoration.deletedResourceForeground': H(vcs.deleted),
    'gitDecoration.untrackedResourceForeground': H(vcs.untracked),
    'gitDecoration.ignoredResourceForeground': H(vcs.ignored),
    'gitDecoration.conflictingResourceForeground': H(vcs.conflict),
    'gitDecoration.addedResourceForeground': H(vcs.added),
    'gitDecoration.renamedResourceForeground': H(vcs.renamed),
    'gitDecoration.stageModifiedResourceForeground': H(vcs.modified),
    'gitDecoration.submoduleResourceForeground': H(p.syn.type),

    // ── Terminal (16-colour ANSI, calibrated to the syntax spectrum) ─────
    'terminal.background': H(n.surface),
    'terminal.foreground': H(n.text),
    'terminal.selectionBackground': sel(0.24),
    'terminalCursor.foreground': H(a.bright),
    'terminal.border': H(alpha(n.border, 0.6)),
    'terminal.ansiBlack': H(n.overlay),
    'terminal.ansiRed': H(status.error),
    'terminal.ansiGreen': H(p.syn.string),
    'terminal.ansiYellow': H(p.syn.number),
    'terminal.ansiBlue': H(p.syn.property),
    'terminal.ansiMagenta': H(p.syn.keyword),
    'terminal.ansiCyan': H(p.syn.callable),
    'terminal.ansiWhite': H(n.subtle),
    'terminal.ansiBrightBlack': H(n.ui),
    'terminal.ansiBrightRed': H(lighten(status.error, 8)),
    'terminal.ansiBrightGreen': H(lighten(p.syn.string, 8)),
    'terminal.ansiBrightYellow': H(lighten(p.syn.number, 8)),
    'terminal.ansiBrightBlue': H(lighten(p.syn.property, 8)),
    'terminal.ansiBrightMagenta': H(lighten(p.syn.keyword, 8)),
    'terminal.ansiBrightCyan': H(lighten(p.syn.callable, 8)),
    'terminal.ansiBrightWhite': H(n.textHi),

    // ── Charts ───────────────────────────────────────────────────────────
    'charts.foreground': H(n.text),
    'charts.lines': H(n.border),
    'charts.red': H(status.error),
    'charts.blue': H(p.syn.property),
    'charts.yellow': H(p.syn.number),
    'charts.orange': H(p.syn.constant),
    'charts.green': H(p.syn.string),
    'charts.purple': H(p.syn.type),

    // ── Debug ────────────────────────────────────────────────────────────
    'debugToolBar.background': H(n.surfaceHi),
    'debugToolBar.border': H(n.border),
    'debugIcon.breakpointForeground': H(status.error),
    'debugIcon.breakpointDisabledForeground': H(n.ui),
    'debugConsole.infoForeground': H(status.info),
    'debugConsole.warningForeground': H(status.warning),
    'debugConsole.errorForeground': H(status.error),
    'debugConsole.sourceForeground': H(n.muted),
    'editor.stackFrameHighlightBackground': H(alpha(p.syn.number, 0.14)),
    'editor.focusedStackFrameHighlightBackground': H(alpha(p.syn.string, 0.16)),

    // ── Welcome / settings ───────────────────────────────────────────────
    'welcomePage.tileBackground': H(n.surfaceHi),
    'welcomePage.tileHoverBackground': H(lighten(n.surfaceHi, p.isLight ? -3 : 3)),
    'welcomePage.progress.foreground': H(a.base),
    'settings.headerForeground': H(n.textHi),
    'settings.modifiedItemIndicator': H(a.base),
    'settings.focusedRowBackground': H(alpha(n.ui, 0.06)),

    // ── Extensions ───────────────────────────────────────────────────────
    'extensionButton.prominentBackground': H(a.base),
    'extensionButton.prominentForeground': H(a.on),
    'extensionButton.prominentHoverBackground': H(a.bright),
    'extensionBadge.remoteBackground': H(a.base),
    'extensionBadge.remoteForeground': H(a.on),
    'extensionIcon.starForeground': H(p.syn.number),
    'extensionIcon.verifiedForeground': H(p.syn.string),
  };
};
