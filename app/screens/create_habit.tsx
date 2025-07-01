import React, { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View, Modal, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CheckIcon } from 'lucide-react-native';

const ICONS = ['🏃', '📚', '🧘', '🏀', '🎨', '🎮', '🎧', '💻', '📷', '🎵'];
const COLORS = ['#F28B82', '#FBBC04', '#FFF475', '#CCFF90', '#A7FFEB', '#CBF0F8', '#AECBFA', '#D7AEFB', '#FDCFE8'];

// Extended emoji collection
const ALL_EMOJIS = [
  // Face emojis
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  
  // Activity & Sports
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
  '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🤿',
  '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂',
  
  // Health & Fitness
  '🏃‍♂️', '🏃‍♀️', '🚶‍♂️', '🚶‍♀️', '🧘‍♂️', '🧘‍♀️', '🏋️‍♂️', '🏋️‍♀️', '💪', '🦵',
  
  // Food & Drink
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍅', '🥥',
  '🥑', '🍆', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅',
  '🥛', '🍵', '☕', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷',
  
  // Study & Learning
  '📚', '📖', '📝', '✏️', '✒️', '🖊️', '🖋️', '🖍️', '📄', '📃',
  '📑', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🖇️', '📏',
  '📐', '✂️', '🗃️', '🗄️', '🗂️', '📂', '📁', '📰', '🔍', '🔎',
  
  // Technology
  '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀', '☎️', '📞',
  '📱', '📲', '☎️', '📧', '📨', '📩', '📤', '📥', '📮', '🗳️',
  
  // Music & Art
  '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻',
  '🎨', '🖌️', '🖍️', '🎭', '🩰', '🎪', '🎬', '🎤', '🎧', '🎮',
  
  // Time & Calendar
  '⏰', '⏲️', '⏱️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖',
  '📅', '📆', '🗓️', '📋', '📌', '📍', '🔔', '🔕', '📢', '📣',
  
  // Weather & Nature
  '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
  '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌊', '💧', '💦', '☔',
  
  // Transport
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '🚚', '🚛', '🚜', '🚲', '🛴', '🛵', '🏍️', '✈️', '🛩️', '🚁',
  
  // Hearts & Symbols
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  
  // Stars & Celebration
  '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂',
  '🍰', '🧁', '🥳', '🎆', '🎇', '🌠', '💥', '💢', '💯', '🔥'
];

// Functional icons (more app-like icons)
const FUNCTIONAL_ICONS = [
  // Productivity & Work
  '📊', '📈', '📉', '💼', '💻', '📋', '✅', '📝', '🗓️', '⏰',
  '📌', '📎', '🗂️', '📁', '💾', '🖨️', '📧', '📞', '📱', '💡',
  
  // Health & Fitness
  '🏥', '💊', '🩺', '🌡️', '💉', '🦷', '👁️', '🫀', '🫁', '🧠',
  '💪', '🏃', '🚴', '🏊', '🤸', '🧘', '🛌', '🥗', '🥛', '💧',
  
  // Education & Learning
  '🎓', '📚', '📖', '✏️', '📐', '🧮', '🔬', '🔭', '🗺️', '🌍',
  '🎨', '🖌️', '🎭', '🎪', '🎬', '📹', '📷', '🎤', '🎧', '🎵',
  
  // Home & Living
  '🏠', '🏡', '🛏️', '🛋️', '🪑', '🚿', '🛁', '🧹', '🧽', '🗑️',
  '🔑', '🚪', '🪟', '💡', '🔌', '📺', '📻', '☎️', '🕯️', '🧯',
  
  // Food & Cooking
  '🍳', '🥘', '🍲', '🥗', '🍝', '🍜', '🥙', '🌮', '🌯', '🥪',
  '🔪', '🥄', '🍴', '🥢', '🧂', '📦', '🥫', '🍯', '🧈', '🥛',
  
  // Transport & Travel
  '✈️', '🚗', '🚌', '🚇', '🚲', '🛴', '🗺️', '🧳', '🎒', '📍',
  '🧭', '⛽', '🚦', '🚧', '🏨', '🏪', '🏬', '🏦', '🏛️', '⛪',
  
  // Money & Shopping
  '💰', '💳', '💎', '🏦', '🏪', '🛒', '🛍️', '💸', '📊', '📈',
  '💵', '💴', '💶', '💷', '🪙', '🧾', '💻', '📱', '⌚', '👑',
  
  // Communication & Social
  '📧', '💬', '💭', '🗨️', '🗯️', '💌', '📮', '📪', '📫', '📬',
  '📭', '📯', '📢', '📣', '🔔', '🔕', '📞', '☎️', '📱', '📲',
  
  // Weather & Environment
  '🌱', '🌿', '🍃', '🌳', '🌲', '🌴', '🌵', '🌾', '🌷', '🌸',
  '🌺', '🌻', '🌹', '🥀', '🌼', '🌽', '🍄', '🌰', '🐝', '🦋',
  
  // Security & Safety
  '🔒', '🔓', '🔐', '🗝️', '🔑', '🛡️', '⚠️', '🚨', '🚥', '🔦',
  '🧯', '⛑️', '🦺', '🎯', '🏹', '⚔️', '🔫', '💣', '🧨', '🔪'
];

