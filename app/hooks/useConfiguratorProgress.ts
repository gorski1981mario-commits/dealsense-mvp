import { create } from 'zustand'

interface FieldValidation {
  fieldName: string
  isValid: boolean
  isTouched: boolean
  errorMessage?: string
}

interface ConfiguratorProgressState {
  // Per-configurator state (keyed by configurator ID)
  touchedFields: Record<string, Set<string>>
  validFields: Record<string, Set<string>>
  fieldValues: Record<string, Record<string, any>>
  
  // Actions
  markFieldTouched: (configuratorId: string, fieldName: string) => void
  markFieldValid: (configuratorId: string, fieldName: string, isValid: boolean) => void
  setFieldValue: (configuratorId: string, fieldName: string, value: any) => void
  resetConfigurator: (configuratorId: string) => void
  
  // Getters
  getProgress: (configuratorId: string, totalFields: number) => number
  isAllValid: (configuratorId: string, totalFields: number) => boolean
  isSectionComplete: (configuratorId: string, fieldNames: string[]) => boolean
}

export const useConfiguratorProgress = create<ConfiguratorProgressState>((set, get) => ({
  touchedFields: {},
  validFields: {},
  fieldValues: {},
  
  markFieldTouched: (configuratorId, fieldName) => {
    set((state) => {
      const touched = state.touchedFields[configuratorId] || new Set()
      touched.add(fieldName)
      return {
        touchedFields: {
          ...state.touchedFields,
          [configuratorId]: touched
        }
      }
    })
  },
  
  markFieldValid: (configuratorId, fieldName, isValid) => {
    set((state) => {
      const valid = state.validFields[configuratorId] || new Set()
      if (isValid) {
        valid.add(fieldName)
      } else {
        valid.delete(fieldName)
      }
      return {
        validFields: {
          ...state.validFields,
          [configuratorId]: valid
        }
      }
    })
  },
  
  setFieldValue: (configuratorId, fieldName, value) => {
    set((state) => ({
      fieldValues: {
        ...state.fieldValues,
        [configuratorId]: {
          ...(state.fieldValues[configuratorId] || {}),
          [fieldName]: value
        }
      }
    }))
  },
  
  resetConfigurator: (configuratorId) => {
    set((state) => {
      const newTouched = { ...state.touchedFields }
      const newValid = { ...state.validFields }
      const newValues = { ...state.fieldValues }
      
      delete newTouched[configuratorId]
      delete newValid[configuratorId]
      delete newValues[configuratorId]
      
      return {
        touchedFields: newTouched,
        validFields: newValid,
        fieldValues: newValues
      }
    })
  },
  
  getProgress: (configuratorId, totalFields) => {
    const state = get()
    const validCount = (state.validFields[configuratorId] || new Set()).size
    return Math.round((validCount / totalFields) * 100)
  },
  
  isAllValid: (configuratorId, totalFields) => {
    const state = get()
    const validCount = (state.validFields[configuratorId] || new Set()).size
    return validCount === totalFields
  },
  
  isSectionComplete: (configuratorId, fieldNames) => {
    const state = get()
    const valid = state.validFields[configuratorId] || new Set()
    return fieldNames.every(name => valid.has(name))
  }
}))

