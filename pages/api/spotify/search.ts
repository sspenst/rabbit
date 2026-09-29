import { Track } from '@sspenst/spotify-web-api';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EnrichedTrackData, enrichPublicTracks } from '../../../helpers/enrichTrack';
import { getSpotifyServerApi } from '../../../helpers/spotifyServer';

interface SearchResponse {
  hasMore: boolean;
  tracks: EnrichedTrackData[];
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<SearchResponse | ErrorResponse>,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method not allowed' });

    return;
  }

  const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
  const requestedOffset = typeof request.query.offset === 'string' ? Number.parseInt(request.query.offset, 10) : 0;
  const offset = Number.isFinite(requestedOffset) ? Math.max(0, requestedOffset) : 0;

  if (!query || query.length > 200) {
    response.status(400).json({ error: 'Enter a search query of 200 characters or fewer.' });

    return;
  }

  try {
    const spotifyApi = getSpotifyServerApi();
    const results = await spotifyApi.search(query, ['track'], undefined, 10, offset);
    const tracks = await enrichPublicTracks(results.tracks.items as Track[], spotifyApi);

    response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.status(200).json({
      hasMore: results.tracks.next !== null,
      tracks,
    });
  } catch (error) {
    console.error('Anonymous Spotify search failed', error);
    response.status(502).json({ error: 'Spotify search is temporarily unavailable.' });
  }
}
