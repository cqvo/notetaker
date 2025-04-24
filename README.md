# Notetaker

A modern, frictionless note-taking application built with Next.js 15, Mantine UI, and TipTap editor.

## Features

- 📝 Rich text editing with TipTap
- 🏷️ Tag-based organization
- 🔍 Full-text search
- 🔗 Note linking and references
- 🌓 Light/dark mode support
- 📱 Responsive design

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Components**: [Mantine 7](https://mantine.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [TipTap](https://tiptap.dev/)
- **Database**: [Supabase](https://supabase.com/)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm 8.0 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/notetaker.git
cd notetaker
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

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
├── public/               # Static files
└── package.json         # Project dependencies
```

## Core Features

### Note Structure
- Independent notes without hierarchical organization
- Unique IDs and titles for each note
- Creation and modification timestamps
- Rich text content with Markdown support

### Tagging System
- Format: `#tag`
- Case-insensitive
- Multiple tags per note
- Automatic tag extraction and indexing
- Tag-based search and filtering

### Note References
- Format: `[[note-title]]`
- Bi-directional linking
- Reference integrity maintenance
- Interactive reference navigation

### Search
- Real-time search updates
- Tag-based filtering
- Full-text search
- Reference-aware search results

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Client components marked with 'use client' directive

## Performance Requirements

- Note creation: < 100ms
- Note loading: < 200ms
- Search results: < 500ms
- Tag filtering: < 300ms
- Support for 10,000+ notes
- Support for 1,000+ unique tags
- Support for 10,000+ references

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
