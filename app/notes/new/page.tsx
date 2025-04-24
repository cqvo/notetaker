'use client';

import React from 'react';
import { Container, Paper } from '@mantine/core';
import { NoteEditor } from '@/components/note/NoteEditor';
import { useRouter } from 'next/navigation';

export default function NewNotePage() {
  const router = useRouter();

  const handleTitleChange = (title: string) => {
    // TODO: Update note title in state
    console.log('Title changed:', title);
  };

  const handleContentChange = (content: string) => {
    // TODO: Update note content in state
    console.log('Content changed:', content);
  };

  const handleTagsChange = (tags: string[]) => {
    // TODO: Update note tags in state
    console.log('Tags changed:', tags);
  };

  const handleSave = () => {
    // TODO: Save new note to database
    console.log('Saving new note...');
    // Redirect to notes list after saving
    router.push('/notes');
  };

  const handleDelete = () => {
    // Just redirect back to notes list since we're canceling creation
    router.push('/notes');
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="md" withBorder>
        <NoteEditor
          title=""
          content=""
          tags={[]}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onTagsChange={handleTagsChange}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </Paper>
    </Container>
  );
} 