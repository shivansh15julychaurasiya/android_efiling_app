
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { getLoggedInUser } from '../api/authApi';

import {
  uploadProfileImage,
  UploadProfileImageResponse,
} from '../api/profileApi';


import { downloadProfileImage } from '../services/profileImageService';

/*
 * ============================================================
 * Developed By : Vijay Chaurasiya
 * Module       : Profile Screen
 * Application  : Allahabad High Court eFiling App
 * Description  : Advocate profile, profile image upload,
 *                authenticated image download and display.
 * ============================================================
 */

interface ProfileUser {
  um_id?: number;
  username?: string;
  um_fullname?: string;
  um_email?: string;
  um_mobile?: string;
  um_gender?: string;
  um_profile_image?: string | null;

  userroles?: Array<{
    lk?: {
      lk_longname?: string;
    };
  }>;
}

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const [profile, setProfile] = useState<ProfileUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [profileImageUri, setProfileImageUri] =
    useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Download image using authenticated Axios request.
   * The returned URI points to a local cached image.
   */
  const loadProfileImage = useCallback(
    async (imageName?: string | null): Promise<boolean> => {
      if (!imageName?.trim()) {
        if (mountedRef.current) {
          setProfileImageUri(null);
          setImageLoading(false);
        }

        return true;
      }

      try {
        if (mountedRef.current) {
          setImageLoading(true);
        }

        const localUri = await downloadProfileImage(imageName);

        if (mountedRef.current) {
          setProfileImageUri(localUri);
        }

        if (__DEV__) {
          console.log('[PROFILE IMAGE] Download successful');
        }

        return true;
      } catch (error: any) {
        if (mountedRef.current) {
          setProfileImageUri(null);
        }

        if (__DEV__) {
          console.log('[PROFILE IMAGE DOWNLOAD ERROR]', {
            message: error?.message,
            status: error?.response?.status,
            code: error?.code,
          });
        }

        return false;
      } finally {
        if (mountedRef.current) {
          setImageLoading(false);
        }
      }
    },
    [],
  );

  /* ============================================================
 * Vijay Chaurasiya - Profile Image Download
 * ============================================================ */
  /**
   * Load logged-in advocate details and saved profile image.
   */
  const loadProfile = useCallback(async () => {
    try {
      const result: any = await getLoggedInUser();

     
      const user =
        result?.data?.user ??
        result?.data ??
        result?.user ??
        result;

      if (
        !user ||
        typeof user !== 'object' ||
        !user.username
      ) {
        if (mountedRef.current) {
          setProfile(null);
          setProfileImageUri(null);
        }

        return;
      }

      if (mountedRef.current) {
        setProfile(user);
      }

      await loadProfileImage(user.um_profile_image);
    } catch (error: any) {
      if (__DEV__) {
        console.log('[PROFILE LOAD ERROR]', {
          message: error?.message,
          status: error?.response?.status,
          code: error?.code,
        });
      }

      Alert.alert(
        'Error',
        'Unable to load profile details. Please try again.',
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [loadProfileImage]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Pull-to-refresh.
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, [loadProfile]);


  const handleChangePhoto = async () => {
    if (uploading) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow gallery access to select your profile photo.',
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const image = result.assets[0];

      if (image.fileSize && image.fileSize > 2 * 1024 * 1024) {
        Alert.alert(
          'Image Too Large',
          'Please select an image smaller than 2 MB.',
        );

        return;
      }

      setUploading(true);

      const response: UploadProfileImageResponse =
        await uploadProfileImage({
          uri: image.uri,
          fileName: image.fileName,
          mimeType: image.mimeType,
          fileSize: image.fileSize,
        });

      if (__DEV__) {
        console.log('[PROFILE UPLOAD RESULT]', {
          success: response.success,
          imageNameReceived: Boolean(response.imageName),
          imageUrlReceived: Boolean(response.imageUrl),
        });
      }

      if (!response.success || !response.imageName) {
        Alert.alert(
          'Upload Failed',
          response.message ||
            'Unable to upload profile photo.',
        );

        return;
      }

      // Update profile state with the new server filename.
      setProfile(previous => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          um_profile_image: response.imageName,
        };
      });

      
      const displayed = await loadProfileImage(
        response.imageName,
      );

      if (displayed) {
        Alert.alert(
          'Success',
          response.message ||
            'Profile photo updated successfully.',
        );
      } else {
        Alert.alert(
          'Photo Uploaded',
          'Your photo was uploaded successfully, but it could not be displayed. Please refresh your profile.',
        );
      }
    } catch (error: any) {
      if (__DEV__) {
        console.log('[PROFILE IMAGE UPLOAD ERROR]', {
          message: error?.message,
          code: error?.code,
          status: error?.response?.status,
        });
      }

      Alert.alert(
        'Upload Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Unable to upload profile photo. Please try again.',
      );
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  };

 
  const renderProfileItem = (
    label: string,
    value?: string | null,
  ) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>
        {value && value.trim()
          ? value
          : 'Not Available'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#D4AF37"
        />

        <Text style={styles.loadingText}>
          Loading Profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>
          Profile details are unavailable.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            loadProfile();
          }}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
