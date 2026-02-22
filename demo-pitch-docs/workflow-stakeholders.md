# Para El Sentido del Humor Producciones
## Cómo funciona DADOS & RISAS en sus shows

> **Este documento es para ustedes** — sin código, sin tecnicismos.  
> Solo lo que necesitan saber para decidir si esto encaja en su contenido.

> ⚠️ **Esto es un demo funcional.** El sistema ya corre y hace todo lo que se describe aquí. Si el piloto se confirma, podemos agregar base de datos, personalización de marca, sonidos, y cualquier función que quieran. Este es el punto de partida.

---

## ¿Qué problema resuelve esto?

Graban 3 a 5 horas de D&D. En edición tienen que revisar horas de material para encontrar los momentos más graciosos, los combates más tensos, las tiradas críticas.

Con DADOS & RISAS, **cada acción del juego queda registrada con timestamp**. El editor sabe exactamente en qué minuto del footage ocurrió cada tirada de dado, cada cambio de HP, cada momento memorable. Menos tiempo buscando, más tiempo editando lo bueno.

Además, los jugadores no necesitan hojas de papel — tienen sus fichas en el celular, actualizadas en tiempo real, y pueden enfocarse en ser graciosos en lugar de calcular números.

---

## El sistema completo — tres partes

```mermaid
flowchart TD
    subgraph STREAM["🎬 Para el video final (OBS)"]
        HP[Barras de vida\nde cada personaje]
        DICE[Popup del dado\n¡CRÍTICO! / ¡PIFIA!]
    end

    subgraph CONTROL["📱 Para el Dungeon Master\nPanel de control en celular"]
        DM1[Actualizar HP\nde cualquier personaje]
        DM2[Tirar dados\nd4 a d20]
        DM3[Agregar condiciones\ne.g. envenenado]
        DM4[Descansos cortos\ny largos]
    end

    subgraph PLAYERS["📺 Para los jugadores\nDashboard en celular o pantalla"]
        P1[Ver sus stats en vivo:\nHP · AC · Velocidad]
        P2[Ver sus recursos:\nRage · Ki · Hechizos]
        P3[Ver condiciones\nactivas]
        P4[Historial con timestamps\nde cada acción y dado]
    end

    subgraph MGMT["⚙️ Antes del show\nCreación y gestión de personajes"]
        M1[Crear personajes nuevos\ncon nombre, foto y stats]
        M2[Editar personajes\nexistentes]
    end

    CONTROL -- actualiza --> STREAM
    CONTROL -- sincroniza --> PLAYERS
    MGMT -- prepara --> CONTROL
```

**Tres beneficios en uno:**
1. **Los editores** tienen timestamps de cada momento — edición más rápida y precisa
2. **Los jugadores** tienen sus fichas en el celular, actualizadas automáticamente
3. **La audiencia** (grabación o stream) ve todo lo que pasa en pantalla

---

## El beneficio principal: timestamps para post-producción

Cada acción del sistema queda registrada automáticamente con la hora exacta.

```mermaid
flowchart TD
    A([Durante la grabación\n3-5 horas]) --> B[Cada acción genera\nun registro automático]

    B --> C["14:32 — Kael recibió daño\n8/12 HP"]
    B --> D["14:35 — Lyra tiró d20\nresultado: 18"]
    B --> E["15:10 — Brum queda en\nHP crítico 2/9"]
    B --> F["15:45 — ¡Nat 20!\nCrítico de Kael"]

    C --> G([📝 El editor recibe\nuna lista de momentos\ncon timestamp])
    D --> G
    E --> G
    F --> G

    G --> H[Busca esos momentos\nen el footage]
    H --> I([✂️ Edición 3x más rápida\nMejores momentos garantizados])
```

**Sin el sistema:** el editor revisa 4 horas de video para encontrar el momento en que alguien tiró un crítico.  
**Con el sistema:** el editor sabe que fue a las 15:45 y va directo.

---

## La experiencia completa — de un vistazo

