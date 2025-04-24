import { Container, Title, Text, Button, Stack } from '@mantine/core';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" align="center">
        <Title order={1}>Welcome to Notetaker</Title>
        <Text size="lg" c="dimmed" ta="center" maw={600}>
          A modern, frictionless note-taking application that emphasizes organic organization through tags and note references.
        </Text>
        <Button
          component={Link}
          href="/notes"
          size="lg"
          variant="filled"
        >
          Get Started
        </Button>
      </Stack>
    </Container>
  );
} 