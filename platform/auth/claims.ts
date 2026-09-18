export interface AccessClaims {
  sub: string;
  sid: string;
  jti: string;
}

export interface SessionOrgFields {
  organization_id?: string | null;
  permissions?: string[];
  person_id?: string | null;
  role_id?: string | null;
  is_super_admin?: boolean;
}

/** Login anında user’dan kopyalanan ince snapshot. */
export interface SessionUserSnapshot {
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  picture?: string | null;
}

export interface SessionRecord extends SessionOrgFields, SessionUserSnapshot {
  user_id: string;
  refresh_hash: string;
  created_at: number;
  expires_at: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}