const CreateHabit = () => {
   const [selectedFrequency, setSelectedFrequency] = useState('Daily');
  const [dailyDays, setDailyDays] = useState<string[]>([]);
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [monthlyDays, setMonthlyDays] = useState<number[]>([]);
  const [allDaysSelected, setAllDaysSelected] = useState(false);

  const frequencies = ['Daily', 'Weekly', 'Monthly'];
  const weekLabels = ['SU', 'M', 'TU', 'W', 'TH', 'F', 'SA'];

  const toggleDailyDay = (day: string) => {
    if (dailyDays.includes(day)) {
      setDailyDays(dailyDays.filter(d => d !== day));
    } else {
      setDailyDays([...dailyDays, day]);
    }
  };

  const toggleAllDays = () => {
    if (allDaysSelected) {
      setDailyDays([]);
    } else {
      setDailyDays(['SU', 'M', 'TU', 'W', 'TH', 'F', 'SA']);
    }
    setAllDaysSelected(!allDaysSelected);
  };

  const toggleMonthlyDay = (day: number) => {
    if (monthlyDays.includes(day)) {
      setMonthlyDays(monthlyDays.filter(d => d !== day));
    } else {
      setMonthlyDays([...monthlyDays, day]);
    }
  };

  


  const [habitText, setHabitText] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('')
  // const [reminderTime, setReminderTime] = useState('09:00 AM')
    const [reminderTime, setReminderTime] = useState(new Date())
  const [showTimePicker, setShowTimePicker] = useState(false)

  const [aiFeatures, setAiFeatures] = useState({
    smartReminder: true,
    motivationalMessages: true,
    weeklyOptimization: true
  })

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTab, setModalTab] = useState('Emoji'); // 'Emoji' or 'Icon'

  
  const categories = [
    { name: 'Health & Fitness', icon: '🏃' },
    { name: 'Mindfulness', icon: '🧘' },
    { name: 'Learning', icon: '📚' },
    { name: 'Productivity', icon: '📊' }
  ]
  const suggestions = [
    'Drink 8 glasses of water',
    'Read for 30 minutes',
    'Exercise for 20 minutes',
    'Meditate for 10 minutes'
  ]

  const handleIconSelect = (icon: any) => {
    setSelectedIcon(icon);
    setIsModalVisible(false);
  };

    const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Keep picker open on iOS
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  return (
    <ScrollView 
      className='app-background' 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
    >
      <View className='mx-5'>
        {/* Header */}
   
        {/* AI Suggestions */}
        <View className='bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-4 mb-6'>
          <View className='flex-row items-center mb-2'>
            <Text className='text-2xl mr-2'>🤖</Text>
            <Text className='text-subheading'>AI Suggestions</Text>
          </View>
          <Text className='text-body mb-4'>
            Based on your goals and current habits, here are some recommendations:
          </Text>
          <View className='flex-row flex-wrap gap-2'>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity 
                key={index}
                className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-900 rounded-full px-4 py-2'
                onPress={() => setHabitText(suggestion)}
              >
                <Text className='text-sm text-body'>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* What habit would you like to build? */}
        <View className='mb-6'>
          <Text className='text-label text-lg mb-2'>
            What habit would you like to build?
          </Text>
          <TextInput
            className='bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-4 text-base'
            placeholder='e.g., Drink 8 glasses of water'
            value={habitText}
             placeholderTextColor="#888"
            onChangeText={setHabitText}
            multiline
          />
        </View>

        {/* Category */}
        {/* <View className='mb-6'>
          <Text className='text-label text-lg mb-3'>Category</Text>
          <View className='flex-row flex-wrap gap-3'>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center px-4 py-3 rounded-xl border ${
                  selectedCategory === category.name 
                    ? 'bg-blue-100  dark:bg-indigo-500' 
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-800'
                }`}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text className='text-lg mr-2'>{category.icon}</Text>
                <Text className='text-sm font-medium text-body'>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Choose Icon */}
        <View className='mb-6'>
          <View className='flex-row items-center justify-between mb-3'>
            <Text className='text-label text-lg'>Choose an Icon</Text>
            <TouchableOpacity 
              className='px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full'
              onPress={() => setIsModalVisible(true)}
            >
              <Text className='text-sm text-blue-600 dark:text-blue-300'>View All</Text>
            </TouchableOpacity>
          </View>
          <View className='flex-row flex-wrap gap-3'>
            {ICONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                className={`w-12 h-12 rounded-xl justify-center items-center border ${
                  selectedIcon === icon 
                    ? 'bg-indigo-100 dark:bg-indigo-500 border-indigo-300' 
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-200'
                }`}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text className='text-xl'>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Choose Background Color */}
        <View className='mb-6'>
          <Text className='text-label text-lg mb-3'>Choose Color</Text>
          <View className='flex-row flex-wrap gap-3'>
            {COLORS.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={{ backgroundColor: color }}
                className={`w-10 h-10 rounded-full border-2 ${
                  selectedColor === color ? 'border-black dark:border-white' : 'border-transparent'
                }`}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>


  <View className="mb-6">
        <Text className="text-label text-lg mb-3">Frequency</Text>
        <View className="flex-row flex-wrap gap-3">
          {frequencies.map((frequency, index) => (
            <TouchableOpacity
              key={index}
              className={`px-6 py-3 rounded-xl border ${
                selectedFrequency === frequency
                  ? 'bg-indigo-500'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-800'
              }`}
              onPress={() => {
                setSelectedFrequency(frequency);
                setDailyDays([]);
                setAllDaysSelected(false);
                setWeeklyCount(0);
                setMonthlyDays([]);
                
              }}
            >
              <Text className="text-sm">{frequency}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* On These Days - Daily */}
      {selectedFrequency === 'Daily' && (
        <View className="mb-6">
          <View className='flex flex-row justify-between'> 
            <Text className="text-label text-lg mb-3">On these day</Text> 
            <TouchableOpacity onPress={toggleAllDays} className="flex flex-row gap-2 my-auto mb-3" > 
              <Text className="text-body">All day</Text> 
              <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${allDaysSelected ? 'bg-primary' : 'border-gray-400'}`}> 
                {allDaysSelected && <CheckIcon size={14} color="#fff" />} 
                </View> 
                </TouchableOpacity>
                 </View>
          <View className="flex-row flex-wrap gap-3">
            {weekLabels.map((day) => (
              <TouchableOpacity
                key={day}
                className={`w-12 h-12 items-center justify-center rounded-full border ${
                  dailyDays.includes(day)
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                }`}
                onPress={() => toggleDailyDay(day)}
              >
                <Text className="text-sm text-white dark:text-white">{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Weekly Frequency - How many times */}
      {selectedFrequency === 'Weekly' && (
        <View className="mb-6">
          <Text className="text-label text-lg mb-3">How many times per week?</Text>
          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((count) => (
              <TouchableOpacity
                key={count}
                className={`w-12 h-12 items-center justify-center rounded-full border ${
                  weeklyCount === count
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                }`}
                onPress={() => setWeeklyCount(count)}
              >
                <Text className="text-sm text-white dark:text-white">{count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Monthly Frequency - Calendar */}
      {selectedFrequency === 'Monthly' && (
        <View className="mb-6">
          <Text className="text-label text-lg mb-3">Select Days in the Month</Text>
          <View className="flex-row flex-wrap gap-3">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                className={`w-12 h-12 items-center justify-center rounded-full border ${
                  monthlyDays.includes(day)
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                }`}
                onPress={() => toggleMonthlyDay(day)}
              >
                <Text className="text-body">{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {monthlyDays.length > 0 && (
            <Text className="mt-3 text-sm text-body">
              Every Month on {monthlyDays.sort((a, b) => a - b).join(', ')}
            </Text>
          )}
        </View>
      )}



      {/* Reminder Time */}
        <View className='mb-6'>
          <Text className='text-label text-lg  mb-3'>Reminder Time</Text>
          <TouchableOpacity 
            className='bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex-row items-center'
            onPress={showTimepicker}
          >
            <Text className='text-2xl mr-3'>🕘</Text>
            <Text className='text-body'>{formatTime(reminderTime)}</Text>
            <View className='ml-auto'>
              <Text className='text-2xl text-gray-400'>⏰</Text>
            </View>
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              style={Platform.OS === 'ios' ? { height: 120, marginTop: -10 } : {}}
              textColor="#000000" // For Android
              themeVariant="light" // For iOS
            />
          )}
        </View>

        {/* AI Coaching Features */}
        <View className='bg-green-50 border border-green-200 rounded-2xl p-4 mb-6'>
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-lg font-semibold text-gray-900'>AI Coaching Features</Text>
            <View className='bg-green-100 px-3 py-1 rounded-full'>
              <Text className='text-xs font-medium text-green-700'>Recommended</Text>
            </View>
          </View>
          
          <View className='space-y-3'>
            <TouchableOpacity 
              className='flex-row items-center mb-3'
              onPress={() => setAiFeatures({...aiFeatures, smartReminder: !aiFeatures.smartReminder})}
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                aiFeatures.smartReminder ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
              }`}>
                {aiFeatures.smartReminder && (
                  <Text className='text-white text-xs'>✓</Text>
                )}
              </View>
              <Text className='text-sm text-gray-700 flex-1'>Smart reminder timing based on my schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className='flex-row items-center mb-3'
              onPress={() => setAiFeatures({...aiFeatures, motivationalMessages: !aiFeatures.motivationalMessages})}
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                aiFeatures.motivationalMessages ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
              }`}>
                {aiFeatures.motivationalMessages && (
                  <Text className='text-white text-xs'>✓</Text>
                )}
              </View>
              <Text className='text-sm text-gray-700 flex-1'>Motivational coaching messages</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className='flex-row items-center'
              onPress={() => setAiFeatures({...aiFeatures, weeklyOptimization: !aiFeatures.weeklyOptimization})}
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                aiFeatures.weeklyOptimization ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
              }`}>
                {aiFeatures.weeklyOptimization && (
                  <Text className='text-white text-xs'>✓</Text>
                )}
              </View>
              <Text className='text-sm text-gray-700 flex-1'>Weekly habit optimization suggestions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className='flex-row gap-3'>
          <TouchableOpacity className='flex-1 bg-gray-200 rounded-xl py-4'>
            <Text className='text-center text-base font-medium text-gray-700'>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 btn-primary py-4'>
            <Text className='text-center text-base font-medium text-white'>Create Habit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Icon/Emoji Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className='flex-1 bg-white dark:bg-gray-900'>
          {/* Modal Header */}
          <View className='px-5 py-4 border-b border-gray-200 dark:border-gray-700'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-xl font-semibold text-gray-900 dark:text-white'>Choose Icon</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className='text-lg text-gray-500'>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Tab Selector */}
            <View className='flex-row mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1'>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${
                  modalTab === 'Emoji' 
                    ? 'bg-indigo-500' 
                    : 'bg-transparent'
                }`}
                onPress={() => setModalTab('Emoji')}
              >
                <Text className={`text-center font-medium ${
                  modalTab === 'Emoji' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  Emoji
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${
                  modalTab === 'Icon' 
                    ? 'bg-indigo-500' 
                    : 'bg-transparent'
                }`}
                onPress={() => setModalTab('Icon')}
              >
                <Text className={`text-center font-medium ${
                  modalTab === 'Icon' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  Icon
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Icons/Emojis Grid */}
          <ScrollView className='flex-1 px-5' contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}>
            <View className='flex-row flex-wrap justify-between'>
              {(modalTab === 'Emoji' ? ALL_EMOJIS : FUNCTIONAL_ICONS).map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  className={`w-12 h-12 rounded-xl justify-center items-center border mb-3 ${
                    selectedIcon === icon 
                      ? 'bg-indigo-100 dark:bg-indigo-500 border-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                  onPress={() => handleIconSelect(icon)}
                >
                  <Text className='text-xl'>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View className='px-5 py-4 border-t border-gray-200 dark:border-gray-700'>
            <View className='flex-row gap-3'>
              <TouchableOpacity 
                className='flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3'
                onPress={() => setIsModalVisible(false)}
              >
                <Text className='text-center text-base font-medium text-gray-700 dark:text-gray-300'>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className='flex-1 bg-indigo-500 rounded-xl py-3'
                onPress={() => setIsModalVisible(false)}
              >
                <Text className='text-center text-base font-medium text-white'>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default CreateHabit