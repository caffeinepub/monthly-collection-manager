import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DashboardStats,
  Member,
  MemberPaymentStatus,
  Payment,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllMembers() {
  const { actor, isFetching } = useActor();
  return useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDashboardStats(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats", month, year],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardStats(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMonthlyReport(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery<MemberPaymentStatus[]>({
    queryKey: ["monthlyReport", month, year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlyReport(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      serial: string;
      joinDate: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addMember(data.name, data.serial, data.joinDate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      serial: string;
      joinDate: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateMember(data.id, data.serial, data.name, data.joinDate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useDeleteMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMember(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["monthlyReport"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      memberId: bigint;
      month: number;
      year: number;
      amount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordPayment(
        data.memberId,
        BigInt(data.month),
        BigInt(data.year),
        data.amount,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["monthlyReport"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeletePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePayment(paymentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["monthlyReport"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export type { Member, Payment, DashboardStats, MemberPaymentStatus };
