import { SITE } from '@/data/site';

export interface RazorpayOrderRequest {
  type: 'Trampoline' | 'RFID';
  category: string;
  duration?: string;
  quantity: number;
  full_name: string;
  mobile_number: string;
  email?: string | null;
  visit_date: string;
  preferred_time: string;
  special_request?: string | null;
}

export interface RazorpayOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  calculated_amount: number;
  unit_price: number;
  quantity: number;
  receipt?: string;
  is_test_simulation?: boolean;
  error?: string;
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CheckoutOptions {
  bookingData: RazorpayOrderRequest;
  onSuccess: (response: {
    payment_id: string;
    order_id: string;
    signature?: string;
    calculated_amount: number;
    receipt?: string;
    verified: boolean;
  }) => void;
  onError: (errorMsg: string) => void;
  onDismiss?: () => void;
}

// 1. Create Order via authoritative Backend API
export async function createPaymentOrder(data: RazorpayOrderRequest): Promise<RazorpayOrderResponse> {
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned status ${response.status}`);
  }

  return response.json();
}

// 2. Verify Payment Signature via authoritative Backend API
export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  booking_data?: any;
}): Promise<{ success: boolean; verified: boolean; error?: string }> {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    return {
      success: false,
      verified: false,
      error: errData.error || 'Payment signature verification failed',
    };
  }

  return response.json();
}

// 3. Launch Razorpay Standard Checkout Modal
export async function initiateRazorpayCheckout({
  bookingData,
  onSuccess,
  onError,
  onDismiss,
}: CheckoutOptions): Promise<void> {
  try {
    const order = await createPaymentOrder(bookingData);

    if (!order || !order.order_id) {
      throw new Error(order?.error || 'Failed to initialize payment order');
    }

    // Check if Razorpay SDK script is loaded
    if (typeof (window as any).Razorpay === 'undefined') {
      // If script is not loaded yet, try to load it dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Razorpay payment SDK'));
      });
    }

    const RazorpayConstructor = (window as any).Razorpay;

    const rzpOptions = {
      key: order.key_id || 'rzp_test_TZVDYLey5h8bUz',
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Unlimited Fun',
      description: `${bookingData.category} (${bookingData.duration || 'Booking'}) · ${bookingData.quantity} ${bookingData.type === 'RFID' ? 'Cards' : 'Guests'}`,
      image: '/vite.svg',
      order_id: order.order_id.startsWith('order_test_') ? undefined : order.order_id,
      prefill: {
        name: bookingData.full_name,
        contact: bookingData.mobile_number,
        email: bookingData.email || '',
      },
      notes: {
        booking_type: bookingData.type,
        visit_date: bookingData.visit_date,
        preferred_time: bookingData.preferred_time,
      },
      theme: {
        color: '#C6F208',
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay via UPI',
              instruments: [
                {
                  method: 'upi',
                },
              ],
            },
          },
          sequence: ['block.upi'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
        escape: true,
        backdropclose: false,
      },
      handler: async function (response: RazorpayPaymentSuccessResponse) {
        try {
          // Verify signature on backend
          const verification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id || order.order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            booking_data: bookingData,
          });

          if (verification.success && verification.verified) {
            onSuccess({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id || order.order_id,
              signature: response.razorpay_signature,
              calculated_amount: order.calculated_amount,
              receipt: order.receipt,
              verified: true,
            });
          } else {
            onError(verification.error || 'Payment verification failed on server');
          }
        } catch (vErr: any) {
          onError('Payment verification error: ' + (vErr.message || 'Unknown error'));
        }
      },
    };

    const rzpInstance = new RazorpayConstructor(rzpOptions);

    rzpInstance.on('payment.failed', function (resp: any) {
      const err = resp?.error?.description || resp?.error?.reason || 'Payment was unsuccessful';
      onError(err);
    });

    rzpInstance.open();
  } catch (err: any) {
    console.error('Razorpay Checkout initialization failed:', err);
    onError(err.message || 'Could not launch payment gateway. Please try again.');
  }
}
