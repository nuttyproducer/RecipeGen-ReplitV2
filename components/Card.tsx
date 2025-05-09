import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';

type CardProps = {
  title: string;
  content: string;
  children?: React.ReactNode;
};

export function Card({ title, content, children }: CardProps) {
  return (
    <PaperCard style={styles.card}>
      <PaperCard.Content>
        <Text variant="titleLarge" style={styles.title}>{title}</Text>
        <Text variant="bodyMedium">{content}</Text>
        {children && <View style={styles.children}>{children}</View>}
      </PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    marginBottom: 8,
  },
  children: {
    marginTop: 16,
  },
});