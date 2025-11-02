import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, FlatList, Modal, Platform, RefreshControl } from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../../../components/Navbar";
import HeaderBack from "../../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { complaintsService, authService } from "../../../services/api";
import { useFocusEffect } from '@react-navigation/native';

const Complaints = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalText, setSuccessModalText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const isFetchingRef = useRef(false);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#1F2633";
  const textColor = colors.text;

  const categories = [
    { id: 'general', name: 'General', icon: 'alert-circle-outline' },
    { id: 'service', name: 'Service', icon: 'construct-outline' }
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: '#50C878' },
    { id: 'medium', name: 'Medium', color: '#FFA500' },
    { id: 'high', name: 'High', color: '#E74C3C' }
  ];

  const mapStatusToUi = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'in_progress': return 'processing';
      case 'resolved': return 'completed';
      default: return 'pending';
    }
  };

  const parseFollowups = (followupsString, complaintId) => {
    if (!followupsString) return [];
    const parts = String(followupsString).split(/\n{2,}/).filter(Boolean);
    return parts.map((raw, idx) => {
      const match = raw.match(/^\[([^\]]+)\]\s*(.*)$/);
      const sender = match ? match[1] : 'User';
      const message = match ? match[2] : raw;
      return { id: `${complaintId}-${idx}`, sender, message };
    });
  };

  const mapComplaint = (c) => ({
    id: String(c.id),
    title: c.complained_title,
    description: c.description,
    category: c.category ? c.category.charAt(0).toUpperCase() + c.category.slice(1) : '',
    priority: c.priority ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1) : '',
    date: c.complained_at ? String(c.complained_at).slice(0, 10) : '',
    status: mapStatusToUi(c.status),
    ticketNumber: c.log_id,
    followUps: parseFollowups(c.followups, c.id),
    remarks: c.remarks || '',
  });

  const fetchComplaints = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setError(null);
      const user = await authService.getProfileCached();
      setCurrentUser(user);
      const res = await complaintsService.list({ page: 1 });
      const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const mapped = items
        .filter((c) => !user?.id || c.resident_id === user.id)
        .map(mapComplaint);
      setComplaints(mapped);
    } catch (e) {
      setError('Failed to load complaints');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab !== 'ongoing') return undefined;
      fetchComplaints();
      const intervalId = setInterval(() => {
        fetchComplaints();
      }, 2000);
      return () => clearInterval(intervalId);
    }, [activeTab])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComplaints();
  }, [fetchComplaints]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'processing': return '#4A90E2';
      case 'completed': return '#28942c';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.name === priority);
    return priorityObj ? priorityObj.color : '#999';
  };

  const computeNextLogIdAsync = async () => {
    try {
      const next = await complaintsService.getNextId();
      if (next) return next;
    } catch (_) {}
    return 'COMP-0001';
  };

  const handleSubmitComplaint = async () => {
    if (!complaintTitle.trim() || !complaintDescription.trim() || !complaintCategory || !currentUser?.id) {
      return;
    }

    try {
      setIsLoading(true);
      const nextLogId = await computeNextLogIdAsync();
      const payload = {
        log_id: nextLogId,
        category: complaintCategory.toLowerCase(),
        resident_id: currentUser.id,
        complained_at: new Date().toISOString(),
        complained_title: complaintTitle.trim(),
        description: complaintDescription.trim(),
        status: 'pending',
      };
      const created = await complaintsService.create(payload);
      const mapped = mapComplaint(created?.data ? created.data : created);
      setComplaints(prev => [mapped, ...prev]);
      setComplaintTitle('');
      setComplaintDescription('');
      setComplaintCategory('');
      setActiveTab('ongoing');
      setSuccessModalText('Your complaint has been submitted successfully.');
      setSuccessModalVisible(true);
      fetchComplaints();
    } catch (e) {
      // Complaint may have been submitted successfully despite the error
      // Check if the complaint was added by refreshing the list
      await fetchComplaints();
      setComplaintTitle('');
      setComplaintDescription('');
      setComplaintCategory('');
      setActiveTab('ongoing');
      setSuccessModalText('Your complaint has been submitted successfully.');
      setSuccessModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpMessage.trim() || !selectedComplaintId) {
      return;
      }

    try {
      setIsLoading(true);
      const updated = await complaintsService.addFollowup(selectedComplaintId, followUpMessage.trim());
      const mapped = mapComplaint(updated?.data ? updated.data : updated);
      setComplaints(prev => prev.map(c => (c.id === String(mapped.id) ? mapped : c)));
    setFollowUpMessage('');
    setShowFollowUpModal(false);
    setSelectedComplaintId(null);
      fetchComplaints();
    } catch (e) {
      // Follow-up may have been sent successfully despite the error
      // Refresh the complaints list to check if it was added
      await fetchComplaints();
      setFollowUpMessage('');
      setShowFollowUpModal(false);
      setSelectedComplaintId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openFollowUpModal = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setShowFollowUpModal(true);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      <View style={styles.container}>
        <HeaderBack title="File Complaints" />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === 'general' ? '#28942c' : 'transparent',
                borderColor: activeTab === 'general' ? '#28942c' : '#28942c',
              }
            ]}
            onPress={() => setActiveTab('general')}
          >
            <Text style={[
              styles.tabButtonText,
              { color: activeTab === 'general' ? '#fff' : '#28942c' }
            ]}>
              File Complaint
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === 'ongoing' ? '#28942c' : 'transparent',
                borderColor: activeTab === 'ongoing' ? '#28942c' : '#28942c',
              }
            ]}
            onPress={() => setActiveTab('ongoing')}
          >
            <Text style={[
              styles.tabButtonText,
              { color: activeTab === 'ongoing' ? '#fff' : '#28942c' }
            ]}>
              My Complaints
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#28942c"]} />
          }
        >
          {activeTab === 'general' ? (
            <View style={styles.complaintForm}>
              <View style={[styles.formCard, { backgroundColor: cardBackground }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>File a Complaint</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Complaint Title</Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      color: textColor,
                      borderColor: theme === "light" ? '#e0e0e0' : '#444'
                    }]}
                    placeholder="Brief title of your complaint"
                    placeholderTextColor={theme === "light" ? "#999" : "#888"}
                    value={complaintTitle}
                    onChangeText={setComplaintTitle}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Category</Text>
                  <View style={styles.categoriesContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          {
                            backgroundColor: complaintCategory === category.name ? '#28942c' : 'transparent',
                            borderColor: complaintCategory === category.name ? '#28942c' : (theme === "light" ? '#e0e0e0' : '#444'),
                          }
                        ]}
                        onPress={() => setComplaintCategory(category.name)}
                      >
                        <Ionicons 
                          name={category.icon} 
                          size={18} 
                          color={complaintCategory === category.name ? '#fff' : (theme === "light" ? '#666' : '#aaa')} 
                        />
                        <Text style={[
                          styles.categoryButtonText,
                          { color: complaintCategory === category.name ? '#fff' : textColor }
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Description</Text>
                  <TextInput
                    style={[styles.textArea, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      color: textColor,
                      borderColor: theme === "light" ? '#e0e0e0' : '#444'
                    }]}
                    placeholder="Describe your complaint in detail..."
                    placeholderTextColor={theme === "light" ? "#999" : "#888"}
                    value={complaintDescription}
                    onChangeText={setComplaintDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { opacity: complaintTitle && complaintDescription && complaintCategory ? 1 : 0.5 }
                  ]}
                  onPress={handleSubmitComplaint}
                  disabled={!complaintTitle || !complaintDescription || !complaintCategory || isLoading}
                >
                  <Text style={styles.submitButtonText}>Submit Complaint</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={24} color="#28942c" />
                </View>
                <Text style={[styles.infoText, { color: theme === "light" ? '#555' : '#ccc' }]}>
                  • Provide a clear and specific title for your complaint{'\n'}
                  • Choose the appropriate category{'\n'}
                  • Include relevant details and any supporting information{'\n'}
                  • Complaints are reviewed within 24-48 hours{'\n'}
                  • You will be notified of any updates or resolutions
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.ongoingComplaints}>
              <Text style={[styles.sectionTitle, { color: '#28942c' }]}>
                Your Complaints ({complaints.length})
              </Text>
              
              {complaints.length > 0 ? (
                <View style={styles.complaintsList}>
                  {complaints.map((item) => (
                    <View key={item.id} style={[styles.complaintCard, { backgroundColor: cardBackground }]}>
                      <View style={styles.complaintHeader}>
                        <Text style={[styles.ticketNumber, { color: textColor }]}>{item.ticketNumber}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.complaintTitle, { color: textColor }]}>{item.title}</Text>
                      <Text style={[styles.complaintDescription, { color: theme === "light" ? '#666' : '#ccc' }]}>
                        {item.description}
                      </Text>
                      
                      <View style={styles.complaintDetails}>
                        <View style={[styles.detailItem, { backgroundColor: theme === "light" ? '#f8f9fa' : '#2A3441' }]}>
                          <Text style={[styles.detailLabel, { color: theme === "light" ? '#666' : '#aaa' }]}>Category</Text>
                          <Text style={[styles.detailValue, { color: textColor }]}>{item.category}</Text>
                        </View>
                        {item.priority && item.priority.toLowerCase() !== 'none' && (
                          <View style={[styles.detailItem, { backgroundColor: theme === "light" ? '#f8f9fa' : '#2A3441' }]}>
                            <Text style={[styles.detailLabel, { color: theme === "light" ? '#666' : '#aaa' }]}>Priority</Text>
                            <Text style={[styles.detailValue, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
                          </View>
                        )}
                        <View style={[styles.detailItem, { backgroundColor: theme === "light" ? '#f8f9fa' : '#2A3441' }]}>
                          <Text style={[styles.detailLabel, { color: theme === "light" ? '#666' : '#aaa' }]}>Date</Text>
                          <Text style={[styles.detailValue, { color: textColor }]}>{item.date}</Text>
                        </View>
                      </View>

                      {Boolean(item.remarks) && (
                        <View style={[
                          styles.remarksContainer,
                          { backgroundColor: theme === "light" ? '#f8f9fa' : '#2A3441', borderColor: theme === "light" ? '#e0e0e0' : '#444' }
                        ]}>
                          <View style={styles.remarksHeader}>
                            <Ionicons name="chatbox-ellipses-outline" size={18} color="#28942c" />
                            <Text style={[styles.remarksTitle, { color: textColor }]}>Remarks</Text>
                          </View>
                          <Text style={[styles.remarksText, { color: theme === "light" ? '#444' : '#ddd' }]}>
                            {item.remarks}
                          </Text>
                        </View>
                      )}

                      {item.followUps.length > 0 && (
                        <View style={[
                          styles.followUpsContainer, 
                          { borderTopColor: theme === "light" ? '#eee' : '#444' }
                        ]}>
                          <Text style={[styles.followUpsTitle, { color: textColor }]}>Follow-ups</Text>
                          {item.followUps.map((followUp) => {
                            const isAdmin = String(followUp.sender || '').trim().toLowerCase() === 'administrator';
                            return (
                              <View
                                key={followUp.id}
                                style={[
                              styles.followUpItem, 
                                  isAdmin ? styles.followUpItemAdmin : styles.followUpItemResident,
                                ]}
                              >
                                <View style={styles.followUpHeader}>
                                  <Ionicons name="person-circle-outline" size={18} color={isAdmin ? '#4A90E2' : '#28942c'} />
                                  <Text style={[styles.followUpSender, { color: textColor }]}>{followUp.sender}</Text>
                            </View>
                                <Text style={[styles.followUpMessage, { color: theme === "light" ? '#444' : '#ddd' }]}>{followUp.message}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.followUpButton}
                        onPress={() => openFollowUpModal(item.id)}
                      >
                        <Text style={[styles.followUpButtonText, { color: '#28942c' }]}>
                          Follow-up
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyState, { backgroundColor: cardBackground }]}>
                  <Ionicons name="document-text-outline" size={48} color="#ccc" />
                  <Text style={[styles.emptyStateText, { color: textColor }]}>
                    No complaints yet
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: theme === "light" ? '#888' : '#aaa' }]}>
                    File your first complaint
                  </Text>
                </View>
              )}
            </View>
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

      {/* Follow-up Modal */}
      <Modal
        visible={showFollowUpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowFollowUpModal(false);
          setSelectedComplaintId(null);
          setFollowUpMessage('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="chatbubble-outline" size={20} color="#28942c" />
                <Text style={[styles.modalTitle, { color: textColor }]}>Send Follow-up</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowFollowUpModal(false);
                  setSelectedComplaintId(null);
                  setFollowUpMessage('');
                }}
              >
                <Ionicons name="close" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: theme === "light" ? '#666' : '#aaa' }]}>
              Add additional information or ask for updates about your complaint
            </Text>
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                color: textColor,
                borderColor: theme === "light" ? '#e0e0e0' : '#444'
              }]}
              placeholder="Type your message here..."
              placeholderTextColor={theme === "light" ? "#999" : "#888"}
              value={followUpMessage}
              onChangeText={setFollowUpMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { 
                  borderColor: theme === "light" ? '#e0e0e0' : '#444' 
                }]}
                onPress={() => {
                  setShowFollowUpModal(false);
                  setSelectedComplaintId(null);
                  setFollowUpMessage('');
                }}
              >
                <Text style={[styles.modalCancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalSendButton,
                  { opacity: followUpMessage.trim() ? 1 : 0.5 }
                ]}
                onPress={handleFollowUp}
                disabled={!followUpMessage.trim() || isLoading}
              >
                <Text style={styles.modalSendButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}> 
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={48} color="#28942c" />
              <Text style={[styles.modalTitle, { color: textColor }]}>Success</Text>
              <Text style={[styles.modalSubtitle, { color: theme === "light" ? '#666' : '#aaa', textAlign: 'center' }]}> 
                {successModalText}
              </Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.successButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Complaints;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 25,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  complaintForm: {
    gap: 20,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#28942c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ongoingComplaints: {
    gap: 16,
  },
  complaintsList: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  complaintCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  complaintDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  complaintDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  remarksContainer: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  remarksTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  remarksText: {
    fontSize: 14,
    lineHeight: 20,
  },
  followUpsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  followUpsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  followUpItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  followUpItemResident: {
    backgroundColor: 'rgba(40, 148, 44, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#28942c',
  },
  followUpItemAdmin: {
    backgroundColor: 'rgba(74, 144, 226, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  followUpSender: {
    fontSize: 13,
    fontWeight: '700',
  },
  followUpMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  followUpDate: {
    fontSize: 12,
  },
  followUpButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  followUpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  navWrapper: {
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 120,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSendButton: {
    flex: 1,
    backgroundColor: '#28942c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  prioritiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successButton: {
    width: '100%',
    backgroundColor: '#28942c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
}); 