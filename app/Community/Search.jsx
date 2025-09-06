import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../Theme/ThemeProvider';
import { communityService, buildStorageUrl, authService } from '../../services/api';
import Header from '../../components/HeaderBack';
import Navbar from '../../components/Navbar';

const Search = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === 'light' ? '#ffffff' : '#14181F';
  const navBarBackground = theme === 'light' ? '#ffffff' : '#14181F';
  const cardBackground = theme === 'light' ? '#ffffff' : '#14181F';
  const textColor = colors.text;

  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user data
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await authService.getProfileCached();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  // Handle profile navigation
  const handleProfilePress = (postUserId) => {
    if (currentUser && postUserId === currentUser.id) {
      // Navigate to own profile
      router.push("/Profile/MainProfile");
    } else {
      // Navigate to other user's profile
      router.push({
        pathname: "/Profile/OtherProfile",
        params: { userId: postUserId }
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await communityService.getPosts({ search: searchQuery.trim() });
      if (response.success) {
        setPosts(response.data.data || []);
      } else {
        Alert.alert('Error', response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Parse event details from post content
  const parseEventDetails = (content) => {
    if (!content) return { date: null, time: null, location: null, description: content };
    
    const lines = content.split('\n');
    let description = content;
    let date = null;
    let time = null;
    let location = null;
    
    // Look for "Event Details:" section
    const eventDetailsIndex = lines.findIndex(line => line.includes('Event Details:'));
    if (eventDetailsIndex !== -1) {
      // Extract description (everything before "Event Details:")
      description = lines.slice(0, eventDetailsIndex).join('\n').trim();
      
      // Parse event details
      const eventLines = lines.slice(eventDetailsIndex + 1);
      eventLines.forEach(line => {
        if (line.startsWith('Date:')) {
          date = line.replace('Date:', '').trim();
        } else if (line.startsWith('Time:')) {
          time = line.replace('Time:', '').trim();
        } else if (line.startsWith('Location:')) {
          location = line.replace('Location:', '').trim();
        }
      });
    }
    
    return { date, time, location, description };
  };

  const goToViewPost = (postData) => {
    router.push({
      pathname: '/Community/ViewPost',
      params: {
        postId: postData.id.toString(),
        postData: JSON.stringify(postData),
      },
    });
  };

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case "announcement":
        return "#e74c3c"; // Red
      case "events":
        return "#3498db"; // Blue
      case "business":
        return "#f39c12"; // Orange
      case "project":
        return "#27ae60"; // Green
      default:
        return "#95a5a6"; // Light Gray
    }
  };

  const CategoryBadge = ({ category }) => (
    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) }]}>
      <Text style={styles.categoryText}>{category?.toUpperCase() || "GENERAL"}</Text>
    </View>
  );

  const renderPost = (post) => (
    <TouchableOpacity
      key={post.id}
      style={[styles.postCard, { backgroundColor: cardBackground }]}
      onPress={() => goToViewPost(post)}
    >
      <TouchableOpacity 
        style={styles.postHeader}
        onPress={() => handleProfilePress(post.user?.id)}
      >
        <View style={styles.avatarContainer}>
          {post.user?.profile_picture ? (
            <Image
              source={{ uri: buildStorageUrl(post.user.profile_picture) }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#ccc" />
            </View>
          )}
        </View>
        <View style={styles.postInfo}>
          <View style={styles.postHeaderTop}>
            <Text style={[styles.postAuthor, { color: textColor }]}>
              {post.user?.is_admin ? 'Administrator' : (post.user?.name || 'Unknown User')}
            </Text>
            <CategoryBadge category={post.category} />
          </View>
          <Text style={[styles.postTime, { color: textColor }]}>
            {new Date(post.published_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.postContent, { color: textColor }]}>
        {post.category?.toLowerCase() === 'events' 
          ? parseEventDetails(post.content).description 
          : post.content}
      </Text>
      
      {/* Event Details for Event Posts */}
      {post.category?.toLowerCase() === 'events' && (() => {
        const eventDetails = parseEventDetails(post.content);
        if (eventDetails.date || eventDetails.time || eventDetails.location) {
          return (
            <View style={styles.eventMetaContainer}>
              {eventDetails.date && (
                <View style={styles.eventMetaRow}>
                  <Ionicons name="calendar-outline" size={14} color={textColor} />
                  <Text style={[styles.eventMetaText, { color: textColor }]}>
                    {eventDetails.date}
                  </Text>
                </View>
              )}
              
              {eventDetails.time && (
                <View style={styles.eventMetaRow}>
                  <Ionicons name="time-outline" size={14} color={textColor} />
                  <Text style={[styles.eventMetaText, { color: textColor }]}>
                    {eventDetails.time}
                  </Text>
                </View>
              )}
              
              {eventDetails.location && (
                <View style={styles.eventMetaRow}>
                  <Ionicons name="location-outline" size={14} color={textColor} />
                  <Text style={[styles.eventMetaText, { color: textColor }]}>
                    {eventDetails.location}
                  </Text>
                </View>
              )}
            </View>
          );
        }
        return null;
      })()}

      {post.images && post.images.length > 0 && (
        <Image
          source={{ uri: buildStorageUrl(post.images[0]) }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.postStats}>
        <Text style={[styles.statText, { color: textColor }]}>
          {post.likes_count || 0} likes
        </Text>
        <Text style={[styles.statText, { color: textColor }]}>
          {post.comments_count || 0} comments
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />

      <View style={styles.container}>
        <Header title="Search Posts" />

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: cardBackground }]}>
            <Ionicons name="search-outline" size={20} color={textColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search posts..."
              placeholderTextColor={textColor + '60'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} disabled={loading}>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={loading ? textColor + '60' : textColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: textColor }]}>
                Searching...
              </Text>
            </View>
          ) : posts.length === 0 && searchQuery ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: textColor }]}>
                No posts found for "{searchQuery}"
              </Text>
            </View>
          ) : (
            posts.map(renderPost)
          )}
        </ScrollView>

        <View
          style={[
            styles.navWrapper,
            {
              paddingBottom: insets.bottom || 16,
              backgroundColor: navBarBackground,
            },
          ]}
        >
          <Navbar />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  postCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInfo: {
    marginLeft: 8,
    flex: 1,
  },
  postHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: { 
    color: "#ffffff", 
    fontSize: 10, 
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  eventMetaContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventMetaText: {
    marginLeft: 6,
    fontSize: 12,
    opacity: 0.8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  navWrapper: {
    backgroundColor: '#fff',
  },
});