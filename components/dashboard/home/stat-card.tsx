"use client";

import { ArrowDownRight01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Card } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
} from "recharts";

export interface StatCardProps {
  label: string;
  value: string;
  /** e.g. "+2.6%" */
  trend: string;
  trendDir: "up" | "down";
  /** Trailing series for the mini chart. */
  data: number[];
  chart?: "area" | "bar";
}

/**
 * A single dashboard metric: label, big value, a colored trend pill, and a
 * theme-aware mini chart. The chart references the accent CSS color so it tracks
 * light/dark automatically. Charts are decorative (no axes/tooltip).
 */
export function StatCard({
  label,
  value,
  trend,
  trendDir,
  data,
  chart = "area",
}: StatCardProps) {
  const series = data.map((v, i) => ({ i, v }));
  const isUp = trendDir === "up";
  const gradientId = `spark-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card>
      <Card.Content className="!flex !flex-row items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="truncate text-sm text-muted">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <div className="flex items-center gap-1 text-xs">
            <HugeiconsIcon
              icon={isUp ? ArrowUpRight01Icon : ArrowDownRight01Icon}
              className={`size-4 ${isUp ? "text-success" : "text-danger"}`}
            />
            <span className={isUp ? "text-success" : "text-danger"}>{trend}</span>
            <span className="text-muted">last 7 days</span>
          </div>
        </div>

        <div className="h-16 flex-1 self-stretch">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 120, height: 64 }}
          >
            {chart === "bar" ? (
              <BarChart data={series}>
                <Bar
                  dataKey="v"
                  fill="var(--accent)"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            ) : (
              <AreaChart data={series}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  );
}
