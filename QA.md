# QA ejecutado — 20 octubre 2026

## Alcance y resultados

- **Académico: PASS.** 30 casos con IDs únicos y una respuesta correcta por caso. Verificación de no negatividad, ecuación alcanzado + d⁻ − d⁺ = meta y producto de desviaciones cero en todos los resultados numéricos, incluidos los retos avanzados. Respuestas de penalización contrastadas con mínimo/máximo/exactitud.
- **Cobertura y aleatoriedad: PASS.** 1,000 partidas generadas, todas de 8 casos sin repetición interna: 2 faltantes, 2 excesos, 1 exacto, 1 mínimo, 1 máximo, 1 interpretación. Se obtuvieron 1,000 secuencias distintas en la ejecución.
- **Móvil: PASS en emulación Chromium.** 390×844 y 375×812; casos numéricos y penalización. Sin overflow horizontal; tarjeta y tres contenedores visibles; botones mayores de 44×44. Capturas inspeccionadas y comprobaciones geométricas automatizadas. Toque emulado en 390×844.
- **iPad: PASS en emulación.** 820×1180 y 1180×820, ambos modos. Se corrigió un desborde vertical de los contenedores en horizontal y se repitió la suite. Motor WebKit adicional en 820×1180: inicio y clasificación táctil correctos. No son pruebas en hardware físico.
- **Desktop: PASS.** 1440×1000, ambos modos, sin overflow y controles visibles.
- **Funcional: PASS.** Cinco partidas completas con 8/8 y reinicio correcto en cada replay. Teclado 1/2/3, toque, pausa por P con congelación del reloj, timeout con feedback educativo, control de sonido y atributo accesible, movimiento reducido sin desplazamiento de tarjeta. Sin errores JavaScript registrados en Chromium.

## Duración medida

Una partida con esperas de lectura reales de 7.9 s por tarjeta duró **63.5 s activos**. Otras cuatro partidas se ejecutaron a velocidad de automatización (0.3 s cada una) para probar lógica y replay. No representan velocidad humana. El rango 60–100 s es un objetivo de diseño, no una duración mínima impuesta ni validación con estudiantes. Cada tarjeta admite 10.5 s y el feedback 2.2 s, omisible. El jugador puede terminar antes; una partida sin responder puede llegar aproximadamente a 102 s, excluyendo pausas.

## Reproducir

1. Servir con `python3 -m http.server 8037`.
2. Instalar Playwright y sus navegadores en un entorno de QA externo.
3. Ejecutar `PLAYWRIGHT_PATH=/ruta/a/playwright/index.mjs node qa.mjs`.
4. `QA_URL` permite usar otra URL, incluida la publicada.

La prueba dura aproximadamente 80 s. Las capturas se escriben en el directorio temporal de OpenCode configurado en `qa.mjs`; ajustar esa ruta al reproducir en otra máquina.

## Pendientes de validación externa

Prueba con estudiantes para calibrar dificultad 6.5/10 y duración natural; comprobación en iPhone/iPad físicos y evaluación con lector de pantalla. El control Web Audio se ejecutó, pero no se realizó evaluación auditiva humana del volumen.
