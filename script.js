document.addEventListener('DOMContentLoaded', () => {
    // --- Universal Scroll-Triggered Stat Counter Animation ---
    const statContainers = document.querySelectorAll('.stats-panel, .story-stats, .af-map-stats, .about-stats, .lf-dest-stats');

    const animateStatGroup = (container) => {
        const stats = container.querySelectorAll('.stat-number, .af-stat-num, .lf-stat-num');
        stats.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            if (isNaN(target)) return;
            const suffix = stat.getAttribute('data-suffix') || '';
            const prefix = stat.getAttribute('data-prefix') || '';
            const duration = 1800; // 1.8 seconds
            const startTime = performance.now();
            const isFloat = !Number.isInteger(target) || (stat.getAttribute('data-target') && stat.getAttribute('data-target').includes('.'));

            const updateNumber = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // easeOutQuart easing function for smooth deceleration
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                const current = target * easeProgress;

                if (isFloat) {
                    stat.innerText = prefix + current.toFixed(1) + suffix;
                } else {
                    stat.innerText = prefix + Math.floor(current) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.innerText = prefix + target + suffix;
                }
            };

            requestAnimationFrame(updateNumber);
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatGroup(entry.target);
            } else {
                // Reset numbers when scrolled out of view so it replays
                const stats = entry.target.querySelectorAll('.stat-number, .af-stat-num, .lf-stat-num');
                stats.forEach(stat => {
                    const suffix = stat.getAttribute('data-suffix') || '';
                    const prefix = stat.getAttribute('data-prefix') || '';
                    stat.innerText = prefix + '0' + suffix;
                });
            }
        });
    }, { threshold: 0.25 });

    statContainers.forEach(container => statsObserver.observe(container));

    // --- Scroll-Triggered Hero Animation ---
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // To replay the animation cleanly, we remove the class, force a reflow, and add it back
                entry.target.classList.remove('play-animation');
                void entry.target.offsetWidth; // Force reflow
                entry.target.classList.add('play-animation');
            } else {
                // Remove the class when out of view so it can replay when scrolling back
                entry.target.classList.remove('play-animation');
            }
        });
    }, { threshold: 0.2 });

    const animContainer = document.querySelector('.animation-container');
    if (animContainer) {
        animObserver.observe(animContainer);
    }

    // --- Parallax Scrolling for Shipping Containers ---
    const containersSection = document.querySelector('.expert-containers-section');
    if (containersSection) {
        window.addEventListener('scroll', () => {
            const rect = containersSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Only calculate if section is in viewport
            if (rect.top <= windowHeight && rect.bottom >= 0) {
                const sectionCenter = rect.top + (rect.height / 2);
                const viewCenter = windowHeight / 2;
                const diff = viewCenter - sectionCenter;
                
                // Adjust multiplier for parallax speed
                const offset = diff * 0.15;
                
                // Clamp the offset to prevent extreme movement downwards onto FAQ section
                const clampedOffset = Math.max(-40, Math.min(20, offset));
                
                // Update the custom property which drives the CSS transforms
                containersSection.style.setProperty('--parallax-offset', `${clampedOffset}px`);
            }
        });
    }

    // --- FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Testimonials Carousel Logic ---
    const testiTrack = document.querySelector('.testimonials-track');
    const testiCards = document.querySelectorAll('.testi-card');
    const testiPrev = document.querySelector('.testi-nav.prev');
    const testiNext = document.querySelector('.testi-nav.next');
    const testiDots = document.querySelectorAll('.testimonials-pagination .dot');
    
    if (testiTrack && testiCards.length > 0) {
        let currentIndex = 0;
        // Total cards minus the visible cards (assume 3 cards visible on desktop, 1 on mobile)
        const getVisibleCards = () => window.innerWidth <= 640 ? 1 : window.innerWidth <= 968 ? 2 : 3;
        
        const updateCarousel = () => {
            const cardWidth = testiCards[0].offsetWidth;
            const gap = 30; // gap from CSS
            const moveAmount = (cardWidth + gap) * currentIndex;
            testiTrack.style.transform = `translateX(-${moveAmount}px)`;
            
            // Update dots
            testiDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        };

        if (testiNext) {
            testiNext.addEventListener('click', () => {
                const maxIndex = testiCards.length - getVisibleCards();
                if (currentIndex < maxIndex) {
                    currentIndex++;
                } else {
                    currentIndex = 0; // Loop back
                }
                updateCarousel();
            });
        }

        if (testiPrev) {
            testiPrev.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                } else {
                    currentIndex = testiCards.length - getVisibleCards(); // Loop to end
                }
                updateCarousel();
            });
        }
        
        testiDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const maxIndex = testiCards.length - getVisibleCards();
                if (index <= maxIndex) {
                    currentIndex = index;
                    updateCarousel();
                }
            });
        });

        // Handle resize
        window.addEventListener('resize', () => {
            const maxIndex = testiCards.length - getVisibleCards();
            if (currentIndex > maxIndex) {
                currentIndex = Math.max(0, maxIndex);
            }
            updateCarousel();
        });
    }

    // --- Services Slider Logic ---
    const servicesTrack = document.getElementById('services-track');
    const serviceCards = document.querySelectorAll('#services-track .service-card');
    const servicesPrev = document.getElementById('services-prev');
    const servicesNext = document.getElementById('services-next');

    if (servicesTrack && serviceCards.length > 0) {
        let currentServiceIndex = 0;
        
        const getVisibleServiceCards = () => {
            if (window.innerWidth <= 640) return 1;
            if (window.innerWidth <= 968) return 2;
            if (window.innerWidth <= 1200) return 3;
            return 4;
        };

        const updateServicesSlider = () => {
            const cardWidth = serviceCards[0].offsetWidth;
            const gap = 30; // gap from CSS
            const moveAmount = (cardWidth + gap) * currentServiceIndex;
            servicesTrack.style.transform = `translateX(-${moveAmount}px)`;
            
            // Update button states
            const maxIndex = serviceCards.length - getVisibleServiceCards();
            if (servicesPrev) servicesPrev.disabled = currentServiceIndex === 0;
            if (servicesNext) servicesNext.disabled = currentServiceIndex >= maxIndex;
        };

        if (servicesNext) {
            servicesNext.addEventListener('click', () => {
                const maxIndex = serviceCards.length - getVisibleServiceCards();
                if (currentServiceIndex < maxIndex) {
                    currentServiceIndex++;
                    updateServicesSlider();
                }
            });
        }

        if (servicesPrev) {
            servicesPrev.addEventListener('click', () => {
                if (currentServiceIndex > 0) {
                    currentServiceIndex--;
                    updateServicesSlider();
                }
            });
        }

        window.addEventListener('resize', () => {
            const maxIndex = serviceCards.length - getVisibleServiceCards();
            if (currentServiceIndex > maxIndex) {
                currentServiceIndex = Math.max(0, maxIndex);
            }
            updateServicesSlider();
        });
        
        // Initial setup
        // Small delay to ensure CSS is applied
        setTimeout(updateServicesSlider, 50);
    }

    // --- Scroll-Triggered Flip for Vision & Mission Cards ---
    const flipCards = document.querySelectorAll('.purpose-flip');
    if (flipCards.length > 0) {
        const flipObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('flipped');
                } else {
                    // Reset so it flips again when scrolling back
                    entry.target.classList.remove('flipped');
                }
            });
        }, { threshold: 0.3 });

        flipCards.forEach((card, index) => {
            // Stagger: vision flips first, then mission after a short delay
            card.style.transitionDelay = `${index * 0.4}s`;
            flipObserver.observe(card);
        });
    }

    // --- Scroll Reveal for Global Network Panel ---
    const gnPanel = document.querySelector('.global-network-panel');
    if (gnPanel) {
        gnPanel.style.opacity = '0';
        gnPanel.style.transform = 'translateY(40px)';
        gnPanel.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        const gnObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                } else {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(40px)';
                }
            });
        }, { threshold: 0.2 });
        gnObserver.observe(gnPanel);
    }

    // --- Number Animation for Global Network Stats ---
    const gnStatNumbers = document.querySelectorAll('.gn-stat-number');
    if (gnStatNumbers.length > 0) {
        const animateGnNumbers = () => {
            gnStatNumbers.forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-target'));
                const suffix = stat.getAttribute('data-suffix') || '';
                const duration = 1800;
                const startTime = performance.now();
                const isFloat = !Number.isInteger(target) || stat.getAttribute('data-target').includes('.');

                const updateGnNumber = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 4);
                    const current = target * easeProgress;

                    if (isFloat) {
                        stat.innerText = current.toFixed(1) + suffix;
                    } else {
                        stat.innerText = Math.floor(current) + suffix;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateGnNumber);
                    } else {
                        stat.innerText = target + suffix;
                    }
                };

                requestAnimationFrame(updateGnNumber);
            });
        };

        const gnStatsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateGnNumbers();
                } else {
                    gnStatNumbers.forEach(stat => {
                        const suffix = stat.getAttribute('data-suffix') || '';
                        stat.innerText = '0' + suffix;
                    });
                }
            });
        }, { threshold: 0.3 });

        const gnStats = document.querySelector('.gn-stats');
        if (gnStats) {
            gnStatsObserver.observe(gnStats);
        }
    }
});

