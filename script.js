const stripe = Stripe('pk_test_51LsSPIAYTPX8HVRccA5R0IkkzTXHhCVk4v1cNcJkDdunohuCeSIsi7VUIHMWBhPU7tGxqpG62qhQJX2eRKAJrMte00zY6iJpco'); // Erstatt med din egen publishable key

document.addEventListener('DOMContentLoaded', () => {
    // Cart toggle functionality
    const cartButton = document.querySelector('.cart-button');
    const cartDropdown = document.querySelector('.cart-dropdown');

    if (!cartButton || !cartDropdown) {
        console.error('Cart elements not found');
        return;
    }

    // Start med lukket handlekurv
    cartDropdown.style.display = 'none';

    // Lukk handlekurv når man klikker utenfor
    document.addEventListener('click', function(event) {
        const isClickInsideCart = cartDropdown.contains(event.target);
        const isClickOnButton = cartButton.contains(event.target);
        const isClickOnOrder = event.target.classList.contains('order-button');
        
        if (!isClickInsideCart && !isClickOnButton && !isClickOnOrder) {
            cartDropdown.style.display = 'none';
        }
    });

    // Toggle handlekurv når man klikker på knappen
    cartButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        cartDropdown.style.display = cartDropdown.style.display === 'none' ? 'block' : 'none';
    });

    // Prevent click inside cart from closing it
    cartDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Slider functionality (beholder eksisterende kode)
    const materialSlider = document.getElementById('material-amount');
    const componentSlider = document.getElementById('component-amount');
    const materialQuantity = document.getElementById('material-quantity');
    const componentQuantity = document.getElementById('component-quantity');
    const materialCost = document.getElementById('material-cost');
    const componentCost = document.getElementById('component-cost');

    // Update material amount and cost
    if (materialSlider && materialQuantity && materialCost) {
        materialSlider.addEventListener('input', function() {
            const amount = parseInt(this.value);
            materialQuantity.textContent = amount.toLocaleString();
            if (currentMaterial && currentMaterial.price) {
                const cost = (amount * currentMaterial.price).toFixed(2);
                materialCost.textContent = `$${cost}`;
            }
        });
    }

    // Update component amount and cost
    if (componentSlider && componentQuantity && componentCost) {
        componentSlider.addEventListener('input', function() {
            const amount = parseInt(this.value);
            componentQuantity.textContent = amount.toLocaleString();
            if (currentComponent && currentComponent.price) {
                const cost = (amount * currentComponent.price).toFixed(2);
                componentCost.textContent = `$${cost}`;
            }
        });
    }

    // Add to cart buttons
    const materialOrderBtn = document.getElementById('material-order');
    const componentOrderBtn = document.getElementById('component-order');

    if (materialOrderBtn) {
        materialOrderBtn.addEventListener('click', function() {
            if (currentMaterial && currentMaterial.name) {
                const amount = parseInt(document.getElementById('material-amount').value);
                const cost = (amount * currentMaterial.price).toFixed(2);
                addToCart(currentMaterial.name, amount, cost);
            } else {
                alert('Please select a material first');
            }
        });
    }

    if (componentOrderBtn) {
        componentOrderBtn.addEventListener('click', function() {
            if (currentComponent && currentComponent.name) {
                const amount = parseInt(document.getElementById('component-amount').value);
                const cost = (amount * currentComponent.price).toFixed(2);
                addToCart(currentComponent.name, amount, cost);
            } else {
                alert('Please select a component first');
            }
        });
    }

    checkLoginStatus();
});

// Global variables
let currentDiscount = 0;
let currentMaterial = { name: null, price: 0 };
let currentComponent = { name: null, price: 0 };

// Material selection function
function selectMaterial(name, price) {
    currentMaterial = { name, price };
    const slider = document.getElementById('material-amount');
    if (slider) {
        slider.value = slider.min;
        updateMaterialCost();
    }
}

// Component selection function
function selectComponent(name, price) {
    currentComponent = { name, price };
    const slider = document.getElementById('component-amount');
    if (slider) {
        slider.value = slider.min;
        slider.dispatchEvent(new Event('input'));
    }
}

