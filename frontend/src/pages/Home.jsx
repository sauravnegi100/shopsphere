import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiShield,
  FiShoppingBag,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

// const heroImage = "/frontend/public/shopsphere-hero.png"
const heroImage = "/shopsphere-hero.png";

const reveal = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, description, link }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>

        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
      </div>

      {link && (
        <Link
          to={link}
          className="group flex items-center gap-1 text-sm font-semibold text-primary"
        >
          View all
          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function HeroCarousel({ products }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = [
    {
      eyebrow: "WELCOME TO SHOPSPHERE",
      title: "Everything you want, all in one place.",
      description:
        "Discover products you'll love, from everyday essentials to your next favorite find.",
      image: heroImage,
      button: "Shop now",
      link: "/products",
      light: true,
    },
    {
      eyebrow: "NEW ARRIVALS",
      title: "Fresh finds for everyday life.",
      description:
        "Explore the latest products added to the ShopSphere collection.",
      image: products[0]?.images?.[0] || heroImage,
      button: "Explore new arrivals",
      link: "/products?sort=newest",
      light: false,
    },
    {
      eyebrow: "DISCOVER MORE",
      title: "Find something you'll love.",
      description:
        "Browse our growing collection and discover products made for you.",
      image: products[1]?.images?.[0] || heroImage,
      button: "Explore products",
      link: "/products",
      light: false,
    },
  ];

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [paused, slides.length]);

  const previous = () => {
    setActive((current) => (current - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setActive((current) => (current + 1) % slides.length);
  };

  const slide = slides[active];

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[350px] overflow-hidden rounded-2xl sm:h-[390px] lg:h-[410px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
            className="absolute inset-0"
          >
            {/* Hero image */}
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Text readability overlay */}
            <div
              className={`absolute inset-0 ${
                slide.light
                  ? "bg-gradient-to-r from-[#f3e5d5] via-[#f3e5d5]/85 to-transparent"
                  : "bg-gradient-to-r from-[#111827]/95 via-[#111827]/75 to-transparent"
              }`}
            />

            {/* Content */}
            <div
              className={`relative flex h-full items-center px-10 sm:px-14 lg:px-16 ${
                slide.light ? "text-[#111827]" : "text-white"
              }`}
            >
              <div className="max-w-lg">
                <motion.p
                  key={`${active}-eyebrow`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 }}
                  className={`text-[10px] font-bold tracking-[0.2em] sm:text-xs ${
                    slide.light ? "text-primary" : "text-white/70"
                  }`}
                >
                  {slide.eyebrow}
                </motion.p>

                <motion.h1
                  key={`${active}-title`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="mt-3 max-w-xl text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  key={`${active}-description`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.24 }}
                  className={`mt-4 max-w-md text-sm leading-6 sm:text-base ${
                    slide.light ? "text-[#334155]" : "text-white/75"
                  }`}
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  key={`${active}-button`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Link
                    to={slide.link}
                    className={`mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                      slide.light
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-white text-[#111827] hover:bg-white/90"
                    }`}
                  >
                    {slide.button}
                    <FiArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous */}
        <button
          type="button"
          onClick={previous}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white sm:left-5"
        >
          <FiChevronLeft size={18} />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white sm:right-5"
        >
          <FiChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-10 z-20 flex items-center gap-2 sm:left-14 lg:left-16">
          {slides.map((item, index) => (
            <button
              key={item.eyebrow}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active === index
                  ? "w-7 bg-primary"
                  : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      const results = await Promise.allSettled([
        getProducts({ limit: 8, sort: "newest" }),
        getCategories(),
      ]);

      if (cancelled) return;

      if (results[0].status === "fulfilled") {
        setProducts(results[0].value.products || []);
      }

      if (results[1].status === "fulfilled") {
        setCategories(results[1].value.categories || []);
      }

      if (results.some((result) => result.status === "rejected")) {
        setLoadError(true);
        toast.error("Some shop content could not be loaded");
      }

      setLoading(false);
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <HeroCarousel products={products} />
      </div>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="DISCOVER"
            title="Shop by category"
            description="Explore our collection, one category at a time."
            link="/products"
          />
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-xl bg-surface-muted"
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6"
          >
            {categories.slice(0, 12).map((category, index) => (
              <motion.div
                key={category._id}
                variants={reveal}
                transition={{ duration: 0.45 }}
              >
                <Link
                  to={`/products?category=${category._id}`}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex aspect-square w-full max-w-32 items-center justify-center rounded-full border border-border bg-surface-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
                    <span className="text-3xl font-bold text-primary/65">
                      {category.name?.charAt(0).toUpperCase() || "S"}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
            No categories available.
          </p>
        )}
      </section>

      {/* New arrivals */}
      <section className="border-y border-border bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="JUST LANDED"
              title="New arrivals"
              description="Explore the latest additions to ShopSphere."
              link="/products?sort=newest"
            />
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl bg-surface-muted"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08 }}
              className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4"
            >
              {products.map((product) => (
                <motion.article
                  key={product._id}
                  variants={reveal}
                  transition={{ duration: 0.45 }}
                  whileHover={{ y: -5 }}
                  className="group overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface-muted">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted">
                        <FiPackage size={30} />
                      </div>
                    )}

                    {product.stock === 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-foreground px-2 py-1 text-xs text-background">
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <p className="text-xs text-muted">
                      {product.category?.name || "Product"}
                    </p>

                    <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-foreground">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-base font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <p className="rounded-xl border border-border bg-background p-10 text-center text-muted">
              {loadError
                ? "Products could not be loaded."
                : "New products coming soon."}
            </p>
          )}

          <Reveal className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              Explore all products
              <FiArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Promotional banner */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-[#17253f] px-7 py-12 text-white sm:px-12 lg:py-16">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border-[60px] border-white/5" />

            <div className="relative max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8baf7]">
                THE SHOPSPHERE COLLECTION
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Good finds. Great everyday moments.
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                Find the essentials and discover something unexpected.
              </p>

              <Link
                to="/products"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#17253f] transition hover:bg-white/90"
              >
                Discover more
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: FiShield,
              title: "Secure payments",
              description: "Protected payment experience",
            },
            {
              icon: FiShoppingBag,
              title: "Easy shopping",
              description: "Simple browsing and checkout",
            },
            {
              icon: FiPackage,
              title: "Explore more",
              description: "Discover products across categories",
            },
          ].map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.1}>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {title}
                  </h3>

                  <p className="mt-1 text-xs text-muted">{description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
