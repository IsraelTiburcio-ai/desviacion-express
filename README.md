# DESVIACIÓN EXPRESS

**¿Faltó, sobró o se cumplió?** Microjuego de Optimización I, Gimnasio 5: Programación de Metas. HTML, CSS, JavaScript modular y SVG; sin compilación ni dependencias de ejecución. Tipografías Google Fonts con respaldo local sans-serif.

## Ejecutar

Desde esta carpeta: `python3 -m http.server 8000`, abrir http://localhost:8000. Usar servidor HTTP para módulos ES.

## Mecánica y banco

30 situaciones en `data.js`. Cada partida selecciona sin reemplazo 2 faltantes, 2 excesos, 1 cumplimiento exacto, 1 mínimo, 1 máximo y 1 interpretación variable (incluye exactitud). Los cinco casos numéricos y los tres de penalización se mezclan dentro de sus bloques. Todos los ejemplos A–F solicitados están en el banco; no todos aparecen en cada partida.

10.5 s por tarjeta; feedback hasta 2.2 s, con continuación inmediata. Duración objetivo 60–100 s según velocidad de respuesta; no es un mínimo obligatorio. Se mide tiempo activo, incluyendo feedback, excluyendo pausa. Sin vidas. Teclas 1/2/3, botones nativos táctiles, P para pausar, Tab/Enter. Pausa automática al ocultar pestaña. Sonido sintetizado discreto y silenciable. Movimiento reducido desactiva desplazamientos, manteniendo el reloj; para tiempo ilimitado de lectura se puede pausar.

## Fundamento académico

PDF revisado antes de implementar: `GYM 5_251128_083844.pdf`, localizado en `/Users/israeltiburcio/Documents/Mac/Optimización 1 proyectos /`. Páginas 6–9; sección 5.4 en pp. 7–8. El PDF es un cuadernillo con espacios por completar y anotaciones. No se redistribuye.

- Valor alcanzado + d⁻ − d⁺ = meta; ambas variables no negativas.
- Representación natural: d⁻ = max(meta − alcanzado, 0); d⁺ = max(alcanzado − meta, 0).
- Mínimo: penalizar d⁻; máximo: d⁺; exactitud: ambas.
- En resultados, el tercer contenedor significa ambas **cero**. En penalización se rotula **AMBAS, d⁻ y d⁺**, porque se busca exactitud, no porque ambas sean positivas simultáneamente.
- Retos avanzados contrastan explícitamente la desviación observada con la penalizada.

## Publicación

Repositorio independiente `desviacion-express`, rama `main`. `.github/workflows/pages.yml` publica mediante GitHub Actions. Configurar Pages con origen GitHub Actions. URL prevista: https://israeltiburcio-ai.github.io/desviacion-express/.

## QA

Los resultados ejecutados y sus limitaciones se documentan en `QA.md`.
