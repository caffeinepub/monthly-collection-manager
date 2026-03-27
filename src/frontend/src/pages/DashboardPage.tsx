import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useGetDashboardStats, useGetMonthlyReport } from "../hooks/useQueries";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats(
    month,
    year,
  );
  const { data: report, isLoading: reportLoading } = useGetMonthlyReport(
    month,
    year,
  );

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const kpiCards = [
    {
      title: "Total Collection (All Time)",
      value: stats ? `$${formatCurrency(stats.totalCollected)}` : "\u2014",
      icon: DollarSign,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      sub: "Overall collections",
    },
    {
      title: "Paid This Month",
      value: stats ? Number(stats.paidThisMonth).toString() : "\u2014",
      icon: CheckCircle2,
      iconBg: "bg-success-bg",
      iconColor: "text-success",
      sub: `${MONTHS[month - 1]} ${year}`,
      badge: true,
      badgePaid: true,
    },
    {
      title: "Unpaid This Month",
      value: stats ? Number(stats.unpaidThisMonth).toString() : "\u2014",
      icon: AlertCircle,
      iconBg: "bg-[oklch(var(--danger-bg))]",
      iconColor: "text-destructive",
      sub: `${MONTHS[month - 1]} ${year}`,
      badge: true,
      badgePaid: false,
    },
    {
      title: "Total Unpaid (All Months)",
      value: stats ? Number(stats.totalUnpaid).toString() : "\u2014",
      icon: TrendingUp,
      iconBg: "bg-warning-bg",
      iconColor: "text-warning",
      sub: "Across all months",
      badge: false,
      badgePaid: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monthly collection overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger
              data-ocid="dashboard.month.select"
              className="w-36 bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={(MONTHS.indexOf(m) + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={year.toString()}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger
              data-ocid="dashboard.year.select"
              className="w-24 bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card
            key={card.title}
            className="border border-border shadow-card bg-card rounded-xl"
          >
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">
                      {card.value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}
                >
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              {card.badge && (
                <div className="mt-3">
                  <StatusBadge paid={card.badgePaid} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-card bg-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {MONTHS[month - 1]} {year} \u2014 Member Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !report || report.length === 0 ? (
            <div
              data-ocid="dashboard.empty_state"
              className="text-center py-12 text-muted-foreground text-sm"
            >
              No members found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground pl-5">
                    Serial
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground pr-5">
                    Payment Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((row, i) => (
                  <TableRow
                    key={row.member.id.toString()}
                    data-ocid={`dashboard.item.${i + 1}`}
                    className="border-border"
                  >
                    <TableCell className="pl-5 text-sm font-mono text-muted-foreground">
                      {row.member.serial}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {row.member.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge paid={row.paid} />
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {row.paid && row.paymentDetails
                        ? `$${formatCurrency(row.paymentDetails.amount)}`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="pr-5 text-sm text-muted-foreground">
                      {row.paid && row.paymentDetails
                        ? row.paymentDetails.paidDate
                        : "\u2014"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ paid }: { paid: boolean }) {
  if (paid) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success">
        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
        Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-bg text-warning">
      <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />
      Pending
    </span>
  );
}
