export type AuditAction = 
  | "CREATE" 
  | "UPDATE" 
  | "DELETE" 
  | "APPROVE" 
  | "REJECT" 
  | "TOGGLE" 
  | "LOGIN" 
  | "LOGOUT" 
  | "AWARD" 
  | "REDEEM";

export type AuditCategory = 
  | "menu" 
  | "reservations" 
  | "loyalty" 
  | "users" 
  | "lifestyle" 
  | "events" 
  | "settings" 
  | "auth";

export type AuditSeverity = "info" | "success" | "warning" | "critical";

export interface AuditActor {
  name: string;
  email: string;
  role: "admin" | "barista" | "system";
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO String
  actor: AuditActor;
  action: AuditAction;
  category: AuditCategory;
  target: string;
  details: string;
  ipAddress?: string;
  severity: AuditSeverity;
  metadata?: Record<string, any>;
}
