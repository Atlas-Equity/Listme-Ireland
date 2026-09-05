import { redirect } from 'next/navigation';

export default function WatchlistPage() {
  redirect('/my-listme?tab=watchlist');
}
