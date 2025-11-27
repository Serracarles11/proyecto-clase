"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type CardItem = {
  id: number;
  title: string;
  description: string;
  author: string;
  tag: string;
  date?: string; // YYYY-MM-DD FORMATO
  course?: string;
  professor?: string;
  videoUrl?: string;
  coverUrl?: string;
};

const titleFont = { fontFamily: '"Libre Baskerville", serif' };
const bodyFont = { fontFamily: '"Montserrat", system-ui, sans-serif' };

const INITIAL_ITEMS: CardItem[] = [
  {
    id: 1,
    title: "REACT",
    description:
      "En esta clase se practicará y se aprenderá a usar funciones de React.",
    author: "Jorge Aguirre",
    tag: "React",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-02",
    videoUrl: "/videos/react-clase-1.mp4",
    coverUrl: "/covers/react.png",
  },
  {
    id: 2,
    title: "Next.js",
    description:
      "Aprende a crear aplicaciones web rápidas y modernas con Next.js.",
    author: "Jorge Aguirre",
    tag: "Web",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-04",
    videoUrl: "/videos/nextjs-intro.mp4",
    coverUrl: "/covers/nextjs.png",
  },
  {
    id: 3,
    title: "Tailwind CSS",
    description:
      "Descubre cómo diseñar páginas web profesionales con Tailwind CSS.",
    author: "Jorge Aguirre",
    tag: "Web",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-06",
    coverUrl: "/covers/tailwind.png",
  },
  {
    id: 4,
    title: "MySQL",
    description:
      "En este vídeo aprenderás a crear, consultar y optimizar bases de datos usando MySQL.",
    author: "Jorge Aguirre",
    tag: "BBDD",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-08",
    coverUrl: "/covers/mysql.png",
  },
  {
    id: 5,
    title: "RCP",
    description:
      "En esta clase se practicará y se aprenderá a hacer una RCP.",
    author: "Jorge Aguirre",
    tag: "Salud",
    course: "ENFERMERIA",
    professor: "Jorge Aguirre",
    date: "2025-10-10",
    coverUrl: "/covers/rcp.png",
  },
  {
    id: 6,
    title: "Python",
    description: "Aprende los fundamentos de la programación con Python.",
    author: "Jorge Aguirre",
    tag: "Prog",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-12",
    coverUrl: "/covers/python.png",
  },
  {
    id: 7,
    title: "After Effects",
    description:
      "Descubre cómo crear animaciones y efectos visuales con Adobe After Effects.",
    author: "Jorge Aguirre",
    tag: "Edición",
    course: "Producción de Audiovisuales",
    professor: "Jorge Aguirre",
    date: "2025-10-14",
    coverUrl: "/covers/after-effects.png",
  },
  {
    id: 8,
    title: "Producción Musical",
    description:
      "Aprende a mezclar canciones, crear tus propios beats y usar herramientas de DJ.",
    author: "Jorge Aguirre",
    tag: "Música",
    course: "DJ",
    professor: "Jorge Aguirre",
    date: "2025-10-16",
    coverUrl: "/covers/musica.png",
  },
];

const COURSES = [
  "ENFERMERIA",
  "DAW/DAM",
  "VIDEOJUEGOS",
  "Producción de Audiovisuales",
  "DJ",
  "Sistemas informáticos en Red",
];

const TAGS = ["BBDD", "Salud", "React"];

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

