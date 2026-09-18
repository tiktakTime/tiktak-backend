# employee (web)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`web/doc.md`](../doc.md)

**Dosyalar:** `employee.schema.ts`, `employee.routes.ts`, `domain/`  
**Base path:** `/organization/employee`  
**Mount:** `webRouter` → `authMiddleware`

---

## Amaç

Org içi çalışan kaydı: person bağlantısı, sicil no, experience. Tüm uçlar `tenant: "org"` + `employee.*` policy.

---

## Endpoint'ler

| Method | Path                                          | tenant | policy            | HTTP | code                     |
| ------ | --------------------------------------------- | ------ | ----------------- | ---- | ------------------------ |
| GET    | `/organization/employee/search`               | `org`  | `employee.get`    | 200  | (Page)                   |
| GET    | `/organization/employee/{id}`                 | `org`  | `employee.get`    | 200  | `employee.get`           |
| GET    | `/organization/employee/desired-employee-no`  | `org`  | `employee.get`    | 200  | `employee.desired-no`    |
| GET    | `/organization/employee/get-next-employee-no` | `org`  | `employee.get`    | 200  | `employee.next-no`       |
| POST   | `/organization/employee/creator`              | `org`  | `employee.post`   | 200  | `employee.create`        |
| POST   | `/organization/employee`                      | `org`  | `employee.post`   | 200  | `employee.create-direct` |
| PATCH  | `/organization/employee/{id}`                 | `org`  | `employee.patch`  | 200  | `employee.update`        |
| DELETE | `/organization/employee/{id}`                 | `org`  | `employee.delete` | 200  | `employee.delete`        |
| GET    | `/organization/employee/dashboard`            | `org`  | —                 | —    | **NOT IMPLEMENTED**      |
| GET    | `/organization/employee/detail/{id}`          | `org`  | —                 | —    | **NOT IMPLEMENTED**      |

**Yardımcı uçlar:**

- `desired-employee-no`: query `organization_id`, `desired_no` → `{ desired_no, available }`
- `get-next-employee-no`: query `organization_id` → `{ employee_no }`

---

## Schema özeti

| Schema            | Alanlar                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `EmployeeCreate`  | `organization_id`, `person_id`, `employee_no?`, `experience_id?`                                     |
| `EmployeeCreator` | `person_id` \| `user_id` \| `email` + `first_name`/`last_name` + experience alanları; `employee_no?` |
| `EmployeeUpdate`  | `person_id?`, `experience_id?`, `employee_no?`                                                       |
| `EmployeeSchema`  | `id`, `organization_id`, `person_id`, `experience_id`, `employee_no`, `exit_date`, timestamps        |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create, creator pipeline, employee-no, search, soft-delete.

---

## Modüller

`employee`, `person`, `organization` (creator company)
