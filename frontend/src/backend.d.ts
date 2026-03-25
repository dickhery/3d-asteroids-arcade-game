import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface T__1 {
    survivalTime: bigint;
    username: string;
    score: bigint;
    timestamp: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface LeaderboardStats {
    mostWinsPlayer: string;
    longestSurvivor: string;
    topPlayer: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface T {
    survivalTime: bigint;
    username: string;
    userId: Principal;
    wins: bigint;
    highScore: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    survivalTime: bigint;
    username: string;
    userId: Principal;
    wins: bigint;
    highScore: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getAllProfiles(): Promise<Array<T>>;
    getCallerProfile(): Promise<T>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboardStats(): Promise<LeaderboardStats>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTopScores(): Promise<Array<T__1>>;
    getUserHighScore(user: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<T>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    registerUsername(username: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitGameResults(score: bigint, survivalTime: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    validateUsername(username: string): Promise<boolean>;
}
