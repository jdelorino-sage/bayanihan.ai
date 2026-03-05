export interface User {
  id: number;
  clerkId?: string;
  email: string;
  fullName: string;
  role: UserRole;
  barRollNumber?: string;
  ibpNumber?: string;
  jurisdiction?: string;
  phone?: string;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt: string;
}

export type UserRole = "citizen" | "lawyer" | "notary" | "judge" | "admin";

export type SubscriptionTier = "free" | "student" | "professional" | "firm" | "enterprise";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";
