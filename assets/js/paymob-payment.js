/**
 * Paymob checkout helper
 * Handles session creation, iframe mounting, and status polling.
 */

(function () {
  const API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';
  const apiRequest = window.YASSO_CONFIG?.apiRequest?.bind(window.YASSO_CONFIG);
  const POLL_INTERVAL_MS = 2000;

  async function startPayment({ orderData, onSuccess, onError }) {
    try {
      const session = await createSession(orderData);
      mountIframe(session);
      startPolling(session.sessionId, onSuccess, onError);
      return session;
    } catch (error) {
      console.error('Paymob startPayment error:', error);
      throw error;
    }
  }

  async function createSession(orderData) {
    const payload = {
      ...orderData,
      paymentMethod: 'PAYMOB'
    };

    if (apiRequest) {
      return apiRequest(`${API_BASE_URL}/payments/paymob/session`, {
        method: 'POST',
        data: payload
      });
    }

    const response = await fetch(`${API_BASE_URL}/payments/paymob/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to create Paymob payment session.');
    }

    return response.json();
  }

  function mountIframe(session) {
    const mountPoint = document.getElementById('paymob-payment-mount');
    if (!mountPoint) {
      return;
    }

    mountPoint.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: 600;">Paymob payment session created. Complete the payment below.</div>
      <iframe
        src="${session.iframeUrl}"
        title="Paymob payment iframe"
        style="width: 100%; min-height: 700px; border: 0; background: #fff; border-radius: 12px;"
        allow="payment *"
      ></iframe>
    `;
  }

  function startPolling(sessionId, onSuccess, onError) {
    if (window.__paymobPollingTimer) {
      clearInterval(window.__paymobPollingTimer);
    }

    window.__paymobPollingTimer = window.setInterval(async () => {
      try {
        const session = await fetchSession(sessionId);

        if (session.paymentStatus === 'PAID' && session.orderId) {
          clearInterval(window.__paymobPollingTimer);
          window.__paymobPollingTimer = null;

          const order = await fetchOrder(session.orderId);
          if (typeof onSuccess === 'function') {
            onSuccess(order);
          }
        }

        if (session.paymentStatus === 'FAILED') {
          clearInterval(window.__paymobPollingTimer);
          window.__paymobPollingTimer = null;
          if (typeof onError === 'function') {
            onError('Paymob payment was not completed.');
          }
        }
      } catch (error) {
        console.error('Paymob polling error:', error);
      }
    }, POLL_INTERVAL_MS);
  }

  async function fetchSession(sessionId) {
    if (apiRequest) {
      return apiRequest(`${API_BASE_URL}/payments/paymob/session/${sessionId}`);
    }

    const response = await fetch(`${API_BASE_URL}/payments/paymob/session/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to load Paymob session status.');
    }
    return response.json();
  }

  async function fetchOrder(orderId) {
    if (apiRequest) {
      return apiRequest(`${API_BASE_URL}/orders/${orderId}`);
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to load paid order.');
    }
    return response.json();
  }

  window.PaymobPayment = {
    startPayment
  };
})();