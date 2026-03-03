import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const SIZE = 32;

export function HomeTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const fillColor = focused ? '#E6CCCE' : color;
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 32 32" fill="none">
        <Path
          d="M25.3555 9.52237C26.168 10.002 26.6666 10.8753 26.6666 11.8188V24C26.6666 25.4728 25.4727 26.6667 23.9999 26.6667H21.3333C19.8605 26.6667 18.6666 25.4728 18.6666 24V18.6666C18.6666 17.1938 17.4727 15.9999 15.9999 15.9999C14.5272 15.9999 13.3333 17.1938 13.3333 18.6666V24C13.3333 25.4728 12.1393 26.6667 10.6666 26.6667H7.99992C6.52716 26.6667 5.33325 25.4728 5.33325 24V11.8188C5.33325 10.8753 5.83185 10.002 6.64438 9.52237L14.6444 4.80014C15.4807 4.30651 16.5192 4.30651 17.3555 4.80014L25.3555 9.52237Z"
          fill={fillColor}
          stroke={fillColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ProfileTabIcon({ color }: { color: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 32 32" fill="none">
        <Path
          d="M23.3334 26.6663C24.438 26.6663 25.3613 25.7632 25.1876 24.6724C24.5499 20.6683 21.7765 18.6663 16.0001 18.6663C10.2237 18.6663 7.45029 20.6683 6.81259 24.6724C6.63886 25.7632 7.56218 26.6663 8.66675 26.6663H23.3334Z"
          stroke={color}
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.0001 14.6663C18.6667 14.6663 20.0001 13.333 20.0001 9.99967C20.0001 6.66634 18.6667 5.33301 16.0001 5.33301C13.3334 5.33301 12.0001 6.66634 12.0001 9.99967C12.0001 13.333 13.3334 14.6663 16.0001 14.6663Z"
          stroke={color}
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ChatTabIcon({ color }: { color: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 32 32" fill="none">
        <Path
          d="M16.3861 23.9976C24.1287 23.9121 28 21.2249 28 14.6663C28 7.99967 24 5.33301 16 5.33301C8 5.33301 4 7.99967 4 14.6663C4 18.7691 5.51497 21.357 8.5449 22.7406L6.66667 27.9997L16.3861 23.9976Z"
          stroke={color}
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function StatsTabIcon({ color }: { color: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 32 32" fill="none">
        <Path
          d="M18.6666 25.3337V8.66699C18.6666 7.56242 17.7712 6.66699 16.6666 6.66699H13.9999C12.8953 6.66699 11.9999 7.56242 11.9999 8.66699V25.3337M11.9999 17.3337H7.33325C6.22868 17.3337 5.33325 18.2291 5.33325 19.3337V23.3337C5.33325 24.4382 6.22868 25.3337 7.33325 25.3337H23.3333C24.4378 25.3337 25.3333 24.4382 25.3333 23.3337V15.3337C25.3333 14.2291 24.4378 13.3337 23.3333 13.3337H18.6666"
          stroke={color}
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
