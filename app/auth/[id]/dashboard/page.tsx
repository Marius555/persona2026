import { Card } from "@heroui/react";

const STATS = [
  { label: "Followers", value: "—" },
  { label: "Content pieces", value: "—" },
  { label: "Engagement", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">
          Welcome back — here&apos;s an overview of your persona.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <Card.Header>
              <Card.Description>{stat.label}</Card.Description>
              <Card.Title className="text-3xl">{stat.value}</Card.Title>
            </Card.Header>
          </Card>
        ))}
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Get started</Card.Title>
          <Card.Description>
            Your dashboard is ready. Use the sidebar to manage content, tune your
            persona, and review analytics.
          </Card.Description>
        </Card.Header>
      </Card>
    </div>
  );
}
