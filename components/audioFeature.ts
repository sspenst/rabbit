export enum AudioFeatureState {
  NONE,
  UP,
  DOWN,
}

export interface AudioFeature {
  property: string;
  state: AudioFeatureState;
}

export const audioFeatureDescriptions: Record<string, string> = {
  danceability: 'How suitable a track is for dancing.',
  energy: 'Perceptual measure of intensity and activity.',
  instrumentalness: 'Confidence a track contains no vocals.',
  loudness: 'Overall loudness of a track in decibels.',
  tempo: 'Overall estimated tempo of a track in beats per minute.',
  valence: 'Musical positiveness conveyed by a track.',
};
