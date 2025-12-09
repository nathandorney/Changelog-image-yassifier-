import ImageEditor from './components/ImageEditor';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="container mx-auto py-8">
        <ImageEditor />
      </main>
    </div>
  );
}
