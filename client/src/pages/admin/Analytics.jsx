import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";

export default function Analytics() {
  const metrics = [
    { label: "Total Users", value: 1234, note: "All time" },
    { label: "Total Properties", value: 245, note: "All time" },
    { label: "New Users (7d)", value: 37, note: "Last 7 days" },
    { label: "New Properties (7d)", value: 14, note: "Last 7 days" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-500">
          Key performance indicators (mock data)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="text-3xl mt-2">{m.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-slate-500">
              {m.note}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <Card className="h-72 flex flex-col">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Placeholder chart area</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Chart Placeholder A
          </CardContent>
        </Card>
        <Card className="h-72 flex flex-col">
          <CardHeader>
            <CardTitle>Property Listings Trend</CardTitle>
            <CardDescription>Placeholder chart area</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Chart Placeholder B
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
