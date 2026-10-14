const FILAS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];
const ABC = FILAS.join("").split("");

// Marcas de tiza: círculo para los aciertos, tachón para los fallos
const CIRCULO =
    "M50 9 C76 7 93 26 91 51 C89 76 70 93 46 91 C21 89 7 70 9 46 C11 23 31 7 58 11";
const TACHON = "M16 82 C38 62 62 40 86 18";

function Teclado({ usadas, palabra, deshabilitado, onPulsar }) {
    return (
        <div
            role="group"
            aria-label="Teclado"
            className="tiza flex flex-col gap-1.5 sm:gap-2"
        >
            {FILAS.map((fila) => (
                <div
                    key={fila}
                    className="flex justify-center gap-1 sm:gap-1.5"
                >
                    {fila.split("").map((letra) => {
                        const usada = usadas.includes(letra);
                        const acierto = usada && palabra.includes(letra);

                        let estado = deshabilitado ? "tecla--inactiva" : "";
                        if (usada) estado = acierto ? "tecla--acierto" : "tecla--fallo";

                        let etiqueta = letra;
                        if (usada)
                            etiqueta += acierto ? ", acertada" : ", fallada";

                        return (
                            <button
                                key={letra}
                                type="button"
                                aria-label={etiqueta}
                                onClick={() => onPulsar(letra)}
                                disabled={usada || deshabilitado}
                                className={`tecla h-12 max-w-12 min-w-0 flex-1 text-xl sm:h-13 sm:max-w-13 sm:text-2xl ${estado}`}
                            >
                                <span className="pt-1">{letra}</span>
                                {usada && (
                                    <svg
                                        className="tecla__marca"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d={acierto ? CIRCULO : TACHON}
                                            pathLength="1"
                                            className="anim-draw"
                                            fill="none"
                                            stroke={acierto ? "#c1eaa5" : "#f6a8b9"}
                                            strokeWidth="7"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
