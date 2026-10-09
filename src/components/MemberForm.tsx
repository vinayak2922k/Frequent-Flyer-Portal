import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import type { Member, FormErrors, LoyaltyTier } from '../types';
import { TIERS } from '../mockData';
import { validateMember } from '../utils';

interface Props {
  existingIds: string[];
  editingMember: Member | null;
  isSubmitting: boolean;
  onSubmit: (data: Member) => void;
  onCancel: () => void;
}

type FormValues = { id: string; fullName: string; email: string; tier: LoyaltyTier | ''; milesBalance: string };

const EMPTY: FormValues = { id: '', fullName: '', email: '', tier: '', milesBalance: '' };

const Field: FC<{
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ id, label, error, children }) => (
  <div className={`form-field${error ? ' form-field--error' : ''}`}>
    <label htmlFor={id} className="form-field__label">
      {label} <span aria-hidden="true" className="required-star">*</span>
    </label>
    {children}
    {error && <span id={`err-${id}`} className="form-field__error" role="alert">{error}</span>}
  </div>
);

const InnerForm: FC<Props & { initialValues: FormValues }> = ({
  existingIds, editingMember, isSubmitting, onSubmit, onCancel, initialValues,
}) => {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const miles = parseInt(form.milesBalance, 10);
    const candidate: Partial<Member> = {
      id: form.id.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      tier: form.tier as LoyaltyTier,
      milesBalance: isNaN(miles) ? (undefined as unknown as number) : miles,
    };
    const errs = validateMember(candidate, existingIds, editingMember?.id);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(candidate as Member);
  };

  const isEditing = Boolean(editingMember);

  return (
    <form className="member-form" onSubmit={submit} noValidate aria-label={isEditing ? 'Edit frequent flyer member' : 'Add frequent flyer member'}>
      <h2 className="member-form__title">{isEditing ? 'Edit Member' : 'Add Member'}</h2>

      <Field id="field-id" label="Membership ID" error={errors.id}>
        <input id="field-id" name="id" type="text" className="form-field__input" value={form.id} onChange={set} disabled={isEditing} aria-required="true" aria-describedby={errors.id ? 'err-field-id' : undefined} aria-invalid={Boolean(errors.id)} autoComplete="off" />
      </Field>

      <Field id="field-fullName" label="Full Name" error={errors.fullName}>
        <input id="field-fullName" name="fullName" type="text" className="form-field__input" value={form.fullName} onChange={set} aria-required="true" aria-describedby={errors.fullName ? 'err-field-fullName' : undefined} aria-invalid={Boolean(errors.fullName)} autoComplete="name" />
      </Field>

      <Field id="field-email" label="Email" error={errors.email}>
        <input id="field-email" name="email" type="email" className="form-field__input" value={form.email} onChange={set} aria-required="true" aria-describedby={errors.email ? 'err-field-email' : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" />
      </Field>

      <Field id="field-tier" label="Loyalty Tier" error={errors.tier}>
        <select id="field-tier" name="tier" className="form-field__select" value={form.tier} onChange={set} aria-required="true" aria-describedby={errors.tier ? 'err-field-tier' : undefined} aria-invalid={Boolean(errors.tier)}>
          <option value="">Select a tier…</option>
          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <Field id="field-milesBalance" label="Miles Balance" error={errors.milesBalance}>
        <input id="field-milesBalance" name="milesBalance" type="number" min="0" step="1" className="form-field__input" value={form.milesBalance} onChange={set} aria-required="true" aria-describedby={errors.milesBalance ? 'err-field-milesBalance' : undefined} aria-invalid={Boolean(errors.milesBalance)} />
      </Field>

      <div className="member-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Member'}
        </button>
        {isEditing && (
          <button type="button" className="btn btn--secondary" onClick={() => { setErrors({}); onCancel(); }} disabled={isSubmitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const MemberForm: FC<Props> = (props) => {
  const { editingMember } = props;
  const key = editingMember ? `edit-${editingMember.id}` : 'add-new';
  const initialValues: FormValues = editingMember
    ? { id: editingMember.id, fullName: editingMember.fullName, email: editingMember.email, tier: editingMember.tier, milesBalance: String(editingMember.milesBalance) }
    : EMPTY;
  return <InnerForm key={key} {...props} initialValues={initialValues} />;
};

export default MemberForm;