```mermaid
flowchart TD
    A([🎬 Comienza la grabación\nOBS está grabando]) --> B[Equipo técnico\nya configuró todo\nantes de encender las cámaras]

    B --> C{Durante la grabación}

    C --> D[🎲 Un comediante\ntira los dados]
    D --> E[Toca un botón\nen su celular]
    E --> F[✨ En pantalla aparece\nel resultado del dado\ncon animación especial]
    E --> TS1[🕐 Timestamp registrado\nautomáticamente]

    C --> G[⚔️ Un personaje\nrecibe daño]
    G --> H[El Dungeon Master\ntoca el celular]
    H --> I[📊 La barra de vida\nse actualiza en pantalla\nen menos de 1 segundo]
    H --> TS2[🕐 Timestamp registrado\nautomáticamente]

    F --> J([🎞️ Post-producción tiene\nun log de todos los momentos])
    I --> J
    TS1 --> J
    TS2 --> J
```

---

## Lo que aparece en pantalla (grabación o stream)

```mermaid
flowchart LR
    subgraph OBS["🖥️ Lo que captura la cámara / OBS"]
        CAM[Cámara del show]
        HP[Barras de vida\nde cada personaje\narriba a la derecha]
        DICE[Popup del dado\ncuando alguien tira\narriba o abajo]
    end

    subgraph Control["📱 Lo que maneja el equipo en escena"]
        PHONE[Celular con\npanel de control]
    end

    PHONE -- toca un botón --> HP
    PHONE -- toca un botón --> DICE
```

**Todo sucede en tiempo real durante la grabación. Queda capturado directamente en el video — sin agregar nada en edición.**

---

## Los tres momentos que hacen reaccionar

```mermaid
flowchart TD
    A([Jugador tira el d20]) --> B{¿Qué salió?}

    B -- "20 natural 🎉" --> C["¡CRÍTICO!\nEl dado aparece en pantalla\ncon brillo verde intenso\ny texto enorme"]
    C --> D[Todos reaccionan\nTimestamp registrado]

    B -- "1 natural 😱" --> E["¡PIFIA!\nEl dado aparece en rojo\ncon efecto de error\ntodos ríen"]
    E --> D

    B -- Cualquier otro número --> F[Resultado aparece\nfade in / fade out\nen 4 segundos]
    F --> G[Show continúa]

    D --> G
```

---

## Cómo se ve una sesión típica

```mermaid
flowchart TD
    A([⏱️ 30 minutos antes\nde grabar]) --> B[Técnico enciende el servidor\nen la laptop]
    B --> C[Agrega los overlays\nen OBS]
    C --> D[Carga los personajes\ndel episodio de hoy]
    D --> E([Todo listo ✅])

    E --> F([🔴 Grabación en curso\n3-5 horas])
    F --> G[Comediantes juegan D&D\ncomo siempre]
    G --> H{Algo pasa en el juego}

    H -- Daño / curación --> I[DM toca el celular\n5 segundos]
    H -- Tirada de dado --> J[Jugador toca el celular\n2 segundos]
    H -- Condición de estado\ne.g. envenenado --> K[DM agrega condición\nen celular\n5 segundos]

    I --> L[📺 Pantalla se actualiza\n+ timestamp guardado]
    J --> L
    K --> L

    L --> M([🕐 Al terminar: log completo\nde todos los momentos\ncon hora exacta])
    M --> N([✂️ Editor usa el log\npara encontrar los mejores\nclips en minutos])
```

---

## Los jugadores tienen su ficha en el celular — sin papel

Uno de los mayores beneficios del sistema es que **los jugadores no necesitan hojas de papel**. Cada jugador puede abrir el Dashboard en su propio teléfono y ver su personaje actualizado en tiempo real.

```mermaid
flowchart LR
    subgraph SIN["❌ Sin el sistema"]
        A1[Jugador mira hoja de papel]
        A2[Tiene que calcular los números]
        A3[Interrumpe la grabación para\npreguntar '¿cuánta vida me queda?']
        A4[Se distrae de hacer comedia]
    end

    subgraph CON["✅ Con DADOS & RISAS"]
        B1[Jugador mira su celular]
        B2[Ve HP · AC · Recursos\nCondiciones actualizados]
        B3[El DM actualiza los números\nen su celular]
        B4[El jugador se enfoca\nen ser gracioso]
    end
```

