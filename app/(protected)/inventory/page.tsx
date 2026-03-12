"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { AddItemModal } from "@/components/inventory/AddItemModal";
import { useSession } from "next-auth/react";

export default function InventoryPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshInventory = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Manage and track all items"
        rightSection={
          <RoleGuard role={userRole} allow={["MASTER_ADMIN", "BOARD"]}>
            <Button onClick={() => setAddModalOpen(true)}>
              Add Item
            </Button>
          </RoleGuard>
        }
      />

      <InventoryTable refreshKey={refreshKey} />

      <AddItemModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={refreshInventory}
      />
    </>
  );
}