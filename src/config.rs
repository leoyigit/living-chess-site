use serde::{Deserialize, Serialize};

// ── Tweaks ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tweaks {
    pub accent: String,
    pub font:   String,
    pub hero:   String,
    pub grain:  String,
}

impl Default for Tweaks {
    fn default() -> Self {
        Self {
            accent: "amber".into(),
            font:   "serif".into(),
            hero:   "flow".into(),
            grain:  "off".into(),
        }
    }
}

impl Tweaks {
    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap_or_else(|_| "{}".into())
    }
}

// ── Team ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct TeamMember {
    pub name:     &'static str,
    pub role:     &'static str,
    pub bio:      &'static str,
    pub initials: &'static str,
    pub is_king:  bool,
    pub is_blue:  bool,
}

pub fn team() -> Vec<TeamMember> {
    vec![
        TeamMember {
            name: "Azad Heydarov", role: "CEO & Co-Founder", initials: "AZAD",
            bio: "Drives the project's vision — creates the concept, guides the research agenda and scripting, and coordinates teams so everything develops into a coherent whole.",
            is_king: true, is_blue: false,
        },
        TeamMember {
            name: "Firangiz Aslanova", role: "CTO & Co-Founder", initials: "FIRA",
            bio: "Leads technical strategy and decisions, transforming conceptual needs into working systems so the tech always supports creative and research goals.",
            is_king: false, is_blue: true,
        },
        TeamMember {
            name: "Leo Yiğit Ekiz", role: "Creative Director & System Architect", initials: "LEO",
            bio: "Designs the visual identity and overall aesthetic concept — guiding the creative vision and structural framework of the website, digital products, and platforms.",
            is_king: false, is_blue: false,
        },
        TeamMember {
            name: "Jamal Aslanov", role: "System Engineer", initials: "JAMAL",
            bio: "Maintains the stability of the machinery — managing infrastructure and internal systems so the team can move quickly without coordination friction.",
            is_king: false, is_blue: false,
        },
        TeamMember {
            name: "Asmar Khalilli", role: "Unity Programmer & XR Developer", initials: "ASMAR",
            bio: "Creates the interactive, spatial components of Living Chess — prototyping immersive experiences and bringing the game into 3D and XR.",
            is_king: false, is_blue: true,
        },
        TeamMember {
            name: "Orkhan Imanov", role: "Research & Development Lead", initials: "ORKHAN",
            bio: "Provides intellectual guidance — developing theoretical frameworks, overseeing academic validation, and connecting practice with interdisciplinary research.",
            is_king: false, is_blue: false,
        },
        TeamMember {
            name: "Emre Can Alptekin", role: "Media & Adaptation Director", initials: "EMRE",
            bio: "Translates gameplay into film and narrative form — developing the adaptation strategy and guiding how gameplay becomes story across media platforms.",
            is_king: false, is_blue: false,
        },
        TeamMember {
            name: "Elshan Poladli", role: "CFO", initials: "ELSHAN",
            bio: "Ensures financial stability — overseeing budgeting, resource planning, and developing sustainable pathways for digital products and media adaptations.",
            is_king: false, is_blue: true,
        },
    ]
}

// ── News ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct NewsItem {
    pub category: &'static str,
    pub date:     &'static str,
    pub title:    &'static str,
    pub excerpt:  &'static str,
    pub link:     Option<&'static str>,
}

pub fn news_items() -> Vec<NewsItem> {
    vec![
        NewsItem {
            category: "Award",
            date:     "2024",
            title:    "Arqus International Innovators Awards",
            excerpt:  "Living Chess was selected as a finalist of the Arqus International Innovators Award 2024, representing the University of Wrocław under the title Intertwining Chess with Theatre.",
            link:     Some("https://arqus-alliance.eu/event/finals-international-innovators-award-2024-vote/"),
        },
        NewsItem {
            category: "Conference",
            date:     "2024",
            title:    "7th KISMIF Conference in Porto",
            excerpt:  "Azad Heydarov presented Exploring Collective Decision-Making Through the Living Chessboard at the DIY Cultures, Democracy and Creative Participation conference.",
            link:     Some("https://paulaguerra.pt/wp-content/uploads/2025/08/Guerra-Bennett-2025.-KISMIF-2024_-Book-of-Abstracts-1.pdf"),
        },
        NewsItem {
            category: "Event",
            date:     "2024",
            title:    "Falling Walls Lab Wrocław",
            excerpt:  "Living Chess appeared in a public setting for the first time, introducing the project's logic and role-based structure to a broad audience.",
            link:     Some("https://uwr.edu.pl/en/we-already-know-the-participants-of-falling-walls-lab-wroclaw/"),
        },
        NewsItem {
            category: "Conference",
            date:     "2025",
            title:    "25th International Conference Communication & Culture",
            excerpt:  "Firangiz Aslanova presented Living Chess as a performative format enabling collaborative, embodied interaction and social-science observation.",
            link:     None,
        },
        NewsItem {
            category: "Sprint",
            date:     "2024",
            title:    "CreateCulture Lab Sprint, Vilnius",
            excerpt:  "The first sprint at CreateCulture Space marked a practical beginning — building the team, outlining structure, and gaining access to the accelerator program.",
            link:     Some("https://createculture.studio/"),
        },
        NewsItem {
            category: "Conference",
            date:     "2024",
            title:    "24th International Conference Communication & Culture",
            excerpt:  "Shabnam Mammadova presented Living Chess as a conceptual proposal, mapping MBTI types with chess piece roles to frame a sociological observation instrument.",
            link:     Some("https://socjologia.uwr.edu.pl/wydarzenia/konferencja-communication-and-culture/"),
        },
    ]
}

// ── Session dates ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize)]
pub struct SessionDate {
    pub index:      usize,
    pub label:      String,
    pub taken:      u32,
    pub total:      u32,
    pub left:       u32,
    pub fill_pct:   u32,
    pub is_full:    bool,
    pub is_low:     bool,
    pub is_first:   bool,
}

pub fn next_session_dates() -> Vec<SessionDate> {
    use chrono::{Datelike, Duration, Utc, Weekday};

    // Live site shows 20 seats per Sunday session
    let cap: u32 = 20;
    let now = Utc::now();

    // Find next Sunday
    let mut base = now.date_naive();
    loop {
        base = base + Duration::days(1);
        if base.weekday() == Weekday::Sun {
            break;
        }
    }

    let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    (0..4).map(|i| {
        let d     = base + Duration::days(i as i64 * 7);
        // All sessions currently show "20 left" on the live site
        let taken: u32 = 0;
        let left  = cap.saturating_sub(taken);
        let is_full = left == 0;
        let is_low  = left <= 5 && !is_full;
        SessionDate {
            index:    i,
            label:    format!("Sun, {} {}", d.day(), months[(d.month() - 1) as usize]),
            taken,
            total:    cap,
            left,
            fill_pct: taken * 100 / cap,
            is_full,
            is_low,
            is_first: i == 0,
        }
    }).collect()
}
