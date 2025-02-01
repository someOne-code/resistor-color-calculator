import React, { useState } from 'react';

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const ResistorCalculator = () => {
  const [bandCount, setBandCount] = useState(4);
  const [bands, setBands] = useState(['brown', 'black', 'red', 'gold']);
  const [selectedBand, setSelectedBand] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Updated color values according to the standard table
  const colorValues = {
    black: { value: 0, multiplier: 1, tolerance: null, tempCoef: 250 },
    brown: { value: 1, multiplier: 10, tolerance: 1, tempCoef: 100 },
    red: { value: 2, multiplier: 100, tolerance: 2, tempCoef: 50 },
    orange: { value: 3, multiplier: 1000, tolerance: 0.05, tempCoef: 15 },
    yellow: { value: 4, multiplier: 10000, tolerance: 0.02, tempCoef: 25 },
    green: { value: 5, multiplier: 100000, tolerance: 0.5, tempCoef: null }, // tempCoef null olabilir
    blue: { value: 6, multiplier: 1000000, tolerance: 0.25, tempCoef: 10 },
    violet: { value: 7, multiplier: 10000000, tolerance: 0.1, tempCoef: 5 },
    gray: { value: 8, multiplier: 100000000, tolerance: 0.01, tempCoef: null },
    white: { value: 9, multiplier: 1000000000, tolerance: 20, tempCoef: null },
    gold: { value: null, multiplier: 0.1, tolerance: 5, tempCoef: null },
    silver: { value: null, multiplier: 0.01, tolerance: 10, tempCoef: null }
};

  const colors = Object.keys(colorValues);

  const changeBandCount = (count) => {
    setBandCount(count);
    switch(count) {
      case 3:
        setBands(['brown', 'black', 'red']);
        break;
      case 4:
        setBands(['brown', 'black', 'red', 'gold']);
        break;
      case 5:
        setBands(['brown', 'black', 'black', 'red', 'gold']);
        break;
      case 6:
        setBands(['brown', 'black', 'black', 'red', 'gold', 'brown']);
        break;
      default:
        setBands(['brown', 'black', 'red', 'gold']);
    }
    setSelectedBand(null);
  };

  const calculateResistance = () => {
    let value = 0;
    let tolerance = 20;
    let tempCoef = null;

    const values = bands.map(color => colorValues[color]?.value ?? 0); // Renk değerlerini al
    let valueDigits = bandCount <= 4 ? 2 : 3; // 4 band için 2, 5 veya 6 band için 3 basamak

    for (let i = 0; i < valueDigits; i++) {
        value = value * 10 + values[i]; // Sayıyı doğru birleştir
    }

    const multiplierIndex = valueDigits;
    const multiplier = colorValues[bands[multiplierIndex]]?.multiplier ?? 1;
    value *= multiplier;

    if (bandCount >= 4) {
        const toleranceIndex = Math.min(bands.length - 1, bandCount - 1);
        tolerance = colorValues[bands[toleranceIndex]]?.tolerance ?? 20;
    }

    if (bandCount === 6) {
        tempCoef = colorValues[bands[5]]?.tempCoef;
    }

    return { value: formatValue(value), tolerance, tempCoef };
};


  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };
  // Add these functions right after the formatValue function and before isColorValidForBand:

  const handleBandClick = (index) => {
    setSelectedBand(selectedBand === index ? null : index);
  };

  const handleColorSelect = (color) => {
    if (selectedBand === null) {
      setModalVisible(true);
      return;
    }
  
    if (isColorValidForBand(color, selectedBand)) {
      const newBands = [...bands];
      newBands[selectedBand] = color;
      setBands(newBands);
      setSelectedBand(null);
    }
  };

  
  const isColorValidForBand = (color, index) => {
    const colorInfo = colorValues[color];
    if (!colorInfo) return false; // Tanımsız rengi işle
  
    const valueBands = bandCount <= 4 ? 2 : 3; // Değer bantlarının sayısı
  
    if (index < valueBands) { // Değer bantları
      return colorInfo.value !== undefined && color !== 'gold' && color !== 'silver' && color !== 'white';
    } else if (index === valueBands) { // Çarpan bandı
      return colorInfo.multiplier !== undefined;
    } else if (index === valueBands + 1) { // Tolerans bandı
      return colorInfo.tolerance !== undefined && color !== 'white';
    } else if (bandCount === 6 && index === 5) { // 6 bantlı direnç için sıcaklık katsayısı
      return colorInfo.tempCoef !== undefined;
    }
  
    return false; // Diğer durumlar için geçersiz
  };
  const getBandDescription = (index) => {
    switch(bandCount) {
      case 3:
        return ['1st Value', '2nd Value', 'Multiplier'][index];
      case 4:
        return ['1st Value', '2nd Value', 'Multiplier', 'Tolerance'][index];
      case 5:
        return ['1st Value', '2nd Value', '3rd Value', 'Multiplier', 'Tolerance'][index];
      case 6:
        return ['1st Value', '2nd Value', '3rd Value', 'Multiplier', 'Tolerance', 'Temp Coefficient'][index];
      default:
        return '';
    }
  };

  const result = calculateResistance();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Resistor Calculator</Text>
          </View>

          <View style={styles.bandSelector}>
            {[3, 4, 5, 6].map((count) => (
              <TouchableOpacity
                key={count}
                onPress={() => changeBandCount(count)}
                style={[
                  styles.bandButton,
                  bandCount === count && styles.bandButtonActive
                ]}
              >
                <Text style={[
                  styles.bandButtonText,
                  bandCount === count && styles.bandButtonTextActive
                ]}>
                  {count} Bands
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.resistorContainer}>
            <View style={styles.terminal} />
            <View style={styles.resistorBody}>
              {bands.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleBandClick(index)}
                  style={[
                    styles.band,
                    { backgroundColor: color },
                    { left: `${15 + (index * (85 / bandCount))}%` },
                    selectedBand === index && styles.selectedBand
                  ]}
                />
              ))}
            </View>
            <View style={[styles.terminal, styles.terminalRight]} />
          </View>

          {selectedBand !== null && (
            <Text style={styles.bandInfo}>
              Select color for: {getBandDescription(selectedBand)}
            </Text>
          )}
{selectedBand !== null && (
  <View style={styles.colorPicker}>
    <ScrollView>
      {colors.filter(color => isColorValidForBand(color, selectedBand)).map(color => { // Filtrelenmiş renk listesi
        const colorInfo = colorValues[color];
        return (
          <TouchableOpacity
            key={color}
            onPress={() => handleColorSelect(color)} // Artık isDisabled kontrolüne gerek yok
            style={styles.colorOption} // Artık disabledColorOption stiline gerek yok
            aria-label={color + " color for band " + (selectedBand + 1)} 
          >
            <View style={styles.colorOptionLeft}>
              <View
                style={[
                  styles.colorBox,
                  { backgroundColor: color },
                  color === 'white' && styles.whiteColorBorder
                ]}
              />
              <Text style={styles.colorName}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </Text>
            </View>
            <Text style={styles.colorValue}>
              {colorInfo.value !== null ? 
                `Value: ${colorInfo.value}` : 
                `Multiplier: ×${colorInfo.multiplier}`
              }
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
)}
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              {result.value}Ω {bandCount > 3 ? `±${result.tolerance}%` : '±20%'}
            </Text>
            {result.tempCoef && (
              <Text style={styles.tempCoefText}>
                Temperature Coefficient: {result.tempCoef} ppm/°C
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>No band selected. Please select a band to change its color.</Text>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 16,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bandSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  bandButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  bandButtonActive: {
    backgroundColor: '#4a90e2',
  },
  bandButtonText: {
    color: '#374151',
    fontSize: 16,
  },
  bandButtonTextActive: {
    color: 'white',
  },
  resistorContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  terminal: {
    width: 40,
    height: 4,
    backgroundColor: '#71717a',
    borderRadius: 2,
  },
  terminalRight: {
    right: 0,
  },
  resistorBody: {
    flex: 1,
    height: 60,
    backgroundColor: '#D2B48C',
    borderRadius: 30,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  band: {
    position: 'absolute',
    width: 20,
    height: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 2,
  },
  selectedBand: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  bandInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a90e2',
    textAlign: 'center',
    marginVertical: 8,
  },
  colorPicker: {
    flexDirection: 'column',  // Renkleri alt alta diz
    alignItems: 'stretch',    // Kutuların tam genişlikte olmasını sağla
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  colorOptionRow: {
    flexDirection: 'row',    // Renk kutusunu ve ismini yatay hizala
    alignItems: 'center',    // Dikeyde hizalama
    paddingVertical: 8,      // Kutular arası boşluk bırak
    borderBottomWidth: 1,    // Ayrım çizgisi ekle
    borderBottomColor: '#e0e0e0',
  },
  colorOptionLeft: {
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 10,  // Kutuyla yazı arasına boşluk bırak
  },
  colorBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  
  hoveredColorOption: {
    opacity: 0.7,
    transform: [{ scale: 1.1 }],
  },
  lightColorBorder: {
    borderWidth: 1.5,
    borderColor: '#c0c0c0',
  },
  resultContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1b4b',
    textAlign: 'center',
  },
  tempCoefText: {
    fontSize: 16,
    color: '#4c1d95',
    textAlign: 'center',
    marginTop: 8,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
 
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center', // Dikey hizalama
    justifyContent: 'space-between', // Yatayda eşit boşluk
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  colorOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  whiteColorBorder: {
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  colorName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  colorValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  disabledColorOption: {
    opacity: 0.5, // Make it look faded
    pointerEvents: 'none', // Prevent interaction
  },
});

export default ResistorCalculator;