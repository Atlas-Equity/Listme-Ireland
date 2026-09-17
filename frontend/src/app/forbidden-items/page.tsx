import React from 'react';
import { Metadata } from 'next';
import ForbiddenItemsClient from './ForbiddenItemsClient';

export const metadata: Metadata = {
  title: 'Forbidden Items Policy | Listme.ie',
  description: 'Complete guide to prohibited and restricted items on Listme.ie. Check tickets, weapons, pharmaceuticals, vehicles, wildlife, media, and other restricted listings.',
};

export default function ForbiddenItemsPage() {
  return <ForbiddenItemsClient />;
}