/* ============================================================
 * Vijay Chaurasiya - Profile Image Download
 * ============================================================ */
  const advocateRole =
    profile.userroles?.[0]?.lk?.lk_longname ||
    'Advocate';

  const gender =
    profile.um_gender === 'M'
      ? 'Male'
      : profile.um_gender === 'F'
        ? 'Female'
        : profile.um_gender || 'Not Available';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#D4AF37']}
        />
      }
    >
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profileImageUri ? (
            <Image
              key={profileImageUri}
              source={{ uri: profileImageUri }}
              style={styles.avatar}
              resizeMode="cover"
              onError={event => {
                if (__DEV__) {
                  console.log(
                    '[LOCAL PROFILE IMAGE ERROR]',
                    event.nativeEvent.error,
                  );
                }

                setProfileImageUri(null);
              }}
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarInitial}>
                {profile.um_fullname
                  ?.charAt(0)
                  ?.toUpperCase() || 'A'}
              </Text>
            </View>
          )}

          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator
                color="#D4AF37"
                size="large"
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleChangePhoto}
            disabled={uploading}
          >
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>
          {profile.um_fullname || 'Advocate'}
        </Text>

        <Text style={styles.role}>
          {advocateRole}
        </Text>

        {uploading && (
          <View style={styles.uploadStatus}>
            <ActivityIndicator color="#D4AF37" />

            <Text style={styles.uploadText}>
              Uploading photo...
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.photoButton,
            uploading && styles.disabledButton,
          ]}
          onPress={handleChangePhoto}
          disabled={uploading}
        >
          <Text style={styles.photoButtonText}>
            {uploading
              ? 'Uploading...'
              : 'Change Profile Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PERSONAL INFORMATION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        {renderProfileItem(
          'Full Name',
          profile.um_fullname,
        )}

        {renderProfileItem(
          'Enrollment / Roll Number',
          profile.username,
        )}

        {renderProfileItem(
          'Mobile Number',
          profile.um_mobile,
        )}

        {renderProfileItem(
          'Email Address',
          profile.um_email,
        )}

        {renderProfileItem(
          'Gender',
          gender,
        )}

        {renderProfileItem(
          'Advocate Role',
          advocateRole,
        )}
      </View>

      {/* CHANGE PASSWORD */}
      <TouchableOpacity
        style={styles.passwordButton}
        onPress={() =>
          navigation.navigate('ChangePassword')
        }
      >
        <Text style={styles.passwordButtonText}>
          🔒 Change Password
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Allahabad High Court eFiling Application
      </Text>
    </ScrollView>
  );
};

/* ============================================================
 * Vijay Chaurasiya - Profile Image Download
 * ============================================================ */
export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },

  content: {
    paddingBottom: 30,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F9',
  },

  loadingText: {
    marginTop: 12,
    color: '#071A3D',
    fontSize: 14,
  },

  errorText: {
    color: '#071A3D',
    fontSize: 15,
  },

  retryButton: {
    backgroundColor: '#071A3D',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  header: {
    backgroundColor: '#071A3D',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 28,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },

  defaultAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  avatarInitial: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#071A3D',
  },

  imageLoadingOverlay: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(7, 26, 61, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraIcon: {
    fontSize: 17,
  },

  name: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },

  role: {
    color: '#D4AF37',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },

  photoButton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },

  disabledButton: {
    opacity: 0.5,
  },

  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },

  uploadText: {
    color: '#FFFFFF',
    fontSize: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    elevation: 3,
  },

  sectionTitle: {
    color: '#071A3D',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  infoItem: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F4',
  },

  infoLabel: {
    color: '#788397',
    fontSize: 12,
    marginBottom: 5,
  },

  infoValue: {
    color: '#071A3D',
    fontSize: 15,
    fontWeight: '600',
  },

  passwordButton: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#071A3D',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  passwordButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    color: '#8993A5',
    fontSize: 11,
    marginTop: 22,
  },
});
/* ============================================================
 * Vijay Chaurasiya - Profile Image Download
 * ============================================================ */