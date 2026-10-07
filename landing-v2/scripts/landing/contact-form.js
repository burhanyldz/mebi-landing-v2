import { onReady } from '../shared/ready.js';

// Show a themed success alert for contact form
function alertSuccess(message = "Mesajınız başarıyla gönderildi!") {
  // Remove any existing alert
  const oldAlert = document.querySelector('.contact-success-alert');
  if (oldAlert) oldAlert.remove();

  // Create alert element
  const alert = document.createElement('div');
  alert.className = 'contact-success-alert';
  alert.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#ffffff"/>
      <path d="M7 13l3 3 7-7" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  
  // Append to body so it's always visible regardless of scroll position
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('show');
  }, 50);
  
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 400);
  }, 3500);
}

// Contact form validation and submission
onReady(() => {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  const emailInput = contactForm.querySelector('#email');
  const nameInput = contactForm.querySelector('#name');
  const messageInput = contactForm.querySelector('#message');
  const submitBtn = contactForm.querySelector('.submit-btn');
  const clearBtn = contactForm.querySelector('.clear-btn');

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if form is dirty (has any input)
  function isFormDirty() {
    return emailInput.value.trim() !== '' || 
           nameInput.value.trim() !== '' || 
           messageInput.value.trim() !== '';
  }

  // Update clear button visibility
  function updateClearButton() {
    if (clearBtn) {
      clearBtn.style.display = isFormDirty() ? 'block' : 'none';
    }
  }

  // Validate individual field
  function validateField(input, validationFn, errorMsg) {
    const formGroup = input.closest('.form-group');
    let errorElement = formGroup.querySelector('.error-message');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      formGroup.appendChild(errorElement);
    }

    if (!validationFn(input.value.trim())) {
      formGroup.classList.add('error');
      errorElement.textContent = errorMsg;
      return false;
    } else {
      formGroup.classList.remove('error');
      errorElement.textContent = '';
      return true;
    }
  }

  // Clear field error
  function clearFieldError(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('error');
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  // Validate all fields
  function validateForm() {
    let isValid = true;

    // Validate email
    isValid = validateField(
      emailInput,
      (value) => value !== '' && emailRegex.test(value),
      'Geçerli bir e-posta adresi giriniz.'
    ) && isValid;

    // Validate name
    isValid = validateField(
      nameInput,
      (value) => value !== '' && value.length >= 2,
      'Ad soyad en az 2 karakter olmalıdır.'
    ) && isValid;

    // Validate message
    isValid = validateField(
      messageInput,
      (value) => value !== '' && value.length >= 10,
      'Mesaj en az 10 karakter olmalıdır.'
    ) && isValid;

    return isValid;
  }

  // Update submit button state
  function updateSubmitButton() {
    const isValid = emailInput.value.trim() !== '' && 
                    nameInput.value.trim() !== '' && 
                    messageInput.value.trim() !== '';
    submitBtn.disabled = !isValid;
  }

  // Clear form
  function clearForm() {
    emailInput.value = '';
    nameInput.value = '';
    messageInput.value = '';
    
    // Clear all errors
    clearFieldError(emailInput);
    clearFieldError(nameInput);
    clearFieldError(messageInput);
    
    updateSubmitButton();
    updateClearButton();
  }

  // Input event listeners for real-time validation
  [emailInput, nameInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      updateSubmitButton();
      updateClearButton();
      
      // Clear error when user starts typing
      if (input.closest('.form-group').classList.contains('error')) {
        clearFieldError(input);
      }
    });

    // Validate on blur
    input.addEventListener('blur', () => {
      if (input.value.trim() !== '') {
        if (input === emailInput) {
          validateField(emailInput, (value) => emailRegex.test(value), 'Geçerli bir e-posta adresi giriniz.');
        } else if (input === nameInput) {
          validateField(nameInput, (value) => value.length >= 2, 'Ad soyad en az 2 karakter olmalıdır.');
        } else if (input === messageInput) {
          validateField(messageInput, (value) => value.length >= 10, 'Mesaj en az 10 karakter olmalıdır.');
        }
      }
    });
  });

  // Clear button handler
  if (clearBtn) {
    clearBtn.addEventListener('click', clearForm);
  }

  // Form submit handler
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (validateForm()) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Gönderiliyor...';

      // TODO: Buraya gerçek API entegrasyonunu ekleyin.
      // Örnek: fetch('/api/contact', { method: 'POST', body: JSON.stringify({...}) })
      //   .then(res => res.json())
      //   .then(() => { alertSuccess(); clearForm(); })
      //   .catch(() => { /* hata mesajı */ })
      //   .finally(() => { submitBtn.disabled = false; submitBtn.textContent = 'Gönder'; });

      // Geçici: Formun gönderildiğini simüle et
      alertSuccess('Mesajınız başarıyla gönderildi!');
      clearForm();
      submitBtn.textContent = 'Gönder';
    }
  });

  // Initialize button states
  updateSubmitButton();
  updateClearButton();
});
