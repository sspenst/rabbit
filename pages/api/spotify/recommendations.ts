import { AudioFeatures, RecommendationsRequest, Track } from '@sspenst/spotify-web-api';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EnrichedTrackData, enrichPublicTracks } from '../../../helpers/enrichTrack';
import { getSpotifyServerApi } from '../../../helpers/spotifyServer';

const audioFeatureProperties = [
  'tempo',
  'loudness',
  'danceability',
  'energy',
  'instrumentalness',
  'valence',
] as const;

interface RecommendationsResponse {
  tracks: EnrichedTrackData[];
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<RecommendationsResponse | ErrorResponse>,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method not allowed' });

    return;
  }

  const id = typeof request.query.id === 'string' ? request.query.id : '';

  if (!/^[A-Za-z0-9]{22}$/.test(id)) {
    response.status(400).json({ error: 'Invalid Spotify track.' });

    return;
  }

  try {
    const spotifyApi = getSpotifyServerApi();
    const track = await spotifyApi.tracks.get(id);

    if (!track) throw new Error('Spotify returned no seed track.');

    const features = await spotifyApi.tracks.audioFeatures(id);
    const featureParams: Record<string, number> = {};

    audioFeatureProperties.forEach(property => {
      if (!features) return;

      const value = features[property as keyof AudioFeatures] as number;
      const direction = request.query[property];

      if (direction === 'up') {
        featureParams[`min_${property}`] = value;
      } else if (direction === 'down') {
        featureParams[`max_${property}`] = value;
      } else {
        featureParams[`target_${property}`] = value;
      }
    });

    const recommendations = await spotifyApi.recommendations.get({
      limit: 49,
      seed_artists: track.artists.map(artist => artist.id).slice(0, 4),
      seed_tracks: [track.id],
      ...featureParams,
    } as RecommendationsRequest);

    if (!recommendations) throw new Error('Spotify returned no recommendations response.');

    const recommendedTracks = recommendations.tracks.filter(recommendation => recommendation.id !== track.id) as Track[];

    recommendedTracks.unshift(track);

    response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
    response.status(200).json({
      tracks: await enrichPublicTracks(recommendedTracks, spotifyApi),
    });
  } catch (error) {
    console.error('Anonymous Spotify recommendations failed', error);
    response.status(502).json({ error: 'Spotify recommendations are temporarily unavailable.' });
  }
}
