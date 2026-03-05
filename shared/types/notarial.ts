export interface NotarialEntry {
  id: number;
  notaryId: number;
  entryNumber: number;
  pageNumber: number;
  dateTime: string;
  notarialActType: NotarialActType;
  instrumentTitle: string;
  principalName: string;
  principalAddress?: string;
  identityType?: IdentityType;
  identityDetails?: string;
  feeCharged?: number;
  location?: string;
  locationType?: LocationType;
  remarks?: string;
  weeklyCertified: boolean;
  monthlySubmitted: boolean;
  createdAt: string;
}

export interface NotarialCommission {
  id: number;
  notaryId: number;
  commissionNumber?: string;
  jurisdiction: string;
  executiveJudge?: string;
  issueDate: string;
  expiryDate: string;
  status: CommissionStatus;
  sealApproved: boolean;
  renewalAlertSent: boolean;
  createdAt: string;
}

export type NotarialActType =
  | "acknowledgment"
  | "jurat"
  | "oath"
  | "copy_cert"
  | "signature_witnessing";

export type IdentityType = "government_id" | "credible_witness";

export type LocationType = "office" | "hospital" | "detention" | "public_function";

export type CommissionStatus = "active" | "expired" | "revoked" | "resigned";
