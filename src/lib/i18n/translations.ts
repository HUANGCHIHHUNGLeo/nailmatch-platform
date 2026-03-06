export type Language = "zh" | "en";

export const translations = {
    zh: {
        // Global / Nav
        nav: {
            artistLogin: "設計師入口",
            customerCta: "我要求配對",
            home: "回主頁",
            postRequest: "發佈需求",
            settings: "設定",
        },

        // Homepage Hero
        hero: {
            badge: "✨ 顛覆傳統的美甲美睫預約體驗",
            headline1: "不再一間間詢價，",
            headline2: "讓美甲/美睫師主動找上門。",
            subtext: "只需三分鐘填妥條件！符合需求與空檔的美甲/美睫師會親自為您報價。輕鬆瀏覽作品集比價，挑選最心儀的款式一鍵預約。",
            ctaPrimary: "免費送出需求",
            ctaArtist: "我是美甲/美睫師",
        },

        // Homepage Steps
        steps: {
            sectionTitle: "簡單三步驟，完成完美預約",
            step1: { title: "送出需求", desc: "選擇地點、服務項目、預算、時間，3 分鐘填完" },
            step2: { title: "師傅報價", desc: "符合條件的美甲/美睫師會主動找你，附上作品集和報價" },
            step3: { title: "挑選預約", desc: "看作品、比價格、選一個順眼的直接預約" },
        },

        // Homepage Features
        features: {
            sectionTitle: "為什麼需要 NaLi Match？",
            sectionDesc: "我們致力於解決尋找美甲/美睫師時的繁瑣過程，為雙方創造一個透明、高效的媒合環境。",
            feat1: { title: "價格透明", desc: "不用一間間問，報價直接看" },
            feat2: { title: "作品先看", desc: "每位設計師都有作品集可以瀏覽" },
            feat3: { title: "快速配對", desc: "平均 5 分鐘內收到第一個報價" },
            feat4: { title: "免費使用", desc: "消費者完全免費，不收任何手續費" },
        },

        // Homepage CTA Section
        cta: {
            title: "準備好邂逅完美美甲/美睫了嗎？",
            subtitle: "現在就送出需求，短短 3 分鐘即可開啟全新的美麗旅程！",
            button: "立即送出您的第一筆需求",
        },

        // Homepage Footer
        footer: {
            tagline: "讓美甲美睫的每次邂逅，都值得期待。",
            copyright: "© 2025 NaLi Match. All rights reserved.",
            customerService: "顧客服務",
            artistService: "設計師服務",
            links: {
                postRequest: "送出需求",
                viewArtists: "瀏覽設計師",
                faq: "常見問題",
                joinArtist: "申請成為設計師",
                artistLogin: "設計師登入",
                pricing: "收費方式",
            },
        },

        // Customer Request Form
        request: {
            headerTitle: "NaLi Match",
            progressLabel: "服務地點",
        },

        // Artist Dashboard
        dashboard: {
            greeting: "你好，",
            stats: {
                todayBookings: "今日預約",
                pendingRequests: "待回應需求",
                totalOrders: "累計接單",
                monthlyEarnings: "本月收入",
            },
            tabs: {
                newRequests: "新需求",
                myBookings: "我的預約",
            },
            emptyState: {
                noRequests: "目前沒有新需求",
                notifyViaLine: "有新需求時會透過 LINE 通知您",
            },
            quickLinks: {
                editProfile: "編輯個人檔案",
                managePortfolio: "管理作品集",
                timeSlots: "時段管理",
                bookingHistory: "預約紀錄",
            },
        },

        // Artist Registration (LIFF form)
        artistForm: {
            title: "NaLi Match 入駐",
            titleNail: "NaLi Match 美甲師入駐",
            titleLash: "NaLi Match 美睫師入駐",
            chooseRole: "請選擇您的身份",
            roleNail: "我是美甲師",
            roleLash: "我是美睫師",
            submit: "送出申請",
            submitting: "送出中...",
            success: {
                title: "申請已送出！",
                desc: "我們會盡快審核您的資料，審核通過後會透過 LINE 通知您。",
                countdown: "秒後自動跳轉...",
            },
        },

        // Admin
        admin: {
            loginTitle: "NaLi Match",
            loginSubtitle: "管理員後台",
            passwordLabel: "管理密碼",
            passwordPlaceholder: "請輸入管理密碼",
            loginBtn: "登入",
            loggingIn: "驗證中...",
        },

        // Common
        common: {
            loading: "載入中...",
            error: "發生錯誤",
            back: "返回",
            cancel: "取消",
            confirm: "確認",
            save: "儲存",
            submit: "送出",
            close: "關閉",
        },
    },

    en: {
        // Global / Nav
        nav: {
            artistLogin: "Artist Login",
            customerCta: "Find a Match",
            home: "Home",
            postRequest: "Post Request",
            settings: "Settings",
        },

        // Homepage Hero
        hero: {
            badge: "✨ A smarter way to book nail & lash services",
            headline1: "No more calling around—",
            headline2: "Let nail & lash artists come to you.",
            subtext: "Fill in your preferences in 3 minutes. Qualified nail & lash artists will reach out with portfolio samples and quotes. Browse, compare, and book—all in one place.",
            ctaPrimary: "Post Your Request — It's Free",
            ctaArtist: "I'm a Nail / Lash Artist",
        },

        // Homepage Steps
        steps: {
            sectionTitle: "3 Simple Steps to Perfect Nails",
            step1: { title: "Post Your Request", desc: "Choose location, services, budget & time. Done in 3 minutes." },
            step2: { title: "Artists Reach Out", desc: "Qualified nail & lash artists will contact you with their portfolio and quote." },
            step3: { title: "Pick & Book", desc: "Browse portfolios, compare prices, and book your favourite artist." },
        },

        // Homepage Features
        features: {
            sectionTitle: "Why NaLi Match?",
            sectionDesc: "We simplify the hassle of finding nail and lash artists, creating a transparent and efficient marketplace for both clients and artists.",
            feat1: { title: "Transparent Pricing", desc: "No more guessing—see all quotes upfront." },
            feat2: { title: "Portfolio First", desc: "Every artist has a portfolio so you know what to expect." },
            feat3: { title: "Fast Matching", desc: "Receive your first quote within an average of 5 minutes." },
            feat4: { title: "Always Free", desc: "100% free for customers. No booking fees, ever." },
        },

        // Homepage CTA Section
        cta: {
            title: "Ready to find your perfect nail & lash artist?",
            subtitle: "Post your request now—it only takes 3 minutes to unlock a beautiful new experience.",
            button: "Post My First Request",
        },

        // Homepage Footer
        footer: {
            tagline: "Every appointment worth looking forward to.",
            copyright: "© 2025 NaLi Match. All rights reserved.",
            customerService: "For Customers",
            artistService: "For Artists",
            links: {
                postRequest: "Post a Request",
                viewArtists: "Browse Artists",
                faq: "FAQ",
                joinArtist: "Apply as an Artist",
                artistLogin: "Artist Login",
                pricing: "How Pricing Works",
            },
        },

        // Customer Request Form
        request: {
            headerTitle: "NaLi Match",
            progressLabel: "Service Location",
        },

        // Artist Dashboard
        dashboard: {
            greeting: "Welcome back, ",
            stats: {
                todayBookings: "Today's Bookings",
                pendingRequests: "Pending Requests",
                totalOrders: "Total Orders",
                monthlyEarnings: "Monthly Revenue",
            },
            tabs: {
                newRequests: "New Requests",
                myBookings: "My Bookings",
            },
            emptyState: {
                noRequests: "No new requests yet",
                notifyViaLine: "You'll be notified via LINE when a new request comes in",
            },
            quickLinks: {
                editProfile: "Edit Profile",
                managePortfolio: "Manage Portfolio",
                timeSlots: "Manage Availability",
                bookingHistory: "Booking History",
            },
        },

        // Artist Registration (LIFF form)
        artistForm: {
            title: "Join NaLi Match",
            titleNail: "Join NaLi Match as a Nail Artist",
            titleLash: "Join NaLi Match as a Lash Artist",
            chooseRole: "What's your speciality?",
            roleNail: "I'm a Nail Artist",
            roleLash: "I'm a Lash Artist",
            submit: "Submit Application",
            submitting: "Submitting...",
            success: {
                title: "Application Submitted!",
                desc: "We'll review your profile and notify you via LINE once approved.",
                countdown: "Redirecting in ",
            },
        },

        // Admin
        admin: {
            loginTitle: "NaLi Match",
            loginSubtitle: "Admin Panel",
            passwordLabel: "Admin Password",
            passwordPlaceholder: "Enter admin password",
            loginBtn: "Login",
            loggingIn: "Verifying...",
        },

        // Common
        common: {
            loading: "Loading...",
            error: "Something went wrong",
            back: "Back",
            cancel: "Cancel",
            confirm: "Confirm",
            save: "Save",
            submit: "Submit",
            close: "Close",
        },
    },
} as const;

export type Translations = typeof translations.zh;
