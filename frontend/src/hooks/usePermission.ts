import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export type PermissionAction = 
  | 'report_incident'
  | 'view_feed'
  | 'verify_incident'
  | 'change_status'
  | 'add_internal_notes'
  | 'assign_departments'
  | 'view_analytics'
  | 'manage_users';

const PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  citizen: ['report_incident', 'view_feed'],
  responder: ['view_feed', 'verify_incident', 'change_status', 'add_internal_notes', 'assign_departments'],
  admin: ['view_feed', 'verify_incident', 'change_status', 'add_internal_notes', 'assign_departments', 'view_analytics', 'manage_users'],
};

export function usePermission() {
  const { profile } = useAuth();

  const hasPermission = (action: PermissionAction): boolean => {
    if (!profile) return false;
    const userPermissions = PERMISSIONS[profile.role];
    return userPermissions.includes(action);
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return profile ? roles.includes(profile.role) : false;
  };

  const hasAnyPermission = (actions: PermissionAction[]): boolean => {
    return actions.some(action => hasPermission(action));
  };

  const isCitizen = hasRole('citizen');
  const isResponder = hasRole('responder');
  const isAdmin = hasRole('admin');

  // Check multiple permissions (all must be true)
  const hasAllPermissions = (actions: PermissionAction[]): boolean => {
    return actions.every(action => hasPermission(action));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    hasAllPermissions,
    isCitizen,
    isResponder,
    isAdmin,
  };
}
