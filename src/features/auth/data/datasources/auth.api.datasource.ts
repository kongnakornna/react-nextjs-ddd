import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { environment } from '../../../../core/config/environment';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { SignInRequestDto } from '../dtos/signin-request.dto';
import { RegisterRequestDto } from '../dtos/register-request.dto';
import { ChangePasswordRequestDto } from '../dtos/change-password-request.dto';
import { ResetPasswordRequestDto } from '../dtos/reset-password-request.dto';
import { PublicKeyResponseDto } from '../dtos/public-key-response.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { RoleResponseDto, RoleListResponseDto, CreateRoleRequestDto, UpdateRoleRequestDto, AssignRolePermissionsRequestDto } from '../dtos/role.dto';
import { PermissionListResponseDto } from '../dtos/permission.dto';
import { UserListParams } from '../../domain/repositories/auth.repository';

// Backend routes are versioned: /api/v1/... (e.g. /api/v1/user/me)
const API_PREFIX = '/api/v1';

function getBaseUrl(): string {
  return environment.useProxy ? API_PREFIX : `${environment.apiTargetUrl}${API_PREFIX}`;
}

/**
 * fastapiiot envelope:
 *   success: { code, method, path, timestamp, details: { message, data } }
 *   error:   { code, ..., details: { message, data: { errors, errors_th, code? } } }
 * Every endpoint seen so far (login included) uses the envelope; OpenAPI shows only
 * the inner schema. Unwrap defensively — only when the envelope is present.
 */
function unwrap(body: any): any {
  if (body && typeof body === 'object' && body.details && 'data' in body.details) {
    return body.details.data;
  }
  return body;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: any = await response.json().catch(() => ({}));
    const data = body?.details?.data;
    const serverMsg =
      data?.errors_th || data?.errors || body?.details?.message ||
      body?.error?.msg || body?.msg || body?.message ||
      (Array.isArray(body?.detail) ? body.detail.map((d: any) => d?.msg).join(', ') : body?.detail);
    const status = response.status;
    let errorMessage = serverMsg || `Server Error (${status})`;

    if (!serverMsg) {
      if (status === 401) errorMessage = 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบอีกครั้ง';
      else if (status === 403) errorMessage = 'คุณไม่มีสิทธิ์เข้าถึง';
      else if (status === 404) errorMessage = 'ไม่พบข้อมูลที่ร้องขอ';
    }

    const appError = new Error(errorMessage) as Error & { status?: number };
    appError.status = status;
    throw appError;
  }

  if (response.status === 204) {
    return undefined as T;
  }
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('text/plain')) {
    return response.text() as unknown as T;
  }
  return unwrap(await response.json().catch(() => undefined));
}

/**
 * Auth is cookie-based: the backend sets HttpOnly `access_token` / `refresh_token`
 * cookies on login. No Authorization header — after a refresh the old access
 * token is revoked immediately, so a token cached in localStorage would be stale.
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  return handleResponse<T>(response);
}

const requestNoInterceptor = request;

async function requestForm<T>(url: string, form: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(form).toString(),
    credentials: 'include',
  });
  return handleResponse<T>(response);
}

function toLoginResponse(raw: any): LoginResponseDto {
  const expiresAt = raw?.token_info?.expires_at ? Date.parse(raw.token_info.expires_at) : NaN;
  return {
    accessToken: raw?.access_token ?? '',
    refreshToken: raw?.refresh_token ?? '',
    tokenType: 'bearer',
    expiresIn: Number.isFinite(expiresAt) ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : undefined,
    user: raw?.info ?? null,
  };
}

/** fastapiiot MeResponse / CreateResponse → legacy UserResponseDto shape. */
function toUserDto(raw: any): UserResponseDto {
  return {
    id: raw?.id != null ? String(raw.id) : '',
    email: raw?.email ?? '',
    username: raw?.username ?? raw?.email ?? '',
    role_id: raw?.role_id ?? 0,
    role_title: raw?.role ?? undefined,
    firstname: raw?.first_name ?? '',
    lastname: raw?.last_name ?? '',
    fullname: raw?.full_name ?? raw?.preferred_name ?? '',
    mobile_number: raw?.mobile_number ?? '',
    phone_number: raw?.phone ?? '',
    line_id: raw?.line_id ?? '',
    location_id: raw?.location_id ?? '',
    status: raw?.status ?? (raw?.is_active === false ? 0 : 1),
    is_superuser: raw?.is_superuser ?? false,
    verified: raw?.is_verified ?? false,
    last_sign_in: raw?.last_sign_in_at ?? '',
    createddate: raw?.created_at ?? '',
    updateddate: raw?.updated_at ?? '',
  };
}

function buildParams(params?: Record<string, any>): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
  }
  return searchParams;
}

export class AuthApiDataSource {
  private get baseUrl(): string {
    return getBaseUrl();
  }

