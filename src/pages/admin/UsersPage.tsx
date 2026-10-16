import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, RefreshCw, X, Lock, Unlock, Sparkles, Star, ShieldCheck, CheckCircle2,
  Crown, DollarSign, Wallet, Users, UserCheck, UserX, ArrowUpDown, SlidersHorizontal,
  Coins, Copy, Check, Gift, AlertCircle, Shield, Zap, Flame, ExternalLink, Plus, Edit3,
  Database, Trash2, Archive, History, Calendar, ArrowRight, Clock, Layers, ArrowUpRight,
  RotateCcw, MessageCircle, Tag, FileText, ArrowDownLeft, Phone, CreditCard, Activity,
  Sliders, BadgePercent, ChevronRight, TrendingUp, AlertTriangle, Hash, Mail, Key
} from "lucide-react";
import { supabaseEnabled } from '../../lib/supabase';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { adminApi, invalidateAdminCache } from "../../lib/adminApi";
import { PageTitle, Status, AdminError, money, fmtDate } from "./AdminComponents";
import { formatAccountId, isUserInfluencerOrVip } from "../../lib/data";

const playerStatusLabels:Record<string,string>={ACTIVE:'Ativo',BLOCKED:'Bloqueado',SUSPENDED:'Suspenso',NOT_STARTED:'Não enviado',UNVERIFIED:'Não enviado',PENDING:'Em análise',REVIEW:'Em análise',APPROVED:'Verificado',REJECTED:'Recusado'};

export function getUserAccountId(u: any): string {
  if (!u) return "#000000";
  if (u.accountId && String(u.accountId).trim()) {
    const s = String(u.accountId).trim();
    return s.startsWith('#') ? s : `#${s}`;
  }
  if (u.mid && String(u.mid).trim()) {
    const s = String(u.mid).trim();
    return s.startsWith('#') ? s : `#${s}`;
  }
  if (u.memberId && String(u.memberId).trim()) {
    const s = String(u.memberId).trim();
    return s.startsWith('#') ? s : `#${s}`;
  }
  return formatAccountId(u.uid || u.id);
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  const d = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return String(phone);
}

export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return "";
  const digits = String(cpf).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return String(cpf);
}

