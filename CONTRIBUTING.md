# Guía de Contribución - Baleva Search

¡Gracias por tu interés en contribuir a Baleva Search! Este documento te guiará a través del proceso.

## 🚀 Cómo Contribuir

### 1. Fork el Repositorio

```bash
# Haz un fork en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/baleva-search.git
cd baleva-search
```

### 2. Crear una Rama

```bash
git checkout -b feature/nombre-de-tu-feature
```

### 3. Hacer Cambios

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Verificar que compila sin errores
pnpm check

# Formatear código
pnpm format
```

### 4. Commit y Push

```bash
git add .
git commit -m "Descripción clara de los cambios"
git push origin feature/nombre-de-tu-feature
```

### 5. Abrir un Pull Request

- Ve a GitHub y abre un PR desde tu rama
- Describe los cambios que hiciste
- Espera feedback

## 📝 Guías de Estilo

### Commits

Usa mensajes claros y descriptivos:

```
✨ feat: Agregar búsqueda en nuevas tiendas
🐛 fix: Corregir cálculo de similitud
📚 docs: Actualizar README
🎨 style: Mejorar UI de resultados
♻️ refactor: Simplificar código de análisis
```

### Código

- Usa TypeScript
- Sigue el estilo existente
- Agrega comentarios en código complejo
- Mantén funciones pequeñas y enfocadas

### Componentes React

```tsx
// ✅ Bien
export default function ProductCard({ name, price }: ProductCardProps) {
  return (
    <div className="bg-card rounded-lg p-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-lg">${price}</p>
    </div>
  );
}

// ❌ Evitar
const ProductCard = (props) => {
  return <div>{props.name}</div>;
};
```

## 🔍 Tipos de Contribuciones

### 🐛 Reportar Bugs

1. Verifica que el bug no esté ya reportado
2. Abre un issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es relevante

### ✨ Sugerir Mejoras

1. Abre un issue con la etiqueta `enhancement`
2. Describe la mejora y por qué sería útil
3. Proporciona ejemplos si es posible

### 📚 Mejorar Documentación

1. Haz cambios en archivos `.md`
2. Verifica que la información sea clara y correcta
3. Abre un PR

### 🔧 Agregar Funcionalidades

1. Abre un issue primero para discutir
2. Espera feedback
3. Implementa la funcionalidad
4. Abre un PR

## 🧪 Testing

Antes de hacer un PR, verifica:

```bash
# Compilar sin errores
pnpm check

# Formatear código
pnpm format

# Build para producción
pnpm build
```

## 📋 Checklist para PRs

- [ ] Mi código sigue el estilo del proyecto
- [ ] He actualizado la documentación si es necesario
- [ ] He probado los cambios localmente
- [ ] No hay errores de TypeScript
- [ ] Mi PR soluciona un issue o agrega una funcionalidad clara

## 🎯 Áreas de Contribución Prioritarias

1. **Integración de nuevas tiendas**: Agregar más tiendas a la búsqueda
2. **Mejora de IA**: Optimizar análisis de productos
3. **UI/UX**: Mejorar interfaz y experiencia
4. **Documentación**: Guías y tutoriales
5. **Testing**: Pruebas automatizadas

## 💬 Preguntas?

- Abre un issue con la etiqueta `question`
- Participa en discusiones
- Contacta a los mantenedores

## 📜 Licencia

Al contribuir, aceptas que tus cambios se publiquen bajo la licencia MIT.

---

**¡Gracias por contribuir a Baleva Search! 🙌**
