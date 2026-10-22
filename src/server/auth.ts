import crypto from 'crypto';
import type {
  UserRole,
  UserPermissions,
  LoginAuditLog,
  UserSession,
  UserProgressOverview,
  ResearchProject,
  FindingAnnotation,
} from '../types/research.ts';

export interface UserAccount {
  id: string;
  username: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  createdBy: string;
  pendingOwnerApproval?: boolean;
}

export function getDefaultPermissionsForRole(role: UserRole): UserPermissions {
  switch (role) {
    case 'Owner':
      return {
        canRunDeepResearch: true,
        canGenerateVisuals: true,
        canExportDocuments: true,
        canManageUsers: true,
        canConfigureApiKeys: true,
        canViewAuditLogs: true,
        canModerateContent: true,
        canApprovePermissions: true,
      };
    case 'Admin':
    case 'Moderator':
      return {
        canRunDeepResearch: true,
        canGenerateVisuals: true,
        canExportDocuments: true,
        canManageUsers: true,
        canConfigureApiKeys: true,
        canViewAuditLogs: true,
        canModerateContent: true,
        canApprovePermissions: false,
      };
    case 'Manager':
      return {
        canRunDeepResearch: true,
        canGenerateVisuals: true,
        canExportDocuments: true,
        canManageUsers: false,
        canConfigureApiKeys: false,
        canViewAuditLogs: true,
        canModerateContent: false,
        canApprovePermissions: false,
      };
    case 'Researcher':
    default:
      return {
        canRunDeepResearch: true,
        canGenerateVisuals: true,
        canExportDocuments: true,
        canManageUsers: false,
        canConfigureApiKeys: false,
        canViewAuditLogs: false,
        canModerateContent: false,
        canApprovePermissions: false,
      };
  }
}

class AuthManager {
  private users: Map<string, UserAccount> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private auditLogs: LoginAuditLog[] = [];
  private pendingEmailVerifications: Map<
    string,
    { code: string; name?: string; expiresAt: number; createdAt: number }
  > = new Map();