// Add to cart function
function addToCart(itemName, amount, cost) {
    const cartItems = document.getElementById('cart-items');
    const cartDropdown = document.querySelector('.cart-dropdown');
    
    if (!cartItems) return;

    // Clear "empty cart" message if it exists
    if (cartItems.children.length === 1 && 
        cartItems.children[0].textContent === 'Your cart is empty') {
        cartItems.innerHTML = '';
    }

    // Create new cart item
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span class="cart-item-text">${amount.toLocaleString()} x ${itemName} - $${cost}</span>
        <button class="remove-button" onclick="removeFromCart(this)">Remove</button>
    `;
    cartItems.appendChild(listItem);

    // Show cart and update totals
    if (cartDropdown) {
        cartDropdown.style.display = 'block';
    }
    updateCartTotals();
}

// Remove from cart function
function removeFromCart(button) {
    const listItem = button.parentElement;
    const cartItems = document.getElementById('cart-items');
    
    if (!cartItems) return;
    
    cartItems.removeChild(listItem);

    // Show empty cart message if no items
    if (cartItems.children.length === 0) {
        cartItems.innerHTML = '<li>Your cart is empty</li>';
    }

    updateCartTotals();
}

// Apply coupon code
function applyCouponCode() {
    const couponInput = document.getElementById('coupon-input');
    const code = couponInput.value.trim().toUpperCase();
    
    // Example coupon codes
    const coupons = {
        'WELCOME10': 0.10,
        'SAVE20': 0.20,
        'VIP50': 0.50
    };

    if (coupons[code]) {
        currentDiscount = coupons[code];
        updateCartTotals();
        alert(`Coupon applied! ${currentDiscount * 100}% discount`);
    } else {
        alert('Invalid coupon code');
    }
}

// Update cart totals
function updateCartTotals() {
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('cart-subtotal');
    const discountElement = document.getElementById('cart-discount');
    const totalElement = document.getElementById('cart-total');
    
    if (!cartItems || !subtotalElement || !discountElement || !totalElement) return;

    // Calculate subtotal
    let subtotal = 0;
    if (cartItems.children.length > 0 && 
        cartItems.children[0].textContent !== 'Your cart is empty') {
        subtotal = Array.from(cartItems.children)
            .filter(item => item.querySelector('.cart-item-text'))
            .reduce((sum, item) => {
                const text = item.querySelector('.cart-item-text').textContent;
                const price = parseFloat(text.split('$')[1]);
                return sum + (isNaN(price) ? 0 : price);
            }, 0);
    }

    // Calculate discount and total
    const discount = subtotal * currentDiscount;
    const total = subtotal - discount;

    // Update display
    subtotalElement.textContent = subtotal.toFixed(2);
    discountElement.textContent = discount.toFixed(2);
    totalElement.textContent = total.toFixed(2);
}

// Checkout function
async function checkout() {
    const cartItems = document.getElementById('cart-items');
    const total = parseFloat(document.getElementById('cart-total').textContent);
    
    if (!cartItems || total <= 0) {
        alert('Your cart is empty');
        return;
    }

    try {
        console.log('Total cart items found:', cartItems.children.length);

        const items = Array.from(cartItems.children)
            .filter(item => item.querySelector('.cart-item-text'))
            .map(item => {
                const text = item.querySelector('.cart-item-text').textContent.trim();
                console.log('Raw item text:', text);

                // Prøv først material format
                let matches = text.match(/(\d+)\s*(\d{3})\s*x\s*(.*?)\s*-\s*\$(\d+\.\d{2})/);
                
                // Hvis det ikke matcher, prøv component format
                if (!matches) {
                    matches = text.match(/(\d+)\s*x\s*(.*?)\s*-\s*\$(\d+\.\d{2})/);
                    if (matches) {
                        // For components har vi bare ett tall for quantity
                        const [_, quantity, name, priceStr] = matches;
                        console.log('Parsed component:', {
                            quantity,
                            name,
                            price: priceStr
                        });
                        
                        return {
                            name: name.trim(),
                            amount: Math.round(parseFloat(priceStr) * 100),
                            currency: 'usd',
                            quantity: 1
                        };
                    }
                } else {
                    // For materials, kombiner de to talldelene
                    const [_, firstPart, secondPart, name, priceStr] = matches;
                    const quantity = parseInt(firstPart + secondPart);
                    console.log('Parsed material:', {
                        firstPart,
                        secondPart,
                        combinedQuantity: quantity,
                        name,
                        price: priceStr
                    });
                    
                    return {
                        name: name.trim(),
                        amount: Math.round(parseFloat(priceStr) * 100),
                        currency: 'usd',
                        quantity: 1
                    };
                }

                console.error('Could not parse item text:', text);
                return null;
            })
            .filter(item => item !== null);

        console.log('Processed items:', items.map(item => ({
            name: item.name,
            amount: item.amount,
            quantity: item.quantity
        })));

        if (items.length === 0) {
            throw new Error('No valid items in cart');
        }

        const response = await fetch('http://localhost:5000/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: items,
                discountAmount: parseFloat(document.getElementById('cart-discount').textContent)
            })
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (!response.ok) {
            throw new Error(responseData.error || 'Network response was not ok');
        }

        const result = await stripe.redirectToCheckout({
            sessionId: responseData.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

    } catch (error) {
        console.error('Checkout Error:', error);
        alert(`Checkout error: ${error.message}`);
    }
}

function updateMaterialCost() {
    const materialSlider = document.getElementById('material-amount');
    const materialCost = document.getElementById('material-cost');
    
    if (materialSlider && materialCost && currentMaterial.price) {
        const amount = parseInt(materialSlider.value);
        const cost = (amount * currentMaterial.price).toFixed(2);
        materialCost.textContent = `$${cost}`;
    }
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Attempting sign in...');
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Sign in failed');
        }

        console.log('Sign in successful');
        
        // Lagre brukerinfo
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isAdmin', data.is_admin);

        // Lukk modal og oppdater status
        closeLoginModal();
        updateUserStatus();

    } catch (error) {
        console.error('Sign in error:', error);
    }
}

function updateUserStatus() {
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    const userStatus = document.querySelector('.user-status');
    
    if (!userStatus) {
        console.error('User status element not found');
        return;
    }

    if (token && email) {
        userStatus.innerHTML = `
            <span id="user-email">${email}</span>
            <button class="logout-btn" onclick="signOut()">Sign Out</button>
        `;
    } else {
        userStatus.innerHTML = `
            <button class="login-btn" onclick="openLoginModal()">Sign In</button>
        `;
    }
}

function signOut() {
    try {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        updateUserStatus();
        console.log('Sign out successful');
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// Sjekk login status når siden lastes
document.addEventListener('DOMContentLoaded', () => {
    try {
        updateUserStatus();
        
        // Legg til event listeners for Enter-tast i login-feltene
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput && passwordInput) {
            emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    passwordInput.focus();
                }
            });
            
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    signIn();
                }
            });
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Legg til disse nye funksjonene
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        switchToSignIn(); // Alltid start med login-skjermen
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Reset input fields manually
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// Forbedret event listener for klikk utenfor modal
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (modal && event.target === modal) {
        closeLoginModal();
    }
}

function switchToSignUp() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
}

function switchToSignIn() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

async function signUp() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        alert('Registration successful! Please sign in.');
        switchToSignIn();
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
    }
}