export function deriveFriendlyNameFromEmail(email: string | null | undefined): string {
  if (!email || typeof email !== "string") return "";
  const prefix = email.split("@")[0].trim();
  if (!prefix) return "";
  const lower = prefix.toLowerCase();
  if (lower.includes("vickzinhaa")) return "Vickzinhaa";
  if (lower.includes("alineppiatto") || lower.includes("alinepoiatto")) return "Aline Ppiatto";
  if (lower.includes("leticiaf.lima") || lower.includes("leticia")) return "Leticia F. Lima";
  if (lower.includes("igorreynaldo")) return "Igor Reynaldo";
  if (lower.includes("pedromoreira")) return "Pedro Moreira";
  if (lower.includes("gabrielnascimento")) return "Gabriel Nascimento";
  if (lower.includes("karinagraziele")) return "Karina Graziele";
  if (lower.includes("michaela.neves")) return "Michaela Neves";
  if (lower.includes("carolinesousa")) return "Caroline Sousa dos Santos";
  if (lower.includes("rubiarenata")) return "Rubia Renata";
  if (lower.includes("wesleysilva")) return "Wesley Silva";
  if (lower.includes("joaoperessin")) return "Joao Peressin";
  if (lower.includes("nathalypereira")) return "Nathaly Pereira";
  if (lower.includes("deborasilvamelo")) return "Debora Silva Melo";
  if (lower.includes("giovanamelo")) return "Giovana Melo";
  if (lower.includes("limadasilvasabrina")) return "Sabrina Lima da Silva";
  if (lower.includes("moreira.millena")) return "Millena Moreira";
  if (lower.includes("barbosacristina")) return "Cristina Barbosa";
  if (lower.includes("eversonmaschietto")) return "Everson Maschietto";
  if (lower.includes("remalaquias")) return "Re Malaquias";
  if (lower.includes("ianhenrique")) return "Ian Henrique";
  if (lower.includes("giovannisilva")) return "Giovanni Silva";
  if (lower.includes("kvnzada")) return "Kevin Zada";
  if (lower.includes("cappatogloria")) return "Gloria Cappato";
  if (lower.includes("pedroimpactobrasil")) return "Pedro Impacto";
  if (lower.includes("cantinamineira")) return "Cantina Mineira";
  if (lower.includes("michelelopesalmeida")) return "Michele Lopes Almeida";
  if (lower.includes("jamimejoice")) return "Jamime Joice";
  if (lower.includes("gabrielteixeiraeugenio")) return "Gabriel Teixeira Eugenio";
  if (lower.includes("keriana.paula")) return "Keriana Paula";
  if (lower.includes("bielarrudajoici")) return "Biel Arruda";
  if (lower.includes("erica.minies")) return "Erica Minies";
  if (lower.includes("kessiarosa")) return "Kessia Rosa";
  if (lower.includes("gferreiradonascimento")) return "G. Ferreira do Nascimento";
  if (lower.includes("wl170294")) return "WL Jogador";
  if (lower.includes("sitrombini")) return "Si Trombini";
  if (lower.includes("igor_aguiar")) return "Igor Aguiar";
  if (lower.includes("realkayk")) return "Real Kayk";
  if (lower.includes("francaleonardo")) return "Leonardo Franca";
  if (lower.includes("caedu")) return "Caedu";

  let clean = prefix
    .replace(/[._-]+/g, " ")
    .replace(/\b(19\d{2}|20\d{2})\b/g, "")
    .replace(/\d+$/g, "")
    .trim();
  if (!clean) clean = prefix.replace(/[._-]+/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export function getUserDisplayName(u: any): string {
  if (!u) return "Jogador";
  const name = u.displayName || u.name || u.fullName || u.nome || u.cpfApiName || u.username;
  const isGeneric = !name || typeof name !== "string" || !name.trim() || name === "undefined" || name.startsWith("Jogador #") || /^Jogador\s+[A-Z0-9_]{3,}$/i.test(name.trim()) || name.trim() === "Jogador";
  if (!isGeneric) return name.trim();

  const realEmail = getUserEmail(u);
  if (realEmail && !realEmail.startsWith("jogador.") && !realEmail.includes("@zerobet.com")) {
    const derived = deriveFriendlyNameFromEmail(realEmail);
    if (derived) return derived;
  }
  if (name && typeof name === "string" && name.trim() && name !== "undefined" && name !== "Jogador") return name.trim();
  const acc = getUserAccountId(u).replace(/^#/, "");
  if (acc) return `Jogador #${acc}`;
  const uid = String(u.uid || u.id || "");
  if (uid) return `Jogador #${uid.slice(0, 5).toUpperCase()}`;
  return "Jogador";
}

export function getUserEmail(u: any): string {
  if (!u) return "";
  const candidates = [u.email, u.userEmail, u.contactEmail, u.mail, u.affiliateEmail, u.registeredEmail, u.username];
  for (const c of candidates) {
    if (c && typeof c === "string" && c.trim()) {
      const val = c.trim().toLowerCase();
      if (val === "undefined" || val === "null") continue;
      if (!val.startsWith("jogador.") && !val.includes("@zerobet.com") && val.includes("@")) {
        return val;
      }
    }
  }
  // Se só tiver email cadastrado mesmo
  if (u.email && typeof u.email === "string" && u.email.trim()) {
    const val = u.email.trim().toLowerCase();
    if (val !== "undefined" && val !== "null" && val.includes("@")) return val;
  }
  return "";
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "INFLUENCERS" | "ACTIVE" | "BLOCKED" | "HAS_BALANCE" | "HIGH_ROLLERS" | "KYC_APPROVED" | "KYC_PENDING" | "WITHDRAW_LOCKED"
  >("ALL");
  const [sortBy, setSortBy] = useState<"BALANCE" | "NAME" | "RECENT" | "INFLUENCER" | "DEPOSITS">("INFLUENCER");
  const [activeTab, setActiveTab] = useState<"LIST" | "INFLUENCERS_HUB" | "RESTORE_VAULT">("LIST");
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([]);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [promoteSearch, setPromoteSearch] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [quickBalanceUser, setQuickBalanceUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "ALL">("ALL");

  // Estados do Cofre de Restore & Economia de Leituras
  const [leadsStatus, setLeadsStatus] = useState<any>(null);
  const [archivedUsers, setArchivedUsers] = useState<any[]>([]);
  const [restoreQ, setRestoreQ] = useState("");
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [runningRoutine, setRunningRoutine] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ mode: string; title: string; desc: string } | null>(null);

  const serverUsersRef = useRef<Map<string, any>>(new Map());
  const firestoreUsersRef = useRef<Map<string, any>>(new Map());
  const isMountedRef = useRef<boolean>(true);

  // Função pura de reconciliação que mescla o banco local/servidor com o Firestore em tempo real
  const buildAndSetUnifiedUsers = () => {
    if (!isMountedRef.current) return;
    const userMap = new Map<string, any>();

    // 1. Incorpora os jogadores da base do servidor
    for (const [id, u] of serverUsersRef.current.entries()) {
      if (id) {
        userMap.set(id, {
          ...u,
          id,
          uid: id,
          displayName: getUserDisplayName(u),
          name: getUserDisplayName(u),
          email: getUserEmail(u),
          accountId: getUserAccountId(u),
        });
      }
    }

    // 2. Mescla com os dados recebidos em tempo real do Firestore
    for (const [id, fu] of firestoreUsersRef.current.entries()) {
      if (!id) continue;
      const existing = userMap.get(id) || {};
      const isVipOrInf = isUserInfluencerOrVip(existing) || isUserInfluencerOrVip(fu);

      const mergedRaw = { ...existing, ...fu };
      const bestName = (fu.displayName && fu.displayName.trim() && !fu.displayName.startsWith("Jogador #"))
        ? fu.displayName.trim()
        : (fu.name && fu.name.trim() && !fu.name.startsWith("Jogador #"))
          ? fu.name.trim()
          : (existing.displayName && existing.displayName.trim() && !existing.displayName.startsWith("Jogador #"))
            ? existing.displayName.trim()
            : (existing.name && existing.name.trim() && !existing.name.startsWith("Jogador #"))
              ? existing.name.trim()
              : getUserDisplayName(mergedRaw);

      const bestEmail = (fu.email && fu.email.trim() && !fu.email.startsWith("jogador.") && !fu.email.includes("@zerobet.com"))
        ? fu.email.trim().toLowerCase()
        : (existing.email && existing.email.trim() && !existing.email.startsWith("jogador.") && !existing.email.includes("@zerobet.com"))
          ? existing.email.trim().toLowerCase()
          : (fu.userEmail && fu.userEmail.trim())
            ? fu.userEmail.trim().toLowerCase()
            : (existing.userEmail && existing.userEmail.trim())
              ? existing.userEmail.trim().toLowerCase()
              : getUserEmail(mergedRaw);

      const bestAccountId = getUserAccountId(mergedRaw);
      const bestCpf = fu.cpf || existing.cpf || '';
      const bestPhone = fu.phone || existing.phone || '';

      userMap.set(id, {
        ...existing,
        ...fu,
        id,
        uid: id,
        accountId: bestAccountId,
        displayName: bestName,
        name: bestName,
        fullName: bestName,
        email: bestEmail,
        cpf: bestCpf,
        phone: bestPhone,
        walletBalance: fu.walletBalance !== undefined ? Number(fu.walletBalance) : Number(existing.walletBalance ?? 0),
        balance: fu.balance !== undefined ? Number(fu.balance) : Number(existing.balance ?? 0),
        bonusBalance: fu.bonusBalance !== undefined ? Number(fu.bonusBalance) : Number(existing.bonusBalance ?? 0),
        realBalance: fu.realBalance !== undefined ? Number(fu.realBalance) : Number(existing.realBalance ?? 0),
        createdAt: fu.createdAt || existing.createdAt || '',
        influencer: isVipOrInf,
        isInfluencer: isVipOrInf,
        vip: isVipOrInf,
        isVip: isVipOrInf,
        vipMode: isVipOrInf,
        status: fu.status || existing.status || "ACTIVE",
        kycStatus: isVipOrInf ? "APPROVED" : (fu.kycStatus || existing.kycStatus || "NOT_STARTED"),
        withdrawLocked: isVipOrInf ? false : (fu.withdrawLocked !== undefined ? Boolean(fu.withdrawLocked) : Boolean(existing.withdrawLocked)),
      });
    }

    const unified = Array.from(userMap.values()).map((u: any) => {
      const bal = Number(u.walletBalance ?? u.balance ?? 0);
      const dispName = getUserDisplayName(u);
      const email = getUserEmail(u);
      const accId = getUserAccountId(u);
      const isInf = isUserInfluencerOrVip(u);
      return {
        uid: u.uid || u.id,
        id: u.uid || u.id,
        ...u,
        accountId: accId,
        email,
        displayName: dispName,
        name: dispName,
        fullName: dispName,
        walletBalance: bal,
        balance: bal,
        bonusBalance: Number(u.bonusBalance ?? 0),
        realBalance: Number(u.realBalance ?? bal),
        status: u.status || "ACTIVE",
        kycStatus: isInf ? "APPROVED" : (u.kycStatus || "NOT_STARTED"),
        influencer: isInf,
        isInfluencer: isInf,
        vip: isInf,
        isVip: isInf,
        vipMode: isInf,
        withdrawLocked: isInf ? false : Boolean(u.withdrawLocked),
      };
    });

    setUsers(unified);

    // Se o modal do jogador estiver aberto, reflete os dados mais recentes em tempo real
    setSelected((prev: any) => {
      if (!prev) return null;
      const targetId = prev.uid || prev.id;
      const fresh = userMap.get(targetId);
      if (!fresh) return prev;
      return {
        ...prev,
        ...fresh,
        email: getUserEmail(fresh),
        displayName: getUserDisplayName(fresh),
        name: getUserDisplayName(fresh),
        fullName: getUserDisplayName(fresh),
        walletBalance: Number(fresh.walletBalance ?? fresh.balance ?? 0),
        balance: Number(fresh.walletBalance ?? fresh.balance ?? 0),
      };
    });
  };

  const fetchServerUsers = async () => {
    try {
      const url = `/api/admin/users?limit=ALL`;
      const d: any = await adminApi(url);
      const serverUsers = Array.isArray(d?.users) ? d.users : [];
      const sMap = new Map<string, any>();
      for (const u of serverUsers) {
        const id = u.uid || u.id;
        if (id) sMap.set(id, u);
      }
      serverUsersRef.current = sMap;
      buildAndSetUnifiedUsers();
    } catch (apiErr: any) {
      if (supabaseEnabled) {
        setError(apiErr?.message || "Erro ao carregar lista de jogadores.");
      }
      console.warn("[UsersPage adminApi server load]", apiErr);
    }
  };

  const load = async (_nextCursor: string | null = null, _pushHistory = false, _resetPage = false) => {
    setLoading(true); setError("");
    try {
      invalidateAdminCache("/api/admin/users");
      await fetchServerUsers();
      setCursor(null);
    } catch (e: any) {
      setError(e.message || "Erro ao carregar lista de jogadores.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const loadRestoreData = async (queryText = "") => {
    setLoadingRestore(true);
    try {
      const [statusRes, listRes]: [any, any] = await Promise.all([
        adminApi("/api/admin/leads/restore-status"),
        adminApi(`/api/admin/leads/archived?limit=100&q=${encodeURIComponent(queryText || restoreQ)}`)
      ]);
      setLeadsStatus(statusRes);
      setArchivedUsers(listRes.archived || []);
    } catch (e: any) {
      console.warn("[loadRestoreData error]", e);
    } finally {
      if (isMountedRef.current) setLoadingRestore(false);
    }
  };

  useEffect(() => { 
    isMountedRef.current = true;
    setLoading(true);
    void fetchServerUsers().finally(() => {
      if (isMountedRef.current) setLoading(false);
    });
    void loadRestoreData();

    if (!db || supabaseEnabled) return;
    try {
      // Listener em tempo real contínuo no Firestore:
      // Lê snapshot diretamente em memória sem reexecutar requisições de rede REST, eliminando qualquer loop infinito
      const unsub = onSnapshot(collection(db, "users"), (snap) => {
        if (!isMountedRef.current) return;
        const fsMap = new Map<string, any>();
        for (const doc of snap.docs) {
          const data = doc.data();
          const uid = doc.id || data.uid;
          if (uid) {
            fsMap.set(uid, {
              uid,
              id: uid,
              ...data,
            });
          }
        }
        firestoreUsersRef.current = fsMap;
        buildAndSetUnifiedUsers();
        setLoading(false);
      }, (err) => {
        console.warn("[UsersPage realtime listener error]", err);
        if (isMountedRef.current) setLoading(false);
      });

      return () => {
        isMountedRef.current = false;
        if (unsub) unsub();
      };
    } catch (err) {
      console.warn("[UsersPage onSnapshot attach error]", err);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleRunCleanup = async (mode: "SATURDAY_PURGE" | "FRIDAY_7DAYS" | "AUTO") => {
    setRunningRoutine(true);
    setConfirmModal(null);
    try {
      const res: any = await adminApi("/api/admin/leads/run-cleanup", {
        method: "POST",
        body: JSON.stringify({ mode })
      });
      setActionSuccessMsg(
        mode === "SATURDAY_PURGE"
          ? `Limpeza de Sábado concluída! ${res.archivedCount} leads arquivados no cofre. ${res.preservedInfluencers} influenciadores VIP mantidos salvos com sucesso!`
          : `Rotina de 7 Dias concluída! ${res.archivedCount} leads movidos para o cofre de Restore. Economia de ${res.estimatedReadsSaved || (res.archivedCount * 50)} leituras!`
      );
      setTimeout(() => setActionSuccessMsg(null), 7000);
      await Promise.all([load(null, false), loadRestoreData()]);
    } catch (e: any) {
      setError(e.message || "Erro ao executar rotina de leads.");
    } finally {
      setRunningRoutine(false);
    }
  };

  const handleRestoreUser = async (uid: string, asInfluencer = false) => {
    try {
      const endpoint = asInfluencer ? `/api/admin/leads/restore-as-influencer/${uid}` : `/api/admin/leads/restore-user/${uid}`;
      const res: any = await adminApi(endpoint, { method: "POST" });
      setActionSuccessMsg(res.message || (asInfluencer ? "Jogador restaurado e promovido a Influenciador VIP!" : "Jogador restaurado com sucesso para a lista ativa!"));
      setTimeout(() => setActionSuccessMsg(null), 5000);
      setArchivedUsers(prev => prev.filter(u => u.uid !== uid && u.id !== uid));
      await Promise.all([load(null, false), loadRestoreData()]);
    } catch (e: any) {
      setError(e.message || "Erro ao restaurar jogador.");
    }
  };

  const handlePurgeArchivedUser = async (uid: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este lead do cofre de restore?")) return;
    try {
      await adminApi("/api/admin/leads/purge-archived", {
        method: "POST",
        body: JSON.stringify({ uid })
      });
      setActionSuccessMsg("Lead excluído permanentemente do cofre de restore.");
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setArchivedUsers(prev => prev.filter(u => u.uid !== uid && u.id !== uid));
    } catch (e: any) {
      setError(e.message || "Erro ao excluir lead.");
    }
  };

  async function previous() {
    const copy = [...history];
    const prev = copy.pop() ?? null;
    setHistory(copy);
    setCurrentPage(p => Math.max(1, p - 1));
    await load(prev, false, false);
  }

  function handleCopy(text: string, uid: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    }
  }

  const handleUpdateUserLocally = (updated: any) => {
    const targetUid = updated.uid || updated.id;
    if (targetUid) {
      if (serverUsersRef.current.has(targetUid)) {
        serverUsersRef.current.set(targetUid, { ...serverUsersRef.current.get(targetUid), ...updated });
      }
      if (firestoreUsersRef.current.has(targetUid)) {
        firestoreUsersRef.current.set(targetUid, { ...firestoreUsersRef.current.get(targetUid), ...updated });
      }
    }
    setUsers(prev => prev.map(u => {
      if ((u.uid && u.uid === targetUid) || (u.id && u.id === targetUid)) {
        const merged = { ...u, ...updated };
        return {
          ...merged,
          email: getUserEmail(merged),
          displayName: getUserDisplayName(merged),
          name: getUserDisplayName(merged),
          fullName: getUserDisplayName(merged),
          walletBalance: updated.walletBalance !== undefined ? Number(updated.walletBalance) : (updated.balance !== undefined ? Number(updated.balance) : u.walletBalance),
          balance: updated.balance !== undefined ? Number(updated.balance) : (updated.walletBalance !== undefined ? Number(updated.walletBalance) : u.balance),
        };
      }
      return u;
    }));
    if (selected && ((selected.uid && selected.uid === targetUid) || (selected.id && selected.id === targetUid))) {
      setSelected((prev: any) => {
        const merged = { ...prev, ...updated };
        return {
          ...merged,
          email: getUserEmail(merged),
          displayName: getUserDisplayName(merged),
          name: getUserDisplayName(merged),
          fullName: getUserDisplayName(merged),
          walletBalance: updated.walletBalance !== undefined ? Number(updated.walletBalance) : prev.walletBalance,
          balance: updated.balance !== undefined ? Number(updated.balance) : prev.balance,
        };
      });
    }
  };

  // Quick toggle influencer
  async function toggleInfluencerDirect(u: any, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const isCurrentlyVip = isUserInfluencerOrVip(u);
    const nextVal = !isCurrentlyVip;
    const targetUid = u.uid || u.id;
    try {
      await adminApi(`/api/admin/users/${targetUid}`, {
        method: "PATCH",
        body: JSON.stringify({
          influencer: nextVal,
          isInfluencer: nextVal,
          vip: nextVal,
          isVip: nextVal,
          vipMode: nextVal,
          modoInfluenciador: nextVal,
          modoVip: nextVal,
          vipTier: nextVal ? "INFLUENCER_VIP" : "STANDARD",
          firstWithdrawalFeePaid: nextVal,
          kycApprovedFeePaid: nextVal,
          kycFastTrackPaid: nextVal,
          accountApprovalFeePaid: nextVal,
          antiFraudFeePaid: nextVal,
          liquidationFeePaid: nextVal,
          fullWithdrawalUnlocked: nextVal,
          withdrawLocked: nextVal ? false : u.withdrawLocked,
          kycStatus: nextVal ? "APPROVED" : u.kycStatus,
        })
      });
      handleUpdateUserLocally({
        uid: targetUid,
        influencer: nextVal,
        isInfluencer: nextVal,
        vip: nextVal,
        isVip: nextVal,
        vipMode: nextVal,
        modoInfluenciador: nextVal,
        modoVip: nextVal,
        vipTier: nextVal ? "INFLUENCER_VIP" : "STANDARD",
        firstWithdrawalFeePaid: nextVal,
        kycApprovedFeePaid: nextVal,
        kycFastTrackPaid: nextVal,
        accountApprovalFeePaid: nextVal,
        antiFraudFeePaid: nextVal,
        liquidationFeePaid: nextVal,
        fullWithdrawalUnlocked: nextVal,
        withdrawLocked: nextVal ? false : u.withdrawLocked,
        kycStatus: nextVal ? "APPROVED" : u.kycStatus,
      });
      setActionSuccessMsg(
        nextVal
          ? `👑 Modo Influenciador VIP ATIVADO para ${getUserDisplayName(u)}! Vantagens aplicadas: Saque 0% taxas, 100% liberado e KYC isento.`
          : `Modo influenciador desativado para ${getUserDisplayName(u)}.`
      );
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Falha ao alterar perfil de influenciador.");
    }
  }

  // Quick Grant balance to influencer for stream/tests
  async function quickGrantInfluencer(u: any, amount: number) {
    const targetUid = u.uid || u.id;
    try {
      const d: any = await adminApi(`/api/admin/users/${targetUid}/wallet-adjustment`, {
        method: "POST",
        body: JSON.stringify({ mode: "CREDIT", amount, reason: `Saldo Demonstração/Live VIP (${amount >= 0 ? '+' : ''}R$ ${amount})` })
      });
      handleUpdateUserLocally({ uid: targetUid, walletBalance: d.after, balance: d.after });
      setActionSuccessMsg(`Saldo de R$ ${amount.toFixed(2)} creditado para ${getUserDisplayName(u)}!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Erro ao conceder saldo.");
    }
  }

  // Helper para normalização de busca (sem acentos e minúsculo)
  const normalizeSearch = (str: string) => {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtered & Sorted list com busca instantânea inteligente e multivariável
  const filteredUsers = useMemo(() => {
    const qRaw = q.trim();
    const qNorm = normalizeSearch(qRaw);
    const qDigits = qRaw.replace(/\D/g, "");
    
    // Suporte especial para pesquisa por MID (ex: "mid 000001", "mid:000001", "mid #1e0c14", "#000001", "000001")
    const midClean = qNorm.replace(/^(?:mid|member\s*id|id\s*da\s*conta|conta|id)[:\s#_-]*/i, "").trim();
    const cleanQ = qNorm.replace(/^#/, "").trim();

    return users.filter(u => {
      if (qNorm) {
        const uEmail = normalizeSearch(getUserEmail(u));
        const uDisplayName = normalizeSearch(getUserDisplayName(u));
        const uName = normalizeSearch(String(u.name || u.fullName || u.nome || ""));
        const uUid = String(u.uid || u.id || "").toLowerCase();
        const uAcc = getUserAccountId(u).toLowerCase();
        const uAccClean = uAcc.replace(/^#/, "");
        const uMid = String(u.mid || u.memberId || "").toLowerCase().replace(/^#/, "");
        const rawCpf = String(u.cpf || u.document || "");
        const uCpfDigits = rawCpf.replace(/\D/g, "");
        const uCpfFormatted = normalizeSearch(formatCpf(rawCpf));
        const rawPhone = String(u.phone || "");
        const uPhoneDigits = rawPhone.replace(/\D/g, "");
        const uPhoneFormatted = normalizeSearch(formatPhone(rawPhone));
        const uPixKey = normalizeSearch(String(u.pixKey || u.pix_key || ""));
        const uNotes = normalizeSearch(String(u.notes || ""));
        const uAffCode = normalizeSearch(String(u.affiliateCode || ""));
        const uCity = normalizeSearch(String(u.city || u.cidade || ""));
        const uState = normalizeSearch(String(u.state || u.estado || u.uf || ""));
        const uAddress = normalizeSearch(String(u.address || u.endereco || ""));
        const uCep = String(u.cep || "").replace(/\D/g, "");
        const uTags = Array.isArray(u.tags) ? normalizeSearch(u.tags.join(" ")) : normalizeSearch(String(u.tags || ""));
        const uRole = normalizeSearch(String(u.role || ""));

        // 1. Match direto por MID / Conta ou ID (independente de prefixos "mid", "#", etc.)
        const midMatch = Boolean(
          midClean && (
            uAccClean.includes(midClean) ||
            uAcc.includes(midClean) ||
            uMid.includes(midClean) ||
            uUid.includes(midClean) ||
            uUid.slice(0, 8).includes(midClean)
          )
        );

        // 2. Match textual geral normalizado em qualquer informação cadastral
        const textMatch =
          uDisplayName.includes(qNorm) ||
          uName.includes(qNorm) ||
          uEmail.includes(qNorm) ||
          uUid.includes(qNorm) ||
          uAcc.includes(qNorm) ||
          (Boolean(cleanQ) && uAccClean.includes(cleanQ)) ||
          uPixKey.includes(qNorm) ||
          uNotes.includes(qNorm) ||
          uAffCode.includes(qNorm) ||
          uCpfFormatted.includes(qNorm) ||
          uPhoneFormatted.includes(qNorm) ||
          uCity.includes(qNorm) ||
          uState.includes(qNorm) ||
          uAddress.includes(qNorm) ||
          uTags.includes(qNorm) ||
          uRole.includes(qNorm);

        // 3. Match numérico para CPF, Telefone, CEP ou Dígitos do MID / ID
        const digitsMatch = Boolean(
          qDigits && qDigits.length >= 2 && (
            uCpfDigits.includes(qDigits) ||
            uPhoneDigits.includes(qDigits) ||
            uAccClean.includes(qDigits) ||
            (uCep && uCep.includes(qDigits)) ||
            uUid.includes(qDigits)
          )
        );

        if (!midMatch && !textMatch && !digitsMatch) {
          return false;
        }
      }

      const bal = Number(u.walletBalance ?? u.balance ?? 0);
      const isInf = isUserInfluencerOrVip(u);
      if (filter === "INFLUENCERS") return isInf;
      if (filter === "ACTIVE") return (u.status || "ACTIVE") === "ACTIVE";
      if (filter === "BLOCKED") return u.status === "BLOCKED" || u.status === "SUSPENDED";
      if (filter === "HAS_BALANCE") return bal > 0;
      if (filter === "HIGH_ROLLERS") return bal >= 500 || Number(u.totalDeposits || 0) >= 500;
      if (filter === "KYC_APPROVED") return isInf || u.kycStatus === "APPROVED";
      if (filter === "KYC_PENDING") return !isInf && (u.kycStatus === "PENDING" || u.kycStatus === "REVIEW");
      if (filter === "WITHDRAW_LOCKED") return !!u.withdrawLocked;
      return true;
    });
  }, [users, filter, q]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortBy === "INFLUENCER") {
        const aInf = isUserInfluencerOrVip(a);
        const bInf = isUserInfluencerOrVip(b);
        if (bInf !== aInf) return bInf ? 1 : -1;
        return Number(b.walletBalance ?? b.balance ?? 0) - Number(a.walletBalance ?? a.balance ?? 0);
      }
      if (sortBy === "BALANCE") {
        return Number(b.walletBalance ?? b.balance ?? 0) - Number(a.walletBalance ?? a.balance ?? 0);
      }
      if (sortBy === "NAME") {
        return getUserDisplayName(a).localeCompare(getUserDisplayName(b));
      }
      if (sortBy === "DEPOSITS") {
        return Number(b.totalDeposits ?? 0) - Number(a.totalDeposits ?? 0);
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [filteredUsers, sortBy]);

  const totalItems = sortedUsers.length;
  const isAll = pageSize === "ALL";
  const numPageSize = typeof pageSize === "number" ? pageSize : totalItems;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / numPageSize));
  const pageSafe = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedUsers = useMemo(() => {
    if (isAll) return sortedUsers;
    const start = (pageSafe - 1) * numPageSize;
    return sortedUsers.slice(start, start + numPageSize);
  }, [sortedUsers, isAll, pageSafe, numPageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, filter, sortBy, pageSize]);

  const influencersList = useMemo(() => {
    return users.filter(u => isUserInfluencerOrVip(u));
  }, [users]);

  // Overall Stats
  const stats = useMemo(() => {
    let totalBal = 0;
    let inflCount = 0;
    let activeCount = 0;
    let kycCount = 0;
    let highRollersCount = 0;
    let blockedCount = 0;
    for (const u of users) {
      const bal = Number(u.walletBalance ?? u.balance ?? 0);
      const isInf = isUserInfluencerOrVip(u);
      totalBal += bal;
      if (isInf) inflCount++;
      if ((u.status || "ACTIVE") === "ACTIVE") activeCount++;
      if (u.kycStatus === "APPROVED" || isInf) kycCount++;
      if (bal >= 500 || Number(u.totalDeposits || 0) >= 500) highRollersCount++;
      if (u.status === "BLOCKED" || u.status === "SUSPENDED" || u.withdrawLocked) blockedCount++;
    }
    return {
      total: users.length,
      influencers: inflCount,
      totalBalance: totalBal,
      active: activeCount,
      kycApproved: kycCount,
      highRollers: highRollersCount,
      blocked: blockedCount,
    };
  }, [users]);

  return (
    <section className="players-workspace">
      <PageTitle
        eyebrow="GESTÃO DE CONTAS"
        title="Gerenciamento de jogadores"
        text="Consulte contas, acompanhe saldos e acesse o histórico de cada jogador."
        action={
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="user-view-tabs">
              <button
                className={`user-view-tab ${activeTab === "LIST" ? "active" : ""}`}
                onClick={() => setActiveTab("LIST")}
              >
                <Users size={13} />
                Jogadores ({users.length})
              </button>
              <button
                className={`user-view-tab gold-tab ${activeTab === "INFLUENCERS_HUB" ? "active" : ""}`}
                onClick={() => setActiveTab("INFLUENCERS_HUB")}
              >
                <Crown size={13} />
                Influenciadores ({stats.influencers})
              </button>
              <button
                className={`user-view-tab restore-tab ${activeTab === "RESTORE_VAULT" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("RESTORE_VAULT");
                  void loadRestoreData();
                }}
              >
                <Database size={13} />
                Arquivados ({leadsStatus?.archivedCount ?? "—"})
              </button>
            </div>
            <button className="admin-secondary" disabled={loading || loadingRestore} onClick={() => { void load(null, false); void loadRestoreData(); }}>
              <RefreshCw size={13} className={(loading || loadingRestore) ? "animate-spin" : ""} />
              {(loading || loadingRestore) ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        }
      />

      {error && <AdminError text={error} />}

      {actionSuccessMsg && (
        <div style={{
          background: "rgba(34, 197, 94, 0.12)",
          border: "1px solid rgba(34, 197, 94, 0.35)",
          color: "#86efac",
          padding: "12px 16px",
          borderRadius: "10px",
          marginBottom: "16px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <CheckCircle2 size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Grid de KPIs Superiores 360° */}
      <div className="users-kpi-grid" aria-label="Resumo de jogadores">
        <button type="button" className="user-kpi-card" onClick={()=>{setActiveTab("LIST");setFilter("ALL");}}>
          <span className="kpi-head"><span>Total de jogadores</span><Users size={16}/></span>
          <strong>{stats.total}</strong><small>{stats.active} contas ativas</small>
        </button>
        <button type="button" className="user-kpi-card" onClick={()=>setActiveTab("INFLUENCERS_HUB")}>
          <span className="kpi-head"><span>Influenciadores</span><Crown size={16}/></span>
          <strong>{stats.influencers}</strong><small>Contas com perfil VIP</small>
        </button>
        <button type="button" className="user-kpi-card" onClick={()=>{setActiveTab("LIST");setFilter("HAS_BALANCE");}}>
          <span className="kpi-head"><span>Saldo em carteiras</span><Wallet size={16}/></span>
          <strong>{money(stats.totalBalance)}</strong><small>{users.filter(u=>Number(u.walletBalance??u.balance??0)>0).length} contas com saldo</small>
        </button>
        <button type="button" className="user-kpi-card" onClick={()=>{setActiveTab("RESTORE_VAULT");void loadRestoreData();}}>
          <span className="kpi-head"><span>Contas arquivadas</span><Database size={16}/></span>
          <strong>{leadsStatus?.archivedCount??"—"}</strong><small>Histórico de contas arquivadas</small>
        </button>
      </div>

      {/* =========================================================================
         TAB 2: HUB DE INFLUENCIADORES VIP
         ========================================================================= */}
      {activeTab === "INFLUENCERS_HUB" ? (
        <div style={{ marginTop: "10px" }}>
          <div className="admin-card" style={{
            background: "linear-gradient(135deg, rgba(245,0,70, 0.12) 0%, rgba(20, 16, 22, 0.95) 100%)",
            border: "1px solid rgba(245,0,70, 0.3)",
            marginBottom: "16px"
          }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="text-red-400 fill-red-400" size={20} />
                  <h3 style={{ fontSize: "16px", color: "#ff4778", margin: 0, fontWeight: 900 }}>
                    HUB EXCLUSIVO DE INFLUENCIADORES VIP
                  </h3>
                </div>
                <p style={{ fontSize: "11px", color: "#d1d5db", margin: 0, maxWidth: "600px" }}>
                  Jogadores com o selo VIP têm <b>isenção automática de KYC</b>, <b>saque imediato sem restrições</b> e <b>nunca são arquivados nas limpezas automáticas</b> de fim de semana.
                </p>
              </div>

              {/* Busca rápida para promover novo jogador */}
              <div style={{ minWidth: "260px" }}>
                <div style={{ fontSize: "10px", color: "#ff4778", fontWeight: 700, marginBottom: "4px" }}>
                  Promover jogador a VIP:
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    value={promoteSearch}
                    onChange={e => setPromoteSearch(e.target.value)}
                    placeholder="Nome, e-mail ou UID..."
                    style={{
                      background: "#29111c",
                      border: "1px solid rgba(245,0,70, 0.4)",
                      borderRadius: "7px",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "6px 10px",
                      flex: 1
                    }}
                  />
                  <button
                    className="admin-primary"
                    style={{ background: "#f50046", color: "#fff", fontWeight: 800, padding: "6px 12px", fontSize: "11px" }}
                    onClick={() => {
                      if (!promoteSearch.trim()) return;
                      const target = users.find(u =>
                        (u.email && u.email.toLowerCase().includes(promoteSearch.toLowerCase())) ||
                        (u.displayName && u.displayName.toLowerCase().includes(promoteSearch.toLowerCase())) ||
                        (u.uid && u.uid.includes(promoteSearch))
                      );
                      if (target) {
                        void toggleInfluencerDirect(target);
                        setPromoteSearch("");
                      } else {
                        setError("Jogador não encontrado na página atual. Tente buscar na Lista Geral.");
                      }
                    }}
                  >
                    Promover
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Influenciadores em Cards Dourados */}
          {influencersList.length === 0 ? (
            <div className="admin-card text-center py-10">
              <Crown size={36} style={{ color: "#71717a", margin: "0 auto 12px" }} />
              <b style={{ color: "#fff", fontSize: "14px", display: "block" }}>Nenhum influenciador configurado</b>
              <p style={{ color: "#9ca3af", fontSize: "11px", maxWidth: "420px", margin: "6px auto 14px" }}>
                Promova jogadores a Influenciador VIP para lives, testes de criadores ou contas com isenção total de taxas.
              </p>
              <button className="admin-primary" onClick={() => setActiveTab("LIST")}>
                Ver Lista de Jogadores para Promover
              </button>
            </div>
          ) : (
            <div className="influencer-hub-grid">
              {influencersList.map(u => {
                const bal = Number(u.walletBalance ?? u.balance ?? 0);
                const isCopied = copiedUid === (u.uid || u.id);
                return (
                  <div className="influencer-vip-card" key={u.uid || u.id}>
                    <div className="influencer-card-header">
                      <div className="player-table-identity">
                        <div className="player-avatar-box influencer">
                          {(getUserDisplayName(u) || "I")[0]?.toUpperCase()}
                          <div className="vip-crown"><Crown size={9} /></div>
                        </div>
                        <div>
                          <b style={{ fontSize: "13px", color: "#fef08a", display: "block" }}>
                            {getUserDisplayName(u)}
                          </b>
                          <small style={{ color: "#9ca3af", fontSize: "10px" }}>{getUserEmail(u)}</small>
                        </div>
                      </div>
                      <span className="badge-influencer-vip">
                        <Sparkles size={10} /> VIP OFICIAL
                      </span>
                    </div>

                    <div className="influencer-card-stats">
                      <div>
                        <span>Saldo em Carteira</span>
                        <strong style={{ color: "#ff4778" }}>{money(bal)}</strong>
                      </div>
                      <div>
                        <span>Status de Saque</span>
                        <strong style={{ color: u.withdrawLocked ? "#f43f5e" : "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                          {u.withdrawLocked ? <Lock size={12} /> : <Unlock size={12} />}
                          {u.withdrawLocked ? "Travado" : "Liberado"}
                        </strong>
                      </div>
                    </div>

                    {/* Vantagens Ativas */}
                    <ul className="influencer-perks-list">
                      <li><Check size={11} /> 100% Isento de KYC / Documentos</li>
                      <li><Check size={11} /> Saque instantâneo sem taxas</li>
                      <li><Check size={11} /> Protegido contra purga de leads</li>
                    </ul>

                    {/* Ações Rápidas de Injeção de Saldo de Live */}
                    <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(245,0,70, 0.15)" }}>
                      <span style={{ fontSize: "9px", color: "#ff4778", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                        Recarga Rápida de Live / Teste:
                      </span>
                      <div className="preset-pills-row">
                        <button className="preset-pill-btn gold-btn" onClick={() => quickGrantInfluencer(u, 50)}>+ R$ 50</button>
                        <button className="preset-pill-btn gold-btn" onClick={() => quickGrantInfluencer(u, 100)}>+ R$ 100</button>
                        <button className="preset-pill-btn gold-btn" onClick={() => quickGrantInfluencer(u, 500)}>+ R$ 500</button>
                        <button className="preset-pill-btn gold-btn" onClick={() => quickGrantInfluencer(u, 1000)}>+ R$ 1.000</button>
                      </div>
                    </div>

                    <div className="influencer-quick-actions" style={{ marginTop: "12px" }}>
                      <button
                        className="admin-primary full"
                        style={{ background: "linear-gradient(135deg, #f50046, #b80035)", color: "#0a0308", fontWeight: 800 }}
                        onClick={() => setSelected(u)}
                      >
                        Gerenciar Ficha Completa
                      </button>
                      <button
                        className="admin-secondary"
                        onClick={() => toggleInfluencerDirect(u)}
                        title="Remover status de influenciador"
                        style={{ color: "#f87171" }}
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === "RESTORE_VAULT" ? (
        /* =========================================================================
           TAB 3: COFRE DE RESTORE & ECONOMIA DE LEITURAS
           ========================================================================= */
        <div style={{ marginTop: "10px" }}>
          {/* Banner Informativo de Economia */}
          <div className="admin-card" style={{
            background: "linear-gradient(135deg, rgba(245,0,70, 0.12) 0%, rgba(20, 16, 22, 0.95) 100%)",
            border: "1px solid rgba(245,0,70, 0.3)",
            marginBottom: "16px"
          }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="text-red-400" size={20} />
                  <h3 style={{ fontSize: "16px", color: "#fca5a5", margin: 0, fontWeight: 900 }}>
                    COFRE DE RESTORE & ECONOMIA DE LEITURAS FIRESTORE
                  </h3>
                </div>
                <p style={{ fontSize: "11px", color: "#d1d5db", margin: 0, maxWidth: "680px" }}>
                  Controle inteligente de cota: leads inativos são arquivados para manter a base rápida e economizar milhares de leituras diárias no Firestore. 
                  <b> Qualquer jogador pode ser restaurado a qualquer momento com 1 clique.</b>
                </p>
              </div>

              {/* Botões de Execução Manual de Rotinas */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className="admin-secondary"
                  style={{ borderColor: "rgba(245,0,70, 0.4)", color: "#fca5a5", fontSize: "11px" }}
                  disabled={runningRoutine}
                  onClick={() => setConfirmModal({
                    mode: "FRIDAY_7DAYS",
                    title: "Executar Rotina de 7 Dias",
                    desc: "Move todos os jogadores cadastrados há 7 dias ou mais (sem saldo ativo) para o cofre de restore. Influenciadores VIP são 100% preservados."
                  })}
                >
                  <Archive size={13} />
                  {runningRoutine ? "Processando..." : "Rotina de 7 Dias (Sexta)"}
                </button>
                <button
                  className="admin-primary"
                  style={{ background: "#f50046", color: "#fff", fontWeight: 800, fontSize: "11px" }}
                  disabled={runningRoutine}
                  onClick={() => setConfirmModal({
                    mode: "SATURDAY_PURGE",
                    title: "Executar Limpeza de Fim de Semana",
                    desc: "Arquiva todos os leads comuns sem saldo ativo para o cofre. Todos os influenciadores VIP permanecem intocados."
                  })}
                >
                  <Flame size={13} />
                  {runningRoutine ? "Processando..." : "Limpeza de Sábado"}
                </button>
              </div>
            </div>
          </div>

          {/* Modal de Confirmação da Rotina */}
          {confirmModal && (
            <div className="admin-drawer-backdrop" style={{ zIndex: 9999 }}>
              <div className="admin-card" style={{ maxWidth: "460px", margin: "auto", padding: "20px", border: "1px solid #bf476e" }}>
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <AlertCircle size={20} />
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800 }}>{confirmModal.title}</h3>
                </div>
                <p style={{ color: "#d1d5db", fontSize: "12px", lineHeight: "1.5", margin: "10px 0 16px" }}>
                  {confirmModal.desc}
                </p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button className="admin-secondary" onClick={() => setConfirmModal(null)}>
                    Cancelar
                  </button>
                  <button
                    className="admin-primary"
                    style={{ background: "#f50046" }}
                    onClick={() => handleRunCleanup(confirmModal.mode as any)}
                  >
                    Confirmar e Executar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Leads Arquivados no Cofre */}
          <div className="admin-card admin-table-wrap">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h4 style={{ fontSize: "13px", color: "#fff", margin: 0, fontWeight: 800 }}>
                Leads Arquivados no Cofre ({archivedUsers.length})
              </h4>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  value={restoreQ}
                  onChange={e => setRestoreQ(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && loadRestoreData(restoreQ)}
                  placeholder="Buscar no cofre..."
                  style={{
                    background: "#29111c",
                    border: "1px solid #492030",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "11px",
                    padding: "4px 8px"
                  }}
                />
                <button className="admin-secondary" onClick={() => loadRestoreData(restoreQ)} disabled={loadingRestore} style={{ padding: "4px 8px" }}>
                  <Search size={12} />
                </button>
              </div>
            </div>

            {/* Versão Desktop (Tabela) */}
            <div className="hidden md:block">
              <table>
                <thead>
                  <tr>
                    <th>Jogador / Lead</th>
                    <th>E-mail</th>
                    <th>Data Arquivamento</th>
                    <th>Motivo</th>
                    <th>Ações de Restauração</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        Nenhum jogador arquivado no cofre no momento.
                      </td>
                    </tr>
                  ) : (
                    archivedUsers.map(u => {
                      const uid = u.uid || u.id;
                      return (
                        <tr key={uid}>
                          <td>
                            <b>{u.displayName || u.name || "Lead Arquivado"}</b>
                            <div style={{ fontSize: "9px", color: "#71717a" }}>UID: {uid}</div>
                          </td>
                          <td>
                            <small style={{ color: "#9ca3af" }}>{getUserEmail(u)}</small>
                          </td>
                          <td>
                            <small style={{ color: "#71717a" }}>{fmtDate(u.archivedAt || u.createdAt)}</small>
                          </td>
                          <td>
                            <span style={{ fontSize: "10px", color: "#fca5a5" }}>{u.archiveReason || "Limpeza de leads"}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="admin-primary"
                                style={{ padding: "4px 8px", fontSize: "10px", background: "#34d399", color: "#0a0308", fontWeight: 800 }}
                                onClick={() => handleRestoreUser(uid, false)}
                                title="Restaurar para a lista ativa normal"
                              >
                                <RotateCcw size={11} /> Restaurar
                              </button>
                              <button
                                className="admin-secondary"
                                style={{ padding: "4px 8px", fontSize: "10px", color: "#ff4778", borderColor: "rgba(245,0,70, 0.4)" }}
                                onClick={() => handleRestoreUser(uid, true)}
                                title="Restaurar e promover a Influenciador VIP"
                              >
                                <Crown size={11} /> Restaurar VIP
                              </button>
                              <button
                                className="admin-secondary"
                                style={{ padding: "4px 8px", fontSize: "10px", color: "#f87171" }}
                                onClick={() => handlePurgeArchivedUser(uid)}
                                title="Excluir permanentemente"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Versão Mobile (Cards Responsivos) */}
            <div className="md:hidden flex flex-col gap-2.5">
              {archivedUsers.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Nenhum jogador arquivado no cofre no momento.
                </div>
              ) : (
                archivedUsers.map(u => {
                  const uid = u.uid || u.id;
                  return (
                    <div
                      key={uid}
                      className="p-3 rounded-xl border border-white/10 bg-[#230e18] flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-xs">{u.displayName || u.name || "Lead Arquivado"}</div>
                          <div className="text-[10px] text-zinc-400">{getUserEmail(u)}</div>
                        </div>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          {u.archiveReason || "7 Dias"}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                        <span>UID: {uid?.slice(0, 10)}...</span>
                        <span>{fmtDate(u.archivedAt || u.createdAt)}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
                        <button
                          className="admin-primary text-[10px] py-1.5 px-2 flex items-center justify-center gap-1 font-bold"
                          style={{ background: "#34d399", color: "#0a0308" }}
                          onClick={() => handleRestoreUser(uid, false)}
                        >
                          <RotateCcw size={11} /> Restaurar
                        </button>
                        <button
                          className="admin-secondary text-[10px] py-1.5 px-2 flex items-center justify-center gap-1 font-bold text-red-400 border-red-500/30"
                          onClick={() => handleRestoreUser(uid, true)}
                        >
                          <Crown size={11} /> VIP
                        </button>
                        <button
                          className="admin-secondary text-[10px] py-1.5 px-2 flex items-center justify-center gap-1 font-bold text-rose-400 border-rose-500/30"
                          onClick={() => handlePurgeArchivedUser(uid)}
                        >
                          <Trash2 size={11} /> Excluir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           TAB 1: LISTA GERAL DE JOGADORES & FILTROS
           ========================================================================= */
        <div>
          {/* Painel Moderno Unificado de Busca, Filtros e Segmentação */}
          <div className="filter-bar-container">
            {/* Barra de Pesquisa Integrada de Alta Precisão */}
            <div className="players-search-row">
              <div className="players-search-input">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  aria-label="Pesquisar por ID, MID, Nome, E-mail, CPF, Telefone ou qualquer dado cadastral"
                  placeholder="Pesquisar por ID, MID (#000001), Nome, E-mail, CPF, Telefone ou qualquer dado cadastral..."
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    background: "#101010",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    title="Limpar pesquisa"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="players-search-actions">
                {q && (
                  <button
                    className="admin-secondary"
                    style={{ padding: "10px 14px", fontSize: "12px", borderRadius: "10px" }}
                    onClick={() => setQ("")}
                    title="Limpar pesquisa"
                  >
                    <X size={13} /> Limpar busca
                  </button>
                )}
                {filter !== "ALL" && (
                  <button
                    className="admin-secondary"
                    style={{ padding: "10px 14px", fontSize: "12px", borderRadius: "10px" }}
                    onClick={() => setFilter("ALL")}
                    title="Remover filtro e ver todos"
                  >
                    Ver todos ({users.length})
                  </button>
                )}
              </div>
            </div>

            {/* Feedback e Contador Instantâneo da Pesquisa */}
            {q && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                fontSize: "12px",
                color: "#a1a1aa",
                marginTop: "6px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Search size={13} style={{ color: "#ff4778" }} />
                  <span>Buscando por <strong>"{q}"</strong>:</span>
                  <span style={{
                    color: filteredUsers.length > 0 ? "#34d399" : "#f87171",
                    fontWeight: 700
                  }}>
                    {filteredUsers.length} {filteredUsers.length === 1 ? "jogador encontrado" : "jogadores encontrados"}
                  </span>
                  <span>de {users.length} cadastrados</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQ("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "11px"
                  }}
                >
                  Limpar busca
                </button>
              </div>
            )}

            {/* Pills de Filtragem Rápida */}
            <div className="filter-pills-row">
              <button
                type="button"
                aria-pressed={filter === "ALL"}
                className={`filter-pill ${filter === "ALL" ? "active" : ""}`}
                onClick={() => setFilter("ALL")}
              >
                <Users size={13} />
                <span>Todos</span>
                <span className="filter-pill-count">{users.length}</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "INFLUENCERS"}
                className={`filter-pill ${filter === "INFLUENCERS" ? "active vip" : ""}`}
                onClick={() => setFilter("INFLUENCERS")}
              >
                <Crown size={13} className={filter === "INFLUENCERS" ? "text-red-400 fill-red-400" : "text-red-400"} />
                <span>Influenciadores VIP</span>
                <span className="filter-pill-count">{stats.influencers}</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "ACTIVE"}
                className={`filter-pill ${filter === "ACTIVE" ? "active active-status" : ""}`}
                onClick={() => setFilter("ACTIVE")}
              >
                <UserCheck size={13} />
                <span>Ativos</span>
                <span className="filter-pill-count">{stats.active}</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "HAS_BALANCE"}
                className={`filter-pill ${filter === "HAS_BALANCE" ? "active balance" : ""}`}
                onClick={() => setFilter("HAS_BALANCE")}
              >
                <Wallet size={13} />
                <span>Com Saldo</span>
                <span className="filter-pill-count">{users.filter(u => Number(u.walletBalance ?? u.balance ?? 0) > 0).length}</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "HIGH_ROLLERS"}
                className={`filter-pill ${filter === "HIGH_ROLLERS" ? "active highroller" : ""}`}
                onClick={() => setFilter("HIGH_ROLLERS")}
              >
                <Sparkles size={13} />
                <span>High Rollers</span>
                <span className="filter-pill-count">{stats.highRollers}</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "KYC_APPROVED"}
                className={`filter-pill ${filter === "KYC_APPROVED" ? "active" : ""}`}
                onClick={() => setFilter("KYC_APPROVED")}
              >
                <ShieldCheck size={13} />
                <span>KYC Aprovado</span>
                <span className="filter-pill-count">{stats.kycApproved}</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "WITHDRAW_LOCKED"}
                className={`filter-pill ${filter === "WITHDRAW_LOCKED" ? "active locked" : ""}`}
                onClick={() => setFilter("WITHDRAW_LOCKED")}
              >
                <Lock size={13} />
                <span>Saque Travado</span>
                <span className="filter-pill-count">{users.filter(u => u.withdrawLocked).length}</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "BLOCKED"}
                className={`filter-pill ${filter === "BLOCKED" ? "active locked" : ""}`}
                onClick={() => setFilter("BLOCKED")}
              >
                <UserX size={13} />
                <span>Bloqueados</span>
                <span className="filter-pill-count">{users.filter(u => u.status === "BLOCKED" || u.status === "SUSPENDED").length}</span>
              </button>
            </div>

            {/* Rodapé do Painel com Ordenação e Indicador */}
            <div className="filter-bar-footer">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-zinc-500" />
                <span>
                  Mostrando <b>{paginatedUsers.length}</b> de <b>{sortedUsers.length}</b> jogadores
                  {q || filter !== "ALL" ? ` (Total na Base: ${users.length})` : ""}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Exibir:</span>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                    style={{
                      background: "#29111c",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "4px 8px"
                    }}
                  >
                    <option value="ALL">Todos os Jogadores ({sortedUsers.length})</option>
                    <option value={15}>15 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                </div>

                <div className="sort-select-wrapper">
                  <span>
                    <ArrowUpDown size={12} className="text-zinc-400" /> Ordenar por:
                  </span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                  >
                    <option value="INFLUENCER">Influenciadores VIP Primeiro</option>
                    <option value="BALANCE">Maior Saldo em Carteira</option>
                    <option value="DEPOSITS">Maior Volume de Depósitos</option>
                    <option value="RECENT">Cadastros Mais Recentes</option>
                    <option value="NAME">Ordem Alfabética (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading && <div className="admin-inline-loader"><RefreshCw className="spin" size={14} /> Consultando banco de dados...</div>}

          {/* Tabela de Jogadores Desktop */}
          <div className="admin-card admin-table-wrap admin-users-desktop">
            <table>
              <thead>
                <tr>
                  <th>Jogador & MID</th>
                  <th>Contato (E-mail / WhatsApp)</th>
                  <th>CPF / Documento</th>
                  <th>Saldo Carteira</th>
                  <th>Perfil / Vantagens VIP</th>
                  <th>Status & KYC</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Nenhum jogador encontrado com os filtros e busca selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(u => {
                    const isCopied = copiedUid === (u.uid || u.id);
                    const initial = (getUserDisplayName(u) || "J")[0]?.toUpperCase();
                    const bal = Number(u.walletBalance ?? u.balance ?? 0);
                    const bonusBal = Number(u.bonusBalance ?? 0);
                    const accId = getUserAccountId(u);
                    const isAccIdCopied = copiedUid === accId;
                    const cleanPhone = (u.phone || "").replace(/\D/g, "");
                    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`}` : null;
                    const cleanCpf = (u.cpf || u.document || "").replace(/\D/g, "");
                    const userEmail = getUserEmail(u);
                    const isEmailCopied = copiedUid === (u.uid + "_email");
                    const isCpfCopied = copiedUid === (u.uid + "_cpf");

                    return (
                      <tr
                        key={u.uid || u.id}
                        className={u.influencer ? "bg-red-950/15 border-l-2 border-l-red-500" : ""}
                      >
                        {/* 1. JOGADOR & MID */}
                        <td>
                          <div className="player-table-identity">
                            <div className={`player-avatar-box ${u.influencer ? "influencer" : ""}`}>
                              {initial}
                              {u.influencer && <div className="vip-crown"><Crown size={10} /></div>}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <b style={{ fontSize: "13px", color: u.influencer ? "#fde68a" : "#17212f" }}>
                                  {getUserDisplayName(u)}
                                </b>
                                {u.influencer && (
                                  <span title="Influenciador VIP Oficial">
                                    <Star size={13} className="text-red-500 fill-red-500" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <button
                                  type="button"
                                  className="admin-table-id-badge"
                                  onClick={() => handleCopy(accId, accId)}
                                  title="Clique para copiar MID da Conta"
                                >
                                  <Hash size={10} />
                                  <span>MID: <strong>{accId}</strong></span>
                                  {isAccIdCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(u.uid || u.id, u.uid || u.id)}
                                  title="Copiar UID Completo"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: isCopied ? "#10b981" : "#64748b",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "2px",
                                    padding: 0
                                  }}
                                >
                                  {isCopied ? <Check size={10} /> : <Copy size={10} />}
                                  <code>UID: {String(u.uid || u.id).slice(0, 8)}…</code>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. CONTATO (E-MAIL & WHATSAPP) */}
                        <td>
                          <div className="flex flex-col gap-1 min-w-[190px]">
                            <div className="flex items-center gap-1.5">
                              <Mail size={12} className="text-slate-400 shrink-0" />
                              <span className="text-[12px] font-semibold text-slate-800 select-all truncate" title={userEmail}>
                                {userEmail || <span className="text-[11px] text-slate-400 font-normal italic">E-mail não informado</span>}
                              </span>
                              {userEmail && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(userEmail, u.uid + "_email")}
                                  className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                                  title="Copiar e-mail"
                                >
                                  {isEmailCopied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                </button>
                              )}
                            </div>

                            {cleanPhone ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={waUrl!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                  title="Conversar com o jogador no WhatsApp"
                                >
                                  <MessageCircle size={11} className="text-emerald-600" />
                                  <span>{formatPhone(u.phone)}</span>
                                  <ExternalLink size={9} className="opacity-60" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Telefone não cadastrado</span>
                            )}
                          </div>
                        </td>

                        {/* 3. CPF / DOCUMENTO */}
                        <td>
                          {cleanCpf ? (
                            <div className="flex items-center gap-1.5 min-w-[130px]">
                              <span className="font-mono text-[12px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {formatCpf(u.cpf || u.document)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(cleanCpf, u.uid + "_cpf")}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                title="Copiar CPF numérico"
                              >
                                {isCpfCopied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">CPF não informado</span>
                          )}
                        </td>

                        {/* 4. SALDO CARTEIRA */}
                        <td>
                          <div className="flex flex-col">
                            <strong style={{ fontSize: "14px", color: bal > 0 ? (u.influencer ? "#e11d48" : "#16a34a") : "#64748b", fontWeight: 700 }}>
                              {money(bal)}
                            </strong>
                            {bonusBal > 0 && (
                              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-0.5">
                                <Gift size={10} /> +{money(bonusBal)} bônus
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. MODO INFLUENCIADOR / VIP */}
                        <td>
                          {u.influencer ? (
                            <div className="flex flex-col gap-1">
                              <span className="badge-influencer-vip" title="Modo Influenciador VIP Ativo com Super-Poderes">
                                <Crown size={11} className="text-amber-300" /> Influenciador VIP
                              </span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/30" title="Isento de qualquer taxa de saque (0% taxas)">⚡ Saque 0% Taxas</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/30" title="100% do saldo disponível para saque imediato">🔓 100% Liberado</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 border border-blue-500/30" title="Isento de travas de KYC">🛡️ KYC VIP</span>
                              </div>
                            </div>
                          ) : (
                            <span className="badge-player-standard">
                              Jogador Padrão
                            </span>
                          )}
                        </td>

                        {/* 6. STATUS & KYC */}
                        <td>
                          <div className="flex flex-col gap-1">
                            <Status value={u.status || "ACTIVE"} label={playerStatusLabels[u.status||"ACTIVE"]} />
                            {u.influencer ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold" title="Isento de KYC por perfil de Influenciador">
                                <CheckCircle2 size={12} /> KYC Isento (VIP)
                              </span>
                            ) : (
                              <Status value={u.kycStatus || "NOT_STARTED"} label={playerStatusLabels[u.kycStatus||"NOT_STARTED"]} />
                            )}
                            {u.withdrawLocked && (
                              <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                <Lock size={10} /> Saque Travado
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 7. AÇÕES */}
                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button
                              className="admin-primary admin-manage-btn"
                              style={{
                                background: u.influencer ? "linear-gradient(135deg, #f50046, #b80035)" : undefined,
                                color: u.influencer ? "#ffffff" : undefined,
                                fontWeight: 800
                              }}
                              onClick={() => setSelected(u)}
                            >
                              Ver perfil
                            </button>
                            <button
                              className="admin-secondary"
                              style={{
                                padding: "6px 9px",
                                color: "#16a34a",
                                borderColor: "rgba(22, 163, 74, 0.4)",
                                fontWeight: 700,
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              onClick={(e) => { e.stopPropagation(); setQuickBalanceUser(u); }}
                              title="Adicionar ou ajustar saldo rapidamente"
                            >
                              <Coins size={13} /> + Saldo
                            </button>
                            <button
                              className="admin-secondary"
                              style={{
                                padding: "6px 8px",
                                color: u.influencer ? "#e11d48" : "#94a3b8",
                                borderColor: u.influencer ? "rgba(225, 29, 72, 0.4)" : undefined
                              }}
                              onClick={(e) => toggleInfluencerDirect(u, e)}
                              title={u.influencer ? "Remover status de Influenciador VIP" : "Promover a Influenciador VIP (Vantagens de Saque e KYC)"}
                            >
                              <Star size={13} className={u.influencer ? "fill-red-500 text-red-500" : ""} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile Altamente Responsivos */}
          <div className="admin-users-mobile">
            {paginatedUsers.map(u => {
              const bal = Number(u.walletBalance ?? u.balance ?? 0);
              const bonusBal = Number(u.bonusBalance ?? 0);
              const accId = getUserAccountId(u);
              const isIdCopied = copiedUid === accId;
              const cleanPhone = (u.phone || "").replace(/\D/g, "");
              const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`}` : null;
              const cleanCpf = (u.cpf || u.document || "").replace(/\D/g, "");
              const userEmail = getUserEmail(u);
              const isEmailCopied = copiedUid === (u.uid + "_email");
              const isCpfCopied = copiedUid === (u.uid + "_cpf");

              return (
                <article className={`admin-user-mobile-card ${u.influencer ? "influencer-card" : ""}`} key={u.uid || u.id}>
                  <div className="admin-user-mobile-top">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`player-avatar-box ${u.influencer ? "influencer" : ""}`}>
                        {(getUserDisplayName(u) || "J")[0]?.toUpperCase()}
                        {u.influencer && <div className="vip-crown"><Crown size={10} /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <b className="truncate text-slate-900 text-[13px]">{getUserDisplayName(u)}</b>
                          {u.influencer && <Star size={13} className="text-red-500 fill-red-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <button
                            type="button"
                            className="admin-mobile-id-badge"
                            onClick={() => handleCopy(accId, accId)}
                            title="Clique para copiar MID da conta"
                          >
                            <Hash size={10} />
                            <span>MID: <strong>{accId}</strong></span>
                            {isIdCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {u.influencer && (
                      <span className="badge-influencer-vip shrink-0">
                        <Crown size={10} /> VIP
                      </span>
                    )}
                  </div>

                  <div className="admin-user-mobile-info-grid">
                    <div className="mobile-info-item">
                      <span>E-mail:</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <strong className="truncate select-all">{userEmail || <span className="text-slate-400 font-normal italic">Não informado</span>}</strong>
                        {userEmail && (
                          <button
                            type="button"
                            onClick={() => handleCopy(userEmail, u.uid + "_email")}
                            className="p-0.5 text-slate-400 hover:text-slate-600"
                            title="Copiar e-mail"
                          >
                            {isEmailCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mobile-info-item">
                      <span>Telefone:</span>
                      {cleanPhone ? (
                        <div className="flex items-center gap-1">
                          <strong>{formatPhone(u.phone)}</strong>
                          <a href={waUrl!} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700" title="Abrir WhatsApp">
                            <MessageCircle size={12} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Não cadastrado</span>
                      )}
                    </div>
                    <div className="mobile-info-item">
                      <span>CPF:</span>
                      {cleanCpf ? (
                        <div className="flex items-center gap-1">
                          <strong className="font-mono text-[11px]">{formatCpf(u.cpf || u.document)}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(cleanCpf, u.uid + "_cpf")}
                            className="p-0.5 text-slate-400 hover:text-slate-600"
                            title="Copiar CPF"
                          >
                            {isCpfCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Não informado</span>
                      )}
                    </div>
                  </div>

                  {u.influencer && (
                    <div className="flex flex-wrap gap-1 px-3 py-1.5 bg-red-50 border-y border-red-100">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/30">⚡ Saque 0% Taxas</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">🔓 100% Liberado</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 border border-blue-500/30">🛡️ KYC VIP</span>
                    </div>
                  )}

                  <div className="admin-user-mobile-balance-row">
                    <div className="flex flex-col">
                      <span style={{ fontSize: "10px", color: "#64748b" }}>Saldo em Carteira</span>
                      <strong style={{ fontSize: "18px", color: u.influencer ? "#e11d48" : "#16a34a", fontWeight: 800 }}>
                        {money(bal)}
                      </strong>
                      {bonusBal > 0 && (
                        <span className="text-[10px] text-amber-600 font-bold mt-0.5">+{money(bonusBal)} bônus</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="admin-user-mobile-status">
                        <Status value={u.status || "ACTIVE"} label={playerStatusLabels[u.status||"ACTIVE"]} />
                        {u.influencer ? (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">KYC Isento (VIP)</span>
                        ) : (
                          <Status value={u.kycStatus || "NOT_STARTED"} label={playerStatusLabels[u.kycStatus||"NOT_STARTED"]} />
                        )}
                      </div>
                      {u.withdrawLocked && (
                        <span className="text-[9px] text-rose-500 font-bold flex items-center gap-1">
                          <Lock size={10} /> Saque Travado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="admin-user-mobile-actions-row">
                    <button className="admin-primary admin-mobile-manage" onClick={() => setSelected(u)}>
                      <Users size={14} /> Ver Perfil
                    </button>
                    <button
                      className="admin-secondary"
                      style={{
                        padding: "8px 12px",
                        color: "#16a34a",
                        borderColor: "rgba(22, 163, 74, 0.4)",
                        fontWeight: 700,
                        fontSize: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        minHeight: "42px",
                        borderRadius: "10px"
                      }}
                      onClick={(e) => { e.stopPropagation(); setQuickBalanceUser(u); }}
                    >
                      <Coins size={14} /> + Saldo
                    </button>

                    <div className="admin-user-mobile-secondary-row">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-secondary-icon-btn whatsapp"
                          title="Abrir WhatsApp do Jogador"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        className="admin-secondary-icon-btn"
                        onClick={(e) => toggleInfluencerDirect(u, e)}
                        style={{ color: u.influencer ? "#e11d48" : "#94a3b8" }}
                        title={u.influencer ? "Remover status VIP" : "Promover a VIP"}
                      >
                        <Star size={14} className={u.influencer ? "fill-red-500 text-red-500" : ""} />
                        <span>{u.influencer ? "VIP Ativo" : "Tornar VIP"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="admin-pagination flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-zinc-400">
              <span className="font-semibold text-white">
                {isAll
                  ? `Mostrando todos os ${sortedUsers.length} jogadores`
                  : `Mostrando ${(pageSafe - 1) * numPageSize + 1}–${Math.min(pageSafe * numPageSize, totalItems)} de ${totalItems} jogadores`}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-zinc-400">Total na Base: <b className="text-white">{users.length}</b></span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                <span>Exibir:</span>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                  style={{
                    background: "#29111c",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "11px",
                    padding: "4px 8px"
                  }}
                >
                  <option value="ALL">Todos ({sortedUsers.length})</option>
                  <option value={15}>15 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>

              {!isAll && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    className="admin-secondary px-3 py-1.5 text-xs font-bold"
                    disabled={pageSafe <= 1 || loading}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    ← Anterior
                  </button>
                  <span className="text-xs text-zinc-400">
                    Página <b className="text-white">{pageSafe}</b> de <b className="text-white">{totalPages}</b>
                  </span>
                  <button
                    className="admin-primary px-3 py-1.5 text-xs font-bold"
                    disabled={pageSafe >= totalPages || loading}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adição Rápida de Saldo */}
      {quickBalanceUser && (
        <QuickBalanceModal
          user={quickBalanceUser}
          onClose={() => setQuickBalanceUser(null)}
          onSuccess={(updated) => {
            handleUpdateUserLocally(updated);
            if (selected && (selected.uid === updated.uid || selected.id === updated.uid)) {
              setSelected((prev: any) => ({ ...prev, ...updated }));
            }
            setActionSuccessMsg(`Saldo atualizado com sucesso para ${getUserDisplayName(quickBalanceUser)}!`);
            setTimeout(() => setActionSuccessMsg(null), 4000);
          }}
        />
      )}

      {/* Drawer Avançado 360° de Gerenciamento do Jogador */}
      {selected && (
        <UserDrawer
          user={selected}
          close={() => setSelected(null)}
          onUpdateUser={handleUpdateUserLocally}
          onDone={() => {
            setSelected(null);
            void load(null, false);
          }}
        />
      )}
    </section>
  );
}

/* =========================================================================
   DRAWER / FICHA COMPLETA 360° DO JOGADOR
   ========================================================================= */
function UserDrawer({ user, close, onUpdateUser, onDone }: any) {
  const targetUid = user.uid || user.id;
  const dialogRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [detailsError, setDetailsError] = useState("");
  const [detailsRetry, setDetailsRetry] = useState(0);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [targetUid]);
  function handleDialogKey(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); if (confirmAdjustData) setConfirmAdjustData(null); else if (pendingAction) setPendingAction(null); else if (!busy) close(); }
    if (event.key === "Tab") {
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]') || []).filter(el => el.getClientRects().length > 0);
      const first=controls[0], last=controls[controls.length-1];
      if (event.shiftKey && (document.activeElement===first || document.activeElement===dialogRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement===last || document.activeElement===dialogRef.current)) { event.preventDefault(); first?.focus(); }
    }
  }

  const [pendingAction, setPendingAction] = useState<{title:string; detail:string; run:()=>Promise<void>} | null>(null);
  const [drawerTab, setDrawerTab] = useState<"OVERVIEW" | "ADJUST" | "HISTORY" | "FINANCE" | "SECURITY">("OVERVIEW");
  const [displayName, setDisplayName] = useState(getUserDisplayName(user));
  const [userEmail, setUserEmail] = useState(getUserEmail(user) || "");
  const [cpf, setCpf] = useState(user.cpf || user.document || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [pixKey, setPixKey] = useState(user.pixKey || user.pix_key || "");
  const [pixKeyType, setPixKeyType] = useState(user.pixKeyType || "CPF");
  const [notes, setNotes] = useState(user.notes || "");
  const [tags, setTags] = useState<string[]>(Array.isArray(user.tags) ? user.tags : []);
  const [newTagInput, setNewTagInput] = useState("");

  const [adjustType, setAdjustType] = useState<"SET" | "CREDIT" | "DEBIT">("SET");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [bonus, setBonus] = useState("");
  const [status, setStatus] = useState(user.status || "ACTIVE");
  const [kyc, setKyc] = useState(user.kycStatus || "NOT_STARTED");
  const [influencer, setInfluencer] = useState(isUserInfluencerOrVip(user));
  const [withdrawLocked, setWithdrawLocked] = useState(!!user.withdrawLocked);
  
  // Etapas de taxas e verificação de saque
  const [firstWithdrawalFeePaid, setFirstWithdrawalFeePaid] = useState(!!user.firstWithdrawalFeePaid);
  const [kycApprovedFeePaid, setKycApprovedFeePaid] = useState(!!user.kycApprovedFeePaid);
  const [accountApprovalFeePaid, setAccountApprovalFeePaid] = useState(!!user.accountApprovalFeePaid);
  const [antiFraudFeePaid, setAntiFraudFeePaid] = useState(!!user.antiFraudFeePaid);
  const [liquidationFeePaid, setLiquidationFeePaid] = useState(!!user.liquidationFeePaid);
  const [fullWithdrawalUnlocked, setFullWithdrawalUnlocked] = useState(!!user.fullWithdrawalUnlocked);
  const [languageBonusClaimed, setLanguageBonusClaimed] = useState(!!user.languageBonusClaimed);
  
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savedNoteMsg, setSavedNoteMsg] = useState("");
  const [currentBalance, setCurrentBalance] = useState(Number(user.walletBalance ?? user.balance ?? 0));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmAdjustData, setConfirmAdjustData] = useState<{ amount: number; reason: string; type: "SET" | "CREDIT" | "DEBIT"; resultingBalance: number } | null>(null);

  // Senha do jogador
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Dados completos carregados do endpoint /api/admin/users/:uid/details
  const [detailsData, setDetailsData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Carregar detalhes 360° ao abrir o drawer
  useEffect(() => {
    let isMounted = true;
    setLoadingDetails(true); setDetailsError("");
    adminApi(`/api/admin/users/${targetUid}/details`)
      .then((d: any) => {
        if (!isMounted) return;
        setDetailsData(d);
        if (d.user) {
          if (d.user.email) setUserEmail(d.user.email);
          if (d.user.displayName) setDisplayName(d.user.displayName);
          if (d.user.cpf) setCpf(d.user.cpf);
          if (d.user.phone) setPhone(d.user.phone);
          if (d.user.pixKey) setPixKey(d.user.pixKey);
          if (d.user.pixKeyType) setPixKeyType(d.user.pixKeyType);
          if (d.user.notes) setNotes(d.user.notes);
          if (Array.isArray(d.user.tags)) setTags(d.user.tags);
          if (d.user.status) setStatus(d.user.status);
          if (d.user.kycStatus) setKyc(d.user.kycStatus);
          if (d.user.influencer !== undefined || d.user.vip !== undefined || d.user.isVip !== undefined) setInfluencer(isUserInfluencerOrVip(d.user));
          if (d.user.withdrawLocked !== undefined) setWithdrawLocked(Boolean(d.user.withdrawLocked));
          if (d.user.walletBalance !== undefined) setCurrentBalance(Number(d.user.walletBalance));
          if (d.user.firstWithdrawalFeePaid !== undefined) setFirstWithdrawalFeePaid(Boolean(d.user.firstWithdrawalFeePaid));
          if (d.user.kycApprovedFeePaid !== undefined) setKycApprovedFeePaid(Boolean(d.user.kycApprovedFeePaid));
          if (d.user.accountApprovalFeePaid !== undefined) setAccountApprovalFeePaid(Boolean(d.user.accountApprovalFeePaid));
          if (d.user.antiFraudFeePaid !== undefined) setAntiFraudFeePaid(Boolean(d.user.antiFraudFeePaid));
          if (d.user.liquidationFeePaid !== undefined) setLiquidationFeePaid(Boolean(d.user.liquidationFeePaid));
          if (d.user.fullWithdrawalUnlocked !== undefined) setFullWithdrawalUnlocked(Boolean(d.user.fullWithdrawalUnlocked));
          if (d.user.languageBonusClaimed !== undefined) setLanguageBonusClaimed(Boolean(d.user.languageBonusClaimed));
        }
      })
      .catch(err => {
        if (isMounted) setDetailsError(err.message || "Não foi possível carregar os detalhes.");
      })
      .finally(() => {
        if (isMounted) setLoadingDetails(false);
      });

    return () => { isMounted = false; };
  }, [targetUid, detailsRetry]);

  useEffect(() => { bodyRef.current?.scrollTo({top:0}); }, [drawerTab, pendingAction, message]);

  async function copyText(val: string, field: string) {
    try {
      if (!val || !navigator?.clipboard) throw new Error("Área de transferência indisponível.");
      await navigator.clipboard.writeText(val);
      setCopiedField(field); setTimeout(() => setCopiedField(null),2000);
    } catch { setMessage("Erro: não foi possível copiar. Selecione e copie o valor manualmente."); }
  }

  // Ativação direta e instantânea do modo influenciador com todas as vantagens
  async function handleToggleInfluencerImmediate(nextVal: boolean) {
    setBusy(true); setMessage("");
    try {
      await adminApi(`/api/admin/users/${targetUid}`, {
        method: "PATCH",
        body: JSON.stringify({
          influencer: nextVal,
          isInfluencer: nextVal,
          vip: nextVal,
          isVip: nextVal,
          vipMode: nextVal,
          vipTier: nextVal ? "INFLUENCER_VIP" : (user.vipTier || "STANDARD"),
          firstWithdrawalFeePaid: nextVal ? true : firstWithdrawalFeePaid,
          kycApprovedFeePaid: nextVal ? true : kycApprovedFeePaid,
          kycFastTrackPaid: nextVal ? true : false,
          accountApprovalFeePaid: nextVal ? true : accountApprovalFeePaid,
          antiFraudFeePaid: nextVal ? true : antiFraudFeePaid,
          liquidationFeePaid: nextVal ? true : liquidationFeePaid,
          fullWithdrawalUnlocked: nextVal ? true : fullWithdrawalUnlocked,
          withdrawLocked: nextVal ? false : withdrawLocked,
          kycStatus: nextVal ? "APPROVED" : kyc,
        })
      });
      setInfluencer(nextVal);
      if (nextVal) {
        setFirstWithdrawalFeePaid(true);
        setKycApprovedFeePaid(true);
        setAccountApprovalFeePaid(true);
        setAntiFraudFeePaid(true);
        setLiquidationFeePaid(true);
        setFullWithdrawalUnlocked(true);
        setWithdrawLocked(false);
        setKyc("APPROVED");
      }
      if (onUpdateUser) {
        onUpdateUser({
          uid: targetUid,
          influencer: nextVal,
          isInfluencer: nextVal,
          vip: nextVal,
          isVip: nextVal,
          vipMode: nextVal,
          vipTier: nextVal ? "INFLUENCER_VIP" : (user.vipTier || "STANDARD"),
          withdrawLocked: nextVal ? false : withdrawLocked,
          kycStatus: nextVal ? "APPROVED" : kyc,
          firstWithdrawalFeePaid: nextVal ? true : firstWithdrawalFeePaid,
          kycApprovedFeePaid: nextVal ? true : kycApprovedFeePaid,
          accountApprovalFeePaid: nextVal ? true : accountApprovalFeePaid,
          antiFraudFeePaid: nextVal ? true : antiFraudFeePaid,
          liquidationFeePaid: nextVal ? true : liquidationFeePaid,
          fullWithdrawalUnlocked: nextVal ? true : fullWithdrawalUnlocked,
        });
      }
      setMessage(nextVal ? "Modo Influenciador VIP ativado com sucesso! Vantagens liberadas." : "Modo Influenciador VIP desativado.");
    } catch (e: any) {
      setMessage(`Erro ao alterar modo influenciador: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Redefinição de senha do jogador
  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) {
      setMessage("Erro: A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }
    setBusy(true); setMessage(""); setPasswordSuccess("");
    try {
      await adminApi(`/api/admin/users/${targetUid}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ password: newPassword })
      });
      setPasswordSuccess("Senha redefinida com sucesso!");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (e: any) {
      setMessage(`Erro ao redefinir senha: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile() {
    setBusy(true); setMessage("");
    try {
      const cleanName = displayName.trim() || "Jogador";
      const cleanEmail = userEmail.trim().toLowerCase();
      const cleanCpf = cpf.trim();
      const cleanPhone = phone.trim();
      const cleanPix = pixKey.trim();

      await adminApi(`/api/admin/users/${targetUid}`, {
        method: "PATCH",
        body: JSON.stringify({
          displayName: cleanName,
          name: cleanName,
          fullName: cleanName,
          ...(cleanEmail ? { email: cleanEmail } : {}),
          cpf: cleanCpf,
          document: cleanCpf,
          phone: cleanPhone,
          pixKey: cleanPix,
          pix_key: cleanPix,
          pixKeyType,
          status,
          kycStatus: kyc,
          influencer,
          isInfluencer: influencer,
          vip: influencer,
          isVip: influencer,
          vipMode: influencer,
          vipTier: influencer ? "INFLUENCER_VIP" : (user.vipTier || "STANDARD"),
          withdrawLocked,
          firstWithdrawalFeePaid,
          kycApprovedFeePaid,
          accountApprovalFeePaid,
          antiFraudFeePaid,
          liquidationFeePaid,
          fullWithdrawalUnlocked,
          languageBonusClaimed,
          notes,
          tags
        })
      });
      if (onUpdateUser) {
        onUpdateUser({
          uid: targetUid,
          displayName: cleanName,
          name: cleanName,
          ...(cleanEmail ? { email: cleanEmail } : {}),
          cpf: cleanCpf,
          document: cleanCpf,
          phone: cleanPhone,
          pixKey: cleanPix,
          pix_key: cleanPix,
          pixKeyType,
          status,
          kycStatus: kyc,
          influencer,
          isInfluencer: influencer,
          vip: influencer,
          isVip: influencer,
          vipMode: influencer,
          vipTier: influencer ? "INFLUENCER_VIP" : (user.vipTier || "STANDARD"),
          withdrawLocked,
          firstWithdrawalFeePaid,
          kycApprovedFeePaid,
          accountApprovalFeePaid,
          antiFraudFeePaid,
          liquidationFeePaid,
          fullWithdrawalUnlocked,
          languageBonusClaimed,
          notes,
          tags
        });
      }
      setMessage("Perfil atualizado com sucesso!");
    } catch (e: any) {
      setMessage(`Erro: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function reconcileOrApprovePix(paymentId: string) {
    setBusy(true); setMessage("");
    try {
      // 1. Tenta reconciliar automaticamente com o provedor (Dotfy)
      let res: any = await adminApi(`/api/admin/payments/${encodeURIComponent(paymentId)}/reconcile`, {
        method: "POST"
      }).catch(() => null);

      // Se ainda não aprovou, executa aprovação administrativa garantida
      if (!res?.success || res.status !== "APPROVED") {
        res = await adminApi(`/api/admin/payments/${encodeURIComponent(paymentId)}/approve`, {
          method: "POST"
        });
      }

      if (res.success || res.status === "APPROVED" || res.credited) {
        setMessage("PIX aprovado e saldo creditado com sucesso!");
        const refreshed: any = await adminApi(`/api/admin/users/${targetUid}/details`);
        setDetailsData(refreshed);
        if (refreshed?.user?.walletBalance !== undefined) {
          const nb = Number(refreshed.user.walletBalance);
          setCurrentBalance(nb);
          if (onUpdateUser) onUpdateUser({ uid: targetUid, walletBalance: nb, balance: nb });
        }
      } else {
        setMessage(`Status verificado: ${res.status || "Pendente"}`);
      }
    } catch (e: any) {
      setMessage(`Erro ao processar PIX: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function adjust(val?: number, presetReason?: string, modeOverride?: "SET" | "CREDIT" | "DEBIT") {
    const activeMode = modeOverride || adjustType;
    const finalAmount = val !== undefined ? val : Number(amount);
    const defaultReason = activeMode === "SET"
      ? `Definição Exata de Saldo (R$ ${finalAmount.toFixed(2)})`
      : (activeMode === "CREDIT" ? `Crédito Administrativo (+R$ ${finalAmount.toFixed(2)})` : `Débito Administrativo (-R$ ${finalAmount.toFixed(2)})`);
    const finalReason = presetReason || reason || defaultReason;
    
    if (!Number.isFinite(finalAmount) || (activeMode !== "SET" && finalAmount <= 0) || (activeMode === "SET" && finalAmount < 0)) {
      setMessage("Informe um valor válido para o ajuste.");
      return;
    }
    if (activeMode === "DEBIT" && finalAmount > currentBalance) { setMessage("Erro: o débito não pode superar o saldo atual."); return; }
    setBusy(true); setMessage("");
    try {
      const d: any = await adminApi(`/api/admin/users/${targetUid}/wallet-adjustment`, {
        method: "POST",
        body: JSON.stringify({
          mode: activeMode,
          amount: finalAmount,
          targetBalance: finalAmount,
          reason: finalReason
        })
      });
      const newBal = Number(d.after !== undefined ? d.after : (activeMode === "SET" ? finalAmount : (currentBalance + (activeMode === "CREDIT" ? finalAmount : -finalAmount))));
      setCurrentBalance(newBal);
      if (onUpdateUser) {
        onUpdateUser({
          uid: targetUid,
          walletBalance: newBal,
          balance: newBal,
        });
      }
      setMessage(`Saldo atualizado com sucesso! Novo saldo: ${money(newBal)}`);
      setAmount("");
      setReason("");
      // Recarregar histórico
      adminApi(`/api/admin/users/${targetUid}/details`).then(setDetailsData).catch(() => {});
    } catch (e: any) {
      setMessage(`Erro no ajuste: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function zeroBalance() {
    if (!confirm(`Tem certeza que deseja zerar o saldo de ${displayName}?`)) return;
    setBusy(true); setMessage("");
    try {
      await adminApi(`/api/admin/users/${targetUid}/zero-balance`, { method: "POST" });
      setCurrentBalance(0);
      if (onUpdateUser) {
        onUpdateUser({
          uid: targetUid,
          walletBalance: 0,
          balance: 0,
        });
      }
      setMessage("Saldo zerado com sucesso!");
      adminApi(`/api/admin/users/${targetUid}/details`).then(setDetailsData).catch(() => {});
    } catch (e: any) {
      setMessage(`Erro ao zerar saldo: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function grant(val?: number) {
    const finalBonus = val !== undefined ? val : Number(bonus);
    if (!finalBonus || finalBonus <= 0) {
      setMessage("Informe um valor válido de bônus.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      const d: any = await adminApi(`/api/admin/users/${targetUid}/grant-bonus`, {
        method: "POST",
        body: JSON.stringify({ amount: finalBonus, reason: "Bônus administrativo / Fidelidade" })
      });
      const newBal = Number(d.after ?? (currentBalance + finalBonus));
      setCurrentBalance(newBal);
      if (onUpdateUser) {
        onUpdateUser({
          uid: targetUid,
          walletBalance: newBal,
          balance: newBal,
        });
      }
      setMessage(`Bônus de ${money(finalBonus)} concedido! Saldo total: ${money(newBal)}`);
      setBonus("");
      adminApi(`/api/admin/users/${targetUid}/details`).then(setDetailsData).catch(() => {});
    } catch (e: any) {
      setMessage(`Erro ao conceder bônus: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function risk(action: string) {
    setBusy(true); setMessage("");
    try {
      await adminApi(`/api/admin/risk/${targetUid}/action`, {
        method: "POST",
        body: JSON.stringify({ action })
      });
      let nextWLocked = withdrawLocked;
      let nextStatus = status;
      if (action === "LOCK_WITHDRAW") { setWithdrawLocked(true); nextWLocked = true; }
      if (action === "UNLOCK_WITHDRAW") { setWithdrawLocked(false); nextWLocked = false; }
      if (action === "SUSPEND") { setStatus("SUSPENDED"); nextStatus = "SUSPENDED"; }
      if (action === "ACTIVATE") { setStatus("ACTIVE"); nextStatus = "ACTIVE"; }
      if (onUpdateUser) {
        onUpdateUser({
          uid: targetUid,
          withdrawLocked: nextWLocked,
          status: nextStatus
        });
      }
      setMessage("Ação de segurança aplicada.");
    } catch (e: any) {
      setMessage(`Erro: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  const handleAddTag = (t: string) => {
    const clean = t.trim().toUpperCase();
    if (!clean || tags.includes(clean)) return;
    const nextTags = [...tags, clean];
    setTags(nextTags);
    setNewTagInput("");

  };

  const handleRemoveTag = (t: string) => {
    const nextTags = tags.filter(x => x !== t);
    setTags(nextTags);

  };

  // Formatar link do WhatsApp
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`}` : null;

  const stats = detailsData?.stats || {};
  const payments = detailsData?.paymentRequests || [];
  const adjustments = detailsData?.walletAdjustments || [];
  const bonuses = detailsData?.bonusGrants || [];

  return (
    <div className="admin-drawer-backdrop player-dialog-backdrop" onClick={() => { if (!busy) close(); }}>
      <aside ref={dialogRef} className="admin-drawer player-dialog" role="dialog" aria-modal="true" aria-labelledby="player-dialog-title" tabIndex={-1} onKeyDown={handleDialogKey} onClick={e => e.stopPropagation()}>
        {/* Cabeçalho do Drawer com Avatar, Nome, ID e Fechar */}
        <div className="admin-drawer-head">
          <div className="admin-player-profile-row">
            <div className={`admin-player-avatar-circle ${influencer ? "vip" : ""}`}>
              {(displayName || user.email || "J")[0]?.toUpperCase()}
              {influencer && (
                <div className="admin-player-avatar-crown">
                  <Crown size={11} />
                </div>
              )}
            </div>

            <div className="admin-player-info-col">
              <div className="admin-player-name-row">
                <span className="player-dialog-eyebrow">Ficha do jogador</span><h2 id="player-dialog-title" className="admin-player-name">{displayName || "Jogador"}</h2>
                {influencer && (
                  <span className="badge-influencer-vip">
                    <Crown size={10} /> VIP
                  </span>
                )}
                <span className={`admin-player-status-badge ${status.toLowerCase()}`}>
                  {status === "ACTIVE" ? "Ativo" : status === "BLOCKED" ? "Bloqueado" : status === "SUSPENDED" ? "Suspenso" : "Em análise"}
                </span>
              </div>

              <div className="admin-player-ids-row">
                <button
                  type="button"
                  onClick={() => copyText(getUserAccountId(user) || formatAccountId(targetUid, detailsData?.user?.accountId), "accountId")}
                  className={`admin-player-copy-badge ${copiedField === "accountId" ? "copied" : ""}`}
                  title="Copiar MID da Conta"
                >
                  <Hash size={11} className="shrink-0 text-blue-400" />
                  <span>MID: <strong>{getUserAccountId(user) || formatAccountId(targetUid, detailsData?.user?.accountId)}</strong></span>
                  {copiedField === "accountId" ? <Check size={11} className="shrink-0 text-emerald-400" /> : <Copy size={11} className="shrink-0 opacity-60" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyText(String(targetUid), "uid")}
                  className={`admin-player-copy-badge ${copiedField === "uid" ? "copied" : ""}`}
                  title="Copiar UID Completo"
                >
                  <span>UID: <strong>{String(targetUid).slice(0, 8)}…</strong></span>
                  {copiedField === "uid" ? <Check size={11} className="shrink-0 text-emerald-400" /> : <Copy size={11} className="shrink-0 opacity-60" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            className="admin-drawer-close-btn"
            aria-label="Fechar ficha do jogador" disabled={busy} title="Fechar ficha"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. SEÇÃO CABEÇALHO / CARD SEPARADO DE SALDO ATUAL */}
        <div className="admin-player-balance-section">
          <div className="admin-player-balance-card">
            <div className="admin-player-balance-top">
              <div className="admin-player-balance-title-wrap">
                <div className="admin-player-balance-icon-box">
                  <Coins size={16} />
                </div>
                <div>
                  <span className="admin-player-balance-label">Saldo Atual em Carteira</span>
                  <div className={`admin-player-balance-value ${influencer ? "vip" : ""}`}>
                    {money(currentBalance)}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-player-balance-actions-grid">
              <button
                type="button"
                className={`admin-balance-action-btn adjust ${drawerTab === "ADJUST" ? "active" : ""}`}
                aria-current={drawerTab === "ADJUST" ? "page" : undefined} onClick={() => setDrawerTab("ADJUST")}
                title="Ajustar Saldo"
              >
                <Coins size={13} />
                <span>Ajustar Saldo</span>
              </button>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-balance-action-btn whatsapp"
                  title="Conversar com o Jogador via WhatsApp"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Navegação Interna das 5 Abas do Drawer */}
        <nav className="user-drawer-tabs-nav" aria-label="Seções da ficha do jogador">
          <button
            type="button"
            className={`user-drawer-tab-btn ${drawerTab === "OVERVIEW" ? "active" : ""}`}
            aria-current={drawerTab === "OVERVIEW" ? "page" : undefined} onClick={() => setDrawerTab("OVERVIEW")}
          >
            <Users size={13} />
            <span>Perfil e contato</span>
          </button>
          <button
            type="button"
            className={`user-drawer-tab-btn ${drawerTab === "ADJUST" ? "active" : ""}`}
            aria-current={drawerTab === "ADJUST" ? "page" : undefined} onClick={() => setDrawerTab("ADJUST")}
          >
            <Coins size={13} />
            <span>Carteira</span>
          </button>
          <button
            type="button"
            className={`user-drawer-tab-btn ${drawerTab === "HISTORY" ? "active" : ""}`}
            aria-current={drawerTab === "HISTORY" ? "page" : undefined} onClick={() => setDrawerTab("HISTORY")}
          >
            <ShieldCheck size={13} />
            <span>Histórico e PIX</span>
          </button>
          <button
            type="button"
            className={`user-drawer-tab-btn ${drawerTab === "FINANCE" ? "active" : ""}`}
            aria-current={drawerTab === "FINANCE" ? "page" : undefined} onClick={() => setDrawerTab("FINANCE")}
          >
            <DollarSign size={13} />
            <span>Resumo financeiro</span>
          </button>
          <button
            type="button"
            className={`user-drawer-tab-btn ${drawerTab === "SECURITY" ? (influencer ? "active vip" : "active") : ""}`}
            aria-current={drawerTab === "SECURITY" ? "page" : undefined} onClick={() => setDrawerTab("SECURITY")}
          >
            <Shield size={13} />
            <span>Segurança e acesso</span>
          </button>
        </nav>

        {/* Corpo Rolável do Drawer */}
        <div ref={bodyRef} className="admin-drawer-body player-dialog-content">
          {pendingAction && <section className="player-confirm-action" role="alertdialog" aria-label={pendingAction.title}><h3>{pendingAction.title}</h3><p>{pendingAction.detail}</p><div><button className="admin-secondary" disabled={busy} onClick={()=>setPendingAction(null)}>Cancelar</button><button className="admin-primary" disabled={busy} onClick={async()=>{const action=pendingAction;setPendingAction(null);await action.run();}}>Confirmar</button></div></section>}
          <div className="player-panel-heading"><div><h3>{({OVERVIEW:"Perfil e contato",ADJUST:"Gerenciar carteira",HISTORY:"Histórico e pagamentos",FINANCE:"Resumo financeiro",SECURITY:"Segurança e acesso"})[drawerTab]}</h3><p>{({OVERVIEW:"Dados cadastrais, categorias e notas da equipe.",ADJUST:"Ajustes de saldo e concessão de bônus.",HISTORY:"Consulte transações e ações administrativas.",FINANCE:"Depósitos, saques e resultados deste jogador.",SECURITY:"Status da conta, validações e permissões."})[drawerTab]}</p></div></div>
          {detailsData?.truncated&&<div className="player-load-error" role="status">Histórico limitado aos 1.000 registros mais recentes de cada tabela. Os totais desta tela refletem esse período.</div>}
          {detailsError && <div className="player-load-error" role="alert"><span>{detailsError}</span><button className="admin-secondary" onClick={() => setDetailsRetry(v=>v+1)}>Tentar novamente</button></div>}
          {loadingDetails && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-zinc-400 bg-white/5 rounded-xl border border-white/5">
              <RefreshCw size={13} className="animate-spin text-emerald-400" /> Sincronizando dados completos 360°...
            </div>
          )}

          {message && (
            <div role="status" aria-live="polite" className={`player-action-feedback p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.startsWith("Erro") ? "bg-rose-500/15 border border-rose-500/30 text-rose-300" : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
            }`}>
              {message.startsWith("Erro") ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{message}</span>
            </div>
          )}

          {/* =========================================================================
             TAB 1: PERFIL & TAGS (SEÇÕES 4 E 5)
             ========================================================================= */}
          {drawerTab === "OVERVIEW" && (
            <div className="player-panel-grid">
              {/* Card de Dados Cadastrais */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Users size={15} className="text-zinc-300" /> Dados Cadastrais
                  </h3>
                  <span className="admin-section-subtitle">Informações de Contato</span>
                </div>

                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>Nome do jogador</span>
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Ex.: Lucas Silva"
                    />
                  </label>

                  <label className="admin-field">
                    <span>E-mail do Jogador</span>
                    <div className="admin-input-with-action">
                      <input
                        value={userEmail}
                        onChange={e => setUserEmail(e.target.value)}
                        placeholder="jogador@email.com"
                        style={{ fontWeight: 500 }}
                      />
                      <button
                        type="button"
                        onClick={() => copyText(userEmail, "email")}
                        className="admin-input-action-btn"
                        title="Copiar e-mail"
                      >
                        {copiedField === "email" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>CPF / Documento</span>
                    <div className="admin-input-with-action">
                      <input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
                      {cpf && (
                        <button
                          type="button"
                          onClick={() => copyText(cpf, "cpf")}
                          className="admin-input-action-btn"
                          title="Copiar CPF"
                        >
                          {copiedField === "cpf" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </label>

                  <label className="admin-field">
                    <span>Telefone / WhatsApp</span>
                    <div className="admin-input-with-action">
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-input-action-btn text-emerald-400 hover:text-emerald-300"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}
                    </div>
                  </label>
                </div>

                {/* Chave PIX e Tipo */}
                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>Chave PIX Cadastrada</span>
                    <div className="admin-input-with-action">
                      <input
                        value={pixKey}
                        onChange={e => setPixKey(e.target.value)}
                        placeholder="Informe a chave PIX do jogador..."
                      />
                      {pixKey && (
                        <button
                          type="button"
                          className="admin-input-action-btn text-emerald-400 hover:text-emerald-300"
                          onClick={() => copyText(pixKey, "pix")}
                          title="Copiar Chave PIX"
                        >
                          {copiedField === "pix" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </label>

                  <label className="admin-field">
                    <span>Tipo da Chave</span>
                    <select value={pixKeyType} onChange={e => setPixKeyType(e.target.value)}>
                      <option value="CPF">CPF</option>
                      <option value="PHONE">Telefone</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="EVP">Chave Aleatória (EVP)</option>
                    </select>
                  </label>
                </div>

                {/* Status Influenciador VIP com Ação Direta */}
                <div className={`mt-3 p-3.5 rounded-xl border ${influencer ? "bg-red-950/20 border-red-500/30" : "bg-white/5 border-white/5"} flex flex-col gap-2`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Crown size={16} className={influencer ? "text-amber-400" : "text-zinc-400"} />
                      <div>
                        <b className="text-xs text-white block">Status Influenciador VIP</b>
                        <small className="text-[10px] text-zinc-400">
                          {influencer ? "Ativo: Isenção de taxas, saque livre e KYC aprovado" : "Perfil padrão de jogador"}
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                        influencer
                          ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                      }`}
                      onClick={() => handleToggleInfluencerImmediate(!influencer)}
                      disabled={busy}
                    >
                      {influencer ? "Desativar Influenciador" : "Promover a Influenciador VIP"}
                    </button>
                  </div>
                  {influencer && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-red-500/20 text-[10px] text-zinc-300">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">⚡ 0% Taxas de Saque</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">🔓 100% Saldo Liberado</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">🛡️ KYC VIP Isento</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. TAGS DO JOGADOR */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Tag size={15} className="text-red-400" /> Tags do Jogador
                  </h3>
                  <span className="admin-section-subtitle">Categorização e Risco</span>
                </div>

                <div className="admin-tags-container">
                  {tags.length === 0 ? (
                    <span className="text-xs text-zinc-500">Nenhuma tag atribuída.</span>
                  ) : (
                    tags.map(t => {
                      const lower = t.toLowerCase().replace(/_/g, "");
                      const chipClass = lower.includes("vip") ? "vip" : lower.includes("streamer") ? "streamer" : lower.includes("high") ? "highroller" : (lower.includes("suspeito") || lower.includes("risco")) ? "suspect" : "";
                      return (
                        <span key={t} className={`admin-tag-chip ${chipClass}`}>
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            title={`Remover tag ${t}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Sugestões de Tags Rápidas */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-zinc-400">Tags sugeridas · salve as alterações para aplicar</span>
                  <div className="admin-suggested-tags-row">
                    {["VIP", "STREAMER", "HIGH_ROLLER", "AFILIADO", "SUSPEITO", "TESTE"].map(s => (
                      <button
                        key={s}
                        type="button"
                        className="admin-suggested-tag-btn"
                        onClick={() => handleAddTag(s)}
                      >
                        <Plus size={11} className="text-red-400" /> {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input de Criação de Tag */}
                <div className="admin-custom-input-group">
                  <input
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTagInput);
                      }
                    }}
                    placeholder="Digite uma tag e pressione Enter"
                  />
                </div>
              </div>

              {/* 5. NOTAS INTERNAS */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <FileText size={15} className="text-zinc-300" /> Notas Internas
                  </h3>
                  <span className="admin-section-subtitle">Histórico e Observações</span>
                </div>

                <div className="admin-notes-confidential-banner">
                  <Shield size={14} className="shrink-0 text-red-400" />
                  <span>Conteúdo confidencial e visível somente para a equipe.</span>
                </div>

                <div className="admin-custom-input-group">
                  <textarea
                    value={notes}
                    onChange={e => {
                      if (e.target.value.length <= 1000) {
                        setNotes(e.target.value);
                        setSavedNoteMsg("");
                      }
                    }}
                    placeholder="Ex.: Jogador VIP contatado no WhatsApp. Liberado bônus de R$ 50 para teste de live."
                    rows={4}
                  />
                </div>

                <div className="admin-notes-footer">
                  <span className="admin-char-counter">
                    {notes.length} / 1000 caracteres
                  </span>
                  <div className="flex items-center gap-2">
                    {savedNoteMsg && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={13} /> {savedNoteMsg}
                      </span>
                    )}
                    <button
                      type="button"
                      className="admin-primary text-xs font-bold py-2 px-4"
                      onClick={async () => {
                        setSavingNote(true);
                        try {
                          await adminApi(`/api/admin/users/${targetUid}`, {
                            method: "PATCH",
                            body: JSON.stringify({ notes })
                          });
                          setSavedNoteMsg("Nota salva!");
                          if (onUpdateUser) onUpdateUser({ uid: targetUid, notes });
                          setTimeout(() => setSavedNoteMsg(""), 3000);
                        } catch (e: any) {
                          setMessage(`Erro ao salvar nota: ${e.message}`);
                        } finally {
                          setSavingNote(false);
                        }
                      }}
                      disabled={busy || savingNote}
                    >
                      {savingNote ? "Salvando..." : "Salvar Nota"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
             TAB 2: AJUSTE DE SALDO (SEÇÃO 2)
             ========================================================================= */}
          {drawerTab === "ADJUST" && (
            <div className="player-panel-grid">
              {/* 2. AJUSTE DE SALDO */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Coins size={16} className="text-emerald-400" /> Ajuste de Saldo
                  </h3>
                  <span className="admin-section-subtitle">Gestão de Crédito e Débito</span>
                </div>

                {/* Alternância clara entre Definir Exato, Adicionar e Debitar */}
                <div className="admin-adjust-tabs-row">
                  <button
                    type="button"
                    className={`admin-adjust-tab-toggle set ${adjustType === "SET" ? "active" : ""}`}
                    onClick={() => setAdjustType("SET")}
                  >
                    <Coins size={14} /> Definir Saldo Exato
                  </button>
                  <button
                    type="button"
                    className={`admin-adjust-tab-toggle credit ${adjustType === "CREDIT" ? "active" : ""}`}
                    onClick={() => setAdjustType("CREDIT")}
                  >
                    <Plus size={14} /> Adicionar Saldo (+)
                  </button>
                  <button
                    type="button"
                    className={`admin-adjust-tab-toggle debit ${adjustType === "DEBIT" ? "active" : ""}`}
                    onClick={() => setAdjustType("DEBIT")}
                  >
                    <RotateCcw size={14} /> Debitar Saldo (-)
                  </button>
                </div>

                {/* Presets Rápidos */}
                <div>
                  <span className="text-xs font-semibold text-gray-300 block mb-2">
                    {adjustType === "SET" ? "Definir Saldo Imediato para:" : (adjustType === "CREDIT" ? "Valores Rápidos de Crédito:" : "Valores Rápidos de Débito:")}
                  </span>
                  <div className="admin-presets-grid">
                    {(adjustType === "SET" ? [50, 100, 250, 500, 1000] : (adjustType === "CREDIT" ? [20, 50, 100, 500, 1000] : [20, 50, 100, 250, 500])).map(val => (
                      <button
                        key={val}
                        type="button"
                        className={`admin-preset-btn ${adjustType.toLowerCase()}`}
                        onClick={() => {
                          setAmount(String(val));
                          if (!reason) setReason("Ajuste administrativo");
                        }}
                        disabled={busy || (adjustType === "DEBIT" && currentBalance < val)}
                      >
                        {adjustType === "SET" ? `R$ ${val}` : (adjustType === "CREDIT" ? `+ R$ ${val}` : `- R$ ${val}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campo de Valor Personalizado e Motivo */}
                <div className="admin-custom-input-group">
                  <label>
                    {adjustType === "SET" ? "Definir Saldo Exato Para (R$)" : (adjustType === "CREDIT" ? "Valor a Adicionar (R$)" : "Valor a Debitar (R$)")}
                  </label>
                  <input
                    type="number"
                    step="0.01" inputMode="decimal"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={adjustType === "SET" ? "Ex.: 50.00 (saldo ficará exatamente 50)" : (adjustType === "CREDIT" ? "Ex.: 50.00" : "Ex.: 25.00")}
                    disabled={busy}
                  />
                  {amount && !isNaN(Number(amount)) && (
                    <div className="text-[11px] text-blue-300 mt-1 font-semibold flex items-center justify-between">
                      <span>Saldo Atual: {money(currentBalance)}</span>
                      <span>
                        Novo Saldo Final: {" "}
                        <strong className="text-white font-bold">
                          {money(adjustType === "SET" ? Math.max(0, Number(amount)) : (adjustType === "CREDIT" ? currentBalance + Math.abs(Number(amount)) : Math.max(0, currentBalance - Math.abs(Number(amount)))))}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="admin-custom-input-group">
                  <label>Observação / Motivo do Ajuste *</label>
                  <input
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder={adjustType === "SET" ? "Ex.: Definição de Saldo Inicial / Correção" : "Ex.: Premiação de Live, Bonificação Especial, Correção de Aposta"}
                    disabled={busy}
                  />
                </div>

                <button
                  type="button"
                  className={adjustType === "SET" ? "admin-primary font-bold text-xs py-3 w-full bg-blue-600 hover:bg-blue-500 border-blue-500 text-white" : (adjustType === "CREDIT" ? "admin-primary font-bold text-xs py-3 w-full" : "admin-secondary font-bold text-xs py-3 w-full text-rose-400 border-rose-500/40 hover:bg-rose-500/10")}
                  onClick={() => {
                    const rawNum = Number(amount);
                    if (!Number.isFinite(rawNum) || (adjustType !== "SET" && rawNum <= 0) || (adjustType === "SET" && rawNum < 0)) {
                      setMessage("Informe um valor numérico válido.");
                      return;
                    }
                    if (!reason.trim()) {
                      setMessage("Informe o motivo ou observação do ajuste antes de confirmar.");
                      return;
                    }
                    if (adjustType === "DEBIT" && rawNum > currentBalance) { setMessage("Erro: o débito não pode superar o saldo atual."); return; }
                    const resulting = adjustType === "SET" ? Math.max(0, rawNum) : (adjustType === "CREDIT" ? currentBalance + rawNum : Math.max(0, currentBalance - rawNum));
                    setConfirmAdjustData({
                      amount: Math.abs(rawNum),
                      reason: reason.trim(),
                      type: adjustType,
                      resultingBalance: resulting
                    });
                  }}
                  disabled={busy || !amount}
                >
                  {adjustType === "SET" ? "Confirmar Novo Saldo Exato" : (adjustType === "CREDIT" ? "Confirmar Adição de Saldo" : "Confirmar Débito de Saldo")}
                </button>
              </div>

              {/* Concessão de Bônus de Fidelidade */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Gift size={15} className="text-red-400" /> Bônus de Fidelidade
                  </h3>
                  <span className="admin-section-subtitle">Premiação e Retenção</span>
                </div>

                <div className="admin-presets-grid">
                  {[10, 25, 50, 100].map(bVal => (
                    <button
                      key={bVal}
                      type="button"
                      className="admin-preset-btn text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
                      onClick={() => setBonus(String(bVal))}
                      disabled={busy}
                    >
                      Bônus R$ {bVal}
                    </button>
                  ))}
                </div>

                <div className="admin-custom-input-group">
                  <label>Valor de Bônus Customizado (R$)</label>
                  <input
                    type="number"
                    step="0.01" inputMode="decimal"
                    value={bonus}
                    onChange={e => setBonus(e.target.value)}
                    placeholder="Ex.: 35.00"
                    disabled={busy}
                  />
                </div>

                <button
                  type="button"
                  className="admin-secondary full font-bold text-xs py-2.5 text-red-400 border-red-500/40 hover:bg-red-500/10"
                  onClick={() => {
                    const value=Number(bonus);
                    if (!Number.isFinite(value) || value <= 0) { setMessage("Erro: informe um bônus maior que zero."); return; }
                    setPendingAction({title:"Confirmar bônus",detail:`Creditar ${money(value)} para ${displayName}.`,run:()=>grant(value)});
                  }}
                  disabled={busy || !bonus}
                >
                  Conceder Bônus
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
             TAB 3: COMPLIANCE & AUDITORIA (SEÇÃO 3)
             ========================================================================= */}
          {drawerTab === "HISTORY" && (
            <div className="player-panel-grid">
              {/* 3. COMPLIANCE E AUDITORIA */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <ShieldCheck size={16} className="text-sky-400" /> Compliance e Auditoria
                  </h3>
                  <span className="admin-section-subtitle">
                    {adjustments.length} {adjustments.length === 1 ? "registro" : "registros"}
                  </span>
                </div>

                {adjustments.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs bg-white/5 rounded-xl border border-white/5">
                    Nenhum registro de ajuste administrativo registrado para este jogador.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {adjustments.map((a: any) => {
                      const isPositive = Number(a.amount || 0) >= 0;
                      return (
                        <div key={a.id} className="admin-audit-card-item">
                          <div className="admin-audit-card-top">
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-xs ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                {isPositive ? "CRÉDITO" : "DÉBITO"}
                              </span>
                              <strong className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                                {isPositive ? "+" : ""}{money(Number(a.amount || 0))}
                              </strong>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {fmtDate(a.createdAt)}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-300 font-medium">
                            <strong>Motivo:</strong> {a.reason || "Ajuste Administrativo"}
                          </div>
                          <div className="admin-audit-card-meta">
                            <span>Operador: <strong>{a.operator || a.adminEmail || "Admin / Sistema"}</strong></span>
                            <span>Saldo pós-ajuste: <strong>{money(Number(a.after || 0))}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Transações PIX & Solicitações */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Activity size={15} className="text-zinc-300" /> Transações PIX & Solicitações
                  </h3>
                  <span className="admin-section-subtitle">{payments.length} registros</span>
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs bg-white/5 rounded-xl border border-white/5">
                    Nenhum registro de pagamento PIX encontrado.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {payments.map((p: any) => {
                      const isDeposit = String(p.type || "").toUpperCase() === "DEPOSIT" || !p.type;
                      const isPending = !["APPROVED", "PAID"].includes(p.status);
                      return (
                        <div key={p.id} className="drawer-tx-card">
                          <div className="drawer-tx-top">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-black ${isDeposit ? "text-emerald-400" : "text-red-400"}`}>
                                {isDeposit ? "Depósito PIX" : "Saque PIX"}
                              </span>
                              <span className="text-xs font-extrabold text-white">
                                {money(Number(p.amount || 0))}
                              </span>
                            </div>
                            <Status value={p.status || "PENDING"} />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                            <span>{fmtDate(p.createdAt)}</span>
                            {isDeposit && isPending ? (
                              <button
                                type="button"
                                className="admin-primary inline-flex items-center gap-1.5 py-1 px-2.5 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg"
                                onClick={() => setPendingAction({title:"Verificar e aprovar PIX",detail:`Depósito de ${money(Number(p.amount || 0))}. Se o provedor não confirmar, esta ação fará a aprovação administrativa e creditará o saldo.`,run:()=>reconcileOrApprovePix(p.id)})}
                                disabled={busy}
                              >
                                <CheckCircle2 size={12} /> Aprovar Depósito PIX
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-semibold">Concluído</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
             TAB 4: FINANCEIRO & LTV 360°
             ========================================================================= */}
          {drawerTab === "FINANCE" && (
            <div className="player-panel-grid">
              {/* Grid 4 Cards de Métricas Financeiras */}
              <div className="drawer-stats-grid">
                <div className="drawer-stat-card highlight-green">
                  <span>Saldo em Carteira</span>
                  <strong>{money(currentBalance)}</strong>
                  <small>Disponível para jogo/saque</small>
                </div>

                <div className="drawer-stat-card highlight-blue">
                  <span>Total Depositado</span>
                  <strong>{money(stats.totalDeposits ?? user.totalDeposits ?? 0)}</strong>
                  <small>{stats.depositCount ?? 0} depósitos confirmados</small>
                </div>

                <div className="drawer-stat-card highlight-red">
                  <span>Total Sacado</span>
                  <strong>{money(stats.totalWithdrawals ?? user.totalWithdrawals ?? 0)}</strong>
                  <small>{stats.withdrawalCount ?? 0} saques pagos</small>
                </div>

                <div className="drawer-stat-card highlight-purple">
                  <span>Fluxo líquido</span>
                  <strong style={{ color: (stats.netProfit ?? 0) >= 0 ? "#15803d" : "#b42318" }}>
                    {money(stats.netProfit ?? 0)}
                  </strong>
                  <small>Depósitos - Saques</small>
                </div>
              </div>

              {/* Ações Financeiras Rápidas */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Lock size={15} className="text-zinc-300" /> Controle de Saques & Saldo
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <b className={`text-xs block ${withdrawLocked ? "text-rose-400" : "text-emerald-400"}`}>
                      {withdrawLocked ? "Saque Bloqueado" : "Saque Liberado"}
                    </b>
                    <small className="text-[10px] text-zinc-500 block">
                      {withdrawLocked ? "Jogador impedido de solicitar novos saques PIX" : "Jogador pode sacar conforme limites"}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="admin-secondary text-xs px-3 py-2 font-bold"
                    style={{
                      color: withdrawLocked ? "#34d399" : "#b42318",
                      borderColor: withdrawLocked ? "rgba(52, 211, 153, 0.4)" : "rgba(248, 113, 113, 0.4)"
                    }}
                    onClick={() => risk(withdrawLocked ? "UNLOCK_WITHDRAW" : "LOCK_WITHDRAW")}
                    disabled={busy}
                  >
                    {withdrawLocked ? <Unlock size={13} /> : <Lock size={13} />}
                    <span>{withdrawLocked ? "Liberar Saque" : "Travar Saque"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div>
                    <b className="text-xs text-rose-400 block">Zerar Saldo da Conta</b>
                    <small className="text-[10px] text-zinc-500 block">
                      Redefine a carteira para R$ 0,00 com auditoria
                    </small>
                  </div>
                  <button
                    type="button"
                    className="admin-secondary text-xs px-3 py-2 font-bold text-rose-400 border-rose-500/40 hover:bg-rose-500/20"
                    onClick={zeroBalance}
                    disabled={busy || currentBalance === 0}
                  >
                    <RotateCcw size={13} /> Zerar Saldo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
             TAB 5: SEGURANÇA, RISCO & MODO INFLUENCIADOR
             ========================================================================= */}
          {drawerTab === "SECURITY" && (
            <div className="player-panel-grid">
              {/* Modo influenciador com controle responsivo */}
              <div className={`admin-section-card player-vip-card ${influencer ? "enabled" : ""}`}>
                <div className="player-vip-row">
                  <Crown size={22} aria-hidden="true" />
                  <div className="player-vip-description">
                    <b>Modo Influenciador VIP</b>
                    <small>{influencer ? "Isento de taxas, KYC automático e saque liberado" : "Ative para lives, streamers e parceiros"}</small>
                  </div>
                  <label className="player-switch">
                    <input
                      aria-label="Ativar modo influenciador VIP"
                      type="checkbox"
                      checked={influencer}
                      onChange={e => {
                        const val = e.target.checked;
                        setInfluencer(val);
                        if (val) {
                          setFirstWithdrawalFeePaid(true);
                          setKycApprovedFeePaid(true);
                          setAccountApprovalFeePaid(true);
                          setAntiFraudFeePaid(true);
                          setLiquidationFeePaid(true);
                          setFullWithdrawalUnlocked(true);
                          setWithdrawLocked(false);
                          setKyc("APPROVED");
                        }
                      }}
                    />
                    <span aria-hidden="true" />
                  </label>
                </div>

                <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-red-500/20">
                  <span className="text-[11px] text-zinc-300">
                    Ação rápida: <strong>{influencer ? "Influenciador Ativo" : "Não é Influenciador"}</strong>
                  </span>
                  <button
                    type="button"
                    className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                      influencer
                        ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25"
                    }`}
                    onClick={() => handleToggleInfluencerImmediate(!influencer)}
                    disabled={busy}
                  >
                    {influencer ? "Desativar Modo Influenciador" : "⚡ Ativar Modo Influenciador Agora"}
                  </button>
                </div>

                {influencer && (
                  <div className="mt-3 pt-3 border-t border-red-400/20">
                    <span className="text-[10px] text-red-400 font-black uppercase tracking-wider block mb-1.5">
                      Super-Poderes Concedidos:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
                      <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Taxa de saque 0%</span>
                      <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> 100% Saque liberado</span>
                      <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Isenção total KYC</span>
                      <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400 shrink-0" /> Imunidade à Purga</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Formulário de Status e KYC */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Shield size={15} className="text-zinc-300" /> Status da Conta & KYC
                  </h3>
                </div>

                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>Status da Conta</span>
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="ACTIVE">ACTIVE (Ativa)</option>
                      <option value="SUSPENDED">SUSPENDED (Suspensa)</option>
                      <option value="BLOCKED">BLOCKED (Bloqueada)</option>
                    </select>
                  </label>

                  <label className="admin-field">
                    <span>Status KYC</span>
                    <select value={kyc} onChange={e => setKyc(e.target.value)}>
                      <option value="NOT_STARTED">NOT_STARTED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEW">REVIEW (Em Análise)</option>
                      <option value="APPROVED">APPROVED (Aprovado)</option>
                      <option value="REJECTED">REJECTED (Rejeitado)</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Redefinição de Senha do Jogador */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Key size={15} className="text-amber-400" /> Redefinir Senha de Acesso
                  </h3>
                  <span className="admin-section-subtitle">Acesso e Credenciais</span>
                </div>

                <div className="admin-custom-input-group">
                  <label>Nova Senha para o Jogador</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      disabled={busy}
                    />
                    <button
                      type="button"
                      className="admin-primary text-xs font-bold py-2 px-4 whitespace-nowrap"
                      onClick={handleResetPassword}
                      disabled={busy || !newPassword || newPassword.length < 6}
                    >
                      Alterar Senha
                    </button>
                  </div>
                </div>
                {passwordSuccess && (
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-2">
                    <CheckCircle2 size={13} /> {passwordSuccess}
                  </div>
                )}
              </div>

              {/* FUNIL DE TAXAS DE SAQUE & VERIFICAÇÃO (5 ETAPAS) */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Funil de Taxas de Saque & Verificação
                  </h3>
                  <span className="admin-section-subtitle">5 Etapas de Desbloqueio</span>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <div className="player-setting-row">
                    <div>
                      <span className="font-bold text-white block">Verificação do primeiro saque</span>
                      <small className="text-[10px] text-zinc-400">Gera pedido de KYC após pagamento</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={firstWithdrawalFeePaid}
                      onChange={e => setFirstWithdrawalFeePaid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="player-setting-row">
                    <div>
                      <span className="font-bold text-white block">Aprovação KYC</span>
                      <small className="text-[10px] text-zinc-400">Aprovação e validação dos documentos</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={kycApprovedFeePaid}
                      onChange={e => setKycApprovedFeePaid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="player-setting-row">
                    <div>
                      <span className="font-bold text-white block">Aprovação da conta</span>
                      <small className="text-[10px] text-zinc-400">Conformidade e liberação de titularidade</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={accountApprovalFeePaid}
                      onChange={e => setAccountApprovalFeePaid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="player-setting-row">
                    <div>
                      <span className="font-bold text-white block">Análise antifraude</span>
                      <small className="text-[10px] text-zinc-400">Verificação de integridade e segurança</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={antiFraudFeePaid}
                      onChange={e => setAntiFraudFeePaid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="player-setting-row">
                    <div>
                      <span className="font-bold text-white block">Liquidação do saque</span>
                      <small className="text-[10px] text-zinc-400">Liberação de canal bancário</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={liquidationFeePaid}
                      onChange={e => setLiquidationFeePaid(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="player-setting-row">
                    <div>
                      <span className="font-black text-emerald-300 block">Saque 100% Desbloqueado (Sem Taxas)</span>
                      <small className="text-[10px] text-emerald-400/80">Permite saques diretos e imediatos</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={fullWithdrawalUnlocked}
                      onChange={e => setFullWithdrawalUnlocked(e.target.checked)}
                      className="accent-emerald-500 w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    className="admin-secondary text-[11px] py-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-bold"
                    onClick={() => {
                      setFirstWithdrawalFeePaid(true);
                      setKycApprovedFeePaid(true);
                      setAccountApprovalFeePaid(true);
                      setAntiFraudFeePaid(true);
                      setLiquidationFeePaid(true);
                      setFullWithdrawalUnlocked(true);
                      setKyc("APPROVED");
                      setWithdrawLocked(false);
                      setMessage("Todas as 5 etapas de taxa marcadas como aprovadas.");
                    }}
                    disabled={busy}
                  >
                    <CheckCircle2 size={12} /> Liberar Todas as Etapas
                  </button>
                  <button
                    type="button"
                    className="admin-secondary text-[11px] py-2 text-zinc-400 border-white/10 hover:bg-white/5 font-bold"
                    onClick={() => {
                      setFirstWithdrawalFeePaid(false);
                      setKycApprovedFeePaid(false);
                      setAccountApprovalFeePaid(false);
                      setAntiFraudFeePaid(false);
                      setLiquidationFeePaid(false);
                      setFullWithdrawalUnlocked(false);
                      setMessage("Etapas de taxa resetadas.");
                    }}
                    disabled={busy}
                  >
                    <RotateCcw size={12} /> Resetar Etapas
                  </button>
                </div>
              </div>

              {/* GESTÃO DE BÔUS DE IDIOMA (RÚSSIA / JAPÃO) */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <Gift size={15} className="text-red-400" /> Bônus de Idioma (Rússia / Japão)
                  </h3>
                </div>

                <div className="player-setting-row player-setting-action">
                  <div>
                    <span className="font-bold text-white block">
                      Status do Bônus: {languageBonusClaimed ? <strong className="text-emerald-400">Resgatado</strong> : <strong className="text-zinc-400">Não Resgatado</strong>}
                    </span>
                    <small className="text-[10px] text-zinc-400">
                      {languageBonusClaimed ? "Jogador já utilizou a promoção de idioma" : "Jogador pode resgatar a promoção"}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="admin-secondary text-xs py-1.5 px-3 font-bold text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={async () => {
                      const next = !languageBonusClaimed;
                      setBusy(true);
                      setMessage("");
                      try {
                        await adminApi(`/api/admin/users/${targetUid}`, {
                          method: "PATCH",
                          body: JSON.stringify({ languageBonusClaimed: next })
                        });
                        setLanguageBonusClaimed(next);
                        if (onUpdateUser) onUpdateUser({ uid: targetUid, languageBonusClaimed: next });
                        setMessage(next ? "Bônus marcado como resgatado." : "Bônus liberado para novo resgate com sucesso!");
                      } catch (err: any) {
                        setMessage(`Erro ao atualizar status do bônus: ${err?.message || err}`);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    disabled={busy}
                  >
                    {languageBonusClaimed ? "Permitir Novo Resgate" : "Marcar como Resgatado"}
                  </button>
                </div>
              </div>

              {/* Ações de Risco em Grid Responsivo */}
              <div className="admin-section-card">
                <div className="admin-section-title-row">
                  <h3 className="admin-section-title">
                    <AlertTriangle size={15} className="text-zinc-300" /> Ações Rápidas de Risco
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="admin-secondary text-xs py-3 justify-center text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                    onClick={() => setPendingAction({title:"Bloquear saques",detail:"Aplicar esta alteração à conta selecionada?",run:()=>risk("LOCK_WITHDRAW")})}
                    disabled={busy}
                  >
                    <Lock size={13} /> Bloquear Saque
                  </button>
                  <button
                    type="button"
                    className="admin-secondary text-xs py-3 justify-center text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={() => setPendingAction({title:"Liberar saques",detail:"Aplicar esta alteração à conta selecionada?",run:()=>risk("UNLOCK_WITHDRAW")})}
                    disabled={busy}
                  >
                    <Unlock size={13} /> Liberar Saque
                  </button>
                  <button
                    type="button"
                    className="admin-secondary text-xs py-3 justify-center text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => setPendingAction({title:"Suspender conta",detail:"Aplicar esta alteração à conta selecionada?",run:()=>risk("SUSPEND")})}
                    disabled={busy}
                  >
                    Suspender Conta
                  </button>
                  <button
                    type="button"
                    className="admin-secondary text-xs py-3 justify-center text-zinc-300 hover:bg-white/10"
                    onClick={() => setPendingAction({title:"Ativar conta",detail:"Aplicar esta alteração à conta selecionada?",run:()=>risk("ACTIVATE")})}
                    disabled={busy}
                  >
                    Ativar Conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Fixo com Ações Principais */}
        <div className="admin-drawer-footer player-dialog-footer">
          <button
            type="button"
            className="admin-secondary flex-1 font-bold text-xs py-3"
            onClick={close}
            disabled={busy}
          >
            Fechar
          </button>
          <button
            type="button"
            className="admin-primary flex-[2] font-black text-xs py-3"
            onClick={saveProfile}
            disabled={busy || loadingDetails}
          >
            {busy ? "Salvando Alterações..." : "Salvar alterações"}
          </button>
        </div>

        {/* MODAL DE CONFIRMAÇÃO DO AJUSTE DE SALDO */}
        {/* Modal de Confirmação Secundário de Ajuste de Saldo no Drawer */}
        {confirmAdjustData && (
          <div className="admin-confirm-overlay" onClick={() => setConfirmAdjustData(null)}>
            <div className="admin-confirm-dialog-card" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Coins className={confirmAdjustData.type === "SET" ? "text-blue-400" : (confirmAdjustData.type === "CREDIT" ? "text-emerald-400" : "text-rose-400")} size={20} />
                  <h3 className="text-base font-bold text-white m-0">Confirmar Ajuste de Saldo</h3>
                </div>
                <button className="text-gray-400 hover:text-white" onClick={() => setConfirmAdjustData(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="admin-confirm-summary-box">
                <div className="admin-confirm-summary-row">
                  <span>Jogador:</span>
                  <strong>{displayName}</strong>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Operação:</span>
                  <strong className={confirmAdjustData.type === "SET" ? "text-blue-400" : (confirmAdjustData.type === "CREDIT" ? "text-emerald-400" : "text-rose-400")}>
                    {confirmAdjustData.type === "SET" ? "Definir Saldo Exato" : (confirmAdjustData.type === "CREDIT" ? "Adicionar Saldo (+)" : "Debitar Saldo (-)")}
                  </strong>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Valor Solicitado:</span>
                  <strong className={confirmAdjustData.type === "SET" ? "text-blue-400 text-base" : (confirmAdjustData.type === "CREDIT" ? "text-emerald-400 text-base" : "text-rose-400 text-base")}>
                    {confirmAdjustData.type === "SET" ? money(confirmAdjustData.amount) : (confirmAdjustData.type === "CREDIT" ? `+ ${money(confirmAdjustData.amount)}` : `- ${money(confirmAdjustData.amount)}`)}
                  </strong>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Saldo Atual:</span>
                  <span>{money(currentBalance)}</span>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Novo Saldo Final:</span>
                  <strong className="text-white text-base">
                    {money(confirmAdjustData.resultingBalance !== undefined ? confirmAdjustData.resultingBalance : (confirmAdjustData.type === "SET" ? confirmAdjustData.amount : (confirmAdjustData.type === "CREDIT" ? currentBalance + confirmAdjustData.amount : Math.max(0, currentBalance - confirmAdjustData.amount))))}
                  </strong>
                </div>
                <div className="admin-confirm-summary-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                  <span>Motivo Registrado:</span>
                  <div className="p-2.5 bg-[#151515] rounded-lg border border-white/5 text-xs text-zinc-300 w-full font-medium">
                    {confirmAdjustData.reason}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="admin-secondary flex-1 py-3 font-bold text-xs"
                  onClick={() => setConfirmAdjustData(null)}
                  disabled={busy}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 font-black text-xs ${confirmAdjustData.type === "SET" ? "admin-primary bg-blue-600 hover:bg-blue-500 border-blue-500 text-white" : (confirmAdjustData.type === "CREDIT" ? "admin-primary" : "admin-secondary text-rose-400 border-rose-500 hover:bg-rose-500/20")}`}
                  onClick={async () => {
                    const toApply = confirmAdjustData;
                    setConfirmAdjustData(null);
                    await adjust(toApply.amount, toApply.reason, toApply.type);
                  }}
                  disabled={busy}
                >
                  {busy ? "Processando..." : "Sim, Confirmar Ajuste"}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

/* =========================================================================
   MODAL DE ADIÇÃO / AJUSTE RÁPIDO DE SALDO
   ========================================================================= */
function QuickBalanceModal({
  user,
  onClose,
  onSuccess
}: {
  user: any;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}) {
  const [adjustType, setAdjustType] = useState<"SET" | "CREDIT" | "DEBIT">("SET");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmModalData, setConfirmModalData] = useState<{ amount: number; reason: string; type: "SET" | "CREDIT" | "DEBIT"; resultingBalance: number } | null>(null);
  
  const currentBal = Number(user.walletBalance ?? user.balance ?? 0);
  const displayName = getUserDisplayName(user);
  const accId = user.accountId || formatAccountId(user.uid || user.id);
  const targetUid = user.uid || user.id;

  async function executeAdjustment(finalAmount: number, finalReason: string, mode: "SET" | "CREDIT" | "DEBIT") {
    setBusy(true);
    setError("");
    try {
      const res: any = await adminApi(`/api/admin/users/${targetUid}/wallet-adjustment`, {
        method: "POST",
        body: JSON.stringify({
          mode,
          amount: finalAmount,
          targetBalance: finalAmount,
          reason: finalReason
        })
      });
      const newBal = Number(res.after !== undefined ? res.after : (mode === "SET" ? finalAmount : (mode === "CREDIT" ? currentBal + finalAmount : Math.max(0, currentBal - finalAmount))));
      onSuccess({ uid: targetUid, walletBalance: newBal, balance: newBal });
      onClose();
    } catch (e: any) {
      setError(e.message || "Erro ao ajustar saldo.");
    } finally {
      setBusy(false);
    }
  }

  function handleTriggerApply(presetVal?: number) {
    const rawVal = presetVal !== undefined ? presetVal : Number(amount);
    if (isNaN(rawVal) || (adjustType !== "SET" && rawVal <= 0) || (adjustType === "SET" && rawVal < 0)) {
      setError("Informe um valor numérico válido.");
      return;
    }
    const finalAmount = Math.abs(rawVal);
    const defaultReason = adjustType === "SET" 
      ? `Definição Exata de Saldo (R$ ${finalAmount.toFixed(2)})` 
      : (adjustType === "CREDIT" ? `Crédito Rápido (+R$ ${finalAmount.toFixed(2)})` : `Estorno Rápido (-R$ ${finalAmount.toFixed(2)})`);
    const finalReason = reason.trim() || defaultReason;
    const resulting = adjustType === "SET" ? finalAmount : (adjustType === "CREDIT" ? currentBal + finalAmount : Math.max(0, currentBal - finalAmount));

    setConfirmModalData({ amount: finalAmount, reason: finalReason, type: adjustType, resultingBalance: resulting });
  }

  return (
    <div className="admin-confirm-overlay" onClick={onClose}>
      <div className="admin-confirm-dialog-card" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Coins className="text-emerald-400" size={20} />
            <h3 className="text-base font-bold text-white m-0">Ajuste de Saldo</h3>
          </div>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Card do Jogador e Saldo Atual */}
        <div className="admin-confirm-summary-box">
          <div className="admin-confirm-summary-row">
            <div>
              <div className="text-sm font-bold text-white">{displayName}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Hash size={11} /> {accId}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Saldo Atual</div>
              <div className="text-base font-extrabold text-emerald-400">{money(currentBal)}</div>
            </div>
          </div>
        </div>

        {error && <AdminError message={error} />}

        {/* Alternância Definir Exato vs Adicionar vs Debitar */}
        <div className="admin-adjust-tabs-row">
          <button
            type="button"
            className={`admin-adjust-tab-toggle set ${adjustType === "SET" ? "active" : ""}`}
            onClick={() => setAdjustType("SET")}
          >
            <Coins size={14} /> Definir Exato
          </button>
          <button
            type="button"
            className={`admin-adjust-tab-toggle credit ${adjustType === "CREDIT" ? "active" : ""}`}
            onClick={() => setAdjustType("CREDIT")}
          >
            <Plus size={14} /> Adicionar (+)
          </button>
          <button
            type="button"
            className={`admin-adjust-tab-toggle debit ${adjustType === "DEBIT" ? "active" : ""}`}
            onClick={() => setAdjustType("DEBIT")}
          >
            <RotateCcw size={14} /> Debitar (-)
          </button>
        </div>

        {/* Presets Rápidos */}
        <div>
          <span className="text-xs font-semibold text-gray-300 block mb-2">
            {adjustType === "SET" ? "Definir Saldo Imediato para:" : (adjustType === "CREDIT" ? "Valores Rápidos de Crédito:" : "Valores Rápidos de Débito:")}
          </span>
          <div className="admin-presets-grid">
            {(adjustType === "SET" ? [50, 100, 250, 500, 1000] : (adjustType === "CREDIT" ? [20, 50, 100, 500, 1000] : [20, 50, 100, 250, 500])).map(val => (
              <button
                key={val}
                type="button"
                className={`admin-preset-btn ${adjustType.toLowerCase()}`}
                onClick={() => handleTriggerApply(val)}
                disabled={busy || (adjustType === "DEBIT" && currentBal < val)}
              >
                {adjustType === "SET" ? `R$ ${val}` : (adjustType === "CREDIT" ? `+ R$ ${val}` : `- R$ ${val}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Valor Customizado e Motivo */}
        <div className="admin-form-grid">
          <div className="admin-custom-input-group">
            <label>
              {adjustType === "SET" ? "Definir Saldo Exato Para (R$)" : (adjustType === "CREDIT" ? "Valor a Adicionar (R$)" : "Valor a Debitar (R$)")}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={adjustType === "SET" ? "Ex: 50.00 (saldo vira 50)" : (adjustType === "CREDIT" ? "Ex: 50.00" : "Ex: 25.00")}
              disabled={busy}
            />
            {amount && !isNaN(Number(amount)) && (
              <div className="text-[11px] text-blue-300 mt-1 font-semibold flex items-center justify-between">
                <span>Saldo Atual: {money(currentBal)}</span>
                <span>
                  Novo Saldo Final: {" "}
                  <strong className="text-white font-bold">
                    {money(adjustType === "SET" ? Math.max(0, Number(amount)) : (adjustType === "CREDIT" ? currentBal + Math.abs(Number(amount)) : Math.max(0, currentBal - Math.abs(Number(amount)))))}
                  </strong>
                </span>
              </div>
            )}
          </div>
          <div className="admin-custom-input-group">
            <label>Motivo / Justificativa</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={adjustType === "SET" ? "Ex: Definição de Saldo" : "Ex: Premiação de Live"}
              disabled={busy}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button className="admin-secondary flex-1 py-3 font-bold text-xs" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            className={adjustType === "SET" ? "admin-primary flex-1 py-3 font-black text-xs bg-blue-600 hover:bg-blue-500 border-blue-500 text-white" : (adjustType === "CREDIT" ? "admin-primary flex-1 py-3 font-black text-xs" : "admin-secondary flex-1 py-3 font-black text-xs text-rose-400 border-rose-500 hover:bg-rose-500/20")}
            onClick={() => handleTriggerApply()}
            disabled={busy || !amount}
          >
            {busy ? "Processando..." : (adjustType === "SET" ? "Definir Saldo" : (adjustType === "CREDIT" ? "Adicionar Saldo" : "Debitar Saldo"))}
          </button>
        </div>

        {/* Modal de Confirmação Secundário para Evitar Cliques Acidentais */}
        {confirmModalData && (
          <div className="admin-confirm-overlay" onClick={() => setConfirmModalData(null)}>
            <div className="admin-confirm-dialog-card" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Coins className={confirmModalData.type === "SET" ? "text-blue-400" : (confirmModalData.type === "CREDIT" ? "text-emerald-400" : "text-rose-400")} size={20} />
                  <h3 className="text-base font-bold text-white m-0">Confirmar Ajuste</h3>
                </div>
                <button className="text-gray-400 hover:text-white" onClick={() => setConfirmModalData(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="admin-confirm-summary-box">
                <div className="admin-confirm-summary-row">
                  <span>Jogador:</span>
                  <strong>{displayName}</strong>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Operação:</span>
                  <strong className={confirmModalData.type === "SET" ? "text-blue-400" : (confirmModalData.type === "CREDIT" ? "text-emerald-400" : "text-rose-400")}>
                    {confirmModalData.type === "SET" ? "Definir Saldo Exato" : (confirmModalData.type === "CREDIT" ? "Adicionar Saldo (+)" : "Debitar Saldo (-)")}
                  </strong>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Valor:</span>
                  <strong className={confirmModalData.type === "SET" ? "text-blue-400 text-base" : (confirmModalData.type === "CREDIT" ? "text-emerald-400 text-base" : "text-rose-400 text-base")}>
                    {confirmModalData.type === "SET" ? money(confirmModalData.amount) : (confirmModalData.type === "CREDIT" ? `+ ${money(confirmModalData.amount)}` : `- ${money(confirmModalData.amount)}`)}
                  </strong>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Saldo Atual:</span>
                  <span>{money(currentBal)}</span>
                </div>
                <div className="admin-confirm-summary-row">
                  <span>Novo Saldo Final:</span>
                  <strong className="text-white text-base">
                    {money(confirmModalData.resultingBalance)}
                  </strong>
                </div>
                <div className="admin-confirm-summary-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                  <span>Motivo Registrado:</span>
                  <div className="p-2.5 bg-[#151515] rounded-lg border border-white/5 text-xs text-zinc-300 w-full font-medium">
                    {confirmModalData.reason}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="admin-secondary flex-1 py-3 font-bold text-xs"
                  onClick={() => setConfirmModalData(null)}
                  disabled={busy}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 font-black text-xs ${confirmModalData.type === "SET" ? "admin-primary bg-blue-600 hover:bg-blue-500 border-blue-500 text-white" : (confirmModalData.type === "CREDIT" ? "admin-primary" : "admin-secondary text-rose-400 border-rose-500 hover:bg-rose-500/20")}`}
                  onClick={async () => {
                    const toApply = confirmModalData;
                    setConfirmModalData(null);
                    await executeAdjustment(toApply.amount, toApply.reason, toApply.type);
                  }}
                  disabled={busy}
                >
                  {busy ? "Processando..." : "Sim, Confirmar Ajuste"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