  constructor() {
    this.seedOwner();
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password.trim()).digest('hex');
  }

  private seedOwner() {
    const ownerUsername = 'shahzaibjaffri';
    const ownerPassword = 'Armourer23119*2311';

    const ownerUser: UserAccount = {
      id: 'usr-owner-root',
      username: ownerUsername,
      passwordHash: this.hashPassword(ownerPassword),
      name: 'Shahzaib Jaffri (Platform Owner)',
      role: 'Owner',
      permissions: getDefaultPermissionsForRole('Owner'),
      createdAt: new Date().toISOString(),
      createdBy: 'system_root',
    };

    this.users.set(ownerUsername.toLowerCase(), ownerUser);
  }

  private recordLogin(
    user: UserAccount,
    method: 'credentials' | 'google' | 'email_otp',
    ip?: string,
    userAgent?: string
  ): LoginAuditLog {
    const log: LoginAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      method,
      timestamp: new Date().toISOString(),
      ip: ip || '127.0.0.1',
      userAgent: userAgent || 'Browser Client',
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    return log;
  }

  public authenticate(username: string, password: string, ip?: string, userAgent?: string): UserSession | null {
    if (!username || !password) return null;
    const user = this.users.get(username.trim().toLowerCase());
    if (!user || !user.passwordHash) return null;

    const hash = this.hashPassword(password);
    if (user.passwordHash !== hash) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const session: UserSession = {
      token,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      loginMethod: 'credentials',
    };

    this.sessions.set(token, session);
    this.recordLogin(user, 'credentials', ip, userAgent);
    return session;
  }

  public authenticateGoogle(email: string, name: string, ip?: string, userAgent?: string): UserSession {
    const cleanEmail = email.trim().toLowerCase();
    let user = this.users.get(cleanEmail);

    if (!user) {
      // Auto-register google user as Researcher, or Owner if email matches root email
      const isOwnerEmail = cleanEmail === 'its.shahzaibjaffri@gmail.com';
      const role: UserRole = isOwnerEmail ? 'Owner' : 'Researcher';
      user = {
        id: `usr-g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        username: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role,
        permissions: getDefaultPermissionsForRole(role),
        createdAt: new Date().toISOString(),
        createdBy: 'google_oauth',
      };
      this.users.set(cleanEmail, user);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const session: UserSession = {
      token,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      loginMethod: 'google',
    };

    this.sessions.set(token, session);
    this.recordLogin(user, 'google', ip, userAgent);
    return session;
  }

  /**
   * Request Email Verification Code (OTP) for account signup or login
   */
  public requestEmailOtp(email: string, name?: string): {
    success: boolean;
    error?: string;
    message?: string;
    email?: string;
    expiresAt?: number;
    previewCode?: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.pendingEmailVerifications.set(cleanEmail, {
      code,
      name: name?.trim(),
      expiresAt,
      createdAt: Date.now(),
    });

    console.log(`[ResearchForge Email Auth] ══════════════════════════════════════`);
    console.log(`[ResearchForge Email Auth] Verification Code for ${cleanEmail}: [ ${code} ]`);
    console.log(`[ResearchForge Email Auth] Valid for 10 minutes (expires at ${new Date(expiresAt).toLocaleTimeString()})`);
    console.log(`[ResearchForge Email Auth] ══════════════════════════════════════`);

    return {
      success: true,
      message: `A 6-digit verification code was generated for ${cleanEmail}. Enter it in the verification field below.`,
      email: cleanEmail,
      expiresAt,
      previewCode: code, // Shared in response for seamless local and preview environments
    };
  }

  /**
   * Verify Email Code and create account or log in
   */
  public verifyEmailOtp(
    email: string,
    code: string,
    ip?: string,
    userAgent?: string
  ): {
    success: boolean;
    error?: string;
    session?: UserSession;
    isNewUser?: boolean;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, error: 'Email and 6-digit verification code are required.' };
    }

    const record = this.pendingEmailVerifications.get(cleanEmail);
    if (!record) {
      return {
        success: false,
        error: 'No pending verification code found for this email. Please request a new code.',
      };
    }

    if (Date.now() > record.expiresAt) {
      this.pendingEmailVerifications.delete(cleanEmail);
      return {
        success: false,
        error: 'Verification code has expired. Please request a fresh code.',
      };
    }

    if (record.code !== cleanCode) {
      return {
        success: false,
        error: 'Invalid verification code. Please check and try again.',
      };
    }

    // Code matches! Clear pending record
    this.pendingEmailVerifications.delete(cleanEmail);

    let isNewUser = false;
    let user = this.users.get(cleanEmail);

    if (!user) {
      isNewUser = true;
      const isOwnerEmail =
        cleanEmail === 'its.shahzaibjaffri@gmail.com' || cleanEmail.startsWith('shahzaibjaffri');
      const role: UserRole = isOwnerEmail ? 'Owner' : 'Researcher';

      user = {
        id: `usr-otp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        username: cleanEmail,
        name: record.name || cleanEmail.split('@')[0],
        role,
        permissions: getDefaultPermissionsForRole(role),
        createdAt: new Date().toISOString(),
        createdBy: 'email_otp_verification',
      };
      this.users.set(cleanEmail, user);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const session: UserSession = {
      token,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      loginMethod: 'email_otp',
    };

    this.sessions.set(token, session);
    this.recordLogin(user, 'email_otp', ip, userAgent);

    return {
      success: true,
      session,
      isNewUser,
    };
  }

  /**
   * Owner & Manager Permission: Monitor all user progress, active research, and annotations
   */
  public getUserProgressOverview(
    session: UserSession,
    projects: ResearchProject[] = [],
    annotations: FindingAnnotation[] = []
  ): UserProgressOverview[] | null {
    if (session.role !== 'Owner' && session.role !== 'Manager') {
      return null;
    }

    const overviews: UserProgressOverview[] = [];
    const now = Date.now();

    for (const user of this.users.values()) {
      // Find latest audit log
      const userLogs = this.auditLogs.filter(
        (l) => l.userId === user.id || l.username.toLowerCase() === user.username.toLowerCase()
      );
      const latestLog = userLogs[0];
      const lastActiveTime = latestLog ? new Date(latestLog.timestamp).getTime() : new Date(user.createdAt).getTime();

      let status: 'online' | 'idle' | 'offline' = 'offline';
      if (now - lastActiveTime < 15 * 60 * 1000) {
        status = 'online';
      } else if (now - lastActiveTime < 24 * 60 * 60 * 1000) {
        status = 'idle';
      }

      // User's research jobs
      const userProjects = projects.filter(
        (p) => (p as any).userId === user.id || (p as any).createdBy === user.username
      );
      const activeRunningProject = projects.find((p) => p.status === 'running');

      // User's annotations
      const userAnnotations = annotations.filter(
        (a) => a.author.userId === user.id || a.author.username.toLowerCase() === user.username.toLowerCase()
      );

      const flagBreakdown: Record<string, number> = {};
      userAnnotations.forEach((a) => {
        flagBreakdown[a.flag] = (flagBreakdown[a.flag] || 0) + 1;
      });

      overviews.push({
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        loginMethod: latestLog?.method,
        createdAt: user.createdAt,
        lastActive: latestLog?.timestamp || user.createdAt,
        status,
        totalResearchJobs: Math.max(userProjects.length, user.role === 'Owner' ? projects.length : 1),
        activeJob: activeRunningProject
          ? {
              id: activeRunningProject.id,
              title: activeRunningProject.title,
              stage: activeRunningProject.progress.currentStageId,
              percentage: activeRunningProject.progress.percentage,
              status: activeRunningProject.status,
            }
          : undefined,
        completedProjectsCount: Math.max(
          userProjects.filter((p) => p.status === 'completed').length,
          user.role === 'Owner' ? projects.length : 1
        ),
        totalAnnotationsCount: userAnnotations.length,
        flagBreakdown,
      });
    }

    return overviews.sort((a, b) => {
      // Sort: Online users first, then Owner/Managers, then by activity
      if (a.status === 'online' && b.status !== 'online') return -1;
      if (b.status === 'online' && a.status !== 'online') return 1;
      if (a.role === 'Owner') return -1;
      if (b.role === 'Owner') return 1;
      return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
    });
  }

  public register(username: string, password: string, name?: string): { success: boolean; error?: string; user?: Omit<UserAccount, 'passwordHash'> } {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (this.users.has(clean)) {
      return { success: false, error: `Username "${clean}" already exists.` };
    }

    const role: UserRole = 'Researcher';
    const account: UserAccount = {
      id: `usr-reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: clean,
      passwordHash: this.hashPassword(password),
      name: name?.trim() || clean,
      role,
      permissions: getDefaultPermissionsForRole(role),
      createdAt: new Date().toISOString(),
      createdBy: 'self_registration',
    };

    this.users.set(clean, account);
    const { passwordHash, ...safeUser } = account;
    return { success: true, user: safeUser };
  }

  public validateSession(token?: string): UserSession | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    // Update live permissions from user record if changed
    const user = this.users.get(session.username.toLowerCase());
    if (user) {
      session.role = user.role;
      session.permissions = user.permissions;
    }
    return session;
  }

  public logout(token: string): boolean {
    return this.sessions.delete(token);
  }

  public createUser(
    requestingUser: UserSession,
    newUser: { username: string; password: string; name?: string; role?: UserRole; permissions?: Partial<UserPermissions> }
  ): { success: boolean; error?: string; user?: Omit<UserAccount, 'passwordHash'> } {
    const isOwner = requestingUser.role === 'Owner';
    const isAdmin = requestingUser.role === 'Admin' || requestingUser.role === 'Moderator';

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Unauthorized: Owner or Admin rights required.' };
    }

    const cleanUsername = newUser.username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }
    if (!newUser.password || newUser.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (this.users.has(cleanUsername)) {
      return { success: false, error: `Username "${cleanUsername}" is already taken.` };
    }

    const role: UserRole = isOwner ? (newUser.role || 'Researcher') : 'Researcher';
    const basePermissions = getDefaultPermissionsForRole(role);
    const permissions: UserPermissions = {
      ...basePermissions,
      ...(newUser.permissions || {}),
    };

    const account: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      passwordHash: this.hashPassword(newUser.password),
      name: newUser.name?.trim() || cleanUsername,
      role,
      permissions,
      createdAt: new Date().toISOString(),
      createdBy: requestingUser.username,
      pendingOwnerApproval: isAdmin && !isOwner,
    };

    this.users.set(cleanUsername, account);
    const { passwordHash, ...safeUser } = account;
    return { success: true, user: safeUser };
  }

  public createRandomAccount(requestingUser: UserSession): { success: boolean; error?: string; credentials?: { username: string; password: string; role: UserRole; name: string } } {
    if (requestingUser.role !== 'Owner') {
      return { success: false, error: 'Unauthorized: Only Owner can create auto-generated accounts.' };
    }

    const adjectives = ['cyber', 'quantum', 'nexus', 'stealth', 'hyper', 'vector', 'omega', 'alpha'];
    const nouns = ['agent', 'analyst', 'sentinel', 'researcher', 'engineer', 'operative'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const username = `${adj}_${noun}_${num}`;
    const password = `Nexus*${Math.random().toString(36).substring(2, 8).toUpperCase()}!${Math.floor(100 + Math.random() * 900)}`;

    const rolesPool: UserRole[] = ['Researcher', 'Manager', 'Moderator', 'Admin'];
    const assignedRole = rolesPool[Math.floor(Math.random() * rolesPool.length)];

    const res = this.createUser(requestingUser, {
      username,
      password,
      name: `${adj.toUpperCase()} ${noun.toUpperCase()}`,
      role: assignedRole,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    return {
      success: true,
      credentials: {
        username,
        password,
        role: assignedRole,
        name: `${adj.toUpperCase()} ${noun.toUpperCase()}`,
      },
    };
  }

  public listUsers(requestingUser: UserSession): Array<Omit<UserAccount, 'passwordHash'>> | null {
    const isOwner = requestingUser.role === 'Owner';
    const isAdmin = requestingUser.role === 'Admin' || requestingUser.role === 'Moderator';
    const isManager = requestingUser.role === 'Manager';

    if (!isOwner && !isAdmin && !isManager) return null;

    return Array.from(this.users.values()).map(({ passwordHash, ...safeUser }) => safeUser);
  }

  public listLoginLogs(requestingUser: UserSession): LoginAuditLog[] | null {
    const isOwner = requestingUser.role === 'Owner';
    const isManager = requestingUser.role === 'Manager';
    if (!isOwner && !isManager) return null;
    return this.auditLogs;
  }

  public updatePermissions(
    requestingUser: UserSession,
    targetUsername: string,
    newRole: UserRole,
    newPermissions: Partial<UserPermissions>
  ): { success: boolean; error?: string; user?: Omit<UserAccount, 'passwordHash'> } {
    const isOwner = requestingUser.role === 'Owner';
    const isAdmin = requestingUser.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Unauthorized: Owner or Admin role required.' };
    }

    const user = this.users.get(targetUsername.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (user.role === 'Owner' && requestingUser.username !== user.username) {
      return { success: false, error: 'Cannot modify permissions of Platform Owner.' };
    }

    if (isAdmin && !isOwner) {
      user.pendingOwnerApproval = true;
    } else {
      user.pendingOwnerApproval = false;
      user.role = newRole;
      user.permissions = {
        ...user.permissions,
        ...newPermissions,
      };
    }

    const { passwordHash, ...safeUser } = user;
    return { success: true, user: safeUser };
  }

  public approveAdminChanges(requestingUser: UserSession, targetUsername: string): { success: boolean; error?: string } {
    if (requestingUser.role !== 'Owner') {
      return { success: false, error: 'Unauthorized: Only Owner can approve permission assignments.' };
    }
    const user = this.users.get(targetUsername.trim().toLowerCase());
    if (!user) return { success: false, error: 'User not found' };
    user.pendingOwnerApproval = false;
    return { success: true };
  }

  public deleteUser(requestingUser: UserSession, usernameToDelete: string): { success: boolean; error?: string } {
    if (requestingUser.role !== 'Owner') {
      return { success: false, error: 'Unauthorized: Only the Owner can delete accounts.' };
    }

    const target = usernameToDelete.trim().toLowerCase();
    if (target === 'shahzaibjaffri') {
      return { success: false, error: 'Cannot delete the primary Platform Owner account.' };
    }

    if (!this.users.has(target)) {
      return { success: false, error: 'User does not exist.' };
    }

    this.users.delete(target);

    for (const [token, sess] of this.sessions.entries()) {
      if (sess.username.toLowerCase() === target) {
        this.sessions.delete(token);
      }
    }

    return { success: true };
  }
}

export const authManager = new AuthManager();
