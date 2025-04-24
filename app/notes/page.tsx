'use client';

import { Container, TextInput, Group, Button, Stack, Paper, Title, Text, Badge } from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: Date;
}

export default function NotesPage() {
  const router = useRouter();
  
  // TODO: Fetch notes from API/database
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Sample Note 1',
      content: '<p>This is a sample note content.</p>',
      tags: ['#sample', '#test'],
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Sample Note 2',
      content: '<p>This is another sample note content.</p>',
      tags: ['#sample', '#demo'],
      updatedAt: new Date(),
    },
  ];

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Searching for:', query);
  };

  const handleCreateNote = () => {
    router.push('/notes/new');
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>My Notes</Title>
          <Button
            leftSection={<IconPlus size={20} />}
            onClick={handleCreateNote}
          >
            New Note
          </Button>
        </Group>

        <TextInput
          placeholder="Search notes..."
          leftSection={<IconSearch size={20} />}
          onChange={(e) => handleSearch(e.currentTarget.value)}
        />

        <Stack gap="md">
          {mockNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} style={{ textDecoration: 'none' }}>
              <Paper shadow="sm" p="md" withBorder>
                <Stack gap="xs">
                  <Title order={4}>{note.title}</Title>
                  <Text c="dimmed" size="sm">
                    Last updated: {note.updatedAt.toLocaleDateString()}
                  </Text>
                  <Group gap="xs">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="light">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Stack>
              </Paper>
            </Link>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
} 