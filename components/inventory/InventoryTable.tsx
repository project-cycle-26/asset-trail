"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader,
  Center,
  Text,
  TextInput,
  Select,
  Switch,
  Stack,
  Paper,
  Title,
  SimpleGrid,
  Group,
  Button,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { DesktopInventoryTable } from "./DesktopInventoryTable";
import { MobileInventoryCards } from "./MobileInventoryCards";

export type Item = {
  id: number;
  name: string;
  category: string;
  quantity_total: number;
  quantity_available: number;
  status: string;
};

export function InventoryTable() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);

  // 🔎 FILTER STATES
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  async function fetchItems() {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data);
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch items",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleBorrow(itemId: number) {
    setBorrowingId(itemId);

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: itemId,
          member_id: 4,
          due_date: new Date(Date.now() + 7 * 86400000),
        }),
      });

      if (!res.ok) throw new Error();

      notifications.show({
        color: "green",
        title: "Success",
        message: "Item borrowed successfully",
      });

      fetchItems();
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Borrow failed",
      });
    } finally {
      setBorrowingId(null);
    }
  }

  // 🔥 FILTER LOGIC
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = categoryFilter
        ? item.category === categoryFilter
        : true;

      const matchesStatus = statusFilter ? item.status === statusFilter : true;

      const matchesLowStock = lowStockOnly
        ? item.quantity_available > 0 && item.quantity_available <= 3
        : true;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesLowStock
      );
    });
  }, [items, search, categoryFilter, statusFilter, lowStockOnly]);

  const handleReset = () => {
    setSearch("");
    setCategoryFilter(null);
    setStatusFilter(null);
    setLowStockOnly(false);
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No items found</Text>
      </Center>
    );
  }

  const categories = [...new Set(items.map((i) => i.category))];
  const statuses = [...new Set(items.map((i) => i.status))];

  return (
    <Stack gap="xl">
      {/* ===== FILTER PANEL ===== */}
      <Paper
  withBorder
  radius="md"
  p="md"
  shadow="xs"
>
  {/* Header */}
  <Group justify="space-between" align="center" mb="md">
    <Title order={5} fw={800}>
      Filters
    </Title>

    <Button
      variant="filled"
      size="sm"
      fw={600}
      leftSection={<IconRefresh size={16} />}
      onClick={handleReset}
    >
      Reset
    </Button>
  </Group>

  {/* Filters Grid */}
  <SimpleGrid
    cols={{ base: 1, sm: 2, md: 4 }}
    spacing="md"
  >
    <TextInput
      label="Search"
      placeholder="Search item..."
      leftSection={<IconSearch size={16} />}
      size="md"
      styles={{
        input: { borderWidth: 2 },
        label: { fontWeight: 600 },
      }}
      value={search}
      onChange={(e) => setSearch(e.currentTarget.value)}
    />

    <Select
      label="Category"
      placeholder="All"
      data={categories}
      size="md"
      styles={{
        input: { borderWidth: 2 },
        label: { fontWeight: 600 },
      }}
      value={categoryFilter}
      onChange={setCategoryFilter}
      clearable
    />

    <Select
      label="Status"
      placeholder="All"
      data={statuses}
      size="md"
      styles={{
        input: { borderWidth: 2 },
        label: { fontWeight: 600 },
      }}
      value={statusFilter}
      onChange={setStatusFilter}
      clearable
    />

    <Stack gap={4} justify="flex-end">
      <Text size="md" fw={600}>
        Stock
      </Text>

      <Group align="center">
        <Switch
          size="md"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.currentTarget.checked)}
        />
        <Text size="sm" fw={500}>
          Low stock only
        </Text>
      </Group>
    </Stack>
  </SimpleGrid>
</Paper>

      {/* ===== TABLE / CARDS ===== */}
      {filteredItems.length === 0 ? (
        <Center py="lg">
          <Text c="dimmed">No matching results</Text>
        </Center>
      ) : isMobile ? (
        <MobileInventoryCards
          items={filteredItems}
          borrowingId={borrowingId}
          onBorrow={handleBorrow}
        />
      ) : (
        <DesktopInventoryTable
          items={filteredItems}
          borrowingId={borrowingId}
          onBorrow={handleBorrow}
        />
      )}
    </Stack>
  );
}
