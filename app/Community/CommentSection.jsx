import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/ThemeProvider';

const CommentSection = ({ comments = [], onCommentAdd, postId }) => {
  const { colors, theme } = useTheme();
  const [newComment, setNewComment] = useState('');
  
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

  const handleAddComment = () => {
    if (newComment.trim() && onCommentAdd) {
      onCommentAdd(newComment.trim());
      setNewComment('');
    }
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentItem, { borderBottomColor: colors.border || '#e0e0e0' }]}>
      <View style={styles.commentAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.commentAvatarImage} />
        ) : (
          <View style={[styles.commentAvatarPlaceholder, { backgroundColor: colors.border || '#e0e0e0' }]}>
            <Text style={[styles.commentAvatarText, { color: textColor }]}>
              {item.author.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.commentContent}>
        <View style={[styles.commentBubble, { backgroundColor: buttonBackground }]}>
          <Text style={[styles.commentAuthor, { color: textColor }]}>{item.author}</Text>
          <Text style={[styles.commentText, { color: textColor }]}>{item.content}</Text>
        </View>
        <Text style={[styles.commentTime, { color: colors.textSecondary || '#666' }]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="chatbubble-outline" size={48} color={colors.border || '#e0e0e0'} />
      <Text style={[styles.emptyStateText, { color: colors.textSecondary || '#666' }]}>
        No comments yet
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary || '#666' }]}>
        Be the first to share your thoughts!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id.toString()}
        style={styles.commentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={comments.length === 0 ? styles.emptyListContainer : null}
      />
      
      {/* Comment Input */}
      <View style={[styles.commentInputContainer, { 
        backgroundColor: cardBackground, 
        borderTopColor: colors.border || '#e0e0e0' 
      }]}>
        <View style={styles.commentInputRow}>
          <View style={styles.commentInputAvatar}>
            <View style={[styles.commentAvatarPlaceholder, { backgroundColor: colors.border || '#e0e0e0' }]}>
              <Text style={[styles.commentAvatarText, { color: textColor }]}>U</Text>
            </View>
          </View>
          <TextInput
            style={[styles.commentInput, { 
              backgroundColor: buttonBackground, 
              color: textColor,
              borderColor: colors.border || '#e0e0e0'
            }]}
            placeholder="Write a comment..."
            placeholderTextColor={colors.textSecondary || '#666'}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { 
              backgroundColor: newComment.trim() 
                ? (colors.primary || '#007AFF') 
                : (colors.border || '#e0e0e0')
            }]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Ionicons 
              name="send" 
              size={16} 
              color={newComment.trim() ? '#fff' : (colors.textSecondary || '#666')} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
  },
  commentTime: {
    fontSize: 11,
    marginLeft: 8,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentSection;