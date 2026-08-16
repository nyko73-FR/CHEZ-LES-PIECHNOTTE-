import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Minus, Heart, X, Wine, Music2, Users, TriangleAlert, Bell,
  Check, QrCode, Copy, Loader2, UtensilsCrossed, Lock, LogOut,
  RefreshCw, RotateCcw, ShieldCheck, ChevronRight
} from "lucide-react";

const GOLD = "#C9962E";
const GOLD_LIGHT = "#E8B95C";
const INK = "#0A0E13";
const PANEL = "#12181F";
const LINE = "#232B34";
const CREAM = "#F3ECDD";
const MUTED = "#8B94A0";
const GREEN = "#7FA66B";
const RED = "#D9673F";

// IMPORTANT: this is only a convenience barrier for a private home app.
// A client-side PIN is NOT real security. Change it before publishing.
const ADMIN_PIN = "2026";

const RSVP_STATES = [
  { key: "confirme", label: "Confirmé", color: GREEN },
  { key: "peutetre", label: "Peut-être", color: GOLD },
  { key: "absent", label: "Absent", color: "#6B6355" },
];

const DEFAULT_GUESTS = [
  { id: 1, name: "Léa", status: "confirme" },
  { id: 2, name: "Karim", status: "peutetre" },
];

const DEFAULT_TRACKS = [
  { id: 1, title: "Get Lucky", artist: "Daft Punk", votes: 3, voters: [] },
  { id: 2, title: "Loca People", artist: "Sak Noel", votes: 1, voters: [] },
];

const DEFAULT_DRINKS = [
  { id: 1, name: "Rosé", qty: 6, unit: "bouteilles", seuil: 4 },
  { id: 2, name: "Aperol", qty: 2, unit: "bouteilles", seuil: 2 },
  { id: 3, name: "Bière", qty: 18, unit: "canettes", seuil: 12 },
];

const KEYS = {
  guests: "apero-guests",
  tracks: "apero-tracks",
  drinks: "apero-drinks",
  orders: "apero-orders",
};

async function storageGet(key) {
  try {
    if (!window.storage?.get) return null;
    const r = await window.storage.get(key, true);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}

async function storageSet(key, value) {
  try {
    if (!window.storage?.set) return;
    await window.storage.set(key, JSON.stringify(value), true);
  } catch (e) {
    console.error("Erreur de sauvegarde", key, e);
  }
}

function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  } catch {}
}

function NightBackdrop() {
  const bokeh = [
    { top: "12%", left: "8%", size: 90, delay: 0 },
    { top: "22%", left: "82%", size: 60, delay: 1.1 },
    { top: "68%", left: "15%", size: 70, delay: 2.2 },
    { top: "78%", left: "70%", size: 110, delay: 0.6 },
    { top: "40%", left: "50%", size: 50, delay: 1.8 },
    { top: "8%", left: "45%", size: 40, delay: 2.6 },
    { top: "85%", left: "35%", size: 55, delay: 1.3 },
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, #17222B 0%, ${INK} 55%, #060809 100%)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(6,8,9,0.4) 70%, ${INK} 100%)`,
        }}
      />
      {bokeh.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            background:
              "radial-gradient(circle, rgba(232,185,92,0.55) 0%, rgba(232,185,92,0) 70%)",
            filter: "blur(2px)",
            animation: `flicker 4s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)",
        }}
      />
    </div>
  );
}

function RoughRingBadge({ size = 230 }) {
  const id = "roughRing";
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width="0" height="0">
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" />
        </filter>
      </svg>
      <svg width={size} height={size} style={{ position: "absolute" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke={CREAM}
          strokeWidth="3"
          filter={`url(#${id})`}
          opacity="0.9"
        />
      </svg>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(10,14,19,0.55)" }}
      />
    </div>
  );
}

function GlassLevel({ pct, low }) {
  return (
    <div className="relative w-8 h-12 flex-shrink-0">
      <div
        className="absolute inset-0 rounded-b-lg rounded-t-sm border-2 overflow-hidden"
        style={{
          borderColor: "#4A4335",
          clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0% 100%)",
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-500"
          style={{
            height: `${pct}%`,
            background: low
              ? "linear-gradient(180deg, #D9673F, #B23A21)"
              : `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})`,
          }}
        />
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { key: "commandes", label: "Commandes", icon: Bell },
  { key: "invites", label: "Invités", icon: Users },
  { key: "musique", label: "Musique", icon: Music2 },
  { key: "boissons", label: "Boissons", icon: Wine },
];

function Logo({ compact = false }) {
  return (
    <div className="flex flex-col leading-none select-none">
      <span
        style={{
          fontFamily: "'Caveat', cursive",
          color: GOLD_LIGHT,
          fontSize: compact ? 20 : 26,
        }}
      >
        Chez les
      </span>
      <span
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          color: CREAM,
          fontSize: compact ? 22 : 30,
          letterSpacing: "0.04em",
          marginTop: -4,
        }}
      >
        PIECHNOTTE
      </span>
    </div>
  );
}

