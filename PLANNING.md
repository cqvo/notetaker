# Notetaking App Implementation Plan

## 1. Technology Stack

### Core Technologies
- **NextJS 14**: For the full-stack application framework
  - App Router for enhanced server components
  - Server Actions for form handling
  - Built-in API routes
  - Excellent TypeScript support
  - Streaming and Suspense support
- **Supabase**: For backend and real-time capabilities
  - PostgreSQL database with real-time subscriptions
  - Built-in authentication
  - Row Level Security for data protection
  - Full-text search capabilities
- **Mantine UI**: For UI components and styling
  - Modern, accessible components
  - Built-in dark mode support
  - Excellent TypeScript support
  - Tailwind CSS integration
  - Responsive design primitives

### Additional Libraries
- **DOMPurify**: For sanitizing markdown input
- **marked**: For markdown parsing
- **date-fns**: For timestamp handling
- **Tabler Icons**: For consistent iconography

## 2. Project Structure

```
notetaker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── notes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       ├── layout.tsx
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       ├── account/
│   │       │   └── page.tsx
│   │       ├── notifications/
│   │       │   └── page.tsx
│   │       └── theme/
│   │           └── page.tsx
│   ├── api/
│   │   └── search/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── PasswordResetForm.tsx
│   │   ├── OAuthButtons.tsx
│   │   └── AuthGuard.tsx
│   ├── user/
│   │   ├── ProfileSettings.tsx
│   │   ├── AccountSettings.tsx
│   │   ├── NotificationSettings.tsx
│   │   ├── ThemeSettings.tsx
│   │   └── UserAvatar.tsx
│   ├── note/
│   │   ├── NoteEditor.tsx
│   │   ├── NoteViewer.tsx
│   │   ├── NoteList.tsx
│   │   └── NoteReference.tsx
│   ├── tag/
│   │   ├── TagCloud.tsx
│   │   └── TagList.tsx
│   └── search/
│       ├── SearchBar.tsx
│       └── SearchResults.tsx
├── lib/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useNotes.ts
│   │   ├── useTags.ts
│   │   └── useSearch.ts
│   ├── services/
│   │   ├── auth.ts
│   │   ├── supabase.ts
│   │   ├── notes.ts
│   │   └── search.ts
│   ├── utils/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── markdown.ts
│   │   ├── tagParser.ts
│   │   └── referenceParser.ts
│   └── types/
│       ├── user.ts
│       ├── note.ts
│       ├── tag.ts
│       └── reference.ts
├── public/
├── styles/
│   └── globals.css
└── tests/
```

## 3. Database Schema

### Schema Design and Rationale

The database schema is designed with separate tables for notes, tags, and their relationships. This design follows important database principles that ensure data integrity, query performance, and scalability.

