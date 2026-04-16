import { createSupabaseClient } from './supabase'

// ─── MIEMBROS ──────────────────────────────────────────────────────────────────
const MEMBERS_SEED = [
  { name: 'Gonza',  color: '#F59E0B', emoji: '⚡' },
  { name: 'Ara',    color: '#EC4899', emoji: '🌸' },
  { name: 'Martu',  color: '#8B5CF6', emoji: '✨' },
  { name: 'Migue',  color: '#3B82F6', emoji: '🎯' },
  { name: 'Sil',    color: '#10B981', emoji: '🌿' },
  { name: 'Nare',   color: '#EF4444', emoji: '🔥' },
  { name: 'Juani',  color: '#F97316', emoji: '🎵' },
  { name: 'Giuli',  color: '#06B6D4', emoji: '💫' },
  { name: 'Olga',   color: '#84CC16', emoji: '🌙' },
  { name: 'Fer',    color: '#A855F7', emoji: '🦋' },
]

// ─── SEED DATA ─────────────────────────────────────────────────────────────────
const TASKS_SEED: {
  pack_number?: string
  title: string
  description?: string
  category: 'individual' | 'grupal' | 'seniors'
  list: 'finde' | 'seniors'
  section?: string
  priority: number
  subtasks: string[]
}[] = [
  // ── INDIVIDUALES ─────────────────────────────────────────────────────────────
  {
    pack_number: 'PACK 1',
    title: 'Mi bolso personal',
    description: '1 bolso por persona, nombre visible. NO llevar más de uno.',
    category: 'individual',
    list: 'finde',
    section: 'logistica',
    priority: 1,
    subtasks: [
      'Artículos personales de baño y tocador',
      'Ropa para día lluvioso (abrigo incluido)',
      'Ropa para día soleado',
      'Ropa de cama: bolsa de dormir + frazadas',
      'Tallón y toalla',
      'Ropa para pileta',
      'Repelente para moscas y mosquitos',
      'Resultados de metas: porcentaje de cada meta + porcentaje total de la carta',
    ],
  },
  {
    pack_number: 'PACK 2',
    title: 'Mi almohadón',
    description: 'Todos los almohadones van en una bolsa de consorcio etiquetada ALMOHADONES.',
    category: 'individual',
    list: 'finde',
    section: 'logistica',
    priority: 2,
    subtasks: [
      'Conseguir mi almohadón',
      'Etiquetarlo con mi nombre',
      'Confirmado que irá en la bolsa grupal "ALMOHADONES"',
    ],
  },
  {
    pack_number: 'PACK 3',
    title: 'Mi objeto para soltar',
    description:
      'Un objeto que simbolice algo que querés dejar atrás. Algo que te lastima y al que le vas a decir BASTA. Vas a desprenderte de él para que esa historia se vaya con él.',
    category: 'individual',
    list: 'finde',
    section: 'logistica',
    priority: 3,
    subtasks: [
      'Elegir el objeto significativo',
      'Colocarlo en sobre/bolsa con tu nombre y apellido visible',
      'Listo para incluirlo en la caja/bolsa grupal del PACK 3',
    ],
  },
  {
    pack_number: 'PACK 4',
    title: 'Mi cartulina y fotos',
    description: 'Todo va junto en una bolsa etiquetada con nombres.',
    category: 'individual',
    list: 'finde',
    section: 'logistica',
    priority: 4,
    subtasks: [
      'Conseguir cartulina de color claro',
      'Foto de mi niñez',
      'Foto de mi familia',
      'Foto mía (actual)',
      'Poner nombre en la parte de atrás de todo',
    ],
  },
  {
    pack_number: 'PACK 5',
    title: 'Mi velón',
    description: 'Velón blanco, 7 días, 100% parafina.',
    category: 'individual',
    list: 'finde',
    section: 'logistica',
    priority: 5,
    subtasks: [
      'Conseguir velón blanco 7 días 100% parafina',
      'Etiquetarlo con mi nombre',
    ],
  },
  {
    pack_number: 'PACK 8',
    title: 'Cartitas de reconocimiento',
    description:
      '15 cartitas: una por cada compañero Kintsu + los 5 seniors del programa. Cada cartita lleva el nombre del destinatario y tu firma con reconocimiento genuino.',
    category: 'individual',
    list: 'finde',
    section: 'logistica',
    priority: 8,
    subtasks: [
      'Cartita para Gonza',
      'Cartita para Ara',
      'Cartita para Martu',
      'Cartita para Migue',
      'Cartita para Sil',
      'Cartita para Nare',
      'Cartita para Juani',
      'Cartita para Giuli',
      'Cartita para Olga',
      'Cartita para Fer',
      'Cartita para Sharito (senior)',
      'Cartita para Alan (senior)',
      'Cartita para Maga',
      'Cartita para Maru',
      'Cartita para Mariano',
    ],
  },

  // ── GRUPALES ──────────────────────────────────────────────────────────────────
  {
    pack_number: 'PACK 5-G',
    title: 'Sahumerios de sándalo',
    description: '4 cajas de sahumerios de sándalo para el equipo.',
    category: 'grupal',
    list: 'finde',
    section: 'logistica',
    priority: 10,
    subtasks: [
      'Asignar quién los compra',
      'Comprar las 4 cajas',
      'Confirmado para el finde',
    ],
  },
  {
    pack_number: 'PACK 6',
    title: 'Comida y mates',
    description: 'Equipos de mates + toda la comida del finde.',
    category: 'grupal',
    list: 'finde',
    section: 'logistica',
    priority: 11,
    subtasks: [
      'Equipos de mates completos (termo, mate, yerba, azúcar)',
      'Snacks para todo el fin de semana',
      'Cena del viernes',
      'Almuerzo del sábado',
      'Cena del sábado',
      'Desayunos y meriendas',
      'Todo en una sola bolsa/caja identificada',
    ],
  },
  {
    pack_number: 'PACK 7',
    title: 'Remeras de graduación',
    description:
      'Remeras para TODOS: graduados, seniors, colaboradores, coordinadores y entrenadores. Incluyen: Nª Creser, Nombre de Creser, Logo de Home, Visión del equipo + Dibujo, Nombre de todos los graduados, seniors, colaboradores, coordinadores y entrenadores.',
    category: 'grupal',
    list: 'finde',
    section: 'logistica',
    priority: 12,
    subtasks: [
      'Definir cantidad total de remeras (graduados + seniors + colabs + coords + coaches)',
      'Confirmar diseño con la diseñadora ✅',
      'Aprobar diseño final con el equipo ✅',
      'Conseguir quien las estampe ✅',
      'Verificar calidad de tela y estampa ✅',
      'Confirmar talles de todos ✅',
      'Hacer el pedido formal',
      'Pagar la producción',
      'Retirar las remeras',
      'Distribuir y confirmar que llegaron a todos',
    ],
  },
  {
    pack_number: 'LOG-1',
    title: 'Pago de la quinta',
    description: '350.000 pesos',
    category: 'grupal',
    list: 'finde',
    section: 'logistica',
    priority: 13,
    subtasks: [
      'Juntar el dinero entre el equipo',
      'Realizar el pago (350.000 pesos)',
      'Confirmar reserva',
    ],
  },
  {
    pack_number: 'LOG-2',
    title: '4 colchones',
    description: 'Coordinar 4 colchones para el finde.',
    category: 'grupal',
    list: 'finde',
    section: 'logistica',
    priority: 14,
    subtasks: [
      'Confirmar quién tiene colchones disponibles',
      'Coordinar transporte de los 4 colchones',
      '4 colchones confirmados para el viaje',
    ],
  },
  {
    pack_number: 'LOG-3',
    title: 'Transporte y logística de salida',
    description:
      'Todos en HOME el viernes a las 17:30hs. Salida puntual a las 18:00hs. Destino a 60km de Home (~1.5hs de viaje). El mapa se entrega cuando estén todos.',
    category: 'grupal',
    list: 'finde',
    section: 'logistica',
    priority: 15,
    subtasks: [
      'Confirmar transporte (autos / vehículos disponibles)',
      'Coordinar quién va en qué vehículo',
      'Todos confirmados para llegar a las 17:30hs el viernes',
      'DESAFÍO: Salir TODOS a las 18:00hs y llegar en 1.5hs',
    ],
  },

  // ── SENIORS ───────────────────────────────────────────────────────────────────
  {
    pack_number: 'PROPS-1',
    title: 'Dresscode Gala',
    category: 'seniors',
    list: 'seniors',
    section: 'props',
    priority: 20,
    subtasks: [
      'Cada uno confirma que tiene su vestuario de gala',
      'Coordinación grupal de looks',
    ],
  },
  {
    pack_number: 'PROPS-2',
    title: 'Props especiales',
    category: 'seniors',
    list: 'seniors',
    section: 'props',
    priority: 21,
    subtasks: [
      'Conseguir 1 flor azul con espinas rojas',
      'Conseguir 1 pluma de gaviota real',
    ],
  },
  {
    pack_number: 'PERF-1',
    title: 'Saludo de paredes para Maru',
    category: 'seniors',
    list: 'seniors',
    section: 'performance',
    priority: 22,
    subtasks: [
      'Definir el saludo',
      'Primer ensayo',
      'Ensayo general',
      'Listo para el evento',
    ],
  },
  {
    pack_number: 'SKT-1',
    title: 'Imitación de seniors y equipo Home',
    category: 'seniors',
    list: 'seniors',
    section: 'performance',
    priority: 23,
    subtasks: [
      'Definir a quiénes imitar y cómo',
      'Escribir el guión',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'SKT-2',
    title: 'Imitación de participantes',
    category: 'seniors',
    list: 'seniors',
    section: 'performance',
    priority: 24,
    subtasks: [
      'Elegir participantes y situaciones',
      'Escribir el guión',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'SKT-3',
    title: 'Simuladores: ejemplos de misiones',
    description:
      'Hacer que Gonza aparezca, desenamorar a Sil, que Juan aprenda a andar en bici, que Olga consiga un arpa, que los Kintsu no sean hijos del rigor, etc.',
    category: 'seniors',
    list: 'seniors',
    section: 'performance',
    priority: 25,
    subtasks: [
      'Definir todas las misiones / situaciones',
      'Asignar roles',
      'Escribir el guión',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'SKT-4',
    title: 'El Chavo del 8',
    description:
      'Olga=bruja del 71 | Migue=Sr. Barriga | Fer=Don Ramón | Gonza=el Chavo | Ara=la Chilindrina | Sil=Doña Florinda',
    category: 'seniors',
    list: 'seniors',
    section: 'performance',
    priority: 26,
    subtasks: [
      'Asignar vestuario/props por personaje (Olga, Migue, Fer, Gonza, Ara, Sil)',
      'Escribir la escena',
      'Primer ensayo con personajes',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-1',
    title: 'Día de Sandwich (Lilo y Stitch)',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 30,
    subtasks: [
      'Conseguir la música / track',
      'Aprender la coreografía / letra',
      'Primer ensayo grupal',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-2',
    title: 'Se lava la carita (Shrek)',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 31,
    subtasks: [
      'Conseguir la música / track',
      'Aprender la coreografía / letra',
      'Primer ensayo grupal',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-3',
    title: 'Flor azul espinas rojas',
    description: 'Sil=María Elena Fusseneco "vuelo arrasante" | Fer=Pepe | Olga=Moni',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 32,
    subtasks: [
      'Asignar roles: Sil, Fer, Olga',
      'Aprender la pieza',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-4',
    title: 'Migue: Martín Marquesi Rey Sol',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 33,
    subtasks: [
      'Preparar el número',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-5',
    title: 'Martu y Giuli: Cazzu y la Joaqui',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 34,
    subtasks: [
      'Preparar el número (Martu + Giuli)',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-6',
    title: 'Juani: Winnie Pooh y sus amigos',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 35,
    subtasks: [
      'Preparar el número',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-7',
    title: 'Nare: Me casé con un boludo',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 36,
    subtasks: [
      'Preparar el número',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'JAM-8',
    title: 'Ara y Gonza: Tiburón / Nemo',
    description: 'Ara=pez globo | Gonza=pez jefe. "Uh ha ha, Nemo."',
    category: 'seniors',
    list: 'seniors',
    section: 'jam',
    priority: 37,
    subtasks: [
      'Preparar el número (Ara + Gonza)',
      'Primer ensayo',
      'Ensayo general',
      'Listo',
    ],
  },
  {
    pack_number: 'MUS-1',
    title: 'Los varones de Bandana / Las chicas de Mambrú',
    category: 'seniors',
    list: 'seniors',
    section: 'musical',
    priority: 40,
    subtasks: [
      'Asignar roles varones / chicas',
      'Conseguir backing tracks',
      'Aprender letra y coreografía',
      'Primer ensayo grupal',
      'Ensayo general',
      'Perfeccionado y listo',
    ],
  },
  {
    pack_number: 'MUS-2',
    title: 'Coreo de Kintsu',
    description: 'La coreo característica del equipo. Perfeccionar.',
    category: 'seniors',
    list: 'seniors',
    section: 'musical',
    priority: 41,
    subtasks: [
      'Revisar la versión actual',
      'Identificar partes a mejorar',
      'Ensayo de perfeccionamiento',
      'Ensayo general',
      'Perfeccionada y lista',
    ],
  },
]

// ─── SEED FUNCTION ─────────────────────────────────────────────────────────────
export async function seedDatabase(): Promise<{ ok: boolean; message: string }> {
  const supabase = createSupabaseClient()

  try {
    // Check if already seeded
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      return { ok: true, message: `Ya hay ${count} tareas. No se re-seedea.` }
    }

    // 1. Seed members
    await supabase.from('members').upsert(MEMBERS_SEED, { onConflict: 'name' })

    // 2. Seed tasks + subtasks
    for (const taskDef of TASKS_SEED) {
      const { subtasks, ...taskFields } = taskDef
      const { data: insertedTask, error: taskErr } = await supabase
        .from('tasks')
        .insert({
          ...taskFields,
          pack_number: taskFields.pack_number ?? null,
          description: taskFields.description ?? null,
          section: taskFields.section ?? null,
        })
        .select()
        .single()

      if (taskErr) {
        console.error('Error inserting task:', taskFields.title, taskErr)
        continue
      }

      if (subtasks.length > 0 && insertedTask) {
        const subtaskRows = subtasks.map((title, idx) => ({
          task_id: insertedTask.id,
          title,
          order_index: idx,
        }))
        await supabase.from('subtasks').insert(subtaskRows)
      }
    }

    return { ok: true, message: `Seed completado: ${TASKS_SEED.length} tareas cargadas.` }
  } catch (err) {
    console.error('Seed error:', err)
    return { ok: false, message: String(err) }
  }
}
