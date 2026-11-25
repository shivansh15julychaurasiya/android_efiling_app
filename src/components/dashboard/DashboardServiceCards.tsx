
import React from 'react';

import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DashboardCard } from '../../types/dashboard';
import styles from '../../styles/dashboardStyles';

/*
 * ============================================================
 * Developed By : Vijay Chaurasiya
 * Module       : Dashboard Court Service Cards
 * Application  : Allahabad High Court eFiling App
 * Description  : Displays available court services and
 *                provides navigation to individual services.
 * ============================================================
 */

type Props = {
  cards: DashboardCard[];
  onCardPress: (card: DashboardCard) => void;
  getIconBackground: (index: number) => { backgroundColor: string };
};

const DashboardServiceCards: React.FC<Props> = ({
  cards,
  onCardPress,
  getIconBackground,
}) => (
  <>
    {/* Section Header */}
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>
          Court Services
        </Text>

        <Text style={styles.sectionSubtitle}>
          Access your e-Filing services
        </Text>
      </View>

      <View style={styles.serviceCountBadge}>
        <Text style={styles.serviceCountText}>
          {cards.length}
        </Text>
      </View>
    </View>

    {/* Service Cards */}
    <View style={styles.cardsGrid}>
      {cards.map((card) => (
        <TouchableOpacity
          key={card.index}
          style={styles.serviceCard}
          onPress={() => onCardPress(card)}
          activeOpacity={0.82}
        >
          {/* Card Header */}
          <View style={styles.serviceTop}>
            <View
              style={[
                styles.serviceIcon,
                getIconBackground(card.index),
              ]}
            >
              <Text style={styles.serviceIconText}>
                {card.icon}
              </Text>
            </View>

            <View style={styles.serviceArrowBox}>
              <Text style={styles.serviceArrow}>
                →
              </Text>
            </View>
          </View>

          {/* Service Value */}
          <Text style={styles.serviceValue}>
            {card.value}
          </Text>

          {/* Service Title */}
          <Text
            style={styles.serviceTitle}
            numberOfLines={2}
          >
            {card.title}
          </Text>

          {/* Card Footer */}
          <View style={styles.serviceBottom}>
            <Text style={styles.serviceOpenText}>
              OPEN SERVICE
            </Text>

            <Text style={styles.serviceFooterArrow}>
              →
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </>
);

export default DashboardServiceCards;
