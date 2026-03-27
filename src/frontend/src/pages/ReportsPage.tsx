import { Card, CardContent } from "@/components/ui/card";
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
import { CheckCircle2, Clock, FileBarChart, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useGetMonthlyReport } from "../hooks/useQueries";

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

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: report, isLoading } = useGetMonthlyReport(month, year);
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const totalCollected = report
    ? report
        .filter((r) => r.paid)
        .reduce((sum, r) => sum + (r.paymentDetails?.amount ?? 0), 0)
    : 0;
  const paidCount = report ? report.filter((r) => r.paid).length : 0;
  const unpaidCount = report ? report.length - paidCount : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monthwise collection analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger
              data-ocid="reports.month.select"
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
              data-ocid="reports.year.select"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border shadow-card bg-card rounded-xl">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Collected
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-20 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-foreground">
                    ${formatCurrency(totalCollected)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-card bg-card rounded-xl">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-success-bg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Paid
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-foreground">
                    {paidCount} members
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-card bg-card rounded-xl">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning-bg flex items-center justify-center">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Unpaid
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-foreground">
                    {unpaidCount} members
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            {MONTHS[month - 1]} {year} \u2014 Individual Report
          </h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !report || report.length === 0 ? (
          <div
            data-ocid="reports.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
          >
            <FileBarChart className="w-10 h-10 opacity-30" />
            <p className="text-sm">No data for this period.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
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
                  data-ocid={`reports.item.${i + 1}`}
                  className="border-border hover:bg-muted/40"
                >
                  <TableCell className="pl-5 text-sm text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {row.member.serial}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    {row.member.name}
                  </TableCell>
                  <TableCell>
                    {row.paid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-bg text-warning">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />
                        Pending
                      </span>
                    )}
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
      </div>
    </div>
  );
}
