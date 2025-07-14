// Authentication and Supabase integration for SUNO AI Complete Builder

// Initialize Supabase client
let supabaseClient = null;
let currentUser = null;

// Initialize Supabase
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded');
        return false;
    }
    
    supabaseClient = window.supabase.createClient(
        window.SUNO_CONFIG.supabase.url,
        window.SUNO_CONFIG.supabase.anonKey
    );
    
    // Check for existing session
    checkAuthState();
    
    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            handleSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleSignOut();
        }
    });
    
    return true;
}

// Check current auth state
async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        
        if (session) {
            await handleSignIn(session.user);
        } else {
            handleSignOut();
        }
    } catch (error) {
        console.error('Auth state check error:', error);
    }
}

// Handle sign in
async function handleSignIn(user) {
    currentUser = user;
    
    // Create or update user in database
    try {
        const { error } = await supabaseClient
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                google_id: user.user_metadata?.sub,
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        // Initialize usage limits if not exists
        await initializeUsageLimits(user.id);
        
        // Update UI
        updateAuthUI(true);
        await updateUsageDisplay();
        
    } catch (error) {
        console.error('User creation error:', error);
    }
}

// Handle sign out
function handleSignOut() {
    currentUser = null;
    updateAuthUI(false);
    clearUsageDisplay();
}

// Initialize usage limits for new user
async function initializeUsageLimits(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('usage_limits')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code === 'PGRST116') {
            // No usage record exists, create one
            const { error: insertError } = await supabaseClient
                .from('usage_limits')
                .insert({
                    user_id: userId,
                    prompt_generations_used: 0,
                    prompt_generations_limit: window.SUNO_CONFIG.limits.free.promptGenerations,
                    lyric_generations_used: 0,
                    lyric_generations_limit: window.SUNO_CONFIG.limits.free.lyricGenerations,
                    reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                });
            
            if (insertError) throw insertError;
        }
    } catch (error) {
        console.error('Usage limits initialization error:', error);
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Google sign in error:', error);
        alert('ログインエラーが発生しました: ' + error.message);
    }
}

// Sign out
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// Check if user can generate prompt
async function canGeneratePrompt() {
    if (!currentUser) return false;
    
    // 使用制限を一時的に無効化
    return true;
    
    /*
    try {
        const { data, error } = await supabaseClient
            .rpc('can_generate_prompt', { user_uuid: currentUser.id });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Can generate prompt check error:', error);
        return false;
    }
    */
}

// Check if user can generate lyrics
async function canGenerateLyrics() {
    if (!currentUser) return false;
    
    // 使用制限を一時的に無効化
    return true;
    
    /*
    try {
        const { data, error } = await supabaseClient
            .rpc('can_generate_lyrics', { user_uuid: currentUser.id });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Can generate lyrics check error:', error);
        return false;
    }
    */
}

// Increment usage count
async function incrementUsage(type) {
    if (!currentUser) return false;
    
    try {
        const { error } = await supabaseClient
            .rpc('increment_usage', { 
                user_uuid: currentUser.id, 
                generation_type: type 
            });
        
        if (error) throw error;
        
        // Update usage display
        await updateUsageDisplay();
        return true;
    } catch (error) {
        console.error('Increment usage error:', error);
        return false;
    }
}

// Save prompt generation
async function savePromptGeneration(promptData) {
    if (!currentUser) return false;
    
    try {
        const { error } = await supabaseClient
            .from('prompt_generations')
            .insert({
                user_id: currentUser.id,
                vocal_tags: promptData.vocalTags,
                mood_styles: promptData.moodStyles,
                genres: promptData.genres,
                artist_styles: promptData.artistStyles,
                language: promptData.language,
                generated_prompt: promptData.generatedPrompt
            });
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Save prompt generation error:', error);
        return false;
    }
}

// Save lyric generation
async function saveLyricGeneration(lyricData) {
    if (!currentUser) return false;
    
    try {
        const { error } = await supabaseClient
            .from('lyric_generations')
            .insert({
                user_id: currentUser.id,
                genre: lyricData.genre,
                theme: lyricData.theme,
                target_age: lyricData.targetAge,
                primary_emotion: lyricData.primaryEmotion,
                emotion_intensity: lyricData.emotionIntensity,
                emotion_change: lyricData.emotionChange,
                language_level: lyricData.languageLevel,
                metaphor_usage: lyricData.metaphorUsage,
                rhythm_pattern: lyricData.rhythmPattern,
                keywords: lyricData.keywords,
                avoid_expressions: lyricData.avoidExpressions,
                language: lyricData.language,
                song_structure: lyricData.songStructure,
                literary_reference: lyricData.literaryReference,
                generated_lyrics: lyricData.generatedLyrics,
                quality_scores: lyricData.qualityScores
            });
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Save lyric generation error:', error);
        return false;
    }
}

// Get usage statistics
async function getUsageStats() {
    if (!currentUser) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('usage_limits')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get usage stats error:', error);
        return null;
    }
}

// Update usage display in UI
async function updateUsageDisplay() {
    const usageStats = await getUsageStats();
    if (!usageStats) return;
    
    // Update prompt usage display
    const promptUsageEl = document.getElementById('prompt-usage');
    if (promptUsageEl) {
        const promptUsed = usageStats.prompt_generations_used;
        const promptLimit = usageStats.prompt_generations_limit;
        promptUsageEl.textContent = `プロンプト生成: ${promptUsed}/${promptLimit === -1 ? '無制限' : promptLimit}`;
    }
    
    // Update lyric usage display
    const lyricUsageEl = document.getElementById('lyric-usage');
    if (lyricUsageEl) {
        const lyricUsed = usageStats.lyric_generations_used;
        const lyricLimit = usageStats.lyric_generations_limit;
        lyricUsageEl.textContent = `歌詞生成: ${lyricUsed}/${lyricLimit === -1 ? '無制限' : lyricLimit}`;
    }
}

// Clear usage display
function clearUsageDisplay() {
    const promptUsageEl = document.getElementById('prompt-usage');
    if (promptUsageEl) promptUsageEl.textContent = '';
    
    const lyricUsageEl = document.getElementById('lyric-usage');
    if (lyricUsageEl) lyricUsageEl.textContent = '';
}

// Update auth UI
function updateAuthUI(isSignedIn) {
    const authContainer = document.getElementById('auth-container');
    const userContainer = document.getElementById('user-container');
    
    if (isSignedIn && currentUser) {
        if (authContainer) authContainer.style.display = 'none';
        if (userContainer) {
            userContainer.style.display = 'flex';
            userContainer.innerHTML = `
                <div class="user-info">
                    <img src="${currentUser.user_metadata?.avatar_url || '/default-avatar.png'}" 
                         alt="Avatar" class="user-avatar">
                    <span class="user-name">${currentUser.user_metadata?.full_name || currentUser.email}</span>
                </div>
                <div class="usage-info">
                    <div id="prompt-usage"></div>
                    <div id="lyric-usage"></div>
                </div>
                <button onclick="signOut()" class="sign-out-btn">ログアウト</button>
            `;
        }
    } else {
        if (authContainer) {
            authContainer.style.display = 'flex';
            authContainer.innerHTML = `
                <button onclick="signInWithGoogle()" class="google-signin-btn">
                    <i class="fab fa-google"></i>
                    Googleでログイン
                </button>
            `;
        }
        if (userContainer) userContainer.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Supabase library to load
    if (typeof window.supabase !== 'undefined') {
        initSupabase();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof window.supabase !== 'undefined') {
                initSupabase();
            }
        }, 1000);
    }
});
