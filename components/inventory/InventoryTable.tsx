"use client";

import { useEffect, useState } from "react";
import { Loader, Center, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
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

  return isMobile ? (
    <MobileInventoryCards
      items={items}
      borrowingId={borrowingId}
      onBorrow={handleBorrow}
    />
  ) : (
    <DesktopInventoryTable
      items={items}
      borrowingId={borrowingId}
      onBorrow={handleBorrow}
    />
  );
}