"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type CardItem = {
  id: number;
  title: string;
  description: string;
  author: string;
  tag: string;
  date?: string; // YYYY-MM-DD
  course?: string;
  professor?: string;
  videoUrl?: string;
  coverUrl?: string;
  isFavorite?: boolean;
};

type Curso = {
  id_curso: number;
  nombre: string;
  grado: number | null;
  horario: {
    horario: string;
  } | null;
};

type OrderBy = "newest" | "oldest" | "favorites";
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov
];

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

const bodyFont = { fontFamily: '"Montserrat", system-ui, sans-serif' };
const titleFont = { fontFamily: '"Libre Baskerville", serif' };

const BLOCKED_TAGS = new Set([
  'audiovisual',
  'db',
  'edicion',
  'ia',
  'musica',
  'prog',
  'salud',
  'test',
  'web',
]);

const normalizeTag = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Misma API de fotos que se usa en home/noticias
const getPicsum = (seed: string | number, w = 800, h = 600) =>
  `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/${w}/${h}`;

function pickFirstNonEmpty(
  ...values: Array<string | null | undefined>
): string | undefined {
  const found = values.find(
    (v) => typeof v === "string" && v.trim() !== ""
  );
  return found?.trim();
}

function normalizeUrl(url?: string) {
  if (!url) return undefined;
  const trimmed = url.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  // 👉 Si el usuario pone youtube.com/...
  return "https://" + trimmed;
}

function isYouTube(url?: string) {
  if (!url) return false;

  try {
    const u = new URL(url);
    return (
      u.hostname.includes("youtube.com") ||
      u.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);

    // youtu.be/ID
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }

    // youtube.com/watch?v=ID
    const v = u.searchParams.get("v");
    if (v) {
      return `https://www.youtube.com/embed/${v}`;
    }

    // youtube.com/embed/ID
    if (u.pathname.startsWith("/embed/")) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}


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
    <div className="w-[260px] rounded-lg border border-black/20 bg-white p-3 text-sm text-black shadow-lg">
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
          <span className="rounded-md border border-black/20 px-2 py-0.5">
            {MONTHS[month]}
          </span>
          <span className="rounded-md border border-black/20 px-2 py-0.5">
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
                  ? "border border-black/30 font-semibold"
                  : "hover:bg-black/[.04]",
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

