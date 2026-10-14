const { useState, useEffect, useRef } = React;

const INTENTOS = 6;
const PUNTOS_ACIERTO = 10; // por cada letra descubierta
const PUNTOS_VIDA = 10; // bonus por cada intento que sobra al ganar
const CLAVE_MARCADOR = "ahorcado-marcador";
const MARCADOR_INICIAL = { puntos: 0, ganadas: 0, perdidas: 0 };

// Quita tildes y diéresis (Á → A, Ü → U) pero conserva la Ñ,
// así cualquier palabra se puede resolver con el teclado.
function normalizar(texto) {
    return texto
        .toUpperCase()
        .replace(/Ñ/g, "#")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/#/g, "Ñ");
}

function cargarMarcador() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_MARCADOR));
        if (guardado) return { ...MARCADOR_INICIAL, ...guardado };
    } catch (e) {}
    return MARCADOR_INICIAL;
}

function Stat({ titulo, children }) {
    return (
        <div>
            <dt className="tiza-texto text-sm text-tiza-tenue sm:text-base">
                {titulo}
            </dt>
            <dd className="flex h-10 items-center sm:h-12">{children}</dd>
        </div>
    );
}

// Cuenta con palotes, como en la pizarra del cole: grupos de 5 tachados.
// Con 0 o con más de 10 se escribe el número, para que no ocupe demasiado.
function Palotes({ n, color }) {
    if (n === 0 || n > 10)
        return (
            <span
                key={n}
                className={`anim-pop tiza-texto font-display text-3xl font-bold sm:text-4xl ${color}`}
            >
                {n}
            </span>
        );

    const grupos = [];
    for (let i = 0; i < n; i += 5) grupos.push(Math.min(5, n - i));

    return (
        <span className="tiza flex items-center gap-2" role="img" aria-label={`${n}`}>
            {grupos.map((cuantos, g) => (
                <svg
                    key={g}
                    viewBox="0 0 34 34"
                    className={`h-8 w-8 overflow-visible sm:h-9 sm:w-9 ${color}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                >
                    {Array.from({ length: Math.min(cuantos, 4) }, (_, i) => {
                        const x = 5 + i * 7.5;
                        return (
                            <path
                                key={i}
                                d={`M${x} 4 C${x + 1} 13 ${x - 1} 22 ${x} 30`}
                                pathLength="1"
                                className="anim-draw"
                            />
                        );
                    })}
                    {cuantos === 5 && (
                        <path
                            d="M1 25 C10 20 22 13 33 8"
                            pathLength="1"
                            className="anim-draw"
                        />
                    )}
                </svg>
            ))}
        </span>
    );
}

function App() {
    const [palabra, setPalabra] = useState("");
    const [usadas, setUsadas] = useState([]);
    const [marcador, setMarcador] = useState(cargarMarcador);
    const dibujoRef = useRef(null);

    const letras = palabra.split("");
    const falladas = usadas.filter((l) => !palabra.includes(l));
    const errores = falladas.length;
    const ganado = palabra !== "" && letras.every((l) => usadas.includes(l));
    const perdido = errores >= INTENTOS;
    const jugando = palabra !== "" && !ganado && !perdido;
    const empezada = jugando && usadas.length > 0;
    const puntosRonda = ganado
        ? letras.length * PUNTOS_ACIERTO + (INTENTOS - errores) * PUNTOS_VIDA
        : 0;

    function empezar() {
        // Cambiar de palabra a mitad de partida cuenta como derrota
        if (empezada) setMarcador((m) => ({ ...m, perdidas: m.perdidas + 1 }));

        // Evita que salga la misma palabra dos veces seguidas
        const todas = PALABRAS.map(normalizar);
        const opciones = todas.filter((p) => p !== palabra);
        const lista = opciones.length > 0 ? opciones : todas;
        setPalabra(lista[Math.floor(Math.random() * lista.length)]);
        setUsadas([]);
    }

    function pulsar(letra) {
        if (!jugando || usadas.includes(letra)) return;

        const nuevasUsadas = [...usadas, letra];
        const aciertos = letras.filter((l) => l === letra).length;
        const nuevosErrores = nuevasUsadas.filter(
            (l) => !palabra.includes(l),
        ).length;
        const completa = letras.every((l) => nuevasUsadas.includes(l));

        setUsadas(nuevasUsadas);
        setMarcador((m) => ({
            puntos:
                m.puntos +
                aciertos * PUNTOS_ACIERTO +
                (completa ? (INTENTOS - nuevosErrores) * PUNTOS_VIDA : 0),
            ganadas: m.ganadas + (completa ? 1 : 0),
            perdidas: m.perdidas + (nuevosErrores >= INTENTOS ? 1 : 0),
        }));
    }

    // Teclado físico (sin array de dependencias: se vuelve a enganchar en
    // cada render para que pulsar() y empezar() vean siempre el estado actual)
    useEffect(() => {
        const onKey = (e) => {
            // Que Ctrl+R, Ctrl+C... sigan funcionando sin gastar letras
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === "Enter") {
                // Si el foco está en un botón, ya se encarga el propio botón
                if (!jugando && !e.target.closest("button")) empezar();
                return;
            }
            const letra = normalizar(e.key);
            if (ABC.includes(letra)) pulsar(letra);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    });

    // Guarda el marcador para que no se pierda al recargar
    useEffect(() => {
        try {
            localStorage.setItem(CLAVE_MARCADOR, JSON.stringify(marcador));
        } catch (e) {}
    }, [marcador]);

    // Temblor del dibujo en cada fallo
    useEffect(() => {
        if (errores === 0 || !dibujoRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        dibujoRef.current.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-6px) rotate(-1deg)" },
                { transform: "translateX(6px) rotate(1deg)" },
                { transform: "translateX(-4px)" },
                { transform: "translateX(4px)" },
                { transform: "translateX(0)" },
            ],
            { duration: 450, easing: "ease" },
        );
    }, [errores]);

    const quedan = INTENTOS - errores;
    const alLimite = jugando && quedan === 1;

    let estado = { texto: "Pulsa «Empezar» para jugar", color: "text-tiza-tenue" };
    if (jugando)
        estado = alLimite
            ? { texto: "¡Cuidado, último intento!", color: "text-rosa" }
            : { texto: "¡Elige una letra!", color: "text-tiza" };
    if (ganado)
        estado = { texto: `¡Muy bien! +${puntosRonda} puntos`, color: "text-amarillo" };
    if (perdido) estado = { texto: "¡Ahorcado! Otra vez será", color: "text-rosa" };

    let colorQuedan = "text-tiza";
    if (alLimite || perdido) colorQuedan = "text-rosa";
    if (ganado) colorQuedan = "text-amarillo";

    let pista = "";
    if (empezada) pista = "(saltarla cuenta como derrota)";
    else if (palabra && !jugando) pista = "o pulsa Enter";

    const hayMarcador =
        marcador.puntos > 0 || marcador.ganadas > 0 || marcador.perdidas > 0;

    // La fecha en la esquina, como la escribe el profe cada mañana
    const fecha = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <div className="marco">
            {ganado && <Confeti key={palabra} />}

            <div className="pizarra">
                {/* Restos de otras clases, casi borrados */}
                <div className="fantasmas" aria-hidden="true">
                    <span style={{ top: "27%", left: "62%", rotate: "-4deg" }}>
                        a² + b² = c²
                    </span>
                    <span style={{ top: "47%", left: "3%", rotate: "3deg" }}>
                        7 × 8 = 56
                    </span>
                    <span style={{ top: "80%", left: "58%", rotate: "-2deg" }}>
                        Deberes: pág. 42
                    </span>
                    <span style={{ top: "33%", left: "84%", rotate: "6deg" }}>
                        H₂O
                    </span>
                </div>

                <header>
                    <div className="flex items-baseline justify-between gap-3 text-sm text-tiza-tenue sm:text-base">
                        <span className="tiza-texto whitespace-nowrap">
                            Juego de palabras
                        </span>
                        <span className="tiza-texto whitespace-nowrap first-letter:uppercase">
                            {fecha}
                        </span>
                    </div>

                    <div className="cabecera__fila mt-1 flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="tiza-texto font-display text-[clamp(2.6rem,min(13vw,9vh),5.5rem)] font-bold leading-none">
                                El Ahorcado
                            </h1>
                            {/* Subrayado a mano */}
                            <svg
                                viewBox="0 0 300 12"
                                className="tiza mt-1 h-3 w-52 sm:w-80"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4 8 C60 3 120 10 180 6 C220 4 262 9 296 5"
                                    fill="none"
                                    stroke="#f6e27f"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <dl className="grid grid-cols-3 gap-3 sm:gap-8 lg:min-w-[440px]">
                            <Stat titulo="Puntos">
                                <span
                                    key={marcador.puntos}
                                    className="anim-pop tiza-texto font-display text-3xl font-bold sm:text-4xl"
                                >
                                    {marcador.puntos}
                                </span>
                            </Stat>
                            <Stat titulo="Ganadas">
                                <Palotes n={marcador.ganadas} color="text-verde" />
                            </Stat>
                            <Stat titulo="Perdidas">
                                <Palotes n={marcador.perdidas} color="text-rosa" />
                            </Stat>
                        </dl>
                    </div>
                </header>

                <div className="raya my-4 sm:my-6" />

                <main className="juego grid flex-1 content-center gap-4 sm:gap-6 lg:grid-cols-[minmax(0,320px)_3px_1fr] lg:gap-10">
                    {/* El dibujo: en fila en móvil, en columna en escritorio */}
                    <section className="juego__dibujo flex items-center justify-center gap-5 sm:gap-12 lg:flex-col lg:justify-center lg:gap-6">
                        <div
                            ref={dibujoRef}
                            className="w-32 shrink-0 sm:w-44 lg:w-full lg:max-w-[270px]"
                        >
                            <Dibujo
                                errores={errores}
                                ganado={ganado}
                                perdido={perdido}
                            />
                        </div>

                        <div className="min-w-0 flex-1 sm:flex-none lg:w-full lg:text-center">
                            <p className="tiza-texto text-tiza-tenue">Te quedan</p>
                            <p className="tiza-texto font-display text-6xl font-bold leading-none sm:text-7xl">
                                <span
                                    key={quedan}
                                    className={`anim-pop inline-block ${colorQuedan}`}
                                >
                                    {quedan}
                                </span>
                            </p>
                            <p className="tiza-texto text-tiza-tenue">
                                {quedan === 1 ? "intento" : "intentos"}
                            </p>
                            <p className="tiza-texto mt-3 text-tiza-tenue">
                                Fallos:{" "}
                                <span className="text-xl tracking-[0.25em] text-rosa">
                                    {falladas.length > 0 ? falladas.join(" ") : "—"}
                                </span>
                            </p>
                        </div>
                    </section>

                    <div className="juego__separador raya lg:hidden" />
                    <div className="juego__separador raya-vertical hidden lg:block" />

                    {/* La palabra y el teclado */}
                    <section className="flex flex-col justify-center">
                        <p
                            role="status"
                            className={`tiza-texto text-center text-lg sm:text-xl ${estado.color}`}
                        >
                            {estado.texto}
                        </p>

                        <div
                            className="palabra tiza mt-4 min-h-16 w-full sm:mt-6 sm:min-h-24"
                            style={{ "--n": Math.max(letras.length, 1) }}
                        >
                            {palabra === "" ? (
                                <p className="tiza-texto text-center text-2xl text-tiza-tenue sm:text-3xl">
                                    _ _ _ _ _ _
                                </p>
                            ) : (
                                <>
                                    <p className="sr-only">
                                        Palabra de {letras.length} letras:{" "}
                                        {letras
                                            .map((l) =>
                                                usadas.includes(l) || perdido
                                                    ? l
                                                    : "hueco",
                                            )
                                            .join(", ")}
                                    </p>
                                    {letras.map((l, i) => {
                                        const visible = usadas.includes(l);
                                        let modo = "";
                                        if (ganado) modo = "letra--ganada";
                                        else if (!visible && perdido)
                                            modo = "letra--fallada";
                                        return (
                                            <span
                                                key={`${palabra}-${i}`}
                                                aria-hidden="true"
                                                style={{ "--retardo": `${i * 60}ms` }}
                                                className={`letra ${modo}`}
                                            >
                                                {(visible || perdido) && (
                                                    <span className="letra__glifo">
                                                        {l}
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    })}
                                    {/* El borrador pasa al cambiar de palabra */}
                                    <span key={palabra} className="borron" />
                                </>
                            )}
                        </div>

                        {/* Sin partida: botón grande. Jugando: discreto, para no robar espacio */}
                        <div className="mt-4 flex flex-col items-center sm:mt-6">
                            {jugando ? (
                                <button
                                    type="button"
                                    onClick={empezar}
                                    className="boton-secundario tiza-texto"
                                >
                                    ↻ Cambiar palabra
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={empezar}
                                    className="boton-tiza boton-tiza--invita"
                                >
                                    {palabra ? "Otra palabra" : "¡Empezar!"} →
                                </button>
                            )}
                            <p className="tiza-texto mt-1 min-h-5 text-center text-sm text-tiza-tenue">
                                {pista}
                            </p>
                        </div>

                        <div className="mt-3 sm:mt-5">
                            <Teclado
                                usadas={usadas}
                                palabra={palabra}
                                deshabilitado={!jugando}
                                onPulsar={pulsar}
                            />
                        </div>
                    </section>
                </main>

                <footer className="tiza-texto mt-5 flex flex-col items-center gap-1.5 text-center text-sm text-tiza-tenue sm:mt-7 lg:flex-row lg:justify-between lg:text-left">
                    <p className="solo-teclado flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                        Usa tu teclado
                        <span className="kbd">A–Z</span>
                        <span className="kbd">Ñ</span>·
                        <span className="kbd">Enter</span>
                        nueva palabra
                    </p>
                    <p>
                        {INTENTOS} intentos · +{PUNTOS_ACIERTO} por letra · +
                        {PUNTOS_VIDA} por intento sobrante
                    </p>
                    {hayMarcador && (
                        <button
                            type="button"
                            onClick={() => setMarcador(MARCADOR_INICIAL)}
                            className="boton-secundario text-sm"
                        >
                            Borrar marcador
                        </button>
                    )}
                </footer>
            </div>

            {/* Repisa con tizas y borrador (decoración) */}
            <div className="repisa" aria-hidden="true">
                <span className="repisa__borrador" style={{ left: "9%" }} />
                <span
                    className="repisa__tiza"
                    style={{ left: "34%", width: 22, background: "linear-gradient(#ffd6df, #e597a8)" }}
                />
                <span className="repisa__tiza" style={{ right: "18%", width: 40 }} />
                <span
                    className="repisa__tiza"
                    style={{ right: "11%", width: 26, background: "linear-gradient(#fff6c2, #e3cf6f)" }}
                />
            </div>
        </div>
    );
}