```sql
-- User settings and preferences
create table user_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    display_name text,
    avatar_url text,
    theme text default 'system',
    email_notifications boolean default true,
    date_format text default 'MM/DD/YYYY',
    time_format text default '12h',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint unique_user_settings unique (user_id)
);

-- User theme preferences
create table user_theme_preferences (
    user_id uuid references auth.users(id) on delete cascade,
    theme_key text not null,
    theme_value text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    primary key (user_id, theme_key)
);

-- Notes table (updated)
create table notes (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    user_id uuid references auth.users(id) on delete cascade,
    is_public boolean default false,
    search_vector tsvector generated always as (
        setweight(to_tsvector('english', title), 'A') ||
        setweight(to_tsvector('english', content), 'B')
    ) stored
);

-- Note versions for history and conflict resolution
create table note_versions (
    id uuid primary key default gen_random_uuid(),
    note_id uuid references notes(id) on delete cascade,
    title text not null,
    content text not null,
    created_at timestamp with time zone default now(),
    created_by uuid references auth.users(id)
);

-- Note drafts for auto-save functionality
create table note_drafts (
    id uuid primary key default gen_random_uuid(),
    note_id uuid references notes(id) on delete cascade,
    title text,
    content text,
    last_autosaved_at timestamp with time zone default now(),
    user_id uuid references auth.users(id)
);

-- Backup metadata for tracking backup operations
create table backup_metadata (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    backup_date timestamp with time zone default now(),
    backup_size bigint,
    note_count integer,
    status text,
    backup_location text
);

-- Tags table (extracted from notes)
create table tags (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamp with time zone default now()
);

-- Note-Tag relationship
create table note_tags (
    note_id uuid references notes(id) on delete cascade,
    tag_id uuid references tags(id) on delete cascade,
    primary key (note_id, tag_id)
);

-- References between notes
create table note_references (
    source_note_id uuid references notes(id) on delete cascade,
    target_note_id uuid references notes(id) on delete cascade,
    context text,
    created_at timestamp with time zone default now(),
    primary key (source_note_id, target_note_id)
);

-- Tag embeddings for AI suggestions
create table tag_embeddings (
    tag_id uuid references tags(id) on delete cascade,
    embedding vector(1536),
    updated_at timestamp with time zone default now(),
    primary key (tag_id)
);

-- Tag feedback for learning
create table tag_feedback (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    tag_id uuid references tags(id),
    note_id uuid references notes(id),
    accepted boolean,
    context text,
    created_at timestamp with time zone default now()
);

-- Tag co-occurrence for suggestions
create table tag_cooccurrence (
    tag1_id uuid references tags(id),
    tag2_id uuid references tags(id),
    user_id uuid references auth.users(id),
    count integer default 1,
    primary key (tag1_id, tag2_id, user_id)
);

-- Row Level Security Policies
alter table user_settings enable row level security;

-- Policy: Users can only view and edit their own settings
create policy "Users can manage their settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table user_theme_preferences enable row level security;

-- Policy: Users can only view and edit their own theme preferences
create policy "Users can manage their theme preferences"
  on user_theme_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add indexes for performance
create index user_settings_user_id_idx on user_settings(user_id);
create index user_theme_preferences_user_id_idx on user_theme_preferences(user_id);

-- Optimize search performance
create index notes_search_idx on notes using gin(search_vector);

-- Optimize user's notes listing
create index notes_user_created_idx on notes(user_id, created_at desc);

-- Optimize concurrent access
alter table notes add constraint unique_title_per_user unique (user_id, title);

-- Optimize version history retrieval
create index note_versions_note_created_idx on note_versions(note_id, created_at desc);

-- Ensure single draft per note per user
alter table note_drafts add constraint unique_draft_per_note_user unique (note_id, user_id);
```

### Design Principles

1. **Many-to-Many Relationships**
   - Notes can have multiple tags and tags can be associated with multiple notes
   - Separate relationship tables avoid array fields or denormalized data
   - Clean junction table implementation for both tags and references

2. **Data Integrity**
   - Foreign key constraints ensure referential integrity
   - `on delete cascade` automatically cleans up related records
   - Prevents orphaned relationships
   - Maintains database consistency
   - Version history for conflict resolution
   - Auto-save support for data protection

3. **Query Performance**
   - Separate tables enable efficient indexing
   - Optimized query paths for common operations
   - Database engine can optimize joins effectively
   - Supports performance requirements (<500ms for search, <300ms for tag filtering)
   - Specialized indexes for common access patterns

4. **Storage Efficiency**
   - Tags stored once in dedicated table
   - References store only necessary IDs and context
   - Avoids data duplication
   - Scales efficiently for 10,000+ notes requirement
   - Version control with minimal overhead

5. **Flexibility and Maintenance**
   - Easy to add new attributes to relationships
   - Global tag updates require changing single record
   - Independent reference integrity tracking
   - Schema can evolve without major restructuring
   - Backup tracking for data protection

### Example Queries

```sql
-- Find all tags for a specific note
SELECT t.name 
FROM tags t
JOIN note_tags nt ON t.id = nt.tag_id
WHERE nt.note_id = 'some-note-id';

-- Find all notes with a specific tag
SELECT n.*
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
WHERE nt.tag_id = 'some-tag-id';

-- Find all notes referenced by a given note
SELECT n.*
FROM notes n
JOIN note_references nr ON n.id = nr.target_note_id
WHERE nr.source_note_id = 'some-note-id';

-- Find all notes that reference a specific note
SELECT n.*
FROM notes n
JOIN note_references nr ON n.id = nr.source_note_id
WHERE nr.target_note_id = 'some-note-id';

-- Find notes with specific tags and their references
SELECT DISTINCT n.*
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
LEFT JOIN note_references nr ON n.id = nr.source_note_id
WHERE nt.tag_id IN (SELECT id FROM tags WHERE name = '#important')
AND nr.target_note_id IS NOT NULL;
```

### Alternative Approaches Considered

Embedding relationships directly in the notes table was considered but rejected because:
- Would require array fields or denormalized data
- More complex and less efficient queries
- Harder to maintain data integrity
- Poor scalability for large datasets
- Difficult to extend with new relationship attributes

The current design better supports the project requirements:
- Efficient bi-directional reference queries
- Fast tag search and filtering
- Automatic reference integrity
- Scalability to 10,000+ notes and 1,000+ unique tags
- Meets performance requirements through proper indexing

