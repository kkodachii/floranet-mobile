// PayMongo API utilities
let PAYMONGO_SECRET_KEY = process?.env?.PAYMONGO_SECRET_KEY || '';
let PAYMONGO_PUBLIC_KEY = process?.env?.PAYMONGO_PUBLIC_KEY || '';

try {
  // Prefer real config if present (ignored by git)
  // Note: React Native bundler resolves JSON imports statically
  // so we try/catch in case the file does not exist in CI or open source
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require('./paymongo.config.json');
  PAYMONGO_SECRET_KEY = config.PAYMONGO_SECRET_KEY || PAYMONGO_SECRET_KEY;
  PAYMONGO_PUBLIC_KEY = config.PAYMONGO_PUBLIC_KEY || PAYMONGO_PUBLIC_KEY;
} catch (e) {
  try {
    // Fallback to example for local development if desired
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const example = require('./paymongo.config.example.json');
    PAYMONGO_SECRET_KEY = PAYMONGO_SECRET_KEY || example.PAYMONGO_SECRET_KEY;
    PAYMONGO_PUBLIC_KEY = PAYMONGO_PUBLIC_KEY || example.PAYMONGO_PUBLIC_KEY;
  } catch (_) {
    // ignore
  }
}

if (!PAYMONGO_SECRET_KEY || !PAYMONGO_PUBLIC_KEY) {
  console.warn('[PayMongo] API keys are not set. Please provide keys in app/Finance/paymongo.config.json or environment variables.');
}

// Base64 encoding utility for React Native
const encodeBase64 = (str) => {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }

    let byteNum;
    let chunk;

    for (let i = 0; i < bytes.length; i += 3) {
      byteNum = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      chunk = [
        chars[(byteNum >> 18) & 0x3F],
        chars[(byteNum >> 12) & 0x3F],
        chars[(byteNum >> 6) & 0x3F],
        chars[byteNum & 0x3F]
      ];
      output += chunk.join('');
    }

    return output;
  } catch (error) {
    console.error('Base64 encoding error:', error);
    return str;
  }
};

// Generate QR Ph code
export const generateQRPhCode = async (amount, description = 'Payment', referenceNumber) => {
  try {
    const response = await fetch('https://api.paymongo.com/v1/qrph/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodeBase64(PAYMONGO_SECRET_KEY + ':')}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: parseFloat(amount) * 100, // Convert to centavos
            description: description,
            reference_number: referenceNumber || `FLORA-${Date.now()}`,
            kind: 'instore', // Required by PayMongo API
          }
        }
      })
    });

    const result = await response.json();

    if (response.ok && result.data) {
      console.log('PayMongo API Response:', JSON.stringify(result, null, 2));
      return {
        success: true,
        data: result.data,
        qrId: result.data.id,
        qrCodeId: result.data.attributes?.qr?.id,
        amount: result.data.attributes?.amount,
        description: result.data.attributes?.description,
      };
    } else {
      console.error('PayMongo API Error:', result);
      return {
        success: false,
        error: result.errors?.[0]?.detail || 'Failed to generate QR code',
        data: result
      };
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null
    };
  }
};

// Create a Payment Intent (amount in pesos)
export const createPaymentIntent = async (amount, description = 'Payment') => {
  try {
    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodeBase64(PAYMONGO_SECRET_KEY + ':')}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(parseFloat(amount) * 100),
            currency: 'PHP',
            payment_method_allowed: ['qrph'],
            capture_type: 'automatic',
            description,
          }
        }
      })
    });

    const result = await response.json();

    if (response.ok && result.data) {
      return {
        success: true,
        data: result.data,
        id: result.data.id,
        clientKey: result.data.attributes?.client_key,
        status: result.data.attributes?.status,
      };
    } else {
      console.error('PayMongo API Error (createPaymentIntent):', result);
      return {
        success: false,
        error: result.errors?.[0]?.detail || 'Failed to create payment intent',
        data: result,
      };
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null,
    };
  }
};

// Create a QRPH payment method
export const createQrphPaymentMethod = async (billing) => {
  try {
    const response = await fetch('https://api.paymongo.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodeBase64(PAYMONGO_SECRET_KEY + ':')}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: 'qrph',
            ...(billing ? { billing } : {}),
          }
        }
      })
    });

    const result = await response.json();

    if (response.ok && result.data) {
      return {
        success: true,
        data: result.data,
        id: result.data.id,
      };
    } else {
      console.error('PayMongo API Error (createQrphPaymentMethod):', result);
      return {
        success: false,
        error: result.errors?.[0]?.detail || 'Failed to create QRPH payment method',
        data: result,
      };
    }
  } catch (error) {
    console.error('Error creating QRPH payment method:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null,
    };
  }
};

