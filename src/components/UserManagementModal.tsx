import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Key,
  Shuffle,
  Clock,
  Globe2,
  Lock,
  Check,
  Eye,
  Activity,
} from 'lucide-react';
import type { UserRole, UserPermissions, UserSession, LoginAuditLog } from '../types/research.ts';

interface UserManagementModalProps {
  session: UserSession;
  onClose: () => void;
}

interface UserRecord {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  createdBy: string;
  pendingOwnerApproval?: boolean;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ session, onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'create' | 'audit_logs'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<LoginAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Researcher');

  // Random account generated credentials modal/banner
  const [randomAccountGenerated, setRandomAccountGenerated] = useState<{
    username: string;
    password: string;
    role: string;
    name: string;
  } | null>(null);

  // Edit user permissions modal
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editPermissions, setEditPermissions] = useState<UserPermissions | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('Researcher');

  const isOwner = session.role === 'Owner';
  const isAdmin = session.role === 'Admin' || session.role === 'Moderator';
  const isManager = session.role === 'Manager';

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error('Failed to load user roster');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!isOwner && !isManager) return;
    try {
      const res = await fetch('/api/users/login-logs', {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setSuccessMsg(`User "${data.username}" created successfully with role ${data.role}!`);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      fetchUsers();
      setActiveTab('users');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateRandom = async () => {
    if (!isOwner) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/users/random', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate random account');

      setRandomAccountGenerated(data);
      setSuccessMsg(`Random account generated: ${data.username}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${username}"?`)) return;

    try {
      const res = await fetch(`/api/users/${username}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setSuccessMsg(`User "${username}" has been deleted.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openPermissionEditor = (u: UserRecord) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditPermissions({ ...u.permissions });
  };

  const handleSavePermissions = async () => {
    if (!editingUser || !editPermissions) return;

    try {
      const res = await fetch(`/api/users/${editingUser.username}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          role: editRole,
          permissions: editPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update permissions');

      setSuccessMsg(`Updated permissions for "${editingUser.username}".`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApproveAdminAssignment = async (username: string) => {
    if (!isOwner) return;
    try {
      const res = await fetch(`/api/users/${username}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        setSuccessMsg(`Approved permissions for "${username}".`);
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Role-Based Access & Identity Management</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {session.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage roles (Owner, Admin, Moderator, Manager, Researcher), delegate permissions, and review login audits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Members ({users.length})</span>
          </button>

          {(isOwner || isAdmin) && (
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          )}

          {(isOwner || isManager) && (
            <button
              onClick={() => { setActiveTab('audit_logs'); fetchAuditLogs(); }}
              className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'audit_logs'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Login Audit Log ({auditLogs.length})</span>
            </button>
          )}
        </div>

        {/* Action alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Random Account Generated Card */}
        {randomAccountGenerated && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-600/70 text-xs text-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4" /> Random Account Successfully Generated
              </span>
              <button
                onClick={() => setRandomAccountGenerated(null)}
                className="text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <div>User: <strong className="text-white">{randomAccountGenerated.username}</strong></div>
              <div>Pass: <strong className="text-cyan-400">{randomAccountGenerated.password}</strong></div>
              <div>Role: <span className="text-indigo-400">{randomAccountGenerated.role}</span></div>
              <div>Name: <span className="text-slate-300">{randomAccountGenerated.name}</span></div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto p-6 flex-1 text-slate-300 text-xs sm:text-sm">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs text-slate-400">
                  {isOwner
                    ? 'As Platform Owner, you have unrestricted authority to assign any permission or delete any member.'
                    : isAdmin
                    ? 'As Admin, you can provision researchers. Role/permission changes require Owner sign-off.'
                    : 'Monitoring active members and permission distribution.'}
                </p>

                {isOwner && (
                  <button
                    onClick={handleGenerateRandom}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Auto-Generate Random Account</span>
                  </button>
                )}
              </div>

              {/* Users Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Permissions</th>
                      <th className="p-3.5">Created</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white font-sans">{u.name}</div>
                          <div className="text-[11px] text-slate-400">@{u.username}</div>
                          {u.pendingOwnerApproval && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-400 border border-amber-800 font-sans">
                              Pending Owner Approval
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                              u.role === 'Owner'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                                : u.role === 'Admin'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                                : u.role === 'Moderator'
                                ? 'bg-purple-950 text-purple-300 border border-purple-700'
                                : u.role === 'Manager'
                                ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 font-sans">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.permissions?.canRunDeepResearch && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-emerald-400 border border-slate-800">
                                Research
                              </span>
                            )}
                            {u.permissions?.canGenerateVisuals && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-indigo-400 border border-slate-800">
                                Visuals
                              </span>
                            )}
                            {u.permissions?.canExportDocuments && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-cyan-400 border border-slate-800">
                                Export
                              </span>
                            )}
                            {u.permissions?.canManageUsers && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-amber-400 border border-slate-800">
                                Users
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right font-sans">
                          <div className="inline-flex items-center gap-1.5">
                            {isOwner && u.pendingOwnerApproval && (
                              <button
                                onClick={() => handleApproveAdminAssignment(u.username)}
                                className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold border border-emerald-800 transition"
                              >
                                Approve
                              </button>
                            )}

                            {(isOwner || isAdmin) && u.role !== 'Owner' && (
                              <button
                                onClick={() => openPermissionEditor(u)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                              >
                                Permissions
                              </button>
                            )}

                            {isOwner && u.username !== 'shahzaibjaffri' && (
                              <button
                                onClick={() => handleDeleteUser(u.username)}
                                className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-base font-bold text-white">Create New Account</h3>
              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Dr. Alex Mercer"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="e.g. alex_mercer"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none"
                  >
                    <option value="Researcher">Researcher (Standard Research & Visuals)</option>
                    <option value="Manager">Manager (Monitor All Logs, Research & Analytics)</option>
                    <option value="Moderator">Moderator (Equal to Admin: Review Content & Verify)</option>
                    <option value="Admin">Admin (Manage Users with Owner Approval)</option>
                    {isOwner && <option value="Owner">Owner (Full Unrestricted Authority)</option>}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition mt-2 cursor-pointer"
                >
                  Create Member Account
                </button>
              </form>
            </div>
          )}

          {activeTab === 'audit_logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Authentication Audit Trail</h3>
                  <p className="text-xs text-slate-400">
                    Real-time log of every member who authenticated via Google OAuth or credentials.
                  </p>
                </div>
                <button
                  onClick={fetchAuditLogs}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  Refresh Logs
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold uppercase text-slate-400">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Client IP / Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          No authentication events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-900/40">
                          <td className="p-3 text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-white font-sans">{log.name}</span>
                            <span className="text-slate-500 text-[10px] block">@{log.username}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-indigo-400 border border-slate-800">
                              {log.role}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            {log.method === 'google' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <Globe2 className="w-3 h-3" /> Google OAuth
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
                                <Lock className="w-3 h-3" /> Password
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 text-[10px] max-w-xs truncate">
                            {log.ip} &bull; {log.userAgent}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Edit Permissions Modal Overlay */}
        {editingUser && editPermissions && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Delegate Permissions</h4>
                  <p className="text-xs text-slate-400">Editing privileges for @{editingUser.username}</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isOwner && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Role Hierarchy</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Researcher">Researcher</option>
                    <option value="Manager">Manager</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">Granular Entitlements</span>
                {(
                  [
                    { key: 'canRunDeepResearch', label: 'Execute Deep Web Research & Scraping' },
                    { key: 'canGenerateVisuals', label: 'Generate Visuals, Infographics & Video Previews' },
                    { key: 'canExportDocuments', label: 'Export Documents (Word .docx, PDF, Markdown)' },
                    { key: 'canManageUsers', label: 'Create & Manage User Accounts' },
                    { key: 'canConfigureApiKeys', label: 'Configure Custom Multi-Model API Keys' },
                    { key: 'canViewAuditLogs', label: 'Access Live Security & Login Audit Logs' },
                    { key: 'canModerateContent', label: 'Moderate Sources & Disputed Claims' },
                  ] as const
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 cursor-pointer hover:border-slate-700"
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(editPermissions[key])}
                      onChange={e =>
                        setEditPermissions({
                          ...editPermissions,
                          [key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
                >
                  Apply Permissions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
