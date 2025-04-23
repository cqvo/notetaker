# Notetaking App Project Rules

## Core Note Structure
1. Notes exist as independent entities without hierarchical organization
   - No folders or directory structures
   - Each note is a standalone document
   - Notes are identified by unique IDs and titles

2. Note Creation
   - Notes should be creatable with minimal friction
   - No mandatory fields except content
   - Creation timestamp must be preserved
   - Last modified timestamp must be tracked

## Tagging System
1. Tag Format and Rules
   - Tags must follow the format `#tag`
   - Tags can contain alphanumeric characters and hyphens
   - Tags are case-insensitive
   - Multiple tags per note are allowed
   - Tags must be extractable from note content

2. Tag Functionality
   - Tags must be automatically detected and indexed when notes are created/updated
   - No predefined tag categories - tags emerge organically from usage
   - Tags should be searchable and filterable
   - Tag search should show all notes containing that tag

## Note References
1. Reference Format
   - Notes can reference other notes using a defined syntax (e.g., `[[note-title]]` or similar)
   - References must be bi-directional (both referencing and referenced notes know about the connection)
   - References must maintain integrity (handle renamed or deleted notes)

2. Reference Functionality
   - References should be easily distinguishable in note content
   - References should be clickable/interactive
   - Circular references must be handled gracefully
   - References should preserve context of the connection

## Search and Discovery
1. Tag-Based Search
   - Searching by tag must show:
     * All notes directly tagged with the search term
     * Notes referenced by the tagged notes
     * Visual indication of relationships between notes
   - Search results should be organized by relevance

2. Search Features
   - Real-time search updates as user types
   - Support for multiple tag filtering
   - Clear visualization of note relationships
   - Option to expand/collapse referenced notes

## Data Integrity
1. Note Storage
   - All notes must be persistently stored
   - Regular auto-saving of changes
   - Conflict resolution for concurrent edits
   - Backup strategy for note data

2. Reference Integrity
   - References must remain valid even if notes are renamed
   - Deleted notes should not break references
   - Option to see broken references
   - System to repair or clean up broken references

## Performance Requirements
1. Response Times
   - Note creation: < 100ms
   - Note loading: < 200ms
   - Search results: < 500ms
   - Tag filtering: < 300ms

2. Scalability
   - Support for minimum 10,000 notes
   - Support for minimum 1,000 unique tags
   - Support for minimum 10,000 references between notes
   - Efficient handling of large note contents (>100KB)

## User Interface
1. Note Editor
   - Clean, distraction-free interface
   - Real-time tag highlighting
   - Real-time reference linking
   - Markdown support

2. Search Interface
   - Tag cloud or similar tag discovery interface
   - Clear visualization of note relationships
   - Easy navigation between referenced notes
   - Filter and sort options for search results 