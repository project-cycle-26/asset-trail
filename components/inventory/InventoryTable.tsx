"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Loader,
  Center,
  Badge,
  ScrollArea,
  Text,
  Button,
  Tooltip,
  Group,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconHash,
  IconBox,
  IconCategory,
  IconStack2,
  IconInfoCircle,
  IconBolt,
} from "@tabler/icons-react";

type Item = {
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

  const rows = items.map((item, index) => {
    const unavailable =
      item.quantity_available === 0 || item.status !== "WORKING";

    return (
      <Table.Tr key={item.id}>
        {/* Row Number */}
        <Table.Td fw={600}>{index + 1}</Table.Td>

        <Table.Td fw={500}>{item.name}</Table.Td>

        <Table.Td fw={500}>{item.category}</Table.Td>

        <Table.Td fw={600}>
          {item.quantity_available}/{item.quantity_total}
        </Table.Td>

        <Table.Td>
          <Badge
            variant="filled"
            size="sm"
            color={
              item.status === "WORKING"
                ? "green"
                : item.status === "NEEDS_TESTING"
                ? "yellow"
                : item.status === "FAULTY"
                ? "red"
                : "gray"
            }
          >
            {item.status}
          </Badge>
        </Table.Td>

        <Table.Td>
          <Tooltip
            label={unavailable ? "Item unavailable" : ""}
            disabled={!unavailable}
          >
            <Button
              size="xs"
              color="dark"
              loading={borrowingId === item.id}
              disabled={unavailable}
              onClick={() => handleBorrow(item.id)}
            >
              Borrow
            </Button>
          </Tooltip>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ScrollArea>
      <Table verticalSpacing="sm" style={{ color: "#111827" }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ fontSize: 17, fontWeight: 800 }}>
              <Group gap={6}>
                <IconHash size={18} />
              </Group>
            </Table.Th>

            <Table.Th style={{ fontSize: 17, fontWeight: 800 }}>
              <Group gap={6}>
                <IconBox size={18} />
                Item
              </Group>
            </Table.Th>

            <Table.Th style={{ fontSize: 17, fontWeight: 800 }}>
              <Group gap={6}>
                <IconCategory size={18} />
                Category
              </Group>
            </Table.Th>

            <Table.Th style={{ fontSize: 17, fontWeight: 800 }}>
              <Group gap={6}>
                <IconStack2 size={18} />
                Available
              </Group>
            </Table.Th>

            <Table.Th style={{ fontSize: 17, fontWeight: 800 }}>
              <Group gap={6}>
                <IconInfoCircle size={18} />
                Status
              </Group>
            </Table.Th>

            <Table.Th style={{ fontSize: 17, fontWeight: 800 }}>
              <Group gap={6}>
                <IconBolt size={18} />
                Action
              </Group>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}