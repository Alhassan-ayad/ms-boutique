/**
 * YASSO Contact Form Handler
 * 
 * Handles contact form submission to backend API
 * Backend endpoint: POST /api/contact-messages
 */

const API_BASE_URL = window.YASSO_CONFIG?.API_BASE_URL || '/api';

/**
 * Submit contact form to backend API
 * @param {FormData} formData - Form data
 * @returns {Promise<Object>} - API response
 */
async function submitContactForm(formData) {
  try {
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject') || 'Contact Inquiry',
      message: formData.get('message')
    };
    
    const response = await fetch(`${API_BASE_URL}/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors',
    });
    
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    throw error;
  }
}

/**
 * Validate contact form
 * @param {FormData} formData - Form data
 * @returns {Object} - Validation result {valid: boolean, errors: Array}
 */
function validateContactForm(formData) {
  const errors = [];
  
  const name = formData.get('name')?.trim();
  const email = formData.get('email')?.trim();
  const message = formData.get('message')?.trim();
  
  if (!name) {
    errors.push('Name is required');
  }
  
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!message) {
    errors.push('Message is required');
  } else if (message.length < 10) {
    errors.push('Message must be at least 10 characters long');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show form message
 * @param {HTMLElement} messagesElement - Messages container
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error)
 */
function showFormMessage(messagesElement, message, type = 'success') {
  if (!messagesElement) return;
  
  messagesElement.classList.remove('success', 'error');
  messagesElement.classList.add(type);
  messagesElement.textContent = message;
  messagesElement.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    messagesElement.style.display = 'none';
  }, 5000);
}

/**
 * Show field error
 * @param {HTMLElement} field - Form field
 * @param {string} error - Error message
 */
function showFieldError(field, error) {
  if (!field) return;
  
  field.classList.add('is-invalid');
  
  // Create or update error message
  let errorDiv = field.parentElement.querySelector('.invalid-feedback');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    field.parentElement.appendChild(errorDiv);
  }
  errorDiv.textContent = error;
  errorDiv.style.display = 'block';
}

/**
 * Clear field error
 * @param {HTMLElement} field - Form field
 */
function clearFieldError(field) {
  if (!field) return;
  
  field.classList.remove('is-invalid');
  const errorDiv = field.parentElement.querySelector('.invalid-feedback');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

/**
 * Clear all form errors
 * @param {HTMLFormElement} form - Form element
 */
function clearAllErrors(form) {
  const fields = form.querySelectorAll('.is-invalid');
  fields.forEach(field => clearFieldError(field));
}

/**
 * Initialize contact form handler
 */
function initContactForm() {
  const contactForm = document.querySelector('.contact-form-api');
  
  if (!contactForm) {
    return;
  }
  
  const messagesElement = contactForm.nextElementSibling;
  const submitButton = contactForm.querySelector('button[type="submit"]');
  
  // Add input event listeners to clear errors
  const fields = contactForm.querySelectorAll('input, textarea');
  fields.forEach(field => {
    field.addEventListener('input', () => {
      clearFieldError(field);
    });
  });
  
  // Handle form submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear previous errors
    clearAllErrors(contactForm);
    
    // Get form data
    const formData = new FormData(contactForm);
    
    // Validate form
    const validation = validateContactForm(formData);
    
    if (!validation.valid) {
      // Show validation errors
      showFormMessage(
        messagesElement,
        validation.errors.join('. '),
        'error'
      );
      
      // Highlight invalid fields
      if (!formData.get('name')?.trim()) {
        showFieldError(contactForm.querySelector('[name="name"]'), 'Name is required');
      }
      if (!formData.get('email')?.trim() || !isValidEmail(formData.get('email')?.trim())) {
        showFieldError(contactForm.querySelector('[name="email"]'), 'Valid email is required');
      }
      if (!formData.get('message')?.trim()) {
        showFieldError(contactForm.querySelector('[name="message"]'), 'Message is required');
      }
      
      return;
    }
    
    // Disable submit button
    if (submitButton) {
      submitButton.disabled = true;
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.dataset.originalText = originalText;
    }
    
    try {
      // Submit to API
      const result = await submitContactForm(formData);
      
      // Show success message
      showFormMessage(
        messagesElement,
        'Thank you for contacting us! We will get back to you soon.',
        'success'
      );
      
      // Reset form
      contactForm.reset();
      
      // Show notification if available
      if (window.YASSO_CONFIG?.showNotification) {
        window.YASSO_CONFIG.showNotification(
          'Message sent successfully!',
          'success'
        );
      }
      
    } catch (error) {
      // Show error message
      const errorMessage = error.message || 'An error occurred. Please try again later.';
      showFormMessage(
        messagesElement,
        'Failed to send message: ' + errorMessage,
        'error'
      );
      
      // Show notification if available
      if (window.YASSO_CONFIG?.showNotification) {
        window.YASSO_CONFIG.showNotification(
          'Failed to send message. Please try again.',
          'error'
        );
      }
      
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalText || 'Submit Now';
      }
    }
  }, false);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initContactForm, 100);
  });
} else {
  setTimeout(initContactForm, 100);
}

// Add CSS for form messages
const formStyle = document.createElement('style');
formStyle.textContent = `
  .form-messages {
    padding: 15px;
    margin-top: 15px;
    border-radius: 5px;
    display: none;
  }
  
  .form-messages.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .form-messages.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .form-control.is-invalid {
    border-color: #dc3545;
  }
  
  .invalid-feedback {
    display: none;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
  }
  
  .form-control.is-invalid ~ .invalid-feedback {
    display: block;
  }
`;
document.head.appendChild(formStyle);

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    submitContactForm,
    validateContactForm,
    initContactForm
  };
}
