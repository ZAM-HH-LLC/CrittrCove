import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackHeader from '../components/BackHeader';
import { theme } from '../styles/theme';

const BlogPost = ({ route, navigation }) => {
  const post = route?.params?.post;
  const theme = useTheme();

  // If no post data is available, show an error state
  if (!post) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
        <BackHeader 
          title="Blog Post"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={48} 
            color={theme.colors.error} 
          />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Blog post not found
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Blog')}
          >
            <Text style={[styles.errorButtonText, { color: theme.colors.surface }]}>
              Go to Blog List
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleReferencePress = (reference) => {
    if (reference.url) {
      Linking.openURL(reference.url);
    } else if (reference.doi) {
      Linking.openURL(`https://doi.org/${reference.doi}`);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      <BackHeader 
        title={post.title}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: post.author.profilePicture }}
              style={styles.authorImage}
            />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: theme.colors.secondary }]}>
                {post.author.name}
              </Text>
              <Text style={styles.authorBio}>{post.author.bio}</Text>
              <View style={styles.postInfo}>
                <Text style={styles.date}>{post.publishDate}</Text>
                <Text style={styles.dot}> • </Text>
                <Text style={styles.readTime}>{post.readTime}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tags}>
          {post.tags.map((tag, index) => (
            <View 
              key={index} 
              style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}
            >
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.content, { color: theme.colors.text }]}>{post.content}</Text>

        <View style={styles.stats}>
          <TouchableOpacity style={styles.stat}>
            <MaterialCommunityIcons name="heart-outline" size={24} color={theme.colors.secondary} />
            <Text style={styles.statText}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <MaterialCommunityIcons name="comment-outline" size={24} color={theme.colors.secondary} />
            <Text style={styles.statText}>{post.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <MaterialCommunityIcons name="share-outline" size={24} color={theme.colors.secondary} />
            <Text style={styles.statText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.references}>
          <Text style={[styles.referencesTitle, { color: theme.colors.primary }]}>References</Text>
          {post.references.map((reference, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reference}
              onPress={() => handleReferencePress(reference)}
            >
              <Text style={styles.referenceText}>
                {reference.authors} ({reference.year || 'n.d.'}). {reference.title}. {reference.publication}.
                {reference.doi && ` DOI: ${reference.doi}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  authorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: theme.fonts.header.fontFamily,
  },
  authorBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: theme.fonts.regular.fontFamily,
  },
  postInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    fontFamily: theme.fonts.regular.fontFamily,
  },
  dot: {
    marginHorizontal: 4,
    color: '#666',
    fontFamily: theme.fonts.regular.fontFamily,
  },
  readTime: {
    fontSize: 14,
    color: '#666',
    fontFamily: theme.fonts.regular.fontFamily,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.fonts.regular.fontFamily,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    fontFamily: theme.fonts.regular.fontFamily,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontFamily: theme.fonts.regular.fontFamily,
  },
  references: {
    padding: 16,
  },
  referencesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: theme.fonts.header.fontFamily,
  },
  reference: {
    marginBottom: 12,
  },
  referenceText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    fontFamily: theme.fonts.regular.fontFamily,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: theme.fonts.regular.fontFamily,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: theme.fonts.regular.fontFamily,
  },
});

export default BlogPost;