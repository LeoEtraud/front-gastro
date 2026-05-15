import type { Role } from '@/types/api';

export function isStaffRole(role: Role): boolean {
  return role === 'TEACHER' || role === 'ADMIN';
}

export function canManageUsers(role: Role): boolean {
  return role === 'ADMIN';
}

export function canCreateCourse(role: Role): boolean {
  return role === 'ADMIN';
}

export function canDeleteCourse(role: Role): boolean {
  return role === 'ADMIN';
}

export function canPublishCourse(role: Role): boolean {
  return role === 'ADMIN';
}

export function canManageCourseStructure(role: Role): boolean {
  return role === 'ADMIN';
}
