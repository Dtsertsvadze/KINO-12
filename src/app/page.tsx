import {
  getComingSoonMovies,
  getFeaturedMovies,
  getNowPlayingMovies,
} from "@/features/movies/api";
import { ComingSoonCarousel } from "@/features/movies/components/coming-soon-carousel";
import { FeaturedHero } from "@/features/movies/components/featured-hero";
import { MovieCarousel } from "@/features/movies/components/movie-carousel";

export default async function Home() {
  const [featuredResult, nowPlayingResult, comingSoonResult] =
    await Promise.allSettled([
      getFeaturedMovies(),
      getNowPlayingMovies(),
      getComingSoonMovies(),
    ]);

  const featuredMovies =
    featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const nowPlayingMovies =
    nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : [];
  const comingSoonMovies =
    comingSoonResult.status === "fulfilled" ? comingSoonResult.value : [];

  return (
    <main className="min-h-[1080px] bg-page">
      <FeaturedHero
        movies={featuredMovies}
        requestFailed={featuredResult.status === "rejected"}
      />
      <MovieCarousel
        title="Now Playing"
        movies={nowPlayingMovies}
        requestFailed={nowPlayingResult.status === "rejected"}
      />
      <ComingSoonCarousel
        movies={comingSoonMovies}
        requestFailed={comingSoonResult.status === "rejected"}
      />
    </main>
  );
}
