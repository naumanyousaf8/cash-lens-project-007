document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.body.classList.toggle('mobile-menu-open');
            
            // Animate the menu button
            const spans = this.querySelectorAll('span');
            if (document.body.classList.contains('mobile-menu-open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    if (navLinks) {
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                document.body.classList.remove('mobile-menu-open');
                if (mobileMenuBtn) {
                    const spans = mobileMenuBtn.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            });
        });
    }
    
    // Auth Modal Functions
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    function openModal(formId) {
        if (authModal) {
            authModal.style.display = 'flex';
            
            // Hide all forms first
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            
            // Show the requested form
            const formToShow = document.getElementById(formId);
            if (formToShow) {
                formToShow.style.display = 'block';
                formToShow.classList.add('animate-fadeIn');
            }
        }
    }
    
    function closeModalFunc() {
        if (authModal) {
            authModal.style.display = 'none';
        }
    }
    
    // Event listeners for auth buttons
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            openModal('loginForm');
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            openModal('registerForm');
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }
    
    // Switch between login and register forms
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) {
                registerForm.style.display = 'block';
                registerForm.classList.add('animate-fadeIn');
            }
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerForm) registerForm.style.display = 'none';
            if (loginForm) {
                loginForm.style.display = 'block';
                loginForm.classList.add('animate-fadeIn');
            }
        });
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (authModal && e.target === authModal) {
            closeModalFunc();
        }
    });
    
    // File Upload Functionality
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('previewContainer');
    const dropMessage = document.querySelector('.drop-message');
    const fileName = document.getElementById('fileName');
    const processBtn = document.getElementById('processBtn');
    const removeBtn = document.getElementById('removeBtn');
    
    // Prevent default behavior for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        if (dropArea) {
            dropArea.addEventListener(eventName, preventDefaults, false);
        }
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area when dragging file over it
    ['dragenter', 'dragover'].forEach(eventName => {
        if (dropArea) {
            dropArea.addEventListener(eventName, highlight, false);
        }
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        if (dropArea) {
            dropArea.addEventListener(eventName, unhighlight, false);
        }
    });
    
    function highlight() {
        if (dropArea) {
            dropArea.classList.add('drag-over');
        }
    }
    
    function unhighlight() {
        if (dropArea) {
            dropArea.classList.remove('drag-over');
        }
    }
    
    // Handle dropped files
    if (dropArea) {
        dropArea.addEventListener('drop', handleDrop, false);
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }
    
    if (browseBtn) {
        browseBtn.addEventListener('click', function() {
            if (fileInput) {
                fileInput.click();
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length) {
                handleFiles(this.files);
            }
        });
    }
    
    function handleFiles(files) {
        const file = files[0];
        
        // Check if the file is an image
        if (!file.type.match('image.*')) {
            if (dropArea) {
                dropArea.classList.add('error');
                setTimeout(() => {
                    dropArea.classList.remove('error');
                }, 3000);
            }
            return;
        }
        
        if (fileName) {
            fileName.textContent = file.name;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            if (imagePreview) {
                imagePreview.src = e.target.result;
            }
            
            if (dropMessage) {
                dropMessage.style.display = 'none';
            }
            
            if (previewContainer) {
                previewContainer.style.display = 'flex';
            }
            
            if (dropArea) {
                dropArea.classList.add('active');
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (fileInput) {
                fileInput.value = '';
            }
            
            if (imagePreview) {
                imagePreview.src = '';
            }
            
            if (dropMessage) {
                dropMessage.style.display = 'block';
            }
            
            if (previewContainer) {
                previewContainer.style.display = 'none';
            }
            
            if (dropArea) {
                dropArea.classList.remove('active');
            }
            
            const resultsContainer = document.querySelector('.results-container');
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
        });
    }
    
    // Process image button
    if (processBtn) {
        processBtn.addEventListener('click', async function() {
            if (!fileInput.files.length) {
                alert('Please select an image first');
                return;
            }

            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                processBtn.disabled = true;
                processBtn.textContent = 'Processing...';

                const response = await fetch('/api/predict', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    // Display results
                    const resultContainer = document.getElementById('resultContainer');
                    if (resultContainer) {
                        resultContainer.innerHTML = `
                            <div class="result-card ${result.valid ? 'valid' : 'invalid'}">
                                <h3>Result</h3>
                                <p class="currency">${result.currency}</p>
                                <p class="confidence">Confidence: ${result.confidence}%</p>
                                <p class="status">${result.valid ? 'Valid Note' : 'Invalid Note'}</p>
                            </div>
                        `;
                        resultContainer.style.display = 'block';
                    }

                    // Speak the result
                    if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(
                            `This is a ${result.currency} note with ${result.confidence}% confidence`
                        );
                        speechSynthesis.speak(utterance);
                    }
                } else {
                    throw new Error(result.error || 'Failed to process image');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                processBtn.disabled = false;
                processBtn.textContent = 'Identify Currency';
            }
        });
    }
    
    // Testimonial Slider
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    let currentTestimonial = 0;
    
    function showTestimonial(index) {
        if (testimonialCards.length === 0) return;
        
        // Hide all testimonials
        testimonialCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Show current testimonial
        if (testimonialCards[index]) {
            testimonialCards[index].style.display = 'block';
            testimonialCards[index].classList.add('animate-fadeIn');
        }
    }
    
    // Initialize testimonial slider
    if (testimonialCards.length > 0) {
        showTestimonial(currentTestimonial);
        
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                currentTestimonial = (currentTestimonial === 0) ? 
                    testimonialCards.length - 1 : currentTestimonial - 1;
                showTestimonial(currentTestimonial);
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                currentTestimonial = (currentTestimonial === testimonialCards.length - 1) ? 
                    0 : currentTestimonial + 1;
                showTestimonial(currentTestimonial);
            });
        }
        
        // Auto rotate testimonials
        setInterval(() => {
            if (nextButton) {
                nextButton.click();
            }
        }, 5000);
    }
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation example
            let valid = true;
            const inputs = this.querySelectorAll('input');
            
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    valid = false;
                }
                
                // Email validation
                if (input.type === 'email' && !validateEmail(input.value)) {
                    valid = false;
                }
                
                // Password match validation for register form
                if (input.id === 'confirmPassword' && 
                    input.value !== document.getElementById('registerPassword').value) {
                    valid = false;
                    alert('Passwords do not match!');
                }
            });
            
            if (valid) {
                alert('Form submitted successfully!');
                closeModalFunc();
            } else {
                alert('Please fill all required fields correctly.');
            }
        });
    });
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animation on scroll
    function animateOnScroll() {
        const animatedElements = document.querySelectorAll('.feature-card, .step, .testimonial-card, .about-content, .qr-codes');
        
        animatedElements.forEach(element => {
            const position = element.getBoundingClientRect();
            
            // Check if element is in viewport
            if (position.top < window.innerHeight && position.bottom >= 0) {
                element.classList.add('animate-slideInUp');
            }
        });
    }
    
    // Run once on page load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
});