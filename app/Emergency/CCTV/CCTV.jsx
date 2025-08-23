import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, Platform, Modal } from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../../../components/Navbar";
import HeaderBack from "../../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { cctvService, authService } from '../../../services/api';

const CCTV = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('request');
  const [requestReason, setRequestReason] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestLocation, setRequestLocation] = useState('');
  const [requestTime, setRequestTime] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalText, setSuccessModalText] = useState('');

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#1F2633";
  const textColor = colors.text;

  // CCTV API-backed state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [residentId, setResidentId] = useState(null);
  const [residentName, setResidentName] = useState('');

  const isFetchingRef = useRef(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await cctvService.list({ page: 1 });
      const items = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      setRequests(prev => {
        if (!residentId) return items;
        return items.filter(r => String(r.resident_id) === String(residentId));
      });
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  }, [residentId]);

  useEffect(() => {
    (async () => {
      try {
        const user = await authService.getProfileCached({ force: true });
        const uid = user?.id ?? user?.data?.id ?? null;
        setResidentId(uid);
        const name = user?.name ?? user?.data?.name ?? '';
        setResidentName(name);
      } catch (_) {
        setResidentId(null);
      }
      await fetchRequests();
    })();
  }, [fetchRequests]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab !== 'ongoing') return undefined;
      if (isFetchingRef.current) return undefined;
      fetchRequests();
      const intervalId = setInterval(() => {
        fetchRequests();
      }, 2000);
      return () => clearInterval(intervalId);
    }, [activeTab, residentId])
  );

  const handleSendRequest = async () => {
    if (!requestReason.trim() || !requestDate.trim() || !requestLocation.trim() || !requestTime.trim()) {
      return;
    }
    if (!residentId) {
      Alert.alert('Not logged in', 'Please log in again to submit a request.');
      return;
    }
    try {
      const payload = {
        resident_id: residentId,
        reason: requestReason.trim(),
        date_of_incident: requestDate,
        time_of_incident: requestTime.length === 5 ? `${requestTime}:00` : requestTime,
        location: requestLocation.trim(),
      };
      await cctvService.create(payload);
      await fetchRequests();
      setRequestReason('');
      setRequestDate('');
      setRequestLocation('');
      setRequestTime('');
      setActiveTab('ongoing');
      setSuccessModalText('Your CCTV request has been submitted successfully.');
      setSuccessModalVisible(true);
    } catch (e) {
      Alert.alert('Failed to send', 'There was a problem submitting your request.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in_progress': return '#4A90E2';
      case 'completed': return '#28942c';
      case 'cancelled': return '#999';
      default: return '#999';
    }
  };


  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'Processing';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };





  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setRequestDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      setRequestTime(selectedTime.toTimeString().split(' ')[0].substring(0, 5));
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  const formatTime = (time) => {
    return time.toTimeString().split(' ')[0].substring(0, 5);
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

  const openFollowUpModal = (req) => {
    setSelectedRequest(req);
    setFollowUpMessage('');
    setShowFollowUpModal(true);
  };

  const sendFollowUp = async () => {
    if (!selectedRequest || !followUpMessage.trim()) return;
    try {
      const current = Array.isArray(selectedRequest.followups) ? selectedRequest.followups : [];
      const next = [...current, { content: followUpMessage.trim(), created_at: new Date().toISOString() }];
      await cctvService.updateFollowups(selectedRequest.id, next);
      setShowFollowUpModal(false);
      setFollowUpMessage('');
      // Refresh only this request to keep its position
      const updated = await cctvService.show(selectedRequest.id);
      const updatedReq = updated?.data ? updated.data : updated;
      setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
      setSelectedRequest(null);
    } catch (e) {
      Alert.alert('Failed', 'Unable to send follow-up.');
    }
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
                  <TouchableOpacity
                    style={[styles.pickerButton, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      borderColor: theme === "light" ? '#e0e0e0' : '#444'
                    }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.pickerButtonText, { color: requestDate ? textColor : (theme === "light" ? "#999" : "#888") }]}>
                      {requestDate || "Select date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={theme === "light" ? "#666" : "#aaa"} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Time of Incident</Text>
                  <TouchableOpacity
                    style={[styles.pickerButton, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      borderColor: theme === "light" ? '#e0e0e0' : '#444'
                    }]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={[styles.pickerButtonText, { color: requestTime ? textColor : (theme === "light" ? "#999" : "#888") }]}>
                      {requestTime || "Select time"}
                    </Text>
                    <Ionicons name="time-outline" size={20} color={theme === "light" ? "#666" : "#aaa"} />
                  </TouchableOpacity>
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

                <TouchableOpacity
                  style={[styles.submitButton, { opacity: requestReason && requestDate && requestLocation && requestTime ? 1 : 0.5 }]}
                  onPress={handleSendRequest}
                  disabled={!requestReason || !requestDate || !requestLocation || !requestTime}
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
                Your Requests ({requests.length})
              </Text>
              
              {requests.length > 0 ? (
                <View style={styles.requestsList}>
                                    {requests.map((item) => ( 
                    <View key={`req-${String(item.id)}`} style={[styles.requestCard, { backgroundColor: cardBackground }]}>
                                            <View style={styles.requestHeader}>
                        <Text style={[styles.ticketNumber, { color: textColor }]}>{item.cctv_id || `CCTV-${String(item.id).padStart(3, '0')}`}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                        </View>
                      </View>
                      <Text style={[styles.requestReason, { color: textColor }]}>{item.reason}</Text>
                      <View style={styles.requestDetails}>
                        <Text style={[styles.requestDetail, { color: theme === "light" ? '#888' : '#aaa' }]}>Location: {item.location}</Text>
                        <Text style={[styles.requestDetail, { color: theme === "light" ? '#888' : '#aaa' }]}>
                          {(() => {
                            const d = (item.date_of_incident || '').slice(0,10);
                            const tRaw = item.time_of_incident || '';
                            const t = /^\d{2}:\d{2}/.test(tRaw) ? tRaw.slice(0,5) : (tRaw.includes('T') ? tRaw.slice(11,16) : tRaw);
                            return `Date: ${d}${t ? ` at ${t}` : ''}`;
                          })()}
                        </Text>
                      </View>

                      {/* Follow-ups */}
                      {!!(item.followups && item.followups.length) && (
                        <View style={[styles.followUpsContainer, { borderTopColor: theme === 'light' ? '#eee' : '#444' }]}>
                          <Text style={[styles.followUpsTitle, { color: textColor }]}>Follow-ups</Text>
                          {item.followups.map((f, idx) => {
                            const sender = f.admin_name ? 'Administrator' : (residentName || 'Resident');
                            const isAdmin = sender.toLowerCase() === 'administrator';
                            const message = typeof f === 'string' ? f : (f.content || f.message || JSON.stringify(f));
                            return (
                              <View
                                key={`fu-${String(f.id ?? '')}-${idx}`}
                                style={[
                                  styles.followUpItem,
                                  isAdmin ? styles.followUpItemAdmin : styles.followUpItemResident,
                                ]}
                              >
                                <View style={styles.followUpHeader}>
                                  <Ionicons name="person-circle-outline" size={18} color={isAdmin ? '#4A90E2' : '#28942c'} />
                                  <Text style={[styles.followUpSender, { color: textColor }]}>{sender}</Text>
                                </View>
                                <Text style={[styles.followUpMessage, { color: theme === 'light' ? '#444' : '#ddd' }]}>{message}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'center' }}>
                        <TouchableOpacity style={styles.followUpButton} onPress={() => openFollowUpModal(item)}>
                          <Text style={[styles.followUpButtonText, { color: '#28942c' }]}>Follow-up</Text>
                        </TouchableOpacity>
                        {Array.isArray(item.footage) && item.footage.length > 0 && (
                          <TouchableOpacity style={styles.followUpButton} onPress={() => router.push({ pathname: '/Emergency/CCTV/FootageList', params: { id: String(item.id) } })}>
                            <Text style={[styles.followUpButtonText, { color: '#28942c' }]}>View Footage</Text>
                          </TouchableOpacity>
                        )}
                      </View>

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
      <Modal visible={showFollowUpModal} transparent animationType="fade" onRequestClose={() => { setShowFollowUpModal(false); setSelectedRequest(null); setFollowUpMessage(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="chatbubble-outline" size={20} color="#28942c" />
                <Text style={[styles.modalTitle, { color: textColor }]}>Send Follow-up</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => { setShowFollowUpModal(false); setSelectedRequest(null); setFollowUpMessage(''); }}
              >
                <Ionicons name="close" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: theme === 'light' ? '#666' : '#aaa' }]}>Add a message to update your request</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme === 'light' ? '#f8f9fa' : '#2A3441', color: textColor, borderColor: theme === 'light' ? '#e0e0e0' : '#444' }]}
              placeholder="Type your message here..."
              placeholderTextColor={theme === 'light' ? '#999' : '#888'}
              value={followUpMessage}
              onChangeText={setFollowUpMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalCancelButton, { borderColor: theme === 'light' ? '#e0e0e0' : '#444' }]} onPress={() => { setShowFollowUpModal(false); setSelectedRequest(null); setFollowUpMessage(''); }}>
                <Text style={[styles.modalCancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSendButton, { opacity: followUpMessage.trim() ? 1 : 0.5 }]} onPress={sendFollowUp} disabled={!followUpMessage.trim()}>
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={selectedDate}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={selectedTime}
          onChange={handleTimeChange}
        />
      )}
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
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  successButton: {
    backgroundColor: '#28942c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 