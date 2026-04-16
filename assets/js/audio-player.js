/**
 * Yasso Website Audio Player - User Side
 * - Cross-page continuity: saves position + playing state in sessionStorage
 * - First-visit popup asking user whether to play music
 * - Player always visible so user can play manually at any time
 */
(function () {
  'use strict';

  var DB_NAME    = 'yassoAudioDB';
  var STORE      = 'audio';
  var AUDIO_KEY  = 'siteAudio';

  // localStorage keys
  var KEY_CHOICE = 'yassoAudio_userChoice';    // 'yes' | 'no'
  // sessionStorage keys (cleared when browser session ends)
  var KEY_POS    = 'yassoAudio_position';      // float string
  var KEY_PLAY   = 'yassoAudio_wasPlaying';    // 'true' | 'false'

  /* ---------- IndexedDB helpers ---------- */

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        e.target.result.createObjectStore(STORE);
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror   = function (e) { reject(e.target.error); };
    });
  }

  function getAudioData() {
    return openDB().then(function (db) {
      return new Promise(function (resolve) {
        var req = db.transaction(STORE, 'readonly')
                    .objectStore(STORE)
                    .get(AUDIO_KEY);
        req.onsuccess = function (e) { resolve(e.target.result || null); };
        req.onerror   = function ()  { resolve(null); };
      });
    }).catch(function () { return null; });
  }

  /* ---------- Admin settings ---------- */

  function getSettings() {
    return {
      loop:   localStorage.getItem('yassoAudio_loop')   === 'true',
      active: localStorage.getItem('yassoAudio_active') !== 'false'
    };
  }

  /* ---------- Playback state persistence ---------- */

  function saveState(audioEl) {
    try {
      sessionStorage.setItem(KEY_POS,  String(audioEl.currentTime));
      sessionStorage.setItem(KEY_PLAY, String(!audioEl.paused));
    } catch (e) { /* quota exceeded – ignore */ }
  }

  function getSavedPosition() {
    var v = parseFloat(sessionStorage.getItem(KEY_POS));
    return isNaN(v) ? 0 : v;
  }

  function wasPreviouslyPlaying() {
    return sessionStorage.getItem(KEY_PLAY) === 'true';
  }

  /* ---------- Wave bars ---------- */

  function buildWaveBars(container, count) {
    for (var i = 0; i < count; i++) {
      var bar = document.createElement('span');
      bar.className = 'wave-bar';
      container.appendChild(bar);
    }
  }

  function setPlayingState(icon, waveEl, playing) {
    icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
    waveEl.classList.toggle('playing', playing);
  }

  /* sync both desktop + mobile playing states together */
  function syncAllPlayingState(playing) {
    var desktopIcon = document.getElementById('audioToggleIcon');
    var desktopWave = document.getElementById('waveContainer');
    var mobileIcon  = document.getElementById('mobileAudioToggleIcon');
    var mobileWave  = document.getElementById('mobileWaveContainer');
    if (desktopIcon && desktopWave) setPlayingState(desktopIcon, desktopWave, playing);
    if (mobileIcon  && mobileWave)  setPlayingState(mobileIcon,  mobileWave,  playing);
  }

  /* ---------- Preference Popup ---------- */

  function injectPopup() {
    if (document.getElementById('audioPreferenceOverlay')) return;
    var html = [
      '<div id="audioPreferenceOverlay" class="audio-pref-overlay" role="dialog" aria-modal="true" aria-label="Music preference">',
      '  <div class="audio-pref-card">',
      '    <div class="audio-pref-icon-wrap"><i class="fas fa-music"></i></div>',
      '    <h3 class="audio-pref-title">Music While Shopping?</h3>',
      '    <p class="audio-pref-desc">We have background music ready. Would you like it to play while you browse?</p>',
      '    <div class="audio-pref-btns">',
      '      <button id="audioPrefYes" class="audio-pref-yes"><i class="fas fa-play"></i> Yes, play music</button>',
      '      <button id="audioPrefNo"  class="audio-pref-no">No thanks</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    document.body.appendChild(tmp.firstChild);
  }

  function showPopup(audioEl, onYes, onNo) {
    injectPopup();
    var overlay = document.getElementById('audioPreferenceOverlay');
    // Animate in
    overlay.style.display = 'flex';
    requestAnimationFrame(function () { overlay.classList.add('visible'); });

    function close() { overlay.classList.remove('visible'); setTimeout(function () { overlay.style.display = 'none'; }, 350); }

    document.getElementById('audioPrefYes').addEventListener('click', function () {
      localStorage.setItem(KEY_CHOICE, 'yes');
      close();
      onYes();
    });
    document.getElementById('audioPrefNo').addEventListener('click', function () {
      localStorage.setItem(KEY_CHOICE, 'no');
      close();
      if (onNo) onNo();
    });
  }

  /* ---------- Mobile language buttons ---------- */

  function initMobileLang() {
    var mobileEn = document.querySelector('.mobile-lang-switcher .lang-btn-en');
    var mobileAr = document.querySelector('.mobile-lang-switcher .lang-btn-ar');
    var desktopEn = document.querySelector('.lang-btn-en:not(.mobile-lang-switcher .lang-btn-en)');
    var desktopAr = document.querySelector('.lang-btn-ar:not(.mobile-lang-switcher .lang-btn-ar)');

    if (!mobileEn || !mobileAr) return;

    // Sync initial active state from desktop buttons
    function syncActiveFromDesktop() {
      if (desktopEn && desktopEn.classList.contains('active')) {
        mobileEn.classList.add('active');
        mobileAr.classList.remove('active');
      } else if (desktopAr && desktopAr.classList.contains('active')) {
        mobileAr.classList.add('active');
        mobileEn.classList.remove('active');
      }
    }
    syncActiveFromDesktop();

    // Mobile EN click → trigger desktop EN
    mobileEn.addEventListener('click', function () {
      mobileEn.classList.add('active');
      mobileAr.classList.remove('active');
      if (desktopEn) desktopEn.click();
    });

    // Mobile AR click → trigger desktop AR
    mobileAr.addEventListener('click', function () {
      mobileAr.classList.add('active');
      mobileEn.classList.remove('active');
      if (desktopAr) desktopAr.click();
    });

    // Keep mobile in sync if desktop buttons are clicked
    if (desktopEn) desktopEn.addEventListener('click', function () {
      mobileEn.classList.add('active');
      mobileAr.classList.remove('active');
    });
    if (desktopAr) desktopAr.addEventListener('click', function () {
      mobileAr.classList.add('active');
      mobileEn.classList.remove('active');
    });
  }

  /* ---------- Main init ---------- */

  function init() {
    var player    = document.getElementById('headerAudioPlayer');
    var audioEl   = document.getElementById('siteAudio');
    var toggleBtn = document.getElementById('audioToggleBtn');
    var icon      = document.getElementById('audioToggleIcon');
    var waveEl    = document.getElementById('waveContainer');

    // Mobile refs
    var mobileWrap      = document.getElementById('mobileAudioWrap');
    var mobileToggleBtn = document.getElementById('mobileAudioToggleBtn');
    var mobileIcon      = document.getElementById('mobileAudioToggleIcon');
    var mobileWave      = document.getElementById('mobileWaveContainer');

    if (!player || !audioEl || !toggleBtn || !icon || !waveEl) return;

    buildWaveBars(waveEl, 30);

    // Build mobile wave bars (fewer for compact layout)
    if (mobileWave) buildWaveBars(mobileWave, 20);

    // Init mobile lang buttons
    initMobileLang();

    var settings = getSettings();
    if (!settings.active) return;

    getAudioData().then(function (data) {
      if (!data || !data.blob) return;

      var blobUrl   = URL.createObjectURL(data.blob);
      audioEl.src   = blobUrl;
      audioEl.loop  = settings.loop;

      // Reveal both desktop and mobile players
      player.style.display = 'flex';
      if (mobileWrap) mobileWrap.style.display = 'flex';

      // Sync both waveforms with audio state
      audioEl.addEventListener('play',  function () { syncAllPlayingState(true);  saveState(audioEl); });
      audioEl.addEventListener('pause', function () { syncAllPlayingState(false); saveState(audioEl); });
      audioEl.addEventListener('ended', function () { syncAllPlayingState(false); });

      // Persist position every second while playing + on navigation
      setInterval(function () { if (!audioEl.paused) saveState(audioEl); }, 1000);
      window.addEventListener('beforeunload', function () { saveState(audioEl); });
      window.addEventListener('pagehide',     function () { saveState(audioEl); });

      // Desktop toggle
      toggleBtn.addEventListener('click', function () {
        if (audioEl.paused) {
          if (!localStorage.getItem(KEY_CHOICE)) localStorage.setItem(KEY_CHOICE, 'yes');
          audioEl.play().catch(function (err) { console.warn('Yasso audio:', err); });
        } else {
          audioEl.pause();
        }
      });

      // Mobile toggle (controls the same audio element)
      if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', function () {
          if (audioEl.paused) {
            if (!localStorage.getItem(KEY_CHOICE)) localStorage.setItem(KEY_CHOICE, 'yes');
            audioEl.play().catch(function (err) { console.warn('Yasso audio:', err); });
          } else {
            audioEl.pause();
          }
        });
      }

      // --- Restore position from previous page ---
      var savedPos   = getSavedPosition();
      var wasPlaying = wasPreviouslyPlaying();
      var userChoice = localStorage.getItem(KEY_CHOICE);

      function restoreAndPlay(shouldPlay) {
        if (savedPos > 0) {
          var sought = false;
          audioEl.addEventListener('canplay', function seekOnce() {
            if (sought) return;
            sought = true;
            audioEl.removeEventListener('canplay', seekOnce);
            audioEl.currentTime = savedPos;
            if (shouldPlay) audioEl.play().catch(function () {});
          });
        } else if (shouldPlay) {
          audioEl.play().catch(function () {});
        }
      }

      if (userChoice === null) {
        // First ever visit → show popup
        restoreAndPlay(false);
        audioEl.addEventListener('canplay', function firstVisit() {
          audioEl.removeEventListener('canplay', firstVisit);
          showPopup(
            audioEl,
            function onYes() { audioEl.play().catch(function () {}); },
            null
          );
        }, { once: true });

      } else if (userChoice === 'yes' && wasPlaying) {
        restoreAndPlay(true);

      } else {
        restoreAndPlay(false);
      }
    });
  }

  /* ---------- Bootstrap ---------- */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
