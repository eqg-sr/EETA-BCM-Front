# QA Verification Report — EETA-BCM Frontend

Verificación realizada leyendo el código fuente actual (rama actual, tras los últimos commits "hotfix").
Repos consultados:
- Frontend: `EETA-BCM-Front` (este repo)
- Backend: `EETA-BACK-BCM`

## Resumen

| Bug | Estado | Archivo(s) | Causa raíz |
|-----|--------|------------|------------|
| #1  | FALSO POSITIVO / YA CORREGIDO | `src/pages/Login.tsx` | El handler ya captura el error y renderiza un mensaje (`error` state + bloque condicional). No hay limpieza silenciosa. |
| #2  | CONFIRMADO (feature no implementada) | `src/pages/Login.tsx` | El link es un `<a href="#">` sin handler ni ruta `/forgot-password`. Es una feature faltante, no una regresión. |
| #3  | CONFIRMADO | `src/pages/Register.tsx`, backend `authController.ts` | El backend responde `400 { errors: ZodFlattenedError }` (sin campo `message`). El frontend solo lee `err.response?.data?.message`, que es `undefined`, y cae siempre al mensaje genérico. Tampoco hay validación client-side de longitud de contraseña. |
| #4  | FALSO POSITIVO / YA CORREGIDO | `src/pages/Causas.tsx`, `src/context/CausasContext.tsx` | El `useEffect` con dependencias `[query, statusFilter]` ya dispara `fetchCausas({ search: query \|\| undefined, ... })` con debounce de 350ms, y `fetchCausas` actualiza `causas.data` con la respuesta. El filtrado funciona en el código actual. |
| #5  | FALSO POSITIVO / YA CORREGIDO | `src/pages/Causas.tsx` | El `<select>` de estado es controlado (`value={statusFilter}`, `onChange` hace `setStatusFilter`), y `statusFilter` se incluye en el mismo `useEffect` que dispara `fetchCausas({ status: statusFilter \|\| undefined })`. No hay reset accidental. |
| #6  | FALSO POSITIVO / YA CORREGIDO | `src/pages/CausaDetalle.tsx`, `src/context/CausasContext.tsx` | `handleStatusChange` llama a `cambiarStatus(id, newStatus)`, que hace `PUT /causas/:id/status` y luego `fetchCausa(id)` para refrescar. Si falla, se muestra `statusError`. La llamada a la API existe y está correctamente conectada. |
| #7  | FALSO POSITIVO / YA CORREGIDO | `src/pages/CausaDetalle.tsx` (`SujetosBlock`) | El botón "Agregar sujeto" tiene `disabled={!nombre.trim() \|\| isSending}`, por lo que físicamente no se puede hacer click sin nombre. Adicionalmente `handleAgregar` tiene un guard `if (!nombre.trim()) return;`. No hay forma de reproducir "click sin error". |
| #8  | FALSO POSITIVO / YA CORREGIDO | `src/pages/CausaDetalle.tsx` (`MovimientosBlock`) | El botón "Registrar movimiento" tiene `disabled={!movTitulo.trim() \|\| (!movDescripcion.trim() && !movArchivo) \|\| isSending}`. Sin título (y sin descripción/archivo) el botón está deshabilitado, por lo que no se puede disparar un submit vacío. |
| #9  | FALSO POSITIVO / YA CORREGIDO | `src/pages/Admin.tsx` (`UsuariosTab`), backend `adminController.ts` | El `onChange` del `<select>` de rol llama a `cambiarRol(u._id, e.target.value)`, que hace `PUT /admin/usuarios/:id/rol` con `{ rol: role }`. El backend tiene `rolSchema = z.object({ rol: z.enum([...]) })` — los nombres coinciden. Tras éxito se hace `fetchUsers()` que refresca el `value` del select. La llamada existe y está bien conectada. |
| #10 | CONFIRMADO | `src/pages/Admin.tsx` (`AsignacionesTab`) | `handleCausaInput` filtra `allCausas` solo por `c.nroExpedienteElectronico`, ignorando `caratula` e `identificador` — pese a que el placeholder dice "Escribí carátula o nro. de expediente electrónico...". Como `nroExpedienteElectronico` es un campo opcional (puede no existir para muchas causas), buscar por carátula (el caso más común) no devuelve resultados. |

