import React from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box, TextInput, Group, Button, TagsInput, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react';

interface NoteEditorProps {
  title: string;
  content: string;
  tags: string[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSave?: () => void;
  onDelete?: () => void;
}

export function NoteEditor({
  title,
  content,
  tags,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onSave,
  onDelete,
}: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
    ],
    content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  const handleSave = () => {
    if (onSave) {
      onSave();
      notifications.show({
        title: 'Success',
        message: 'Note saved successfully',
        color: 'green',
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      notifications.show({
        title: 'Success',
        message: 'Note deleted successfully',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <TextInput
          value={title}
          onChange={(event) => onTitleChange(event.currentTarget.value)}
          placeholder="Note title"
          size="lg"
          style={{ flex: 1 }}
        />
        <Group>
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={20} />}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            variant="filled"
            leftSection={<IconDeviceFloppy size={20} />}
            onClick={handleSave}
          >
            Save
          </Button>
        </Group>
      </Group>

      <TagsInput
        label="Tags"
        description="Type # followed by your tag and press enter"
        value={tags}
        onChange={onTagsChange}
        placeholder="Add tags"
        clearable
        maxTags={10}
      />

      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={60}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </Stack>
  );
} 