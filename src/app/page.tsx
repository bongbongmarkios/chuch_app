import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/hymnal');
  // Return null or a loading component if preferred, but redirect handles it.
  return null;
}
