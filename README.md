# PYL — Technical Workspace for Placa de Yeso Laminado

PYL es una aplicación web orientada a profesionales que trabajan con sistemas de **Placa de Yeso Laminado**, diseñada para centralizar cálculos, proyectos, clientes, presupuestos y documentación técnica en un único workspace.

El proyecto está evolucionando desde una calculadora básica hacia una plataforma técnica **local-first**, preparada para incorporar inteligencia artificial, agentes, tools y skills especializadas en PYL.

---

## Objetivo

PYL busca resolver una necesidad concreta: reducir el trabajo manual necesario para preparar mediciones, calcular materiales, organizar proyectos y generar presupuestos relacionados con sistemas de placa de yeso laminado.

La aplicación pretende convertirse en una herramienta técnica capaz de gestionar todo el flujo de trabajo:

```text
Proyecto
   ↓
Medición
   ↓
Sistema constructivo
   ↓
Cálculo de materiales
   ↓
Presupuesto
   ↓
Documentación
```

En una fase posterior, este flujo podrá ser operado también mediante **PYL Copilot**, un asistente especializado capaz de interpretar instrucciones en lenguaje natural y utilizar las herramientas internas de la aplicación.

---

## Estado del proyecto

PYL se encuentra actualmente en desarrollo activo.

La arquitectura está siendo renovada con los siguientes principios:

* aplicación local-first
* lógica de negocio separada de la interfaz
* cálculos deterministas
* almacenamiento local mediante IndexedDB
* arquitectura modular
* TypeScript estricto
* preparación para IA y agentes
* posibilidad futura de sincronización cloud
* funcionamiento independiente de una base de datos remota

---

## Stack

El proyecto utiliza:

* Next.js
* React
* TypeScript
* Tailwind CSS
* App Router
* IndexedDB
* Dexie
* Dexie React Hooks

La futura capa de IA estará desacoplada del dominio para permitir utilizar diferentes modelos y proveedores.

---

## Arquitectura

La estructura objetivo del proyecto sigue una separación clara entre interfaz, funcionalidades, lógica de negocio y persistencia.

```text
src/
│
├── app/
│   ├── calculadora/
│   ├── clientes/
│   ├── configuracion/
│   ├── guias/
│   ├── materiales/
│   ├── presupuestos/
│   ├── proyectos/
│   └── api/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── ui/
│   └── shared/
│
├── features/
│   ├── calculations/
│   ├── clients/
│   ├── budgets/
│   ├── materials/
│   ├── projects/
│   ├── settings/
│   └── ai/
│
├── domain/
│   ├── calculations/
│   ├── materials/
│   ├── pricing/
│   └── systems/
│
├── lib/
│   ├── db/
│   ├── storage/
│   └── utils/
│
├── hooks/
│
└── types/
```

La aplicación está diseñada para evitar que la lógica técnica dependa directamente de React.

Por ejemplo:

```text
UI
 ↓
Feature
 ↓
Domain
 ↓
Calculation Engine
```

Esto permitirá reutilizar el mismo motor de cálculo desde:

* la calculadora manual
* proyectos
* presupuestos
* APIs
* PYL Copilot
* agentes
* skills
* futuras aplicaciones móviles

---

# Local-first

PYL no requiere actualmente una base de datos externa.

Los datos del usuario se almacenan directamente en el navegador mediante **IndexedDB**.

```text
Usuario
   ↓
Navegador
   ↓
IndexedDB
   ↓
PYL
```

La base local utiliza el nombre:

```text
pyl-db
```

Y está preparada para almacenar:

```text
projects
clients
budgets
calculations
settings
```

Esto permite que la aplicación funcione sin necesidad de:

* Supabase
* Firebase
* PostgreSQL
* MySQL
* Prisma
* servidor de base de datos

---

## Privacidad

Los datos permanecen en el dispositivo del usuario.

PYL no necesita enviar proyectos, clientes, mediciones o presupuestos a un servidor externo para funcionar.

Esto permite mantener un modelo:

```text
Local by default.
Cloud optional.
```

La sincronización entre dispositivos podrá añadirse posteriormente sin sustituir el sistema local.

---

# Proyectos

El módulo de proyectos permitirá organizar cada trabajo de forma independiente.

Cada proyecto podrá contener:

```text
Proyecto
│
├── Cliente
├── Datos generales
├── Mediciones
├── Sistemas
├── Materiales
├── Cálculos
├── Presupuesto
└── Historial
```

Estados previstos:

```text
draft
active
completed
archived
```

---

# Clientes

