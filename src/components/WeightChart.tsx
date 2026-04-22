import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../store/ThemeContext';
import { COLORS, SPACING } from '../constants/theme';

interface DataPoint {
  x: number;
  y: number;
  label: string;
}

interface WeightChartProps {
  data: number[];
  labels: string[];
  width: number;
  height: number;
  strokeWidth?: number;
}

export default function WeightChart({
  data,
  labels,
  width,
  height,
  strokeWidth = 2.5,
}: WeightChartProps) {
  const { colors } = useTheme();

  if (!data || data.length === 0) return null;

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate min/max for scaling
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const paddingVal = range * 0.1; // 10% padding on Y axis

  // Transform data to SVG coordinates
  const points: DataPoint[] = data.map((val, idx) => ({
    x: padding + (idx / Math.max(data.length - 1, 1)) * chartWidth,
    y: padding + chartHeight - (((val - (minVal - paddingVal)) / (range + paddingVal * 2)) * chartHeight),
    label: labels[idx] || '',
  }));

  // Generate SVG path for the line
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Grid lines
  const gridLines = 4;
  const gridPaths = [];
  for (let i = 0; i <= gridLines; i++) {
    const y = padding + (i / gridLines) * chartHeight;
    const val = maxVal - (i / gridLines) * range;
    gridPaths.push(
      <Line
        key={`grid-h-${i}`}
        x1={padding - 5}
        y1={y}
        x2={width - padding}
        y2={y}
        stroke={colors.border}
        strokeWidth="0.5"
        opacity="0.3"
      />,
    );
    // Y-axis labels
    if (i > 0) {
      gridPaths.push(
        <SvgText
          key={`label-y-${i}`}
          x={padding - 10}
          y={y + 4}
          fontSize="10"
          fill={colors.textSecondary}
          textAnchor="end"
        >
          {Math.round(val)}
        </SvgText>,
      );
    }
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {gridPaths}

        {/* X-axis */}
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke={colors.border}
          strokeWidth="1"
        />

        {/* Y-axis */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke={colors.border}
          strokeWidth="1"
        />

        {/* Chart line with gradient effect */}
        <Path
          d={pathData}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, idx) => (
          <Circle
            key={`point-${idx}`}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill={COLORS.primary}
            stroke={colors.surface}
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels (show every Nth label to avoid crowding) */}
        {points.map((point, idx) => {
          const showLabel = data.length <= 4 || idx % Math.ceil(data.length / 4) === 0 || idx === data.length - 1;
          return showLabel ? (
            <SvgText
              key={`label-x-${idx}`}
              x={point.x}
              y={height - padding + 20}
              fontSize="10"
              fill={colors.textSecondary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          ) : null;
        })}
      </Svg>
    </View>
  );
}
