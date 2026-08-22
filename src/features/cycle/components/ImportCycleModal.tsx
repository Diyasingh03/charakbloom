import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Colors, Typography, Radius, Spacing } from '../../../constants/theme';
import { parseAnyFloData, FloImportFormat } from '../../../lib/floImport';
import { storageSet, STORAGE_KEYS } from '../../../lib/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onImported: () => void;
}

type State = 'idle' | 'valid' | 'error' | 'importing' | 'success';

const FORMAT_LABELS: Record<FloImportFormat, string> = {
  'flo-json-export': 'Flo JSON export',
  'flo-txt-export': 'Flo text export',
  'simplified-json': 'CharakBloom JSON',
};

export function ImportCycleModal({ visible, onClose, onImported }: Props) {
  const [text, setText] = useState('');
  const [state, setState] = useState<State>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [detectedFormat, setDetectedFormat] = useState<FloImportFormat | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const reset = () => {
    setText('');
    setState('idle');
    setCycleCount(0);
    setDetectedFormat(null);
    setErrorMsg('');
    setFileName(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = (raw: string) => {
    if (!raw.trim()) {
      setState('idle');
      return;
    }
    const result = parseAnyFloData(raw);
    if (result) {
      setState('valid');
      setCycleCount(result.data.cycles.length);
      setDetectedFormat(result.format);
      setErrorMsg('');
    } else {
      setState('error');
      setDetectedFormat(null);
      setErrorMsg('Unrecognised format. Please use a Flo JSON export, Flo text export, or CharakBloom JSON.');
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    setFileName(null);
    validate(value);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setFileName(asset.name);
      setState('idle');

      const content = await FileSystem.readAsStringAsync(asset.uri);
      setText(content);
      validate(content);
    } catch {
      setState('error');
      setErrorMsg('Could not read file. Try pasting the contents manually.');
    }
  };

  const handleImport = async () => {
    const result = parseAnyFloData(text);
    if (!result) return;
    setState('importing');
    await storageSet(STORAGE_KEYS.FLO_DATA, result.data);
    setState('success');
    setTimeout(() => {
      onImported();
      handleClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Import Cycle Data</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Instructions */}
            <Text style={styles.instructions}>
              {Platform.OS === 'web'
                ? 'Paste your Flo export contents below.'
                : 'Pick your Flo export file or paste its contents below.'}{' '}
              Supported: <Text style={styles.bold}>flo.json</Text> (full Flo export),{' '}
              <Text style={styles.bold}>res.txt</Text> (Flo text export), or a{' '}
              <Text style={styles.bold}>CharakBloom JSON</Text> file.
            </Text>

            {/* File picker — native only */}
            {Platform.OS !== 'web' && (
              <>
                <TouchableOpacity style={styles.pickBtn} onPress={handlePickFile}>
                  <Text style={styles.pickBtnText}>
                    {fileName ? `✓  ${fileName}` : 'Choose File (.json or .txt)'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>or paste below</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Importing will replace your current cycle history.
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                state === 'valid' && styles.inputValid,
                state === 'error' && styles.inputError,
              ]}
              multiline
              value={text}
              onChangeText={handleTextChange}
              placeholder={'Paste Flo JSON or text export here…'}
              placeholderTextColor={Colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              textAlignVertical="top"
            />

            {state === 'valid' && detectedFormat && (
              <View style={styles.validRow}>
                <Text style={styles.validText}>
                  {FORMAT_LABELS[detectedFormat]} — {cycleCount} cycle{cycleCount !== 1 ? 's' : ''} detected
                </Text>
              </View>
            )}
            {state === 'error' && (
              <Text style={styles.errorText}>{errorMsg}</Text>
            )}
            {state === 'success' && (
              <View style={styles.successRow}>
                <Text style={styles.successText}>Imported successfully!</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.importBtn, state !== 'valid' && styles.importBtnDisabled]}
              onPress={handleImport}
              disabled={state !== 'valid'}
            >
              {state === 'importing' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.importBtnText}>
                  {state === 'valid'
                    ? `Import ${cycleCount} cycle${cycleCount !== 1 ? 's' : ''}`
                    : 'Import'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtnText: { ...Typography.label, color: Colors.textDark },
  content: { padding: Spacing.lg, paddingBottom: 8, gap: 14 },
  instructions: { ...Typography.body, fontSize: 14, lineHeight: 21, color: Colors.textDark },
  bold: { fontWeight: '600', color: Colors.textDark },
  pickBtn: {
    borderWidth: 1.5,
    borderColor: Colors.pastelPurple,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.pastelPurple + '08',
  },
  pickBtnText: {
    ...Typography.label,
    color: Colors.pastelPurple,
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerLabel: { fontSize: 12, color: Colors.textMuted },
  warning: {
    backgroundColor: '#FFF3CD',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFD966',
  },
  warningText: { fontSize: 13, color: '#856404', fontWeight: '500' },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'monospace' }),
    color: Colors.textDark,
    minHeight: 120,
    maxHeight: 220,
  },
  inputValid: { borderColor: '#4CAF50' },
  inputError: { borderColor: '#E05C5C' },
  validRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  validText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  errorText: { fontSize: 13, color: '#E05C5C' },
  successRow: { alignItems: 'center', paddingVertical: 8 },
  successText: { fontSize: 14, color: '#4CAF50', fontWeight: '700' },
  footer: {
    padding: Spacing.lg,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  importBtn: {
    backgroundColor: Colors.pastelPink,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  importBtnDisabled: { backgroundColor: Colors.border },
  importBtnText: { ...Typography.label, color: Colors.white, fontSize: 15 },
});
