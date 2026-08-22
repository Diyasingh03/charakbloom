import React from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.updated}>Last updated: June 2026</Text>

          <Text style={styles.section}>What CharakBloom is</Text>
          <Text style={styles.body}>
            CharakBloom is a personal wellness app designed to help you track your menstrual cycle,
            manage PCOS symptoms, and receive personalised meal and workout suggestions.
          </Text>

          <Text style={styles.section}>Data stored on your device</Text>
          <Text style={styles.body}>
            All personal data is stored locally on your iPhone only and never transmitted to any
            server operated by this app. This includes:
          </Text>
          <Text style={styles.bullet}>• Menstrual cycle dates and lengths</Text>
          <Text style={styles.bullet}>• Ovulation dates</Text>
          <Text style={styles.bullet}>• Symptom logs</Text>
          <Text style={styles.bullet}>• Grocery and pantry items</Text>

          <Text style={styles.section}>Data sent to Google Gemini</Text>
          <Text style={styles.body}>
            To generate personalised daily content, CharakBloom sends the following to Google's Gemini
            API once per day:
          </Text>
          <Text style={styles.bullet}>• Your current cycle phase and day number</Text>
          <Text style={styles.bullet}>• Your average cycle length</Text>
          <Text style={styles.bullet}>• Your in-stock grocery items</Text>
          <Text style={styles.bullet}>• Predicted ovulation and next period dates</Text>
          <Text style={styles.body}>
            No name, contact details, device identifiers, or personally identifiable information is
            ever sent. Google's data handling is governed by Google's own Privacy Policy.
          </Text>

          <Text style={styles.section}>No tracking or advertising</Text>
          <Text style={styles.body}>
            CharakBloom does not use analytics, advertising SDKs, or any cross-app tracking. No data is
            sold or shared with third parties.
          </Text>

          <Text style={styles.section}>How to delete your data</Text>
          <Text style={styles.body}>
            To permanently delete all data stored by CharakBloom, go to iPhone Settings → General →
            iPhone Storage → CharakBloom → Delete App. This removes all locally stored information.
          </Text>

          <Text style={styles.section}>Contact</Text>
          <Text style={styles.body}>
            This is a personal app. For questions, contact singhdiya2004@gmail.com.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.heading2 },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.pastelPink + '30',
  },
  closeBtnText: { ...Typography.label, color: Colors.pastelPink },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  updated: { ...Typography.caption, marginBottom: 24 },
  section: { ...Typography.heading3, marginTop: 24, marginBottom: 8 },
  body: { ...Typography.body, lineHeight: 22, marginBottom: 8, color: Colors.textDark },
  bullet: { ...Typography.body, lineHeight: 22, marginLeft: 8, marginBottom: 4, color: Colors.textDark },
});