// Attach payment method to payment intent
export const attachPaymentIntent = async (paymentIntentId, paymentMethodId, clientKey) => {
  try {
    const response = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodeBase64(PAYMONGO_SECRET_KEY + ':')}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
          }
        }
      })
    });

    const result = await response.json();

    if (response.ok && result.data) {
      // Try to normalize potential QR display fields
      const attrs = result.data.attributes || {};
      const nextAction = attrs.next_action || {};
      const code = nextAction.code || {};
      const qrImage = code.image_url || nextAction.qr_image || nextAction.qr?.image || nextAction?.display_qr?.image || null;
      const qrData = nextAction.qr_data || nextAction.qr?.data || null;

      return {
        success: true,
        data: result.data,
        status: attrs.status,
        qrImage,
        qrData,
      };
    } else {
      console.error('PayMongo API Error (attachPaymentIntent):', result);
      return {
        success: false,
        error: result.errors?.[0]?.detail || 'Failed to attach payment method to intent',
        data: result,
      };
    }
  } catch (error) {
    console.error('Error attaching payment method to payment intent:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null,
    };
  }
};

// Retrieve Payment Intent status
export const getPaymentIntent = async (paymentIntentId) => {
  try {
    const response = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodeBase64(PAYMONGO_SECRET_KEY + ':')}`,
        'Accept': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok && result.data) {
      return {
        success: true,
        data: result.data,
        status: result.data.attributes?.status,
        amount: result.data.attributes?.amount,
      };
    } else {
      return {
        success: false,
        error: result.errors?.[0]?.detail || 'Failed to get payment intent',
        data: result,
      };
    }
  } catch (error) {
    console.error('Error getting payment intent:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null,
    };
  }
};

// Create a Checkout Session
export const createCheckoutSession = async (amount, description, metadata, successUrl, cancelUrl, userProfile = null) => {
  try {
    console.log('Creating checkout session with user profile:', userProfile);
    
    const requestBody = {
      data: {
        attributes: {
          line_items: [
            {
              currency: 'PHP',
              amount: Math.round(parseFloat(amount) * 100),
              name: description,
              quantity: 1
            }
          ],
          payment_method_types: ['card', 'gcash', 'grab_pay', 'paymaya'],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata,
          ...(userProfile && {
            billing: {
              name: userProfile.name || 'Floranet Resident',
              email: userProfile.email || 'resident@floranet.com',
              phone: userProfile.contact_no || '+639000000000',
              address: {
                line1: userProfile.house?.address || 'Floranet Community',
                city: 'Makati',
                state: 'NCR',
                postal_code: '1234',
                country: 'PH'
              }
            }
          })
        }
      }
    };
    
    console.log('PayMongo request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodeBase64(PAYMONGO_SECRET_KEY + ':')}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (response.ok && result.data) {
      return {
        success: true,
        data: result.data,
        id: result.data.id,
        checkout_url: result.data.attributes?.checkout_url,
        status: result.data.attributes?.status,
      };
    } else {
      console.error('PayMongo API Error (createCheckoutSession):', result);
      return {
        success: false,
        error: result.errors?.[0]?.detail || 'Failed to create checkout session',
        data: result,
      };
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null,
    };
  }
};

// Retrieve Checkout Session status
export const getCheckoutSession = async (checkoutSessionId) => {
  try {
    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodeBase64(PAYMONGO_SECRET_KEY + ':')}`,
        'Accept': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok && result.data) {
      return {
        success: true,
        data: result.data,
        status: result.data.attributes?.status,
        amount: result.data.attributes?.amount,
        checkout_url: result.data.attributes?.checkout_url,
      };
    } else {
      return {
        success: false,
        error: result.errors?.[0]?.detail || 'Failed to get checkout session',
        data: result,
      };
    }
  } catch (error) {
    console.error('Error getting checkout session:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null,
    };
  }
};

// Record payment in database
export const recordPayment = async (amount, monthlyDueId, methodOfPayment = 'PayMongo Gateway') => {
  try {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (__DEV__ ? 'http://192.168.254.107:8000/api' : 'https://api.floranet.online/api');
    
    const paymentData = {
      method_of_payment: methodOfPayment,
      amount: amount,
      paid_at: new Date().toISOString(),
      monthly_due_id: monthlyDueId,
    };
    
    console.log('Sending payment data to API:', paymentData);
    
    const response = await fetch(`${API_BASE_URL}/user/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (response.ok && result.data) {
      return {
        success: true,
        data: result.data,
        message: result.message || 'Payment recorded successfully',
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to record payment',
        data: result,
      };
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      data: null,
    };
  }
};

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const { getItemAsync } = await import('expo-secure-store');
    return await getItemAsync('floranet_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export { PAYMONGO_SECRET_KEY, PAYMONGO_PUBLIC_KEY };

// Default export for Expo Router
export default function PayMongoUtils() {
  return null;
} 