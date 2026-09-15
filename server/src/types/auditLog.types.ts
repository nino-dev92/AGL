export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "start"
  | "complete"
  | "cancel"
  | "resolve";

export type AuditResource =
  | "user"
  | "team"
  | "game"
  | "tournament"
  | "registration"
  | "match"
  | "dispute"
  | "announcement"
  | "notification";
