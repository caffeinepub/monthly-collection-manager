import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeletePayment,
  useGetMonthlyReport,
  useRecordPayment,
} from "../hooks/useQueries";
import type { MemberPaymentStatus } from "../hooks/useQueries";

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

export default function CollectionsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [markPaidTarget, setMarkPaidTarget] =
    useState<MemberPaymentStatus | null>(null);
  const [amount, setAmount] = useState("100");

  const { data: report, isLoading } = useGetMonthlyReport(month, year);
  const recordPayment = useRecordPayment();
  const deletePayment = useDeletePayment();

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const totalCollected = report
    ? report
        .filter((r) => r.paid)
        .reduce((sum, r) => sum + (r.paymentDetails?.amount ?? 0), 0)
    : 0;
  const paidCount = report ? report.filter((r) => r.paid).length : 0;

  async function handleMarkPaid() {
    if (!markPaidTarget) return;
    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await recordPayment.mutateAsync({
        memberId: markPaidTarget.member.id,
        month,
        year,
        amount: parsedAmount,
      });
      toast.success(`Payment recorded for ${markPaidTarget.member.name}`);
      setMarkPaidTarget(null);
      setAmount("100");
    } catch (e: any) {
      toast.error(e?.message || "Failed to record payment");
    }
  }

  async function handleUndo(row: MemberPaymentStatus) {
    if (!row.paymentDetails) return;
    try {
      await deletePayment.mutateAsync(row.paymentDetails.id);
      toast.success(`Payment removed for ${row.member.name}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to remove payment");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record monthly payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger
              data-ocid="collections.month.select"
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
              data-ocid="collections.year.select"
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">
            Total Collected
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            ${formatCurrency(totalCollected)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">
            Paid Members
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">{paidCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-card col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">
            Pending Members
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {report ? report.length - paidCount : 0}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !report || report.length === 0 ? (
          <div
            data-ocid="collections.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
          >
            <CreditCard className="w-10 h-10 opacity-30" />
            <p className="text-sm">No members found. Add members first.</p>
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
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Payment Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((row, i) => (
                <TableRow
                  key={row.member.id.toString()}
                  data-ocid={`collections.item.${i + 1}`}
                  className="border-border hover:bg-muted/40"
                >
                  <TableCell className="pl-5 text-sm font-mono text-muted-foreground">
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
                  <TableCell className="text-sm text-muted-foreground">
                    {row.paid && row.paymentDetails
                      ? row.paymentDetails.paidDate
                      : "\u2014"}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {row.paid ? (
                      <Button
                        data-ocid={`collections.undo_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleUndo(row)}
                        disabled={deletePayment.isPending}
                      >
                        Undo
                      </Button>
                    ) : (
                      <Button
                        data-ocid={`collections.markpaid_button.${i + 1}`}
                        size="sm"
                        className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setMarkPaidTarget(row);
                          setAmount("100");
                        }}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={!!markPaidTarget}
        onOpenChange={(o) => !o && setMarkPaidTarget(null)}
      >
        <DialogContent
          data-ocid="collections.markpaid.dialog"
          className="sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the payment amount for{" "}
              <strong>{markPaidTarget?.member.name}</strong> (
              {MONTHS[month - 1]} {year}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="payment-amount">Amount ($)</Label>
            <Input
              data-ocid="collections.amount.input"
              id="payment-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMarkPaidTarget(null)}
              data-ocid="collections.markpaid.cancel_button"
            >
              Cancel
            </Button>
            <Button
              data-ocid="collections.markpaid.confirm_button"
              onClick={handleMarkPaid}
              disabled={recordPayment.isPending}
              className="bg-primary text-primary-foreground"
            >
              {recordPayment.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