/* -------------------- CALENDARIO PEQUEÑO -------------------- */
function MiniCalendar({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(value?.getMonth() ?? today.getMonth());
  const [year, setYear] = useState(value?.getFullYear() ?? today.getFullYear());

  useEffect(() => {
    if (value) {
      setMonth(value.getMonth());
      setYear(value.getFullYear());
    }
  }, [value]);

  const firstDay = new Date(year, month, 1);
  const start = (firstDay.getDay() + 6) % 7; // lunes=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean; date: Date }[] = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - start + 1;
    let d: Date;
    let inMonth = true;

    if (dayNum < 1) {
      inMonth = false;
      d = new Date(year, month - 1, prevDays + dayNum);
      cells.push({ day: d.getDate(), inMonth, date: d });
    } else if (dayNum > daysInMonth) {
      inMonth = false;
      d = new Date(year, month + 1, dayNum - daysInMonth);
      cells.push({ day: d.getDate(), inMonth, date: d });
    } else {
      d = new Date(year, month, dayNum);
      cells.push({ day: dayNum, inMonth, date: d });
    }
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className="w-[260px] rounded-lg border border-black/10 bg-[#D46D85] p-3 text-sm shadow-lg dark:border-white/15 dark:bg-black">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => {
            const m = month - 1;
            if (m < 0) {
              setMonth(11);
              setYear(year - 1);
            } else setMonth(m);
          }}
          className="px-2 text-lg leading-none opacity-70 hover:opacity-100"
        >
          ‹
        </button>

        <div className="flex items-center gap-2 font-medium">
          <span className="rounded-md border border-black/10 px-2 py-0.5 dark:border-white/15">
            {MONTHS[month]}
          </span>
          <span className="rounded-md border border-black/10 px-2 py-0.5 dark:border-white/15">
            {year}
          </span>
        </div>

        <button
          onClick={() => {
            const m = month + 1;
            if (m > 11) {
              setMonth(0);
              setYear(year + 1);
            } else setMonth(m);
          }}
          className="px-2 text-lg leading-none opacity-70 hover:opacity-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs opacity-70">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1 text-center">
        {cells.map((c, i) => {
          const selected = value && isSameDay(value, c.date);
          return (
            <button
              key={i}
              onClick={() => onChange(c.date)}
              className={[
                "h-8 rounded-md",
                c.inMonth ? "opacity-100" : "opacity-40",
                selected
                  ? "border border-black/30 font-semibold dark:border-white/50"
                  : "hover:bg-black/[.04] dark:hover:bg-white/10",
              ].join(" ")}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- CARD -------------------- */
function Card({ it, onOpen }: { it: CardItem; onOpen: (it: CardItem) => void }) {
  return (
    <article
      onClick={() => onOpen(it)}
      className="group flex cursor-pointer flex-col gap-2"
      style={bodyFont}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-black/10 bg-white dark:border-white/15 dark:bg-black">
        {it.coverUrl ? (
          <img
            src={it.coverUrl}
            alt={it.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs opacity-60">
            Sin portada
          </div>
        )}

        {it.videoUrl && (
          <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
            Reproducir vídeo
          </div>
        )}
      </div>

      <h3
        className="mt-2 text-[22px] leading-6 text-[#004B57] dark:text-zinc-50"
        style={titleFont}
      >
        {it.title}
      </h3>

      <p className="text-sm leading-5 text-zinc-700 dark:text-zinc-400">
        {it.description}
      </p>

      <div className="mt-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span title="descargar">↓</span>
          <span title="favorito">☆</span>
          <span title="guardado">🔖</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full border border-black/10 dark:border-white/15" />
          <span>{it.author}</span>
        </div>
      </div>
    </article>
  );
}

/* -------------------- COMPONENTE PRINCIPAL -------------------- */
export function Board() {
  const [items, setItems] = useState<CardItem[]>(INITIAL_ITEMS);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(
    null
  );

  const [openFilter, setOpenFilter] =
    useState<"fecha" | "curso" | "profesor" | null>(null);

  const fechaRef = useRef<HTMLDivElement>(null);
  const cursoRef = useRef<HTMLDivElement>(null);
  const profesorRef = useRef<HTMLDivElement>(null);

  // BOTON CREAR
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCats, setNewCats] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newCourse, setNewCourse] = useState<string>("");

  // BOTON VIDEO
  const [activeVideoItem, setActiveVideoItem] = useState<CardItem | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      const map = {
        fecha: fechaRef,
        curso: cursoRef,
        profesor: profesorRef,
      } as const;
      if (!openFilter) return;
      const ref = map[openFilter].current;
      if (ref && !ref.contains(target)) setOpenFilter(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openFilter]);

  const PROFESSORS = useMemo(() => {
    const setP = new Set(items.map((i) => i.professor ?? i.author));
    return Array.from(setP);
  }, [items]);

  const toggleCat = (c: string) => {
    setNewCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = query.toLowerCase();
      const matchesQuery =
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q);

      const matchesTag = activeTag ? it.tag === activeTag : true;
      const matchesCourse = selectedCourse ? it.course === selectedCourse : true;
      const matchesProfessor = selectedProfessor
        ? (it.professor ?? it.author) === selectedProfessor
        : true;
      const matchesDate = selectedDate
        ? it.date === selectedDate.toISOString().slice(0, 10)
        : true;

      return (
        matchesQuery &&
        matchesTag &&
        matchesCourse &&
        matchesProfessor &&
        matchesDate
      );
    });
  }, [items, query, activeTag, selectedCourse, selectedProfessor, selectedDate]);

  const saveNewItem = () => {
    const nextId = items.length + 1;
    const tagToUse = newCats[0] ?? "React";
    const courseToUse = newCourse || "DAW/DAM";

    // Preparado para backend: mandar FormData
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("description", newDesc);
    formData.append("author", "Jorge Aguirre");
    formData.append("tag", tagToUse);
    formData.append("course", courseToUse);
    formData.append("professor", "Jorge Aguirre");
    if (selectedDate) {
      formData.append("date", selectedDate.toISOString().slice(0, 10));
    }
    if (newCoverUrl) formData.append("coverUrl", newCoverUrl);
    if (newVideoUrl) formData.append("videoUrl", newVideoUrl);
    if (newCoverFile) formData.append("coverFile", newCoverFile);
    if (newVideoFile) formData.append("videoFile", newVideoFile);


    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        title: newTitle.trim() || `Nuevo ${nextId}`,
        description: newDesc.trim() || "Sin descripción.",
        author: "Jorge Aguirre",
        tag: tagToUse,
        course: courseToUse,
        professor: "Jorge Aguirre",
        date: selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined,
        videoUrl: newVideoUrl.trim() || undefined,
        coverUrl: newCoverUrl.trim() || undefined,
      },
    ]);

    setCreateOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewCats([]);
    setNewVideoUrl("");
    setNewCoverUrl("");
    setNewCoverFile(null);
    setNewVideoFile(null);
    setNewCourse("");
  };

  const openCard = (it: CardItem) => {
    setActiveVideoItem(it);
  };

  const openCreateModal = () => {
    // Por defecto, si hay un curso filtrado arriba, lo usamos como curso inicial
    setNewCourse(selectedCourse || "");
    setCreateOpen(true);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10" style={bodyFont}>
      <div className="mx-auto w-full max-w-6xl">
        {/* BOTONES ARRIBA */}
        <div className="flex w-full flex-wrap items-center gap-3">
          {/* FECHA */}
          <div ref={fechaRef} className="relative">
            <button
              onClick={() =>
                setOpenFilter(openFilter === "fecha" ? null : "fecha")
              }
              className="flex h-9 w-36 items-center justify-between rounded-md border border-black/10 bg-[#D46D85] px-3 text-sm text-zinc-800 dark:border-white/15 dark:bg-black dark:text-zinc-200"
            >
              <span className="text-white">
                {selectedDate ? selectedDate.toLocaleDateString() : "Fecha"}
              </span>
              <span className="text-xs opacity-60">▾</span>
            </button>

            {openFilter === "fecha" && (
              <div className="absolute left-0 top-11 z-50">
                <MiniCalendar
                  value={selectedDate}
                  onChange={(d) => {
                    setSelectedDate(d);
                    setOpenFilter(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* CURSO */}
          <div ref={cursoRef} className="relative">
            <button
              onClick={() =>
                setOpenFilter(openFilter === "curso" ? null : "curso")
              }
              className="flex h-9 w-36 items-center justify-between rounded-md border border-black/10 bg-[#D46D85] px-3 text-sm text-zinc-800 dark:border-white/15 dark:bg-black dark:text-zinc-200"
            >
              <span className="text-white">{selectedCourse ?? "Curso"}</span>
              <span className="text-xs opacity-60">▾</span>
            </button>

            {openFilter === "curso" && (
              <div className="absolute left-0 top-11 z-50 w-56 rounded-lg border border-black/10 bg-white p-1 text-sm shadow-lg dark:border-white/15 dark:bg-black">
                {COURSES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCourse(c);
                      setOpenFilter(null);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left hover:bg-black/[.04] dark:hover:bg-white/10"
                  >
                    {c}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    setOpenFilter(null);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left opacity-60 hover:bg-black/[.04] dark:hover:bg-white/10"
                >
                  Quitar filtro
                </button>
              </div>
            )}
          </div>

          {/* PROFESOR */}
          <div ref={profesorRef} className="relative">
            <button
              onClick={() =>
                setOpenFilter(openFilter === "profesor" ? null : "profesor")
              }
              className="flex h-9 w-36 items-center justify-between rounded-md border border-black/10 bg-[#D46D85] px-3 text-sm text-zinc-800 dark:border-white/15 dark:bg-black dark:text-zinc-200"
            >
              <span className="text-white">
                {selectedProfessor ?? "Profesor"}
              </span>
              <span className="text-xs opacity-60">▾</span>
            </button>

            {openFilter === "profesor" && (
              <ProfessorPopover
                professors={PROFESSORS}
                onPick={(p) => {
                  setSelectedProfessor(p);
                  setOpenFilter(null);
                }}
                onClear={() => {
                  setSelectedProfessor(null);
                  setOpenFilter(null);
                }}
              />
            )}
          </div>

          {/* CREAR */}
          <button
            onClick={openCreateModal}
            className="h-9 rounded-md border border-black/10 bg-[#D46D85] px-4 text-sm text-white hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10"
          >
            + crear
          </button>
        </div>

        {/* BUSCAR POR */}
        <div className="mt-4 flex w-full items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscador"
              className="h-10 w-full rounded-md border border-black/10 bg-[#124D58] pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-200 dark:border-white/15 dark:bg-black dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
          </div>

          <button className="h-10 w-32 shrink-0 rounded-md border border-black/10 bg-[#124D58] text-sm text-zinc-100 hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10">
            Ordenar por &nbsp;›
          </button>
        </div>

        {/* TAGS */}
        <div className="mt-4 flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const active = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(active ? null : tag)}
                className={`h-8 rounded-md border px-3 text-sm text-white bg-[#D46D85] ${
                  active
                    ? "border-black/30 dark:border-white/40"
                    : "border-black/10 dark:border-white/15"
                } hover:bg-black/[.04] dark:hover:bg-white/10`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* ESTRUc */}
        <section className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((it) => (
            <Card key={it.id} it={it} onOpen={openCard} />
          ))}
        </section>
      </div>

      {/* BOTON CREAR */}
      {isCreateOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          title={newTitle}
          setTitle={setNewTitle}
          desc={newDesc}
          setDesc={setNewDesc}
          cats={newCats}
          toggleCat={toggleCat}
          videoUrl={newVideoUrl}
          setVideoUrl={setNewVideoUrl}
          coverUrl={newCoverUrl}
          setCoverUrl={setNewCoverUrl}
          coverFile={newCoverFile}
          setCoverFile={setNewCoverFile}
          videoFile={newVideoFile}
          setVideoFile={setNewVideoFile}
          onSave={saveNewItem}
          newCourse={newCourse}
          setNewCourse={setNewCourse}
        />
      )}

      {/* ZONA VIDEO */}
      {activeVideoItem && (
        <VideoModal
          item={activeVideoItem}
          onClose={() => setActiveVideoItem(null)}
        />
      )}
    </div>
  );
}

/* -------------------- EJEGIR PROFESOR -------------------- */
function ProfessorPopover({
  professors,
  onPick,
  onClear,
}: {
  professors: string[];
  onPick: (p: string) => void;
  onClear: () => void;
}) {
  const [q, setQ] = useState("");
  const list = professors.filter((p) =>
    p.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div
      className="absolute left-0 top-11 z-50 w-56 rounded-lg border border-black/10 bg-white p-2 text-sm shadow-lg dark:border-white/15 dark:bg-black"
      style={bodyFont}
    >
      <div className="relative mb-2">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs opacity-60">
          🔍
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar..."
          className="h-8 w-full rounded-md border border-black/10 bg-white pl-6 pr-2 text-xs dark:border-white/15 dark:bg-black"
        />
      </div>

      <div className="max-h-44 overflow-auto">
        {list.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-black/[.04] dark:hover:bg-white/10"
          >
            <span className="h-5 w-5 rounded-full border border-black/10 dark:border-white/15" />
            {p}
          </button>
        ))}
        {!list.length && (
          <div className="px-2 py-2 text-xs opacity-60">No hay resultados</div>
        )}
      </div>

      <button
        onClick={onClear}
        className="mt-2 w-full rounded-md px-2 py-2 text-left text-xs opacity-60 hover:bg-black/[.04] dark:hover:bg-white/10"
      >
        Quitar filtro
      </button>
    </div>
  );
}

