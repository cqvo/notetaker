# Supabase Setup and Configuration

Project: `notetaker`  
Organization: `WumboTech`  
Region: `us-east-1`  
Project ID: `zsikmtpnegzzrleujyaz`

## Setup Tasks

### 1. Database Setup ✅

#### Extensions
- [x] Enable UUID extension (uuid-ossp)
- [x] Enable Vector extension for AI embeddings

#### Tables
- [x] Notes table with search vector
- [x] Note versions for history
- [x] Note drafts for auto-save
- [x] Backup metadata
- [x] Tags table
- [x] Note-Tag relationships
- [x] Note references
- [x] Tag embeddings for AI
- [x] Tag feedback
- [x] Tag co-occurrence

#### Optimizations
- [x] Search performance index (gin)
- [x] User's notes listing index
- [x] Concurrent access constraints
- [x] Version history retrieval index
- [x] Draft uniqueness constraints

### 2. Security Setup ✅

#### Row Level Security
- [x] Enable RLS on all tables
- [x] Notes table policies
- [x] Note versions policies
- [x] Note drafts policies
- [x] Backup metadata policies
- [x] Note tags policies
- [x] Note references policies
- [x] Tag feedback policies
- [x] Tag co-occurrence policies

### 3. Authentication Setup 🔄

#### Provider Configuration
- [ ] Email/Password authentication
  ```typescript
  // In your auth configuration file (e.g., src/lib/supabase.ts)
  import { createClient } from '@supabase/supabase-js'
  import { Database } from './types/supabase'

  export const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  // Example signup function
  export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  // Example signin function
  export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }
  ```

- [ ] OAuth providers setup
  1. Google OAuth
     - Go to Google Cloud Console
     - Create new project
     - Enable OAuth 2.0
     - Add authorized redirect URI: `https://zsikmtpnegzzrleujyaz.supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase Dashboard > Authentication > Providers > Google

  2. GitHub OAuth
     - Go to GitHub Developer Settings
     - Create new OAuth App
     - Add callback URL: `https://zsikmtpnegzzrleujyaz.supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase Dashboard > Authentication > Providers > GitHub

- [ ] Magic link authentication
  ```typescript
  // Example magic link function
  export async function sendMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }
  ```

#### Email Templates
Configure in Supabase Dashboard > Authentication > Email Templates:

- [ ] Email verification
  ```html
  <h2>Welcome to Notetaker!</h2>
  <p>Click the link below to confirm your email address:</p>
  <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
  <p>Or copy and paste this link:</p>
  <p>{{ .ConfirmationURL }}</p>
  ```

- [ ] Password reset
  ```html
  <h2>Reset Your Password</h2>
  <p>Click the link below to reset your password:</p>
  <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
  <p>Or copy and paste this link:</p>
  <p>{{ .ConfirmationURL }}</p>
  <p>If you did not request this, please ignore this email.</p>
  ```

- [ ] Magic link
  ```html
  <h2>Login to Notetaker</h2>
  <p>Click the link below to sign in:</p>
  <p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
  <p>Or copy and paste this link:</p>
  <p>{{ .ConfirmationURL }}</p>
  ```

#### Security Settings
Configure in Supabase Dashboard > Authentication > Settings:

- [ ] Password policies
  - Minimum password length: 8
  - Require numbers: Yes
  - Require special characters: Yes
  - Require uppercase letters: Yes
  - Require lowercase letters: Yes

- [ ] Rate limiting
  - Signup: 3 per hour
  - Login: 10 per minute
  - Magic links: 3 per hour
  - Reset password: 3 per hour

- [ ] MFA configuration
  - Enable TOTP (Time-based One-Time Password)
  - Required for all users: No
  - Allow user opt-in: Yes

- [ ] Session management
  - JWT expiry: 3600 seconds (1 hour)
  - Refresh token reuse interval: 10 seconds
  - Enable refresh token rotation: Yes

#### Implementation Steps

1. Install dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-sveltekit
```

2. Create auth helper files
```typescript
// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Database } from '../types/supabase'

export const supabase = createClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
)
```

3. Set up environment variables
```bash
# .env
PUBLIC_SUPABASE_URL="https://zsikmtpnegzzrleujyaz.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

4. Create auth routes
```typescript
// src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }
  throw redirect(303, '/')
}
```

5. Add auth middleware
```typescript
// src/hooks.server.ts
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event,
  })

  event.locals.getSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    }
  })
}
```

6. Add client-side auth helpers
```typescript
// src/lib/auth.ts
import { supabase } from './supabase'

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback`
  })
  return { data, error }
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password
  })
  return { data, error }
}
```

### 4. Storage Setup 🔄

#### Buckets
- [ ] Create attachments bucket
- [ ] Create backups bucket
- [ ] Set up bucket policies

#### CDN Configuration
- [ ] Configure CDN for attachments
- [ ] Set up caching rules
- [ ] Configure CORS policies

### 5. Edge Functions 🔄

#### AI Functions
- [ ] Tag suggestion function
- [ ] Content analysis function
- [ ] Embedding generation function

#### Backup Functions
- [ ] Backup creation
- [ ] Backup restoration
- [ ] Backup cleanup

#### Utility Functions
- [ ] Note export
- [ ] Note import
- [ ] Batch operations

### 6. Database Functions 🔄

#### Tag Management
- [ ] Tag extraction function
- [ ] Tag normalization function
- [ ] Tag merging function

#### Reference Management
- [ ] Reference extraction function
- [ ] Reference validation function
- [ ] Reference cleanup function

#### Search Functions
- [ ] Full-text search function
- [ ] Tag-based search function
- [ ] Combined search function

### 7. Monitoring Setup 🔄

#### Performance Monitoring
- [ ] Database performance metrics
- [ ] API performance metrics
- [ ] Edge function metrics

#### Error Tracking
- [ ] Error logging setup
- [ ] Error alerting
- [ ] Error reporting dashboard

#### Usage Monitoring
- [ ] Storage usage alerts
- [ ] Database connection alerts
- [ ] Rate limit monitoring
- [ ] Cost monitoring

## Database Migrations

### Initial Schema Setup
```sql
-- See migration 'initial_schema_setup'
-- Applied: ✅
```

### RLS Policies Setup
```sql
-- See migration 'setup_rls_policies'
-- Applied: ✅
```

## Environment Variables

The following environment variables need to be configured in your application:

```typescript
SUPABASE_URL="https://zsikmtpnegzzrleujyaz.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" // For admin functions only
```

## Type Generation

To generate TypeScript types for the database schema:

```bash
supabase gen types typescript --project-id zsikmtpnegzzrleujyaz > src/lib/types/supabase.ts
```

## Local Development

1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
```

2. Start local development
```bash
supabase start
```

3. Stop local development
```bash
supabase stop
```

## Deployment

1. Link to project
```bash
supabase link --project-ref zsikmtpnegzzrleujyaz
```

2. Deploy migrations
```bash
supabase db push
```

3. Deploy Edge Functions
```bash
supabase functions deploy
``` 