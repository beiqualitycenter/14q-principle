"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="postPage">
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

            <h1>
              TRAINING TEST
            </h1>

            <p>
              Pilih jenis test yang akan dikerjakan
            </p>
          </div>
        </div>
      </header>

      <section className="participantCard">
        <div className="sectionTitle">
          PILIH TEST
        </div>

        <div className="testMenuGrid">

          <Link
            href="/pre-tes"
            className="testMenuCard"
          >
            <div className="testMenuTop">
              <span className="testMenuNumber">
                01
              </span>

              <span className="testMenuArrow">
                →
              </span>
            </div>

            <div className="testMenuTitle">
              PRE TEST
            </div>

            <div className="testMenuDescription">
              Evaluasi pemahaman awal peserta
              sebelum mengikuti training.
            </div>

            <div className="testMenuBottom">
              MULAI PRE TEST
            </div>
          </Link>

          <Link
            href="/post-tes"
            className="testMenuCard"
          >
            <div className="testMenuTop">
              <span className="testMenuNumber">
                02
              </span>

              <span className="testMenuArrow">
                →
              </span>
            </div>

            <div className="testMenuTitle">
              POST TEST
            </div>

            <div className="testMenuDescription">
              Evaluasi pemahaman peserta
              setelah mengikuti training.
            </div>

            <div className="testMenuBottom">
              MULAI POST TEST
            </div>
          </Link>

        </div>
      </section>

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