---

## Detalle por bug + plan de corrección

### BUG #1 — Login con credenciales incorrectas no muestra error
**Estado:** FALSO POSITIVO / YA CORREGIDO
**Archivo:** `src/pages/Login.tsx` (líneas 18-34, 90-95)

```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      nav('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError(err.response.data?.message ?? 'Acceso denegado.');
      } else {
        setError('Credenciales inválidas. Verificá el email y la contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
};
...
{error && (
  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
    <span>{error}</span>
  </div>
)}
```

El error se captura, se setea en estado y se renderiza. No requiere acción. Si el QA observó este comportamiento, probablemente fue contra un build desplegado anterior a los últimos hotfixes.

**Corrección:** Ninguna. No aplica cambio.

---

### BUG #2 — "¿Olvidaste tu contraseña?" no hace nada
**Estado:** CONFIRMADO (feature no implementada, no es regresión)
**Archivo:** `src/pages/Login.tsx` (líneas 64-69)

```tsx
<div className="flex justify-between items-center mb-1.5 ml-1">
  <label className="text-sm font-semibold text-slate-700">Contraseña</label>
  <a href="#" className="text-xs font-medium text-blue-700 hover:underline">
    ¿Olvidaste tu contraseña?
  </a>
</div>
```

No existe ruta `/forgot-password`, ni handler de `onClick`. Confirmado: es una funcionalidad faltante, no una regresión sobre algo que existía.

**Recomendación (P2 — no aplicada):**
Mientras no exista el flujo de recuperación de contraseña en el backend, reemplazar el `<a href="#">` por un botón que abra un modal informativo "Próximamente" o, más simple, quitar el link. No requiere lógica de backend nueva si se opta por el modal:

```tsx
const [showSoonModal, setShowSoonModal] = useState(false);
...
<button
  type="button"
  onClick={() => setShowSoonModal(true)}
  className="text-xs font-medium text-blue-700 hover:underline"
>
  ¿Olvidaste tu contraseña?
</button>
{showSoonModal && (
  <Modal onClose={() => setShowSoonModal(false)}>
    La recuperación de contraseña estará disponible próximamente. Contactá a un administrador.
  </Modal>
)}
```

No se aplica en esta vuelta (P2, solo recomendación).

---

### BUG #3 — Contraseña corta da error genérico en registro
**Estado:** CONFIRMADO
**Archivo:** `src/pages/Register.tsx` (líneas 28-51), `EETA-BACK-BCM/src/controllers/authController.ts` (líneas 7-12, 24-29)

Backend:
```ts
const registerSchema = z.object({
  email:    z.string().email(),
  name:     z.string().min(2),
  password: z.string().min(8),
  role:     z.enum([...]),
});
...
const parsed = registerSchema.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ errors: parsed.error.flatten() });  // <- NO "message"
  return;
}
```

Frontend:
```tsx
} catch (err) {
  if (axios.isAxiosError(err)) {
    setError(err.response?.data?.message ?? 'Error al registrar. Intentá de nuevo.');
    // err.response.data.message es undefined -> siempre cae al genérico
  } else {
    setError('Error al registrar. Intentá de nuevo.');
  }
}
```

Tampoco hay validación client-side de longitud de contraseña antes de llamar a la API.

**Corrección aplicada:** validación client-side de longitud mínima (evita el round-trip y muestra el mensaje correcto de inmediato), y mejora del manejo de error para extraer mensajes de `errors.fieldErrors` cuando el backend responda en ese formato.

```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', { name: nombre.trim(), email: email.trim(), password, role: rol });
      setSuccess(true);
      setTimeout(() => nav('/login'), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const fieldError = data?.errors?.fieldErrors
          ? Object.values(data.errors.fieldErrors).flat()[0] as string | undefined
          : undefined;
        setError(data?.message ?? fieldError ?? 'Error al registrar. Intentá de nuevo.');
      } else {
        setError('Error al registrar. Intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
};
```

