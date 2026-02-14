import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAffordStore = create(
  persist(
    (set) => ({
      income1: 2500,
      income2: 2000,
      payFrequency: 'biweekly',
      incomeType: 'net',
      housingPercent1: 35,
      housingPercent2: 35,
      downPaymentPercent: 20,
      interestRate: 5.0,
      amortizationYears: 25,

      setIncome1: (v) => set({ income1: v }),
      setIncome2: (v) => set({ income2: v }),
      setPayFrequency: (v) => set({ payFrequency: v }),
      setIncomeType: (v) => set({ incomeType: v }),
      setHousingPercent1: (v) => set({ housingPercent1: v }),
      setHousingPercent2: (v) => set({ housingPercent2: v }),
      setDownPaymentPercent: (v) => set({ downPaymentPercent: v }),
      setInterestRate: (v) => set({ interestRate: v }),
      setAmortizationYears: (v) => set({ amortizationYears: v }),
    }),
    {
      name: 'house-afford-income',
      partialize: (state) => ({
        income1: state.income1,
        income2: state.income2,
        payFrequency: state.payFrequency,
        incomeType: state.incomeType,
        housingPercent1: state.housingPercent1,
        housingPercent2: state.housingPercent2,
        downPaymentPercent: state.downPaymentPercent,
        interestRate: state.interestRate,
        amortizationYears: state.amortizationYears,
      }),
    }
  )
)

export default useAffordStore
