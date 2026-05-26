# Changelog

User-visible changes to the Oracle Active Data Guard RedoRoutes Helper.

This project does not have tagged releases yet. Until the first release tag, changes are grouped into `Unreleased` and `Initial development`.

## Unreleased

### Added

- RedoRoutes import expands `LOCAL` and `ANY` aliases using database members found in the imported configuration.
- RedoRoutes import accepts broker `EDIT ... SET PROPERTY RedoRoutes` statements, `show ... RedoRoutes` output, and member summary lines.
- Validation warns when a cascaded member has a single source that may only receive redo through an alternate route.

### Fixed

- Multiple-source validation now distinguishes concurrent upstream sources from lower-priority alternate sources. A cascaded member is no longer flagged when its upstream Far Sync sources are mutually exclusive by priority, but it is still flagged when those upstream sources receive redo at the same priority.
- RedoRoutes generation handles routes that combine `PRIORITY > 1` with `Alternate To`.
- Loop detection is scoped to the currently selected primary instead of all routes in the full topology.

## Initial Development

### Added

- Visual topology editor for Oracle Active Data Guard RedoRoutes using React Flow.
- Node types for primary databases, physical standbys, Far Sync instances, and Recovery Appliances.
- Drag-and-drop LAD connections between members.
- Edge properties for LogXptMode, Priority, and Alternate To.
- Primary switching workflow to model redo routes for each possible primary database.
- Automatic DGMGRL RedoRoutes statement generation.
- Modal action to copy generated RedoRoutes statements.
- RedoRoutes import that converts broker route definitions into a graph.
- Topology export and import as JSON.
- Browser persistence so topology state survives page refreshes.
- Dynamic connection handles around node perimeters.
- Arrowheads and straight-line edge rendering.
- Dotted styling for lower-priority routes that are not currently effective.
- Improved default node naming.
- Build instructions, license, and project documentation.

### Changed

- Reworked the graph model to use node and edge IDs instead of DB_UNIQUE_NAME references, allowing member names to be changed after connections exist.
- Split the original application logic into smaller components, hooks, and utility modules.
- Improved the tutorial/help text and overall UI responsiveness.
- Refined RedoRoutes grouping by primary and alternate destination handling.
- Adjusted edge rendering so arrowheads remain visible near targets.
- Updated the app title and README limitations.

### Validation

- Prevents self-connections and connections into the current primary.
- Bounds loop detection to visible routes for the active primary.
- Tracks effective routes by priority so lower-priority alternatives are not counted as active feeds.
- Warns when members do not receive redo.
- Warns when a member receives from multiple simultaneous sources.
- Checks the limit of 10 non-ASYNC destinations.
- Checks the limit of 30 direct destinations from a source.
- Checks the limit of 127 total members.
