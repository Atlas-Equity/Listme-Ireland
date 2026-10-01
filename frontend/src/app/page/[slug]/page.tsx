import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | ListMe Ireland',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BusinessPublicPage() {
  notFound();
}
