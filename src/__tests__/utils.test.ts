import { describe, it, expect, vi } from 'vitest';
import { validateMember, filterMembers, sanitizeText, logAnalytics } from '../utils';
import type { Member } from '../types';

const BASE: Partial<Member> = { id: 'FF-100', fullName: 'Test User', email: 'test@example.com', tier: 'Bronze', milesBalance: 0 };
const IDS = ['FF-001', 'FF-002'];

describe('validateMember', () => {
  it('no errors for valid new member', () => expect(validateMember(BASE, IDS)).toEqual({}));

  describe('Membership ID', () => {
    it('requires id',                    () => expect(validateMember({ ...BASE, id: '' }, IDS).id).toBeTruthy());
    it('rejects special chars',          () => expect(validateMember({ ...BASE, id: 'FF 001!' }, IDS).id).toBeTruthy());
    it('rejects duplicate id',           () => expect(validateMember({ ...BASE, id: 'FF-001' }, IDS).id).toMatch(/already exists/i));
    it('allows same id when editing',    () => expect(validateMember({ ...BASE, id: 'FF-001' }, IDS, 'FF-001').id).toBeUndefined());
    it('rejects other existing id',      () => expect(validateMember({ ...BASE, id: 'FF-002' }, IDS, 'FF-001').id).toMatch(/already exists/i));
  });

  describe('Full name', () => {
    it('requires name',                  () => expect(validateMember({ ...BASE, fullName: '' }, IDS).fullName).toBeTruthy());
    it('rejects whitespace-only',        () => expect(validateMember({ ...BASE, fullName: '   ' }, IDS).fullName).toBeTruthy());
  });

  describe('Email', () => {
    it('requires email',                 () => expect(validateMember({ ...BASE, email: '' }, IDS).email).toBeTruthy());
    it('rejects missing @',              () => expect(validateMember({ ...BASE, email: 'notanemail' }, IDS).email).toBeTruthy());
    it('rejects missing domain',         () => expect(validateMember({ ...BASE, email: 'user@' }, IDS).email).toBeTruthy());
    it('accepts valid email',            () => expect(validateMember({ ...BASE, email: 'a@b.co' }, IDS).email).toBeUndefined());
  });

  describe('Tier', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it('requires tier',                  () => expect(validateMember({ ...BASE, tier: undefined as any }, IDS).tier).toBeTruthy());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it('rejects invalid tier',           () => expect(validateMember({ ...BASE, tier: 'Diamond' as any }, IDS).tier).toBeTruthy());
    it('accepts each valid tier', () => {
      for (const tier of ['Bronze', 'Silver', 'Gold', 'Platinum'] as const) {
        expect(validateMember({ ...BASE, tier }, IDS).tier).toBeUndefined();
      }
    });
  });

  describe('Miles balance', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it('requires miles',                 () => expect(validateMember({ ...BASE, milesBalance: undefined as any }, IDS).milesBalance).toBeTruthy());
    it('rejects negative',               () => expect(validateMember({ ...BASE, milesBalance: -1 }, IDS).milesBalance).toBeTruthy());
    it('rejects fractional',             () => expect(validateMember({ ...BASE, milesBalance: 1.5 }, IDS).milesBalance).toBeTruthy());
    it('accepts zero',                   () => expect(validateMember({ ...BASE, milesBalance: 0 }, IDS).milesBalance).toBeUndefined());
    it('accepts large positive',         () => expect(validateMember({ ...BASE, milesBalance: 999999 }, IDS).milesBalance).toBeUndefined());
  });
});

describe('filterMembers', () => {
  const members: Member[] = [
    { id: 'FF-001', fullName: 'Alice Nakamura', email: 'alice@a.com', tier: 'Gold',   milesBalance: 1000 },
    { id: 'FF-002', fullName: 'Bob Smith',      email: 'bob@b.com',   tier: 'Silver', milesBalance: 500  },
  ];

  it('returns all for empty query',      () => expect(filterMembers(members, '')).toHaveLength(2));
  it('returns all for whitespace query', () => expect(filterMembers(members, '   ')).toHaveLength(2));
  it('finds by ID (case-insensitive)',   () => { const r = filterMembers(members, 'ff-001'); expect(r).toHaveLength(1); expect(r[0].id).toBe('FF-001'); });
  it('finds by name (partial)',          () => { const r = filterMembers(members, 'alice'); expect(r).toHaveLength(1); expect(r[0].fullName).toBe('Alice Nakamura'); });
  it('finds by email (partial)',         () => { const r = filterMembers(members, 'BOB@B'); expect(r).toHaveLength(1); expect(r[0].email).toBe('bob@b.com'); });
  it('returns empty for no match',       () => expect(filterMembers(members, 'zzznomatch')).toHaveLength(0));
});

describe('sanitizeText', () => {
  it('escapes <>', () => expect(sanitizeText('<script>')).toBe('&lt;script&gt;'));
  it('escapes &',  () => expect(sanitizeText('A & B')).toBe('A &amp; B'));
  it('escapes "',  () => expect(sanitizeText('"hi"')).toBe('&quot;hi&quot;'));
  it("escapes '",  () => expect(sanitizeText("it's")).toBe('it&#x27;s'));
  it('plain text unchanged', () => expect(sanitizeText('Hello 123')).toBe('Hello 123'));
});

describe('logAnalytics', () => {
  it('logs correct message', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logAnalytics('added member');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Analytics] User interacted with End-to-End Frequent Flyer Portal'));
    spy.mockRestore();
  });
});
