import { Card } from "@heroui/react";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted">Manage your account and preferences.</p>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Account</Card.Title>
          <Card.Description>
            Account settings will appear here. This page is a placeholder for now.
          </Card.Description>
        </Card.Header>
      </Card>
    </div>
  );
}
