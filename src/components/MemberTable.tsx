import type { FC } from 'react';
import type { Member } from '../types';

interface Props {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

const TIER_CLASS: Record<string, string> = {
  Platinum: 'badge badge--platinum',
  Gold:     'badge badge--gold',
  Silver:   'badge badge--silver',
  Bronze:   'badge badge--bronze',
};

const MemberTable: FC<Props> = ({ members, onEdit, onDelete }) => {
  if (members.length === 0) {
    return <p className="empty-state" role="status">No data found</p>;
  }

  return (
    <div className="table-wrapper" role="region" aria-label="Frequent flyer members">
      <table className="member-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Tier</th>
            <th scope="col">Miles</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td><code className="member-id">{m.id}</code></td>
              <td>{m.fullName}</td>
              <td>{m.email}</td>
              <td><span className={TIER_CLASS[m.tier] ?? 'badge'}>{m.tier}</span></td>
              <td className="miles-cell">{m.milesBalance.toLocaleString()}</td>
              <td className="actions-cell">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => onEdit(m)} aria-label={`Edit ${m.fullName}`}>Edit</button>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => onDelete(m.id)} aria-label={`Delete ${m.fullName}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTable;
