function Home() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Hero section */}
      <section className="rounded-2xl bg-primary px-8 py-16 text-white md:px-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-200">
            Welcome to ShopSphere
          </p>

          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Find Everything You Love, All in One Place.
          </h1>

          <p className="mt-6 text-lg text-indigo-100">
            Discover products you'll love, with a seamless shopping experience
            made just for you.
          </p>

          <a
            href="/products"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Categories section placeholder */}
      <section className="py-16">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Explore Categories
        </h2>
        <p className="mt-2 text-gray-600">
          Browse through our range of product categories.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {["Electronics", "Fashion", "Home & Living", "Accessories"].map(
            (category) => (
              <div
                key={category}
                className="flex min-h-36 items-center justify-center rounded-xl border border-border bg-surface p-6 text-center font-semibold text-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {category}
              </div>
            ),
          )}
        </div>
      </section>

      {/* Featured products placeholder */}
      <section className="pb-16">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Featured Products
        </h2>
        <p className="mt-2 text-muted">Our handpicked selection for you.</p>

        <div className="mt-8 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-muted">
          Products will appear here once we connect the backend API.
        </div>
      </section>
    </div>
  );
}

export default Home;
