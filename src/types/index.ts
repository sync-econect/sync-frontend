export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserSession {
  id: number;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActivity: string;
}

export type Environment = 'PRODUCAO' | 'HOMOLOGACAO';

export type RemittanceStatus =
  | 'PENDING'
  | 'VALIDATING'
  | 'TRANSFORMING'
  | 'READY'
  | 'SENDING'
  | 'SENT'
  | 'ERROR'
  | 'CANCELLED';

export type RawDataStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'ERROR';

export type ValidationLevel = 'IMPEDITIVA' | 'ALERTA';

export type ValidationOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'REGEX'
  | 'IS_NULL'
  | 'IS_NOT_NULL';

export type ModuleType =
  | 'CONTRATO'
  | 'COMPRA_DIRETA'
  | 'EMPENHO'
  | 'LIQUIDACAO'
  | 'PAGAMENTO'
  | 'EXECUCAO_ORCAMENTARIA'
  | 'CONVENIO'
  | 'LICITACAO'
  | 'PPA'
  | 'LDO'
  | 'LOA'
  | 'ALTERACAO_ORCAMENTARIA';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'transmit';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SEND';

export type LogDirection = 'REQUEST' | 'RESPONSE';

export interface Unit {
  id: string;
  code: string;
  name: string;
  tokenProducao?: string;
  tokenHomologacao?: string;
  ambiente: Environment;
  active: boolean;
  createdAt: string;
}

export interface ValidationRule {
  id: string;
  module: ModuleType;
  field: string;
  operator: ValidationOperator;
  value: string;
  level: ValidationLevel;
  code: string;
  message: string;
  active: boolean;
  createdAt: string;
}

export interface RawData {
  id: string;
  unitId: string;
  unit?: Unit;
  module: ModuleType;
  competency: string;
  payload: Record<string, unknown>;
  status: RawDataStatus;
  createdAt: string;
}

export interface Validation {
  id: string;
  rawDataId: string;
  ruleId: string;
  rule?: ValidationRule;
  level: ValidationLevel;
  code: string;
  message: string;
  field: string;
  value: string;
  createdAt: string;
}

export interface Remittance {
  id: string;
  unitId: string;
  unit?: Unit;
  rawDataId: string;
  module: ModuleType;
  competency: string;
  status: RemittanceStatus;
  payload: Record<string, unknown>;
  protocol?: string;
  errorMsg?: string;
  cancelReason?: string;
  createdAt: string;
  sentAt?: string;
  cancelledAt?: string;
}

export interface RemittanceLog {
  id: string;
  remittanceId: string;
  direction: LogDirection;
  url: string;
  method: string;
  statusCode?: number;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  duration?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  user?: string;
  ip?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: string;
}

// Tipos de campo para o schema do endpoint
export type FieldType =
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'DATETIME'
  | 'ARRAY'
  | 'OBJECT';

// Definição de um campo no schema
export interface FieldSchemaItem {
  name: string;
  type: FieldType;
  required?: boolean;
  description?: string;
  path?: string; // Para campos aninhados: "root.child.field"
  children?: FieldSchemaItem[]; // Campos filhos para OBJECT ou ARRAY
  defaultValue?: string;
}

// Schema completo de campos do endpoint
export interface FieldSchema {
  fields: FieldSchemaItem[];
}

export interface EndpointConfig {
  id: string;
  module: ModuleType;
  endpoint: string;
  method: string;
  ambiente: Environment;
  active: boolean;
  description?: string;
  fieldSchema?: FieldSchema;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string;
  lastActivity?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: UserPermission[];
}

export interface UserPermission {
  id: string;
  userId: string;
  unitId?: string | null;
  module?: ModuleType | null;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canTransmit: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  unit?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

export interface CreateUserPermissionRequest {
  userId: number;
  unitId?: number | null;
  module?: ModuleType | null;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canTransmit?: boolean;
}

export interface UpdateUserPermissionRequest {
  unitId?: number | null;
  module?: ModuleType | null;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canTransmit?: boolean;
}

// Stats types
export interface RemittanceStats {
  total: number;
  byStatus: Record<RemittanceStatus, number>;
  errorsLast24h: number;
  lastProtocol?: string;
  lastProtocolDate?: string;
}
