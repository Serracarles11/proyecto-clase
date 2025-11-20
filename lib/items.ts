// lib/items.ts
export type CardItem = {
  id: number;
  title: string;
  description: string;
  author: string;
  tag: string;
  date?: string; // YYYY-MM-DD
  course?: string;
  professor?: string;
};

export const ITEMS: CardItem[] = [
  {
    id: 1,
    title: "Introducción a React",
    description: "apende a estructur primras aplicacs con rcut.",
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
    description: "Crear, consultar y optimizar bases de datos usando MySQL.",
    author: "Jorge Aguirre",
    tag: "BBDD",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-08",
  },
  {
    id: 5,
    title: "RCP",
    description: "Aprenderás a hacer una RCP con seguridad.",
    author: "Jorge Aguirre",
    tag: "Salud",
    course: "ENFERMERIA",
    professor: "Jorge Aguirre",
    date: "2025-10-10",
  },
  {
    id: 6,
    title: "Python",
    description: "Fundamentos de programación con Python.",
    author: "Jorge Aguirre",
    tag: "Prog",
    course: "DAW/DAM",
    professor: "Jorge Aguirre",
    date: "2025-10-12",
  },
  {
    id: 7,
    title: "After Effects",
    description: "Animaciones y efectos visuales con AE.",
    author: "Jorge Aguirre",
    tag: "Edición",
    course: "Producción de Audiovisuales",
    professor: "Jorge Aguirre",
    date: "2025-10-14",
  },
  {
    id: 8,
    title: "Producción Musical",
    description: "Crea beats y mezcla canciones.",
    author: "Jorge Aguirre",
    tag: "Música",
    course: "DJ",
    professor: "Jorge Aguirre",
    date: "2025-10-16",
  },
];
