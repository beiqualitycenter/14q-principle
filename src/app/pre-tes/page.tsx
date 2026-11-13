
"use client";

import { useEffect, useState } from "react";
import Soal14Q from "../soal-14q";
import { KUNCI_JAWABAN } from "../kuncijawaban";

const DEPARTMENTS = [
  "IQC",
  "IPQC",
  "OQC",
  "PDI",
  "Assy Seat",
  "Assy Mirror",
];

const TOTAL_SOAL = 14;

type ResultData = {
  benar: number;
  salah: number;
  total: number;
  nilai: number;
  detail: boolean[];
};

export default function PreTestPage() {
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [department, setDepartment] = useState("");
  const [tanggal, setTanggal] = useState("");

  const [testStarted, setTestStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState<string[]>(
    Array(TOTAL_SOAL).fill("")
  );

  const [currentQuestion, setCurrentQuestion] = useState(1);

  const [result, setResult] = useState<ResultData | null>(null);

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // ==========================================
  // TANGGAL HARI INI
  // ==========================================

  function getToday() {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }

  useEffect(() => {
    setTanggal(getToday());
  }, []);

  // ==========================================
  // NORMALISASI JAWABAN
  // ==========================================

  function normalizeAnswer(value: string) {
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
  // CEK JAWABAN UNIK
  // ==========================================

  function calculateAnswerDetails(
    answerList: string[]
  ): boolean[] {
    const usedPrinciples = new Set<number>();

    return answerList.map((answer) => {
      const principleIndex = findPrincipleIndex(answer);

      // Jawaban tidak ditemukan
      if (principleIndex === -1) {
        return false;
      }

      // Jawaban sudah pernah digunakan
      if (usedPrinciples.has(principleIndex)) {
        return false;
      }

      // Simpan prinsip yang sudah benar
      usedPrinciples.add(principleIndex);

      return true;
    });
  }

  // ==========================================
  // UPDATE JAWABAN
  // ==========================================

  function updateAnswer(value: string) {
    if (submitted) {
      return;
    }

    setAnswers((prev) => {
      const next = [...prev];

      next[currentQuestion - 1] = value;

      return next;
    });
  }

  // ==========================================
  // MULAI PRE TEST
  // ==========================================

  function handleStartTest() {
    if (!nama.trim()) {
      alert("Silakan isi Nama terlebih dahulu.");
      return;
    }

    if (!nik.trim()) {
      alert("Silakan isi NIK terlebih dahulu.");
      return;
    }

    if (!department) {
      alert("Silakan pilih Department terlebih dahulu.");
      return;
    }

    if (!tanggal) {
      alert("Silakan pilih Tanggal terlebih dahulu.");
      return;
    }

    setTestStarted(true);
    setSubmitted(false);
    setCurrentQuestion(1);
    setSaveStatus("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================
  // NAVIGASI
  // POSISI SCROLL TETAP DIPERTAHANKAN
  // ==========================================

  function nextQuestion() {
    if (currentQuestion < TOTAL_SOAL) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }

  function previousQuestion() {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  function goToQuestion(nomor: number) {
    if (nomor >= 1 && nomor <= TOTAL_SOAL) {
      setCurrentQuestion(nomor);
    }
  }

  // ==========================================
  // SUBMIT PRE TEST
  // ==========================================

  async function handleSubmit() {
    if (loading || submitted) {
      return;
    }

    if (!nama.trim()) {
      alert("Nama belum diisi.");
      return;
    }

    if (!nik.trim()) {
      alert("NIK belum diisi.");
      return;
    }

    if (!department) {
      alert("Department belum dipilih.");
      return;
    }

    if (!tanggal) {
      alert("Tanggal belum dipilih.");
      return;
    }

    // Periksa apakah seluruh jawaban sudah diisi
    const soalKosong = answers.some(
      (answer) => !answer.trim()
    );

    if (soalKosong) {
      const nomorKosong =
        answers.findIndex(
          (answer) => !answer.trim()
        ) + 1;

      setCurrentQuestion(nomorKosong);

      alert(
        `Jawaban nomor ${nomorKosong} belum diisi.`
      );

      return;
    }

    // Hitung jawaban benar unik
    const detail = calculateAnswerDetails(answers);

    const benar = detail.filter(Boolean).length;

    // Jawaban salah termasuk duplikat
    const salah = TOTAL_SOAL - benar;

    // Hitung nilai
    const nilai = Math.round(
      (benar / TOTAL_SOAL) * 100
    );

    // Simpan hasil
    setResult({
      benar,
      salah,
      total: TOTAL_SOAL,
      nilai,
      detail,
    });

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setLoading(true);
    setSaveStatus("Menyimpan jawaban...");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          testType: "pre-test",

          nama: nama.trim(),
          nik: nik.trim(),
          department,
          tanggal,

          q14Answers: answers,

          benar,
          salah,
          total: TOTAL_SOAL,
          nilai,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menyimpan data."
        );
      }

      setSaveStatus(
        "✓ Jawaban berhasil disimpan."
      );

    } catch (error) {
      console.error(error);

      setSaveStatus(
        "⚠ Hasil sudah ditampilkan, tetapi penyimpanan gagal."
      );

    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // RESET PRE TEST
  // ==========================================

  function handleReset() {
    setNama("");
    setNik("");
    setDepartment("");

    setTanggal(getToday());

    setAnswers(
      Array(TOTAL_SOAL).fill("")
    );

    setCurrentQuestion(1);

    setTestStarted(false);
    setSubmitted(false);

    setResult(null);

    setLoading(false);
    setSaveStatus("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================
  // PROGRESS
  // ==========================================

  const progress =
    (currentQuestion / TOTAL_SOAL) * 100;

  // ==========================================
  // TAMPILAN
  // ==========================================

  return (
    <main className="postPage">

      {/* HEADER */}
      <header className="postHeader">
        <div className="postHeaderInner">

          <div className="brandBox">
            <div className="brandMain">
              BUMJIN
            </div>

            <div className="brandSub">
              QUALITY TRAINING
            </div>
          </div>

          <div className="headerTitle">
            <div className="smallTitle">
              14Q BASICS PRINCIPLE
            </div>

            <h1>PRE TEST</h1>

            <p>
              Evaluasi pemahaman awal peserta
            </p>
          </div>

        </div>
      </header>

      {/* HASIL PRE TEST */}
      {result && (
        <section className="resultCard">

          <div className="resultTitle">
            HASIL PRE TEST
          </div>

          <div className="resultScore">
            {result.nilai}
          </div>

          <div className="resultLabel">
            NILAI
          </div>

          <div className="resultStats">

            <div>
              <strong>
                {result.benar}
              </strong>

              <span>
                Benar
              </span>
            </div>

            <div>
              <strong>
                {result.salah}
              </strong>

              <span>
                Salah / Duplikat
              </span>
            </div>

            <div>
              <strong>
                {result.total}
              </strong>

              <span>
                Total Jawaban
              </span>
            </div>

          </div>

          <div className="resultMessage">
            {result.nilai >= 80
              ? "✓ Pemahaman awal Anda sudah baik."
              : "Tetap semangat dan pelajari materi 14Q Principle."}
          </div>

        </section>
      )}

      {/* DATA KARYAWAN */}
      <section className="participantCard">

        <div className="sectionTitle">
          DATA KARYAWAN
        </div>

        <div className="participantGrid">

          <div className="fieldGroup">
            <label>Nama</label>

            <input
              type="text"
              value={nama}
              onChange={(e) =>
                setNama(e.target.value)
              }
              disabled={testStarted}
              placeholder="Masukkan nama lengkap"
              autoComplete="name"
            />
          </div>

          <div className="fieldGroup">
            <label>NIK</label>

            <input
              type="text"
              value={nik}
              onChange={(e) =>
                setNik(e.target.value)
              }
              disabled={testStarted}
              placeholder="Masukkan NIK"
              autoComplete="off"
            />
          </div>

          <div className="fieldGroup">
            <label>Department</label>

            <select
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
              disabled={testStarted}
            >
              <option value="">
                Pilih Department
              </option>

              {DEPARTMENTS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="fieldGroup">
            <label>Tanggal</label>

            <input
              type="date"
              value={tanggal}
              onChange={(e) =>
                setTanggal(e.target.value)
              }
              disabled={testStarted}
            />
          </div>

        </div>

        {!testStarted && (
          <button
            type="button"
            className="startTestButton"
            onClick={handleStartTest}
          >
            MULAI PRE TEST →
          </button>
        )}

      </section>

      {/* PRE TEST */}
      {testStarted && (
        <section className="testCard">

          {/* PROGRESS */}
          {!submitted && (
            <>
              <div className="progressHeader">

                <div>
                  <strong>
                    Jawaban {currentQuestion}
                  </strong>

                  <span>
                    {" "}dari{" "}
                    {TOTAL_SOAL}
                  </span>
                </div>

                <div className="progressPercent">
                  {Math.round(progress)}%
                </div>

              </div>

              <div className="progressBar">
                <div
                  className="progressFill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </>
          )}

          {/* KOMPONEN SOAL */}
          <Soal14Q
            nomor={currentQuestion}
            jawaban={answers[currentQuestion - 1]}
            submitted={submitted}
            benar={
              submitted && result
                ? result.detail[currentQuestion - 1]
                : null
            }
            updateJawaban={updateAnswer}
          />

          {/* NAVIGASI */}
          {!submitted && (
            <div className="navigationButtons">

              <button
                type="button"
                onClick={previousQuestion}
                disabled={currentQuestion === 1}
                className="btnPrevious"
              >
                ← Sebelumnya
              </button>

              {currentQuestion < TOTAL_SOAL ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="btnNext"
                >
                  Berikutnya →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btnSubmit"
                  disabled={loading}
                >
                  {loading
                    ? "MENYIMPAN..."
                    : "SUBMIT PRE TEST"}
                </button>
              )}

            </div>
          )}

          {/* SETELAH SUBMIT */}
          {submitted && (
            <div className="submittedActions">

              {currentQuestion < TOTAL_SOAL && (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="btnNext"
                >
                  Soal Berikutnya →
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="btnNewTest"
              >
                ISI TEST BARU
              </button>

            </div>
          )}

        </section>
      )}

      {/* NAVIGATOR */}
      {testStarted && (
        <section className="questionNavigator">

          <div className="navigatorTitle">
            Daftar Jawaban
          </div>

          <div className="numberGrid">

            {answers.map((_, index) => {
              const nomor = index + 1;

              let className = "numberButton";

              if (submitted && result) {
                className += result.detail[index]
                  ? " numberCorrect"
                  : " numberWrong";

              } else if (nomor === currentQuestion) {
                className += " numberActive";

              } else if (answers[index].trim()) {
                className += " numberAnswered";
              }

              return (
                <button
                  key={nomor}
                  type="button"
                  className={className}
                  onClick={() => goToQuestion(nomor)}
                >
                  {nomor}
                </button>
              );
            })}

          </div>

        </section>
      )}

      {/* STATUS PENYIMPANAN */}
      {saveStatus && (
        <div className="saveStatus">

          {saveStatus}

          {loading && (
            <span>
              {" "}
              Mohon tunggu...
            </span>
          )}

        </div>
      )}

      {/* FOOTER */}
      <footer className="postFooter">

        <strong>
          BUMJIN ELECTRONICS INDONESIA
        </strong>

        <span>
          Quality Training Department
        </span>

      </footer>

    </main>
  );
}
