import type { ColumnType } from "kysely";

import type {
  InviteStatus,
  OrganizationBusinessType,
  OrganizationLegalForm,
  OrganizationStatus,
  PersonPermissionEffect,
  SocialMediaPlatform,
  UserGender,
  UserStatus,
} from "./enums.js";

export type * from "./enums.js";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface User {
  id: Generated<string>;
  country_id: string | null;
  nationality_id: string | null;
  system_role_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  password: string | null;
  gender: Generated<UserGender>;
  birth_location: string | null;
  birthdate: Timestamp | null;
  image: string | null;
  phone_landline: string | null;
  phone_mobile: string | null;
  driver_license_no: string | null;
  driver_license_type: string | null;
  driver_license_organization: string | null;
  insurance_company: string | null;
  insurance_no: string | null;
  insurance_class: string | null;
  tax_no: string | null;
  tax_id: string | null;
  tax_class: string | null;
  child_exempt_amount: string | null;
  health_insurance: string | null;
  social_health_no: string | null;
  status: Generated<UserStatus>;
  expired_date: Timestamp | null;
  notification_key: string | null;
  notification_key_web: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
  last_login_at: Timestamp | null;
  last_password_change_at: Timestamp | null;
  is_email_verified: Generated<boolean>;
  is_phone_verified: Generated<boolean>;
  is_two_factor_enabled: Generated<boolean>;
  recovery_email: string | null;
  is_recovery_email_verified: Generated<boolean>;
}

export interface Country {
  id: Generated<string>;
  name: string;
  native_name: string | null;
  official_name: string | null;
  iso: string;
  phone_code: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  region: string | null;
  subregion: string | null;
  capital: string | null;
  timezones: string[] | null;
  created_by_id: string | null;
  updated_by_id: string | null;
  deleted_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface Organization {
  id: Generated<string>;
  country_id: string | null;
  unique_id: string | null;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  business_type: OrganizationBusinessType;
  legal_form: OrganizationLegalForm | null;
  established_date: Timestamp | null;
  email: string | null;
  phone_landline: string | null;
  phone_mobile: string | null;
  fax: string | null;
  website: string | null;
  company_no: string | null;
  tax_id: string | null;
  vat_id: string | null;
  bin: string | null;
  trade_license_no: string | null;
  commercial_register_no: string | null;
  eori_number: string | null;
  register_court: string | null;
  account_holder: string | null;
  industry_category: string | null;
  image: string | null;
  about: string | null;
  status: Generated<OrganizationStatus>;
  expired_date: Timestamp | null;
  owner_id: string | null;
  created_by_id: string | null;
  updated_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface Permission {
  id: Generated<string>;
  organization_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  is_locked: Generated<boolean>;
  created_by_id: string | null;
  updated_by_id: string | null;
  deleted_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface Role {
  id: Generated<string>;
  organization_id: string | null;
  slug: string | null;
  name: string;
  description: string | null;
  is_locked: Generated<boolean>;
  created_by_id: string | null;
  updated_by_id: string | null;
  deleted_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface RolePermission {
  id: Generated<string>;
  role_id: string;
  permission_id: string;
  organization_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface Person {
  id: Generated<string>;
  organization_id: string;
  user_id: string | null;
  role_id: string | null;
  employee_id: string | null;
  country_id: string | null;
  nationality_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  gender: Generated<UserGender>;
  birth_location: string | null;
  birthdate: Timestamp | null;
  image: string | null;
  phone_landline: string | null;
  phone_mobile: string | null;
  driver_license_no: string | null;
  driver_license_type: string | null;
  driver_license_organization: string | null;
  insurance_company: string | null;
  insurance_no: string | null;
  insurance_class: string | null;
  tax_no: string | null;
  tax_id: string | null;
  tax_class: string | null;
  child_exempt_amount: string | null;
  health_insurance: string | null;
  social_health_no: string | null;
  status: Generated<OrganizationStatus>;
  expired_date: Timestamp | null;
  created_by_id: string | null;
  updated_by_id: string | null;
  deleted_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface Company {
  id: Generated<string>;
  organization_id: string;
  country_id: string | null;
  reference_id: string | null;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  business_type: OrganizationBusinessType;
  legal_form: OrganizationLegalForm | null;
  established_date: Timestamp | null;
  email: string | null;
  phone_landline: string | null;
  phone_mobile: string | null;
  fax: string | null;
  website: string | null;
  company_no: string | null;
  tax_id: string | null;
  vat_id: string | null;
  bin: string | null;
  trade_license_no: string | null;
  commercial_register_no: string | null;
  eori_number: string | null;
  register_court: string | null;
  account_holder: string | null;
  industry_category: string | null;
  image: string | null;
  about: string | null;
  status: Generated<OrganizationStatus>;
  expired_date: Timestamp | null;
  created_by_id: string | null;
  updated_by_id: string | null;
  deleted_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface Address {
  id: Generated<string>;
  organization_id: string | null;
  reference_id: string;
  name: string;
  st_num: string | null;
  st_name: string;
  neighbh: string | null;
  city: string;
  state: string | null;
  zip: string | null;
  cnt_name: string | null;
  is_default: Generated<boolean>;
  address_description: string | null;
  place_id: string | null;
  lat: string | null;
  lng: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface BankAccount {
  id: Generated<string>;
  organization_id: string | null;
  reference_id: string;
  owner_name: string;
  is_owner: boolean;
  is_default: Generated<boolean>;
  bank_name: string;
  bank_country: string | null;
  currency: string | null;
  iban: string | null;
  swift_code: string | null;
  account_number: string | null;
  routing_number: string | null;
  description: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface SocialMedia {
  id: Generated<string>;
  organization_id: string | null;
  reference_id: string;
  platform: SocialMediaPlatform;
  url: string | null;
  username: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface Invite {
  id: Generated<string>;
  organization_id: string;
  user_id: string | null;
  person_id: string;
  email: string;
  token: string;
  status: Generated<InviteStatus>;
  description: string | null;
  expires_at: Timestamp;
  accepted_at: Timestamp | null;
  canceled_at: Timestamp | null;
  accept_attempts: Generated<number>;
  last_attempt_at: Timestamp | null;
  locked_until: Timestamp | null;
  created_by_id: string | null;
  updated_by_id: string | null;
  deleted_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface PersonPermission {
  id: Generated<string>;
  organization_id: string;
  person_id: string;
  permission_id: string;
  effect: Generated<PersonPermissionEffect>;
  created_by_id: string | null;
  updated_by_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface DB {
  user: User;
  country: Country;
  organization: Organization;
  permission: Permission;
  role: Role;
  role_permission: RolePermission;
  person_permission: PersonPermission;
  person: Person;
  company: Company;
  address: Address;
  bank_account: BankAccount;
  social_media: SocialMedia;
  invite: Invite;
}
