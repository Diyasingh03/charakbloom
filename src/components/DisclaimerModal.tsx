import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../constants/theme';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ visible, onAccept }: Props) {
  const [privacyVisible, setPrivacyVisible] = useState(false);

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent={false} presentationStyle="fullScreen">
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            <Text style={styles.emoji}>🌸</Text>
            <Text style={styles.title}>Welcome to CharakBloom</Text>
            <Text style={styles.subtitle}>Your personal PCOS wellness companion</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Medical Disclaimer</Text>
              <Text style={styles.cardBody}>
                CharakBloom is a personal wellness tracking app and is{' '}
                <Text style={styles.bold}>not a medical device</Text>. The information, cycle
                predictions, meal suggestions, and workout recommendations provided are for
                personal wellness tracking purposes only.
              </Text>
              <Text style={styles.cardBody}>
                CharakBloom is{' '}
                <Text style={styles.bold}>
                  not a substitute for professional medical advice, diagnosis, or treatment
                </Text>
                . Always consult a qualified healthcare provider regarding PCOS management or
                any health concerns.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.privacyLink}
              onPress={() => setPrivacyVisible(true)}
            >
              <Text style={styles.privacyLinkText}>View Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptBtnText}>I understand, continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <PrivacyPolicyModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { ...Typography.heading1, textAlign: 'center', marginBottom: 6 },
  subtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', marginBottom: 36 },
  card: {
    backgroundColor: Colors.pastelPink + '18',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.pastelPink + '40',
    alignSelf: 'stretch',
  },
  cardTitle: { ...Typography.heading3, marginBottom: 12, color: Colors.textDark },
  cardBody: { ...Typography.body, lineHeight: 22, color: Colors.textDark, marginBottom: 10 },
  bold: { fontWeight: '700' },
  privacyLink: { marginBottom: 24, paddingVertical: 8 },
  privacyLinkText: { ...Typography.label, color: Colors.pastelPurple, textDecorationLine: 'underline' },
  acceptBtn: {
    alignSelf: 'stretch',
    backgroundColor: Colors.pastelPink,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptBtnText: { ...Typography.label, color: Colors.white, fontSize: 16 },
});
