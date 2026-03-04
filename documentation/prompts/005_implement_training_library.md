# Prompt 005: Implement Training Library with all functionality

**Date:** 2025-03-01

**User prompt:** Implement Library with all functionality. Figma: [node 1-11487](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-11487)

**Tasks completed:**
- LOGIC-006: Programs create
- LOGIC-007: Programs edit
- LOGIC-008: Programs delete
- LOGIC-009: Programs search/filter
- TLIB-001–005: Training Library screens (already done, enhanced)

**Implementation:**
- Created `programsStore` (Zustand) for CRUD
- Added `ProgramOptionsMenu` (Edit, Delete, Create session)
- Updated `TrainingLibraryScreen`: search, options menu, empty state, 120x120 cards per Figma
- Updated `AddToLibraryFormScreen`: create/edit, type selector, wire to store
- Updated `GalleryScreen`: create program from selected videos, pass to CardioClassForm
- Updated `CardioClassFormScreen`: accept program param
- Added `price` to TrainingProgram type
- HomeScreen uses programs from store
