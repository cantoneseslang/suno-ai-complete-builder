// Stripe integration for SUNO AI Complete Builder

let stripe = null;

// Initialize Stripe
function initStripe() {
    if (typeof window.Stripe === 'undefined') {
        console.error('Stripe library not loaded');
        return false;
    }
    
    stripe = window.Stripe(window.SUNO_CONFIG.stripe.publishableKey);
    return true;
}

// Create subscription checkout session
async function createSubscriptionCheckout() {
    if (!currentUser) {
        alert('プレミアムプランにアップグレードするにはログインが必要です');
        return;
    }
    
    try {
        // Call your backend to create checkout session
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                email: currentUser.email,
                priceId: 'price_premium_monthly', // Replace with your actual price ID
                successUrl: window.location.origin + '/success',
                cancelUrl: window.location.origin + '/cancel'
            })
        });
        
        const session = await response.json();
        
        if (session.error) {
            throw new Error(session.error);
        }
        
        // Redirect to Stripe checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.sessionId
        });
        
        if (result.error) {
            throw new Error(result.error.message);
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('決済処理でエラーが発生しました: ' + error.message);
    }
}

// Handle successful payment
async function handlePaymentSuccess(sessionId) {
    try {
        // Verify payment with backend
        const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: sessionId,
                userId: currentUser?.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update user subscription status
            await updateSubscriptionStatus();
            alert('プレミアムプランへのアップグレードが完了しました！');
            
            // Refresh the page to update UI
            window.location.reload();
        } else {
            throw new Error(result.error || 'Payment verification failed');
        }
        
    } catch (error) {
        console.error('Payment verification error:', error);
        alert('決済の確認でエラーが発生しました: ' + error.message);
    }
}

// Update subscription status
async function updateSubscriptionStatus() {
    if (!currentUser) return;
    
    try {
        // This would typically be done by webhook, but we can also check here
        const { data, error } = await supabaseClient
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('status', 'active')
            .single();
        
        if (data) {
            // Update usage limits for premium user
            await supabaseClient
                .from('usage_limits')
                .update({
                    prompt_generations_limit: -1, // unlimited
                    lyric_generations_limit: -1,  // unlimited
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUser.id);
            
            // Update UI
            await updateUsageDisplay();
        }
        
    } catch (error) {
        console.error('Subscription status update error:', error);
    }
}

// Check subscription status
async function checkSubscriptionStatus() {
    if (!currentUser) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('status', 'active')
            .gte('current_period_end', new Date().toISOString())
            .single();
        
        return data;
    } catch (error) {
        // No active subscription found
        return null;
    }
}

// Show upgrade modal
function showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>🚀 プレミアムプランにアップグレード</h3>
                <button class="modal-close" onclick="closeUpgradeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="plan-details">
                    <div class="plan-price">
                        <span class="price">$${window.SUNO_CONFIG.plans.premium.price}</span>
                        <span class="period">/${window.SUNO_CONFIG.plans.premium.interval}</span>
                    </div>
                    <ul class="plan-features">
                        ${window.SUNO_CONFIG.plans.premium.features.map(feature => 
                            `<li><i class="fas fa-check"></i> ${feature}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="modal-actions">
                    <button onclick="createSubscriptionCheckout()" class="upgrade-btn">
                        今すぐアップグレード
                    </button>
                    <button onclick="closeUpgradeModal()" class="cancel-btn">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking backdrop
    modal.querySelector('.modal-backdrop').onclick = closeUpgradeModal;
}

// Close upgrade modal
function closeUpgradeModal() {
    const modal = document.querySelector('.upgrade-modal');
    if (modal) {
        modal.remove();
    }
}

// Check if action requires premium
async function requiresPremium(action) {
    if (!currentUser) return true;
    
    const subscription = await checkSubscriptionStatus();
    if (subscription) return false; // Has premium
    
    if (action === 'prompt') {
        return !(await canGeneratePrompt());
    } else if (action === 'lyrics') {
        return !(await canGenerateLyrics());
    }
    
    return false;
}

// Handle premium requirement
async function handlePremiumRequired(action) {
    const modal = document.createElement('div');
    modal.className = 'limit-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚡ 使用制限に達しました</h3>
                <button class="modal-close" onclick="closeLimitModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>
                    ${action === 'prompt' ? 'プロンプト生成' : '歌詞生成'}の無料枠を使い切りました。<br>
                    プレミアムプランで無制限にご利用いただけます。
                </p>
                <div class="modal-actions">
                    <button onclick="showUpgradeModal(); closeLimitModal();" class="upgrade-btn">
                        プレミアムプランを見る
                    </button>
                    <button onclick="closeLimitModal()" class="cancel-btn">
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('.modal-backdrop').onclick = closeLimitModal;
}

// Close limit modal
function closeLimitModal() {
    const modal = document.querySelector('.limit-modal');
    if (modal) {
        modal.remove();
    }
}

// Add upgrade button to UI
function addUpgradeButton() {
    const upgradeContainer = document.getElementById('upgrade-container');
    if (upgradeContainer && currentUser) {
        checkSubscriptionStatus().then(subscription => {
            if (!subscription) {
                upgradeContainer.innerHTML = `
                    <button onclick="showUpgradeModal()" class="premium-btn">
                        <i class="fas fa-crown"></i>
                        プレミアムプランにアップグレード
                    </button>
                `;
            } else {
                upgradeContainer.innerHTML = `
                    <div class="premium-badge">
                        <i class="fas fa-crown"></i>
                        プレミアムユーザー
                    </div>
                `;
            }
        });
    }
}

// Initialize Stripe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Stripe library to load
    if (typeof window.Stripe !== 'undefined') {
        initStripe();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof window.Stripe !== 'undefined') {
                initStripe();
            }
        }, 1000);
    }
    
    // Check for payment success in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
        handlePaymentSuccess(sessionId);
    }
});
