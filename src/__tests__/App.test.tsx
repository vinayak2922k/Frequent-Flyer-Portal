import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

vi.mock('../mockData', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../mockData')>();
  return { ...actual, simulateDelay: vi.fn().mockResolvedValue(undefined) };
});

beforeEach(() => vi.clearAllMocks());

const waitForMembers = () => waitFor(() => screen.getByText('Alice Nakamura'));
const emailField = () => screen.getByRole('textbox', { name: /email/i });

describe('Header', () => {
  it('renders portal title', async () => {
    await act(async () => { render(<App />); });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/Frequent Flyer Portal/i)).toBeInTheDocument();
  });
});

describe('Member List', () => {
  it('renders members on load', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Alice Nakamura')).toBeInTheDocument());
  });

  it('shows loading indicator', async () => {
    vi.useFakeTimers();
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    await act(async () => { vi.runAllTimers(); });
    vi.useRealTimers();
  });
});

describe('Search', () => {
  it('filters by name', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByRole('searchbox'), 'Alice');
    expect(screen.getByText('Alice Nakamura')).toBeInTheDocument();
    expect(screen.queryByText('Bernard Osei')).not.toBeInTheDocument();
  });

  it('filters by ID', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByRole('searchbox'), 'FF-002');
    expect(screen.getByText('Bernard Osei')).toBeInTheDocument();
    expect(screen.queryByText('Alice Nakamura')).not.toBeInTheDocument();
  });

  it('filters by email', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByRole('searchbox'), 'b.osei');
    expect(screen.getByText('Bernard Osei')).toBeInTheDocument();
    expect(screen.queryByText('Alice Nakamura')).not.toBeInTheDocument();
  });

  it('shows no data found', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByRole('searchbox'), 'zzznomatch');
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });
});

describe('Form — validation', () => {
  it('shows error on empty submit', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.click(screen.getByRole('button', { name: /add member/i }));
    expect(screen.getByText(/membership id is required/i)).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByLabelText(/membership id/i), 'FF-999');
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(emailField(), 'bademail');
    await userEvent.click(screen.getByRole('button', { name: /add member/i }));
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it('shows error for duplicate ID', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByLabelText(/membership id/i), 'FF-001');
    await userEvent.type(screen.getByLabelText(/full name/i), 'New User');
    await userEvent.type(emailField(), 'new@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/loyalty tier/i), 'Bronze');
    await userEvent.type(screen.getByLabelText(/miles balance/i), '100');
    await userEvent.click(screen.getByRole('button', { name: /add member/i }));
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
  });

  it('shows error for negative miles', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByLabelText(/membership id/i), 'FF-999');
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(emailField(), 'test@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/loyalty tier/i), 'Bronze');
    await userEvent.clear(screen.getByLabelText(/miles balance/i));
    await userEvent.type(screen.getByLabelText(/miles balance/i), '-5');
    await userEvent.click(screen.getByRole('button', { name: /add member/i }));
    expect(screen.getByText(/non-negative/i)).toBeInTheDocument();
  });
});

describe('Add Member', () => {
  const fill = async () => {
    await userEvent.type(screen.getByLabelText(/membership id/i), 'FF-999');
    await userEvent.type(screen.getByLabelText(/full name/i), 'Zelda Fairweather');
    await userEvent.type(emailField(), 'zelda@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/loyalty tier/i), 'Silver');
    await userEvent.clear(screen.getByLabelText(/miles balance/i));
    await userEvent.type(screen.getByLabelText(/miles balance/i), '12345');
  };

  it('adds member to list', async () => {
    render(<App />);
    await waitForMembers();
    await fill();
    await userEvent.click(screen.getByRole('button', { name: /add member/i }));
    await waitFor(() => expect(screen.getByText('Zelda Fairweather')).toBeInTheDocument());
  });

  it('logs analytics on add', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByLabelText(/membership id/i), 'FF-888');
    await userEvent.type(screen.getByLabelText(/full name/i), 'Analytics Tester');
    await userEvent.type(emailField(), 'analytics@test.com');
    await userEvent.selectOptions(screen.getByLabelText(/loyalty tier/i), 'Gold');
    await userEvent.clear(screen.getByLabelText(/miles balance/i));
    await userEvent.type(screen.getByLabelText(/miles balance/i), '100');
    await userEvent.click(screen.getByRole('button', { name: /add member/i }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Analytics] User interacted with End-to-End Frequent Flyer Portal')));
    spy.mockRestore();
  });
});

describe('Edit Member', () => {
  it('populates form on edit click', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    expect((screen.getByLabelText(/membership id/i) as HTMLInputElement).value).toBe('FF-001');
    expect((screen.getByLabelText(/full name/i) as HTMLInputElement).value).toBe('Alice Nakamura');
  });

  it('saves updated member', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    await userEvent.clear(screen.getByLabelText(/full name/i));
    await userEvent.type(screen.getByLabelText(/full name/i), 'Alice Updated');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(screen.getByText('Alice Updated')).toBeInTheDocument());
  });

  it('logs analytics on edit', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<App />);
    await waitForMembers();
    await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Analytics] User interacted with End-to-End Frequent Flyer Portal')));
    spy.mockRestore();
  });
});

describe('Delete Member', () => {
  it('removes member from list', async () => {
    render(<App />);
    await waitForMembers();
    const row = screen.getByText('Alice Nakamura').closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(screen.queryByText('Alice Nakamura')).not.toBeInTheDocument());
  });
});

describe('Network error', () => {
  it('shows error and retry on failure', async () => {
    const { simulateDelay } = await import('../mockData');
    (simulateDelay as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });
});

describe('Duplicate submission', () => {
  it('settles without crash after double click', async () => {
    render(<App />);
    await waitForMembers();
    await userEvent.type(screen.getByLabelText(/membership id/i), 'FF-777');
    await userEvent.type(screen.getByLabelText(/full name/i), 'Dupe Test');
    await userEvent.type(emailField(), 'dupe@test.com');
    await userEvent.selectOptions(screen.getByLabelText(/loyalty tier/i), 'Bronze');
    await userEvent.clear(screen.getByLabelText(/miles balance/i));
    await userEvent.type(screen.getByLabelText(/miles balance/i), '0');
    fireEvent.click(screen.getByRole('button', { name: /add member/i }));
    await waitFor(() => expect(screen.getByText('Dupe Test')).toBeInTheDocument());
  });
});

describe('Accessibility', () => {
  it('form fields have labels', async () => {
    render(<App />);
    await waitForMembers();
    expect(screen.getByLabelText(/membership id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/loyalty tier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/miles balance/i)).toBeInTheDocument();
  });

  it('has main landmark', async () => {
    await act(async () => { render(<App />); });
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('has searchbox', async () => {
    render(<App />);
    await waitForMembers();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
