'use client';

import React from 'react';
import {
  AppShell as MantineAppShell,
  Burger,
  Group,
  NavLink,
  Title,
  ActionIcon,
  useMantineColorScheme,
  Box,
  Divider,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconHome,
  IconNotes,
  IconSettings,
  IconSun,
  IconMoon,
  IconSearch,
  IconTags,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const navigation = [
    { label: 'Home', href: '/', icon: IconHome },
    { label: 'Notes', href: '/notes', icon: IconNotes },
    { label: 'Tags', href: '/tags', icon: IconTags },
    { label: 'Search', href: '/search', icon: IconSearch },
    { label: 'Settings', href: '/settings', icon: IconSettings },
  ];

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>Notetaker</Title>
          </Group>
          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            size="lg"
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? (
              <IconSun style={{ width: rem(20) }} stroke={1.5} />
            ) : (
              <IconMoon style={{ width: rem(20) }} stroke={1.5} />
            )}
          </ActionIcon>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        <Box mb="md">
          <Title order={4} mb="sm">Navigation</Title>
          {navigation.slice(0, 4).map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              active={pathname === item.href}
            />
          ))}
        </Box>

        <Divider my="md" />

        <Box>
          <Title order={4} mb="sm">Settings</Title>
          {navigation.slice(4).map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              active={pathname === item.href}
            />
          ))}
        </Box>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
} 