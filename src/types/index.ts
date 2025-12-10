// Tipos principais do sistema e-Sfinge

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
  | 'EXECUCAO_ORCAMENTARIA';

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
  createdAt: string;
  sentAt?: string;
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

export interface EndpointConfig {
  id: string;
  module: ModuleType;
  endpoint: string;
  method: string;
  active: boolean;
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  avatar?: string;
}

// Stats types
export interface RemittanceStats {
  total: number;
  byStatus: Record<RemittanceStatus, number>;
  errorsLast24h: number;
  lastProtocol?: string;
  lastProtocolDate?: string;
}

