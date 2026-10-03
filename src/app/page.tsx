import {
  getFeaturedMovies,
  getNowPlayingMovies,
} from "@/features/movies/api";
import { FeaturedHero } from "@/features/movies/components/featured-hero";
import { MovieCarousel } from "@/features/movies/components/movie-carousel";

export default async function Home() {
  const [featuredMovies, nowPlayingMovies] = await Promise.all([
    getFeaturedMovies().catch(() => []),
    getNowPlayingMovies().catch(() => []),
  ]);

  return (
    <main className="min-h-[1080px] bg-page">
      <FeaturedHero movies={featuredMovies} />
      <MovieCarousel title="Now Playing" movies={nowPlayingMovies} />
    </main>
  );
}
