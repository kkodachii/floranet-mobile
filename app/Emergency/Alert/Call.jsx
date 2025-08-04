import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../../../Theme/ThemeProvider";

const Call = ({ visible, onClose, helpType }) => {
  const { colors, theme } = useTheme();
  const [callDuration, setCallDuration] = useState(0);
  const [isCalling, setIsCalling] = useState(false);

  const cardBackground = theme === "light" ? "#ffffff" : "#1F2633";
  const textColor = colors.text;

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval;
    if (visible && isCalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, isCalling]);

  useEffect(() => {
    if (visible) {
      setIsCalling(true);
      setCallDuration(0);
    } else {
      setIsCalling(false);
      setCallDuration(0);
    }
  }, [visible]);

  const handleEndCall = () => {
    setIsCalling(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleEndCall}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.callingCard, { backgroundColor: cardBackground }]}>
          <View style={styles.callingHeader}>
            <View style={styles.callingTitleContainer}>
              <Ionicons name="call" size={24} color="#4CAF50" />
              <Text style={[styles.callingTitle, { color: textColor }]}>Calling Admin</Text>
            </View>
          </View>
          
          <View style={styles.callingBody}>
            <View style={styles.callingAnimation}>
              <View style={styles.callingPulse} />
              <Ionicons name="call" size={40} color="#4CAF50" />
            </View>
            
            <Text style={[styles.callingStatus, { color: textColor }]}>
              Connecting to emergency admin...
            </Text>
            
            <Text style={[styles.callingDuration, { color: theme === "light" ? '#666' : '#aaa' }]}>
              {formatCallDuration(callDuration)}
            </Text>
            
            <View style={styles.callingInfo}>
              <Text style={[styles.callingInfoText, { color: theme === "light" ? '#555' : '#ccc' }]}>
                Help Type: {helpType}
              </Text>
            </View>
          </View>
          
          <View style={styles.callingButtons}>
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={20} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.endCallButtonText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Call;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  callingCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  callingHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  callingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  callingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  callingBody: {
    alignItems: 'center',
    marginBottom: 25,
  },
  callingAnimation: {
    position: 'relative',
    marginBottom: 20,
  },
  callingPulse: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 45,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    animation: 'pulse 2s infinite',
  },
  callingStatus: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  callingDuration: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  callingInfo: {
    width: '100%',
    gap: 8,
  },
  callingInfoText: {
    fontSize: 15,
    lineHeight: 20,
  },
  callingButtons: {
    alignItems: 'center',
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    gap: 10,
  },
  endCallButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 