import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent, StyleSheet } from 'react-native';

const PRIMARY = '#00B8FF';
export const DRUM_ITEM_H = 60;
const VISIBLE = 7;

interface DrumPickerProps {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  formatter?: (v: number) => string;
  width?: number;
}

export default function DrumPicker({ items, value, onChange, unit, formatter, width = 220 }: DrumPickerProps) {
  const ref = useRef<ScrollView>(null);
  const idx = items.indexOf(value);

  useEffect(() => {
    const t = setTimeout(() => {
      if (idx >= 0) ref.current?.scrollTo({ y: idx * DRUM_ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const snap = (y: number) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / DRUM_ITEM_H)));
    if (items[i] !== undefined && items[i] !== value) onChange(items[i]);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    snap(e.nativeEvent.contentOffset.y);

  const onDragEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    snap(e.nativeEvent.targetContentOffset?.y ?? e.nativeEvent.contentOffset.y);

  return (
    <View style={[st.wrap, { height: DRUM_ITEM_H * VISIBLE, width }]}>
      <View pointerEvents="none" style={[st.indicator, { top: DRUM_ITEM_H * 3, height: DRUM_ITEM_H }]} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={DRUM_ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        onScrollEndDrag={onDragEnd}
        contentContainerStyle={{ paddingVertical: DRUM_ITEM_H * 3 }}
      >
        {items.map((item) => {
          const sel = item === value;
          const label = formatter ? formatter(item) : String(item);
          return (
            <View key={item} style={[st.item, { height: DRUM_ITEM_H }]}>
              <Text style={[st.num, sel ? st.numSel : st.numDim]}>{label}</Text>
              {sel && unit ? (
                <Text style={st.unit}>{unit}</Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  indicator: {
    position: 'absolute', left: 0, right: 0,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: PRIMARY + '55',
    zIndex: 2,
  },
  item: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  num:    { letterSpacing: -0.5 },
  numSel: { fontSize: 52, fontWeight: '900', color: PRIMARY },
  numDim: { fontSize: 28, fontWeight: '300', color: 'rgba(232,241,255,0.20)' },
  unit:   { fontSize: 16, color: 'rgba(232,241,255,0.65)', fontWeight: '600', marginTop: 10 },
});