## 4. Multi-Tenant Architecture

### Supabase Authentication
- Built-in auth system with multiple providers:
  - Email/password
  - OAuth (Google, GitHub, etc.)
  - Magic link authentication
  - Phone authentication
- Session management handled automatically
- JWT tokens for API authentication
- Secure password hashing and storage

### Row Level Security (RLS)
```sql
-- Enable RLS on notes table
alter table notes enable row level security;

-- Policy: Users can only view their own notes
create policy "Users can view their own notes"
  on notes for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own notes
create policy "Users can create notes"
  on notes for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own notes
create policy "Users can update their own notes"
  on notes for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own notes
create policy "Users can delete their own notes"
  on notes for delete
  using (auth.uid() = user_id);

-- Enable RLS on note_tags
alter table note_tags enable row level security;

-- Policy: Users can manage tags for notes they own
create policy "Users can manage their note tags"
  on note_tags for all
  using (
    exists (
      select 1 from notes
      where id = note_tags.note_id
      and user_id = auth.uid()
    )
  );

-- Enable RLS on note_references
alter table note_references enable row level security;

-- Policy: Users can manage references for notes they own
create policy "Users can manage their note references"
  on note_references for all
  using (
    exists (
      select 1 from notes
      where id = note_references.source_note_id
      and user_id = auth.uid()
    )
  );
```

### Infrastructure Security Layers

1. **Edge Layer (Vercel)**
   - SSL/TLS encryption
   - DDoS protection
   - Edge caching for static assets
   - Geographic distribution

2. **Application Layer (SvelteKit)**
   - Server-side session validation
   - CSRF protection
   - XSS prevention
   - Input sanitization
   - Rate limiting per user

3. **Database Layer (Supabase)**
   - Connection pooling per tenant
   - Query timeout limits
   - Statement timeout limits
   - RLS policies
   - Encrypted data at rest

4. **Caching Layer**
   - Per-tenant cache isolation
   - Cache key prefixing with user ID
   - Separate Redis instances per region
   - Cache invalidation on data changes

### Data Isolation

1. **Logical Isolation**
   - Each user's data is isolated through RLS
   - Queries automatically filtered by user_id
   - No cross-tenant data access possible
   - Efficient shared database resources

2. **API Isolation**
   - JWT-based authentication
   - User-specific API rate limits
   - Tenant-aware error handling
   - Request tracing per tenant

3. **Storage Isolation**
   - User-specific storage buckets
   - Separate backup streams
   - Isolated file access policies
   - Per-tenant storage quotas

### Performance Considerations

1. **Database Optimization**
   - Indexes include user_id for efficient filtering
   - Partitioning strategy for large tenants
   - Connection pooling per tenant
   - Query optimization with user context

2. **Caching Strategy**
   ```typescript
   // Example cache key generation
   const getCacheKey = (userId: string, resource: string, id: string) => {
     return `user:${userId}:${resource}:${id}`;
   };
   
   // Example cache middleware
   const withCache = async (userId: string, key: string, getData: () => Promise<any>) => {
     const cacheKey = getCacheKey(userId, 'notes', key);
     const cached = await redis.get(cacheKey);
     
     if (cached) return JSON.parse(cached);
     
     const data = await getData();
     await redis.setex(cacheKey, 3600, JSON.stringify(data));
     return data;
   };
   ```

3. **Real-time Updates**
   ```typescript
   // Example real-time subscription with tenant isolation
   const subscribeToUserNotes = (userId: string) => {
     return supabase
       .from('notes')
       .on('*', (payload) => {
         // RLS ensures only user's own notes are received
         handleRealtimeUpdate(payload);
       })
       .subscribe();
   };
   ```

### Monitoring and Analytics

1. **Per-Tenant Metrics**
   - Request volume
   - Storage usage
   - API usage patterns
   - Error rates
   - Performance metrics

2. **Alerting**
   - Tenant-specific thresholds
   - Usage anomaly detection
   - Error rate monitoring
   - Performance degradation alerts

3. **Audit Logging**
   - User activity tracking
   - Security event logging
   - Access pattern analysis
   - Compliance reporting

### Scaling Strategy

1. **Horizontal Scaling**
   - Load balancing per region
   - Database read replicas
   - Cache distribution
   - CDN for static assets

2. **Vertical Scaling**
   - Database resource allocation
   - Cache memory allocation
   - API compute resources
   - Storage capacity

3. **Geographic Distribution**
   - Multi-region deployment
   - Data replication
   - Cache distribution
   - Edge function distribution

