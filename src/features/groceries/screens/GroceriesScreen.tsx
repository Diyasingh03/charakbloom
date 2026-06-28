import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useCycle } from '../../cycle/context/CycleContext';
import { useGroceryList } from '../hooks/useGroceryList';
import { GroceryItemRow } from '../components/GroceryItem';
import { AddItemSheet } from '../components/AddItemSheet';
import { PhaseGradient } from '../../../components/PhaseGradient';
import { Colors, Typography, Radius } from '../../../constants/theme';
import { GroceryCategory, GroceryItem } from '../../../types';

const CATEGORY_ORDER: GroceryCategory[] = ['produce', 'protein', 'dairy', 'pantry', 'other'];
const CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: '🥬 Produce',
  protein: '🥩 Protein',
  dairy: '🥛 Dairy',
  pantry: '🫙 Pantry',
  other: '📦 Other',
};

export function GroceriesScreen() {
  const cycle = useCycle();
  const { items, addItem, toggleInStock, removeItem } = useGroceryList();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const sections = CATEGORY_ORDER
    .map((cat) => ({
      title: CATEGORY_LABELS[cat],
      data: filtered.filter((i) => i.category === cat),
    }))
    .filter((s) => s.data.length > 0);

  const inStockCount = items.filter((i) => i.inStock).length;

  return (
    <PhaseGradient phase={cycle.phase} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SectionList
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>My Pantry</Text>
                  <Text style={styles.subtitle}>{inStockCount} items in stock</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search items..."
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  ✨ Your pantry is sent to the AI every day — keep it updated for better meal suggestions.
                </Text>
              </View>
            </>
          }
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroceryItemRow
              item={item}
              onToggle={() => toggleInStock(item.id)}
              onDelete={() => removeItem(item.id)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<View style={{ height: 40 }} />}
          stickySectionHeadersEnabled={false}
        />

        <AddItemSheet
          visible={showAdd}
          onClose={() => setShowAdd(false)}
          onAdd={addItem}
        />
      </SafeAreaView>
    </PhaseGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { ...Typography.heading1 },
  subtitle: { ...Typography.body, fontSize: 14, marginTop: 2 },
  addBtn: { backgroundColor: Colors.pastelPink, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full },
  addBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  searchRow: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, backgroundColor: Colors.white, color: Colors.textDark },
  infoBanner: { marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.pastelPurple + '40', padding: 12, borderRadius: 12 },
  infoBannerText: { fontSize: 13, color: Colors.textDark, lineHeight: 18 },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, backgroundColor: 'transparent' },
  sectionHeaderText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: { paddingBottom: 16 },
});
