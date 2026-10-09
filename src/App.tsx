import { useState, useCallback, useEffect, type FC } from 'react';
import type { Member } from './types';
import { MOCK_MEMBERS, simulateDelay } from './mockData';
import { filterMembers, logAnalytics } from './utils';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import MemberTable from './components/MemberTable';
import MemberForm from './components/MemberForm';

type Status = 'loading' | 'error' | 'ready';

const App: FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus]   = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [query, setQuery]           = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading'); // eslint-disable-line react-hooks/set-state-in-effect
    setErrorMsg('');

    simulateDelay(400)
      .then(() => { if (!cancelled) { setMembers([...MOCK_MEMBERS]); setStatus('ready'); } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Unexpected error.');
          setStatus('error');
        }
      });

    return () => { cancelled = true; };
  }, [retryToken]);

  const handleSave = useCallback(async (data: Member) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await simulateDelay(300);
      setMembers((prev) =>
        editingMember ? prev.map((m) => (m.id === data.id ? data : m)) : [...prev, data]
      );
      logAnalytics(editingMember ? `updated member ${data.id}` : `added member ${data.id}`);
      setEditingMember(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, editingMember]);

  const handleDelete = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    logAnalytics(`deleted member ${id}`);
  }, []);

  const handleEdit = useCallback((member: Member) => {
    setEditingMember(member);
    const el = document.getElementById('form-section');
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const filtered    = filterMembers(members, query);
  const existingIds = members.map((m) => m.id);

  return (
    <>
      <Header />
      <main className="portal-main">
        {status === 'loading' && (
          <div className="loading-indicator" role="status" aria-label="Loading members">
            <span className="spinner" aria-hidden="true" />
            Loading members…
          </div>
        )}

        {status === 'error' && (
          <div className="error-banner" role="alert" aria-live="assertive">
            <strong>Error:</strong> {errorMsg}
            <button type="button" className="btn btn--secondary btn--sm retry-btn" onClick={() => setRetryToken((t) => t + 1)}>Retry</button>
          </div>
        )}

        {status === 'ready' && (
          <div className="portal-grid">
            <section className="portal-section" aria-label="Member list">
              <div className="section-header">
                <h2 className="section-title">Members</h2>
                <span className="member-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
              </div>
              <SearchBar value={query} onChange={setQuery} />
              <MemberTable members={filtered} onEdit={handleEdit} onDelete={handleDelete} />
            </section>

            <section id="form-section" className="portal-section" aria-label={editingMember ? 'Edit member form' : 'Add member form'}>
              <MemberForm
                existingIds={existingIds}
                editingMember={editingMember}
                isSubmitting={isSubmitting}
                onSubmit={handleSave}
                onCancel={() => setEditingMember(null)}
              />
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default App;