## 5. AI-Powered Tag Suggestions

### Overview
The application leverages AI to provide intelligent tag suggestions through multiple complementary approaches:
- Real-time semantic analysis
- Historical pattern recognition
- Content-based classification
- Contextual analysis
- Hybrid recommendation system
- Continuous learning from user feedback

### Implementation Details

1. **Real-time Tag Suggestions**
```typescript
interface TagSuggestion {
  tag: string;
  confidence: number;
  reason: string;
}

async function suggestTags(noteContent: string): Promise<TagSuggestion[]> {
  // Get content embedding
  const contentEmbedding = await getEmbedding(noteContent);
  
  // Compare with existing tag embeddings
  const similarTags = await findSimilarTags(contentEmbedding);
  
  // Extract key concepts using AI
  const concepts = await extractConcepts(noteContent);
  
  return [
    ...similarTags,
    ...concepts.map(c => ({
      tag: `#${c.toLowerCase().replace(/\s+/g, '-')}`,
      confidence: c.score,
      reason: c.explanation
    }))
  ];
}
```

2. **Historical Pattern Analysis**
```typescript
interface TagPattern {
  tag: string;
  cooccurringTags: Map<string, number>;
  contexts: string[];
}

async function analyzeTagPatterns(userId: string): Promise<TagPattern[]> {
  const userNotes = await getUserNotes(userId);
  const patterns = new Map<string, TagPattern>();
  
  userNotes.forEach(note => {
    note.tags.forEach(tag => {
      // Build co-occurrence matrix
      // Track contexts where tags are used
    });
  });
  
  return Array.from(patterns.values());
}
```

3. **Content Classification**
```typescript
interface ContentClassification {
  categories: string[];
  entities: string[];
  themes: string[];
  tone: string;
}

async function classifyContent(content: string): Promise<ContentClassification> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{
      role: "system",
      content: "Analyze the following text and identify key categories, entities, themes, and tone."
    }, {
      role: "user",
      content
    }]
  });
  
  return parseClassification(response);
}
```

4. **Contextual Analysis**
```typescript
async function getContextualTags(noteId: string): Promise<string[]> {
  const references = await getNoteReferences(noteId);
  const referencedNotes = await getReferencedNotes(references);
  
  // Analyze tags from referenced notes
  const contextualTags = new Set<string>();
  referencedNotes.forEach(note => {
    note.tags.forEach(tag => contextualTags.add(tag));
  });
  
  return Array.from(contextualTags);
}
```

### Hybrid Recommendation System

```typescript
interface TagRecommendation {
  tag: string;
  confidence: number;
  source: 'semantic' | 'historical' | 'content' | 'contextual';
  explanation: string;
}

async function getTagRecommendations(
  noteContent: string,
  userId: string,
  noteId?: string
): Promise<TagRecommendation[]> {
  const [
    semanticTags,
    historicalTags,
    contentTags,
    contextualTags
  ] = await Promise.all([
    suggestTags(noteContent),
    analyzeTagPatterns(userId),
    classifyContent(noteContent),
    noteId ? getContextualTags(noteId) : Promise.resolve([])
  ]);
  
  // Combine and deduplicate recommendations
  // Weight different sources
  // Sort by confidence
  // Generate explanations
  
  return combinedRecommendations;
}
```

### Learning System

```typescript
interface TagFeedback {
  userId: string;
  suggestedTag: string;
  accepted: boolean;
  context: string;
  timestamp: Date;
}

async function recordTagFeedback(feedback: TagFeedback): Promise<void> {
  await supabase
    .from('tag_feedback')
    .insert(feedback);
  
  // Update recommendation weights
  await updateUserTagPreferences(feedback);
}
```

### Performance Optimizations

```typescript
const tagEmbeddingCache = new Map<string, number[]>();

async function getCachedEmbedding(tag: string): Promise<number[]> {
  if (tagEmbeddingCache.has(tag)) {
    return tagEmbeddingCache.get(tag)!;
  }
  
  const embedding = await getEmbedding(tag);
  tagEmbeddingCache.set(tag, embedding);
  return embedding;
}
```

### Database Schema Extensions

```sql
-- Tag embeddings table
create table tag_embeddings (
  tag_id uuid references tags(id) on delete cascade,
  embedding vector(1536),
  updated_at timestamp with time zone default now(),
  primary key (tag_id)
);

-- Tag feedback table
create table tag_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tag_id uuid references tags(id),
  note_id uuid references notes(id),
  accepted boolean,
  context text,
  created_at timestamp with time zone default now()
);

