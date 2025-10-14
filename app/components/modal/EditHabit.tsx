// app/components/habit/EditHabitModal.tsx
import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HabitForm } from './HabitForm';
import { UpdateHabitRequest, HabitWithCompletion } from '@/types/habit';

interface EditHabitModalProps {
  visible: boolean;
  habit: HabitWithCompletion;
  onClose: () => void;
  onSave: (data: UpdateHabitRequest) => Promise<void>;
  loading?: boolean;
}

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  visible,
  habit,
  onClose,
  onSave,
  loading = false,
}) => {
  const initialData: UpdateHabitRequest = {
    title: habit.title,
    icon: habit.icon,
    description: habit.description,
    category: habit.category,
    target_count: habit.target_count,
    target_unit: habit.target_unit,
    frequency_type: habit.frequency_type,
    frequency_count: habit.frequency_count,
    frequency_days: habit.frequency_days,
    bg_color: habit.bg_color,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <HabitForm
          mode="edit"
          initialData={initialData}
          onSubmit={onSave}
          onCancel={onClose}
          loading={loading}
        />
      </SafeAreaView>
    </Modal>
  );
};