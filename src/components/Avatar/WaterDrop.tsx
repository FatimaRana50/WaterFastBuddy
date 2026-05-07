/**
 * WaterDrop — animated SVG water-drop character used throughout onboarding.
 *
 * This component is intentionally NOT image-based — it's the small mascot
 * droplet that appears in onboarding flows, distinct from the human avatar.
 * Public API preserved exactly.
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, {
  Path, Circle, Defs, ClipPath, LinearGradient as SvgGradient,
  RadialGradient, Stop, G,
} from 'react-native-svg';

interface Props {
  size?: number;
  fillPct?: number;
  happy?: boolean;
}

const VW = 200;
const VH = 240;

const DROP_PATH =
  `M ${VW / 2} 12
   C ${VW / 2 + 14} 50, ${VW - 22} 92,  ${VW - 22} 148
   C ${VW - 22} 196, ${VW / 2 + 50} 230, ${VW / 2} 230
   C ${VW / 2 - 50} 230, 22 196, 22 148
   C 22 92, ${VW / 2 - 14} 50, ${VW / 2} 12 Z`;

export default function WaterDrop({ size = 120, fillPct = 0.6, happy = false }: Props) {
  const aspectH = size * (VH / VW);

  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -6, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue:  0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const [waveT, setWaveT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWaveT(t => (t + 0.18) % (Math.PI * 200)), 60);
    return () => clearInterval(id);
  }, []);

  const pct = Math.max(0, Math.min(1, fillPct));
  const fillTop = 30;
  const fillBot = 222;
  const surfaceY = fillBot - (fillBot - fillTop) * pct;

  const wavePath = useMemo(() => {
    let p = `M -10 ${surfaceY}`;
    for (let x = -10; x <= VW + 10; x += 4) {
      const y =
        surfaceY +
        3.2 * Math.sin(x / 18 + waveT) +
        1.6 * Math.sin(x / 8  + waveT * 1.7);
      p += ` L ${x} ${y}`;
    }
    p += ` L ${VW + 10} ${VH + 20} L -10 ${VH + 20} Z`;
    return p;
  }, [waveT, surfaceY]);

  const faceCY  = 150;
  const eyeY    = faceCY - 6;
  const eyeOff  = 18;
  const mouthY  = faceCY + 14;

  return (
    <Animated.View
      style={[styles.wrap, { width: size, height: aspectH, transform: [{ translateY: bob }] }]}
    >
      <Svg width={size} height={aspectH} viewBox={`0 0 ${VW} ${VH}`}>
        <Defs>
          <SvgGradient id="dropShell" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#BFE3FF" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0.90" />
          </SvgGradient>
          <SvgGradient id="dropWater" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#21C7FF" />
            <Stop offset="100%" stopColor="#0B5DD1" />
          </SvgGradient>
          <RadialGradient id="dropShine" cx="35%" cy="30%" r="40%">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
          <ClipPath id="dropClip">
            <Path d={DROP_PATH} />
          </ClipPath>
        </Defs>

        <Path d={DROP_PATH} fill="url(#dropShell)" />

        <G clipPath="url(#dropClip)">
          <Path d={wavePath} fill="url(#dropWater)" opacity={0.92} />
          <Path
            d={(() => {
              let p = `M -10 ${surfaceY}`;
              for (let x = -10; x <= VW + 10; x += 4) {
                const y =
                  surfaceY +
                  3.2 * Math.sin(x / 18 + waveT) +
                  1.6 * Math.sin(x / 8  + waveT * 1.7);
                p += ` L ${x} ${y}`;
              }
              return p;
            })()}
            stroke="#E0F4FF" strokeWidth={1.4} fill="none" opacity={0.7}
          />
        </G>

        <Path d={DROP_PATH} fill="url(#dropShine)" />
        <Path
          d={`M ${VW / 2 - 18} 60 Q ${VW / 2 - 30} 100 ${VW / 2 - 22} 140`}
          stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.55} fill="none"
        />

        {happy && (
          <G>
            <Circle cx={VW / 2 - eyeOff} cy={eyeY} r={4.5} fill="#0B1B3A" />
            <Circle cx={VW / 2 + eyeOff} cy={eyeY} r={4.5} fill="#0B1B3A" />
            <Circle cx={VW / 2 - eyeOff + 1.4} cy={eyeY - 1.5} r={1.4} fill="#FFFFFF" />
            <Circle cx={VW / 2 + eyeOff + 1.4} cy={eyeY - 1.5} r={1.4} fill="#FFFFFF" />
            <Path
              d={`M ${VW / 2 - 14} ${mouthY} Q ${VW / 2} ${mouthY + 12} ${VW / 2 + 14} ${mouthY}`}
              stroke="#0B1B3A" strokeWidth={3} strokeLinecap="round" fill="none"
            />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
