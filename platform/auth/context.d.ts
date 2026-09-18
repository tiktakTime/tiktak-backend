/**
 * RBAC / session context alanları — `AppVariables` genişletmesi.
 * `.d.ts` olarak tsconfig `include` üzerinden daima programa girer;
 * hiçbir runtime import’a bağlı değildir.
 */
declare module "@/core/router/types" {
  interface AppVariables {
    user_id?: string;
    session_id?: string;
    /** Aktif organizasyon (auth switch / session). */
    organization_id?: string;
    /** `scope: "org"` middleware sonrası — organization_id ile aynı. */
    org_id?: string;
    permissions?: string[];
    person_id?: string | null;
    role_id?: string | null;
    is_super_admin?: boolean;
  }
}

// `export {}` olmadan bu dosya ambient bildirim sayılır ve augmentation uygulanmaz.
export {};
