import { Card } from "@mantine/core";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Card
      radius="lg"
      shadow="sm"
      p="lg"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
      }}
    >
      {children}
    </Card>
  );
}