/* ================================================
   Globe 3D Auto-Tilt — Continuous Sine-Wave Animation
   ================================================ */
(function () {
    const container = document.getElementById('globeTiltContainer');
    if (!container) return;

    const MAX_TILT_X = 7;    // max tilt degrees on X axis
    const MAX_TILT_Y = 9;    // max tilt degrees on Y axis
    const SPEED_X = 0.0003;  // oscillation speed on X (vertical tilt)
    const SPEED_Y = 0.0005;  // oscillation speed on Y (horizontal tilt) — different = lissajous pattern

    let startTime = null;

    function tick(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // Two out-of-phase sine waves = smooth figure-8 / lissajous motion
        const rotateX = Math.sin(elapsed * SPEED_X) * MAX_TILT_X;
        const rotateY = Math.sin(elapsed * SPEED_Y + 1.2) * MAX_TILT_Y;

        container.style.transform =
            `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
})();

/* =========================================================
   Core Values Airplane — Scroll-Driven & Continuous Flight
   "scrolling pe run hoti rahe"
   ========================================================= */
(function () {
    const section = document.getElementById('coreValues');
    const plane = document.getElementById('cvAirplane') || document.querySelector('.cv-airplane-img');
    if (!section || !plane) return;

    let isVisible = false;
    let scrollProgress = 0;
    let currentProgress = 0;
    let autoCruiseOffset = 0;
    let lastTimestamp = performance.now();

    // Track visibility of Core Values section
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { threshold: 0.05, rootMargin: '120px 0px 120px 0px' });

    observer.observe(section);

    // Track scroll position through the section
    function onScroll() {
        if (!isVisible) return;
        const rect = section.getBoundingClientRect();
        const winH = window.innerHeight;

        // Progress from when section enters bottom of screen until it leaves
        const totalDistance = winH + rect.height;
        const traveled = winH - rect.top;
        const raw = traveled / totalDistance;

        // Scroll progress drives forward flight
        scrollProgress = Math.max(0, raw);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function flightLoop(timestamp) {
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        if (isVisible) {
            // Gentle continuous cruise forward (keeps flying even if scroll pauses)
            autoCruiseOffset += delta * 0.00018;

            // Target flight progress combines scroll movement + cruise
            // Scroll directly propels the airplane forward along its flight path!
            const targetCycle = (scrollProgress * 1.2 + autoCruiseOffset) % 1;

            // Smooth lerp (interpolation) for silky 60fps flight
            let diff = targetCycle - currentProgress;
            if (diff < -0.5) diff += 1;
            if (diff > 0.5) diff -= 1;
            currentProgress = (currentProgress + diff * 0.09) % 1;
            if (currentProgress < 0) currentProgress += 1;

            // Trajectory: taking off from "Our Core Values" across the sky towards the right
            const maxFlyX = Math.min(window.innerWidth * 0.48, 720);
            const flyX = currentProgress * maxFlyX;
            const flyY = -Math.sin(currentProgress * Math.PI * 0.88) * 80;
            const scale = 0.82 + Math.sin(currentProgress * Math.PI) * 0.24;
            const rotate = 1.0 + Math.sin(currentProgress * Math.PI * 0.85) * 2.4;

            // Smooth takeoff fade-in and horizon fade-out
            let opacity = 1;
            if (currentProgress < 0.08) {
                opacity = currentProgress / 0.08;
            } else if (currentProgress > 0.86) {
                opacity = Math.max(0, 1 - ((currentProgress - 0.86) / 0.14));
            }

            // Subtle atmospheric flight float (micro-turbulence)
            const wobbleY = Math.sin(timestamp * 0.0022) * 2.8;
            const wobbleRot = Math.cos(timestamp * 0.0018) * 0.6;

            plane.style.transform =
                `translate(${flyX.toFixed(1)}px, ${(flyY + wobbleY).toFixed(1)}px) ` +
                `scale(${scale.toFixed(3)}) ` +
                `rotate(${(rotate + wobbleRot).toFixed(2)}deg)`;
            plane.style.opacity = opacity.toFixed(2);
        }

        requestAnimationFrame(flightLoop);
    }

    requestAnimationFrame(flightLoop);
})();

/* =========================================================
   Our Promise Cursive Handwriting Typing & Running Text
   "add text running animation in this text and text likhta hua jaye"
   "scrolling pe hona chahiye ye"
   ========================================================= */
(function () {
    const cursiveEl = document.getElementById('opCursiveText') || document.querySelector('.op-cursive-text');
    if (!cursiveEl) return;

    const typedSpan = cursiveEl.querySelector('.op-typed-text');
    const cursor = cursiveEl.querySelector('.op-ink-cursor');
    const fullText = cursiveEl.getAttribute('data-text') || (typedSpan ? typedSpan.textContent.trim() : "Moving Possibilities Together");

    let isTyping = false;
    let typeTimer = null;
    let hasPlayed = false;

    function startTyping() {
        if (isTyping) return;
        isTyping = true;
        
        clearTimeout(typeTimer);
        typedSpan.textContent = '';
        cursiveEl.classList.remove('writing-done');
        cursiveEl.classList.add('is-writing');
        
        let index = 0;

        function typeNextLetter() {
            if (index < fullText.length) {
                typedSpan.textContent += fullText.charAt(index);
                index++;

                // Slightly varied realistic handwriting cadence
                const currentChar = fullText.charAt(index - 1);
                const delay = currentChar === ' ' ? 95 : (36 + Math.random() * 32);

                typeTimer = setTimeout(typeNextLetter, delay);
            } else {
                // Finished handwriting
                isTyping = false;
                hasPlayed = true;
                cursiveEl.classList.remove('is-writing');
                cursiveEl.classList.add('writing-done');
            }
        }

        // Small natural pause before first stroke
        typeTimer = setTimeout(typeNextLetter, 120);
    }

    function resetTyping() {
        clearTimeout(typeTimer);
        isTyping = false;
        hasPlayed = false;
        cursiveEl.classList.remove('is-writing', 'writing-done');
        typedSpan.textContent = '';
    }

    // Scroll Observer: Triggers as soon as the element scrolls into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTyping();
            } else {
                resetTyping();
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -30px 0px'
    });

    observer.observe(cursiveEl);

    // Scroll listener fallback for smooth, instantaneous trigger
    window.addEventListener('scroll', () => {
        const rect = cursiveEl.getBoundingClientRect();
        const winH = window.innerHeight;
        const inView = rect.top < winH * 0.88 && rect.bottom > winH * 0.12;
        
        if (inView && !isTyping && !hasPlayed) {
            startTyping();
        } else if (!inView && hasPlayed) {
            if (rect.top > winH * 1.2 || rect.bottom < -winH * 0.2) {
                resetTyping();
            }
        }
    }, { passive: true });
})();

// --- Business Approach Cards Stagger Animation on Scroll ---
(function initBusinessApproachScrollAnimation() {
    const track = document.querySelector('.ba-process-track');
    if (!track) return;

    let isVisible = false;

    function revealTrack() {
        if (!isVisible) {
            isVisible = true;
            track.classList.add('is-visible');
        }
    }

    function hideTrack() {
        if (isVisible) {
            isVisible = false;
            track.classList.remove('is-visible');
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealTrack();
            } else {
                const rect = track.getBoundingClientRect();
                const winH = window.innerHeight;
                if (rect.top > winH * 1.15 || rect.bottom < -winH * 0.15) {
                    hideTrack();
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    observer.observe(track);

    // Scroll listener fallback for instant, responsive triggering
    window.addEventListener('scroll', () => {
        const rect = track.getBoundingClientRect();
        const winH = window.innerHeight;
        const inView = rect.top < winH * 0.88 && rect.bottom > winH * 0.1;
        if (inView && !isVisible) {
            revealTrack();
        } else if (!inView && isVisible) {
            if (rect.top > winH * 1.25 || rect.bottom < -winH * 0.25) {
                hideTrack();
            }
        }
    }, { passive: true });
})();

// --- Our Future Section Scroll Animation ---
(function initOurFutureScrollAnimation() {
    const section = document.getElementById('ourFuture');
    if (!section) return;

    const cursiveWrap = document.getElementById('ofCursiveText');
    const typedSpan = cursiveWrap ? cursiveWrap.querySelector('.of-typed-text') : null;
    const targetText = cursiveWrap ? (cursiveWrap.getAttribute('data-text') || 'Our journey has just begun,') : '';

    let isSectionVisible = false;
    let typingTimer = null;
    let charIndex = 0;
    let hasTyped = false;

    function startTyping() {
        if (!cursiveWrap || hasTyped) return;
        hasTyped = true;
        charIndex = 0;
        if (typedSpan) typedSpan.textContent = '';
        cursiveWrap.classList.remove('writing-done');
        cursiveWrap.classList.add('is-writing');

        function typeNext() {
            if (charIndex < targetText.length) {
                if (typedSpan) typedSpan.textContent += targetText.charAt(charIndex);
                charIndex++;
                const delay = targetText.charAt(charIndex - 1) === ' ' ? 45 : (50 + Math.random() * 25);
                typingTimer = setTimeout(typeNext, delay);
            } else {
                cursiveWrap.classList.remove('is-writing');
                cursiveWrap.classList.add('writing-done');
            }
        }

        setTimeout(typeNext, 300);
    }

    function resetTyping() {
        if (!cursiveWrap) return;
        clearTimeout(typingTimer);
        charIndex = 0;
        hasTyped = false;
        if (typedSpan) typedSpan.textContent = '';
        cursiveWrap.classList.remove('is-writing', 'writing-done');
    }

    // Set initial text to empty so typewriter runs on entry
    if (typedSpan) typedSpan.textContent = '';

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealSection();
            } else {
                const rect = section.getBoundingClientRect();
                const winH = window.innerHeight;
                if (rect.top > winH * 1.2 || rect.bottom < -winH * 0.2) {
                    hideSection();
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    // Cache marker elements for glow-done scheduling
    const marker1 = section.querySelector('.of-marker-1');
    const marker2 = section.querySelector('.of-marker-2');
    let glowTimer1 = null;
    let glowTimer2 = null;

    function revealSection() {
        if (!isSectionVisible) {
            isSectionVisible = true;
            section.classList.add('is-visible');
            startTyping();

            // After initial ofPinGlow animation ends, switch to infinite pulse
            // Marker1: delay 0.75s + glow duration 1.8s = ~2.6s total
            glowTimer1 = setTimeout(() => {
                if (marker1) marker1.classList.add('of-glow-done');
            }, 2700);

            // Marker2: delay 1.45s + glow duration 1.8s = ~3.3s total
            glowTimer2 = setTimeout(() => {
                if (marker2) marker2.classList.add('of-glow-done');
            }, 3400);
        }
    }

    function hideSection() {
        if (isSectionVisible) {
            isSectionVisible = false;
            section.classList.remove('is-visible');
            resetTyping();
            clearTimeout(glowTimer1);
            clearTimeout(glowTimer2);
            if (marker1) marker1.classList.remove('of-glow-done');
            if (marker2) marker2.classList.remove('of-glow-done');
        }
    }

    observer.observe(section);

    window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        const winH = window.innerHeight;
        const inView = rect.top < winH * 0.85 && rect.bottom > winH * 0.15;
        if (inView && !isSectionVisible) {
            revealSection();
        } else if (!inView && isSectionVisible) {
            if (rect.top > winH * 1.25 || rect.bottom < -winH * 0.25) {
                hideSection();
            }
        }
    }, { passive: true });
})();

// --- Air Freight Cursive Quote Scroll Running Typewriter Animation ---
(function initAirFreightQuoteAnimation() {
    const quoteContainer = document.getElementById('afCursiveQuote');
    if (!quoteContainer) return;

    const spanLine1 = quoteContainer.querySelector('.af-typed-text-1');
    const spanLine2 = quoteContainer.querySelector('.af-typed-text-2');
    
    const text1 = quoteContainer.getAttribute('data-line1') || 'More Than Freight,';
    const text2 = quoteContainer.getAttribute('data-line2') || 'We Deliver Possibilities.';

    let isTyping = false;
    let hasCompleted = false;
    let timer1 = null;
    let timer2 = null;
    let pauseTimer = null;

    // Initially clear text so it types dynamically
    if (spanLine1) spanLine1.textContent = '';
    if (spanLine2) spanLine2.textContent = '';

    function startTypewriter() {
        if (isTyping || hasCompleted) return;
        isTyping = true;
        
        // Reset classes and content
        quoteContainer.classList.remove('writing-done', 'is-writing-line2');
        quoteContainer.classList.add('is-writing-line1');
        if (spanLine1) spanLine1.textContent = '';
        if (spanLine2) spanLine2.textContent = '';

        let i = 0;
        function typeLine1() {
            if (i < text1.length) {
                if (spanLine1) spanLine1.textContent += text1.charAt(i);
                i++;
                const delay = text1.charAt(i - 1) === ' ' ? 35 : (42 + Math.random() * 25);
                timer1 = setTimeout(typeLine1, delay);
            } else {
                // Line 1 finished -> brief pause before Line 2
                quoteContainer.classList.remove('is-writing-line1');
                quoteContainer.classList.add('is-writing-line2');
                
                pauseTimer = setTimeout(() => {
                    let j = 0;
                    function typeLine2() {
                        if (j < text2.length) {
                            if (spanLine2) spanLine2.textContent += text2.charAt(j);
                            j++;
                            const delay = text2.charAt(j - 1) === ' ' ? 35 : (40 + Math.random() * 22);
                            timer2 = setTimeout(typeLine2, delay);
                        } else {
                            // All typing finished
                            quoteContainer.classList.remove('is-writing-line2');
                            quoteContainer.classList.add('writing-done');
                            isTyping = false;
                            hasCompleted = true;
                        }
                    }
                    typeLine2();
                }, 180);
            }
        }

        // Slight initial start delay
        setTimeout(typeLine1, 200);
    }

    function resetTypewriter() {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(pauseTimer);
        isTyping = false;
        hasCompleted = false;
        quoteContainer.classList.remove('is-writing-line1', 'is-writing-line2', 'writing-done');
        if (spanLine1) spanLine1.textContent = '';
        if (spanLine2) spanLine2.textContent = '';
    }

    // Scroll & Intersection Trigger
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTypewriter();
            } else {
                const rect = quoteContainer.getBoundingClientRect();
                const winH = window.innerHeight;
                // If scrolled far away, reset so it re-runs when scrolled back
                if (rect.top > winH * 1.3 || rect.bottom < -winH * 0.3) {
                    resetTypewriter();
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -20px 0px'
    });

    observer.observe(quoteContainer);

    window.addEventListener('scroll', () => {
        const rect = quoteContainer.getBoundingClientRect();
        const winH = window.innerHeight;
        const inView = rect.top < winH * 0.9 && rect.bottom > winH * 0.1;
        
        if (inView && !isTyping && !hasCompleted) {
            startTypewriter();
        } else if (!inView && (rect.top > winH * 1.4 || rect.bottom < -winH * 0.4)) {
            if (hasCompleted || isTyping) {
                resetTypewriter();
            }
        }
    }, { passive: true });
})();

// ==========================================
// AIR FREIGHT: 5-STEP FLIGHT PROCESS ANIMATION
// ==========================================
(function initAirFreightProcessAnimation() {
    const processSection = document.querySelector('.af-process-section');
    const flowPlane = document.getElementById('afFlowPlane');
    const flowProgress = document.getElementById('afFlowProgress');
    const cards = document.querySelectorAll('.af-process-card');
    const arrows = document.querySelectorAll('.af-process-arrow');

    if (!processSection || !flowPlane || cards.length === 0) return;

    // Relative percentages across the 5 cards
    const stepPercentages = [8, 29, 50, 71, 92];
    let currentStep = 0;
    let sequenceTimer = null;
    let isRunning = false;

    function setStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= cards.length) return;

        const targetPct = stepPercentages[stepIndex];
        flowPlane.style.left = `${targetPct}%`;
        if (flowProgress) {
            flowProgress.style.width = `${targetPct}%`;
        }

        cards.forEach((card, idx) => {
            if (idx === stepIndex) {
                card.classList.add('is-active');
                card.classList.remove('is-passed');
            } else if (idx < stepIndex) {
                card.classList.remove('is-active');
                card.classList.add('is-passed');
            } else {
                card.classList.remove('is-active', 'is-passed');
            }
        });

        arrows.forEach((arrow, idx) => {
            if (idx < stepIndex) {
                arrow.classList.add('is-active');
            } else {
                arrow.classList.remove('is-active');
            }
        });
    }

    function runProcessSequence() {
        if (isRunning) return;
        isRunning = true;
        currentStep = 0;

        function nextStep() {
            setStep(currentStep);
            currentStep++;

            if (currentStep < cards.length) {
                sequenceTimer = setTimeout(nextStep, 1400); // 1.4s per card reveal
            } else {
                // All 5 steps completed - keep illuminated and loop smoothly
                sequenceTimer = setTimeout(() => {
                    cards.forEach(card => {
                        card.classList.add('is-active');
                        card.classList.remove('is-passed');
                    });
                    arrows.forEach(arr => arr.classList.add('is-active'));
                    if (flowProgress) flowProgress.style.width = '100%';
                    flowPlane.style.left = '96%';

                    // Smooth loop after pause
                    sequenceTimer = setTimeout(() => {
                        isRunning = false;
                        runProcessSequence();
                    }, 4200);
                }, 1400);
            }
        }

        nextStep();
    }

    function resetProcessSequence() {
        clearTimeout(sequenceTimer);
        isRunning = false;
        currentStep = 0;
        if (flowPlane) flowPlane.style.left = '0%';
        if (flowProgress) flowProgress.style.width = '0%';
        cards.forEach(card => card.classList.remove('is-active', 'is-passed'));
        arrows.forEach(arr => arr.classList.remove('is-active'));
    }

    // IntersectionObserver to start when user scrolls into process section
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                resetProcessSequence();
                setTimeout(runProcessSequence, 350);
            } else {
                resetProcessSequence();
            }
        });
    }, { threshold: 0.25 });

    observer.observe(processSection);

    // Interactive Hover: user can hover any card to guide the plane directly
    cards.forEach((card, idx) => {
        card.addEventListener('mouseenter', () => {
            clearTimeout(sequenceTimer);
            isRunning = true;
            setStep(idx);
        });
    });
})();

// ==========================================
// NAVBAR SERVICES DROPDOWN CLICK-TO-LOCK HANDLER
// ==========================================
(function initNavbarDropdownToggle() {
    function setupDropdowns() {
        const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

        dropdownItems.forEach(dropdown => {
            const toggleBtn = dropdown.querySelector('.nav-link');
            const megaMenu = dropdown.querySelector('.mega-menu');

            if (!toggleBtn || !megaMenu) return;

            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = dropdown.classList.contains('is-open') || dropdown.classList.contains('show');

                // Close all other open dropdowns first
                dropdownItems.forEach(d => {
                    d.classList.remove('is-open', 'show');
                });

                if (!isOpen) {
                    dropdown.classList.add('is-open', 'show');
                }
            });

            // Prevent clicks inside mega menu from closing it (unless clicking an actual nav link)
            megaMenu.addEventListener('click', (e) => {
                if (e.target.closest('a')) {
                    dropdown.classList.remove('is-open', 'show');
                    return;
                }
                e.stopPropagation();
            });
        });

        // Close dropdown when clicking anywhere outside
        document.addEventListener('click', () => {
            dropdownItems.forEach(d => d.classList.remove('is-open', 'show'));
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdownItems.forEach(d => d.classList.remove('is-open', 'show'));
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupDropdowns);
    } else {
        setupDropdowns();
    }
})();

// ==========================================
// MOBILE DRAWER NAVIGATION CONTROLLER
// ==========================================
(function initMobileDrawer() {
    function setupMobileNav() {
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const drawer = document.getElementById('mobileDrawer');
        const overlay = document.getElementById('mobileDrawerOverlay');
        const closeBtn = document.getElementById('mobileDrawerClose');
        const accordionToggle = document.querySelector('.mobile-nav-accordion-toggle');
        const accordion = document.querySelector('.mobile-nav-accordion');
        
        if (!drawer || !overlay) return;

        function openDrawer() {
            document.body.classList.add('mobile-drawer-open');
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            overlay.classList.add('is-active');
            if (toggleBtn) {
                toggleBtn.classList.add('is-active');
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        }

        function closeDrawer() {
            document.body.classList.remove('mobile-drawer-open');
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            overlay.classList.remove('is-active');
            if (toggleBtn) {
                toggleBtn.classList.remove('is-active');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (drawer.classList.contains('is-open')) {
                    closeDrawer();
                } else {
                    openDrawer();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeDrawer();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', closeDrawer);
        }

        // Close when pressing Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
                closeDrawer();
            }
        });

        // Close drawer when clicking any nav link / CTA button (smooth transition to page or anchor)
        const links = drawer.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                // Short timeout to allow click to trigger before closing animation
                setTimeout(closeDrawer, 120);
            });
        });

        // Accordion Toggle for Services submenu
        if (accordionToggle && accordion) {
            accordionToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = accordion.classList.contains('is-open');
                if (isOpen) {
                    accordion.classList.remove('is-open');
                    accordionToggle.setAttribute('aria-expanded', 'false');
                } else {
                    accordion.classList.add('is-open');
                    accordionToggle.setAttribute('aria-expanded', 'true');
                }
            });
        }

        // Close drawer if window is resized past 992px breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && drawer.classList.contains('is-open')) {
                closeDrawer();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMobileNav);
    } else {
        setupMobileNav();
    }
})();



