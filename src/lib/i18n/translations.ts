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
            badge: "✨ 免費使用 · 不用一間間問 · 不怕踩雷",
            headline1: "3 分鐘發需求，",
            headline2: "5 分鐘收到設計師報價。",
            subtext: "告別一間間私訊問價的日子。送出需求後，符合條件的美甲/美睫師會帶著作品集和報價主動找你。比價格、看作品、選最喜歡的一鍵預約。",
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
            title: "還在一間間私訊問價嗎？",
            subtitle: "送出需求只要 3 分鐘，設計師帶著作品集主動找你報價。免費、透明、不踩雷。",
            button: "立即免費送出需求",
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

        // Lobby
        lobby: {
            title: "配對大廳",
            subtitle: "瀏覽所有待配對需求",
            filter: { all: "全部", nail: "美甲", lash: "美睫" },
            resultCount: "共 {count} 筆需求",
            loadMore: "載入更多",
            noResults: "目前沒有符合條件的需求",
            card: {
                quotesCount: "{count} 位設計師已報價",
                timeAgo: "{time}前",
            },
        },

        // Artists browse
        artists: {
            title: "設計師總覽",
            searchPlaceholder: "搜尋設計師...",
            filters: { all: "全部", nail: "美甲", lash: "美睫" },
            resultCount: "共 {count} 位設計師",
            card: {
                startingFrom: "起",
                reviews: "{count} 則評價",
                noReviews: "尚無評價",
                viewProfile: "查看檔案",
            },
        },

        // Booking detail
        booking: {
            title: "預約詳情",
            success: "預約成功！",
            artistInfo: "美甲師資訊",
            details: "預約詳情",
            serviceItems: "服務項目",
            location: "地點",
            date: "預約日期",
            time: "預約時間",
            price: "確認價格",
            artistMessage: "美甲師留言",
            reviewTitle: "評價美甲師",
            reviewPlaceholder: "分享你的體驗...",
            submitReview: "送出評價",
            submittingReview: "送出中...",
            reviewThanks: "感謝你的評價！",
            reschedule: "申請改期",
            rescheduleTitle: "申請改期",
            newDate: "新日期",
            newTime: "新時段",
            submitReschedule: "送出改期請求",
            cancelBooking: "取消預約",
            cancelling: "取消中...",
            status: {
                confirmed: "已確認",
                completed: "已完成",
                cancelled: "已取消",
                no_show: "未到場",
            },
        },

        // Artist bookings
        artistBookings: {
            title: "預約管理",
            tabs: { upcoming: "待服務", completed: "已完成", cancelled: "已取消" },
            markComplete: "標記完成",
            reschedule: "改期",
            empty: {
                upcoming: "目前沒有待服務的預約",
                completed: "尚無已完成的預約",
                cancelled: "沒有已取消的預約",
            },
        },

        // Availability
        availability: {
            title: "時段管理",
            addSlot: "新增時段",
            quickAdd: "快速新增 7 天",
            calendar: "月曆",
            list: "列表",
            newSlotTitle: "新增可預約時段",
            dateLabel: "日期",
            startTime: "開始時間",
            endTime: "結束時間",
            booked: "已預約",
            available: "可預約",
            emptyState: "還沒有設定可預約時段",
            emptyHint: "新增時段後，客戶才能看到你的可預約時間",
            timeSlots: {
                morning: "上午 (10:00-12:00)",
                afternoon: "下午 (13:00-17:00)",
                evening: "晚上 (18:00-21:00)",
            },
        },

        // Artist profile / settings
        profile: {
            editTitle: "編輯個人檔案",
            displayName: "顯示名稱",
            phone: "電話",
            email: "Email",
            bio: "自我介紹",
            cities: "服務地區",
            services: "服務項目",
            styles: "擅長風格",
            priceRange: "價格範圍",
            instagram: "Instagram",
            saveChanges: "儲存變更",
            saving: "儲存中...",
        },

        // Settings
        settings: {
            title: "帳號設定",
            pauseService: "暫停接單",
            pauseDesc: "暫停後不會收到新的需求通知",
            activeStatus: "營業中",
            pausedStatus: "已暫停",
        },

        // Customer "My" page
        myPage: {
            title: "我的需求",
            noRequests: "還沒有送出需求",
            postFirst: "現在就送出你的第一筆需求吧！",
            postRequest: "送出需求",
            viewDetail: "查看詳情",
            requestStatus: {
                pending: "等待中",
                matching: "配對中",
                confirmed: "已確認",
                completed: "已完成",
                cancelled: "已取消",
                expired: "已過期",
            },
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
            home: "回首頁",
            notFound: "找不到此頁面",
            budget: "預算",
            services: "服務項目",
            location: "地點",
            date: "日期",
            time: "時間",
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
            badge: "✨ Free to use · No more DM-ing around · No surprises",
            headline1: "3 minutes to post,",
            headline2: "5 minutes to get quotes.",
            subtext: "Stop DM-ing artists one by one. Post your request and qualified nail & lash artists will reach out with portfolios and quotes. Compare prices, browse work, and book your favourite—all in one place.",
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

        // Lobby
        lobby: {
            title: "Matching Lobby",
            subtitle: "Browse all open requests",
            filter: { all: "All", nail: "Nail", lash: "Lash" },
            resultCount: "{count} requests",
            loadMore: "Load More",
            noResults: "No matching requests found",
            card: {
                quotesCount: "{count} artists quoted",
                timeAgo: "{time} ago",
            },
        },

        // Artists browse
        artists: {
            title: "Browse Artists",
            searchPlaceholder: "Search artists...",
            filters: { all: "All", nail: "Nail", lash: "Lash" },
            resultCount: "{count} artists",
            card: {
                startingFrom: "from",
                reviews: "{count} reviews",
                noReviews: "No reviews yet",
                viewProfile: "View Profile",
            },
        },

        // Booking detail
        booking: {
            title: "Booking Details",
            success: "Booking Confirmed!",
            artistInfo: "Artist Info",
            details: "Booking Details",
            serviceItems: "Services",
            location: "Location",
            date: "Booking Date",
            time: "Booking Time",
            price: "Confirmed Price",
            artistMessage: "Artist's Message",
            reviewTitle: "Review Artist",
            reviewPlaceholder: "Share your experience...",
            submitReview: "Submit Review",
            submittingReview: "Submitting...",
            reviewThanks: "Thanks for your review!",
            reschedule: "Request Reschedule",
            rescheduleTitle: "Request Reschedule",
            newDate: "New Date",
            newTime: "New Time Slot",
            submitReschedule: "Submit Reschedule",
            cancelBooking: "Cancel Booking",
            cancelling: "Cancelling...",
            status: {
                confirmed: "Confirmed",
                completed: "Completed",
                cancelled: "Cancelled",
                no_show: "No Show",
            },
        },

        // Artist bookings
        artistBookings: {
            title: "Booking Management",
            tabs: { upcoming: "Upcoming", completed: "Completed", cancelled: "Cancelled" },
            markComplete: "Mark Complete",
            reschedule: "Reschedule",
            empty: {
                upcoming: "No upcoming bookings",
                completed: "No completed bookings yet",
                cancelled: "No cancelled bookings",
            },
        },

        // Availability
        availability: {
            title: "Availability",
            addSlot: "Add Slot",
            quickAdd: "Quick Add 7 Days",
            calendar: "Calendar",
            list: "List",
            newSlotTitle: "Add Available Time Slot",
            dateLabel: "Date",
            startTime: "Start Time",
            endTime: "End Time",
            booked: "Booked",
            available: "Available",
            emptyState: "No time slots set up yet",
            emptyHint: "Add time slots so customers can see your availability",
            timeSlots: {
                morning: "Morning (10:00-12:00)",
                afternoon: "Afternoon (13:00-17:00)",
                evening: "Evening (18:00-21:00)",
            },
        },

        // Artist profile / settings
        profile: {
            editTitle: "Edit Profile",
            displayName: "Display Name",
            phone: "Phone",
            email: "Email",
            bio: "About Me",
            cities: "Service Areas",
            services: "Services",
            styles: "Specialised Styles",
            priceRange: "Price Range",
            instagram: "Instagram",
            saveChanges: "Save Changes",
            saving: "Saving...",
        },

        // Settings
        settings: {
            title: "Account Settings",
            pauseService: "Pause Service",
            pauseDesc: "While paused, you won't receive new request notifications",
            activeStatus: "Active",
            pausedStatus: "Paused",
        },

        // Customer "My" page
        myPage: {
            title: "My Requests",
            noRequests: "No requests yet",
            postFirst: "Post your first request now!",
            postRequest: "Post Request",
            viewDetail: "View Details",
            requestStatus: {
                pending: "Pending",
                matching: "Matching",
                confirmed: "Confirmed",
                completed: "Completed",
                cancelled: "Cancelled",
                expired: "Expired",
            },
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
            home: "Home",
            notFound: "Page not found",
            budget: "Budget",
            services: "Services",
            location: "Location",
            date: "Date",
            time: "Time",
        },
    },
} as const;

export type Translations = typeof translations.zh;
