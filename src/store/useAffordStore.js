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

      // Mortgage terms
      housingBudgetPercent: 35,
      interestRate: 5.0,
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
      setHousingBudgetPercent: (v) => set({ housingBudgetPercent: v }),
      setInterestRate: (v) => set({ interestRate: v }),
      setAmortizationYears: (v) => set({ amortizationYears: v }),
      setDownPaymentPercent: (v) => set({ downPaymentPercent: v }),
      setLocationId: (v) => set({ locationId: v }),

      hydrateFromShare: (values) => set(values),
    }),
    {
      name: 'house-afford-v3',
      partialize: (state) => ({
        income1: state.income1,
        income2: state.income2,
        payFrequency1: state.payFrequency1,
        payFrequency2: state.payFrequency2,
        incomeType: state.incomeType,
        savings: state.savings,
        priceOverride: state.priceOverride,
        condoFeesMonthly: state.condoFeesMonthly,
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