-- Tag co-occurrence table
create table tag_cooccurrence (
  tag1_id uuid references tags(id),
  tag2_id uuid references tags(id),
  user_id uuid references auth.users(id),
  count integer default 1,
  primary key (tag1_id, tag2_id, user_id)
);
```

### Integration Points

1. **Editor Integration**
   - Real-time suggestions as user types
   - Suggestion UI with confidence levels
   - One-click tag acceptance
   - Feedback collection

2. **Background Processing**
   - Periodic embedding updates
   - Pattern analysis updates
   - Model fine-tuning based on feedback

3. **API Endpoints**
   ```typescript
   // API routes in SvelteKit
   export async function POST({ request }) {
     const { content, userId, noteId } = await request.json();
     const suggestions = await getTagRecommendations(content, userId, noteId);
     return json(suggestions);
   }
   ```

4. **Monitoring**
   - Suggestion accuracy metrics
   - User acceptance rates
   - Processing performance
   - API latency

### Future Enhancements

1. **Advanced Features**
   - Multi-language support
   - Domain-specific tag suggestions
   - Hierarchical tag relationships
   - Tag clustering and organization

2. **Model Improvements**
   - Custom model fine-tuning
   - User-specific models
   - Improved context understanding
   - Better explanation generation

## 6. Design Patterns & Architecture

### Creational Patterns

1. **Factory Pattern**
   - `NoteFactory`: Creates different types of notes
     ```typescript
     class NoteFactory {
       createNote(type: 'text' | 'markdown' | 'code'): Note;
       createFromTemplate(templateId: string): Note;
     }
     ```
   - `TagFactory`: Handles tag creation and validation
     ```typescript
     class TagFactory {
       createTag(name: string): Tag;
       createFromText(text: string): Tag[];
     }
     ```

2. **Singleton Pattern**
   - `SupabaseClient`: Database connection manager
     ```typescript
     class SupabaseManager {
       private static instance: SupabaseManager;
       private constructor();
       static getInstance(): SupabaseManager;
     }
     ```
   - `TagSuggestionEngine`: AI suggestion service
     ```typescript
     class TagSuggestionEngine {
       private static instance: TagSuggestionEngine;
       private constructor();
       static getInstance(): TagSuggestionEngine;
     }
     ```

3. **Builder Pattern**
   - `NoteBuilder`: Complex note construction
     ```typescript
     class NoteBuilder {
       addContent(content: string): this;
       addTags(tags: string[]): this;
       addReferences(refs: string[]): this;
       build(): Note;
     }
     ```
   - `SearchQueryBuilder`: Search query construction
     ```typescript
     class SearchQueryBuilder {
       withTags(tags: string[]): this;
       withDateRange(start: Date, end: Date): this;
       withFullText(text: string): this;
       build(): SearchQuery;
     }
     ```

### Structural Patterns

1. **Adapter Pattern**
   - `MarkdownAdapter`: Converts between markdown and internal format
     ```typescript
     class MarkdownAdapter implements TextProcessor {
       toInternal(markdown: string): NoteContent;
       toMarkdown(content: NoteContent): string;
     }
     ```
   - `TagAdapter`: Normalizes different tag formats
     ```typescript
     class TagAdapter {
       normalize(input: string): Tag;
       format(tag: Tag): string;
     }
     ```

2. **Decorator Pattern**
   - `NoteDecorator`: Adds functionality to notes
     ```typescript
     class AutoSaveDecorator extends NoteDecorator {
       save(): Promise<void>;
     }
     class VersioningDecorator extends NoteDecorator {
       createVersion(): Promise<void>;
     }
     ```
   - `SearchDecorator`: Enhances search capabilities
     ```typescript
     class CacheDecorator extends SearchDecorator {
       search(query: SearchQuery): Promise<SearchResult>;
     }
     ```

3. **Facade Pattern**
   - `NoteFacade`: Simplifies note operations
     ```typescript
     class NoteFacade {
       createNote(content: string): Promise<Note>;
       updateNote(id: string, changes: Partial<Note>): Promise<Note>;
       deleteNote(id: string): Promise<void>;
     }
     ```
   - `SearchFacade`: Simplifies search operations
     ```typescript
     class SearchFacade {
       searchNotes(query: string): Promise<Note[]>;
       searchTags(query: string): Promise<Tag[]>;
     }
     ```

4. **Proxy Pattern**
   - `NoteProxy`: Lazy loading of note content
     ```typescript
     class NoteProxy implements INote {
       private fullContent: string | null = null;
       async getContent(): Promise<string>;
     }
     ```
   - `TagProxy`: Lazy loading of tag relationships
     ```typescript
     class TagProxy implements ITag {
       private relations: TagRelation[] | null = null;
       async getRelatedTags(): Promise<Tag[]>;
     }
     ```

### Behavioral Patterns

1. **Observer Pattern**
   - `NoteStore`: Reactive state management
     ```typescript
     class NoteStore implements Observable {
       private observers: Observer[] = [];
       subscribe(observer: Observer): void;
       unsubscribe(observer: Observer): void;
       notify(change: NoteChange): void;
     }
     ```
   - `TagStore`: Tag state management
     ```typescript
     class TagStore implements Observable {
       private observers: Observer[] = [];
       subscribe(observer: Observer): void;
       unsubscribe(observer: Observer): void;
       notify(change: TagChange): void;
     }
     ```

2. **Command Pattern**
   - `NoteCommands`: Note operations
     ```typescript
     interface NoteCommand {
       execute(): Promise<void>;
       undo(): Promise<void>;
     }
     class CreateNoteCommand implements NoteCommand {}
     class UpdateNoteCommand implements NoteCommand {}
     class DeleteNoteCommand implements NoteCommand {}
     ```
   - `TagCommands`: Tag operations
     ```typescript
     interface TagCommand {
       execute(): Promise<void>;
       undo(): Promise<void>;
     }
     class AddTagCommand implements TagCommand {}
     class RemoveTagCommand implements TagCommand {}
     ```

3. **Strategy Pattern**
   - `SearchStrategy`: Different search algorithms
     ```typescript
     interface SearchStrategy {
       search(query: string): Promise<SearchResult>;
     }
     class FullTextSearch implements SearchStrategy {}
     class TagBasedSearch implements SearchStrategy {}
     class ReferenceSearch implements SearchStrategy {}
     ```
   - `TagSuggestionStrategy`: Different suggestion approaches
     ```typescript
     interface SuggestionStrategy {
       suggest(content: string): Promise<Tag[]>;
     }
     class AIBasedSuggestion implements SuggestionStrategy {}
     class PatternBasedSuggestion implements SuggestionStrategy {}
     ```

4. **Chain of Responsibility Pattern**
   - `NoteProcessor`: Processing pipeline
     ```typescript
     abstract class NoteProcessor {
       protected next: NoteProcessor | null = null;
       setNext(processor: NoteProcessor): NoteProcessor;
       abstract process(note: Note): Promise<Note>;
     }
     class TagExtractor extends NoteProcessor {}
     class ReferenceExtractor extends NoteProcessor {}
     class AIEnhancer extends NoteProcessor {}
     ```
   - `ValidationChain`: Input validation
     ```typescript
     abstract class Validator {
       protected next: Validator | null = null;
       setNext(validator: Validator): Validator;
       abstract validate(input: any): Promise<boolean>;
     }
     class TagValidator extends Validator {}
     class ContentValidator extends Validator {}
     ```

5. **State Pattern**
   - `NoteState`: Note lifecycle management
     ```typescript
     interface NoteState {
       save(): Promise<void>;
       edit(): void;
       delete(): Promise<void>;
     }
     class DraftState implements NoteState {}
     class PublishedState implements NoteState {}
     class ArchivedState implements NoteState {}
     ```
   - `EditorState`: Editor mode management
     ```typescript
     interface EditorState {
       render(): void;
       handleInput(input: string): void;
     }
     class EditingState implements EditorState {}
     class PreviewState implements EditorState {}
     class ReadOnlyState implements EditorState {}
     ```

## 7. Authentication & User Management

### Authentication Flow

```typescript
// src/lib/services/authService.ts
export class AuthService {
  private supabase: SupabaseClient;

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (error) throw error;
  }
}

