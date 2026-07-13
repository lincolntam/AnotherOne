"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PASSCODE = "302306";
const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];

export default function PasscodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (code.length !== 6) return;
    if (code === PASSCODE) {
      window.sessionStorage.setItem("anotherone-secret-unlocked", "true");
      const redirectTo = window.sessionStorage.getItem("anotherone-secret-redirect") || "/secret";
      window.sessionStorage.removeItem("anotherone-secret-redirect");
      router.push(redirectTo as Route);
      return;
    }

    setError(true);
    const timer = window.setTimeout(() => {
      setCode("");
      setError(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [code, router]);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (/^\d$/u.test(event.key)) {
        press(event.key);
        return;
      }
      if (event.key === "Backspace") deleteLast();
      if (event.key === "Escape") router.push("/home");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function press(value: string) {
    if (!value) return;
    setCode((current) => (current.length < 6 ? current + value : current));
  }

  function deleteLast() {
    setCode((current) => current.slice(0, -1));
    setError(false);
  }

  function cancelOrDelete() {
    if (code.length) {
      deleteLast();
      return;
    }
    router.push("/home");
  }

  return (
    <main className="min-h-[100dvh] bg-white text-ink">
      <section className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-7 py-10">
        <div className="flex flex-1 flex-col justify-end pb-8">
          <div className="relative mx-auto mb-7 h-44 w-56">
            <Image src="/assets/passcode-door.png" alt="Unlock illustration" fill className="object-contain" priority />
          </div>
          <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-graphite/55">Enter Passcode</p>
          <div className="mt-5 flex justify-center gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full transition ${index < code.length ? "bg-ink" : "bg-graphite/15"} ${error ? "bg-rose-400" : ""}`}
              />
            ))}
          </div>
          <AnimatePresence>
            {error ? (
              <motion.p className="mt-4 text-center text-xs font-semibold text-rose-500" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                Incorrect passcode
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="rounded-[34px] bg-white px-8 py-8 text-ink">
          <div className="grid grid-cols-3 gap-x-8 gap-y-5">
            {keys.map((key, index) =>
              key ? (
                <button
                  key={key}
                  className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-graphite/10 text-center text-4xl font-light text-ink transition active:scale-95"
                  onClick={() => press(key)}
                >
                  <span>{key}</span>
                </button>
              ) : (
                <span key={`empty-${index}`} aria-hidden className="h-[76px] w-[76px]" />
              )
            )}
          </div>
          <div className="mt-7 flex justify-between px-2 text-xs font-medium text-graphite/70">
            <button onClick={() => router.push("/home")}>Emergency</button>
            <button onClick={cancelOrDelete}>{code.length ? "Delete" : "Cancel"}</button>
          </div>
        </div>
      </section>
    </main>
  );
}
