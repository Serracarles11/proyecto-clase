"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type CardItem = {
  id: number;
  title: string;
  description: string;
  author: string;
  tag: string;
  date?: string; // YYYY-MM-DD
  course?: string;
  professor?: string;
};

const INITIAL_ITEMS: CardItem[] = [
  {
    id: 1,
    title: "REACT",
    description: "En esta clase se practicara y se aprendera a usar funciones de react.",
    author: "Jorge Aguirre",
    tag: "React",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-02",
  },
  {
    id: 2,
    title: "Next.js",
    description: "Aprende a crear aplicaciones web rápidas y modernas con Next.js.",
    author: "Jorge Aguirre",
    tag: "Web",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-04",
  },
  {
    id: 3,
    title: "Tailwind CSS",
    description: "Descubre cómo diseñar páginas web profesionales con Tailwind CSS.",
    author: "Jorge Aguirre",
    tag: "Web",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-06",
  },
  {
    id: 4,
    title: "MySQL",
    description: "En este video aprenderás a crear, consultar y optimizar bases de datos usando MySQL.",
    author: "Jorge Aguirre",
    tag: "BBDD",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-08",
  },
  {
    id: 5,
    title: "RCP",
    description: "En esta clase se practicara y se aprendera a hacer una rcp.",
    author: "Jorge Aguirre",
    tag: "Salud",
    course: "ENFERMERIA",
    professor: "Jorge Aguirre",
    date: "2025-10-10",
  },
  {
    id: 6,
    title: "Python",
    description: "Aprende los fundamentos de la programacion con Python.",
    author: "Jorge Aguirre",
    tag: "Prog",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-12",
  },
  {
    id: 7,
    title: "After Effects",
    description: "Descubre cómo crear animaciones y efectos visuales con Adobe After Effects.",
    author: "Jorge Aguirre",
    tag: "Edición",
    course: "Producción de Audiovisuales",
    professor: "Jorge Aguirre",
    date: "2025-10-14",
  },
  {
    id: 8,
    title: "Producción Musical",
    description: "Aprende a mezclar canciones, crear tus propios beats y usar herramientas de DJ.",
    author: "Jorge Aguirre",
    tag: "Música",
    course: "DJ",
    professor: "Jorge Aguirre",
    date: "2025-10-16",
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
  "ENE","FEB","MAR","ABR","MAY","JUN",
  "JUL","AGO","SEP","OCT","NOV","DIC",
];

/* -------------------- Mini Calendar -------------------- */
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
    
    <div className="w-[260px] rounded-lg border border-black/10 bg-white p-3 text-sm shadow-lg dark:border-white/15 dark:bg-black bg-[#D46D85]">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => {
            const m = month - 1;
            if (m < 0) { setMonth(11); setYear(year - 1); }
            else setMonth(m);
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
            if (m > 11) { setMonth(0); setYear(year + 1); }
            else setMonth(m);
          }}
          className="px-2 text-lg leading-none opacity-70 hover:opacity-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs opacity-70">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
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
                  ? "border border-black/30 dark:border-white/50 font-semibold"
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