---

### BUG #4 — Buscador de expedientes no filtra
**Estado:** FALSO POSITIVO / YA CORREGIDO
**Archivo:** `src/pages/Causas.tsx` (líneas 25-41), `src/context/CausasContext.tsx` (líneas 219-233)

```tsx
useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCausas({
        page: 1,
        limit: 20,
        search: query || undefined,
        status: statusFilter || undefined,
      });
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
}, [query, statusFilter]);
```

`fetchCausas` hace `api.get('/causas', { params })` y actualiza `causas.data` con `mapCausa`. El flujo completo (input → debounce → fetch → setState → render) está implementado correctamente.

**Corrección:** Ninguna. No aplica cambio.

---

### BUG #5 — Filtro por estado no aplica
**Estado:** FALSO POSITIVO / YA CORREGIDO
**Archivo:** `src/pages/Causas.tsx` (líneas 102-111)

```tsx
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value as CausaStatus | '')}
  ...
>
  <option value="">Todos los estados</option>
  {STATUS_OPTIONS.map((o) => (
    <option key={o.value} value={o.value}>{o.label}</option>
  ))}
</select>
```

Es un select controlado por `statusFilter`, sin reset accidental, y `statusFilter` está incluido en el mismo `useEffect` de búsqueda (ver BUG #4) que dispara el fetch con `status: statusFilter || undefined`.

**Corrección:** Ninguna. No aplica cambio.

---

### BUG #6 — Cambio de estado del expediente no se guarda
**Estado:** FALSO POSITIVO / YA CORREGIDO
**Archivo:** `src/pages/CausaDetalle.tsx` (líneas 69-80, 115-124), `src/context/CausasContext.tsx` (líneas 274-277)

```tsx
const handleStatusChange = async (newStatus: CausaStatus) => {
    if (!id) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      await cambiarStatus(id, newStatus);
    } catch (e: any) {
      setStatusError(e.response?.data?.message ?? 'Error al cambiar el estado');
    } finally {
      setStatusLoading(false);
    }
};
...
const cambiarStatus = async (causaId: string, status: CausaStatus) => {
    await api.put(`/causas/${causaId}/status`, { status });
    await fetchCausa(causaId);
};
```

El `<select>` (línea 116) llama `onChange={(e) => handleStatusChange(e.target.value as CausaStatus)}`, que hace `PUT /causas/:id/status` y refresca `currentCausa` vía `fetchCausa`. Si la API rechaza el cambio (por ejemplo, transición inválida a "iniciado" según las reglas del backend), se muestra `statusError` y el badge correctamente vuelve al valor real porque `currentCausa.status` no cambió.

**Corrección:** Ninguna. No aplica cambio.

---

### BUG #7 — "Agregar sujeto" sin nombre no valida
**Estado:** FALSO POSITIVO / YA CORREGIDO
**Archivo:** `src/pages/CausaDetalle.tsx` (líneas 295-320, 381-387)

```tsx
const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    ...
};
...
<button
  type="submit"
  disabled={!nombre.trim() || isSending}
  ...
>
  <Send size={14} /> {isSending ? 'Agregando...' : 'Agregar sujeto'}
</button>
```

El botón está deshabilitado mientras `nombre` esté vacío, por lo que no se puede ejecutar un submit sin nombre.

**Corrección:** Ninguna. No aplica cambio.

> Nota de UX (opcional, no bloqueante): podría agregarse un mensaje visible tipo "El nombre es obligatorio" cerca del input cuando esté vacío, en vez de depender únicamente del estado `disabled`, para usuarios que esperan feedback explícito. No se considera un bug.

---

### BUG #8 — "Registrar movimiento" sin datos no valida
**Estado:** FALSO POSITIVO / YA CORREGIDO
**Archivo:** `src/pages/CausaDetalle.tsx` (líneas 625-627, 775-781)

```tsx
const handleCargarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movTitulo.trim() || (!movDescripcion.trim() && !movArchivo) || !user || !currentCausa) return;
    ...
};
...
<button
  type="submit"
  disabled={!movTitulo.trim() || (!movDescripcion.trim() && !movArchivo) || isSending}
  ...
>
  <Send size={14} /> {isSending ? 'Registrando...' : 'Registrar movimiento'}
</button>
```

Mismo patrón que BUG #7: el botón queda deshabilitado hasta que haya título y (descripción o archivo).

**Corrección:** Ninguna. No aplica cambio.

---

### BUG #9 — Cambio de rol de usuario no se guarda en Admin
**Estado:** FALSO POSITIVO / YA CORREGIDO
**Archivo:** `src/pages/Admin.tsx` (líneas 72, 132-146), `EETA-BACK-BCM/src/controllers/adminController.ts` (líneas 52-69)

```tsx
const cambiarRol = (id: string, role: Role) => withLoading(id, () => api.put(`/admin/usuarios/${id}/rol`, { rol: role }));
...
<select
  value={u.role}
  disabled={actionLoading[u._id]}
  onChange={(e) => cambiarRol(u._id, e.target.value as Role)}
  ...
>
```

Backend:
```ts
const rolSchema = z.object({
  rol: z.enum(['arbitro', 'demandado', 'actor', 'secretario', 'perito']),
});
export async function cambiarRolUsuario(req: AuthRequest, res: Response): Promise<void> {
  const parsed = rolSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ errors: parsed.error.flatten() }); return; }
  const user = await User.findByIdAndUpdate(req.params.id, { role: parsed.data.rol }, { new: true }).select('-password');
  ...
}
```

El `onChange` llama a `cambiarRol`, que hace `PUT /admin/usuarios/:id/rol` con `{ rol: ... }`, coincidiendo exactamente con el schema del backend (`rol`, no `role`). Tras la respuesta, `withLoading` ejecuta `fetchUsers()` que refresca la lista y por ende el `value` del select. La llamada existe y está bien conectada.

**Corrección:** Ninguna. No aplica cambio.

---

### BUG #10 — Buscador de Asignaciones no funciona
**Estado:** CONFIRMADO
**Archivo:** `src/pages/Admin.tsx` (líneas 222-231)

```tsx
const handleCausaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setCausaSearch(q);
    setCausaListOpen(true);
    const term = q.trim().toLowerCase();
    if (!term) { setCausaResults([]); return; }
    setCausaResults(
      allCausas.filter((c) => (c.nroExpedienteElectronico ?? '').toLowerCase().includes(term))
    );
};
```

**Causa raíz:** el filtro solo compara contra `c.nroExpedienteElectronico`, que es un campo **opcional**. El placeholder del input dice "Escribí carátula o nro. de expediente electrónico...", pero `caratula` e `identificador` nunca se usan en el filtro. Para causas sin `nroExpedienteElectronico` cargado (probablemente la mayoría), o al buscar por carátula (el caso de uso más común), `causaResults` queda vacío y, como `causaSearch.trim()` es no-vacío, el dropdown muestra `causaResults` (vacío) en lugar de `allCausas`, resultando en "no aparecen sugerencias ni resultados".

**Corrección aplicada:**

```tsx
const handleCausaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setCausaSearch(q);
    setCausaListOpen(true);
    const term = q.trim().toLowerCase();
    if (!term) { setCausaResults([]); return; }
    setCausaResults(
      allCausas.filter((c) =>
        (c.nroExpedienteElectronico ?? '').toLowerCase().includes(term) ||
        (c.identificador ?? '').toLowerCase().includes(term) ||
        (c.caratula ?? '').toLowerCase().includes(term)
      )
    );
};
```

---

## Resumen de cambios aplicados

- **#10** (P0): corregido el filtro de búsqueda en `AsignacionesTab` para incluir `caratula` e `identificador`, no solo `nroExpedienteElectronico`.
- **#3** (P1): agregada validación client-side de longitud de contraseña (≥8) en `Register.tsx` con mensaje específico, y mejorado el parseo de errores del backend para extraer mensajes de `errors.fieldErrors` cuando estén disponibles.
- **#1, #4, #5, #6, #7, #8, #9**: verificados como ya correctos en el código actual — no requieren cambios.
- **#2** (P2): solo recomendación documentada arriba, sin aplicar.
