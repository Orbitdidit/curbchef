import React, { createContext, useContext, useState } from 'react';

const AssistantContext = createContext();

const INITIAL_STATE = {
  step: 0, // 0=craving, 1=spice, 2=budget, 3=distance, 4=mealType, 5=results
  answers: {
    craving: null,
    spice: null,
    budget: null,
    distance: null,
    mealType: null,
  },
  results: null,
  loading: false,
  spiceSkipped: false,
};

export function AssistantProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [open, setOpen] = useState(false);

  // Cravings where a heat question makes no sense. Add or remove freely.
  const NO_SPICE = ['sweet', 'healthy'];

  const setAnswer = (key, value) => {
    setState(prev => {
      // Picking a craving that has no heat dimension auto-skips the spice step.
      if (key === 'craving' && NO_SPICE.includes(value)) {
        return {
          ...prev,
          answers: { ...prev.answers, craving: value, spice: 'any' },
          spiceSkipped: true,
          step: 2,
        };
      }
      return {
        ...prev,
        answers: { ...prev.answers, [key]: value },
        spiceSkipped: key === 'craving' ? false : prev.spiceSkipped,
        step: prev.step + 1,
      };
    });
  };

  const goBack = () => {
    setState(prev => ({
      ...prev,
      step: prev.step === 2 && prev.spiceSkipped ? 0 : Math.max(0, prev.step - 1),
    }));
  };

  const reset = () => setState(INITIAL_STATE);

  const setResults = (results) => {
    setState(prev => ({ ...prev, results, loading: false, step: 5 }));
  };

  const setLoading = (loading) => {
    setState(prev => ({ ...prev, loading }));
  };

  return (
    <AssistantContext.Provider value={{ state, open, setOpen, setAnswer, goBack, reset, setResults, setLoading }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  return useContext(AssistantContext);
}