/* -------------------- Card -------------------- */
function Card({ it, onOpen }: { it: CardItem; onOpen: (it: CardItem) => void }) {
  return (
    <article
      onClick={() => onOpen(it)}
      className="group flex cursor-pointer flex-col gap-2"
    >
      {/* Caja placeholder sin imagen */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-black/10 bg-white dark:border-white/15 dark:bg-black grid place-items-center text-xs opacity-60">
        Sin imagen
      </div>

      <h3 className="text-[18px] font-semibold leading-6 text-black dark:text-zinc-50">
        {it.title}
      </h3>

      <p className="text-sm leading-5 text-zinc-700 dark:text-zinc-400">
        {it.description}
      </p>

      <div className="mt-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span title="descargar">↓</span>
          <span title="favorito">★</span>
          <span title="guardado">🔖</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border border-black/10 dark:border-white/15" />
          <span>{it.author}</span>
        </div>
      </div>
    </article>
  );
}

/* -------------------- Main Board -------------------- */
export default function Board() {
  const [items, setItems] = useState<CardItem[]>(INITIAL_ITEMS);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);

  const [openFilter, setOpenFilter] =
    useState<"fecha" | "curso" | "profesor" | null>(null);

  const fechaRef = useRef<HTMLDivElement>(null);
  const cursoRef = useRef<HTMLDivElement>(null);
  const profesorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      const map = { fecha: fechaRef, curso: cursoRef, profesor: profesorRef } as const;
      if (!openFilter) return;
      const ref = map[openFilter].current;
      if (ref && !ref.contains(target)) setOpenFilter(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openFilter]);

  const PROFESSORS = useMemo(() => {
    const setP = new Set(items.map(i => i.professor ?? i.author));
    return Array.from(setP);
  }, [items]);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCats, setNewCats] = useState<string[]>([]);

  const toggleCat = (c: string) => {
    setNewCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
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

      return matchesQuery && matchesTag && matchesCourse && matchesProfessor && matchesDate;
    });
  }, [items, query, activeTag, selectedCourse, selectedProfessor, selectedDate]);

  const saveNewItem = () => {
    const nextId = items.length + 1;
    const tagToUse = newCats[0] ?? "React";

    setItems(prev => [
      ...prev,
      {
        id: nextId,
        title: newTitle.trim() || `Nuevo ${nextId}`,
        description: newDesc.trim() || "Sin descripción.",
        author: "Jorge Aguirre",
        tag: tagToUse,
        course: selectedCourse ?? "DAW/DAM",
        professor: selectedProfessor ?? "Jorge Aguirre",
        date: selectedDate ? selectedDate.toISOString().slice(0,10) : undefined,
      }
    ]);

    setCreateOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewCats([]);
  };

  const openCard = (it: CardItem) => {
    console.log("open card", it);
    // luego: router.push(`/clase/${it.id}`)
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">

        {/* TOP CONTROLS */}
        <div className="flex w-full flex-wrap items-center gap-3">
          {/* FECHA */}
          <div ref={fechaRef} className="relative">
            <button
              onClick={() => setOpenFilter(openFilter === "fecha" ? null : "fecha")}
              className="
                h-9 w-36 rounded-md border border-black/10  px-3 text-sm text-zinc-800
                dark:border-white/15 dark:bg-black dark:text-zinc-200
                flex items-center justify-between    h-9 w-36 rounded-md border border-black/10  px-3 text-sm text-zinc-800   bg-[#D46D85] dark:text-zinc-200   flex items-center justify-between   
              "
            >
              <span className="text-white">{selectedDate ? selectedDate.toLocaleDateString() : "Fecha"}</span>
              <span className="text-xs opacity-60">▾</span>
            </button>

            {openFilter === "fecha" && (
              <div className="absolute left-0 top-11 z-50">
                <MiniCalendar
                  value={selectedDate}
                  onChange={(d) => { setSelectedDate(d); setOpenFilter(null); }}
                />
              </div>
            )}
          </div>

          {/* CURSO */}
          <div ref={cursoRef} className="relative">
            <button
              onClick={() => setOpenFilter(openFilter === "curso" ? null : "curso")}
              className="
                h-9 w-36 rounded-md border border-black/10 bg-[#D46D85] px-3 text-sm text-zinc-800
                dark:border-white/15 dark:bg-black dark:text-zinc-200
                flex items-center justify-between
              "
            >
              <span className="text-white">{selectedCourse ?? "Curso"}</span>
              <span className="text-xs opacity-60">▾</span>
            </button>

            {openFilter === "curso" && (
              <div className="absolute left-0 top-11 z-50 w-56 rounded-lg border border-black/10 bg-white p-1 text-sm shadow-lg dark:border-white/15 dark:bg-black">
                {COURSES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setSelectedCourse(c); setOpenFilter(null); }}
                    className="w-full rounded-md px-3 py-2 text-left hover:bg-black/[.04] dark:hover:bg-white/10"
                  >
                    {c}
                  </button>
                ))}
                <button
                  onClick={() => { setSelectedCourse(null); setOpenFilter(null); }}
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
              onClick={() => setOpenFilter(openFilter === "profesor" ? null : "profesor")}
              className="
                h-9 w-36 rounded-md border border-black/10 bg-[#D46D85] px-3 text-sm text-zinc-800
                dark:border-white/15 dark:bg-black dark:text-zinc-200
                flex items-center justify-between text-white
              "
            >
              <span className="text-white">{selectedProfessor ?? "Profesor"}</span>
              <span className="text-xs opacity-60">▾</span>
            </button>

            {openFilter === "profesor" && (
              <ProfessorPopover
                professors={PROFESSORS}
                onPick={(p) => { setSelectedProfessor(p); setOpenFilter(null); }}
                onClear={() => { setSelectedProfessor(null); setOpenFilter(null); }}
              />
            )}
          </div>

          {/* CREAR */}
          <button
            onClick={() => setCreateOpen(true)}
            className="
              h-9 rounded-md border border-black/10 px-4 text-sm 
              hover:bg-black/[.04] dark:border-white/15  dark:hover:bg-white/10 bg-[#D46D85] text-white
            "
          >
            + crear
          </button>
        </div>

        {/* SEARCH + SORT */}
        <div className="mt-4 flex w-full items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60"></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscador"
              className="
                h-10 w-full rounded-md border border-black/10  pl-9 pr-3 text-sm
                text-zinc-900 placeholder:text-zinc-400
                dark:border-white/15 dark:bg-black dark:text-zinc-100 dark:placeholder:text-zinc-600 bg-[#124D58]
              "
            />
          </div>

          <button
            className="
              h-10 w-32 shrink-0 rounded-md border border-black/10 text-sm text-zinc-900
              hover:bg-black/[.04] dark:border-white/15 dark:text-zinc-100 dark:hover:bg-white/10 bg-[#124D58]
            "
          >
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
                className={`
                  h-8 rounded-md border px-3 text-sm text-white
                  ${active ? "border-black/30 dark:border-white/40" : "border-black/10 dark:border-white/15"}
                  
                  hover:bg-black/[.04] dark:hover:bg-white/10 text-white bg-[#D46D85]
                `} 
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* GRID */}
        <section
          className="
            mt-8 grid gap-x-6 gap-y-8
            grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
          "
        >
          {filtered.map((it) => (
            <Card key={it.id} it={it} onOpen={openCard} />
          ))}
        </section>
      </div>

      {/* MODAL CREAR */}
      {isCreateOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          title={newTitle}
          setTitle={setNewTitle}
          desc={newDesc}
          setDesc={setNewDesc}
          cats={newCats}
          toggleCat={toggleCat}
          onSave={saveNewItem}
        />
      )}
    </div>
  );
}

/* -------------------- Profesor Popover -------------------- */
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
  const list = professors.filter(p => p.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="absolute left-0 top-11 z-50 w-56 rounded-lg border border-black/10 bg-white p-2 text-sm shadow-lg dark:border-white/15 dark:bg-black">
      <div className="relative mb-2">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs opacity-60">🔍</span>
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

/* -------------------- Create Modal -------------------- */
function CreateModal({
  onClose,
  title,
  setTitle,
  desc,
  setDesc,
  cats,
  toggleCat,
  onSave,
}: {
  onClose: () => void;
  title: string;
  setTitle: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  cats: string[];
  toggleCat: (c: string) => void;
  onSave: () => void;
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

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 p-4 sm:p-8">
      <div
        ref={panelRef}
        className="
          mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 rounded-xl  p-5 shadow-xl
          dark:bg-black sm:grid-cols-[1.2fr_0.8fr] bg-[#F5F5F5]
        "
      >
        {/* LEFT FORM */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Crear contenido</h2>
            <button onClick={onClose} className="text-xl opacity-70 hover:opacity-100">×</button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-md border border-black/10 px-3 text-sm dark:border-white/15 dark:bg-black"
              placeholder="Introduce un título..."
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Descripción</span>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="min-h-[110px] rounded-md border border-black/10 p-3 text-sm dark:border-white/15 dark:bg-black"
              placeholder="Describe el contenido..."
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Categorías</span>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((c) => {
                const active = cats.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className={`
                      h-8 rounded-md border px-3 text-sm bg-[#D46D85]
                      ${active ? "border-black/30 dark:border-white/40" : "border-black/10 dark:border-white/15"}
                      hover:bg-black/[.04] dark:hover:bg-white/10
                    `}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="h-9 rounded-md border border-black/10 px-4 text-sm hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10 bg-[#D46D85]"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="h-9 rounded-md border border-black/20 px-4 text-sm font-medium hover:bg-black/[.06] dark:border-white/25 dark:hover:bg-white/10 bg-[#D46D85]"
            >
              Guardar
            </button>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium opacity-80">Vista Previa</h3>

          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-black/10 bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 grid place-items-center text-sm opacity-60">
            Sin portada
          </div>

          <div>
            <h4 className="text-base font-semibold">{title || "Título..."}</h4>
            <p className="mt-1 text-sm opacity-80">
              {desc || "Descripción..."}
            </p>

            <div className="mt-2 flex flex-wrap gap-1">
              {cats.length ? cats.map(c => (
                <span key={c} className="rounded border border-black/10 px-2 py-0.5 text-xs dark:border-white/15">
                  {c}
                </span>
              )) : (
                <span className="text-xs opacity-60">Sin categorías</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
