
import { NextRequest, NextResponse } from "next/server";
import { KUNCI_JAWABAN } from "../../kuncijawaban";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzYHJ3x_w9ZQFjzPvj4qkkOdFU1-cqoj5JsHZH2QcgV4928BCXDehh6Ssiaq_AUMLbVNg/exec";

const TOTAL_SOAL = 14;

type SubmitPayload = {
  testType: string;
  nama: string;
  nik: string;
  department: string;
  tanggal: string;
  email?: string;
  q14Answers: string[];
  benar?: number;
  salah?: number;
  total?: number;
  nilai?: number;
};

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// ==========================================
// MENCARI PRINSIP 14Q
// ==========================================

function findPrincipleIndex(answer: string): number {
  const normalized = normalizeAnswer(answer);

  if (!normalized) {
    return -1;
  }

  return KUNCI_JAWABAN.findIndex((keys) =>
    keys.some(
      (key) => normalizeAnswer(key) === normalized
    )
  );
}

// ==========================================
// VALIDASI JAWABAN DAN DUPLIKAT
// ==========================================

function calculateResult(answers: string[]) {
  const usedPrinciples = new Set<number>();

  const detail = answers.map((answer) => {
    const principleIndex = findPrincipleIndex(answer);

    // Jawaban tidak sesuai
    if (principleIndex === -1) {
      return false;
    }

    // Jawaban sudah pernah digunakan
    if (usedPrinciples.has(principleIndex)) {
      return false;
    }

    // Jawaban benar dan unik
    usedPrinciples.add(principleIndex);

    return true;
  });

  const benar = detail.filter(Boolean).length;
  const salah = TOTAL_SOAL - benar;

  const nilai = Math.round(
    (benar / TOTAL_SOAL) * 100
  );

  return {
    benar,
    salah,
    total: TOTAL_SOAL,
    nilai,
    detail,
  };
}

// ==========================================
// POST API
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // ======================================
    // 1. MEMBACA REQUEST
    // ======================================

    const body = await request.text();

    if (!body || body.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Data yang dikirim kosong.",
        },
        { status: 400 }
      );
    }

    let payload: SubmitPayload;

    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format data JSON tidak valid.",
        },
        { status: 400 }
      );
    }

    // ======================================
    // 2. VALIDASI DATA PESERTA
    // ======================================

    if (
      !payload.nama?.trim() ||
      !payload.nik?.trim() ||
      !payload.department?.trim() ||
      !payload.tanggal?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data peserta belum lengkap.",
        },
        { status: 400 }
      );
    }

    if (
      payload.testType !== "pre-test" &&
      payload.testType !== "post-test"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Jenis test tidak valid.",
        },
        { status: 400 }
      );
    }

    // ======================================
    // 3. VALIDASI EMAIL POST TEST
    // ======================================

    if (payload.testType === "post-test") {
      if (
        !payload.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          payload.email.trim()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Email Post Test tidak valid.",
          },
          { status: 400 }
        );
      }
    }

    // ======================================
    // 4. VALIDASI 14 JAWABAN
    // ======================================

    if (
      !Array.isArray(payload.q14Answers) ||
      payload.q14Answers.length !== TOTAL_SOAL
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Jumlah jawaban harus tepat 14.",
        },
        { status: 400 }
      );
    }

    const answers = payload.q14Answers;

    const invalidAnswer = answers.some(
      (answer) =>
        typeof answer !== "string" ||
        !answer.trim()
    );

    if (invalidAnswer) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua 14 jawaban wajib diisi.",
        },
        { status: 400 }
      );
    }

    // ======================================
    // 5. HITUNG ULANG NILAI DI BACKEND
    // ======================================

    const result = calculateResult(answers);

    const {
      benar,
      salah,
      total,
      nilai,
    } = result;

    // ======================================
    // 6. SIAPKAN DATA KE GOOGLE SHEETS
    // ======================================

    const verifiedPayload = {
      ...payload,

      nama: payload.nama.trim(),
      nik: payload.nik.trim(),
      department: payload.department.trim(),
      tanggal: payload.tanggal.trim(),

      email: payload.email?.trim().toLowerCase() || "",

      q14Answers: answers,

      // Nilai selalu menggunakan hasil backend
      benar,
      salah,
      total,
      nilai,
    };

    // ======================================
    // 7. KIRIM KE GOOGLE APPS SCRIPT
    // ======================================

    const response = await fetch(SCRIPT_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(verifiedPayload),

      redirect: "follow",
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!responseText || responseText.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Google Apps Script tidak mengembalikan response.",
        },
        { status: 502 }
      );
    }

    // ======================================
    // 8. BACA RESPONSE GOOGLE APPS SCRIPT
    // ======================================

    let data: {
      success?: boolean;
      message?: string;
      row?: number;
      certificateSent?: boolean;
    };

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Response Google Apps Script bukan JSON.",
          detail: responseText.substring(0, 2000),
        },
        { status: 502 }
      );
    }

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message || "Data gagal disimpan.",
        },
        { status: 500 }
      );
    }

    // ======================================
    // 9. RESPONSE KE FRONTEND
    // ======================================

    return NextResponse.json(
      {
        success: true,

        message:
          data.message || "Test berhasil disimpan.",

        row: data.row ?? null,

        // Mengembalikan status sertifikat
        certificateSent:
          data.certificateSent ?? false,

        // Hasil validasi backend
        benar,
        salah,
        total,
        nilai,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("SUBMIT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message:
          "Gagal menghubungi Google Apps Script.",

        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
