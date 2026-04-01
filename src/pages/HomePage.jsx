import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiImage,
  FiLayers,
  FiPrinter,
  FiScissors,
  FiShield,
  FiUsers,
} from "react-icons/fi";

const CAROUSEL_ITEMS = [
  {
    title: "Production-ready workflow",
    subtitle: "From counter to completion",
    description:
      "Route walk-in requests to fulfillment with real-time order tracking and role-based operations.",
    highlight: "Fast order intake",
  },
  {
    title: "Smart service management",
    subtitle: "Catalog and pricing in one place",
    description:
      "Maintain service lists, update rates, and keep every team member aligned with current offerings.",
    highlight: "Flexible service setup",
  },
  {
    title: "Inventory-aware transactions",
    subtitle: "Less manual stock corrections",
    description:
      "Automatically reduce stock quantities as orders are placed to keep inventory values dependable.",
    highlight: "Reliable stock movement",
  },
];

const SERVICES = [
  {
    name: "Document Printing",
    description:
      "Black-and-white and colored prints for office, school, and business use.",
    icon: FiPrinter,
  },
  {
    name: "Photocopying",
    description:
      "Quick single-page or bulk duplicate jobs with consistent quality.",
    icon: FiFileText,
  },
  {
    name: "Scanning",
    description:
      "Digitize paper files into clear, share-ready digital formats.",
    icon: FiImage,
  },
  {
    name: "Laminating",
    description: "Protect IDs, certificates, and frequently used printouts.",
    icon: FiShield,
  },
  {
    name: "Binding and Finishing",
    description:
      "Clean finishing touches for reports, proposals, and project submissions.",
    icon: FiScissors,
  },
  {
    name: "Business and Marketing Prints",
    description:
      "Custom outputs for menus, flyers, signs, and store-ready materials.",
    icon: FiLayers,
  },
];

const ABOUT_POINTS = [
  "Professional print output with practical turnaround times.",
  "Customer-first support for students, offices, and local businesses.",
  "Operational visibility through dashboard, POS, and inventory controls.",
  "Security-aware system design with role-based access and protected routes.",
];

const HomePage = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  };

  const goToPreviousSlide = () => {
    setActiveSlide(
      (prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length,
    );
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-[#f4f7fb] via-white to-[#eef6ff] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#top" className="inline-flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-xs font-black tracking-wide text-white">
              BS
            </span>
            <div>
              <p className="text-sm font-black leading-none text-slate-900">
                BlockStone Printing
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Home
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#services" className="transition hover:text-slate-900">
              Services
            </a>
            <a href="#about" className="transition hover:text-slate-900">
              About
            </a>
            <a href="#highlights" className="transition hover:text-slate-900">
              Highlights
            </a>
          </nav>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Sign in
            <FiArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section
        id="top"
        className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14"
      >
        <div className="grid gap-7 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">
              Modern print operations
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Professional printing, managed from one dependable platform.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              BlockStone helps teams handle front-desk requests, service
              delivery, and inventory flow in a single system built for
              day-to-day print shop operations.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Enter dashboard
                <FiArrowRight size={15} />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Explore services
              </a>
            </div>
          </div>

          <div className="grid gap-3 lg:col-span-5">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Daily momentum
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                Reliable
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Keep production moving with clear user roles and streamlined POS
                order handling.
              </p>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-4">
                <FiClock className="text-sky-700" size={17} />
                <h2 className="mt-2 text-sm font-black text-slate-900">
                  Faster intake
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Process customer requests with fewer handoff delays.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-4">
                <FiUsers className="text-sky-700" size={17} />
                <h2 className="mt-2 text-sm font-black text-slate-900">
                  Team-ready
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Assign and control user permissions with confidence.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        id="highlights"
        className="mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.5)] sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Home Highlights
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                What makes BlockStone efficient
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousSlide}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                aria-label="Previous highlight"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goToNextSlide}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                aria-label="Next highlight"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>

          <article className="rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-sky-800 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
              {CAROUSEL_ITEMS[activeSlide].subtitle}
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight">
              {CAROUSEL_ITEMS[activeSlide].title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm text-slate-200 sm:text-base">
              {CAROUSEL_ITEMS[activeSlide].description}
            </p>
            <span className="mt-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-100">
              {CAROUSEL_ITEMS[activeSlide].highlight}
            </span>
          </article>

          <div className="mt-4 flex items-center gap-2">
            {CAROUSEL_ITEMS.map((item, index) => (
              <button
                type="button"
                key={item.title}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition ${
                  activeSlide === index
                    ? "w-9 bg-slate-900"
                    : "w-4 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`View ${item.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="services"
        className="mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6"
      >
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            Services
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Complete BlockStone service lineup
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-25px_rgba(15,23,42,0.5)]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                  <Icon size={18} />
                </div>
                <h3 className="mt-3 text-base font-black text-slate-900">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="about"
        className="mx-auto mt-10 w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16"
      >
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_35px_-26px_rgba(15,23,42,0.5)] lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              About BlockStone
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Built to support real print-shop operations.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              BlockStone combines customer service workflows, operational
              controls, and reporting visibility into one workspace. The goal is
              straightforward: help teams deliver quality output faster while
              staying organized as volume grows.
            </p>

            <div className="mt-5 space-y-2.5">
              {ABOUT_POINTS.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <FiCheckCircle
                    className="mt-0.5 shrink-0 text-emerald-600"
                    size={16}
                  />
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-3 lg:col-span-5">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Mission
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Deliver dependable printing services with operational discipline
                and customer trust.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Vision
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Become a top-of-mind local printing partner powered by efficient
                digital workflows.
              </p>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
