// Orden clásico: primero la cabeza y por último las piernas.
// Los trazos son curvas un poco torcidas para que parezcan hechos a mano.
const PARTES = [
    {
        id: "cabeza",
        d: "M121 50 C134 49 141 60 140 71 C139 83 130 91 119 90 C107 89 100 80 100 69 C101 58 109 50 123 51",
    },
    { id: "tronco", d: "M120 90 C121 110 119 130 120 150" },
    { id: "brazo-izq", d: "M120 108 C110 115 100 122 90 131" },
    { id: "brazo-der", d: "M120 108 C130 115 140 122 151 130" },
    { id: "pierna-izq", d: "M120 150 C112 163 100 177 91 191" },
    { id: "pierna-der", d: "M120 150 C128 163 140 177 150 190" },
];

const TIZA = "#f3f0e6";
const AMARILLO = "#f6e27f";
const ROSA = "#f6a8b9";

function Dibujo({ errores, ganado, perdido }) {
    const color = perdido ? ROSA : ganado ? AMARILLO : TIZA;

    const madera = {
        fill: "none",
        stroke: TIZA,
        strokeOpacity: 0.85,
        strokeWidth: 5,
        strokeLinecap: "round",
    };

    return (
        <svg
            className="tiza block h-auto w-full overflow-visible"
            viewBox="0 0 200 250"
            role="img"
            aria-label={`Ahorcado: ${errores} de ${PARTES.length} partes dibujadas`}
        >
            {/* La horca (siempre visible) */}
            <path d="M8 241 C50 238 100 243 152 239" {...madera} />
            <path d="M40 242 C41 180 39 90 41 20" {...madera} />
            <path d="M37 21 C70 19 100 22 123 20" {...madera} />
            <path d="M41 58 C52 45 63 33 76 21" {...madera} strokeWidth="4" />

            {/* Cuerda y muñeco se balancean juntos */}
            <g className="balanceo">
                <path
                    d="M120 21 C121 30 119 40 120 50"
                    fill="none"
                    stroke={AMARILLO}
                    strokeOpacity="0.8"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {PARTES.slice(0, errores).map((parte) => (
                    <path
                        key={parte.id}
                        d={parte.d}
                        pathLength="1"
                        className="anim-draw"
                        fill="none"
                        stroke={color}
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        style={{ transition: "stroke 0.4s" }}
                    />
                ))}

                {/* Cara: ojos en X al perder, sonrisa al ganar (si hay cabeza) */}
                {perdido && (
                    <g
                        stroke={ROSA}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        className="anim-fade-in"
                    >
                        <path d="M109 62 L116 69 M116 62 L109 69" />
                        <path d="M124 62 L131 69 M131 62 L124 69" />
                        <path d="M111 81 C116 76 124 76 129 81" />
                    </g>
                )}
                {ganado && errores > 0 && (
                    <g
                        stroke={AMARILLO}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        className="anim-fade-in"
                    >
                        <path d="M112 65 L113 66" />
                        <path d="M127 65 L128 66" />
                        <path d="M110 75 C115 83 125 83 130 75" />
                    </g>
                )}
            </g>
        </svg>
    );
}
