import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export type ValorDado = 1 | 2 | 3 | 4 | 5 | 6;

type DadoProps = {
  valor: ValorDado;
  tamanho?: number;
};

const imagensDosDados = {
  1: require('@/assets/images/dice-1.svg'),
  2: require('@/assets/images/dice-2.svg'),
  3: require('@/assets/images/dice-3.svg'),
  4: require('@/assets/images/dice-4.svg'),
  5: require('@/assets/images/dice-5.svg'),
  6: require('@/assets/images/dice-6.svg'),
} as const;

export function Dado({ valor, tamanho = 72 }: DadoProps) {
  return (
    <View style={[styles.container, { width: tamanho, height: tamanho }]}>
      <Image
        source={imagensDosDados[valor]}
        style={styles.image}
        contentFit="contain"
        accessibilityLabel={`Dado mostrando o valor ${valor}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
