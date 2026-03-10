"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stack, Text, Group, Box } from "@mantine/core";
import {IconLayoutDashboard, IconBox, IconClipboardList } from "@tabler/icons-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
    { label: "Inventory", href: "/inventory", icon: IconBox },
    { label: "Loans", href: "/loans", icon: IconClipboardList },
  ];

  return (
    <Stack gap="xl" pt="sm">
      {/* Navigation */}
      <Stack gap="xs">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <Box
                px="sm"
                py="xs"
                style={{
                  borderRadius: 8,
                  backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <Group gap="sm">
                  <Icon size={18} color={isActive ? "white" : "#9CA3AF"} />
                  <Text size="md" fw={isActive ? 600 : 400} c={isActive ? "white" : "gray.4"}>
                    {item.label}
                  </Text>
                </Group>
              </Box>
            </Link>
          );
        })}
      </Stack>
    </Stack>
  );
}