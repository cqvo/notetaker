import React from 'react';
import { Stack, Card, Text, Group, Badge } from '@mantine/core';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  return (
    <Stack gap="md">
      {notes.map((note) => (
        <Card
          key={note.id}
          component={Link}
          href={`/notes/${note.id}`}
          padding="md"
          style={{ cursor: 'pointer' }}
        >
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="lg">
              {note.title}
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(note.updatedAt).toLocaleDateString()}
            </Text>
          </Group>

          <Text lineClamp={2} size="sm" c="dimmed" mb="sm">
            {note.content.replace(/<[^>]*>/g, '')}
          </Text>

          <Group gap="xs">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="light">
                {tag}
              </Badge>
            ))}
          </Group>
        </Card>
      ))}
    </Stack>
  );
} 