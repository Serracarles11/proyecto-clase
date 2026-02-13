import { NextResponse } from "next/server";
import { createClient } from "@/backend/utils/supabase/server";

type CursoRow = {
  id_curso: number;
  nombre: string | null;
  grado: number | null;
  horario?: { horario?: string | null } | null;
};

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cursos")
      .select("id_curso, nombre, grado, horario")
      .order("nombre", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const cursos = ((data ?? []) as CursoRow[])
      .filter((c) => typeof c.id_curso === "number" && Boolean(c.nombre))
      .map((c) => ({
        id_curso: c.id_curso,
        nombre: c.nombre ?? "Curso",
        grado: c.grado ?? null,
        horario:
          c.horario && typeof c.horario === "object"
            ? { horario: c.horario.horario ?? "" }
            : null,
      }));

    return NextResponse.json(cursos);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los cursos" },
      { status: 500 }
    );
  }
}

