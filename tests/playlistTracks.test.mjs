import assert from 'node:assert/strict';
import test from 'node:test';
import { playlistTracks } from '../helpers/playlistTracks.ts';

test('playlist entries keep usable tracks in order and skip episodes, local files, and missing tracks', () => {
  const first = { id: 'first', is_local: false, type: 'track' };
  const second = { id: 'second', type: 'track' };
  const entries = [
    { is_local: false, item: first },
    { is_local: false, item: null },
    { is_local: false, item: { id: 'episode', type: 'episode' } },
    { is_local: true, item: { id: 'local', type: 'track' } },
    { is_local: false, item: { id: 'local-track', is_local: true, type: 'track' } },
    { is_local: false, item: { id: '', type: 'track' } },
    { is_local: false, item: second },
  ];

  assert.deepEqual(playlistTracks(entries), [first, second]);
  assert.deepEqual(playlistTracks([]), []);
});
