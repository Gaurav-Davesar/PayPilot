import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

type BudgetStatus = 'HEALTHY' | 'TIGHT' | 'OVER_BUDGET'
type ExpenseType = 'FIXED' | 'FLEXIBLE'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
type FinancialItemKind = 'income' | 'expense' | 'goal'

interface IncomeSource {
  id: string
  name: string
  amount: number
  expectedDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface Expense {
  id: string
  name: string
  amount: number
  category: string
  type: ExpenseType
  dueDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  priority: Priority | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface BudgetPlan {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  incomeSources: IncomeSource[]
  expenses: Expense[]
  savingsGoals: SavingsGoal[]
  summary: {
    totalIncome: number
    totalExpenses: number
    totalFixedExpenses: number
    totalFlexibleExpenses: number
    totalSavingsGoals: number
    remainingBuffer: number
    expenseToIncomeRatio: number | null
    savingsRate: number | null
    budgetStatus: BudgetStatus
  }
}

interface PlanForm {
  title: string
  description: string
  startDate: string
  endDate: string
}

interface IncomeForm {
  name: string
  amount: string
  expectedDate: string
  notes: string
}

interface ExpenseForm {
  name: string
  amount: string
  category: string
  type: ExpenseType
  dueDate: string
  notes: string
}

interface SavingsGoalForm {
  name: string
  targetAmount: string
  priority: Priority | ''
  notes: string
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

const emptyIncomeForm: IncomeForm = {
  name: '',
  amount: '',
  expectedDate: '',
  notes: '',
}

const emptyExpenseForm: ExpenseForm = {
  name: '',
  amount: '',
  category: '',
  type: 'FIXED',
  dueDate: '',
  notes: '',
}

const emptySavingsGoalForm: SavingsGoalForm = {
  name: '',
  targetAmount: '',
  priority: '',
  notes: '',
}

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(date: string) {
  return dateFormatter.format(new Date(date))
}

function formatOptionalDate(date: string | null) {
  return date ? formatDate(date) : 'No date set'
}

function toDateInputValue(date: string | null) {
  return date ? date.slice(0, 10) : ''
}

function statusLabel(status: BudgetStatus) {
  return status.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())
}

function enumLabel(value: string) {
  return value.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatPercent(value: number | null) {
  return value === null ? '—' : `${Math.round(value * 100)}%`
}

function sortPlans(plans: BudgetPlan[]) {
  return [...plans].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

function hasFinancialInputs(plan: BudgetPlan) {
  return plan.incomeSources.length + plan.expenses.length + plan.savingsGoals.length > 0
}

function App() {
  const [plans, setPlans] = useState<BudgetPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanForm>(emptyPlanForm)
  const [incomeForm, setIncomeForm] = useState<IncomeForm>(emptyIncomeForm)
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(emptyExpenseForm)
  const [goalForm, setGoalForm] = useState<SavingsGoalForm>(emptySavingsGoalForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savingItem, setSavingItem] = useState<FinancialItemKind | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  )

  useEffect(() => {
    void fetchPlans()
  }, [])

  useEffect(() => {
    resetIncomeForm()
    resetExpenseForm()
    resetGoalForm()
  }, [selectedPlan?.id])

  async function fetchPlans() {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/budget-plans`)
      const payload = (await response.json()) as ApiResponse<BudgetPlan[]>

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? 'Unable to load budget plans.')
      }

      const loadedPlans = sortPlans(payload.data)
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

  function resetIncomeForm() {
    setEditingIncomeId(null)
    setIncomeForm(emptyIncomeForm)
  }

  function resetExpenseForm() {
    setEditingExpenseId(null)
    setExpenseForm(emptyExpenseForm)
  }

  function resetGoalForm() {
    setEditingGoalId(null)
    setGoalForm(emptySavingsGoalForm)
  }

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

  function beginEditIncome(incomeSource: IncomeSource) {
    setEditingIncomeId(incomeSource.id)
    setIncomeForm({
      name: incomeSource.name,
      amount: String(incomeSource.amount),
      expectedDate: toDateInputValue(incomeSource.expectedDate),
      notes: incomeSource.notes ?? '',
    })
    setError(null)
  }

  function beginEditExpense(expense: Expense) {
    setEditingExpenseId(expense.id)
    setExpenseForm({
      name: expense.name,
      amount: String(expense.amount),
      category: expense.category,
      type: expense.type,
      dueDate: toDateInputValue(expense.dueDate),
      notes: expense.notes ?? '',
    })
    setError(null)
  }

  function beginEditGoal(goal: SavingsGoal) {
    setEditingGoalId(goal.id)
    setGoalForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      priority: goal.priority ?? '',
      notes: goal.notes ?? '',
    })
    setError(null)
  }

  function applyUpdatedPlan(updatedPlan: BudgetPlan) {
    setPlans((current) => {
      const nextPlans = current.some((plan) => plan.id === updatedPlan.id)
        ? current.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
        : [updatedPlan, ...current]

      return sortPlans(nextPlans)
    })
    setSelectedPlanId(updatedPlan.id)
  }

  async function requestUpdatedPlan(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', payload?: object) {
    const response = await fetch(endpoint, {
      method,
      headers: payload ? { 'Content-Type': 'application/json' } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    })
    const body = (await response.json()) as ApiResponse<BudgetPlan>

    if (!response.ok || !body.data) {
      throw new Error(body.error ?? 'Unable to update this budget plan.')
    }

    return body.data
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

      applyUpdatedPlan(body.data)
      setEditingPlanId(null)
      setForm(emptyPlanForm)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save the budget plan.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleIncomeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPlan) return

    setSavingItem('income')
    setError(null)

    const endpoint = editingIncomeId
      ? `${API_BASE_URL}/api/income/${editingIncomeId}`
      : `${API_BASE_URL}/api/budget-plans/${selectedPlan.id}/income`

    try {
      const updatedPlan = await requestUpdatedPlan(endpoint, editingIncomeId ? 'PUT' : 'POST', {
        name: incomeForm.name,
        amount: incomeForm.amount,
        expectedDate: incomeForm.expectedDate || null,
        notes: incomeForm.notes || null,
      })

      applyUpdatedPlan(updatedPlan)
      resetIncomeForm()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save the income source.')
    } finally {
      setSavingItem(null)
    }
  }

  async function handleExpenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPlan) return

    setSavingItem('expense')
    setError(null)

    const endpoint = editingExpenseId
      ? `${API_BASE_URL}/api/expenses/${editingExpenseId}`
      : `${API_BASE_URL}/api/budget-plans/${selectedPlan.id}/expenses`

    try {
      const updatedPlan = await requestUpdatedPlan(endpoint, editingExpenseId ? 'PUT' : 'POST', {
        name: expenseForm.name,
        amount: expenseForm.amount,
        category: expenseForm.category,
        type: expenseForm.type,
        dueDate: expenseForm.dueDate || null,
        notes: expenseForm.notes || null,
      })

      applyUpdatedPlan(updatedPlan)
      resetExpenseForm()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save the expense.')
    } finally {
      setSavingItem(null)
    }
  }

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPlan) return

    setSavingItem('goal')
    setError(null)

    const endpoint = editingGoalId
      ? `${API_BASE_URL}/api/savings-goals/${editingGoalId}`
      : `${API_BASE_URL}/api/budget-plans/${selectedPlan.id}/savings-goals`

    try {
      const updatedPlan = await requestUpdatedPlan(endpoint, editingGoalId ? 'PUT' : 'POST', {
        name: goalForm.name,
        targetAmount: goalForm.targetAmount,
        priority: goalForm.priority || null,
        notes: goalForm.notes || null,
      })

      applyUpdatedPlan(updatedPlan)
      resetGoalForm()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save the savings goal.')
    } finally {
      setSavingItem(null)
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

  async function deleteFinancialItem(kind: FinancialItemKind, id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This will update the plan totals.`)) {
      return
    }

    const endpoint =
      kind === 'income'
        ? `${API_BASE_URL}/api/income/${id}`
        : kind === 'expense'
          ? `${API_BASE_URL}/api/expenses/${id}`
          : `${API_BASE_URL}/api/savings-goals/${id}`

    setSavingItem(kind)
    setError(null)

    try {
      const updatedPlan = await requestUpdatedPlan(endpoint, 'DELETE')
      applyUpdatedPlan(updatedPlan)

      if (kind === 'income' && editingIncomeId === id) resetIncomeForm()
      if (kind === 'expense' && editingExpenseId === id) resetExpenseForm()
      if (kind === 'goal' && editingGoalId === id) resetGoalForm()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete this item.')
    } finally {
      setSavingItem(null)
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
                        {hasFinancialInputs(selectedPlan) ? statusLabel(selectedPlan.summary.budgetStatus) : 'Ready to plan'}
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
                    <span>After income, expenses, and savings</span>
                  </article>
                  <article className="metric-card">
                    <p>Expected income</p>
                    <strong>{currencyFormatter.format(selectedPlan.summary.totalIncome)}</strong>
                    <span>{selectedPlan.incomeSources.length} {selectedPlan.incomeSources.length === 1 ? 'source' : 'sources'}</span>
                  </article>
                  <article className="metric-card">
                    <p>Planned expenses</p>
                    <strong>{currencyFormatter.format(selectedPlan.summary.totalExpenses)}</strong>
                    <span>{formatPercent(selectedPlan.summary.expenseToIncomeRatio)} expense-to-income</span>
                  </article>
                  <article className="metric-card">
                    <p>Savings goals</p>
                    <strong>{currencyFormatter.format(selectedPlan.summary.totalSavingsGoals)}</strong>
                    <span>{formatPercent(selectedPlan.summary.savingsRate)} savings rate</span>
                  </article>
                </div>

                <div className="split-metric-row">
                  <span>Fixed expenses: {currencyFormatter.format(selectedPlan.summary.totalFixedExpenses)}</span>
                  <span>Flexible expenses: {currencyFormatter.format(selectedPlan.summary.totalFlexibleExpenses)}</span>
                </div>

                {error && <p className="form-error workspace-error" role="alert">{error}</p>}

                <div className="financial-sections">
                  <section className="financial-section" aria-labelledby="income-heading">
                    <div className="financial-heading">
                      <div>
                        <p className="eyebrow">Income</p>
                        <h3 id="income-heading">Expected money in</h3>
                      </div>
                      <span>{currencyFormatter.format(selectedPlan.summary.totalIncome)}</span>
                    </div>

                    <form className="compact-form" onSubmit={(event) => void handleIncomeSubmit(event)}>
                      <div className="field-grid">
                        <label>
                          Source name
                          <input
                            value={incomeForm.name}
                            onChange={(event) => setIncomeForm({ ...incomeForm, name: event.target.value })}
                            placeholder="e.g. Salary"
                            maxLength={120}
                            required
                          />
                        </label>
                        <label>
                          Amount
                          <input
                            type="number"
                            value={incomeForm.amount}
                            onChange={(event) => setIncomeForm({ ...incomeForm, amount: event.target.value })}
                            placeholder="2500"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </label>
                        <label>
                          Expected date <span className="optional">Optional</span>
                          <input
                            type="date"
                            value={incomeForm.expectedDate}
                            onChange={(event) => setIncomeForm({ ...incomeForm, expectedDate: event.target.value })}
                          />
                        </label>
                      </div>
                      <label>
                        Notes <span className="optional">Optional</span>
                        <textarea
                          value={incomeForm.notes}
                          onChange={(event) => setIncomeForm({ ...incomeForm, notes: event.target.value })}
                          placeholder="Useful context for this income source"
                          maxLength={1000}
                          rows={2}
                        />
                      </label>
                      <div className="financial-actions">
                        <button className="button button-primary" type="submit" disabled={savingItem === 'income'}>
                          {savingItem === 'income' ? 'Saving…' : editingIncomeId ? 'Save income' : 'Add income'}
                        </button>
                        {editingIncomeId && (
                          <button className="button button-quiet" type="button" onClick={resetIncomeForm}>Cancel</button>
                        )}
                      </div>
                    </form>

                    <div className="item-list" aria-label="Income sources">
                      {selectedPlan.incomeSources.length === 0 ? (
                        <p className="item-empty">No income sources yet.</p>
                      ) : (
                        selectedPlan.incomeSources.map((incomeSource) => (
                          <article className="item-row" key={incomeSource.id}>
                            <div className="item-main">
                              <strong>{incomeSource.name}</strong>
                              <span>{formatOptionalDate(incomeSource.expectedDate)}</span>
                              {incomeSource.notes && <small>{incomeSource.notes}</small>}
                            </div>
                            <span className="item-amount">{currencyFormatter.format(incomeSource.amount)}</span>
                            <div className="item-actions">
                              <button className="text-button" type="button" onClick={() => beginEditIncome(incomeSource)}>Edit</button>
                              <button
                                className="text-button danger-text"
                                type="button"
                                onClick={() => void deleteFinancialItem('income', incomeSource.id, incomeSource.name)}
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="financial-section" aria-labelledby="expenses-heading">
                    <div className="financial-heading">
                      <div>
                        <p className="eyebrow">Expenses</p>
                        <h3 id="expenses-heading">Planned money out</h3>
                      </div>
                      <span>{currencyFormatter.format(selectedPlan.summary.totalExpenses)}</span>
                    </div>

                    <form className="compact-form" onSubmit={(event) => void handleExpenseSubmit(event)}>
                      <div className="field-grid">
                        <label>
                          Expense name
                          <input
                            value={expenseForm.name}
                            onChange={(event) => setExpenseForm({ ...expenseForm, name: event.target.value })}
                            placeholder="e.g. Rent"
                            maxLength={120}
                            required
                          />
                        </label>
                        <label>
                          Amount
                          <input
                            type="number"
                            value={expenseForm.amount}
                            onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })}
                            placeholder="800"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </label>
                        <label>
                          Category
                          <input
                            value={expenseForm.category}
                            onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}
                            placeholder="Housing"
                            maxLength={80}
                            required
                          />
                        </label>
                        <label>
                          Type
                          <select
                            value={expenseForm.type}
                            onChange={(event) => setExpenseForm({ ...expenseForm, type: event.target.value as ExpenseType })}
                          >
                            <option value="FIXED">Fixed</option>
                            <option value="FLEXIBLE">Flexible</option>
                          </select>
                        </label>
                        <label>
                          Due date <span className="optional">Optional</span>
                          <input
                            type="date"
                            value={expenseForm.dueDate}
                            onChange={(event) => setExpenseForm({ ...expenseForm, dueDate: event.target.value })}
                          />
                        </label>
                      </div>
                      <label>
                        Notes <span className="optional">Optional</span>
                        <textarea
                          value={expenseForm.notes}
                          onChange={(event) => setExpenseForm({ ...expenseForm, notes: event.target.value })}
                          placeholder="Anything useful about this expense"
                          maxLength={1000}
                          rows={2}
                        />
                      </label>
                      <div className="financial-actions">
                        <button className="button button-primary" type="submit" disabled={savingItem === 'expense'}>
                          {savingItem === 'expense' ? 'Saving…' : editingExpenseId ? 'Save expense' : 'Add expense'}
                        </button>
                        {editingExpenseId && (
                          <button className="button button-quiet" type="button" onClick={resetExpenseForm}>Cancel</button>
                        )}
                      </div>
                    </form>

                    <div className="item-list" aria-label="Planned expenses">
                      {selectedPlan.expenses.length === 0 ? (
                        <p className="item-empty">No planned expenses yet.</p>
                      ) : (
                        selectedPlan.expenses.map((expense) => (
                          <article className="item-row" key={expense.id}>
                            <div className="item-main">
                              <strong>{expense.name}</strong>
                              <span>{expense.category} · {formatOptionalDate(expense.dueDate)}</span>
                              <span className={`pill pill-${expense.type.toLowerCase()}`}>{enumLabel(expense.type)}</span>
                              {expense.notes && <small>{expense.notes}</small>}
                            </div>
                            <span className="item-amount">{currencyFormatter.format(expense.amount)}</span>
                            <div className="item-actions">
                              <button className="text-button" type="button" onClick={() => beginEditExpense(expense)}>Edit</button>
                              <button
                                className="text-button danger-text"
                                type="button"
                                onClick={() => void deleteFinancialItem('expense', expense.id, expense.name)}
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="financial-section" aria-labelledby="goals-heading">
                    <div className="financial-heading">
                      <div>
                        <p className="eyebrow">Savings</p>
                        <h3 id="goals-heading">Targets to protect</h3>
                      </div>
                      <span>{currencyFormatter.format(selectedPlan.summary.totalSavingsGoals)}</span>
                    </div>

                    <form className="compact-form" onSubmit={(event) => void handleGoalSubmit(event)}>
                      <div className="field-grid">
                        <label>
                          Goal name
                          <input
                            value={goalForm.name}
                            onChange={(event) => setGoalForm({ ...goalForm, name: event.target.value })}
                            placeholder="e.g. Emergency fund"
                            maxLength={120}
                            required
                          />
                        </label>
                        <label>
                          Target amount
                          <input
                            type="number"
                            value={goalForm.targetAmount}
                            onChange={(event) => setGoalForm({ ...goalForm, targetAmount: event.target.value })}
                            placeholder="500"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </label>
                        <label>
                          Priority <span className="optional">Optional</span>
                          <select
                            value={goalForm.priority}
                            onChange={(event) => setGoalForm({ ...goalForm, priority: event.target.value as Priority | '' })}
                          >
                            <option value="">No priority</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </label>
                      </div>
                      <label>
                        Notes <span className="optional">Optional</span>
                        <textarea
                          value={goalForm.notes}
                          onChange={(event) => setGoalForm({ ...goalForm, notes: event.target.value })}
                          placeholder="Why this target matters"
                          maxLength={1000}
                          rows={2}
                        />
                      </label>
                      <div className="financial-actions">
                        <button className="button button-primary" type="submit" disabled={savingItem === 'goal'}>
                          {savingItem === 'goal' ? 'Saving…' : editingGoalId ? 'Save goal' : 'Add goal'}
                        </button>
                        {editingGoalId && (
                          <button className="button button-quiet" type="button" onClick={resetGoalForm}>Cancel</button>
                        )}
                      </div>
                    </form>

                    <div className="item-list" aria-label="Savings goals">
                      {selectedPlan.savingsGoals.length === 0 ? (
                        <p className="item-empty">No savings goals yet.</p>
                      ) : (
                        selectedPlan.savingsGoals.map((goal) => (
                          <article className="item-row" key={goal.id}>
                            <div className="item-main">
                              <strong>{goal.name}</strong>
                              <span>{goal.priority ? `${enumLabel(goal.priority)} priority` : 'No priority set'}</span>
                              {goal.notes && <small>{goal.notes}</small>}
                            </div>
                            <span className="item-amount">{currencyFormatter.format(goal.targetAmount)}</span>
                            <div className="item-actions">
                              <button className="text-button" type="button" onClick={() => beginEditGoal(goal)}>Edit</button>
                              <button
                                className="text-button danger-text"
                                type="button"
                                onClick={() => void deleteFinancialItem('goal', goal.id, goal.name)}
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
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
