import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

type BudgetStatus = 'HEALTHY' | 'TIGHT' | 'OVER_BUDGET'

interface BudgetPlan {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  summary: {
    totalIncome: number
    totalExpenses: number
    totalSavingsGoals: number
    remainingBuffer: number
    budgetStatus: BudgetStatus
  }
}

interface PlanForm {
  title: string
  description: string
  startDate: string
  endDate: string
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

const emptyPlanForm: PlanForm = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
}

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(date: string) {
  return dateFormatter.format(new Date(date))
}

function toDateInputValue(date: string) {
  return date.slice(0, 10)
}

function statusLabel(status: BudgetStatus) {
  return status.replace('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())
}

function App() {
  const [plans, setPlans] = useState<BudgetPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanForm>(emptyPlanForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  )

  async function fetchPlans() {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/budget-plans`)
      const payload = (await response.json()) as ApiResponse<BudgetPlan[]>

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? 'Unable to load budget plans.')
      }

      const loadedPlans = payload.data
      setPlans(loadedPlans)
      setSelectedPlanId((current) =>
        loadedPlans.some((plan) => plan.id === current) ? current : (loadedPlans[0]?.id ?? null),
      )
      setError(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load budget plans.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchPlans()
  }, [])

  function beginCreate() {
    setEditingPlanId(null)
    setForm(emptyPlanForm)
    setError(null)
  }

  function beginEdit(plan: BudgetPlan) {
    setEditingPlanId(plan.id)
    setForm({
      title: plan.title,
      description: plan.description ?? '',
      startDate: toDateInputValue(plan.startDate),
      endDate: toDateInputValue(plan.endDate),
    })
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const payload = {
      title: form.title,
      description: form.description || null,
      startDate: form.startDate,
      endDate: form.endDate,
    }
    const endpoint = editingPlanId
      ? `${API_BASE_URL}/api/budget-plans/${editingPlanId}`
      : `${API_BASE_URL}/api/budget-plans`

    try {
      const response = await fetch(endpoint, {
        method: editingPlanId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await response.json()) as ApiResponse<BudgetPlan>

      if (!response.ok || !body.data) {
        throw new Error(body.error ?? 'Unable to save the budget plan.')
      }

      const savedPlan = body.data
      setPlans((current) => {
        const planExists = current.some((plan) => plan.id === savedPlan.id)
        return planExists
          ? current.map((plan) => (plan.id === savedPlan.id ? savedPlan : plan))
          : [savedPlan, ...current]
      })
      setSelectedPlanId(savedPlan.id)
      setEditingPlanId(null)
      setForm(emptyPlanForm)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save the budget plan.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deletePlan(plan: BudgetPlan) {
    if (!window.confirm(`Delete “${plan.title}”? This cannot be undone.`)) {
      return
    }

    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/budget-plans/${plan.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const body = (await response.json()) as ApiResponse<never>
        throw new Error(body.error ?? 'Unable to delete the budget plan.')
      }

      setPlans((current) => current.filter((item) => item.id !== plan.id))
      setSelectedPlanId((current) => (current === plan.id ? null : current))
      if (editingPlanId === plan.id) {
        beginCreate()
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete the budget plan.')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="PayPilot home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>PayPilot</span>
        </a>
        <p className="topbar-note">Cash-flow planning, with your next move in view.</p>
        <button className="button button-primary topbar-action" type="button" onClick={beginCreate}>
          <span aria-hidden="true">+</span> New plan
        </button>
      </header>

      <main id="overview" className="workspace">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Personal cash-flow planning</p>
            <h1>Make room for what matters.</h1>
            <p className="hero-copy">
              Build a clear timeline for income, planned costs, and savings goals—before the month gets away from you.
            </p>
          </div>
          <div className="notice-card">
            <span className="notice-icon" aria-hidden="true">↗</span>
            <p>Planning support only. PayPilot never connects to your bank, moves money, or provides regulated financial advice.</p>
          </div>
        </section>

        <section className="content-grid" aria-label="Budget plan workspace">
          <aside className="plans-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Your plans</p>
                <h2>{plans.length} {plans.length === 1 ? 'plan' : 'plans'}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => void fetchPlans()} aria-label="Refresh plans">
                ↻
              </button>
            </div>

            {isLoading ? (
              <p className="panel-message">Loading your plans…</p>
            ) : plans.length === 0 ? (
              <div className="empty-list">
                <span aria-hidden="true">◌</span>
                <p>No plans yet. Start with the period you want to make more intentional.</p>
                <button className="text-button" type="button" onClick={beginCreate}>Create your first plan</button>
              </div>
            ) : (
              <div className="plan-list">
                {plans.map((plan) => (
                  <button
                    className={`plan-card ${selectedPlan?.id === plan.id ? 'is-selected' : ''}`}
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <span className={`status-dot status-${plan.summary.budgetStatus.toLowerCase()}`} aria-hidden="true" />
                    <span className="plan-card-content">
                      <strong>{plan.title}</strong>
                      <small>{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</small>
                    </span>
                    <span className="plan-card-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="plan-detail">
            {selectedPlan ? (
              <>
                <div className="detail-heading">
                  <div>
                    <p className="eyebrow">Selected plan</p>
                    <div className="title-row">
                      <h2>{selectedPlan.title}</h2>
                      <span className={`status-badge status-${selectedPlan.summary.budgetStatus.toLowerCase()}`}>
                        {selectedPlan.summary.totalIncome === 0 ? 'Ready to plan' : statusLabel(selectedPlan.summary.budgetStatus)}
                      </span>
                    </div>
                    <p className="date-range">{formatDate(selectedPlan.startDate)} to {formatDate(selectedPlan.endDate)}</p>
                    {selectedPlan.description && <p className="description">{selectedPlan.description}</p>}
                  </div>
                  <div className="detail-actions">
                    <button className="button button-secondary" type="button" onClick={() => beginEdit(selectedPlan)}>Edit</button>
                    <button className="button button-danger" type="button" onClick={() => void deletePlan(selectedPlan)}>Delete</button>
                  </div>
                </div>

                <div className="metric-grid">
                  <article className="metric-card metric-card-accent">
                    <p>Remaining buffer</p>
                    <strong>{currencyFormatter.format(selectedPlan.summary.remainingBuffer)}</strong>
                    <span>Available after planned items</span>
                  </article>
                  <article className="metric-card">
                    <p>Expected income</p>
                    <strong>{currencyFormatter.format(selectedPlan.summary.totalIncome)}</strong>
                    <span>Income sources arrive in Milestone 3</span>
                  </article>
                  <article className="metric-card">
                    <p>Planned expenses</p>
                    <strong>{currencyFormatter.format(selectedPlan.summary.totalExpenses)}</strong>
                    <span>Track fixed and flexible costs</span>
                  </article>
                  <article className="metric-card">
                    <p>Savings goals</p>
                    <strong>{currencyFormatter.format(selectedPlan.summary.totalSavingsGoals)}</strong>
                    <span>Set aside with intent</span>
                  </article>
                </div>

                <div className="next-step-card">
                  <div className="next-step-number">02</div>
                  <div>
                    <p className="eyebrow">Coming next</p>
                    <h3>Add the financial details</h3>
                    <p>Income, planned expenses, and savings goals will turn this timeline into a useful budget health view.</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-detail">
                <span className="empty-orbit" aria-hidden="true">✦</span>
                <p className="eyebrow">Your workspace</p>
                <h2>Give your next month a shape.</h2>
                <p>Create a budget plan to set its timeframe, then add the numbers that matter.</p>
                <button className="button button-primary" type="button" onClick={beginCreate}>Create a budget plan</button>
              </div>
            )}
          </section>

          <aside className="form-panel">
            <div className="form-heading">
              <p className="eyebrow">{editingPlanId ? 'Edit plan' : 'Start a plan'}</p>
              <h2>{editingPlanId ? 'Refine the timeline' : 'Name your timeframe'}</h2>
              <p>Keep the first step light. You can add the detail next.</p>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)}>
              <label>
                Plan name
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="e.g. July reset"
                  maxLength={120}
                  required
                />
              </label>
              <label>
                Notes <span className="optional">Optional</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="What would make this period feel successful?"
                  maxLength={1000}
                  rows={4}
                />
              </label>
              <div className="date-fields">
                <label>
                  Starts
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Ends
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                    required
                  />
                </label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving…' : editingPlanId ? 'Save changes' : 'Create plan'}
                </button>
                {editingPlanId && (
                  <button className="button button-quiet" type="button" onClick={beginCreate}>Cancel</button>
                )}
              </div>
            </form>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
