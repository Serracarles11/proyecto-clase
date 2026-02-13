import { NextResponse } from "next/server";
import { createClient } from "@/backend/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();

    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const tag = formData.get("tag") as string;
    const profesor = formData.get("profesor") as string;
    const idUsuario = Number(formData.get("id_usuario"));
    const idCurso = Number(formData.get("id_curso"));

    const cover = formData.get("cover") as File | null;
    const video = formData.get("video") as File | null;
    const rawDate = formData.get("date");
    const coverUrl = formData.get("cover_url") as string | null;
    const videoUrl = formData.get("video_url") as string | null;

    const videoFinalUrl = video ? null : videoUrl;

    // 🔐 Validaciones duras
    if (!titulo || !descripcion || !tag || !profesor || !idUsuario || !idCurso) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    let fechaFinal: string;

    if (typeof rawDate === "string" && rawDate.trim() !== "") {
      fechaFinal = rawDate;
    } else {
      // 👉 fecha actual en formato YYYY-MM-DD
      fechaFinal = new Date().toISOString().slice(0, 10);
    }

    // 1️⃣ Crear reunión
    const { data: idReunion, error: createError } = await supabase.rpc(
      "fn_insert_reunion_returning_id",
      {
        p_titulo: titulo,
        p_descripcion: descripcion,
        p_tag: tag,
        p_profesor: profesor,
        p_fecha: fechaFinal,
        p_video: videoFinalUrl,
        p_id_usuario: idUsuario,
        p_id_curso: idCurso,
      }
    );

    if (createError || !idReunion) {
      console.error(createError);
      return NextResponse.json(
        { error: "Error creando la reunión" },
        { status: 500 }
      );
    }

    const updates: Record<string, string> = {};

    if (coverUrl) {
      updates.portada = coverUrl;
    }

    // 2️⃣ Subir portada
    if (cover) {
      const ext = cover.name.split(".").pop();
      const path = `${idReunion}/portada.${ext}`;

      const { error } = await supabase.storage
        .from("reuniones")
        .upload(path, cover, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("reuniones")
        .getPublicUrl(path);

      updates.portada = data.publicUrl;
    }

    // 3️⃣ Subir vídeo
    if (video) {
      const ext = video.name.split(".").pop();
      const path = `${idReunion}/video.${ext}`;

      const { error } = await supabase.storage
        .from("reuniones")
        .upload(path, video, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("reuniones")
        .getPublicUrl(path);

      updates.video = data.publicUrl;
    }

    // 4️⃣ Actualizar URLs si hace falta
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("reuniones")
        .update(updates)
        .eq("id_reuniones", idReunion);

      if (error) throw error;
    }

    return NextResponse.json({ id_reunion: idReunion });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
