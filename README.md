# 🏠 InmoGestion AI - SaaS de Gestión de Rentas

**InmoGestion AI** es una plataforma integral diseñada para arrendadores y administradores de inmuebles. Utiliza Inteligencia Artificial para simplificar el control de pagos, la gestión de inquilinos y la comunicación automatizada.

## 🚀 Características Principales
- **Dashboard Inteligente:** Visualización de ingresos totales, ocupación y métricas en tiempo real.
- **CRM de Inquilinos:** Registro detallado con vinculación a contratos y propiedades.
- **Asistente IA (Chatbot):** Integración con Google Gemini para consultas de datos mediante lenguaje natural.
- **Cobranza Automatizada:** Recordatorios de pago generados dinámicamente para WhatsApp.
- **Panel de Administración:** Control global de usuarios y gestión de planes (Básico/Oro).

## 🛠️ Stack Tecnológico
- **Frontend:** React.js + Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + Lucide React
- **Base de Datos:** PostgreSQL (Alojado en Supabase)
- **ORM:** Prisma
- **IA:** Google Generative AI (Gemini 1.5 Flash)

## 🏗️ Infraestructura y Arquitectura (IaC)
El proyecto utiliza un enfoque de **Infraestructura como Código (IaC)** mediante Prisma ORM, permitiendo que el esquema de la base de datos sea versionable y replicable.
- **Persistencia:** Supabase Cloud.
- **Hosting:** Vercel (CI/CD vinculado a GitHub).
- **Manejo de Conexiones:** Transaction Pooler para optimización de recursos.

## ⚙️ Configuración e Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/Saas-Rentas.git