function getInitials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

export default function AperoManager() {
  const [view, setView] = useState("accueil");
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminError, setAdminError] = useState("");
  const [role, setRole] = useState("invite");
  const [guestIdentity, setGuestIdentity] = useState(
    () => localStorage.getItem("piechnote-guest-name") || ""
  );
  const [guestDraft, setGuestDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const [guests, setGuests] = useState([]);
  const [guestName, setGuestName] = useState("");

  const [tracks, setTracks] = useState([]);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtist, setTrackArtist] = useState("");

  const [drinks, setDrinks] = useState([]);
  const [drinkName, setDrinkName] = useState("");
  const [drinkQty, setDrinkQty] = useState("");
  const [drinkUnit, setDrinkUnit] = useState("");
  const [drinkSeuil, setDrinkSeuil] = useState("");

  const [orders, setOrders] = useState([]);
  const [orderGuest, setOrderGuest] = useState("");
  const [orderDrinkId, setOrderDrinkId] = useState("");
  const [orderQty, setOrderQty] = useState(1);

  const [banner, setBanner] = useState(null);
  const bannerTimeout = useRef(null);
  const seenOrderIds = useRef(new Set());
  const drinksRef = useRef([]);
  const tracksRef = useRef([]);

  useEffect(() => {
    drinksRef.current = drinks;
  }, [drinks]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const isAdmin = role === "admin";

  const triggerBanner = (text) => {
    clearTimeout(bannerTimeout.current);
    setBanner(text);
    playDing();
    bannerTimeout.current = setTimeout(() => setBanner(null), 5000);
  };

  const refreshAll = async () => {
    const [g, t, d, o] = await Promise.all([
      storageGet(KEYS.guests),
      storageGet(KEYS.tracks),
      storageGet(KEYS.drinks),
      storageGet(KEYS.orders),
    ]);

    if (g) setGuests(g);
    if (t) setTracks(t);
    if (d) setDrinks(d);

    if (o) {
      const newPending = o.filter(
        (x) =>
          x.status === "pending" && !seenOrderIds.current.has(x.id)
      );
      o.forEach((x) => seenOrderIds.current.add(x.id));

      if (isAdmin && newPending.length) {
        const last = newPending[newPending.length - 1];
        triggerBanner(
          `${last.guestName} demande ${last.qty > 1 ? `${last.qty}× ` : ""}${last.drinkName}`
        );
      }
      setOrders(o);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [g, t, d, o] = await Promise.all([
        storageGet(KEYS.guests),
        storageGet(KEYS.tracks),
        storageGet(KEYS.drinks),
        storageGet(KEYS.orders),
      ]);

      if (!mounted) return;

      const initGuests = g || DEFAULT_GUESTS;
      const initTracks = (t || DEFAULT_TRACKS).map((x) => ({
        ...x,
        voters: Array.isArray(x.voters) ? x.voters : [],
      }));
      const initDrinks = d || DEFAULT_DRINKS;
      const initOrders = o || [];

      setGuests(initGuests);
      setTracks(initTracks);
      setDrinks(initDrinks);
      setOrders(initOrders);

      seenOrderIds.current = new Set(initOrders.map((x) => x.id));

      if (!g) storageSet(KEYS.guests, initGuests);
      if (!t) storageSet(KEYS.tracks, initTracks);
      if (!d) storageSet(KEYS.drinks, initDrinks);
      if (!o) storageSet(KEYS.orders, initOrders);

      setLoading(false);
    })();

    const interval = setInterval(refreshAll, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
      clearTimeout(bannerTimeout.current);
    };
  }, [isAdmin]);

  const loginAdmin = (e) => {
    e.preventDefault();
    if (adminPin === ADMIN_PIN) {
      setRole("admin");
      setShowAdmin(false);
      setAdminPin("");
      setAdminError("");
      setView("commandes");
    } else {
      setAdminError("Code incorrect.");
    }
  };

  const logoutAdmin = () => {
    setRole("invite");
    setView("accueil");
  };

  const saveGuestIdentity = (e) => {
    e.preventDefault();
    const clean = guestDraft.trim();
    if (!clean) return;
    setGuestIdentity(clean);
    localStorage.setItem("piechnote-guest-name", clean);
    setGuestDraft("");
  };

  const addGuest = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    const next = [
      ...guests,
      { id: Date.now(), name: guestName.trim(), status: "peutetre" },
    ];
    setGuests(next);
    storageSet(KEYS.guests, next);
    setGuestName("");
  };

  const cycleStatus = (id) => {
    const next = guests.map((g) => {
      if (g.id !== id) return g;
      const idx = RSVP_STATES.findIndex((s) => s.key === g.status);
      return {
        ...g,
        status: RSVP_STATES[(idx + 1) % RSVP_STATES.length].key,
      };
    });
    setGuests(next);
    storageSet(KEYS.guests, next);
  };

  const removeGuest = (id) => {
    const next = guests.filter((g) => g.id !== id);
    setGuests(next);
    storageSet(KEYS.guests, next);
  };

  const addTrack = (e) => {
    e.preventDefault();
    if (!trackTitle.trim()) return;

    const next = [
      ...tracks,
      {
        id: Date.now(),
        title: trackTitle.trim(),
        artist: trackArtist.trim() || "Inconnu",
        votes: 0,
        voters: [],
      },
    ];

    setTracks(next);
    storageSet(KEYS.tracks, next);
    setTrackTitle("");
    setTrackArtist("");
  };

  const vote = (id) => {
    const voter = guestIdentity.trim();
    if (!voter) {
      setView("musique");
      return;
    }

    const current = tracksRef.current.find((t) => t.id === id);
    if (!current) return;

    const voters = Array.isArray(current.voters) ? current.voters : [];
    const normalized = voter.toLowerCase();

    if (voters.map((x) => x.toLowerCase()).includes(normalized)) {
      triggerBanner("Tu as déjà voté pour ce titre.");
      return;
    }

    const next = tracksRef.current.map((t) =>
      t.id === id
        ? {
            ...t,
            votes: (t.votes || 0) + 1,
            voters: [...(Array.isArray(t.voters) ? t.voters : []), voter],
          }
        : t
    );

    setTracks(next);
    storageSet(KEYS.tracks, next);
  };

  const removeTrack = (id) => {
    const next = tracks.filter((t) => t.id !== id);
    setTracks(next);
    storageSet(KEYS.tracks, next);
  };

  const resetVotes = () => {
    const next = tracks.map((t) => ({ ...t, votes: 0, voters: [] }));
    setTracks(next);
    storageSet(KEYS.tracks, next);
  };

  const addDrink = (e) => {
    e.preventDefault();
    if (!drinkName.trim() || !drinkQty) return;

    const next = [
      ...drinks,
      {
        id: Date.now(),
        name: drinkName.trim(),
        qty: Math.max(0, Number(drinkQty)),
        unit: drinkUnit.trim() || "unités",
        seuil: Math.max(1, Number(drinkSeuil) || 1),
      },
    ];

    setDrinks(next);
    storageSet(KEYS.drinks, next);
    setDrinkName("");
    setDrinkQty("");
    setDrinkUnit("");
    setDrinkSeuil("");
  };

  const adjustQtyIn = (list, id, delta) =>
    list.map((d) =>
      d.id === id ? { ...d, qty: Math.max(0, d.qty + delta) } : d
    );

  const adjustQty = (id, delta) => {
    const next = adjustQtyIn(drinksRef.current, id, delta);
    setDrinks(next);
    storageSet(KEYS.drinks, next);
  };

  const removeDrink = (id) => {
    const next = drinks.filter((d) => d.id !== id);
    setDrinks(next);
    storageSet(KEYS.drinks, next);
  };

  const addOrder = (e) => {
    e.preventDefault();

    const drink = drinksRef.current.find(
      (d) => d.id === Number(orderDrinkId)
    );
    if (!drink || drink.qty <= 0) {
      triggerBanner("Cette boisson n'est plus disponible.");
      return;
    }

    const qty = Math.max(1, Number(orderQty) || 1);
    if (qty > drink.qty) {
      triggerBanner(`Il ne reste que ${drink.qty} ${drink.unit}.`);
      return;
    }

    const name = (orderGuest.trim() || guestIdentity.trim() || "Un invité");

    const newOrder = {
      id: Date.now(),
      guestName: name,
      drinkName: drink.name,
      drinkId: drink.id,
      qty,
      status: "pending",
      time: new Date().toISOString(),
    };

    const next = [newOrder, ...orders];
    seenOrderIds.current.add(newOrder.id);
    setOrders(next);
    storageSet(KEYS.orders, next);

    triggerBanner(
      `${name} demande ${qty > 1 ? `${qty}× ` : ""}${drink.name}`
    );

    setOrderGuest("");
    setOrderDrinkId("");
    setOrderQty(1);
  };

  const serveOrder = (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order || order.status !== "pending") return;

    const drink = drinksRef.current.find((d) => d.id === order.drinkId);
    if (!drink) return;

    const qty = Math.max(1, Number(order.qty) || 1);
    if (drink.qty < qty) {
      triggerBanner("Stock insuffisant pour servir cette commande.");
      return;
    }

    const nextDrinks = adjustQtyIn(drinksRef.current, order.drinkId, -qty);
    setDrinks(nextDrinks);
    storageSet(KEYS.drinks, nextDrinks);

    const nextOrders = orders.map((o) =>
      o.id === id
        ? { ...o, status: "servie", servedAt: new Date().toISOString() }
        : o
    );

    setOrders(nextOrders);
    storageSet(KEYS.orders, nextOrders);
  };

  const cancelOrder = (id) => {
    const next = orders.map((o) =>
      o.id === id
        ? { ...o, status: "annulee", cancelledAt: new Date().toISOString() }
        : o
    );
    setOrders(next);
    storageSet(KEYS.orders, next);
  };

  const clearServedOrders = () => {
    const next = orders.filter((o) => o.status === "pending");
    setOrders(next);
    storageSet(KEYS.orders, next);
  };

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders]
  );

  const confirmedCount = guests.filter(
    (g) => g.status === "confirme"
  ).length;

  const lowStock = drinks.filter((d) => d.qty <= d.seuil);

  const sortedTracks = useMemo(
    () => [...tracks].sort((a, b) => (b.votes || 0) - (a.votes || 0)),
    [tracks]
  );

  const selectedDrink = drinks.find(
    (d) => d.id === Number(orderDrinkId)
  );

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: INK }}
      >
        <Loader2 className="animate-spin" size={28} color={GOLD} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        background: INK,
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes flicker {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .nav-link { position: relative; }
        .nav-link.active::after {
          content:'';
          position:absolute;
          left:0;
          right:0;
          bottom:-6px;
          height:2px;
          background:${GOLD};
        }
      `}</style>

      {banner && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] px-5 py-4 flex items-center justify-between shadow-lg"
          style={{
            background: GOLD,
            color: INK,
            animation: "slideDown 0.35s ease-out",
          }}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <span className="font-semibold text-sm">{banner}</span>
          </div>
          <button onClick={() => setBanner(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {showAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setShowAdmin(false)}
        >
          <form
            onSubmit={loginAdmin}
            className="rounded-2xl p-6 max-w-xs w-full"
            style={{
              background: PANEL,
              border: `1px solid ${LINE}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(201,150,46,0.12)" }}
              >
                <Lock size={20} color={GOLD_LIGHT} />
              </div>
            </div>
            <h2
              className="text-center text-lg mb-1"
              style={{
                color: CREAM,
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              Mode gestion
            </h2>
            <p className="text-center text-xs mb-5" style={{ color: MUTED }}>
              Accès réservé à l'organisateur
            </p>

            <input
              autoFocus
              value={adminPin}
              onChange={(e) => {
                setAdminPin(e.target.value);
                setAdminError("");
              }}
              type="password"
              inputMode="numeric"
              placeholder="Code"
              className="w-full px-4 py-3 rounded-lg outline-none text-center tracking-[0.35em]"
              style={{
                background: INK,
                color: CREAM,
                border: `1px solid ${adminError ? RED : LINE}`,
              }}
            />

            {adminError && (
              <p className="text-xs mt-2 text-center" style={{ color: RED }}>
                {adminError}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-4 py-2.5 rounded-lg font-semibold text-sm"
              style={{ background: GOLD, color: INK }}
            >
              Ouvrir la gestion
            </button>
          </form>
        </div>
      )}

      {showShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowShare(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-xs w-full text-center"
            style={{ background: PANEL, border: `1px solid ${LINE}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-xs uppercase tracking-wide mb-3"
              style={{ color: GOLD_LIGHT, letterSpacing: "0.15em" }}
            >
              Scanner pour rejoindre
            </p>

            <div className="bg-white p-3 rounded-xl inline-block mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(
                  shareUrl
                )}`}
                alt="QR code d'accès à l'appli"
                width={180}
                height={180}
              />
            </div>

            <p
              className="text-xs mb-4 break-all"
              style={{ color: MUTED }}
            >
              {shareUrl}
            </p>

            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium mb-2"
              style={{ background: GOLD, color: INK }}
            >
              <Copy size={14} />
              {copied ? "Lien copié !" : "Copier le lien"}
            </button>

            <button
              onClick={() => setShowShare(false)}
              className="text-xs"
              style={{ color: MUTED }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3"
        style={{
          background:
            view === "accueil"
              ? "linear-gradient(180deg, rgba(6,8,9,0.85), rgba(6,8,9,0))"
              : INK,
          borderBottom:
            view === "accueil" ? "none" : `1px solid ${LINE}`,
        }}
      >
        <button onClick={() => setView("accueil")}>
          <Logo compact />
        </button>

        <nav className="hidden sm:flex items-center gap-6">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={`nav-link text-xs tracking-widest uppercase font-medium ${
                view === n.key ? "active" : ""
              }`}
              style={{
                color: view === n.key ? CREAM : MUTED,
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "rgba(127,166,107,0.12)",
                color: GREEN,
                border: `1px solid ${LINE}`,
              }}
            >
              <ShieldCheck size={14} />
              Gestion
              <LogOut size={13} />
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowAdmin(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  color: MUTED,
                  border: `1px solid ${LINE}`,
                }}
              >
                <Lock size={13} />
                Gestion
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: PANEL,
                  color: GOLD_LIGHT,
                  border: `1px solid ${LINE}`,
                }}
              >
                <QrCode size={14} />
                Inviter
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden flex items-stretch"
        style={{ background: INK, borderTop: `1px solid ${LINE}` }}
      >
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          const active = view === n.key;
          const badge =
            n.key === "commandes" ? pendingOrders.length : 0;

          return (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 relative"
            >
              <Icon
                size={18}
                color={active ? GOLD : MUTED}
              />
              <span
                className="text-[10px]"
                style={{ color: active ? CREAM : MUTED }}
              >
                {n.label}
              </span>
              {!!badge && (
                <span
                  className="absolute top-1 right-1/3 w-2 h-2 rounded-full"
                  style={{ background: RED }}
                />
              )}
            </button>
          );
        })}
      </div>

      {view === "accueil" && (
        <div className="relative min-h-screen flex flex-col">
          <NightBackdrop />
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
            <div className="relative flex items-center justify-center mb-6">
              <RoughRingBadge />
              <div className="absolute flex flex-col items-center px-8">
                <span
                  style={{
                    fontFamily: "'Caveat', cursive",
                    color: GOLD_LIGHT,
                    fontSize: 30,
                  }}
                >
                  Chez les
                </span>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: CREAM,
                    fontSize: 36,
                    letterSpacing: "0.03em",
                    marginTop: -6,
                  }}
                >
                  PIECHNOTTE
                </span>
                <div
                  className="w-16 h-px my-2"
                  style={{ background: GOLD }}
                />
                <div
                  className="flex items-center gap-4 my-1"
                  style={{ color: GOLD }}
                >
                  <UtensilsCrossed size={18} />
                  <Wine size={18} />
                  <Music2 size={18} />
                </div>
                <p
                  className="text-[11px] tracking-[0.2em] uppercase mt-2"
                  style={{ color: GOLD_LIGHT }}
                >
                  Bien plus qu'un apéro,
                  <br />
                  une expérience
                </p>
              </div>
            </div>

            <button
              onClick={() => setView("commandes")}
              className="mt-4 px-8 py-3 rounded-full text-sm font-semibold tracking-wide flex items-center gap-2"
              style={{
                background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: INK,
              }}
            >
              <Bell size={16} />
              ENTRER
            </button>

            {!guestIdentity && (
              <button
                onClick={() => setView("commandes")}
                className="mt-3 text-xs"
                style={{ color: MUTED }}
              >
                Je suis invité →
              </button>
            )}

            {guestIdentity && (
              <p className="mt-3 text-xs" style={{ color: MUTED }}>
                Connecté en tant que{" "}
                <span style={{ color: GOLD_LIGHT }}>
                  {guestIdentity}
                </span>
              </p>
            )}
          </div>

          <div
            className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-px"
            style={{ background: LINE }}
          >
            {[
              {
                key: "commandes",
                label: "Commandes",
                desc: "Demande une boisson",
                icon: Bell,
              },
              {
                key: "invites",
                label: "Invités",
                desc: "Qui vient ce soir",
                icon: Users,
              },
              {
                key: "musique",
                label: "Musique",
                desc: "Propose ton titre",
                icon: Music2,
              },
              {
                key: "boissons",
                label: "Boissons",
                desc: "Cocktails, softs...",
                icon: Wine,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => setView(f.key)}
                  className="flex items-center gap-3 px-5 py-5 text-left"
                  style={{ background: INK }}
                >
                  <Icon size={18} color={GOLD} />
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: CREAM }}
                    >
                      {f.label}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: MUTED }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view !== "accueil" && (
        <div className="max-w-2xl mx-auto px-5 pt-24 pb-24">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className="text-xs tracking-[0.3em] uppercase mb-1"
                  style={{ color: GOLD_LIGHT }}
                >
                  Chez les Piechnotte
                </p>
                <h1
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: CREAM,
                    fontSize: 34,
                    letterSpacing: "0.02em",
                  }}
                >
                  {NAV_ITEMS.find((n) => n.key === view)?.label}
                </h1>
              </div>
              {isAdmin && (
                <button
                  onClick={refreshAll}
                  className="p-2 rounded-lg"
                  style={{
                    color: MUTED,
                    border: `1px solid ${LINE}`,
                  }}
                  title="Actualiser"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>

            <p className="text-sm mt-1" style={{ color: MUTED }}>
              {confirmedCount} confirmé
              {confirmedCount > 1 ? "s" : ""} ·{" "}
              {pendingOrders.length} commande
              {pendingOrders.length !== 1 ? "s" : ""} en attente ·{" "}
              {lowStock.length > 0
                ? `${lowStock.length} stock${
                    lowStock.length > 1 ? "s" : ""
                  } bas`
                : "stocks ok"}
            </p>
          </div>

          {view === "commandes" && (
            <div>
              {!guestIdentity && !isAdmin && (
                <form
                  onSubmit={saveGuestIdentity}
                  className="mb-5 p-4 rounded-xl"
                  style={{
                    background: PANEL,
                    border: `1px solid ${LINE}`,
                  }}
                >
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: CREAM }}
                  >
                    Comment tu t'appelles ?
                  </p>
                  <p className="text-xs mb-3" style={{ color: MUTED }}>
                    Ton prénom permettra de retrouver tes commandes et tes
                    votes.
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={guestDraft}
                      onChange={(e) => setGuestDraft(e.target.value)}
                      placeholder="Prénom"
                      className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm"
                      style={{
                        background: INK,
                        color: CREAM,
                        border: `1px solid ${LINE}`,
                      }}
                    />
                    <button
                      type="submit"
                      className="px-4 rounded-lg font-medium text-sm"
                      style={{ background: GOLD, color: INK }}
                    >
                      Valider
                    </button>
                  </div>
                </form>
              )}

              <form onSubmit={addOrder} className="space-y-2 mb-5">
                <div className="flex gap-2">
                  <input
                    value={isAdmin ? orderGuest : guestIdentity}
                    onChange={(e) =>
                      isAdmin && setOrderGuest(e.target.value)
                    }
                    readOnly={!isAdmin}
                    placeholder="Prénom"
                    className="w-32 px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  />

                  <select
                    value={orderDrinkId}
                    onChange={(e) => setOrderDrinkId(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: PANEL,
                      color: orderDrinkId ? CREAM : MUTED,
                      border: `1px solid ${LINE}`,
                    }}
                  >
                    <option value="">Choisir une boisson...</option>
                    {drinks.map((d) => (
                      <option
                        key={d.id}
                        value={d.id}
                        disabled={d.qty <= 0}
                      >
                        {d.name}
                        {d.qty <= 0
                          ? " — épuisé"
                          : ` — ${d.qty} ${d.unit}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <select
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="w-32 px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option
                        key={n}
                        value={n}
                        disabled={selectedDrink && n > selectedDrink.qty}
                      >
                        {n}×
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={!guestIdentity && !isAdmin}
                    className="flex-1 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: GOLD, color: INK }}
                  >
                    <Bell size={16} />
                    Demander
                  </button>
                </div>

                {selectedDrink && (
                  <p
                    className="text-xs px-1"
                    style={{
                      color:
                        selectedDrink.qty <= selectedDrink.seuil
                          ? RED
                          : MUTED,
                    }}
                  >
                    {selectedDrink.qty} {selectedDrink.unit} disponibles
                    {selectedDrink.qty <= selectedDrink.seuil &&
                      " · stock bientôt épuisé"}
                  </p>
                )}
              </form>

              {isAdmin && pendingOrders.length > 0 && (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-xs uppercase tracking-wide"
                      style={{ color: GOLD_LIGHT }}
                    >
                      En attente
                    </p>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: "rgba(201,150,46,0.12)",
                        color: GOLD_LIGHT,
                      }}
                    >
                      {pendingOrders.length}
                    </span>
                  </div>

                  {pendingOrders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
                      style={{
                        background: PANEL,
                        borderLeft: `3px solid ${GOLD}`,
                      }}
                    >
                      <div className="min-w-0">
                        <p style={{ color: CREAM }}>
                          {o.guestName}
                          <span style={{ color: MUTED }}> → </span>
                          {o.qty > 1 ? `${o.qty}× ` : ""}
                          {o.drinkName}
                        </p>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: MUTED }}
                        >
                          {new Date(o.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => cancelOrder(o.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: INK,
                            color: MUTED,
                          }}
                          title="Annuler"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => serveOrder(o.id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium"
                          style={{
                            background: GREEN,
                            color: INK,
                          }}
                        >
                          <Check size={14} />
                          Servie
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isAdmin && (
                <div className="mb-6">
                  <p
                    className="text-xs uppercase tracking-wide mb-2"
                    style={{ color: GOLD_LIGHT }}
                  >
                    Mes commandes
                  </p>

                  {orders
                    .filter(
                      (o) =>
                        guestIdentity &&
                        o.guestName.toLowerCase() ===
                          guestIdentity.toLowerCase()
                    )
                    .slice(0, 8)
                    .map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg mb-2"
                        style={{
                          background: PANEL,
                          border: `1px solid ${LINE}`,
                        }}
                      >
                        <span style={{ color: CREAM }}>
                          {o.qty > 1 ? `${o.qty}× ` : ""}
                          {o.drinkName}
                        </span>
                        <span
                          className="text-xs"
                          style={{
                            color:
                              o.status === "servie"
                                ? GREEN
                                : o.status === "annulee"
                                ? RED
                                : GOLD_LIGHT,
                          }}
                        >
                          {o.status === "servie"
                            ? "Servie ✓"
                            : o.status === "annulee"
                            ? "Annulée"
                            : "En attente"}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {isAdmin &&
                orders.filter((o) => o.status === "servie").length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-xs uppercase tracking-wide"
                        style={{ color: MUTED }}
                      >
                        Historique
                      </p>
                      <button
                        onClick={clearServedOrders}
                        className="text-xs flex items-center gap-1"
                        style={{ color: MUTED }}
                      >
                        <RotateCcw size={12} />
                        Nettoyer
                      </button>
                    </div>

                    {orders
                      .filter((o) => o.status === "servie")
                      .slice(0, 12)
                      .map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between px-4 py-2.5 rounded-lg opacity-50"
                          style={{ background: PANEL }}
                        >
                          <p style={{ color: CREAM }}>
                            {o.guestName} →{" "}
                            {o.qty > 1 ? `${o.qty}× ` : ""}
                            {o.drinkName}
                          </p>
                          <Check size={14} color={GREEN} />
                        </div>
                      ))}
                  </div>
                )}
            </div>
          )}

          {view === "invites" && (
            <div>
              {!isAdmin ? (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    background: PANEL,
                    border: `1px solid ${LINE}`,
                  }}
                >
                  <Users size={24} color={GOLD} className="mb-3" />
                  <p
                    className="text-sm font-medium"
                    style={{ color: CREAM }}
                  >
                    {confirmedCount} invité
                    {confirmedCount !== 1 ? "s" : ""} confirmé
                    {confirmedCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>
                    La gestion de la liste est réservée à l'organisateur.
                  </p>
                </div>
              ) : (
                <>
                  <form onSubmit={addGuest} className="flex gap-2 mb-5">
                    <input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ajouter un invité..."
                      className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm"
                      style={{
                        background: PANEL,
                        color: CREAM,
                        border: `1px solid ${LINE}`,
                      }}
                    />
                    <button
                      type="submit"
                      className="px-4 rounded-lg font-medium text-sm"
                      style={{ background: GOLD, color: INK }}
                    >
                      <Plus size={18} />
                    </button>
                  </form>

                  <div className="space-y-2">
                    {guests.map((g) => {
                      const state = RSVP_STATES.find(
                        (s) => s.key === g.status
                      );
                      return (
                        <div
                          key={g.id}
                          className="flex items-center justify-between px-4 py-3 rounded-lg"
                          style={{ background: PANEL }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                              style={{
                                background: "rgba(201,150,46,0.12)",
                                color: GOLD_LIGHT,
                              }}
                            >
                              {getInitials(g.name)}
                            </div>
                            <span style={{ color: CREAM }}>
                              {g.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => cycleStatus(g.id)}
                              className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{
                                background: state.color,
                                color: INK,
                              }}
                            >
                              {state.label}
                            </button>
                            <button
                              onClick={() => removeGuest(g.id)}
                              style={{ color: MUTED }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {view === "musique" && (
            <div>
              {!guestIdentity && !isAdmin && (
                <form
                  onSubmit={saveGuestIdentity}
                  className="mb-5 p-4 rounded-xl"
                  style={{
                    background: PANEL,
                    border: `1px solid ${LINE}`,
                  }}
                >
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: CREAM }}
                  >
                    Entre ton prénom pour voter
                  </p>
                  <div className="flex gap-2 mt-3">
                    <input
                      value={guestDraft}
                      onChange={(e) => setGuestDraft(e.target.value)}
                      placeholder="Prénom"
                      className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm"
                      style={{
                        background: INK,
                        color: CREAM,
                        border: `1px solid ${LINE}`,
                      }}
                    />
                    <button
                      type="submit"
                      className="px-4 rounded-lg font-medium text-sm"
                      style={{ background: GOLD, color: INK }}
                    >
                      OK
                    </button>
                  </div>
                </form>
              )}

              {isAdmin && (
                <form onSubmit={addTrack} className="flex gap-2 mb-3">
                  <input
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="Titre..."
                    className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  />
                  <input
                    value={trackArtist}
                    onChange={(e) => setTrackArtist(e.target.value)}
                    placeholder="Artiste"
                    className="w-32 px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  />
                  <button
                    type="submit"
                    className="px-4 rounded-lg font-medium text-sm"
                    style={{ background: GOLD, color: INK }}
                  >
                    <Plus size={18} />
                  </button>
                </form>
              )}

              <div className="flex items-center justify-between mb-3">
                <p className="text-xs" style={{ color: MUTED }}>
                  {guestIdentity
                    ? `Vote en tant que ${guestIdentity}`
                    : "Classement de la soirée"}
                </p>

                {isAdmin && (
                  <button
                    onClick={resetVotes}
                    className="text-xs flex items-center gap-1"
                    style={{ color: MUTED }}
                  >
                    <RotateCcw size={12} />
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {sortedTracks.map((t, i) => {
                  const voters = Array.isArray(t.voters)
                    ? t.voters
                    : [];
                  const alreadyVoted =
                    guestIdentity &&
                    voters
                      .map((x) => x.toLowerCase())
                      .includes(guestIdentity.toLowerCase());

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between px-4 py-3 rounded-lg"
                      style={{ background: PANEL }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 20,
                            color: GOLD_LIGHT,
                            width: 20,
                          }}
                        >
                          {i + 1}
                        </span>

                        <div className="min-w-0">
                          <p
                            className="truncate"
                            style={{ color: CREAM }}
                          >
                            {t.title}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: MUTED }}
                          >
                            {t.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {!isAdmin && (
                          <button
                            onClick={() => vote(t.id)}
                            disabled={!guestIdentity || alreadyVoted}
                            className="flex items-center gap-1 text-sm px-2 py-1 rounded-full disabled:opacity-40"
                            style={{ color: GOLD }}
                          >
                            <Heart
                              size={14}
                              fill={alreadyVoted ? GOLD : "none"}
                            />
                            {t.votes || 0}
                          </button>
                        )}

                        {isAdmin && (
                          <span
                            className="flex items-center gap-1 text-sm"
                            style={{ color: GOLD }}
                          >
                            <Heart size={14} />
                            {t.votes || 0}
                          </span>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => removeTrack(t.id)}
                            style={{ color: MUTED }}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tracks.length === 0 && (
                  <p
                    className="text-sm text-center py-8"
                    style={{ color: MUTED }}
                  >
                    Aucun titre pour l'instant.
                  </p>
                )}
              </div>
            </div>
          )}

          {view === "boissons" && (
            <div>
              {isAdmin && (
                <form
                  onSubmit={addDrink}
                  className="grid grid-cols-2 gap-2 mb-3"
                >
                  <input
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                    placeholder="Boisson..."
                    className="px-4 py-2.5 rounded-lg outline-none text-sm col-span-2"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  />
                  <input
                    value={drinkQty}
                    onChange={(e) => setDrinkQty(e.target.value)}
                    placeholder="Quantité"
                    type="number"
                    min="0"
                    className="px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  />
                  <input
                    value={drinkUnit}
                    onChange={(e) => setDrinkUnit(e.target.value)}
                    placeholder="Unité (bouteilles...)"
                    className="px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  />
                  <input
                    value={drinkSeuil}
                    onChange={(e) => setDrinkSeuil(e.target.value)}
                    placeholder="Seuil d'alerte"
                    type="number"
                    min="1"
                    className="px-4 py-2.5 rounded-lg outline-none text-sm col-span-2"
                    style={{
                      background: PANEL,
                      color: CREAM,
                      border: `1px solid ${LINE}`,
                    }}
                  />
                  <button
                    type="submit"
                    className="col-span-2 py-2.5 rounded-lg font-medium text-sm"
                    style={{ background: GOLD, color: INK }}
                  >
                    Ajouter au stock
                  </button>
                </form>
              )}

              <div className="space-y-2 mt-4">
                {drinks.map((d) => {
                  const low = d.qty <= d.seuil;
                  const empty = d.qty <= 0;
                  const pct = Math.min(
                    100,
                    (d.qty / (d.seuil * 2 || 1)) * 100
                  );

                  return (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg"
                      style={{ background: PANEL }}
                    >
                      <GlassLevel pct={pct} low={low} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p style={{ color: CREAM }}>{d.name}</p>
                          {low && (
                            <TriangleAlert size={14} color={RED} />
                          )}
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: low ? RED : MUTED }}
                        >
                          {d.qty} {d.unit}
                          {empty
                            ? " · épuisé"
                            : low
                            ? " · stock bas"
                            : ""}
                        </p>
                      </div>

                      {isAdmin ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => adjustQty(d.id, -1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{
                              background: INK,
                              color: CREAM,
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <button
                            onClick={() => adjustQty(d.id, 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{
                              background: INK,
                              color: CREAM,
                            }}
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeDrink(d.id)}
                            className="ml-1"
                            style={{ color: MUTED }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: empty
                              ? "rgba(217,103,63,0.12)"
                              : "rgba(127,166,107,0.12)",
                            color: empty ? RED : GREEN,
                          }}
                        >
                          {empty ? "Épuisé" : "Disponible"}
                        </span>
                      )}
                    </div>
                  );
                })}

                {drinks.length === 0 && (
                  <p
                    className="text-sm text-center py-8"
                    style={{ color: MUTED }}
                  >
                    Aucune boisson en stock.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
