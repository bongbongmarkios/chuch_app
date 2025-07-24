import AppHeader from '@/components/layout/AppHeader';

export const metadata = {
  title: 'Suggestions | SBC App',
};

export default function SuggestionsPage() {
  return (
    <>
      <AppHeader title="AI Suggestions" />
      <div className="container mx-auto px-4 pb-8 text-center text-muted-foreground">
        <p>AI suggestions are unavailable in the offline APK version.</p>
      </div>
    </>
  );
}
