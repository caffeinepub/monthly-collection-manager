import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Member {
    id: bigint;
    joinDate: string;
    name: string;
    serial: string;
}
export interface Payment {
    id: bigint;
    memberId: bigint;
    month: bigint;
    year: bigint;
    paidDate: string;
    amount: number;
}
export interface MemberPaymentStatus {
    member: Member;
    paid: boolean;
    paymentDetails?: Payment;
}
export interface UserProfile {
    name: string;
}
export interface DashboardStats {
    totalUnpaid: bigint;
    unpaidThisMonth: bigint;
    totalCollected: number;
    paidThisMonth: bigint;
    totalMembers: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMember(name: string, serial: string, joinDate: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMember(id: bigint): Promise<void>;
    deletePayment(paymentId: bigint): Promise<void>;
    getAllMembers(): Promise<Array<Member>>;
    getAllPayments(): Promise<Array<Payment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(currentMonth: bigint, currentYear: bigint): Promise<DashboardStats>;
    getMonthlyReport(month: bigint, year: bigint): Promise<Array<MemberPaymentStatus>>;
    getPaymentsByMonthYear(month: bigint, year: bigint): Promise<Array<Payment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordPayment(memberId: bigint, month: bigint, year: bigint, amount: number): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMember(id: bigint, serial: string, name: string, joinDate: string): Promise<void>;
}
