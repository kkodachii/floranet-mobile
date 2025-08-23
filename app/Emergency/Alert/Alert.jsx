import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert as RNAlert, TextInput, Modal, RefreshControl } from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../../../components/Navbar";
import HeaderBack from "../../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Call from "./Call";
import { alertsService, authService } from "../../../services/api";
import { adminService } from "../../../services/api";
import { useFocusEffect } from '@react-navigation/native';

const HOTLINES = [
  { id: 'admin', name: 'Admin', number: '09605643884' },
  { id: 'police', name: 'Police', number: '911' },
  { id: 'fire', name: 'Fire Dept', number: '911' },
  { id: 'ambulance', name: 'Ambulance', number: '911' },
];

const EmergencyAlert = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('incident');
  const [incidentType, setIncidentType] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [urgentHelpType, setUrgentHelpType] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedHotline, setSelectedHotline] = useState(HOTLINES[0]);
  const [adminPhone, setAdminPhone] = useState(HOTLINES[0].number);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFetchingRef = useRef(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#1F2633";
  const textColor = colors.text;

  const getAlertStatusColor = (status) => {
    const isDark = theme === 'dark';
    switch (status) {
      case 'Resolved':
        return isDark ? '#145317' : '#388e3c';
      case 'Ongoing':
        return isDark ? '#c66900' : '#ef6c00';
      case 'Pending':
        return isDark ? '#08306b' : '#0d47a1';
      case 'Called':
        return isDark ? '#7f1313' : '#b71c1c';
      case 'Cancelled':
        return isDark ? '#424242' : '#757575';
      default:
        return isDark ? '#424242' : '#757575';
    }
  };

  const fetchAlerts = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const user = await authService.getProfileCached();
      setCurrentUser(user);
      const res = await alertsService.list({ page: 1 });
      const items = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
      setAlerts(items);
    } catch (_) {
    } finally {
      isFetchingRef.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    (async () => {
      const phone = await adminService.getAdminContact();
      if (phone) setAdminPhone(phone);
    })();
  }, [fetchAlerts]);

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
      const id = setInterval(() => fetchAlerts(), 4000);
      return () => clearInterval(id);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts();
  }, [fetchAlerts]);

  const handleIncidentReport = () => {
    if (!incidentDescription.trim() || !incidentLocation.trim()) {
      return;
    }

    setConfirmationType('incident');
    setShowConfirmationModal(true);
  };

  const handleUrgentHelp = () => {
    setConfirmationType('urgent');
    setShowConfirmationModal(true);
  };

  const createAlert = async (type) => {
    if (!currentUser?.id) return;
    try {
      const payload = {
        resident_id: currentUser.id,
        type,
        description: type === 'incident' ? incidentDescription : null,
        location: type === 'incident' ? incidentLocation : null,
        reported_at: new Date().toISOString(),
        status: type === 'incident' ? 'Pending' : 'Called',
      };
      await alertsService.create(payload);
      await fetchAlerts();
      return true;
    } catch (e) {
      RNAlert.alert('Error', 'Failed to send alert.');
      return false;
    }
  };

  const handleConfirmAlert = async () => {
    setShowConfirmationModal(false);
    if (confirmationType === 'incident') {
      const ok = await createAlert('incident');
      if (ok) {
        setIncidentType('');
        setIncidentDescription('');
        setIncidentLocation('');
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 1200);
      }
    } else {
      const ok = await createAlert('urgent');
      if (ok) {
        setShowCallModal(true);
      }
    }
  };

  const handleEndCall = () => {
    setShowCallModal(false);
    setUrgentHelpType('');
  };

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? '#E74C3C' : 'transparent',
          borderColor: isActive ? '#E74C3C' : '#E74C3C',
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.tabButtonText,
        { color: isActive ? '#fff' : '#E74C3C' }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const EmergencyButton = ({ type, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.emergencyButton,
        {
          backgroundColor: isSelected ? type.color : 'transparent',
          borderColor: isSelected ? type.color : type.color,
        }
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={type.icon} 
        size={24} 
        color={isSelected ? '#fff' : type.color} 
      />
      <Text style={[
        styles.emergencyButtonText,
        { color: isSelected ? '#fff' : type.color }
      ]}>
        {type.name}
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
        <HeaderBack title="Emergency Alert" />

        <View style={styles.tabContainer}>
          <TabButton
            title="Incident"
            isActive={activeTab === 'incident'}
            onPress={() => setActiveTab('incident')}
          />
          <TabButton
            title="Urgent Help"
            isActive={activeTab === 'urgent'}
            onPress={() => setActiveTab('urgent')}
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E74C3C"]} />}
        >
          {activeTab === 'incident' ? (
            <View style={styles.incidentForm}>
              <View style={[styles.formCard, { backgroundColor: cardBackground }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Report Incident</Text>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Location</Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      color: textColor,
                      borderColor: theme === "light" ? '#e0e0e0' : '#444'
                    }]}
                    placeholder="Where did the incident occur?"
                    placeholderTextColor={theme === "light" ? "#999" : "#888"}
                    value={incidentLocation}
                    onChangeText={setIncidentLocation}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Description</Text>
                  <TextInput
                    style={[styles.textArea, { 
                      backgroundColor: theme === "light" ? "#f8f9fa" : "#2A3441",
                      color: textColor,
                      borderColor: theme === "light" ? '#e0e0e0' : '#444'
                    }]}
                    placeholder="Describe what happened..."
                    placeholderTextColor={theme === "light" ? "#999" : "#888"}
                    value={incidentDescription}
                    onChangeText={setIncidentDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { opacity: incidentDescription && incidentLocation ? 1 : 0.5 }
                  ]}
                  onPress={handleIncidentReport}
                  disabled={!incidentDescription || !incidentLocation}
                >
                  <Text style={styles.submitButtonText}>Send Incident Report</Text>
                </TouchableOpacity>
              </View>

              {/* Recent Alerts */}
              {alerts.length > 0 && (
                <View style={[styles.formCard, { backgroundColor: cardBackground }]}> 
                  <Text style={[styles.formTitle, { color: textColor }]}>My Recent Alerts</Text>
                  {alerts.map((a) => (
                    <View key={a.id} style={styles.alertItem}> 
                      <View style={styles.alertRow}> 
                        <Text style={[styles.alertType, { color: a.type === 'urgent' ? '#E74C3C' : '#28942c' }]}>
                          {a.type === 'urgent' ? 'Urgent' : 'Incident'}
                        </Text>
                        <View style={[styles.alertStatusBadge, { backgroundColor: getAlertStatusColor(a.status) }]}> 
                          <Text style={styles.alertStatusText}>{a.status}</Text>
                        </View>
                      </View>
                      {a.location ? (
                        <Text style={[styles.alertField, { color: theme === 'light' ? '#555' : '#ccc' }]}>Location: <Text style={{ color: textColor }}>{a.location}</Text></Text>
                      ) : null}
                      {a.description ? (
                        <Text style={[styles.alertField, { color: theme === 'light' ? '#555' : '#ccc' }]}>Description: <Text style={{ color: textColor }}>{a.description}</Text></Text>
                      ) : null}
                      <Text style={[styles.alertField, { color: theme === 'light' ? '#555' : '#ccc' }]}>Reported: <Text style={{ color: textColor }}>{String(a.reported_at).slice(0, 16).replace('T', ' ')}</Text></Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.urgentForm}>
              <View style={[styles.formCard, { backgroundColor: cardBackground }]}> 
                <Text style={[styles.formTitle, { color: textColor }]}>Call for Help</Text>
                <View style={styles.hotlineContainer}>
                  {HOTLINES.map(h => {
                    const isActive = selectedHotline?.id === h.id;
                    return (
                      <TouchableOpacity
                        key={h.id}
                        onPress={async () => {
                          setSelectedHotline(h);
                          if (h.id === 'admin') {
                            const phone = await adminService.getAdminContact();
                            if (phone) setAdminPhone(phone);
                          }
                        }}
                        style={[styles.hotlineChip, isActive && styles.hotlineChipActive]}
                      >
                        <Text style={[styles.hotlineChipText, isActive && styles.hotlineChipTextActive]}>{h.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
 
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { opacity: 1 }
                  ]}
                  onPress={handleUrgentHelp}
                  disabled={false}
                >
                  <Text style={styles.submitButtonText}>Call for Help</Text>
                </TouchableOpacity>
              </View>

              {/* Recent Alerts */}
              {alerts.length > 0 && (
                <View style={[styles.formCard, { backgroundColor: cardBackground }]}> 
                  <Text style={[styles.formTitle, { color: textColor }]}>My Recent Alerts</Text>
                  {alerts.map((a) => (
                    <View key={a.id} style={styles.alertItem}> 
                      <View style={styles.alertRow}> 
                        <Text style={[styles.alertType, { color: a.type === 'urgent' ? '#E74C3C' : '#28942c' }]}>
                          {a.type === 'urgent' ? 'Urgent' : 'Incident'}
                        </Text>
                        <View style={[styles.alertStatusBadge, { backgroundColor: getAlertStatusColor(a.status) }]}> 
                          <Text style={styles.alertStatusText}>{a.status}</Text>
                        </View>
                      </View>
                      {a.location ? (
                        <Text style={[styles.alertField, { color: theme === 'light' ? '#555' : '#ccc' }]}>Location: <Text style={{ color: textColor }}>{a.location}</Text></Text>
                      ) : null}
                      {a.description ? (
                        <Text style={[styles.alertField, { color: theme === 'light' ? '#555' : '#ccc' }]}>Description: <Text style={{ color: textColor }}>{a.description}</Text></Text>
                      ) : null}
                      <Text style={[styles.alertField, { color: theme === 'light' ? '#555' : '#ccc' }]}>Reported: <Text style={{ color: textColor }}>{String(a.reported_at).slice(0, 16).replace('T', ' ')}</Text></Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={[styles.agreementCard, { backgroundColor: cardBackground }]}> 
            <View style={styles.agreementHeader}>
              <Ionicons name="warning" size={24} color="#E74C3C" />
              <Text style={[styles.agreementTitle, { color: textColor }]}>Important Notice</Text>
            </View>
            <Text style={[styles.agreementText, { color: theme === "light" ? '#555' : '#ccc' }]}> 
              Misuse of emergency alerts may delay assistance for others in genuine need. 
              Only use this feature for real emergencies. False reports are subject to legal action.
            </Text>
            <TouchableOpacity
              style={styles.agreementButton}
              onPress={() => setShowAgreementModal(true)}
            >
              <Text style={[styles.agreementButtonText, { color: '#E74C3C' }]}> 
                Read Full Agreement
              </Text>
            </TouchableOpacity>
          </View>
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

      {/* Agreement Modal */}
      <Modal
        visible={showAgreementModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgreementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.agreementModalContent, { backgroundColor: cardBackground }]}> 
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="warning" size={24} color="#E74C3C" />
                <Text style={[styles.modalTitle, { color: textColor }]}>Emergency Alert Agreement</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAgreementModal(false)}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.agreementContent}>
              <Text style={[styles.agreementModalText, { color: textColor }]}> 
                By using this emergency alert system, you agree to the following terms:{'\n\n'}
                • Only use for genuine emergencies{'\n'}
                • Provide accurate and truthful information{'\n'}
                • Misuse may delay assistance for others{'\n'}
                • False reports are subject to legal action{'\n'}
                • Emergency services will be contacted immediately{'\n'}
                • Your location may be shared with authorities{'\n\n'}
                Do you agree to these terms and confirm this is a real emergency?
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { 
                  borderColor: theme === "light" ? '#e0e0e0' : '#444' 
                }]}
                onPress={() => setShowAgreementModal(false)}
              >
                <Text style={[styles.modalCancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalAgreeButton}
                onPress={() => {
                  setAgreedToTerms(true);
                  setShowAgreementModal(false);
                }}
              >
                <Text style={styles.modalAgreeButtonText}>I Agree</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}> 
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="alert-circle" size={20} color="#E74C3C" />
                <Text style={[styles.modalTitle, { color: textColor }]}>Confirm Emergency Alert</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Ionicons name="close" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.confirmationText, { color: textColor }]}> 
              Are you sure you want to send this emergency alert?{'\n\n'}
              This will immediately contact emergency services.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { 
                  borderColor: theme === "light" ? '#e0e0e0' : '#444' 
                }]}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={[styles.modalCancelButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmAlert}
              >
                <Text style={styles.modalConfirmButtonText}>Send Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Incident Success Modal (brief) */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}> 
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={48} color="#28942c" />
              <Text style={[styles.modalTitle, { color: textColor }]}>Incident Sent</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Call Modal */}
      <Call 
        visible={showCallModal}
        onClose={handleEndCall}
        phoneNumber={selectedHotline?.id === 'admin' ? adminPhone : selectedHotline?.number}
      />
    </SafeAreaView>
  );
};

export default EmergencyAlert;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  incidentForm: {
    gap: 15,
  },
  urgentForm: {
    gap: 15,
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  emergencyButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minWidth: 80,
  },
  emergencyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    minHeight: 80,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
   fontWeight: '600',
  },
  agreementCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 15,
  },
  agreementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  agreementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  agreementText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  agreementButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  agreementButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navWrapper: {
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  agreementModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
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
    marginBottom: 12,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 3,
  },
  agreementContent: {
    marginBottom: 20,
  },
  agreementModalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  agreementScroll: {
    maxHeight: 150,
    marginBottom: 15,
  },
  confirmationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalAgreeButton: {
    flex: 1,
    backgroundColor: '#28942c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalAgreeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  alertItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)'
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '700',
  },
  alertStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  alertStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  hotlineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
    rowGap: 8,
  },
  hotlineChip: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  hotlineChipActive: {
    backgroundColor: '#E74C3C',
  },
  hotlineChipText: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  hotlineChipTextActive: {
    color: '#fff',
  },
}); 