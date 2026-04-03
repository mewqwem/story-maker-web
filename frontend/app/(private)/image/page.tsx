import React from 'react';
import { DetailedImageGenerator } from '../../../components/DetailedImageGenerator/DetailedImageGenerator';

export const metadata = {
  title: 'Image Generation | Story Maker',
  description: 'Generate detailed images using custom prompts and settings.',
};

export default function DetailedImagePage() {
  return (
    <main>
      <DetailedImageGenerator />
    </main>
  );
}