/* -------------------- ZONA VIDEO -------------------- */
function CreateModal({
  onClose,
  title,
  setTitle,
  desc,
  setDesc,
  cats,
  toggleCat,
  videoUrl,
  setVideoUrl,
  coverUrl,
  setCoverUrl,
  coverFile,
  setCoverFile,
  videoFile,
  setVideoFile,
  onSave,
  newCourse,
  setNewCourse,
}: {
  onClose: () => void;
  title: string;
  setTitle: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  cats: string[];
  toggleCat: (c: string) => void;
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  coverUrl: string;
  setCoverUrl: (v: string) => void;
  coverFile: File | null;
  setCoverFile: (f: File | null) => void;
  videoFile: File | null;
  setVideoFile: (f: File | null) => void;
  onSave: () => void;
  newCourse: string;
  setNewCourse: (v: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const courseLabel = newCourse || "Curso";

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 p-4 sm:p-8">
      <div
        ref={panelRef}
        className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-xl bg-[#F5F5F5] p-6 shadow-xl dark:bg-black"
        style={bodyFont}
      >
        {/* PARTE ARRIBA */}
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-semibold text-[#D46D85]"
            style={titleFont}
          >
            Crear contenido
          </h2>
          <button
            onClick={onClose}
            className="text-xl opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid gap-8 md:grid-cols-[1.4fr_1.1fr]">
          {/* COLUMNA IZQUIERDA */}
          <div className="flex flex-col gap-6">
            {/* TITULOOO */}
            <div>
              <h3
                className="mb-2 text-lg font-semibold text-[#D46D85]"
                style={titleFont}
              >
                Título
              </h3>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 w-full rounded-md border border-black/20 bg-[#124D58] px-4 text-sm text-white placeholder:text-zinc-200 dark:border-white/20"
                placeholder="Introduce un título..."
              />
            </div>

            {/* DESCRIPCIONANAN */}
            <div>
              <h3
                className="mb-2 text-lg font-semibold text-[#D46D85]"
                style={titleFont}
              >
                Descripción
              </h3>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="min-h-[120px] w-full rounded-md border border-black/20 bg-[#124D58] p-4 text-sm text-white placeholder:text-zinc-200 dark:border-white/20"
                placeholder="Describe el contenido..."
              />
            </div>

            {/* CAT + PORT */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* CURSO + TAGS */}
              <div>
                <h3
                  className="mb-3 text-lg font-semibold text-[#D46D85]"
                  style={titleFont}
                >
                  Categorías
                </h3>

                {/* ELEGIR CURSOOOOO */}
                <p className="mb-2 text-sm font-medium text-[#004B57]">
                  Curso
                </p>
                <div className="flex flex-wrap gap-2">
                  {COURSES.map((c) => {
                    const active = newCourse === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCourse(c)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          active
                            ? "border-[#124D58] bg-[#124D58] text-white"
                            : "border-[#124D58] text-[#124D58]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>

                {/* TAGS */}
                <p className="mt-4 mb-2 text-sm font-medium text-[#004B57]">
                  Etiquetas
                </p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((c) => {
                    const active = cats.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCat(c)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          active
                            ? "border-black/40 bg-[#D46D85] text-white"
                            : "border-[#D46D85]/60 bg-transparent text-[#D46D85]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PORTADA  */}
              <div>
                <h3
                  className="mb-3 text-lg font-semibold text-[#D46D85]"
                  style={titleFont}
                >
                  Portada
                </h3>

                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="mb-2 h-10 w-full rounded-md border border-black/20 bg-white px-3 text-xs text-zinc-800 placeholder:text-zinc-400 dark:border-white/20 dark:bg-black dark:text-white"
                  placeholder="https://tuservidor.com/portada.png"
                />

                <label className="mt-1 flex flex-col gap-1 text-xs text-zinc-700 dark:text-zinc-300">
                  Subir imagen de portada
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs"
                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  />
                  {coverFile && (
                    <span className="text-[11px] opacity-80">
                      Archivo seleccionado: {coverFile.name}
                    </span>
                  )}
                </label>

                <div className="mt-3 aspect-[4/3] w-full overflow-hidden rounded-md border border-black/15 bg-zinc-100 dark:border-white/20 dark:bg-zinc-900">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Portada"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs opacity-60">
                      Sin portada
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* VIDEO */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="mb-2 block text-sm font-medium text-[#D46D85]">
                  Vídeo (URL)
                </span>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="h-10 w-full rounded-md border border-black/20 bg-white px-3 text-xs text-zinc-800 placeholder:text-zinc-400 dark:border-white/20 dark:bg-black dark:text-white"
                  placeholder="https://tuservidor.com/video.mp4"
                />
              </div>

              <div>
                <span className="mb-1 block text-sm font-medium text-[#D46D85]">
                  Subir archivo de vídeo
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="text-xs"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                />
                {videoFile && (
                  <span className="mt-1 block text-[11px] text-zinc-700 opacity-80 dark:text-zinc-300">
                    Archivo seleccionado: {videoFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PARTE DERECHA: VISTA CARTAS */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-sm">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-black/15 bg-zinc-100 dark:border-white/20 dark:bg-zinc-900">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Portada preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs opacity-60">
                    Sin portada
                  </div>
                )}
              </div>

              <h3
                className="mt-3 text-lg font-semibold text-[#004B57]"
                style={titleFont}
              >
                {title || "Ejemplo 1"}
              </h3>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                {desc ||
                  "Descripción de ejemplo del contenido que se mostrará en esta clase."}
              </p>

              <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                {courseLabel}
              </p>

              <div className="mt-3 flex items-center gap-3 text-sm text-[#D46D85]">
                <button
                  type="button"
                  title="Descargar"
                  className="hover:opacity-80"
                >
                  ↓
                </button>
                <button
                  type="button"
                  title="Favorito"
                  className="hover:opacity-80"
                >
                  ☆
                </button>
                <button
                  type="button"
                  title="Ver código"
                  className="hover:opacity-80"
                >
                  {"</>"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES ABAJOooo */}
        <div className="mt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 rounded-md border border-black/20 bg-white px-5 text-sm text-[#D46D85] hover:bg-black/[.04] dark:border-white/25 dark:bg-black dark:text-white dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="h-9 rounded-md border border-black/20 bg-[#D46D85] px-6 text-sm font-medium text-white hover:bg-[#c55c77] dark:border-white/25"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- ZONA VIDEOOOOOOOO -------------------- */
function VideoModal({
  item,
  onClose,
}: {
  item: CardItem;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const hasVideo = !!item.videoUrl;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4">
      <div
        className="w-full max-w-3xl rounded-xl bg-white p-4 shadow-xl dark:bg-black"
        ref={panelRef}
        style={bodyFont}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold" style={titleFont}>
              {item.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {item.professor ?? item.author} · {item.course ?? "Sin curso"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>

        {hasVideo ? (
          <video
            src={item.videoUrl}
            controls
            autoPlay
            className="mt-4 w-full rounded-md bg-black"
          />
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-black/20 p-6 text-sm text-zinc-600 dark:border-white/30 dark:text-zinc-300">
            Esta tarjeta todavía no tiene ningún vídeo asociado.
            <br />
            Cuando conectes la base de datos, asegúrate de rellenar el campo{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-xs dark:bg-white/10">
              videoUrl
            </code>{" "}
            del <code>CardItem</code>.
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- Pagina con sidebaaaaar -------------------- */
export default function Page() {
  return (
    <div style={bodyFont}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Panel</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Clases</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Board />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