**Lo que cada jugador ve en su celular (Dashboard):**

| Información | Ejemplo |
|-------------|---------|
| HP actual / máximo | 8 / 12 |
| HP temporal | +3 |
| Armadura (AC) | 15 |
| Velocidad | 30 ft |
| Atributos | STR 16 · DEX 12 · CON 14 · INT 8 · WIS 10 · CHA 18 |
| Condiciones activas | Envenenado · nivel 1 |
| Recursos con cargas | Furia: 2/3 (recarga: descanso corto) |
| Últimas 10 acciones con hora | 14:32 Kael HP → 8/12 |
| Últimos 10 dados con hora | 14:35 Lyra tiró 18 (d20+2) |

**Todo se actualiza automáticamente.** Cuando el DM actualiza el HP desde su celular, el dashboard del jugador refleja el cambio en menos de 1 segundo.

---

## Crear y gestionar personajes

Antes de cada episodio, el equipo técnico (o el productor) usa el panel de gestión para preparar los personajes del show. No requiere programación — es un formulario web.

```mermaid
flowchart TD
    A([Preparar episodio nuevo]) --> B[Abrir panel de gestión\nen cualquier browser]

    B --> C{Personaje nuevo\no episodio recurrente?}

    C -- Nuevo personaje --> D[Llenar el formulario:\nNombre · Jugador\nHP máximo · Armadura\nClase · Nivel\nFoto del personaje]
    D --> E[Guardar personaje]
    E --> F[Aparece en todos\nlos paneles conectados\nen tiempo real]

    C -- Personaje recurrente --> G[Ir a Gestión → Administrar]
    G --> H[Buscar el personaje]
    H --> I[Editar stats para\neste episodio\ne.g. subió de nivel]
    I --> F

    F --> J([Listos para grabar ✅])
```

**Opciones de foto para cada personaje:**
- Elegir arte predefinido (bárbaro, elfo, mago)
- Pegar una URL de imagen externa
- Subir una imagen desde el dispositivo (fan art, fotos del equipo, etc.)

> **Nota sobre persistencia:** En este demo, los datos se guardan en memoria — si el servidor se reinicia, hay que volver a cargar los personajes. Si el piloto se confirma, agregamos una base de datos y los personajes persisten entre sesiones sin hacer nada.

---

## ¿Qué necesitan ustedes hacer?

```mermaid
flowchart TD
    A([Lo que necesitan de ESDH]) --> B[Decidir los personajes\nnombres y puntos de vida]
    B --> C[Fotos o avatares\nde cada personaje\nopcional]
    C --> D[Una laptop encendida\ndurante la grabación]
    D --> E[Un teléfono por persona\no solo para el DM]
    E --> F([Eso es todo ✅\nEl resto lo maneja\nel equipo técnico])
```

**No necesitan saber programar. No necesitan tocar código. No necesitan instalar nada en sus teléfonos.**

---

## Lo que hace el equipo técnico (una sola vez)

```mermaid
flowchart TD
    A([Setup inicial\npor el dev team]) --> B[Instala el sistema\nen laptop dedicada]
    B --> C[Configura los overlays\nen el OBS de ESDH]
    C --> D[Crea plantillas\nde personajes recurrentes]
    D --> E[Hace demo + entrenamiento\ncon el equipo de producción]
    E --> F([✅ Sistema entregado\nlisto para usar en cada grabación])

    F --> G([Para cada episodio\nel productor solo:])
    G --> H[Enciende la laptop]
    H --> I[Carga los personajes\ndel episodio]
    I --> J([Grabar ✅])
```

---

## ¿Qué pueden personalizar?

