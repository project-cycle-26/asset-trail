"use client";

import { Modal, TextInput, NumberInput, Button, Stack } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

type Props = {
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function AddItemModal({ opened, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantityTotal, setQuantityTotal] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !category || quantityTotal === "" || !location) return;

    try {
      setLoading(true);

      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          quantity_total: quantityTotal,
          location,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create item");
      }

      notifications.show({
        color: "green",
        title: "Item Added",
        message: `${name} added successfully`,
      });

      onCreated();

      setName("");
      setCategory("");
      setQuantityTotal("");
      setLocation("");

      onClose();
    } catch (err: any) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err.message || "Failed to create item",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Item">
      <Stack>
        <TextInput
          label="Item Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.currentTarget.value)}
          required
        />

        <NumberInput
          label="Total Quantity"
          min={0}
          value={quantityTotal}
          onChange={(value) => {
            if (value === "" || typeof value === "number") {
              setQuantityTotal(value);
            }
          }}
        />

        <TextInput
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.currentTarget.value)}
          required
        />

        <Button
          loading={loading}
          disabled={!name || !category || quantityTotal === "" || !location}
          onClick={handleSubmit}
        >
          Create Item
        </Button>
      </Stack>
    </Modal>
  );
}