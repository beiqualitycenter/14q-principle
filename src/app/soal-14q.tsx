
"use client";

type Soal14QProps = {
  nomor: number;
  jawaban: string;
  submitted: boolean;
  benar: boolean | null;
  updateJawaban: (value: string) => void;
};

export default function Soal14Q({
  nomor,
  jawaban,
  submitted,
  benar,
  updateJawaban,
}: Soal14QProps) {
  return (
    <div className="postQuestionCard">
      <div className="questionTop">
        <div className="questionNumber">
          {nomor}
        </div>

        <div className="questionLabel">
          JAWABAN {nomor} DARI 14
        </div>
      </div>

      <div className="questionText">
        Sebutkan total 14Q Basic Principle yang kamu ketahui?!
      </div>

      <div className="answerLabel">
        Jawaban Anda
      </div>

      <input
        type="text"
        value={jawaban}
        onChange={(e) =>
          updateJawaban(e.target.value)
        }
        disabled={submitted}
        placeholder="Masukan Jawaban Anda"
        className={
          submitted
            ? benar
              ? "postAnswerInput answerCorrect"
              : "postAnswerInput answerWrong"
            : "postAnswerInput"
        }
        autoComplete="off"
      />

      {submitted && (
        <div
          className={
            benar
              ? "postAnswerStatus correctStatus"
              : "postAnswerStatus wrongStatus"
          }
        >
          {benar
            ? "✓ Jawaban Benar"
            : "✕ Jawaban Salah atau Duplikat"}
        </div>
      )}
    </div>
  );
}
