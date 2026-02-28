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
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

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
    } catch (error) {
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
        headers: {
          "Content-Type": "application/json",
        },
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

  const rows = items.map((item) => {
    const unavailable =
      item.quantity_available === 0 || item.status !== "WORKING";

    return (
      <Table.Tr key={item.id}>
        <Table.Td>{item.name}</Table.Td>
        <Table.Td>{item.category}</Table.Td>
        <Table.Td>
          {item.quantity_available}/{item.quantity_total}
        </Table.Td>
        <Table.Td>
          <Badge
            color={
              item.status === "WORKING"
                ? "green"
                : item.status === "NEEDS_TESTING"
                ? "yellow"
                : item.status === "FAULTY"
                ? "red"
                : "gray"
            }
            variant="light"
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
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Item</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Available</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}