import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import HeaderBack from "../../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Call from "./Call";

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

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#1F2633";
  const textColor = colors.text;

  const incidentTypes = [
    { id: 'fire', name: 'Fire', icon: 'flame-outline', color: '#E74C3C' },
    { id: 'medical', name: 'Medical', icon: 'medical-outline', color: '#E74C3C' },
    { id: 'security', name: 'Security', icon: 'shield-outline', color: '#FFA500' },
    { id: 'accident', name: 'Accident', icon: 'car-outline', color: '#FFA500' },
    { id: 'other', name: 'Other', icon: 'warning-outline', color: '#E74C3C' }
  ];

  const urgentHelpTypes = [
    { id: 'police', name: 'Police', icon: 'shield-outline', color: '#4A90E2' },
    { id: 'ambulance', name: 'Ambulance', icon: 'medical-outline', color: '#E74C3C' },
    { id: 'fire', name: 'Fire Dept', icon: 'flame-outline', color: '#E74C3C' },
    { id: 'security', name: 'Security', icon: 'people-outline', color: '#FFA500' }
  ];

  const handleIncidentReport = () => {
    if (!incidentType || !incidentDescription.trim() || !incidentLocation.trim()) {
      return;
    }

    setConfirmationType('incident');
    setShowConfirmationModal(true);
  };

  const handleUrgentHelp = () => {
    if (!urgentHelpType) {
      return;
    }

    setConfirmationType('urgent');
    setShowConfirmationModal(true);
  };

  const handleConfirmAlert = () => {
    setShowConfirmationModal(false);
    
    if (confirmationType === 'incident') {
      // Reset incident form
      setIncidentType('');
      setIncidentDescription('');
      setIncidentLocation('');
    } else {
      // Show calling interface directly
      setShowCallModal(true);
    }
  };

  const handleEndCall = () => {
    setShowCallModal(false);
    // Reset urgent help form
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
        >
          {activeTab === 'incident' ? (
            <View style={styles.incidentForm}>
              <View style={[styles.formCard, { backgroundColor: cardBackground }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Report Incident</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Type</Text>
                  <View style={styles.emergencyButtonsContainer}>
                    {incidentTypes.map((type) => (
                      <EmergencyButton
                        key={type.id}
                        type={type}
                        isSelected={incidentType === type.name}
                        onPress={() => setIncidentType(type.name)}
                      />
                    ))}
                  </View>
                </View>

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
                    { opacity: incidentType && incidentDescription && incidentLocation ? 1 : 0.5 }
                  ]}
                  onPress={handleIncidentReport}
                  disabled={!incidentType || !incidentDescription || !incidentLocation}
                >
                  <Text style={styles.submitButtonText}>Send Incident Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.urgentForm}>
              <View style={[styles.formCard, { backgroundColor: cardBackground }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Call for Help</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Help Type</Text>
                  <View style={styles.emergencyButtonsContainer}>
                    {urgentHelpTypes.map((type) => (
                      <EmergencyButton
                        key={type.id}
                        type={type}
                        isSelected={urgentHelpType === type.name}
                        onPress={() => setUrgentHelpType(type.name)}
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { opacity: urgentHelpType ? 1 : 0.5 }
                  ]}
                  onPress={handleUrgentHelp}
                  disabled={!urgentHelpType}
                >
                  <Text style={styles.submitButtonText}>Call for Help</Text>
                </TouchableOpacity>
              </View>
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

      {/* Call Modal */}
      <Call 
        visible={showCallModal}
        onClose={handleEndCall}
        helpType={urgentHelpType}
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
}); 