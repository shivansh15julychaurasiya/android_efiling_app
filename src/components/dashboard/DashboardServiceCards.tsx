import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { DashboardCard } from '../../types/dashboard';
import styles from '../../styles/dashboardStyles';

type Props = {
  cards: DashboardCard[];
  onCardPress: (card: DashboardCard) => void;
  getIconBackground: (index: number) => { backgroundColor: string };
};

const DashboardServiceCards: React.FC<Props> = ({ cards, onCardPress, getIconBackground }) => (
  <>
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>Court Services</Text>
        <Text style={styles.sectionSubtitle}>Access your e-Filing services</Text>
      </View>
      <View style={styles.serviceCountBadge}>
        <Text style={styles.serviceCountText}>{cards.length}</Text>
      </View>
    </View>

    <View style={styles.cardsGrid}>
      {cards.map(card => (
        <TouchableOpacity
          key={card.index}
          style={styles.serviceCard}
          onPress={() => onCardPress(card)}
          activeOpacity={0.85}
        >
          <View style={styles.serviceTop}>
            <View style={[styles.serviceIcon, getIconBackground(card.index)]}>
              <Text style={styles.serviceIconText}>{card.icon}</Text>
            </View>
            <Text style={styles.serviceArrow}>→</Text>
          </View>
          <Text style={styles.serviceValue}>{card.value}</Text>
          <Text style={styles.serviceTitle} numberOfLines={2}>{card.title}</Text>
          <View style={styles.serviceBottom}>
            <Text style={styles.serviceOpenText}>OPEN SERVICE</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </>
);

export default DashboardServiceCards;
