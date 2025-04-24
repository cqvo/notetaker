# Development Guide

## Environment Setup

### Required Software
- Node.js 18.17 or later
- pnpm 8.0 or later
- Git
- VS Code (recommended)

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostCSS Language Support
- MDX

### Environment Variables
Create a `.env.local` file in the root directory:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Other configurations
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Workflow

### Starting Development
1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open http://localhost:3000

### Code Organization

```
notetaker/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── notes/             # Notes feature
│   │   ├── page.tsx      # Notes list
│   │   ├── new/          # New note
│   │   └── [id]/         # Note detail
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Layout components
│   │   └── AppShell.tsx  # Main layout wrapper
│   └── note/             # Note-related components
│       └── NoteEditor.tsx # Rich text editor
├── lib/                   # Shared utilities
├── types/                 # TypeScript types
└── public/               # Static files
```

### Component Guidelines

1. File Structure
```typescript
// ComponentName.tsx
'use client'; // If needed

import React from 'react';
import { useCallback } from 'react';
import type { ComponentProps } from './types';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Implementation
}
```

2. Props Interface
```typescript
// types.ts
export interface ComponentProps {
  prop1: string;
  prop2?: number;
  onChange?: (value: string) => void;
}
```

3. Styling
```typescript
// Use Tailwind classes
<div className="flex items-center justify-between p-4">
  {/* Content */}
</div>

// Use Mantine components for complex UI
import { Button, TextInput } from '@mantine/core';
```

### State Management

1. Local State
```typescript
const [value, setValue] = useState('');
const handleChange = useCallback((newValue: string) => {
  setValue(newValue);
}, []);
```

2. Form State
```typescript
import { useForm } from '@mantine/form';

const form = useForm({
  initialValues: {
    title: '',
    content: '',
    tags: [],
  },
  validate: {
    title: (value) => (value.length < 1 ? 'Title is required' : null),
  },
});
```

### API Integration

1. API Routes
```typescript
// app/api/notes/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
```

2. Client-side API Calls
```typescript
async function fetchNotes() {
  const response = await fetch('/api/notes');
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
}
```

### Error Handling

1. API Errors
```typescript
try {
  const data = await fetchNotes();
  // Handle success
} catch (error) {
  console.error('Failed to fetch notes:', error);
  // Show error notification
  notifications.show({
    title: 'Error',
    message: 'Failed to fetch notes',
    color: 'red',
  });
}
```

2. Form Validation
```typescript
const form = useForm({
  validate: {
    title: (value) => {
      if (!value) return 'Title is required';
      if (value.length > 100) return 'Title is too long';
      return null;
    },
  },
});
```

### Testing

1. Component Tests
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

2. API Tests
```typescript
// route.test.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { GET } from './route';

jest.mock('@supabase/auth-helpers-nextjs');

describe('Notes API', () => {
  it('returns notes', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
```

### Debugging

1. Client-side
```typescript
// Use React DevTools
import { useEffect } from 'react';

useEffect(() => {
  console.log('Component mounted with props:', props);
}, [props]);
```

2. Server-side
```typescript
// Use debug logs
import { debug } from 'debug';
const log = debug('app:notes');

log('Fetching notes with params:', params);
```

### Performance Optimization

1. Component Memoization
```typescript
import { memo } from 'react';

export const MemoizedComponent = memo(function Component({ prop1 }: Props) {
  return <div>{prop1}</div>;
});
```

2. Data Fetching
```typescript
// Use revalidation
export const revalidate = 60; // Revalidate every minute

// Use streaming
export const dynamic = 'force-dynamic';
```

### Deployment

1. Build
```bash
pnpm build
```

2. Preview
```bash
pnpm start
```

3. Environment Variables
- Set up environment variables in your hosting platform
- Use different values for development and production

### Common Issues

1. Next.js Build Errors
- Clear `.next` directory
- Delete `node_modules` and reinstall
- Check for TypeScript errors

2. Supabase Connection
- Verify environment variables
- Check RLS policies
- Test queries in Supabase dashboard

3. Component Errors
- Check 'use client' directives
- Verify prop types
- Check for undefined values 