// src/lib/stores/authStore.ts
export const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  return {
    subscribe,
    setSession: (session: Session | null) => 
      update(state => ({ ...state, session, user: session?.user ?? null })),
    setLoading: (loading: boolean) => 
      update(state => ({ ...state, loading }))
  };
};

export const auth = createAuthStore();
```

### User Settings Management

```typescript
// src/lib/services/userService.ts
export class UserService {
  private supabase: SupabaseClient;

  async getUserSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUserSettings(
    userId: string, 
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateThemePreference(
    userId: string,
    key: string,
    value: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_theme_preferences')
      .upsert({
        user_id: userId,
        theme_key: key,
        theme_value: value
      });
    
    if (error) throw error;
  }
}

// src/lib/stores/userStore.ts
export const createUserStore = () => {
  const { subscribe, set, update } = writable<UserState>({
    settings: null,
    themePreferences: new Map(),
    loading: true
  });

  return {
    subscribe,
    setSettings: (settings: UserSettings) =>
      update(state => ({ ...state, settings })),
    setThemePreferences: (preferences: Map<string, string>) =>
      update(state => ({ ...state, themePreferences: preferences })),
    setLoading: (loading: boolean) =>
      update(state => ({ ...state, loading }))
  };
};

export const user = createUserStore();
```

### Protected Routes

```typescript
// src/lib/components/auth/AuthGuard.svelte
<script lang="ts">
  import { auth } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let requiredRole: string | null = null;

