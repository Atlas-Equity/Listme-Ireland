import { redirect } from 'next/navigation';

export default function FavouriteSellersPage() {
  redirect('/my-listme?tab=favourite-sellers');
}