PYL incorpora una gestión básica de clientes para asociarlos a proyectos y presupuestos.

Cada cliente podrá incluir:

* nombre
* empresa
* teléfono
* correo electrónico
* notas
* proyectos asociados
* presupuestos asociados

---

# Calculadora PYL

Uno de los componentes centrales del proyecto será el motor de cálculo técnico.

La lógica se implementa mediante funciones TypeScript puras dentro del dominio.

Ejemplo conceptual:

```ts
calculatePartition(input)
```

La función recibe los parámetros de un sistema y devuelve un resultado estructurado.

```ts
{
  grossArea,
  openingsArea,
  netArea,
  boardArea,
  boardCount,
  studCount,
  trackLength,
  insulationArea,
  wastePercentage
}
```

---

## Principio de cálculo

Los cálculos técnicos no dependerán de inteligencia artificial.

```text
IA → interpretar

Código → calcular
```

La IA podrá determinar qué herramienta debe utilizarse, pero las cantidades serán calculadas mediante funciones deterministas.

Esto permite obtener:

* resultados reproducibles
* reglas verificables
* tests unitarios
* menor riesgo de errores
* trazabilidad

---

# Sistemas PYL

El motor está preparado para evolucionar progresivamente hacia diferentes sistemas constructivos.

Inicialmente:

```text
Tabiques
```

Posteriormente:

```text
Trasdosados
Techos continuos
Techos registrables
Sistemas acústicos
Sistemas resistentes al fuego
Sistemas de múltiples placas
```

---

# Materiales

La futura biblioteca de materiales permitirá trabajar con elementos como:

```text
Placas
Montantes
Canales
Perfiles
Tornillería
Cinta
Pasta
Aislamiento
Accesorios
```

Las reglas de consumo deberán permanecer separadas del catálogo de productos.

Esto permitirá utilizar diferentes marcas o proveedores sin modificar el motor de cálculo.

---

# Presupuestos

El módulo de presupuestos estará conectado con proyectos, clientes y cálculos.

Un presupuesto podrá contener:

```text
Material
Mano de obra
Otros conceptos
Margen
Impuestos
Total
```

La estructura estará preparada para generar posteriormente:

* PDF
* impresión
* exportación
* envío al cliente
* plantillas personalizadas

---

# Copias de seguridad

Al tratarse de una aplicación local-first, PYL incluirá un sistema de exportación e importación.

Formato previsto:

```text
pyl-backup-YYYY-MM-DD.json
```

Ejemplo:

```json
{
  "version": 1,
  "app": "PYL",
  "exportedAt": "2026-08-16T18:00:00Z",
  "data": {
    "projects": [],
    "clients": [],
    "budgets": [],
    "calculations": [],
    "settings": []
  }
}
```

Esto permitirá:

```text
Equipo A
   ↓
Exportar backup
   ↓
JSON
   ↓
Equipo B
   ↓
Importar
```

---

# PYL Copilot

Una de las fases principales del proyecto será incorporar un asistente especializado llamado provisionalmente:

```text
PYL Copilot
```

El objetivo no es añadir un simple chatbot.

PYL Copilot podrá utilizar el contexto de la aplicación y operar herramientas internas.

Ejemplo:

```text
Usuario

"Tengo un tabique de 5 metros por 2,60,
doble placa por cada lado y montantes cada 60 cm."
```

El flujo será:

```text
Usuario
   ↓
PYL Copilot
   ↓
Interpretación
   ↓
Tool
   ↓
Motor PYL
   ↓
Resultado
```

---

# AI Tools

La futura arquitectura de IA podrá disponer de herramientas como:

```text
calculatePartition
calculateCeiling
calculateLining

getProject
createProject
updateProject

addCalculationToProject

createBudget
updateBudget

getMaterials

searchTechnicalLibrary
```

El agente no implementará directamente estas operaciones.

Utilizará funciones existentes del dominio.

---

# Skills

PYL está pensado para incorporar skills especializadas.

Estructura prevista:

```text
skills/
│
├── pyl-calculator/
│   └── SKILL.md
│
├── pyl-partitions/
│   └── SKILL.md
│
├── pyl-ceilings/
│   └── SKILL.md
│
├── pyl-materials/
│   └── SKILL.md
│
├── pyl-budget/
│   └── SKILL.md
│
├── pyl-project-review/
│   └── SKILL.md
│
└── pyl-technical-assistant/
    └── SKILL.md
```

Estas skills contendrán conocimiento operacional sobre cada área.

