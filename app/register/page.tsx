"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Modal para ver documentos ────────────────────────────────────────────────
function ModalDocumento({
  titulo,
  contenido,
  onClose,
}: {
  titulo: string;
  contenido: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto p-6 text-sm text-gray-700 space-y-4 leading-relaxed">
          {contenido}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Contenido: Política de Privacidad ───────────────────────────────────────
const ContenidoPoliticaPrivacidad = (
  <div className="space-y-4">
    <p className="font-semibold text-gray-900">
      Última actualización: Julio 2025
    </p>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">1. Responsable del Tratamiento</h3>
      <p>
        <strong>SaaS Rentas</strong> (en adelante "la Plataforma"), con domicilio en México, es
        responsable del tratamiento de sus datos personales conforme a la{" "}
        <strong>
          Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP)
        </strong>
        .
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">2. Datos Personales que Recopilamos</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Nombre completo</li>
        <li>Correo electrónico</li>
        <li>Contraseña (almacenada de forma cifrada con bcrypt)</li>
        <li>Información de propiedades en renta (si aplica)</li>
        <li>Documentos de identidad cargados voluntariamente</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">3. Finalidad del Tratamiento</h3>
      <p>Sus datos son recopilados <strong>exclusivamente</strong> para:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Crear y gestionar su cuenta en la plataforma</li>
        <li>Administrar contratos, pagos y propiedades</li>
        <li>Enviar notificaciones relacionadas con su cuenta</li>
        <li>Cumplir con obligaciones legales aplicables</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">4. Derechos ARCO</h3>
      <p>
        Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> al
        tratamiento de sus datos personales (Derechos ARCO), enviando una solicitud a:{" "}
        <strong>privacidad@saasrentas.mx</strong>
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">5. Seguridad</h3>
      <p>
        Implementamos medidas técnicas y organizativas para proteger sus datos: cifrado en
        tránsito (HTTPS/TLS), contraseñas hasheadas con bcrypt, tokens JWT con expiración
        corta y cookies HttpOnly.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">6. Retención de Datos</h3>
      <p>
        Sus datos se conservarán mientras su cuenta esté activa. Al solicitar la cancelación
        de su cuenta, sus datos serán eliminados en un plazo máximo de <strong>30 días</strong>,
        salvo obligación legal en contrario.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">7. Transferencia a Terceros</h3>
      <p>
        Sus datos <strong>no serán vendidos</strong> a terceros. Únicamente se comparten con
        proveedores de infraestructura (Supabase/PostgreSQL) bajo contratos de
        confidencialidad. Se le notificará previamente si esto cambia.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">8. Cambios a esta Política</h3>
      <p>
        Cualquier modificación será notificada por correo electrónico con al menos{" "}
        <strong>15 días de anticipación</strong>.
      </p>
    </section>
  </div>
);

// ─── Contenido: Aviso de Protección de Datos ─────────────────────────────────
const ContenidoProteccionDatos = (
  <div className="space-y-4">
    <p className="font-semibold text-gray-900">
      Aviso de Privacidad Simplificado — conforme a la LFPDPPP
    </p>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">Responsable</h3>
      <p>
        <strong>SaaS Rentas</strong> es responsable del uso y protección de sus datos
        personales.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">¿Para qué usamos sus datos?</h3>
      <p><strong>Finalidades primarias (necesarias):</strong></p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Crear y administrar su cuenta de usuario</li>
        <li>Gestionar contratos de arrendamiento</li>
        <li>Registrar pagos de renta</li>
        <li>Enviar recordatorios y notificaciones del sistema</li>
      </ul>
      <p className="mt-2"><strong>Finalidades secundarias (opcionales):</strong></p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Mejorar la experiencia del usuario mediante análisis de uso</li>
        <li>Enviar comunicaciones informativas sobre la plataforma</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">Consentimiento</h3>
      <p>
        Al crear su cuenta y marcar la casilla de aceptación, usted otorga su consentimiento
        <strong> libre, específico, informado e inequívoco</strong> para el tratamiento de
        sus datos personales conforme a este aviso.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">Sus Derechos ARCO</h3>
      <div className="grid grid-cols-2 gap-2">
        {[
          { letra: "A", nombre: "Acceso", desc: "Conocer qué datos tenemos de usted" },
          { letra: "R", nombre: "Rectificación", desc: "Corregir datos inexactos" },
          { letra: "C", nombre: "Cancelación", desc: "Solicitar eliminación de sus datos" },
          { letra: "O", nombre: "Oposición", desc: "Oponerse al tratamiento de sus datos" },
        ].map((d) => (
          <div key={d.letra} className="bg-indigo-50 rounded-lg p-3">
            <span className="font-bold text-indigo-700 text-lg">{d.letra}</span>
            <p className="font-semibold text-gray-800 text-xs">{d.nombre}</p>
            <p className="text-gray-600 text-xs">{d.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs">
        Solicitudes a: <strong>privacidad@saasrentas.mx</strong> — Respuesta en máximo{" "}
        <strong>20 días hábiles</strong>.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">Notificación de Brechas</h3>
      <p>
        En caso de una brecha de seguridad que afecte sus datos, será notificado en un plazo
        máximo de <strong>72 horas</strong> conforme a lo establecido por la LFPDPPP y el INAI.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-gray-800 mb-1">Contacto y Autoridad</h3>
      <p>
        Puede presentar quejas ante el{" "}
        <strong>
          Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos
          Personales (INAI)
        </strong>{" "}
        en <strong>www.inai.org.mx</strong>
      </p>
    </section>
  </div>
);

// ─── Página Principal de Registro ────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmar: "",
    rol: "PROPIETARIO",
  });

  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaDatos, setAceptaDatos] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<"privacidad" | "datos" | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas del frontend
    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!aceptaPrivacidad || !aceptaDatos) {
      setError("Debes aceptar la Política de Privacidad y el Aviso de Protección de Datos para continuar.");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
          // Se registra el consentimiento con timestamp
          consentimientoPrivacidad: true,
          fechaConsentimiento: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrarse.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* Modales */}
      {modalAbierto === "privacidad" && (
        <ModalDocumento
          titulo="📄 Política de Privacidad"
          contenido={ContenidoPoliticaPrivacidad}
          onClose={() => setModalAbierto(null)}
        />
      )}
      {modalAbierto === "datos" && (
        <ModalDocumento
          titulo="🔒 Aviso de Protección de Datos Personales"
          contenido={ContenidoProteccionDatos}
          onClose={() => setModalAbierto(null)}
        />
      )}

      {/* Página */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          {/* Logo / título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">SR</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">SaaS Rentas — Gestión inteligente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Confirmar password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmar"
                value={form.confirmar}
                onChange={handleChange}
                required
                placeholder="Repite tu contraseña"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo de cuenta
              </label>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PROPIETARIO">🏠 Propietario</option>
                <option value="INQUILINO">🔑 Inquilino</option>
              </select>
            </div>

            {/* ─── SECCIÓN DE CONSENTIMIENTO (LFPDPPP) ─── */}
            <div className="border-2 border-indigo-100 rounded-2xl p-4 bg-indigo-50 space-y-3">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                🔒 Protección de Datos Personales
              </p>

              {/* Checkbox 1: Aviso de Protección de Datos */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aceptaDatos}
                  onChange={(e) => setAceptaDatos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  He leído y acepto el{" "}
                  <button
                    type="button"
                    onClick={() => setModalAbierto("datos")}
                    className="text-indigo-600 font-semibold underline hover:text-indigo-800 transition"
                  >
                    Aviso de Protección de Datos Personales
                  </button>{" "}
                  conforme a la LFPDPPP, incluyendo la finalidad del tratamiento de mis datos y
                  mis Derechos ARCO.
                </span>
              </label>

              {/* Checkbox 2: Política de Privacidad */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aceptaPrivacidad}
                  onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  He leído y acepto la{" "}
                  <button
                    type="button"
                    onClick={() => setModalAbierto("privacidad")}
                    className="text-indigo-600 font-semibold underline hover:text-indigo-800 transition"
                  >
                    Política de Privacidad
                  </button>
                  , incluyendo cómo se recopilan, usan y protegen mis datos personales.
                </span>
              </label>

              {/* Indicadores visuales */}
              <div className="flex gap-3 pt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aceptaDatos ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  {aceptaDatos ? "✓" : "○"} Aviso de datos
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aceptaPrivacidad ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  {aceptaPrivacidad ? "✓" : "○"} Privacidad
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={cargando || !aceptaPrivacidad || !aceptaDatos}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}