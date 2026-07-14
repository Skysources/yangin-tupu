import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase.js";

const TUPLER_COL = "tupler";
const KONTROLLER_COL = "kontroller";

// ─── Tüpler ───────────────────────────────────────────────────────────────

export function subscribeTupler(onChange) {
  return onSnapshot(collection(db, TUPLER_COL), (snap) => {
    const liste = snap.docs.map((d) => d.data());
    onChange(liste);
  });
}

export async function tuplerBosMu() {
  const snap = await getDocs(collection(db, TUPLER_COL));
  return snap.empty;
}

export async function tuplerToplu(liste) {
  const batch = writeBatch(db);
  for (const t of liste) {
    batch.set(doc(db, TUPLER_COL, String(t.no)), t);
  }
  await batch.commit();
}

export async function tupGuncelle(no, alanlar) {
  await updateDoc(doc(db, TUPLER_COL, String(no)), alanlar);
}

export async function tupEkle(veri, tupler) {
  const maxNo = tupler.reduce((m, t) => Math.max(m, t.no), 0);
  const no = maxNo + 1;
  await setDoc(doc(db, TUPLER_COL, String(no)), { ...veri, no });
  return no;
}

export async function tupSil(no) {
  await deleteDoc(doc(db, TUPLER_COL, String(no)));
  const snap = await getDocs(collection(db, KONTROLLER_COL));
  const guncellemeler = [];
  snap.forEach((d) => {
    if (Object.prototype.hasOwnProperty.call(d.data(), String(no))) {
      guncellemeler.push(updateDoc(doc(db, KONTROLLER_COL, d.id), { [String(no)]: deleteField() }));
    }
  });
  await Promise.all(guncellemeler);
}

// ─── Aylık kontroller ────────────────────────────────────────────────────

export function subscribeKontroller(onChange) {
  return onSnapshot(collection(db, KONTROLLER_COL), (snap) => {
    const checks = {};
    snap.forEach((d) => {
      checks[d.id] = d.data();
    });
    onChange(checks);
  });
}

export async function kaydetKontrol(ay, no, kayit) {
  const ref = doc(db, KONTROLLER_COL, ay);
  if (kayit === null) {
    await updateDoc(ref, { [String(no)]: deleteField() }).catch(async (e) => {
      // ay dökümanı hiç yoksa silinecek bir şey de yoktur
      if (e.code !== "not-found") throw e;
    });
  } else {
    await setDoc(ref, { [String(no)]: kayit }, { merge: true });
  }
}