La intención es evitar prompts gigantes y dividir la capacidad del agente por especialidades.

---

# Arquitectura futura de IA

```text
┌─────────────────────────────┐
│            PYL              │
│                             │
│  Projects                   │
│  Calculations               │
│  Budgets                    │
│  Clients                    │
│  Materials                  │
│                             │
│        PYL Copilot          │
│             │               │
│             ▼               │
│          Agent              │
│             │               │
│       ┌─────┴─────┐         │
│       │           │         │
│     Skills       Tools      │
│                     │       │
│                     ▼       │
│                PYL Domain   │
│                     │       │
│                     ▼       │
│                 IndexedDB   │
│                             │
└─────────────────────────────┘
```

---

# Instalación

Clona el repositorio:

```bash
git clone https://github.com/AndrewUru/pyl.git
```

Accede al proyecto:

```bash
cd pyl
```

Instala las dependencias:

```bash
npm install
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

Abre:

```text
http://localhost:3000
```

---

# Scripts

Desarrollo:

```bash
npm run dev
```

Build de producción:

```bash
npm run build
```

Ejecutar producción:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

---

# Desarrollo

Para trabajar en nuevas funcionalidades se recomienda crear ramas específicas.

Ejemplo:

```bash
git checkout -b feat/pyl-v2
```

Otros ejemplos:

```text
feat/projects
feat/calculator
feat/budgets
feat/local-storage
feat/pyl-copilot

fix/calculation-engine
fix/mobile-navigation

refactor/domain
refactor/storage
```

---

# Principios técnicos

El desarrollo de PYL sigue varios principios fundamentales.

### 1. Domain first

La lógica técnica pertenece al dominio, no a los componentes React.

### 2. Deterministic calculations

La IA nunca debe inventar cantidades que puedan calcularse mediante código.

### 3. Local first

Los datos pertenecen al usuario y se almacenan localmente por defecto.

### 4. AI as interface

La IA es una forma adicional de operar el sistema, no el sistema en sí mismo.

### 5. Modular architecture

Cada módulo debe poder evolucionar de forma independiente.

### 6. Type safety

Evitar `any` y mantener contratos TypeScript claros entre módulos.

### 7. Progressive enhancement

PYL debe seguir siendo útil aunque la IA no esté disponible.

---

# Roadmap

## Fase 1 — Core

* [ ] Nueva arquitectura
* [ ] Design system
* [ ] Dashboard
* [ ] IndexedDB
* [ ] Configuración local
* [ ] Backup e importación

## Fase 2 — Gestión

* [ ] Proyectos
* [ ] Clientes
* [ ] Mediciones
* [ ] Presupuestos
* [ ] Materiales

## Fase 3 — Motor técnico

* [ ] Tabiques
* [ ] Huecos
* [ ] Montantes
* [ ] Canales
* [ ] Placas
* [ ] Aislamiento
* [ ] Merma
* [ ] Tests del motor

## Fase 4 — Nuevos sistemas

* [ ] Trasdosados
* [ ] Techos continuos
* [ ] Techos registrables
* [ ] Sistemas multicapa
* [ ] Sistemas acústicos
* [ ] Sistemas resistentes al fuego

## Fase 5 — PYL Copilot

* [ ] Chat
* [ ] Contexto de proyecto
* [ ] Tools
* [ ] Skills
* [ ] Streaming
* [ ] Historial local

## Fase 6 — Documentos e IA multimodal

* [ ] Subida de documentos
* [ ] Lectura de fichas técnicas
* [ ] Análisis de planos
* [ ] Reconocimiento de croquis
* [ ] Extracción asistida de mediciones
* [ ] Generación de documentación

## Fase 7 — Sincronización opcional

* [ ] Cuentas
* [ ] Sincronización entre dispositivos
* [ ] Backup cloud
* [ ] Equipos
* [ ] Compartir proyectos

El almacenamiento local seguirá siendo parte de la arquitectura aunque se añada sincronización remota.

---

# Visión

PYL pretende evolucionar desde una calculadora de materiales hacia un **workspace técnico especializado en sistemas de Placa de Yeso Laminado**.

La aplicación combinará:

```text
conocimiento técnico
+
cálculo determinista
+
gestión de proyectos
+
automatización
+
inteligencia artificial
```

con una arquitectura donde la IA pueda ayudar a trabajar más rápido sin sustituir las reglas técnicas que deben permanecer verificables.

---

## Repository

```text
AndrewUru/pyl
```

## Status

```text
Active development
```

## Current stage

```text
PYL v2 architecture & local-first migration
```
