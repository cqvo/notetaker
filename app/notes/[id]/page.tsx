import React from 'react';
import { Container, Paper } from '@mantine/core';
import { NoteEditor } from '@/components/note/NoteEditor';

export default function NotePage() {
  // TODO: Fetch note data from API/database
  const mockNote = {
    id: '1',
    title: 'Sample Note',
    content: '<p>This is a sample note content.</p>',
    tags: ['#sample', '#test'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleTitleChange = (title: string) => {
    // TODO: Update note title
    console.log('Title changed:', title);
  };

  const handleContentChange = (content: string) => {
    // TODO: Update note content
    console.log('Content changed:', content);
  };

  const handleTagsChange = (tags: string[]) => {
    // TODO: Update note tags
    console.log('Tags changed:', tags);
  };

  const handleSave = () => {
    // TODO: Save note changes
    console.log('Saving note...');
  };

  const handleDelete = () => {
    // TODO: Delete note
    console.log('Deleting note...');
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="md" withBorder>
        <NoteEditor
          title={mockNote.title}
          content={mockNote.content}
          tags={mockNote.tags}
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