"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Clock, ShieldCheck, HeartPulse } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "送出需求",
    description: "選擇地點、服務項目、預算、時間，3 分鐘填完",
  },
  {
    number: "02",
    title: "美甲師報價",
    description: "符合條件的美甲師會主動找你，附上作品集和報價",
  },
  {
    number: "03",
    title: "挑選預約",
    description: "看作品、比價格、選一個順眼的直接預約",
  },
];

const features = [
  {
    title: "價格透明",
    description: "不用一間間問，報價直接看",
    icon: <ShieldCheck className="w-6 h-6 text-pink-500" />
  },
  {
    title: "作品先看",
    description: "每位美甲師都有作品集可以瀏覽",
    icon: <Sparkles className="w-6 h-6 text-pink-500" />
  },
  {
    title: "快速配對",
    description: "平均 5 分鐘內收到第一個報價",
    icon: <Clock className="w-6 h-6 text-pink-500" />
  },
  {
    title: "免費使用",
    description: "消費者完全免費，不收任何手續費",
    icon: <HeartPulse className="w-6 h-6 text-pink-500" />
  },
];

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
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-pink-200">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
            <Sparkles className="h-6 w-6 text-pink-500 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            NailMatch
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/artist/dashboard"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-pink-600"
            >
              美甲師入口
            </Link>
            <Button asChild size="sm" className="bg-slate-900 text-white shadow-md transition-all hover:bg-pink-600 hover:shadow-pink-500/25">
              <Link href="/request">我要求配對</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100 via-white to-slate-50" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl filter" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl filter" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 border-pink-200 bg-pink-50/50 px-4 py-1.5 text-sm font-medium text-pink-700 backdrop-blur-sm">
              ✨ 顛覆傳統的美甲預約體驗
            </Badge>
            <h1 className="mb-8 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              不再一間間詢價，<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                讓美甲師主動找上門。
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 lg:text-xl leading-relaxed">
              只需三分鐘填妥條件！符合需求與空檔的美甲師會親自為您報價。輕鬆瀏覽作品集比價，挑選最心儀的款式一鍵預約。
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-14 bg-gradient-to-r from-pink-500 to-pink-600 px-8 text-lg font-semibold shadow-xl shadow-pink-500/20 transition-all hover:scale-105 hover:from-pink-600 hover:to-pink-700"
              >
                <Link href="/request">
                  免費送出需求
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 border-slate-200 bg-white/50 px-8 text-lg font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <Link href="/line/liff/artist-form">我是美甲/美睫師</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition / Steps */}
      <section className="relative py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              簡單三步驟，完成完美預約
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded bg-pink-500" />
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
                <Card className="group relative overflow-hidden border-none bg-slate-50 shadow-none transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardContent className="relative p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-pink-500 shadow-sm ring-1 ring-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      {step.number}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-slate-900">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                    {index !== steps.length - 1 && (
                      <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-200 md:block">
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
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 md:flex md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                為什麼需要 NailMatch？
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                我們致力於解決尋找美甲師時的繁瑣過程，為雙方創造一個透明、高效的媒合環境。
              </p>
            </div>
            <div className="mt-8 hidden md:block">
              <div className="h-px w-32 bg-gradient-to-r from-pink-500 to-transparent" />
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
                <div className="rounded-3xl border border-slate-800 bg-slate-800/50 p-8 transition-colors hover:bg-slate-800 hover:border-slate-700">
                  <div className="mb-6 inline-flex rounded-xl bg-slate-900 p-3 shadow-inner ring-1 ring-slate-800">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-32 bg-pink-600">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
            準備好邂逅完美美甲了嗎？
          </h2>
          <p className="mb-10 text-xl text-pink-100 font-medium">
            現在就送出需求，短短 3 分鐘即可開啟全新的美麗旅程！
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              size="lg"
              className="h-16 rounded-full bg-white px-10 text-xl font-bold text-pink-600 shadow-xl transition-colors hover:bg-slate-50"
            >
              <Link href="/request">
                立即送出您的第一筆需求
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center justify-between sm:flex-row sm:px-6 lg:px-8 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-4 sm:mb-0">
            <Sparkles className="w-5 h-5 text-pink-500" />
            NailMatch
          </div>
          <p>&copy; {new Date().getFullYear()} NailMatch Platform. Crafted with ❤️.</p>
        </div>
      </footer>
    </div>
  );
}

