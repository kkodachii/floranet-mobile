import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, FlatList, Modal } from "react-native";
import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import HeaderBack from "../../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const CCTV = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('request');
  const [requestReason, setRequestReason] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestLocation, setRequestLocation] = useState('');
  const [requestTime, setRequestTime] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#1F2633";
  const textColor = colors.text;

  // Mock data for ongoing requests
  const [ongoingRequests, setOngoingRequests] = useState([
    {
      id: '1',
      reason: 'Theft investigation',
      date: '2024-01-15',
      location: 'Building A - Parking Lot',
      time: '14:30',
      status: 'pending',
      ticketNumber: 'CCTV-2024-001',
      followUps: []
    },
    {
      id: '2',
      reason: 'Vehicle accident',
      date: '2024-01-14',
      location: 'Main Entrance',
      time: '09:15',
      status: 'processing',
      ticketNumber: 'CCTV-2024-002',
      followUps: [
        {
          id: '1',
          message: 'Any updates on this request?',
          date: '2024-01-15',
          time: '10:30'
        }
      ]
    },
    {
      id: '3',
      reason: 'Suspicious activity',
      date: '2024-01-13',
      location: 'Building B - Lobby',
      time: '16:45',
      status: 'completed',
      ticketNumber: 'CCTV-2024-003',
      followUps: []
    }
  ]);

  const handleSendRequest = () => {
    if (!requestReason.trim() || !requestDate.trim() || !requestLocation.trim() || !requestTime.trim()) {
      return;
    }

    const newRequest = {
      id: Date.now().toString(),
      reason: requestReason,
      date: requestDate,
      location: requestLocation,
      time: requestTime,
      status: 'pending',
      ticketNumber: `CCTV-2024-${String(ongoingRequests.length + 1).padStart(3, '0')}`,
      followUps: []
    };

    setOngoingRequests([newRequest, ...ongoingRequests]);
    setRequestReason('');
    setRequestDate('');
    setRequestLocation('');
    setRequestTime('');
    setActiveTab('ongoing');
  };

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

  const handleFollowUp = () => {
    if (!followUpMessage.trim()) {
      return;
    }

    const updatedRequests = ongoingRequests.map(request => {
      if (request.id === selectedRequestId) {
        const newFollowUp = {
          id: Date.now().toString(),
          message: followUpMessage,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5)
        };
        return {
          ...request,
          followUps: [...request.followUps, newFollowUp]
        };
      }
      return request;
    });

    setOngoingRequests(updatedRequests);
    setFollowUpMessage('');
    setShowFollowUpModal(false);
    setSelectedRequestId(null);
  };

  const openFollowUpModal = (requestId) => {
    setSelectedRequestId(requestId);
    setShowFollowUpModal(true);
  };



  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? '#28942c' : 'transparent',
          borderColor: isActive ? '#28942c' : '#28942c',
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.tabButtonText,
        { color: isActive ? '#fff' : '#28942c' }
      ]}>
        {title}
      </Text>
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
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      <View style={styles.container}>
        <HeaderBack title="CCTV Footage" />

        <View style={styles.tabContainer}>
          <TabButton
            title="Send Request"
            isActive={activeTab === 'request'}
            onPress={() => setActiveTab('request')}
          />
          <TabButton
            title="Ongoing Requests"
            isActive={activeTab === 'ongoing'}
            onPress={() => setActiveTab('ongoing')}
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'request' ? (
            <View style={styles.requestForm}>
              <View style={[styles.formCard, { backgroundColor: cardBackground }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Request CCTV Footage</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Reason for Request</Text>
                                        <TextInput
                        style={[styles.textInput, { 
                          backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                          color: textColor,
                          borderColor: theme === "light" ? '#ccc' : '#444'
                        }]}
                        placeholder="Enter reason for CCTV footage request"
                        placeholderTextColor={theme === "light" ? "#888" : "#aaa"}
                        value={requestReason}
                        onChangeText={setRequestReason}
                        multiline
                        numberOfLines={3}
                      />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Date of Incident</Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      color: textColor,
                      borderColor: theme === "light" ? '#ccc' : '#444'
                    }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme === "light" ? "#888" : "#aaa"}
                    value={requestDate}
                    onChangeText={setRequestDate}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Location of Incident</Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      color: textColor,
                      borderColor: theme === "light" ? '#ccc' : '#444'
                    }]}
                    placeholder="e.g., Building A - Parking Lot"
                    placeholderTextColor={theme === "light" ? "#888" : "#aaa"}
                    value={requestLocation}
                    onChangeText={setRequestLocation}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Time of Incident</Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      color: textColor,
                      borderColor: theme === "light" ? '#ccc' : '#444'
                    }]}
                    placeholder="HH:MM (24-hour format)"
                    placeholderTextColor={theme === "light" ? "#888" : "#aaa"}
                    value={requestTime}
                    onChangeText={setRequestTime}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSendRequest}
                >
                  <Text style={styles.submitButtonText}>Send Request</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={24} color="#28942c" />
                  <Text style={[styles.infoTitle, { color: textColor }]}>Request Guidelines</Text>
                </View>
                <Text style={[styles.infoText, { color: theme === "light" ? '#555' : '#ccc' }]}>
                  • Provide a clear reason for your request{'\n'}
                  • Include the specific date, time, and location of the incident{'\n'}
                  • Be as specific as possible about the incident details{'\n'}
                  • Requests are reviewed by admin within 24-48 hours{'\n'}
                  • You will be notified when footage is available
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.ongoingRequests}>
              <Text style={[styles.sectionTitle, { color: '#28942c' }]}>
                Your Requests ({ongoingRequests.length})
              </Text>
              
              {ongoingRequests.length > 0 ? (
                <View style={styles.requestsList}>
                  {ongoingRequests.map((item) => (
                    <View key={item.id} style={[styles.requestCard, { backgroundColor: cardBackground }]}>
                      <View style={styles.requestHeader}>
                        <Text style={[styles.ticketNumber, { color: textColor }]}>{item.ticketNumber}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                        </View>
                      </View>
                      <Text style={[styles.requestReason, { color: textColor }]}>{item.reason}</Text>
                      <View style={styles.requestDetails}>
                        <Text style={[styles.requestDetail, { color: theme === "light" ? '#888' : '#aaa' }]}>
                          Location: {item.location}
                        </Text>
                        <Text style={[styles.requestDetail, { color: theme === "light" ? '#888' : '#aaa' }]}>
                          Date: {item.date} at {item.time}
                        </Text>
                      </View>

                      {item.followUps.length > 0 && (
                        <View style={[
                          styles.followUpsContainer, 
                          { borderTopColor: theme === "light" ? '#eee' : '#444' }
                        ]}>
                          <Text style={[styles.followUpsTitle, { color: textColor }]}>Follow-ups:</Text>
                                                    {item.followUps.map((followUp) => (
                            <View key={followUp.id} style={[
                              styles.followUpItem, 
                              { backgroundColor: theme === "light" ? '#f8f9fa' : '#2A3441' }
                            ]}>
                              <Text style={[styles.followUpMessage, { color: textColor }]}>{followUp.message}</Text>
                              <Text style={[styles.followUpDate, { color: theme === "light" ? '#888' : '#aaa' }]}>
                                {followUp.date} at {followUp.time}
                              </Text>
                            </View>
                          ))}
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
                  <Ionicons name="videocam-outline" size={48} color="#ccc" />
                  <Text style={[styles.emptyStateText, { color: textColor }]}>
                    No requests yet
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: theme === "light" ? '#888' : '#aaa' }]}>
                    Send your first CCTV footage request
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
          setSelectedRequestId(null);
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
                  setSelectedRequestId(null);
                  setFollowUpMessage('');
                }}
              >
                <Ionicons name="close" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: theme === "light" ? '#666' : '#aaa' }]}>
              Add additional information or ask for updates about your request
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
                  setSelectedRequestId(null);
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
                disabled={!followUpMessage.trim()}
              >
                <Text style={styles.modalSendButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CCTV;

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
  requestForm: {
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
  ongoingRequests: {
    gap: 16,
  },
  requestsList: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  requestCard: {
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
  requestHeader: {
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
  requestReason: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  requestDetails: {
    gap: 4,
  },
  requestDetail: {
    fontSize: 14,
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
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  followUpMessage: {
    fontSize: 14,
    marginBottom: 4,
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
}); 