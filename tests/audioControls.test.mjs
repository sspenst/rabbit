import assert from 'node:assert/strict';
import test from 'node:test';
import { pauseTrack, playTrack } from '../helpers/audioControls.ts';
import { hydrateRecommendations } from '../helpers/enrichTrack.ts';

class FakeAudio {
  constructor(url) {
    this.url = url;
    this.paused = true;
    this.pauseCount = 0;
  }

  play() {
    this.paused = false;

    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.pauseCount += 1;
  }
}

globalThis.Audio = FakeAudio;
globalThis.MediaMetadata = class {
  constructor(data) {
    Object.assign(this, data);
  }
};
Object.defineProperty(navigator, 'mediaSession', {
  configurable: true,
  value: { setActionHandler() { return; } },
});

function track(id, audio) {
  return {
    album: { images: [] },
    artists: [{ name: 'Artist' }],
    audioFeatures: null,
    id,
    name: id,
    preview: audio,
    preview_url: audio?.url ?? null,
    saved: false,
  };
}

function stateSetter() {
  let current;

  return {
    get current() { return current; },
    set(value) { current = typeof value === 'function' ? value(current) : value; },
  };
}

test('recommendations reuse the playing seed audio', () => {
  const seed = track('seed', new FakeAudio('seed-preview'));
  const related = track('related', null);
  const results = hydrateRecommendations([seed, related], seed);

  assert.equal(results[0], seed);
  assert.equal(results[0].preview, seed.preview);
  assert.equal(results[1].id, 'related');
});

test('playing a related track pauses the seed preview', async () => {
  const state = stateSetter();
  const seed = track('seed', new FakeAudio('seed-preview'));
  const related = track('related', new FakeAudio('related-preview'));

  playTrack(seed, state.set);
  await Promise.resolve();

  const results = hydrateRecommendations([seed, related], state.current);

  playTrack(results[1], state.set, results[0]);
  await Promise.resolve();

  assert.equal(seed.preview.paused, true);
  assert.equal(related.preview.paused, false);
  assert.equal(state.current.id, 'related');

  pauseTrack(related, state.set);
});

test('a late play completion cannot restore an older track', async () => {
  const state = stateSetter();
  const first = track('first', new FakeAudio('first-preview'));
  const second = track('second', new FakeAudio('second-preview'));
  let finishFirstPlay;

  first.preview.play = () => {
    first.preview.paused = false;

    return new Promise(resolve => { finishFirstPlay = resolve; });
  };

  playTrack(first, state.set);
  playTrack(second, state.set, first);
  await Promise.resolve();
  finishFirstPlay();
  await Promise.resolve();

  assert.equal(first.preview.paused, true);
  assert.equal(second.preview.paused, false);
  assert.equal(state.current.id, 'second');

  pauseTrack(second, state.set);
});

test('a late completion does not pause a replay of the same audio', async () => {
  const state = stateSetter();
  const selected = track('selected', new FakeAudio('selected-preview'));
  let finishFirstPlay;
  let playCount = 0;

  selected.preview.play = () => {
    selected.preview.paused = false;
    playCount += 1;

    return playCount === 1 ?
      new Promise(resolve => { finishFirstPlay = resolve; }) :
      Promise.resolve();
  };

  playTrack(selected, state.set);
  pauseTrack(selected, state.set);
  playTrack(selected, state.set, selected);
  await Promise.resolve();
  finishFirstPlay();
  await Promise.resolve();

  assert.equal(selected.preview.paused, false);
  assert.equal(state.current.id, 'selected');

  pauseTrack(selected, state.set);
});
