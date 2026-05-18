/**
 * Winds & Echoes Ghost Theme — audio-player.js
 *
 * Reads audio metadata from the post's codeinjection_head JSON block,
 * renders the player UI, and handles playback.
 *
 * Expected JSON block in Ghost post codeinjection_head:
 * <script type="application/json" id="wae-audio">
 * {
 *   "recordings": [
 *     { "mode": "narration", "label": "Listen to this post", "url": "...", "duration": 420 },
 *     { "mode": "ambient",   "label": "Summit ridge wind",   "url": "...", "duration": 180 }
 *   ],
 *   "audioFirst": false
 * }
 * </script>
 */

(function () {
  'use strict';

  // ── Read audio metadata ────────────────────────────────────────────────

  const metaEl = document.getElementById('wae-audio');
  if (!metaEl) return; // no audio on this post

  let meta;
  try {
    meta = JSON.parse(metaEl.textContent);
  } catch (e) {
    console.warn('[wae-audio] Failed to parse audio metadata:', e);
    return;
  }

  const recordings = meta.recordings || [];
  if (!recordings.length) return;

  // ── DOM refs ───────────────────────────────────────────────────────────

  const playerEl   = document.getElementById('wae-audio-player');
  const tabsEl     = document.getElementById('wae-audio-tabs');
  const playBtn    = document.getElementById('wae-play-btn');
  const iconPlay   = playBtn.querySelector('.wae-icon-play');
  const iconPause  = playBtn.querySelector('.wae-icon-pause');
  const progressBar   = document.getElementById('wae-progress-bar');
  const progressFill  = document.getElementById('wae-progress-fill');
  const progressThumb = document.getElementById('wae-progress-thumb');
  const timeCurrent   = document.getElementById('wae-time-current');
  const timeTotal     = document.getElementById('wae-time-total');
  const trackLabel    = document.getElementById('wae-track-label');
  const speedBtn      = document.getElementById('wae-speed-btn');
  const downloadBtn   = document.getElementById('wae-download-btn');

  // ── Apply audio-first class ────────────────────────────────────────────

  if (meta.audioFirst) {
    document.querySelector('.gh-article')?.classList.add('audio-first');
  }

  // ── State ──────────────────────────────────────────────────────────────

  let audio          = new Audio();
  let currentIndex   = 0;
  const speeds       = [1, 1.25, 1.5, 2];
  let speedIndex     = 0;

  // ── Helpers ────────────────────────────────────────────────────────────

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function loadRecording(index) {
    currentIndex = index;
    const rec = recordings[index];
    audio.src = rec.url;
    audio.load();
    trackLabel.textContent  = rec.label || '';
    downloadBtn.href        = rec.url;
    downloadBtn.download    = rec.label || `recording-${index + 1}`;
    progressFill.style.width  = '0%';
    progressThumb.style.left  = '0%';
    timeCurrent.textContent   = '0:00';
    timeTotal.textContent     = formatTime(rec.duration || 0);

    // Update active tab
    document.querySelectorAll('.wae-audio-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  function updateProgress() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width  = `${pct}%`;
    progressThumb.style.left  = `${pct}%`;
    timeCurrent.textContent   = formatTime(audio.currentTime);
    progressBar.setAttribute('aria-valuenow', Math.round(pct));
  }

  function seek(e) {
    const rect = progressBar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  }

  // ── Build tabs ─────────────────────────────────────────────────────────

  if (recordings.length > 1) {
    recordings.forEach((rec, i) => {
      const tab = document.createElement('button');
      tab.className   = `wae-audio-tab${i === 0 ? ' active' : ''}`;
      tab.textContent = rec.label || rec.mode || `Track ${i + 1}`;
      tab.addEventListener('click', () => {
        audio.pause();
        setPlayState(false);
        loadRecording(i);
      });
      tabsEl.appendChild(tab);
    });
  }

  // ── Audio event listeners ──────────────────────────────────────────────

  function setPlayState(playing) {
    iconPlay.style.display  = playing ? 'none'  : '';
    iconPause.style.display = playing ? ''      : 'none';
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  audio.addEventListener('play',      () => setPlayState(true));
  audio.addEventListener('pause',     () => setPlayState(false));
  audio.addEventListener('ended',     () => { setPlayState(false); progressFill.style.width = '0%'; timeCurrent.textContent = '0:00'; });
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', () => { timeTotal.textContent = formatTime(audio.duration); });

  // ── UI event listeners ─────────────────────────────────────────────────

  playBtn.addEventListener('click', togglePlay);

  progressBar.addEventListener('click', seek);
  progressBar.addEventListener('mousedown', (e) => {
    seek(e);
    const onMove = (e) => seek(e);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', onMove), { once: true });
  });

  speedBtn.addEventListener('click', () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    audio.playbackRate = speeds[speedIndex];
    speedBtn.textContent = `${speeds[speedIndex]}×`;
  });

  // ── Keyboard shortcuts ─────────────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space' && playerEl.contains(document.activeElement)) {
      e.preventDefault();
      togglePlay();
    }
    if (e.code === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    if (e.code === 'ArrowLeft')  audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  // ── Initialise ─────────────────────────────────────────────────────────

  loadRecording(0);
  playerEl.style.display = 'block';

})();
