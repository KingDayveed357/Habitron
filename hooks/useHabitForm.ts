// hooks/useHabitForm.ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { CreateHabitRequest, UpdateHabitRequest, HABIT_CATEGORIES } from '@/types/habit';

const weekLabels = ['SU', 'M', 'TU', 'W', 'TH', 'F', 'SA'];

interface UseHabitFormProps {
  initialData?: Partial<CreateHabitRequest>;
  onSubmit: (data: CreateHabitRequest | UpdateHabitRequest) => Promise<void>;
}

export const useHabitForm = ({ initialData, onSubmit }: UseHabitFormProps) => {
  // Form data
  const [formData, setFormData] = useState<CreateHabitRequest>({
    title: initialData?.title || '',
    icon: initialData?.icon || '⭐',
    description: initialData?.description || '',
    category: initialData?.category || 'General',
    target_count: initialData?.target_count || 1,
    target_unit: initialData?.target_unit || 'times',
    frequency_type: initialData?.frequency_type || 'daily',
    frequency_count: initialData?.frequency_count || null,
    frequency_days: initialData?.frequency_days || null,
    bg_color: initialData?.bg_color || 'bg-blue-500',
  });

  // Validation errors
  const [errors, setErrors] = useState<Partial<CreateHabitRequest>>({});

  // Icon modal
  const [isIconModalVisible, setIsIconModalVisible] = useState(false);
  const [iconModalTab, setIconModalTab] = useState<'Emoji' | 'Icon'>('Emoji');

  // Categories
  const [categories, setCategories] = useState<string[]>(() => [...HABIT_CATEGORIES]);
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Frequency states
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.frequency_type === 'daily' && Array.isArray(initialData.frequency_days)
      ? (initialData.frequency_days as string[])
      : []
  );
  const [weeklyCount, setWeeklyCount] = useState(
    initialData?.frequency_type === 'weekly' ? (initialData.frequency_count || 1) : 1
  );
  const [monthlyDays, setMonthlyDays] = useState<number[]>(
    initialData?.frequency_type === 'monthly' && Array.isArray(initialData.frequency_days)
      ? (initialData.frequency_days as number[])
      : []
  );
  const [allDaysSelected, setAllDaysSelected] = useState(selectedDays.length === 7);

  // Update single field
  const updateField = useCallback(<K extends keyof CreateHabitRequest>(
    field: K,
    value: CreateHabitRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Reset frequency settings when changing type
    if (field === 'frequency_type') {
      setSelectedDays([]);
      setWeeklyCount(1);
      setMonthlyDays([]);
      setAllDaysSelected(false);
    }
  }, [errors]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<CreateHabitRequest> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Habit name is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Habit name must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Habit name must be less than 100 characters';
    }

    if (formData.target_count < 1) {
      newErrors.target_count = 'Target must be at least 1' as any;
    } else if (formData.target_count > 100) {
      newErrors.target_count = 'Target cannot exceed 100' as any;
    }

    if (!formData.target_unit.trim()) {
      newErrors.target_unit = 'Unit is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate frequency settings
    if (formData.frequency_type === 'daily' && selectedDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one day for daily frequency');
      return false;
    }

    if (formData.frequency_type === 'weekly' && weeklyCount < 1) {
      Alert.alert('Validation Error', 'Please select how many times per week');
      return false;
    }

    if (formData.frequency_type === 'monthly' && monthlyDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one day for monthly frequency');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedDays, weeklyCount, monthlyDays]);

  // Handle submission
  const handleSubmit = useCallback(async (validate: () => boolean) => {
    if (!validate()) return;

    // Prepare frequency data based on frequency type
    let frequencyData: Partial<CreateHabitRequest> = {
      frequency_type: formData.frequency_type,
      frequency_count: null,
      frequency_days: null,
    };

    if (formData.frequency_type === 'daily') {
      frequencyData.frequency_days = selectedDays.length > 0 ? selectedDays : null;
    } else if (formData.frequency_type === 'weekly') {
      frequencyData.frequency_count = weeklyCount;
    } else if (formData.frequency_type === 'monthly') {
      frequencyData.frequency_days = monthlyDays.length > 0 ? monthlyDays.sort((a, b) => a - b) : null;
    }

    const habitData: CreateHabitRequest = {
      ...formData,
      ...frequencyData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      target_unit: formData.target_unit.trim(),
    };

    await onSubmit(habitData);
  }, [formData, selectedDays, weeklyCount, monthlyDays, onSubmit]);

  // Daily frequency handlers
  const toggleDailyDay = useCallback((day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    setSelectedDays(newDays);
    setAllDaysSelected(newDays.length === 7);
  }, [selectedDays]);

  const toggleAllDays = useCallback(() => {
    if (allDaysSelected) {
      setSelectedDays([]);
    } else {
      setSelectedDays([...weekLabels]);
    }
    setAllDaysSelected(!allDaysSelected);
  }, [allDaysSelected]);

  // Monthly frequency handler
  const toggleMonthlyDay = useCallback((day: number) => {
    const newDays = monthlyDays.includes(day)
      ? monthlyDays.filter((d) => d !== day)
      : [...monthlyDays, day];

    setMonthlyDays(newDays);
  }, [monthlyDays]);

  // Category handlers
  const addCustomCategory = useCallback(() => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      const newCategories = [...categories, customCategory.trim()];
      setCategories(newCategories);
      updateField('category', customCategory.trim() as any);
      setCustomCategory('');
      setIsAddingCategory(false);
    }
  }, [customCategory, categories, updateField]);

  return {
    // Form data
    formData,
    errors,
    updateField,
    validateForm,
    handleSubmit,

    // Icon modal
    isIconModalVisible,
    setIsIconModalVisible,
    iconModalTab,
    setIconModalTab,

    // Categories
    categories,
    customCategory,
    isAddingCategory,
    setCustomCategory,
    setIsAddingCategory,
    addCustomCategory,

    // Frequency
    selectedDays,
    weeklyCount,
    monthlyDays,
    allDaysSelected,
    toggleDailyDay,
    toggleAllDays,
    toggleMonthlyDay,
    setWeeklyCount,
  };
};