  onMount(() => {
    const unsubscribe = auth.subscribe(({ user, loading }) => {
      if (!loading && !user) {
        goto('/auth/login');
      }
      
      if (requiredRole && user?.role !== requiredRole) {
        goto('/');
      }
    });

    return unsubscribe;
  });
</script>

<slot />
```

### Form Components

```typescript
// src/lib/components/auth/LoginForm.svelte
<script lang="ts">
  import { authService } from '$lib/services/authService';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let loading = false;
  let error: string | null = null;

  async function handleSubmit() {
    try {
      loading = true;
      await authService.signIn(email, password);
      goto('/notes');
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<form class="auth-form" on:submit|preventDefault={handleSubmit}>
  <div class="auth-form__field">
    <label for="email" class="auth-form__label">Email</label>
    <input
      id="email"
      type="email"
      bind:value={email}
      class="auth-form__input"
      required
    />
  </div>

  <div class="auth-form__field">
    <label for="password" class="auth-form__label">Password</label>
    <input
      id="password"
      type="password"
      bind:value={password}
      class="auth-form__input"
      required
    />
  </div>

  {#if error}
    <div class="auth-form__error">{error}</div>
  {/if}

  <button
    type="submit"
    class="auth-form__button"
    disabled={loading}
  >
    {loading ? 'Signing in...' : 'Sign in'}
  </button>

  <a href="/auth/reset-password" class="auth-form__link">
    Forgot password?
  </a>
</form>

<style lang="scss">
  .auth-form {
    /* Mobile-first styles */
    @media (max-width: 768px) {
      padding: 1rem;
    }

    &__field {
      margin-bottom: 1rem;
    }

    &__label {
      display: block;
      margin-bottom: 0.5rem;
      
      &::after { /* pseudo-element selector */
        content: "*";
        color: red;
      }
    }

    &__input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      
      &:focus { /* pseudo-class selector */
        outline: none;
        border-color: #0066cc;
        
        &::placeholder { /* pseudo-element selector */
          opacity: 0.5;
        }
      }
    }

    &__button {
      width: 100%;
      padding: 0.75rem;
      background-color: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:disabled { /* pseudo-class selector */
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      & + &__link { /* adjacent selector */
        margin-top: 1rem;
        text-align: center;
      }
    }

    &__error {
      color: red;
      margin-bottom: 1rem;
      text-align: center;
    }
  }
</style>
```

### Settings Components

```typescript
// src/lib/components/user/ProfileSettings.svelte
<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { userService } from '$lib/services/userService';
  import { onMount } from 'svelte';

  let displayName = '';
  let avatarUrl = '';
  let loading = false;
  let success = false;
  let error: string | null = null;

  onMount(() => {
    const unsubscribe = user.subscribe(({ settings }) => {
      if (settings) {
        displayName = settings.display_name;
        avatarUrl = settings.avatar_url;
      }
    });

    return unsubscribe;
  });

  async function handleSubmit() {
    try {
      loading = true;
      await userService.updateUserSettings(auth.user.id, {
        display_name: displayName,
        avatar_url: avatarUrl
      });
      success = true;
      error = null;
    } catch (e) {
      error = e.message;
      success = false;
    } finally {
      loading = false;
    }
  }
</script>

<form class="settings-panel" on:submit|preventDefault={handleSubmit}>
  <div class="settings-panel__section">
    <h2>Profile Settings</h2>
    
    <div class="settings-panel__field">
      <label for="displayName">Display Name</label>
      <input
        id="displayName"
        type="text"
        bind:value={displayName}
        class="settings-panel__input"
      />
    </div>

    <div class="settings-panel__field">
      <label for="avatarUrl">Avatar URL</label>
      <input
        id="avatarUrl"
        type="url"
        bind:value={avatarUrl}
        class="settings-panel__input"
      />
    </div>
  </div>

  {#if success}
    <div class="settings-panel__success">
      Settings saved successfully!
    </div>
  {/if}

  {#if error}
    <div class="settings-panel__error">{error}</div>
  {/if}

  <button
    type="submit"
    class="settings-panel__button"
    disabled={loading}
  >
    {loading ? 'Saving...' : 'Save Changes'}
  </button>
</form>

<style lang="scss">
  .settings-panel {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;

    @media (min-width: 768px) {
      padding: 2rem;
    }

    &__section {
      margin-bottom: 2rem;
      
      & + & { /* adjacent selector */
        border-top: 1px solid #eee;
        padding-top: 2rem;
      }
    }

    &__field {
      margin-bottom: 1rem;
    }

    &__input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      
      &:disabled { /* pseudo-class selector */
        background-color: #f5f5f5;
        cursor: not-allowed;
        
        &::before { /* pseudo-element selector */
          content: "Loading...";
          color: #666;
        }
      }
    }

    &__button {
      width: 100%;
      padding: 0.75rem;
      background-color: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      @media (min-width: 768px) {
        width: auto;
        min-width: 200px;
      }
      
      &:hover { /* pseudo-class selector */
        background-color: #0052a3;
      }
    }

    &__success,
    &__error {
      margin: 1rem 0;
      padding: 0.75rem;
      border-radius: 4px;
      text-align: center;
    }

    &__success {
      background-color: #e6ffe6;
      color: #006600;
    }

    &__error {
      background-color: #ffe6e6;
      color: #cc0000;
    }
  }
</style>
```

### Route Protection

```typescript
// src/routes/+layout.ts
import { auth } from '$lib/stores/authStore';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/callback'
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  // Subscribe to auth store
  const unsubscribe = auth.subscribe(({ user, loading }) => {
    if (!loading && !user && !isPublicRoute) {
      // Redirect to login if not authenticated
      goto('/auth/login');
    }
  });

  return {
    unsubscribe
  };
};
```

This implementation:
- Follows mobile-first design principles
- Includes required CSS selectors (descendent, adjacent, class, id, pseudo-element, pseudo-class)
- Uses modern authentication practices
- Implements secure user settings management
- Provides a clean and intuitive user interface
- Maintains proper type safety with TypeScript
- Follows SvelteKit best practices
- Integrates seamlessly with Supabase
- Includes proper error handling and loading states
- Implements proper route protection
- Follows the project requirements for note structure and data integrity

## 8. Key Features Implementation

### 1. Note Management
- Real-time markdown preview
- Autosave functionality (debounced)
- Version history
- Conflict resolution
- Offline support with sync

### 2. Tag System
- Real-time tag extraction
- Tag suggestions
- Tag analytics
- Bulk tag operations

### 3. Reference System
- Bi-directional linking
- Reference preview
- Reference graph visualization
- Broken reference detection

### 4. Search System
- Full-text search
- Tag-based filtering
- Reference-aware results
- Real-time updates

## 9. Performance Optimizations

### Database
- Proper indexing
- Materialized views for common queries
- Connection pooling
- Query optimization

### Frontend
- Code splitting
- Asset optimization
- Lazy loading
- Virtual scrolling for large lists

### Caching
- Service worker for offline support
- Redis for API caching
- Browser storage for frequently accessed data
- Optimistic updates

## 10. Testing Strategy

### Unit Tests
- Component testing
- Store testing
- Utility function testing
- Service layer testing

### Integration Tests
- API endpoint testing
- Database operations testing
- Real-time functionality testing

### E2E Tests
- User flow testing
- Performance testing
- Cross-browser testing

## 11. Security Measures

### Data Protection
- Input sanitization
- XSS prevention
- CSRF protection
- Rate limiting

### Authentication
- Supabase authentication
- Row Level Security
- Session management
- API security

## 12. Accessibility

### WCAG Compliance
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## 13. Deployment Strategy

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Security scanning
- Automated deployment

### Infrastructure
- Vercel for frontend
- Supabase for backend
- CDN for static assets
- Monitoring and logging

## 14. Future Considerations

### Scalability
- Horizontal scaling
- Database sharding
- Load balancing
- Caching strategies

### Features
- Collaboration
- Export/Import
- API access
- Mobile apps

## Implementation Timeline

### Phase 1 (Weeks 1-2)
- Project setup
- Basic note CRUD
- Database schema
- Authentication

### Phase 2 (Weeks 3-4)
- Tag system
- Reference system
- Search functionality
- Real-time updates

### Phase 3 (Weeks 5-6)
- UI/UX improvements
- Performance optimization
- Testing
- Documentation

### Phase 4 (Weeks 7-8)
- Security hardening
- Accessibility
- Deployment
- User testing 