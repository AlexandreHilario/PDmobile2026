import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CalculatorScreen() {
  const [age, setAge] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [result, setResult] = useState('');

  function calculateBirthDate() {
    const ageNum = parseInt(age, 10);
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);

    if (Number.isNaN(ageNum) || Number.isNaN(dayNum) || Number.isNaN(monthNum)) {
      setResult('Por favor insira valores válidos.');
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    // Birthday this year
    const birthdayThisYear = new Date(currentYear, monthNum - 1, dayNum);

    const hasHadBirthdayThisYear = today >= birthdayThisYear;

    const birthYear = currentYear - ageNum - (hasHadBirthdayThisYear ? 0 : 1);

    // Normalize day/month to two digits
    const dd = String(dayNum).padStart(2, '0');
    const mm = String(monthNum).padStart(2, '0');

    setResult(`${dd}/${mm}/${birthYear}`);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Calculadora de Data de Nascimento</ThemedText>

      <View style={styles.field}>
        <ThemedText>Idade (anos)</ThemedText>
        <TextInput
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
          style={styles.input}
          placeholder="Ex: 30"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <ThemedText>Dia</ThemedText>
          <TextInput
            keyboardType="number-pad"
            value={day}
            onChangeText={setDay}
            style={styles.input}
            placeholder="Ex: 15"
          />
        </View>
        <View style={[styles.field, styles.flex]}>
          <ThemedText>Mês</ThemedText>
          <TextInput
            keyboardType="number-pad"
            value={month}
            onChangeText={setMonth}
            style={styles.input}
            placeholder="Ex: 4"
          />
        </View>
      </View>

      <View style={styles.button}>
        <Button title="Calcular" onPress={calculateBirthDate} />
      </View>

      {result ? (
        <View style={styles.result}>
          <ThemedText type="subtitle">Data de nascimento</ThemedText>
          <ThemedText>{result}</ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  field: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    height: 44,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
  result: {
    marginTop: 16,
    gap: 6,
  },
});
