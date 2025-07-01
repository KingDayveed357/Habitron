import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressBar from '../components/ui/Progessbar';
import TimePickerGrid from '../components/ui/TimePickerGrid';
import OptionButton from '../components/ui/OptionButton';
import ONBOARDING_STEPS from '@/constants/onboarding_steps';
import SignatureCanvas from '../components/ui/Signature';

const PostSignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, any>>({});
  // const [selectedHour, setSelectedHour] = useState('09');
  // const [selectedMinute, setSelectedMinute] = useState('00');
   const [timeSelections, setTimeSelections] = useState<Record<number, { hour: string; minute: string }>>({});
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = ONBOARDING_STEPS.length;
  const currentStepData = ONBOARDING_STEPS[currentStep - 1]; 

  const currentTime = timeSelections[currentStep] || { hour: '', minute: '' };

  // Check if user can continue based on current step
 const canContinue = (): boolean => {
    if (!currentStepData) return false;
    switch (currentStepData.type) {
      case 'time':
        return currentTime.hour !== '' && currentTime.minute !== '';
      case 'single':
      case 'multiple':
        return selections[currentStep]?.length > 0;
      case 'contract':
        return !!signature
      default:
        return true;
    }
  };


   const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = async () => {
    if (!canContinue()) {
      Alert.alert('Selection Required', 'Please make a selection before continuing.');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save onboarding data and navigate
      setIsLoading(true);
      try {
        // Save onboarding completion
        await AsyncStorage.setItem('hasOnboarded', 'true');
        
        // Save user preferences/selections
    await AsyncStorage.setItem('onboardingData', JSON.stringify({
          selections,
          timeSelections,
          signature,
          completedAt: new Date().toISOString()
        }));

        // Navigate to sign in or main app
        router.replace('/auth/signin'); 
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOptionSelect = (optionId: string, isMultiple: boolean) => {
    setSelections(prev => {
      const currentSelections = prev[currentStep] || [];
      
      if (isMultiple) {
        // Toggle selection for multiple choice
        const newSelections = currentSelections.includes(optionId)
          ? currentSelections.filter((id: string) => id !== optionId)
          : [...currentSelections, optionId];
        
        return {
          ...prev,
          [currentStep]: newSelections
        };
      } else {
        // Single selection
        return {
          ...prev,
          [currentStep]: [optionId]
        };
      }
    });
  };
  
   const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    setTimeSelections(prev => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        [type]: value
      }
    }));
  };

  const handleSignatureChange = (signatureData: string) => {
    setSignature(signatureData);
  }

  // Show loading if step data is not available
  if (!currentStepData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading onboarding step...</Text>
          <Text className="text-xs text-gray-400 mt-2">
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="app-background pt-5 ">
      
      {/* {currentStep > 1 && <BackButton onPress={handleBack} />} */}

     <ProgressBar current={currentStep} total={totalSteps} onBack={handleBack} />



      <ScrollView className="flex-1 px-6">
        {/* Title and Subtitle */}
        <View className="mb-8 ">
          <Text className="text-3xl text-center font-bold text-heading mb-4">
            {currentStepData.title}
          </Text>
          <Text className="text-subheading text-center">
            {currentStepData.subtitle}
          </Text>
        </View>

        {/* Content based on step type */}
           {currentStepData.type === 'time' && (
          <TimePickerGrid
            selectedHour={currentTime.hour || '09'}
            selectedMinute={currentTime.minute || '00'}
            onHourChange={(val) => handleTimeChange('hour', val)}
            onMinuteChange={(val) => handleTimeChange('minute', val)}
          />
        )}

        {(currentStepData.type === 'single' || currentStepData.type === 'multiple') && (
          <View className="space-y-3">
            {currentStepData.options?.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={selections[currentStep]?.includes(option.id) || false}
                onPress={() => handleOptionSelect(option.id, currentStepData.type === 'multiple')}
                isMultiple={currentStepData.type === 'multiple'}
              />
            ))}
          </View>
        )}

        {/* Contract/Signature step */}
        {currentStepData.type === 'contract' && (
          <SignatureCanvas
            onSignatureChange={handleSignatureChange}
            signature={signature}
          />
        )}

        {/* Add other step types here */}
      </ScrollView>

      {/* Continue Button */}
      <View className="p-6 border-t dark:border-t-slate-700 border-t-gray-200">
     <TouchableOpacity
  onPress={handleContinue}
  disabled={!canContinue() || isLoading}
  className={`rounded-xl py-4 ${canContinue() && !isLoading ? 'btn-primary' : 'bg-gray-50 dark:bg-gray-800'}`}
>
  <Text
    className={`text-center font-semibold text-lg ${
      canContinue() && !isLoading ? 'text-btn-primary-text' : 'text-gray-500'
    }`}
  >
    {isLoading ? 'Saving...' : currentStep === totalSteps ? 'Finish' : 'Continue'}
  </Text>
</TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default PostSignUp;