// app/components/habit/EditHabitModal.tsx - FIXED VERSION
import React from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitForm } from './HabitForm';
import { UpdateHabitRequest, HabitWithCompletion } from '@/types/habit';
import { HabitReminder } from '@/services/notificationService';

interface EditHabitModalProps {
  visible: boolean;
  habit: HabitWithCompletion;
  onClose: () => void;
  onSave: (data: UpdateHabitRequest, reminders?: HabitReminder[]) => Promise<void>;
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
    id: habit.id,
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

  // CRITICAL FIX: Handle reminders in onSave
  const handleSave = async (
    data: UpdateHabitRequest,
    reminders?: HabitReminder[]
  ) => {
    console.log('📝 Saving habit with reminders:', reminders);
    
    // Convert HabitReminder[] to the format expected by updateHabit
    const reminderData = reminders?.map(r => ({
      time: r.time,
      days: r.days,
      enabled: r.enabled
    }));

    await onSave(data, reminderData as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView 
        className="flex-1 bg-white dark:bg-gray-900"
        edges={['top', 'bottom', 'left', 'right']}
      >
        <HabitForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSave}
          onCancel={onClose}
          loading={loading}
        />
      </SafeAreaView>
    </Modal>
  );
};