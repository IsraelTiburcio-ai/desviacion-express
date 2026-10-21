// Fuente conceptual: Gimnasio 5, pp. 6–9. La respuesta se deriva de datos, no del texto.
export const deviations = (target, actual) => ({ minus: Math.max(target - actual, 0), plus: Math.max(actual - target, 0) });
const numeric = (id, category, target, actual, unit = 'unidades') => ({ id, category, target, actual, unit, kind: 'result', group: actual < target ? 'short' : actual > target ? 'over' : 'equal' });
const policy = (id, category, target, rule, unit, actual) => ({ id, category, target, rule, unit, actual, kind: 'penalty', group: rule === 'min' ? 'minimum' : rule === 'max' ? 'maximum' : 'interpret' });
export const BANK = [
 numeric('A','Producción',100,80), numeric('B','Producción',100,125), numeric('C','Producción',100,100),
 numeric('N04','Demanda',245,218,'pedidos'), numeric('N05','Utilidad',1875,1690,'pesos'), numeric('N06','Presupuesto',960,847,'pesos'), numeric('N07','Producción',72,63), numeric('N08','Ingresos',5000,4625,'pesos'),
 numeric('N09','Costos',600,647,'pesos'), numeric('N10','Demanda',138,157,'pedidos'), numeric('N11','Utilidad',2420,2685,'pesos'), numeric('N12','Presupuesto',1250,1318,'pesos'), numeric('N13','Producción',86,103),
 numeric('N14','Demanda',175,175,'pedidos'), numeric('N15','Costos',835,835,'pesos'), numeric('N16','Utilidad',3200,3200,'pesos'),
 policy('D','Ingresos',5000,'min','pesos'), policy('P18','Demanda',135,'min','pedidos'), policy('P19','Utilidad',2750,'min','pesos'), policy('P20','Producción',84,'min','unidades'),
 policy('E','Gastos',600,'max','pesos'), policy('P22','Presupuesto',1475,'max','pesos'), policy('P23','Costos',925,'max','pesos'), policy('P24','Horas de producción',38,'max','horas'),
 policy('F','Producción',40,'exact','unidades'), policy('P26','Demanda',128,'exact','pedidos'),
 policy('I27','Ingresos',5000,'min','pesos',5375), policy('I28','Gastos',600,'max','pesos',548), policy('I29','Producción',40,'exact','unidades',46), policy('I30','Utilidad',1875,'min','pesos',1798)
].map(item => item.id.startsWith('I') ? { ...item, group: 'interpret' } : item);
export function answerFor(item) {
 if (item.kind === 'penalty') return item.rule === 'min' ? 'minus' : item.rule === 'max' ? 'plus' : 'exact';
 return item.actual < item.target ? 'minus' : item.actual > item.target ? 'plus' : 'exact';
}
export function shuffle(items, random = Math.random) {
 const list = [...items]; for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } return list;
}
export function createRound(random = Math.random) {
 const pick = (group, count) => shuffle(BANK.filter(c => c.group === group), random).slice(0, count);
 // El último puesto incluye exactitud y contrastes entre desviación observada y penalizada.
 return [...shuffle([...pick('short',2), ...pick('over',2), ...pick('equal',1)], random), ...shuffle([...pick('minimum',1), ...pick('maximum',1), ...pick('interpret',1)], random)];
}
export const format = n => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(n);
export function explanation(item) {
 const observed = item.actual === undefined ? '' : (() => { const d = deviations(item.target,item.actual); return `d⁻ = ${format(d.minus)}, d⁺ = ${format(d.plus)}. `; })();
 if (item.kind === 'result') return `${observed}${item.actual < item.target ? `Faltaron ${format(item.target-item.actual)} ${item.unit}.` : item.actual > item.target ? `El resultado supera la meta en ${format(item.actual-item.target)} ${item.unit}.` : 'Se alcanzó exactamente la meta.'}`;
 return observed + (item.rule === 'min' ? 'Para una meta mínima se penaliza d⁻, el faltante, aunque el resultado pueda superarla.' : item.rule === 'max' ? 'Para una meta máxima se penaliza d⁺, el exceso, aunque el resultado pueda quedar por debajo.' : 'Para buscar exactitud se penalizan d⁻ y d⁺: importa evitar ambos sentidos de desviación.');
}
