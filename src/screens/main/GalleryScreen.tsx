import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Gallery'>;

const GALLERY_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  name: 'Name',
  duration: '12m',
  tag: 'HIT',
}));

export function GalleryScreen() {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Gallery"
        rightElement={
          <TouchableOpacity>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.search}
          placeholder="Search"
          placeholderTextColor={colors.textMuted}
        />
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {GALLERY_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => toggleSelect(item.id)}
            >
              <View style={styles.gridThumb} />
              <Text style={styles.gridName}>{item.name}</Text>
              <Text style={styles.gridMeta}>{item.duration} • {item.tag}</Text>
              {selected.has(item.id) && (
                <View style={styles.checkbox}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue"
          onPress={() => navigation.navigate('CardioClassForm')}
          style={styles.button}
        />
        <Button title="Save as Draft" onPress={() => navigation.goBack()} variant="secondary" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
  },
  search: {
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingRight: 40,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  searchIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 16,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  gridItem: {
    width: '47%',
    position: 'relative',
  },
  gridThumb: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.Secondary2,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  gridName: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  gridMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  checkbox: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.Accent1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginBottom: spacing.md,
  },
});
