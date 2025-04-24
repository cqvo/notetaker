import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/tiptap/styles.css';
import './globals.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Notetaker',
  description: 'A modern, frictionless note-taking application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider
          theme={theme}
          defaultColorScheme="auto"
        >
          <Notifications position="top-right" />
          <AppShell>{children}</AppShell>
        </MantineProvider>
      </body>
    </html>
  );
} 