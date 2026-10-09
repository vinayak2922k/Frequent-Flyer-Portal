import type { Member, FormErrors } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMember(
  data: Partial<Member>,
  existingIds: string[],
  editingId?: string
): FormErrors {
  const errors: FormErrors = {};

  if (!data.id?.trim()) {
    errors.id = 'Membership ID is required.';
  } else if (!/^[\w-]+$/.test(data.id.trim())) {
    errors.id = 'Use only letters, numbers, or hyphens.';
  } else if (existingIds.includes(data.id.trim()) && data.id.trim() !== editingId) {
    errors.id = 'This Membership ID already exists.';
  }

  if (!data.fullName?.trim()) errors.fullName = 'Full name is required.';

  if (!data.email?.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.tier || !['Bronze', 'Silver', 'Gold', 'Platinum'].includes(data.tier)) {
    errors.tier = 'Please select a loyalty tier.';
  }

  if (data.milesBalance === undefined || data.milesBalance === null) {
    errors.milesBalance = 'Miles balance is required.';
  } else if (!Number.isInteger(data.milesBalance) || data.milesBalance < 0) {
    errors.milesBalance = 'Must be a non-negative whole number.';
  }

  return errors;
}

export function filterMembers(members: Member[], query: string): Member[] {
  const q = query.trim().toLowerCase();
  if (!q) return members;
  return members.filter(
    (m) =>
      m.id.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
  );
}

export function sanitizeText(input: string): string {
  return input.replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' })[c] ?? c
  );
}

export function logAnalytics(action: string): void {
  console.log(`[Analytics] User interacted with End-to-End Frequent Flyer Portal: ${action}`);
}
