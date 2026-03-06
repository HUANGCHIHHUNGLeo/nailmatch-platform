"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Clock, ShieldCheck, HeartPulse, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { t } = useLanguage();

  const steps = [
    { number: "01", title: t.steps.step1.title, description: t.steps.step1.desc },
    { number: "02", title: t.steps.step2.title, description: t.steps.step2.desc },
    { number: "03", title: t.steps.step3.title, description: t.steps.step3.desc },
  ];

  const features = [
    { title: t.features.feat1.title, description: t.features.feat1.desc, icon: <ShieldCheck className="w-6 h-6 text-[var(--brand)]" /> },
    { title: t.features.feat2.title, description: t.features.feat2.desc, icon: <Sparkles className="w-6 h-6 text-[var(--brand)]" /> },
    { title: t.features.feat3.title, description: t.features.feat3.desc, icon: <Clock className="w-6 h-6 text-[var(--brand)]" /> },
    { title: t.features.feat4.title, description: t.features.feat4.desc, icon: <HeartPulse className="w-6 h-6 text-[var(--brand)]" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] font-sans selection:bg-[var(--brand-light)]">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="NaLi Match" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-gray-900">NaLi Match</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/artist"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-[var(--brand)] sm:block"
            >
              {t.nav.artistLogin}
            </Link>
            <Button asChild size="sm" className="text-white shadow-md transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              <Link href="/request">{t.nav.customerCta}</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at top, var(--brand-light) 0%, white 50%, #f8fafc 100%)' }} />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full blur-3xl filter" style={{ backgroundColor: 'rgba(196,160,138,0.25)' }} />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl filter" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 border-[var(--brand-light)] bg-[var(--brand-light)]/50/50 px-4 py-1.5 text-sm font-medium text-[var(--brand-darker)] backdrop-blur-sm">
              {t.hero.badge}
            </Badge>
            <h1 className="mb-8 text-5xl font-black tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              {t.hero.headline1}<br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--brand), var(--brand-rose))' }}>
                {t.hero.headline2}
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 lg:text-xl leading-relaxed">
              {t.hero.subtext}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-14 px-8 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', boxShadow: '0 10px 25px -5px rgba(196,160,138,0.3)' }}
              >
                <Link href="/request">
                  {t.hero.ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 border-gray-200 bg-white/50 px-8 text-lg font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                <Link href="/artist">{t.hero.ctaArtist}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition / Steps */}
      <section className="relative py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t.steps.sectionTitle}
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded bg-[var(--brand)]" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 md:grid-cols-3 lg:gap-12"
          >
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={itemVariants}>
                <Card className="group relative overflow-hidden border-none bg-gray-50 shadow-none transition-all hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50">
                  <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'linear-gradient(to bottom right, rgba(196,160,138,0.08), rgba(212,169,169,0.08))' }} />
                  <CardContent className="relative p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[var(--brand)] shadow-sm ring-1 ring-gray-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      {step.number}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    {index !== steps.length - 1 && (
                      <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-gray-200 md:block">
                        <ArrowRight className="h-8 w-8" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-900 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 md:flex md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t.features.sectionTitle}
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                {t.features.sectionDesc}
              </p>
            </div>
            <div className="mt-8 hidden md:block">
              <div className="h-px w-32" style={{ background: 'linear-gradient(to right, var(--brand), transparent)' }} />
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <div className="rounded-3xl border border-gray-800 bg-gray-800/50 p-8 transition-colors hover:bg-gray-800 hover:border-gray-700">
                  <div className="mb-6 inline-flex rounded-xl bg-gray-900 p-3 shadow-inner ring-1 ring-gray-800">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-32" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-rose))' }}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {t.cta.title}
          </h2>
          <p className="mb-10 text-xl text-[var(--brand-light)] font-medium">
            {t.cta.subtitle}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              size="lg"
              className="h-16 rounded-full bg-white px-10 text-xl font-bold text-[var(--brand-dark)] shadow-xl transition-colors hover:bg-gray-50"
            >
              <Link href="/request">
                {t.cta.button}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center justify-between sm:flex-row sm:px-6 lg:px-8 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-4 sm:mb-0">
            <Image src="/logo.png" alt="NaLi Match" width={24} height={24} className="rounded" />
            NaLi Match
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
