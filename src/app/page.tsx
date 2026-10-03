import { getFeaturedMovies } from "@/features/movies/api";
import { FeaturedHero } from "@/features/movies/components/featured-hero";

export default async function Home() {
  const movies = await getFeaturedMovies().catch(() => []);

  return (
    <main className="min-h-[1080px] bg-page">
      <FeaturedHero movies={movies} />
    </main>
  );
}
