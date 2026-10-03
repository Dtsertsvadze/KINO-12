import {
  getComingSoonMovies,
  getFeaturedMovies,
  getNowPlayingMovies,
} from "@/features/movies/api";
import { ComingSoonCarousel } from "@/features/movies/components/coming-soon-carousel";
import { FeaturedHero } from "@/features/movies/components/featured-hero";
import { MovieCarousel } from "@/features/movies/components/movie-carousel";

export default async function Home() {
  const [featuredMovies, nowPlayingMovies, comingSoonMovies] = await Promise.all([
    getFeaturedMovies().catch(() => []),
    getNowPlayingMovies().catch(() => []),
    getComingSoonMovies().catch(() => []),
  ]);

  return (
    <main className="min-h-[1080px] bg-page">
      <FeaturedHero movies={featuredMovies} />
      <MovieCarousel title="Now Playing" movies={nowPlayingMovies} />
      <ComingSoonCarousel movies={comingSoonMovies} />
    </main>
  );
}
