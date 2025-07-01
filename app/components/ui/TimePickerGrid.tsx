import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  TextStyle
} from 'react-native';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 7;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const TimePickerGrid: React.FC<{
  selectedHour: string;
  selectedMinute: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
}> = ({ selectedHour, selectedMinute, onHourChange, onMinuteChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const scrollToIndex = (scrollRef: any, index: number) => {
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  // Fixed: Added selectedHour and selectedMinute as dependencies
  useEffect(() => {
    const hourIndex = hours.indexOf(selectedHour);
    const minuteIndex = minutes.indexOf(selectedMinute);
    scrollToIndex(hourScrollRef, hourIndex);
    scrollToIndex(minuteScrollRef, minuteIndex);
  }, [selectedHour, selectedMinute]); // This is the key fix!

  const getStyle = (index: number, selectedIndex: number): TextStyle => {
    const distance = Math.abs(index - selectedIndex);
    const maxFontSize = 28;
    const minFontSize = 16;

    return {
      fontSize: Math.max(maxFontSize - distance * 4, minFontSize),
      opacity: Math.max(1 - distance * 0.2, 0.4),
      color: distance === 0 ? '#6366f1' : '#9ca3af',
      textAlign: 'center',
      fontWeight: distance === 0 ? 'bold' : 'normal',
    };
  };

  const onScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    values: string[],
    setter: (val: string) => void,
    scrollRef: React.RefObject<ScrollView>
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    scrollToIndex(scrollRef, index);
    setter(values[index]);
  };

  const renderColumn = (
    data: string[],
    selectedValue: string,
    setter: (val: string) => void,
    scrollRef: any,
    isMinute = false
  ) => {
    const selectedIndex = data.indexOf(selectedValue);

    return (
      <View style={{ width: 135, height: ITEM_HEIGHT * VISIBLE_ITEMS, position: 'relative' }}>
        {/* Highlighted center border lines */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderTopWidth: 1.5,
              borderBottomWidth: 1.5,
              borderColor: '#6366f1',
              top: ITEM_HEIGHT * CENTER_INDEX,
              height: ITEM_HEIGHT,
            },
          ]}
        />
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * CENTER_INDEX,
          }}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => onScrollEnd(e, data, setter, scrollRef)}
        >
          {data.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <View
                key={item}
                style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={getStyle(index, selectedIndex)}>
                  {item}
                  {isMinute && isSelected && (
                    <Text className='text-body dark:text-gray-700'>
                      {' '}
                      {parseInt(selectedHour, 10) >= 12 ? 'PM' : 'AM'}
                    </Text>
                  )}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginVertical: 16 }}>
      {renderColumn(hours, selectedHour, onHourChange, hourScrollRef)}
      {renderColumn(minutes, selectedMinute, onMinuteChange, minuteScrollRef, true)}
    </View>
  );
};

export default TimePickerGrid;