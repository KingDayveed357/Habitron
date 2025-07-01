import { useState, useCallback, useMemo } from 'react';
import ONBOARDING_STEPS from '@/constants/onboarding_steps';

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, any>>({});
  const [selectedHour, setSelectedHour] = useState('07');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [signature, setSignature] = useState('');

  const currentStepData = useMemo(() => 
    ONBOARDING_STEPS.find(step => step.id === currentStep),
    [currentStep]
  );

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleOptionSelect = useCallback((optionId: string, isMultiple: boolean = false) => {
    setSelections(prev => {
      const currentSelections = prev[currentStep] || [];
      
      if (isMultiple) {
        const newSelections = currentSelections.includes(optionId)
          ? currentSelections.filter((id: string) => id !== optionId)
          : [...currentSelections, optionId];
        return { ...prev, [currentStep]: newSelections };
      } else {
        return { ...prev, [currentStep]: [optionId] };
      }
    });
  }, [currentStep]);

  const canContinue = useMemo(() => {
    if (!currentStepData) return false;
    
    const currentSelections = selections[currentStep];
    
    switch (currentStepData.type) {
      case 'single':
      case 'multiple':
        return currentSelections && currentSelections.length > 0;
      case 'time':
        return selectedHour && selectedMinute;
      case 'input':
        return signature.length > 0;
      default:
        return false;
    }
  }, [currentStepData, selections, currentStep, selectedHour, selectedMinute, signature]);

  return {
    currentStep,
    currentStepData,
    selections,
    selectedHour,
    selectedMinute,
    signature,
    canContinue,
    setCurrentStep,
    setSelectedHour,
    setSelectedMinute,
    setSignature,
    handleBack,
    handleOptionSelect,
  };
};