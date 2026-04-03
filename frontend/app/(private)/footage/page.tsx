import React from 'react';
import { ImageGenerator } from '../../../components/ImageGenerator/ImageGenerator';

export const metadata = {
  title: 'Image Generator | Story Maker',
  description: 'Generate images for your stories without loading the database.',
};

export default function ImagePage() {
  return (
    <main>
      <ImageGenerator />
    </main>
  );
}
