/**
 * Winds & Echoes Ghost Theme — audio-player.js v2
 * Reads JSON metadata from post codeinjection_head and renders player.
 */
(function () {
  'use strict';

  const metaEl = document.getElementById('wae-audio');
  if (!metaEl) return;

  let meta;
  try { meta = JSON.parse(metaEl.textContent); } catch (e) { return; }

  const recordings = meta.recordings || [];
  if (!recordings.length) return;

  const playerEl      = document.getElementById('wae-audio-player');
  const tabsEl        = document.getElementById('wae-audio-tabs');
  const playBtn       = document.getElementById('wae-play-btn');
  const iconPlay      = playBtn.querySelector('.wae-icon-play');
  const iconPause     = playBtn.querySelector('.wae-icon-pause');
  const progressBar   = document.getElementById('wae-progress-bar');
  const progressFill  = document.getElementById('wae-progress-fill');
  const progressThumb = document.getElementById('wae-progress-thumb');
  const timeCurrent   = document.getElementById('wae-time-current');
  const timeTotal     = document.getElementById('wae-time-total');
  const trackLabel    = document.getElementById('wae-track-label');
  const speedBtn      = document.getElementById('wae-speed-btn');
  const downloadBtn   = document.getElementById('wae-download-btn');

  if (meta.audioFirst) document.querySelector('.gh-article')?.classList.add('audio-first');

  let audio        = new Audio();
  let currentIndex = 0;
  const speeds     = [1, 1.25, 1.5, 2];
  let speedIndex   = 0;

  function fmt(s) {
    if (isNaN(s)) return '0:00';
    return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  }

  function loadRecording(index) {
    currentIndex = index;
    const rec = recordings[index];
    audio.src = rec.url;
    audio.load();
    trackLabel.textContent       = rec.label || '';
    downloadBtn.href             = rec.url;
    downloadBtn.download         = rec.label || `recording-${index+1}`;
    progressFill.style.width     = '0%';
    progressThumb.style.left     = '0%';
    timeCurrent.textContent      = '0:00';
    timeTotal.textContent        = fmt(rec.duration || 0);
    document.querySelectorAll('.wae-audio-tab').forEach((t,i) => t.classList.toggle('active', i===index));
  }

  function setPlayState(playing) {
    iconPlay.style.display  = playing ? 'none' : '';
    iconPause.style.display = playing ? ''     : 'none';
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  audio.addEventListener('play',         () => setPlayState(true));
  audio.addEventListener('pause',        () => setPlayState(false));
  audio.addEventListener('ended',        () => { setPlayState(false); progressFill.style.width='0%'; timeCurrent.textContent='0:00'; });
  audio.addEventListener('timeupdate',   () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${pct}%`;
    progressThumb.style.left = `${pct}%`;
    timeCurrent.textContent  = fmt(audio.currentTime);
    progressBar.setAttribute('aria-valuenow', Math.round(pct));
  });
  audio.addEventListener('loadedmetadata', () => { timeTotal.textContent = fmt(audio.duration); });

  playBtn.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());

  function seek(e) {
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * audio.duration;
  }

  progressBar.addEventListener('click', seek);
  progressBar.addEventListener('mousedown', (e) => {
    seek(e);
    const mv = (e) => seek(e);
    document.addEventListener('mousemove', mv);
    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', mv), { once: true });
  });

  speedBtn.addEventListener('click', () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    audio.playbackRate    = speeds[speedIndex];
    speedBtn.textContent  = `${speeds[speedIndex]}×`;
  });

  if (recordings.length > 1) {
    recordings.forEach((rec, i) => {
      const tab = document.createElement('button');
      tab.className   = `wae-audio-tab${i===0?' active':''}`;
      tab.textContent = rec.label || rec.mode || `Track ${i+1}`;
      tab.addEventListener('click', () => { audio.pause(); setPlayState(false); loadRecording(i); });
      tabsEl.appendChild(tab);
    });
  }

  loadRecording(0);
  playerEl.style.display = 'block';
})();
