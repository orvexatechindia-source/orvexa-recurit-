// Standard API Response envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    path: string;
    [key: string]: any;
  };
}

// Pagination Interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tenant Boundary Context
export interface TenantContext {
  tenantId: string;
  companyName: string;
}

// Audit Log Interface
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Helper to create success responses
export function createSuccessResponse<T>(data: T, metadata?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      path: '',
      ...metadata,
    },
  };
}

// Helper to create error responses
export function createErrorResponse(code: string, message: string, details?: any): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      path: '',
    },
  };
}
