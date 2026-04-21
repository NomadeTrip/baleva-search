# Baleva Search

Baleva Search es una aplicación web que permite encontrar alternativas más económicas de cualquier producto. Sube una foto o pega un link, y la IA analizará el producto para encontrar opciones similares pero más baratas en tiendas nacionales e internacionales.

## 🚀 Características

- **Análisis con IA**: Utiliza Google Gemini 2.5 Flash para analizar productos desde fotos o links
- **Búsqueda Inteligente**: Busca alternativas similares en múltiples tiendas
- **Comparación de Precios**: Muestra el ahorro potencial y similitud de productos
- **Responsive**: Funciona perfectamente en web y móvil
- **Gratis**: Sin costos de mantenimiento, usa APIs gratuitas

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + TailwindCSS 4
- **IA**: Google Gemini 2.5 Flash API (gratis)
- **Hosting**: Vercel (gratis)
- **Herramientas**: Vite, Wouter, shadcn/ui

## 📋 Requisitos Previos

- Node.js 18+ y pnpm
- Cuenta de Google Cloud con Gemini API habilitada
- Cuenta de GitHub
- Cuenta de Vercel

## 🔧 Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/baleva-search.git
cd baleva-search
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_FRONTEND_FORGE_API_KEY=tu_gemini_api_key
VITE_FRONTEND_FORGE_API_URL=https://generativelanguage.googleapis.com
```

4. **Ejecutar en desarrollo**
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🚀 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Pushear a GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configurar variables de entorno**
   - En Vercel, ve a Settings > Environment Variables
   - Agrega:
     - `VITE_FRONTEND_FORGE_API_KEY`: Tu API key de Gemini
     - `VITE_FRONTEND_FORGE_API_URL`: `https://generativelanguage.googleapis.com`

4. **Desplegar**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente

### Opción 2: Desde CLI de Vercel

```bash
npm install -g vercel
vercel
```

## 📚 Estructura del Proyecto

```
baleva-search/
├── client/
│   ├── public/           # Archivos estáticos
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── lib/          # Servicios y utilidades
│   │   ├── pages/        # Páginas principales
│   │   ├── contexts/     # React Contexts
│   │   ├── App.tsx       # Componente principal
│   │   ├── main.tsx      # Punto de entrada
│   │   └── index.css     # Estilos globales
│   └── index.html        # HTML principal
├── server/               # Servidor Express (para producción)
├── package.json          # Dependencias
└── README.md             # Este archivo
```

## 🔑 Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com)
2. Haz clic en "Get API Key"
3. Crea una nueva API key
4. Copia la clave y úsala en tu `.env.local`

## 🎨 Personalización

### Cambiar Colores

Edita `client/src/index.css` en la sección `:root`:

```css
:root {
  --primary: #2563EB;        /* Azul principal */
  --accent: #10B981;         /* Verde de éxito */
  --destructive: #EF4444;    /* Rojo de error */
  /* ... más colores */
}
```

### Cambiar Tipografía

Las fuentes están importadas en `client/index.html`. Puedes cambiarlas en Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=TuFuente:wght@400;600;700&display=swap" rel="stylesheet" />
```

## 🔍 Cómo Funciona

1. **Usuario sube foto o pega link**
2. **Gemini analiza el producto** y extrae:
   - Nombre y descripción
   - Categoría y material
   - Color y estilo
   - Precio estimado
3. **Genera términos de búsqueda** para encontrar alternativas
4. **Busca en tiendas** (Amphora, Paris.cl, AliExpress, etc.)
5. **Calcula similitud** y ahorro potencial
6. **Muestra resultados** ordenados por similitud y precio

## 🐛 Solución de Problemas

### Error: "API key no válida"
- Verifica que tu API key de Gemini sea correcta
- Asegúrate de que Gemini API esté habilitada en Google Cloud

### Error: "No se encontraron alternativas"
- Intenta con un producto más común
- Verifica que los términos de búsqueda sean claros

### Aplicación lenta
- Vercel puede tardar en procesar la primera solicitud
- Intenta de nuevo en unos segundos

## 📝 Licencia

MIT

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Hecho con ❤️ para ayudarte a ahorrar dinero**
