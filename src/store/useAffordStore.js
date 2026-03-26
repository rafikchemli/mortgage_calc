import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAffordStore = create(
  persist(
    (set) => ({
      // Your finances
      income1: 2500,
      income2: 2000,
      payFrequency1: 'biweekly',
      payFrequency2: 'biweekly',
      incomeType: 'net',
      savings: 100000,

      // Optional: check a specific property
      priceOverride: 0, // 0 = use calculated max

      // Condo fees (only relevant when checking a property)
      condoFeesMonthly: 0,

      // Split
      splitMode: 'proportional', // 'proportional' | '50/50' | 'custom' | 'per-person'
      customSplit: 50,
      budgetPercent1: 35,
      budgetPercent2: 35,

      // Mortgage terms
      housingBudgetPercent: 35,
      interestRate: 4.0,
      amortizationYears: 25,
      downPaymentPercent: 20,
      locationId: 'rosemont-la-petite-patrie',

      // Setters
      setIncome1: (v) => set({ income1: v }),
      setIncome2: (v) => set({ income2: v }),
      setPayFrequency1: (v) => set({ payFrequency1: v }),
      setPayFrequency2: (v) => set({ payFrequency2: v }),
      setIncomeType: (v) => set({ incomeType: v }),
      setSavings: (v) => set({ savings: v }),
      setPriceOverride: (v) => set({ priceOverride: v }),
      setCondoFeesMonthly: (v) => set({ condoFeesMonthly: v }),
      setSplitMode: (v) => set({ splitMode: v }),
      setCustomSplit: (v) => set({ customSplit: v }),
      setBudgetPercent1: (v) => set({ budgetPercent1: v }),
      setBudgetPercent2: (v) => set({ budgetPercent2: v }),
      setHousingBudgetPercent: (v) => set({ housingBudgetPercent: v }),
      setInterestRate: (v) => set({ interestRate: v }),
      setAmortizationYears: (v) => set({ amortizationYears: v }),
      setDownPaymentPercent: (v) => set({ downPaymentPercent: v }),
      setLocationId: (v) => set({ locationId: v }),

      // Share
      fromShare: false,
      setFromShare: (v) => set({ fromShare: v }),
      hydrateFromShare: (values) => set({ ...values, fromShare: true }),
    }),
    {
      name: 'house-afford-v4',
      partialize: (state) => ({
        income1: state.income1,
        income2: state.income2,
        payFrequency1: state.payFrequency1,
        payFrequency2: state.payFrequency2,
        incomeType: state.incomeType,
        savings: state.savings,
        priceOverride: state.priceOverride,
        condoFeesMonthly: state.condoFeesMonthly,
        splitMode: state.splitMode,
        customSplit: state.customSplit,
        budgetPercent1: state.budgetPercent1,
        budgetPercent2: state.budgetPercent2,
        housingBudgetPercent: state.housingBudgetPercent,
        interestRate: state.interestRate,
        amortizationYears: state.amortizationYears,
        downPaymentPercent: state.downPaymentPercent,
        locationId: state.locationId,
      }),
    }
  )
)

export default useAffordStore
