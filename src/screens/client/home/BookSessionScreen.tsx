import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ClientHomeStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { Button, SectionTitle, Avatar, Overlay } from '../../../components/ui';
import { DateTimePickerSection } from '../../home/screens/SessionForm/DateTimePickerSection';
import { TypePickerModal } from '../../home/screens/SessionForm/TypePickerModal';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { TRAINING_TYPES } from '../../../constants';
import { useTrainersStore } from '../../../store/trainersStore';
import { useSessionsStore } from '../../../store/sessionsStore';
import { formatDate, formatTime } from '../../../utils';

type Nav = NativeStackNavigationProp<ClientHomeStackParamList, 'BookSession'>;
type Route = RouteProp<ClientHomeStackParamList, 'BookSession'>;

export function BookSessionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const trainers = useTrainersStore((s) => s.trainers);
  const addSession = useSessionsStore((s) => s.addSession);

  const [trainerId, setTrainerId] = React.useState<string | undefined>(route.params?.trainerId);
  const [type, setType] = React.useState<string>(TRAINING_TYPES[0]);
  const [date, setDate] = React.useState(new Date());
  const [time, setTime] = React.useState(new Date());
  const [typePickerOpen, setTypePickerOpen] = React.useState(false);
  const [trainerPickerOpen, setTrainerPickerOpen] = React.useState(false);

  const trainer = trainers.find((t) => t.id === trainerId);

  const handleRequest = () => {
    if (!trainer) {
      setTrainerPickerOpen(true);
      return;
    }
    addSession({
      title: `Session with ${trainer.name}`,
      type,
      date: formatDate(date),
      time: formatTime(time),
      status: 'pending',
      participants: [{ id: trainer.id, name: trainer.name, avatar: trainer.avatar }],
    });
    navigation.navigate('RequestSubmitted');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Book a session" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionTitle>Trainer</SectionTitle>
        <TouchableOpacity
          style={styles.selectRow}
          activeOpacity={0.8}
          onPress={() => setTrainerPickerOpen(true)}
        >
          {trainer ? (
            <View style={styles.trainerSelected}>
              <Avatar name={trainer.name} uri={trainer.avatar} size={36} />
              <View>
                <Text style={styles.selectValue}>{trainer.name}</Text>
                <Text style={styles.selectSub}>{trainer.headline}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholder}>Choose a trainer</Text>
          )}
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <SectionTitle>Type</SectionTitle>
        <TouchableOpacity
          style={styles.selectRow}
          activeOpacity={0.8}
          onPress={() => setTypePickerOpen(true)}
        >
          <Text style={styles.selectValue}>{type}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <SectionTitle>When</SectionTitle>
        <DateTimePickerSection date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />

        <Button title="Send request" onPress={handleRequest} style={styles.submit} />
        <Text style={styles.hint}>
          Your trainer will confirm the session. You can track its status on your home screen.
        </Text>
      </ScrollView>

      <TypePickerModal
        visible={typePickerOpen}
        onClose={() => setTypePickerOpen(false)}
        options={TRAINING_TYPES}
        value={type}
        onChange={setType}
      />

      <Overlay visible={trainerPickerOpen} onClose={() => setTrainerPickerOpen(false)}>
        <View style={styles.pickerSheet}>
          <Text style={styles.pickerTitle}>Choose a trainer</Text>
          {trainers.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.pickerRow}
              activeOpacity={0.8}
              onPress={() => {
                setTrainerId(t.id);
                setTrainerPickerOpen(false);
              }}
            >
              <Avatar name={t.name} uri={t.avatar} size={36} />
              <View style={styles.pickerRowMain}>
                <Text style={styles.selectValue}>{t.name}</Text>
                <Text style={styles.selectSub}>{t.headline}</Text>
              </View>
              {t.id === trainerId && <Ionicons name="checkmark" size={18} color={colors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.sm },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  trainerSelected: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  selectValue: { fontSize: typography.sizes.base, color: colors.text },
  selectSub: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  placeholder: { fontSize: typography.sizes.base, color: colors.textMuted },
  submit: { marginTop: spacing.lg },
  hint: { fontSize: typography.sizes.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  pickerSheet: {
    gap: spacing.sm,
    width: '86%',
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  pickerTitle: { fontSize: typography.sizes.lg, color: colors.text, fontWeight: typography.weights.semibold, marginBottom: spacing.xs },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  pickerRowMain: { flex: 1 },
});