function capitalize(
  str?: string | { horario?: string | null } | null
) {
  const text =
    typeof str === "string"
      ? str
      : str && typeof str === "object"
        ? str.horario
        : "";
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* -------------------- MODAL CREAR -------------------- */
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
  tags,
  courses,
  newTag,
  setNewTag,
  addNewTag
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
  newCourse: Curso | null;
  setNewCourse: (v: Curso | null) => void;
  courses: Curso[];
  tags: string[];
  newTag: string;
  setNewTag: (v: string) => void;
  addNewTag: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fallbackCoverSeedRef = useRef(Date.now());
  const previewCoverSrc = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }

    return (
      pickFirstNonEmpty(coverUrl) ??
      getPicsum(`reunion-new-${fallbackCoverSeedRef.current}`)
    );
  }, [coverFile, coverUrl]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const randomCourses = useMemo(() => {
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    return {
      visible: shuffled.slice(0, 3),
      rest: shuffled.slice(3),
    };
  }, [courses]);

  const courseLabel = newCourse
  ? [
      newCourse.nombre,
      newCourse.grado ? `${newCourse.grado}º` : null,
      capitalize(newCourse.horario),
    ]
      .filter(Boolean)
      .join(" · ")
  : "Curso";
  const [showAllCourses, setShowAllCourses] = useState(false);

  const isValid =
    title.trim().length > 0 &&
    desc.trim().length > 0 &&
    newCourse !== null &&
    cats.length > 0;

  const missingFields = [];

  if (!title.trim()) missingFields.push("Título");
  if (!desc.trim()) missingFields.push("Descripción");
  if (!newCourse) missingFields.push("Curso");
  if (cats.length === 0) missingFields.push("Etiquetas");

  const missingText = missingFields.join(", ");

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/30 p-4 sm:p-8">
      <div
        ref={panelRef}
        className="mx-auto flex w-full max-w-5xl flex-col rounded-xl border border-black/10 bg-white shadow-xl overflow-hidden"
        style={bodyFont}
      >
        {/* PARTE ARRIBA */}
        <div className="mb-3 flex items-center justify-between border-b px-6 py-4">
          <h2
            className="text-xl font-semibold text-[#123d58]"
            style={bodyFont}
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

        <div className="flex flex-col gap-6 px-6 pb-6">
        {/* GRID PRINCIPAL */}
        <div className="grid gap-8 md:grid-cols-[1.4fr_1.1fr]">
          {/* COLUMNA IZQUIERDA */}
          <div className="flex flex-col gap-6">
            {/* TÍTULO */}
            <div>
              <h3
                className="mb-2 text-lg font-semibold text-[#123d58]"
                style={bodyFont}
              >
                Título
              </h3>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full rounded-md border border-[#dbe2e8] bg-white px-4 text-sm text-[#123d58] placeholder:text-[#123d58]/50 focus:outline-none focus:ring-2 focus:ring-[#123d58]/15"
                placeholder="Introduce un título..."
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <h3
                className="mb-2 text-lg font-semibold text-[#123d58]"
                style={bodyFont}
              >
                Descripción
              </h3>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="min-h-[120px] w-full resize-none rounded-md border border-[#dbe2e8] bg-white p-4 text-sm text-[#123d58] placeholder:text-[#123d58]/50 focus:outline-none focus:ring-2 focus:ring-[#123d58]/15"
                placeholder="Describe el contenido..."
              />
            </div>

            {/* CURSO + TAGS + PORTADA */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* CURSO + TAGS */}
              <div>
                <h3
                  className="mb-3 text-lg font-semibold text-[#123d58]"
                  style={bodyFont}
                >
                  Categorías
                </h3>

                {/* CURSO */}
                <p className="mb-2 text-sm font-medium text-[#123d58]">
                  Curso
                </p>
                <div className="flex flex-wrap gap-2">
                  {courses.length === 0 && (
                    <div className="rounded-md border border-dashed border-[#dbe2e8] px-3 py-2 text-xs text-[#123d58]/70">
                      No hay cursos para seleccionar
                    </div>
                  )}
                  {randomCourses.visible.map((c) => {
                    const active = newCourse?.id_curso === c.id_curso;
                    
                    return (
                      <button
                        key={c.id_curso}
                        type="button"
                        onClick={() => setNewCourse(c)}
                        className={`flex items-center justify-between gap-2 rounded-full border px-3 py-1 text-xs transition ${
                          active
                            ? "border-[#123d58] bg-[#123d58] text-white"
                            : "border-[#dbe2e8] bg-white text-[#123d58] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        <span className="max-w-[160px] truncate">
                          {c.nombre}
                          
                        </span>
                        <span className="text-[10px] opacity-70">{capitalize(c.horario)}</span>
                        <span className="text-[10px] opacity-70">{c.grado + 'º'}</span>
                      </button>
                    );
                  })}
                  
                  {/* CUARTO BOTÓN */}
                  {randomCourses.rest.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCourses((v) => !v)}
                      className="flex overflow-hidden items-center gap-2 rounded-full border border-dashed border-[#dbe2e8] px-3 py-1 text-xs text-[#123d58] hover:bg-[#f1f5f9]"
                    >
                      {newCourse ? (
                        <>
                          <span className="truncate max-w-[120px]">
                            {newCourse.nombre}
                          </span>
                          <span className="text-[10px] opacity-60">{newCourse?.horario?.horario}</span>
                        </>
                      ) : (
                        "Ver más"
                      )}
                    </button>
                  )}
                </div>

                {showAllCourses && (
                  <div className="mt-3 max-h-64 overflow-auto rounded-lg border border-black/10 bg-white shadow-sm">
                    {randomCourses.rest.map((c) => (
                      <button
                        key={c.id_curso}
                        type="button"
                        onClick={() => {
                          setNewCourse(c);
                          setShowAllCourses(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-black/[.04]"
                      >
                        <span>{c.nombre + ' · ' + capitalize(c.horario) + ' · ' + c.grado + 'º'}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* TAGS */}
                <p className="mt-4 mb-2 text-sm font-medium text-[#123d58]">
                  Etiquetas
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((c) => {
                    const active = cats.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCat(c)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          active
                            ? "border-[#123d58] bg-[#123d58] text-white"
                            : "border-[#dbe2e8] bg-white text-[#123d58] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();

                        const value = newTag.trim();
                        if (!value) return;

                        if (!tags.includes(value)) {
                          addNewTag();
                        }

                        toggleCat(value);
                        setNewTag("");
                      }
                    }}
                    placeholder="+"
                    className="h-8 w-20 rounded-md border border-dashed border-[#dbe2e8] bg-white px-2 text-sm text-[#123d58]"
                  />
                </div>
              </div>

              {/* PORTADA */}
              <div>
                <h3
                  className="mb-3 text-lg font-semibold text-[#123d58]"
                  style={bodyFont}
                >
                  Portada
                </h3>

                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="mb-2 h-10 w-full rounded-md border border-[#dbe2e8] bg-white px-3 text-xs text-[#123d58] placeholder:text-[#123d58]/50"
                  placeholder="https://tuservidor.com/portada.png"
                />

                <div className="mt-2">
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                        alert("❌ Solo se permiten imágenes (JPG, PNG, WEBP)");
                        e.target.value = "";
                        return;
                      }

                      setCoverFile(file);
                    }}
                  />

                  <label
                    htmlFor="cover-upload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#dbe2e8] bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#123d58] transition hover:bg-[#eef2f5]"
                  >
                    {coverFile ? "Cambiar imagen" : "Subir imagen de portada"}
                  </label>

                  {coverFile && (
                    <p className="mt-1 text-[11px] text-[#123d58]/60">
                      Archivo seleccionado: <span className="font-medium">{coverFile.name}</span>
                    </p>
                  )}
                </div>
                {/* ───── VÍDEO ───── */}
                <div className="grid gap-3 mt-4">
                  <span className="text-sm font-medium text-[#123d58]">
                    Vídeo
                  </span>

                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#dbe2e8] bg-white px-3 text-xs text-[#123d58] placeholder:text-[#123d58]/50"
                    placeholder="https://tuservidor.com/video.mp4"
                  />

                  <div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
                          alert("❌ Solo se permiten vídeos (MP4, WEBM, MOV)");
                          e.target.value = "";
                          return;
                        }

                        setVideoFile(file);
                        setVideoUrl("");
                      }}
                    />

                    <label
                      htmlFor="video-upload"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#dbe2e8] bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#123d58] transition hover:bg-[#eef2f5]"
                    >
                      {videoFile ? "Cambiar vídeo" : "Subir vídeo"}
                    </label>

                    {videoFile && (
                      <p className="mt-1 text-[11px] text-[#123d58]/60">
                        Archivo seleccionado:{" "}
                        <span className="font-medium">{videoFile.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PREVIEW */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-sm">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-[#dbe2e8] bg-[#f8fafc]">
                <img
                  src={previewCoverSrc}
                  alt="Portada preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <h3
                className="mt-3 text-lg font-semibold text-[#123d58]"
                style={bodyFont}
              >
                {title || "Ejemplo"}
              </h3>
              <p className="mt-1 text-sm text-[#123d58]/80">
                {desc ||
                  "Descripción de ejemplo del contenido que se mostrará en esta clase."}
              </p>

              <p className="mt-2 text-[11px] text-[#123d58]/60">
                {courseLabel}
              </p>

              <div className="mt-3 flex items-center gap-3 text-sm text-[#123d58]/70">
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

        {/* BOTONES ABAJO */}
        <div className="mt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 rounded-md border border-[#dbe2e8] bg-white px-5 text-sm text-[#123d58] hover:bg-[#f8fafc]"
          >
            Cancelar
          </button>
          <div className="relative group">
          <button
            onClick={() => {
              if (!isValid) return;
              onSave();
            }}
            disabled={!isValid}
            className={`h-9 rounded-md border border-[#123d58]/20 px-6 text-sm font-medium text-white transition
              ${
                isValid
                  ? "bg-[#123d58] hover:bg-[#0f344b]"
                  : "bg-[#123d58]/40 cursor-not-allowed"
              }
            `}
          >
            Siguiente
          </button>

          {!isValid && (
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-max max-w-xs rounded-md bg-black px-3 py-2 text-xs text-white opacity-0 transition group-hover:opacity-100">
              Falta completar: <span className="font-semibold">{missingText}</span>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
    </div>
  );
}

/* -------------------- MODAL VIDEO -------------------- */
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

  const normalizedVideoUrl = normalizeUrl(item.videoUrl);
  const hasVideo = !!normalizedVideoUrl;
  const isYT = isYouTube(normalizedVideoUrl);
  const ytEmbed = normalizedVideoUrl
    ? getYouTubeEmbedUrl(normalizedVideoUrl)
    : null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4">
      <div
        ref={panelRef}
        className="mx-auto flex max-h-[90vh] w-full max-w-5xl flex-col gap-6 overflow-y-auto rounded-xl bg-[#F5F5F5] p-6 shadow-xl"
        style={bodyFont}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold" style={titleFont}>
              {item.title}
            </h2>
            <p className="text-xs text-zinc-500">
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
          isYT && ytEmbed ? (
            <iframe
              src={ytEmbed}
              className="mt-4 aspect-video w-full rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={item.videoUrl}
              controls
              autoPlay
              className="mt-4 w-full rounded-md bg-black"
            />
          )
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-black/20 p-6 text-sm text-zinc-600">
            <p>Esta clase todavía no tiene ningún vídeo asociado.</p>
            <p className="mt-2 text-xs opacity-80">
              Cuando se suba un vídeo o se rellene este campo en la base de
              datos, podrás reproducirlo aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- CARD -------------------- */
function Card({
  it,
  onOpen,
  onToggleFavorite,
}: {
  it: CardItem;
  onOpen: (it: CardItem) => void;
  onToggleFavorite: (id: number) => void;
}) {
  const canFav = !!it.videoUrl;
  const fav = !!it.isFavorite;
  const badgeLabel = it.course ?? it.tag;
  const coverSrc =
    pickFirstNonEmpty(it.coverUrl) ?? getPicsum(`reunion-${it.id}`);

  return (
    <article
      onClick={() => onOpen(it)}
      className="group cursor-pointer"
      style={bodyFont}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#123d58] bg-[#123d58] shadow-xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={coverSrc}
            alt={it.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#123d58] to-transparent opacity-70" />

          {badgeLabel && (
            <div className="absolute top-4 right-4 rounded-md bg-[#D65A7E] px-3 py-1 text-xs font-semibold text-white shadow-lg">
              {badgeLabel}
            </div>
          )}

          {it.videoUrl && (
            <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
              Reproducir vídeo
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-5 pt-4 pb-4">
          <h3
            className="mb-2 text-lg font-bold text-white line-clamp-2 group-hover:text-[#D65A7E] transition-colors"
            style={titleFont}
          >
            {it.title}
          </h3>

          <p className="text-sm text-gray-300 line-clamp-2">
            {it.description}
          </p>

          <div className="mt-4 flex items-center justify-between text-xs text-white/80">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full border border-white/20" />
              <span>{it.author}</span>
            </div>
            <button
              type="button"
              title="favorito"
              onClick={(e) => {
                e.stopPropagation();
                if (!canFav) return;
                onToggleFavorite(it.id);
              }}
              className={canFav ? "text-base hover:opacity-80" : "cursor-not-allowed opacity-30"}
            >
              {fav ? "★" : "☆"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------- ELEGIR PROFESOR -------------------- */
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
      className="absolute left-0 top-11 z-50 w-56 rounded-lg border border-black/10 bg-white p-2 text-sm shadow-lg"
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
          className="h-8 w-full rounded-md border border-black/10 bg-white pl-6 pr-2 text-xs"
        />
      </div>

      <div className="max-h-44 overflow-auto">
        {list.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-black/[.04]"
          >
            <span className="h-5 w-5 rounded-full border border-black/10" />
            {p}
          </button>
        ))}
        {!list.length && (
          <div className="px-2 py-2 text-xs opacity-60">No hay resultados</div>
        )}
      </div>

      <button
        onClick={onClear}
        className="mt-2 w-full rounded-md px-2 py-2 text-left text-xs opacity-60 hover:bg-black/[.04]"
      >
        Quitar filtro
      </button>
    </div>
  );
}

export const Board = React.forwardRef<
  { openCreate: () => void },
  {}
>(function Board(_, ref) {
  const [courses, setCourses] = useState<any[]>([]);
  const [items, setItems] = useState<CardItem[]>([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(
    null
  );

  const [openFilter, setOpenFilter] =
    useState<"fecha" | "curso" | "profesor" | null>(null);

  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);
  const [openOrder, setOpenOrder] = useState(false);

  const fechaRef = useRef<HTMLDivElement>(null);
  const cursoRef = useRef<HTMLDivElement>(null);
  const profesorRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);

  // BOTÓN CREAR
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCats, setNewCats] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newCourse, setNewCourse] = useState<Curso | null>(null);
  const [currentUserName, setCurrentUserName] = useState("Profesor");
  const [currentUserId, setCurrentUserId] = useState(1);

  // MODAL VIDEO
  const [activeVideoItem, setActiveVideoItem] = useState<CardItem | null>(null);

  useEffect(() => {
    const storedName = sessionStorage.getItem("ifphub_user_name")?.trim();
    if (storedName) {
      setCurrentUserName(storedName);
    }

    const storedUid = sessionStorage.getItem("uid");
    const parsedUid = storedUid ? Number(storedUid) : NaN;
    if (Number.isFinite(parsedUid)) {
      setCurrentUserId(parsedUid);
    }
  }, []);
  
  useEffect(() => {
    if (isCreateOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreateOpen]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/cursos");
        if (!res.ok) throw new Error("Error al cargar datos");

        const data = await res.json();

        // 👇 si la api devuelve SOLO cursos
        if (Array.isArray(data)) {
          setCourses(data);
          return;
        }

        // 👇 si luego decides devolver más cosas
        if (data.cursos) {
          setCourses(data.cursos);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  // CARGAR REUNIONES DESDE /api/reuniones
  useEffect(() => {
    async function fetchReuniones() {
      try {
        const res = await fetch("/api/reuniones");
        if (!res.ok) throw new Error("Error al obtener reuniones");

        const data = await res.json();

        type ReunionFromDB = {
          id_reuniones: number;
          titulo: string | null;
          descripcion: string | null;
          tag: string | null;
          profesor: string | null;
          date: string | null;
          video: string | null;
          id_usuario: number | null;
          id_curso: number | null;
          portada?: string | null;
          portada_url?: string | null;
          cover?: string | null;
          imagen?: string | null;
          imagen_url?: string | null;
          // si luego en el RPC devuelves nombre de curso, lo añades aquí
          // curso_nombre?: string | null;
        };

        const mapped: CardItem[] = (data as ReunionFromDB[]).map((r) => ({
          id: r.id_reuniones,
          title: r.titulo ?? "Sin título",
          description: r.descripcion ?? "Sin descripción",
          author: r.profesor ?? "Profesor",
          tag: r.tag ?? "",
          date: r.date ?? undefined,
          // course: r.curso_nombre ?? undefined,
          course: undefined,
          professor: r.profesor ?? undefined,
          videoUrl: r.video ?? undefined,
          coverUrl: pickFirstNonEmpty(
            r.portada,
            r.portada_url,
            r.cover,
            r.imagen,
            r.imagen_url
          ),
          isFavorite: false,
        }));

        setItems(mapped);
      } catch (err) {
        console.error(err);
      }
    }

    fetchReuniones();
  }, []);

    // TAGS DINÁMICOS (a partir de lo que viene de la BD)
    const TAGS = useMemo(() => {
      const set = new Set<string>();
      items.forEach((it) => {
        if (it.tag && it.tag.trim()) set.add(it.tag.trim());
      });
      return Array.from(set).sort();
    }, [items]);

    const ALL_TAGS = useMemo(() => {
      const set = new Set([...TAGS, ...customTags]);
      return Array.from(set)
        .filter((tag) => !BLOCKED_TAGS.has(normalizeTag(tag)))
        .sort();
    }, [TAGS, customTags]);

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

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (!openOrder) return;
      const ref = orderRef.current;
      if (ref && !ref.contains(target)) setOpenOrder(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openOrder]);

  const PROFESSORS = useMemo(() => {
    const setP = new Set(items.map((i) => i.professor ?? i.author));
    return Array.from(setP);
  }, [items]);

  const toggleCat = (c: string) => {
    setNewCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const addNewTag = () => {
    const value = newTag.trim();
    if (!value) return;

    if (!customTags.includes(value) && !TAGS.includes(value)) {
      setCustomTags((prev) => [...prev, value]);
    }

    setNewCats((prev) =>
      prev.includes(value) ? prev : [...prev, value]
    );

    setNewTag("");
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = query.toLowerCase();
      const matchesQuery =
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q);

      const matchesTag = activeTag
        ? it.tag === activeTag || !TAGS.includes(activeTag)
        : true;
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

  const ordered = useMemo(() => {
    const arr = [...filtered];
    const t = (d?: string) => (d ? new Date(d).getTime() : -Infinity);

    if (orderBy === "newest") {
      return arr.sort((a, b) => t(b.date) - t(a.date));
    }

    if (orderBy === "oldest") {
      return arr.sort((a, b) => t(a.date) - t(b.date));
    }

    if (orderBy === "favorites") {
      return arr.sort((a, b) => {
        const fb = Number(Boolean(b.isFavorite) && Boolean(b.videoUrl));
        const fa = Number(Boolean(a.isFavorite) && Boolean(a.videoUrl));
        if (fb !== fa) return fb - fa;
        return t(b.date) - t(a.date);
      });
    }

    return arr;
  }, [filtered, orderBy]);

  const toggleFavorite = (id: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, isFavorite: Boolean(it.videoUrl) ? !it.isFavorite : it.isFavorite }
          : it
      )
    );
  };

  const saveNewItem = async () => {
    if (!newTitle.trim() || !newCourse || newCats.length === 0) return;

    try {
      const formData = new FormData();

      formData.append("titulo", newTitle);
      formData.append("descripcion", newDesc);
      formData.append("tag", newCats[0]);
      formData.append("profesor", currentUserName);
      formData.append(
        "date",
        selectedDate?.toISOString().slice(0, 10) ?? ""
      );
      formData.append("id_usuario", String(currentUserId));
      formData.append("id_curso", String(newCourse.id_curso));

      if (newCoverFile) formData.append("cover", newCoverFile);
      if (newCoverUrl.trim()) {
        formData.append("cover_url", newCoverUrl.trim());
      }

      if (newVideoUrl.trim()) {
        formData.append("video_url", newVideoUrl.trim());
      }

      const res = await fetch("/api/reuniones/create", {
        method: "POST",
        body: formData, // ✅ SIN headers
      });

      if (!res.ok) throw new Error("Error al crear reunión");

      const { id_reunion } = await res.json();

      if (newVideoFile) {
        const videoForm = new FormData();
        videoForm.append("id_reunion", String(id_reunion));
        videoForm.append("video", newVideoFile);

        const videoRes = await fetch("/api/reuniones/upload-video", {
          method: "POST",
          body: videoForm,
        });

        if (!videoRes.ok) {
          throw new Error("Error subiendo el vídeo");
        }
      }

      // 🔄 Recargar reuniones
      const reload = await fetch("/api/reuniones");
      const data = await reload.json();

      setItems(
        data.map((r: any) => ({
          id: r.id_reuniones,
          title: r.titulo ?? "Sin título",
          description: r.descripcion ?? "",
          author: r.profesor ?? "Profesor",
          tag: r.tag ?? "",
          date: r.date ?? undefined,
          videoUrl: r.video ?? undefined,
          coverUrl: pickFirstNonEmpty(
            r.portada,
            r.portada_url,
            r.imagen_url
          ),
          isFavorite: false,
        }))
      );

      // 🧹 limpiar
      setCreateOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewCats([]);
      setNewVideoUrl("");
      setNewCoverUrl("");
      setNewCoverFile(null);
      setNewVideoFile(null);
      setNewCourse(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la reunión");
    }
  };

  const openCard = (it: CardItem) => {
    setActiveVideoItem(it);
  };

  const openCreateModal = () => {
    setNewCourse(null);
    setCreateOpen(true);
  };

  React.useImperativeHandle(ref, () => ({
    openCreate: openCreateModal,
  }));

  return (
    
    <div className="w-full px-4 sm:px-6 lg:px-10" style={bodyFont}>
      <div className="mx-auto w-full max-w-6xl">
        {/* CONTROLES */}
        <div className="w-full space-y-4">
          {/* BUSCADOR + ORDEN */}
          <div className="flex w-full flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscador"
                className="h-11 w-full rounded-lg border border-[#123d58]/20 bg-white/90 pl-10 pr-3 text-sm text-[#123d58] placeholder:text-[#123d58]/50 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123d58]/20"
              />
            </div>

            <div ref={orderRef} className="relative">
              <button
                onClick={() => setOpenOrder((v) => !v)}
                className="h-10 w-36 shrink-0 rounded-lg border border-[#123d58]/25 bg-[#f5f7f9] text-sm text-[#123d58] transition hover:bg-[#eef2f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123d58]/15"
              >
                Ordenar por &nbsp;›
              </button>

              {openOrder && (
                <div className="absolute right-0 top-11 z-50 w-48 rounded-lg border border-black/10 bg-white p-1 text-sm shadow-lg">
                  <button
                    onClick={() => {
                      setOrderBy("newest");
                      setOpenOrder(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left hover:bg-black/[.04]"
                  >
                    Más nuevos
                  </button>
                  <button
                    onClick={() => {
                      setOrderBy("oldest");
                      setOpenOrder(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left hover:bg-black/[.04]"
                  >
                    Más viejos
                  </button>
                  <button
                    onClick={() => {
                      setOrderBy("favorites");
                      setOpenOrder(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left hover:bg-black/[.04]"
                  >
                    Favoritos
                  </button>
                  <button
                    onClick={() => {
                      setOrderBy(null);
                      setOpenOrder(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left opacity-60 hover:bg-black/[.04]"
                  >
                    Quitar orden
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FILTROS */}
          <div className="flex w-full flex-wrap items-center gap-3">
            {/* FECHA */}
            <div ref={fechaRef} className="relative flex items-center gap-2">
              <button
                onClick={() =>
                  setOpenFilter(openFilter === "fecha" ? null : "fecha")
                }
                className="flex h-9 w-36 items-center justify-between rounded-lg border border-[#123d58]/25 bg-[#f5f7f9] px-3 text-sm text-[#123d58] transition hover:bg-[#eef2f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123d58]/15"
              >
                <span className="text-black">
                  {selectedDate ? selectedDate.toLocaleDateString() : "Fecha"}
                </span>
                <span className="text-xs opacity-60">▾</span>
              </button>

              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(null);
                    setOpenFilter(null);
                  }}
                  className="h-8 w-8 rounded-lg border border-[#123d58]/20 bg-white text-sm text-[#123d58]/70 transition hover:bg-[#eef2f5] hover:text-[#123d58]"
                  aria-label="Quitar filtro de fecha"
                >
                  ✕
                </button>
              )}

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
                className="flex h-9 w-60 items-center justify-between rounded-lg border border-[#123d58]/25 bg-[#f5f7f9] px-3 text-sm text-[#123d58] transition hover:bg-[#eef2f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123d58]/15"
              >
                <span className="text-black">{selectedCourse ?? "Curso"}</span>
                <span className="text-xs opacity-60">▾</span>
              </button>

              {openFilter === "curso" && (
                <div className="absolute left-0 top-11 z-50 w-80 max-h-32 overflow-auto rounded-lg border border-black/10 bg-white p-1 text-sm shadow-lg">
                  {courses.length === 0 && (
                    <div className="px-3 py-2 text-xs opacity-60">
                      No hay cursos disponibles
                    </div>
                  )}
                  {courses.map((c) => (
                    <button
                      key={c.id_curso}
                      onClick={() => {
                        setSelectedCourse(c.nombre);
                        setOpenFilter(null);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left hover:bg-black/[.04]"
                    >
                      {c.nombre}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedCourse(null);
                      setOpenFilter(null);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left opacity-60 hover:bg-black/[.04]"
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
                className="flex h-9 w-36 items-center justify-between rounded-lg border border-[#123d58]/25 bg-[#f5f7f9] px-3 text-sm text-[#123d58] transition hover:bg-[#eef2f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123d58]/15"
              >
                <span className="text-black">
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
          </div>

          {/* TAGS FILTRO */}
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => {
              const active = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(active ? null : tag)}
                  className={`h-8 rounded-md border px-3 text-sm transition hover:bg-black/[.04] ${
                    active
                      ? "border-[#124D58] bg-[#124D58] text-white"
                      : "border-black/20 bg-white text-black"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* GRID DE CARDS */}
        <section className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ordered.map((it) => (
            <Card
              key={it.id}
              it={it}
              onOpen={openCard}
              onToggleFavorite={toggleFavorite}
            />
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
          tags={ALL_TAGS}
          courses={courses}
          newTag={newTag}
          setNewTag={setNewTag}
          addNewTag={addNewTag}
        />
      )}

      {/* MODAL VIDEO */}
      {activeVideoItem && (
        <VideoModal
          item={activeVideoItem}
          onClose={() => setActiveVideoItem(null)}
        />
      )}
    </div>
  );
});

export default function HomePage() {
  return <Board />;
}
