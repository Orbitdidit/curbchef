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
};

export function AssistantProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [open, setOpen] = useState(false);

  const setAnswer = (key, value) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [key]: value },
      step: prev.step + 1,
    }));
  };

  const goBack = () => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
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