  /** OAuth2PasswordRequestFormStrict: `grant_type=password` is required (else 422). */
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const raw = await requestForm<any>(`${this.baseUrl}${API_ENDPOINTS.auth.login}`, {
      grant_type: 'password',
      username: data.username,
      password: data.password,
    });
    return toLoginResponse(raw);
  }

  /** Backend has no separate sign-in: login accepts `username` OR email. */
  async signIn(data: SignInRequestDto): Promise<LoginResponseDto> {
    return this.login({ username: data.email, password: data.password });
  }

  async logout(): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.auth.logout}`, {
      method: 'DELETE',
    });
  }

  async logoutAll(): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.auth.logoutall}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  /** Rotates cookies only; the body is just `{ message }` — tokens come back empty. */
  async refreshToken(): Promise<LoginResponseDto> {
    const raw = await requestNoInterceptor<any>(`${this.baseUrl}${API_ENDPOINTS.auth.refresh}`, {
      method: 'PATCH',
    });
    return toLoginResponse(raw);
  }

  async forgotPassword(email: string): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.auth.forgotPassword}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(code: string, data: ResetPasswordRequestDto): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.auth.resetPassword}`, {
      method: 'POST',
      body: JSON.stringify({
        code,
        password: data.new_password,
        confirm_password: data.confirm_password,
      }),
    });
  }

  async verifyEmail(code: string): Promise<string> {
    const params = buildParams({ code });
    return request<string>(`${this.baseUrl}${API_ENDPOINTS.auth.verifyEmail}?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getPublicKey(): Promise<PublicKeyResponseDto> {
    return request<PublicKeyResponseDto>(`${this.baseUrl}${API_ENDPOINTS.auth.publicKey}`, {
      method: 'GET',
    });
  }

  async getCurrentUser(): Promise<UserResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.auth.me}`, {
      method: 'GET',
    });
    return toUserDto(raw);
  }

  async updateProfile(data: Partial<UserResponseDto>): Promise<UserResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.users.updateMe}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return raw?.data ?? raw;
  }

  async changeMyPassword(data: ChangePasswordRequestDto): Promise<void> {
    const body = {
      old_password: data.currentPassword,
      new_password: data.newPassword,
      confirm_password: data.confirmPassword,
    };
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.users.changeMyPassword}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /** POST /authentication/sign-up — SignUpRequest (snake_case, agree_terms required). */
  async register(data: RegisterRequestDto): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.auth.signUp}`, {
      method: 'POST',
      body: JSON.stringify({
        full_name: data.fullname || null,
        first_name: data.firstname || null,
        last_name: data.lastname || null,
        username: data.username,
        email: data.email,
        phone_number: data.phone_number || null,
        password: data.password,
        confirm_password: data.confirm_password,
        agree_terms: true, // sign-up page blocks submit until the checkbox is ticked
      }),
    });
  }

  async getPermissions(): Promise<string[]> {
    return request<string[]>(`${this.baseUrl}${API_ENDPOINTS.auth.permissions}`, {
      method: 'GET',
    });
  }

  async listUsers(params?: UserListParams): Promise<{ data: UserResponseDto[]; total: number }> {
    const { roleId, activeStatus, pageSize, ...rest } = params || {};
    const queryParams: Record<string, any> = {
      ...rest,
      ...(activeStatus !== undefined && activeStatus !== null ? { active_status: activeStatus } : {}),
      ...(pageSize !== undefined && pageSize !== null ? { page_size: pageSize } : {}),
      ...(roleId !== undefined && roleId !== null ? { role_id: roleId } : {}),
    };
    const searchParams = buildParams(queryParams);
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.users.list}?${searchParams.toString()}`, {
      method: 'GET',
    });
    const body = raw?.data ?? raw;
    const payload = body?.payload ?? body;
    const total = body?.pagination?.total ?? (Array.isArray(payload) ? payload.length : 0);
    return { data: payload || [], total };
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.users.detail(id)}`, {
      method: 'GET',
    });
    return raw?.data ?? raw;
  }

  /** POST /user — CreateRequest (role is not accepted; backend creates USER). */
  async createUser(data: RegisterRequestDto): Promise<UserResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.users.create}`, {
      method: 'POST',
      body: JSON.stringify({
        first_name: data.firstname,
        last_name: data.lastname,
        preferred_name: data.fullname || null,
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone_number || null,
        mobile_number: data.mobile_number || null,
        line_id: data.line_id || null,
        location_id: data.location_id || null,
      }),
    });
    return toUserDto(raw);
  }

  async updateUser(id: string, data: Partial<UserResponseDto>): Promise<UserResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.users.update(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return raw?.data ?? raw;
  }

  async deleteUser(id: string): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.users.delete(id)}`, {
      method: 'DELETE',
    });
  }

  async updateUserRole(id: string, roleId: number): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.users.updateRole(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ role_id: roleId }),
    });
  }

  async updateUserPassword(id: string, oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.users.updatePassword(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword }),
    });
  }

  async forceLogoutUser(id: string): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.users.logoutall(id)}`, {
      method: 'GET',
    });
  }

  async getRoles(): Promise<RoleListResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.roles.list}`, {
      method: 'GET',
    });
    return raw?.data ?? raw;
  }

  async getRole(id: number): Promise<RoleResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.roles.detail(id)}`, {
      method: 'GET',
    });
    return raw?.data ?? raw;
  }

  async createRole(data: CreateRoleRequestDto): Promise<RoleResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.roles.create}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return raw?.data ?? raw;
  }

  async updateRole(id: number, data: UpdateRoleRequestDto): Promise<RoleResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.roles.update(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return raw?.data ?? raw;
  }

  async deleteRole(id: number): Promise<void> {
    await request<void>(`${this.baseUrl}${API_ENDPOINTS.roles.delete(id)}`, {
      method: 'DELETE',
    });
  }

  async assignRolePermissions(id: number, data: AssignRolePermissionsRequestDto): Promise<RoleResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.roles.permissions(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return raw?.data ?? raw;
  }

  async getAllPermissions(): Promise<PermissionListResponseDto> {
    const raw = await request<any>(`${this.baseUrl}${API_ENDPOINTS.permissions.list}`, {
      method: 'GET',
    });
    return raw?.data ?? raw;
  }
}
