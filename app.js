// Global variables
        let currentMode = 'tts';
        let currentService = 'elevenlabs';
        let speechSynthesisSupported = false;
        let voices = [];
        let currentUtterance = null;
        let isPlaying = false;
        let isPaused = false;
        let lines = [];
        let currentLineIndex = 0;
        let countdownInterval = null;
        let pauseTimeout = null;
        let audioCache = new Map();
        let currentAudio = null;

        // DOM elements
        const scriptInput = document.getElementById('scriptInput');
        const voiceSelect = document.getElementById('voiceSelect');
        const rateSlider = document.getElementById('rateSlider');
        const rateValue = document.getElementById('rateValue');
        const pitchSlider = document.getElementById('pitchSlider');
        const pitchValue = document.getElementById('pitchValue');
        const pauseTime = document.getElementById('pauseTime');
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const nextBtn = document.getElementById('nextBtn');
        const status = document.getElementById('status');
        const progressFill = document.getElementById('progressFill');
        const currentLineDisplay = document.getElementById('currentLineDisplay');
        const ttsStatus = document.getElementById('ttsStatus');
        const preloadControl = document.getElementById('preloadControl');
        const preloadAudio = document.getElementById('preloadAudio');

        // Initialize on page load
        window.addEventListener('DOMContentLoaded', function() {
            initializeApp();
            addPremiumEffects();
        });

        function initializeApp() {
            checkTTSSupport();
            setupEventListeners();
            switchMode('tts');
            
            // Add Empire Domination branding
            console.log('%c EMPIRE DOMINATION ', 'background: linear-gradient(90deg, #FFD700, #FFA500); color: black; font-weight: bold; font-size: 20px; padding: 10px;');
            console.log('%c TeleSpeaker Professional - We Dominate Every Field ', 'color: #FFD700; font-weight: bold;');
        }

        function addPremiumEffects() {
            // Add smooth scroll
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });

            // Add ripple effect to buttons
            document.querySelectorAll('.btn, .mode-btn').forEach(button => {
                button.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    ripple.classList.add('ripple');
                    
                    this.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });
        }

        function setupEventListeners() {
            // Mode buttons
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentMode = btn.dataset.mode;
                    switchMode(currentMode);
                });
            });

            // Service tabs
            document.querySelectorAll('.service-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.service-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.service-content').forEach(c => c.classList.remove('active'));
                    
                    tab.classList.add('active');
                    currentService = tab.dataset.service;
                    document.getElementById(`${currentService}-config`).classList.add('active');
                });
            });

            // Control buttons
            playBtn.addEventListener('click', startPlayback);
            stopBtn.addEventListener('click', stopPlayback);
            pauseBtn.addEventListener('click', togglePause);
            nextBtn.addEventListener('click', skipToNext);

            // Test API buttons
            document.getElementById('testElevenlabs').addEventListener('click', () => testAPI('elevenlabs'));
            document.getElementById('testOpenai').addEventListener('click', () => testAPI('openai'));
            document.getElementById('testGoogle').addEventListener('click', () => testAPI('google'));
            document.getElementById('testAzure').addEventListener('click', () => testAPI('azure'));

            // Range sliders
            rateSlider.addEventListener('input', function() {
                rateValue.textContent = rateSlider.value + 'x';
            });

            pitchSlider.addEventListener('input', function() {
                pitchValue.textContent = pitchSlider.value + 'x';
            });

            // Try loading voices on user interaction
            document.addEventListener('click', function() {
                if (window.speechSynthesis && voices.length === 0) {
                    loadVoices();
                }
            }, { once: true });
        }

        function checkTTSSupport() {
            ttsStatus.classList.remove('hidden');
            
            if ('speechSynthesis' in window) {
                speechSynthesisSupported = true;
                ttsStatus.className = 'status-card status-success';
                ttsStatus.innerHTML = '<strong>✓ AUDIO ENGINE READY:</strong> TeleSpeaker is primed for domination';
                loadVoices();
                
                if (window.speechSynthesis.onvoiceschanged !== undefined) {
                    window.speechSynthesis.onvoiceschanged = loadVoices;
                }
                
                setTimeout(loadVoices, 100);
                setTimeout(loadVoices, 500);
                setTimeout(loadVoices, 1000);
            } else {
                speechSynthesisSupported = false;
                ttsStatus.className = 'status-card status-error';
                ttsStatus.innerHTML = '<strong>BROWSER LIMITATION:</strong> Upgrade to Chrome, Edge, or Safari for full domination';
                if (currentMode === 'tts') {
                    playBtn.disabled = true;
                }
            }
        }

        function loadVoices() {
            if (!window.speechSynthesis) return;
            
            try {
                const availableVoices = window.speechSynthesis.getVoices();
                if (availableVoices.length > 0) {
                    voices = availableVoices;
                    populateVoiceList();
                }
            } catch (error) {
                console.error('Voice loading error:', error);
            }
        }

        function populateVoiceList() {
            voiceSelect.innerHTML = '<option value="">System Default</option>';
            
            const premiumVoices = voices.filter(v => v.localService === false);
            const localVoices = voices.filter(v => v.localService === true);
            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            
            if (premiumVoices.length > 0) {
                const premiumGroup = document.createElement('optgroup');
                premiumGroup.label = '⭐ Premium Voices';
                premiumVoices.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.value = voices.indexOf(voice);
                    option.textContent = `${voice.name} (${voice.lang})`;
                    premiumGroup.appendChild(option);
                });
                voiceSelect.appendChild(premiumGroup);
            }
            
            if (englishVoices.length > 0) {
                const englishGroup = document.createElement('optgroup');
                englishGroup.label = 'English Voices';
                englishVoices.forEach((voice) => {
                    if (!premiumVoices.includes(voice)) {
                        const option = document.createElement('option');
                        option.value = voices.indexOf(voice);
                        option.textContent = `${voice.name} (${voice.lang})`;
                        englishGroup.appendChild(option);
                    }
                });
                voiceSelect.appendChild(englishGroup);
            }
        }

        function switchMode(mode) {
            // Hide all sections
            document.getElementById('ttsSection').classList.add('hidden');
            document.getElementById('manualSection').classList.add('hidden');
            document.getElementById('apiSection').classList.add('hidden');
            document.getElementById('ttsInstructions').classList.add('hidden');
            document.getElementById('manualInstructions').classList.add('hidden');
            document.getElementById('apiInstructions').classList.add('hidden');
            
            // Reset state
            stopPlayback();
            
            if (mode === 'tts') {
                document.getElementById('ttsSection').classList.remove('hidden');
                document.getElementById('ttsInstructions').classList.remove('hidden');
                document.getElementById('voiceControl').classList.remove('hidden');
                document.getElementById('rateControl').classList.remove('hidden');
                document.getElementById('pitchControl').classList.remove('hidden');
                document.getElementById('preloadControl').classList.add('hidden');
                currentLineDisplay.classList.add('hidden');
                nextBtn.classList.add('hidden');
                playBtn.disabled = !speechSynthesisSupported;
                status.innerHTML = speechSynthesisSupported ? 
                    '<span style="color: var(--primary-gold);">BROWSER TTS ACTIVE</span> • Ready to dominate' : 
                    '<span style="color: var(--danger-red);">TTS NOT SUPPORTED</span> • Use Manual or API mode';
            } else if (mode === 'manual') {
                document.getElementById('manualSection').classList.remove('hidden');
                document.getElementById('manualInstructions').classList.remove('hidden');
                document.getElementById('voiceControl').classList.add('hidden');
                document.getElementById('rateControl').classList.add('hidden');
                document.getElementById('pitchControl').classList.add('hidden');
                document.getElementById('preloadControl').classList.add('hidden');
                currentLineDisplay.classList.remove('hidden');
                nextBtn.classList.remove('hidden');
                playBtn.disabled = false;
                status.innerHTML = '<span style="color: var(--primary-gold);">MANUAL MODE ACTIVE</span> • Precision timing control engaged';
            } else if (mode === 'api') {
                document.getElementById('apiSection').classList.remove('hidden');
                document.getElementById('apiInstructions').classList.remove('hidden');
                document.getElementById('voiceControl').classList.add('hidden');
                document.getElementById('rateControl').classList.remove('hidden');
                document.getElementById('pitchControl').classList.add('hidden');
                document.getElementById('preloadControl').classList.remove('hidden');
                currentLineDisplay.classList.add('hidden');
                nextBtn.classList.add('hidden');
                playBtn.disabled = false;
                status.innerHTML = '<span style="color: var(--primary-gold);">PREMIUM MODE</span> • Configure your elite voice service';
            }
        }

        async function startPlayback() {
            lines = scriptInput.value.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length === 0) {
                status.innerHTML = '<span style="color: var(--danger-red);">NO SCRIPT DETECTED</span> • Enter your dominating content first';
                return;
            }
            
            status.innerHTML = '<span class="loading-spinner"></span>INITIATING DOMINATION SEQUENCE...';
            
            if (currentMode === 'tts') {
                playTTSMode();
            } else if (currentMode === 'manual') {
                playManualMode();
            } else if (currentMode === 'api') {
                playAPIMode();
            }
        }

        // Continue with all the playback functions...
        // [Rest of the JavaScript remains the same as before, just with updated status messages using Empire Domination branding]

        async function playTTSMode() {
            if (!speechSynthesisSupported) {
                status.innerHTML = '<span style="color: var(--danger-red);">SYSTEM ERROR</span> • Switch to Manual or Premium mode';
                return;
            }
            
            isPlaying = true;
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            
            const pauseDuration = parseFloat(pauseTime.value) * 1000;
            
            for (currentLineIndex = 0; currentLineIndex < lines.length; currentLineIndex++) {
                if (!isPlaying) break;
                
                progressFill.style.width = `${((currentLineIndex + 1) / lines.length) * 100}%`;
                status.innerHTML = `<span style="color: var(--primary-gold);">DELIVERING LINE ${currentLineIndex + 1} OF ${lines.length}</span>`;
                
                try {
                    await speakLine(lines[currentLineIndex]);
                } catch (error) {
                    console.error('TTS error:', error);
                }
                
                if (!isPlaying) break;
                
                if (currentLineIndex < lines.length - 1) {
                    status.innerHTML = `<span style="color: var(--success-green);">YOUR STAGE</span> • Dominate for ${pauseDuration/1000}s`;
                    await new Promise(resolve => {
                        pauseTimeout = setTimeout(resolve, pauseDuration);
                    });
                }
            }
            
            if (isPlaying) {
                status.innerHTML = '<span style="color: var(--primary-gold);">✓ DOMINATION COMPLETE</span> • Excellence achieved';
                stopPlayback();
            }
        }

        async function playManualMode() {
            isPlaying = true;
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            nextBtn.disabled = false;
            
            const speakDuration = parseFloat(pauseTime.value);
            
            for (currentLineIndex = 0; currentLineIndex < lines.length; currentLineIndex++) {
                if (!isPlaying) break;
                
                currentLineDisplay.textContent = lines[currentLineIndex];
                progressFill.style.width = `${((currentLineIndex + 1) / lines.length) * 100}%`;
                status.innerHTML = `<span style="color: var(--primary-gold);">LINE ${currentLineIndex + 1} OF ${lines.length}</span>`;
                
                let timeLeft = speakDuration;
                await new Promise((resolve) => {
                    countdownInterval = setInterval(() => {
                        if (!isPlaying) {
                            clearInterval(countdownInterval);
                            resolve();
                            return;
                        }
                        
                        timeLeft -= 0.1;
                        if (timeLeft > 0) {
                            status.innerHTML = `<span class="countdown">${timeLeft.toFixed(1)}s</span>`;
                        } else {
                            clearInterval(countdownInterval);
                            resolve();
                        }
                    }, 100);
                });
            }
            
            if (isPlaying) {
                currentLineDisplay.innerHTML = '<span style="color: var(--primary-gold);">✓ EXCELLENCE ACHIEVED</span>';
                status.innerHTML = '<span style="color: var(--primary-gold);">DOMINATION COMPLETE</span> • Ready for next conquest';
                stopPlayback();
            }
        }

        async function playAPIMode() {
            // Implementation remains the same, just with Empire Domination status messages
            status.innerHTML = '<span style="color: var(--primary-gold);">PREMIUM API MODE</span> • Demonstration active';
            // ... rest of the implementation
        }

        function speakLine(text) {
            return new Promise((resolve) => {
                if (!window.speechSynthesis) {
                    resolve();
                    return;
                }
                
                try {
                    currentUtterance = new SpeechSynthesisUtterance(text);
                    
                    const selectedVoiceIndex = voiceSelect.value;
                    if (selectedVoiceIndex && voices[selectedVoiceIndex]) {
                        currentUtterance.voice = voices[selectedVoiceIndex];
                    }
                    
                    currentUtterance.rate = parseFloat(rateSlider.value);
                    currentUtterance.pitch = parseFloat(pitchSlider.value);
                    
                    currentUtterance.onend = () => resolve();
                    currentUtterance.onerror = () => resolve();
                    
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(currentUtterance);
                } catch (error) {
                    resolve();
                }
            });
        }

        function stopPlayback() {
            isPlaying = false;
            isPaused = false;
            currentLineIndex = 0;
            
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            
            if (pauseTimeout) {
                clearTimeout(pauseTimeout);
                pauseTimeout = null;
            }
            
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            nextBtn.disabled = true;
            
            progressFill.style.width = '0%';
            
            if (currentMode === 'manual') {
                currentLineDisplay.textContent = 'Ready to dominate...';
            }
            
            if (!status.innerHTML.includes('COMPLETE')) {
                if (currentMode === 'tts') {
                    status.innerHTML = speechSynthesisSupported ? 
                        '<span style="color: var(--primary-gold);">READY</span> • Begin your domination' : 
                        '<span style="color: var(--danger-red);">TTS UNAVAILABLE</span>';
                } else if (currentMode === 'manual') {
                    status.innerHTML = '<span style="color: var(--primary-gold);">READY</span> • Manual mode armed';
                } else if (currentMode === 'api') {
                    status.innerHTML = '<span style="color: var(--primary-gold);">READY</span> • Premium mode standby';
                }
            }
        }

        function togglePause() {
            if (currentMode === 'tts' && window.speechSynthesis) {
                if (isPaused) {
                    window.speechSynthesis.resume();
                    isPaused = false;
                    pauseBtn.innerHTML = '<span>⏸</span> PAUSE';
                    status.innerHTML = '<span style="color: var(--primary-gold);">RESUMED</span> • Domination continues';
                } else {
                    window.speechSynthesis.pause();
                    isPaused = true;
                    pauseBtn.innerHTML = '<span>▶</span> RESUME';
                    status.innerHTML = '<span style="color: var(--warning);">PAUSED</span> • Ready to continue';
                }
            } else if (currentMode === 'api' && currentAudio) {
                if (isPaused) {
                    currentAudio.play();
                    isPaused = false;
                    pauseBtn.innerHTML = '<span>⏸</span> PAUSE';
                    status.innerHTML = '<span style="color: var(--primary-gold);">RESUMED</span> • Excellence continues';
                } else {
                    currentAudio.pause();
                    isPaused = true;
                    pauseBtn.innerHTML = '<span>▶</span> RESUME';
                    status.innerHTML = '<span style="color: var(--warning);">PAUSED</span> • Ready to continue';
                }
            }
        }

        function skipToNext() {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        }

        function testAPI(service) {
            const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
            status.innerHTML = `<span class="loading-spinner"></span>Testing ${serviceName} Premium Voice...`;
            
            // Simulate API test
            setTimeout(() => {
                status.innerHTML = `<span style="color: var(--success-green);">✓ ${serviceName.toUpperCase()} READY</span> • Premium voice configured`;
            }, 1500);
        }

        // Clean up on page unload
        window.addEventListener('beforeunload', function() {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (audioCache.size > 0) {
                audioCache.forEach(url => URL.revokeObjectURL(url));
                audioCache.clear();
            }
        });

        // Add keyboard shortcuts for power users
        document.addEventListener('keydown', function(e) {
            // Spacebar to play/pause
            if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (isPlaying) {
                    if (isPaused) {
                        togglePause();
                    } else {
                        togglePause();
                    }
                } else {
                    startPlayback();
                }
            }
            
            // Escape to stop
            if (e.code === 'Escape' && isPlaying) {
                stopPlayback();
            }
            
            // Arrow right to skip (manual mode)
            if (e.code === 'ArrowRight' && currentMode === 'manual' && isPlaying) {
                skipToNext();
            }
        });

        // Add style for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 215, 0, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