| Elemento | ¿Se puede cambiar? | Ejemplos |
|----------|-------------------|----------|
| Colores de las barras de vida | ✅ Sí | Colores de ESDH, branding del show |
| Fuente y tipografía | ✅ Sí | La que usen en sus thumbnails |
| Posición de los overlays | ✅ Sí | Arriba, abajo, costado |
| Texto de ¡CRÍTICO! / ¡PIFIA! | ✅ Sí | Frases propias del show |
| Sonidos al tirar dados | ✅ Sí | Efectos de audio personalizados |
| Avatares de personajes | ✅ Sí | Fan art, fotos, ilustraciones |
| Nombre del show en overlays | ✅ Sí | "DADOS & RISAS" o su marca |
| Funciones nuevas | ✅ Sí | Lo que quieran si el piloto avanza |

---

## Comparación: con y sin el sistema

```mermaid
flowchart LR
    subgraph SIN["❌ Sin el sistema"]
        A1[Editor revisa 4 horas de video\nbuscando el momento del crítico]
        A2[Jugadores interrumpen\nla grabación para calcular stats]
        A3[La audiencia no entiende\nqué está pasando en pantalla]
        A4[El show se detiene para\nexplicar el estado del juego]
    end

    subgraph CON["✅ Con DADOS & RISAS"]
        B1[Editor tiene un log con timestamps\nva directo al minuto exacto]
        B2[Jugadores ven sus fichas\nen el celular — no interrumpen]
        B3[La audiencia ve HP y dados\nen pantalla en tiempo real]
        B4[El show fluye sin\ninterrupciones técnicas]
    end
```

---

## Preguntas frecuentes

**¿Los jugadores necesitan instalar alguna app?**  
No. El panel de control y el dashboard son páginas web. Los jugadores abren el navegador de su celular, escriben la URL, y listo.

**¿Cuántas pantallas necesitan?**  
Como mínimo una (la laptop con OBS). Idealmente: una pantalla para OBS capturando, y los jugadores con el dashboard en su propio celular. Si tienen una TV en la mesa, pueden mostrar el dashboard ahí para que todos lo vean.

**¿Funciona también para livestream?**  
Sí. Si en algún momento quieren hacer el show en vivo, el sistema funciona exactamente igual. El foco del pitch es la grabación, pero el livestream no requiere ningún cambio.

**¿Qué pasa si se corta internet durante la grabación?**  
El sistema no necesita internet — funciona completamente en la red local (Wi-Fi entre la laptop y los teléfonos). Internet solo es necesario si están transmitiendo en vivo; para grabación, no hace falta.

**¿Pueden usarlo para múltiples episodios?**  
Sí. Antes de cada grabación, cargan los personajes del episodio (toma minutos). Si el piloto se confirma, agregamos una base de datos y los personajes persisten automáticamente entre sesiones.

**¿Cuántos personajes pueden tener en pantalla?**  
El sistema soporta múltiples personajes. Para un show, entre 3 y 6 personajes es lo ideal visualmente.

**¿Qué pasa si un personaje cambia de episodio a episodio (sube de nivel, nuevo equipo)?**  
El productor o DM edita el personaje en el panel de gestión antes del show. Cambia los stats, sube el nivel, actualiza la foto si quieren. Todo se actualiza en tiempo real cuando se guarda.

**¿Pueden pedir funciones nuevas?**  
Sí. Este es el punto de partida. Si el piloto avanza, podemos agregar lo que necesiten: base de datos, nuevo overlay, integración con su software de edición, sonidos personalizados, lo que sea.

---

## El pitch en una sola imagen

```mermaid
flowchart TD
    A(["🎭 El Sentido del Humor\ngrabando un show de D&D\n3-5 horas de footage"]) --> B1
    A --> B2
    A --> B3

    B1["✂️ Post-producción más rápida\nlog de timestamps de cada momento\n— el editor sabe dónde están los mejores clips"]
    B2["📱 Los jugadores se enfocan\nen hacer comedia\n— sus fichas en el celular, sin papel"]
    B3["🎬 El video queda profesional\nHP y dados visibles en pantalla\n— sin agregar nada en edición"]

    B1 --> C(["🚀 Un show diferente a\ntodo lo que hay en\nYouTube de habla hispana"])
    B2 --> C
    B3 --> C
```

---

> *"Este es el MVP — si el piloto avanza, podemos agregar lo que necesiten."*  
> — Equipo DADOS & RISAS
