import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ParticleField from "./ParticleField";

const experiments = [
  {
    id: "实验 1",
    title: "进程调度模拟",
    detail: "动态优先级 · 时间片 · I/O",
    port: 4001,
    enabled: true,
  },
  {
    id: "实验 2",
    title: "待接入",
    detail: "",
    port: 4002,
    enabled: false,
  },
  {
    id: "实验 3",
    title: "待接入",
    detail: "",
    port: 4003,
    enabled: false,
  },
  {
    id: "实验 4",
    title: "待接入",
    detail: "",
    port: 4004,
    enabled: false,
  },
];

function getExperimentUrl(port) {
  const protocol = window.location.protocol || "http:";
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:${port}`;
}

function ExperimentRow({ experiment }) {
  const url = useMemo(
    () => (experiment.enabled ? getExperimentUrl(experiment.port) : undefined),
    [experiment.enabled, experiment.port],
  );

  return (
    <li className={`experiment-row ${experiment.enabled ? "is-active" : "is-disabled"}`}>
      <span className="experiment-row__index">{experiment.id}</span>
      {experiment.enabled ? (
        <>
          <div className="experiment-row__body">
            <h2>{experiment.title}</h2>
            {experiment.detail && <p>{experiment.detail}</p>}
          </div>
          <a className="experiment-row__action" href={url} aria-label={`进入${experiment.title}`}>
            <span>进入实验</span>
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </>
      ) : (
        <button
          className="experiment-row__disabled-action"
          type="button"
          disabled
          aria-disabled="true"
        >
          {experiment.title}
        </button>
      )}
    </li>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setBooting(false), 1100);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main className={`poster-page ${booting ? "is-booting" : "is-ready"}`}>
      <img
        className="poster-page__art"
        src="/assets/os-lab-hero.webp"
        alt=""
        aria-hidden="true"
        data-testid="hero-art"
      />
      <div className="poster-page__scrim" aria-hidden="true" />
      <ParticleField />

      <div className="poster-page__content">
        <section className="poster-intro" aria-labelledby="page-title">
          <p className="poster-intro__welcome">欢迎访问</p>
          <h1 id="page-title">任正江</h1>
          <p className="poster-intro__identity">计科2404 · 2400170133</p>
          <div className="poster-intro__rule" aria-hidden="true" />
          <h2>操作系统实验可视化界面</h2>
          <p className="poster-intro__description">
            通过可视化方式观察操作系统中的进程状态与调度过程。
          </p>
        </section>

        <section className="experiment-section" aria-labelledby="experiment-heading">
          <h2 id="experiment-heading">当前实验</h2>
          <ol className="experiment-list">
            {experiments.map((experiment) => (
              <ExperimentRow key={experiment.id} experiment={experiment} />
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
