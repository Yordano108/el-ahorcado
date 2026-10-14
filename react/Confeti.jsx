// Colores de las tizas
const COLORES_CONFETI = ["#f3f0e6", "#f6e27f", "#f6a8b9", "#a7d8f2", "#c1eaa5"];

// Lluvia de polvo de tiza al ganar. Los valores aleatorios se calculan una
// sola vez (useMemo) para que no cambien en cada render.
function Confeti() {
    const piezas = React.useMemo(
        () =>
            Array.from({ length: 70 }, (_, i) => {
                const ancho = 6 + Math.random() * 6;
                return {
                    left: `${Math.random() * 100}%`,
                    width: ancho,
                    height: ancho * (Math.random() > 0.5 ? 0.4 : 1),
                    background: COLORES_CONFETI[i % COLORES_CONFETI.length],
                    borderRadius: Math.random() > 0.7 ? "50%" : undefined,
                    animationDuration: `${2.6 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 0.7}s`,
                    "--giro": `${Math.random() * 1080 - 540}deg`,
                    "--deriva": `${(Math.random() - 0.5) * 30}vw`,
                };
            }),
        [],
    );

    return (
        <div className="confeti" aria-hidden="true">
            {piezas.map((estilo, i) => (
                <span key={i} style={estilo} />
            ))}
        </div>
    );
}
