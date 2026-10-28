import React from 'react';
import { Image, Text, View } from 'react-native';
import { LoggedInUser } from '../../types/dashboard';
import styles from '../../styles/dashboardStyles';

type Props = {
  user: LoggedInUser | null;
  profileImage: string | null;
  getUserName: () => string;
  getInitials: () => string;
  getRole: () => string;
  getLastLogin: () => string;
};

const ProfileCard: React.FC<Props> = ({
  user, profileImage, getUserName, getInitials, getRole, getLastLogin,
}) => (
  <View style={styles.profileCard}>
    <View style={styles.profileHeader}>
      <View style={styles.profileImageWrapper}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileInitials}>
            <Text style={styles.profileInitialsText}>{getInitials()}</Text>
          </View>
        )}
        <View style={styles.onlineDot} />
      </View>

      <View style={styles.profileMainInfo}>
        <Text style={styles.profileWelcome}>Welcome back</Text>
        <Text style={styles.profileName} numberOfLines={1}>{getUserName()}</Text>
        <View style={styles.roleLastLoginRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{getRole()}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Last Login: {getLastLogin()}</Text>
          </View>
        </View>
      </View>
    </View>

    <View style={styles.profileDivider} />

    <View style={styles.profileDetailsRow}>
      <View style={styles.profileDetail}>
        <Text style={styles.profileDetailLabel}>USERNAME</Text>
        <Text style={styles.profileDetailValue} numberOfLines={1}>
          {user?.username || 'Not available'}
        </Text>
      </View>
      <View style={styles.detailSeparator} />
      <View style={styles.profileDetail}>
        <Text style={styles.profileDetailLabel}>MOBILE</Text>
        <Text style={styles.profileDetailValue}>{user?.um_mobile || 'Not available'}</Text>
      </View>
    </View>

    <View style={styles.profileDetailsRow}>
      <View style={styles.profileDetail}>
        <Text style={styles.profileDetailLabel}>EMAIL</Text>
        <Text style={styles.profileDetailValue} numberOfLines={1}>
          {user?.um_email || 'Not available'}
        </Text>
      </View>
      <View style={styles.detailSeparator} />
      <View style={styles.profileDetail}>
        <Text style={styles.profileDetailLabel}>ROLE</Text>
        <Text style={styles.profileDetailValue}>{getRole()}</Text>
      </View>
    </View>
  </View>
);

export default ProfileCard;
