import { useSyncExternalStore } from "react";

import { guardarDatos, obtenerDatos } from "./datos.functions";

/** 0 = domingo … 6 = sábado */
export type Agenda = Record<number, string[]>;

export type CategoriaEspecialidad =
  | "Consulta General"
  | "Salud Infantil y Desarrollo"
  | "Especialidades Médicas"
  | "Especialidades Quirúrgicas"
  | "Apoyo y Bienestar"
  | "Odontología";

export type Especialidad = {
  id: string;
  nombre: string;
  descripcion: string;
  atiende: string;
  icono: string;
  precio: number;
  nota?: string;
  categoria: CategoriaEspecialidad;
};

export const ORDEN_CATEGORIAS: CategoriaEspecialidad[] = [
  "Consulta General",
  "Salud Infantil y Desarrollo",
  "Especialidades Médicas",
  "Especialidades Quirúrgicas",
  "Apoyo y Bienestar",
  "Odontología",
];

export type Medico = {
  id: string;
  nombre: string;
  especialidadId: string;
  cmp: string;
  agenda?: Agenda;
  nota?: string;
};

export type MetodoPago = "yape" | "tarjeta" | "efectivo";
export type EstadoCita = "pendiente_pago" | "pagada" | "atendida" | "cancelada" | "liberada";

export type Cita = {
  id: string;
  codigo: string;
  pacienteDni: string;
  pacienteNombre: string;
  medicoId: string;
  especialidadId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  metodoPago: MetodoPago;
  estado: EstadoCita;
  creadaEn: number;
  llegadaLimite: number | null; // timestamp de tolerancia (efectivo)
};

export type Paciente = {
  dni: string;
  nombre: string;
  email?: string;
  celular?: string;
};

export type Rol = "recepcion";

export type Sesion = { rol: "recepcion" } | null;

export type Estado = {
  especialidades: Especialidad[];
  medicos: Medico[];
  pacientes: Paciente[];
  citas: Cita[];
  sesion: Sesion;
};

export const TOLERANCIA_MIN = 15;
export const HORARIO = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

export const DIAS_NOMBRE = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
export const POLIFONO = ["351-6907", "351-6775"];
export const POLIFONO_ANEXO = "101 – 111";
export const NOTA_GENERAL = "Algún turno puede variar por alguna emergencia.";

/** Datos oficiales del policlínico */
export const FACEBOOK_URL =
  "https://www.facebook.com/people/Policl%C3%ADnico-Infantil-Nuestra-Se%C3%B1ora-del-Sagrado-Coraz%C3%B3n-Oficial/100063538544907/";
/** TODO: reemplazar por el número real (formato: código de país + número, sin +, espacios ni guiones. Ej: 51987654321) */
export const WHATSAPP_NUMERO = "51999999999";
export const WHATSAPP_MENSAJE = "Hola, quisiera más información sobre una cita.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`;
export const COORDS = { lat: -12.0283394, lng: -76.9048128 };
export const DIRECCION = "Av. Alfonso Ugarte con Av. Esperanza, San Gregorio, Ate — Lima";
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${COORDS.lat},${COORDS.lng}`;
export const MAPS_COMO_LLEGAR = `https://www.google.com/maps/dir/?api=1&destination=${COORDS.lat},${COORDS.lng}`;
export const STREET_VIEW_URL = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${COORDS.lat},${COORDS.lng}&heading=168.2&pitch=-2.7&fov=64`;
export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${COORDS.lat},${COORDS.lng}&z=17&hl=es&output=embed`;

const KEY = "ticketcita:v3";

/**
 * Agenda real del Policlínico Infantil
 * "Nuestra Señora del Sagrado Corazón" (afiches del 17 al 22 de agosto).
 */
const especialidadesBase: Especialidad[] = [
  {
    id: "e-mgen",
    nombre: "Medicina General",
    descripcion: "Consulta integral para niños y adultos.",
    atiende: "resfríos, fiebre, chequeos generales, certificados y derivaciones.",
    icono: "stethoscope",
    precio: 30,
    nota: "Cita adelantada",
    categoria: "Consulta General",
  },
  {
    id: "e-ped",
    nombre: "Pediatría",
    descripcion: "Control y atención del niño sano y enfermo.",
    atiende: "controles de rutina, vacunas, enfermedades comunes y desarrollo infantil.",
    icono: "baby",
    precio: 40,
    nota: "Cita diaria",
    categoria: "Salud Infantil y Desarrollo",
  },
  {
    id: "e-mint",
    nombre: "Medicina Interna",
    descripcion: "Diagnóstico y tratamiento del paciente adulto.",
    atiende: "hipertensión, diabetes, chequeos preventivos y enfermedades crónicas del adulto.",
    icono: "stethoscope",
    precio: 40,
    nota: "Cita adelantada",
    categoria: "Consulta General",
  },
  {
    id: "e-gin",
    nombre: "Ginecología",
    descripcion: "Salud femenina y controles preventivos.",
    atiende: "chequeos ginecológicos, planificación familiar y salud íntima femenina.",
    icono: "heart",
    precio: 45,
    nota: "Cita adelantada",
    categoria: "Consulta General",
  },
  {
    id: "e-obs",
    nombre: "Obstetricia",
    descripcion: "Control prenatal y planificación familiar.",
    atiende: "control prenatal, PAP y planificación familiar.",
    icono: "baby",
    precio: 40,
    nota: "Cita adelantada · Campaña de PAP jueves 27",
    categoria: "Consulta General",
  },
  {
    id: "e-cred",
    nombre: "CRED",
    descripcion: "Control de crecimiento y desarrollo del niño.",
    atiende: "peso, talla, desarrollo psicomotor y alimentación del niño.",
    icono: "baby",
    precio: 20,
    nota: "Cita adelantada",
    categoria: "Salud Infantil y Desarrollo",
  },
  {
    id: "e-estim",
    nombre: "Estimulación Temprana",
    descripcion: "Sesiones por grupos de edad, de 1 a 18 meses.",
    atiende: "estimulación sensorial, motora y del lenguaje en bebés.",
    icono: "baby",
    precio: 30,
    nota: "Cita adelantada",
    categoria: "Salud Infantil y Desarrollo",
  },
  {
    id: "e-psi",
    nombre: "Psicología",
    descripcion: "Evaluación y terapia individual o familiar.",
    atiende: "ansiedad, conducta, duelo y terapia familiar.",
    icono: "brain",
    precio: 50,
    nota: "Cita el mismo día",
    categoria: "Apoyo y Bienestar",
  },
  {
    id: "e-psiq",
    nombre: "Psiquiatría",
    descripcion: "Atención especializada en salud mental.",
    atiende: "depresión, ansiedad, trastornos del ánimo y del sueño.",
    icono: "brain",
    precio: 70,
    nota: "Con orden médica",
    categoria: "Apoyo y Bienestar",
  },
  {
    id: "e-nut",
    nombre: "Nutrición",
    descripcion: "Planes alimenticios y control de peso.",
    atiende: "control de peso, planes alimenticios y nutrición infantil.",
    icono: "apple",
    precio: 35,
    nota: "Cita adelantada",
    categoria: "Apoyo y Bienestar",
  },
  {
    id: "e-card",
    nombre: "Cardiología",
    descripcion: "Evaluación del corazón y presión arterial.",
    atiende: "soplos, arritmias, hipertensión, dolor torácico y prevención cardiovascular.",
    icono: "heart",
    precio: 60,
    nota: "Cita adelantada",
    categoria: "Especialidades Médicas",
  },
  {
    id: "e-cardv",
    nombre: "Cirugía Cardiovascular",
    descripcion: "Evaluación cardiovascular quirúrgica.",
    atiende: "evaluación prequirúrgica y seguimiento cardiovascular.",
    icono: "heart",
    precio: 60,
    nota: "Cita el mismo día",
    categoria: "Especialidades Quirúrgicas",
  },
  {
    id: "e-cir",
    nombre: "Cirugía",
    descripcion: "Evaluación y control quirúrgico general.",
    atiende: "hernias, apendicitis y evaluación quirúrgica general.",
    icono: "stethoscope",
    precio: 60,
    nota: "Cita el mismo día",
    categoria: "Especialidades Quirúrgicas",
  },
  {
    id: "e-trau",
    nombre: "Traumatología",
    descripcion: "Lesiones de huesos, músculos y articulaciones.",
    atiende: "fracturas, esguinces, dolor articular y lesiones deportivas.",
    icono: "stethoscope",
    precio: 55,
    nota: "Cita adelantada",
    categoria: "Especialidades Quirúrgicas",
  },
  {
    id: "e-neuro",
    nombre: "Neurología",
    descripcion: "Sistema nervioso, cefaleas y convulsiones.",
    atiende: "cefaleas, migrañas, convulsiones y mareos.",
    icono: "brain",
    precio: 60,
    nota: "Cita el mismo día",
    categoria: "Especialidades Médicas",
  },
  {
    id: "e-gastro",
    nombre: "Gastroenterología",
    descripcion: "Aparato digestivo e hígado.",
    atiende: "gastritis, reflujo, dolor abdominal y enfermedades del hígado.",
    icono: "stethoscope",
    precio: 60,
    nota: "Cita el mismo día",
    categoria: "Especialidades Médicas",
  },
  {
    id: "e-uro",
    nombre: "Urología",
    descripcion: "Vías urinarias y salud masculina.",
    atiende: "infecciones urinarias, próstata y salud renal.",
    icono: "stethoscope",
    precio: 55,
    nota: "Cita adelantada",
    categoria: "Especialidades Quirúrgicas",
  },
  {
    id: "e-neum",
    nombre: "Neumología",
    descripcion: "Asma, bronquios y aparato respiratorio.",
    atiende: "asma, bronquitis, neumonía, alergias y problemas respiratorios.",
    icono: "wind",
    precio: 60,
    nota: "Cita adelantada",
    categoria: "Especialidades Médicas",
  },
  {
    id: "e-reum",
    nombre: "Reumatología",
    descripcion: "Artritis, dolor articular y autoinmunes.",
    atiende: "artritis, dolor articular y enfermedades autoinmunes.",
    icono: "stethoscope",
    precio: 60,
    nota: "Cita adelantada",
    categoria: "Especialidades Médicas",
  },
  {
    id: "e-derm",
    nombre: "Dermatología",
    descripcion: "Piel, uñas y cabello.",
    atiende: "acné, manchas, alergias en la piel y cuidado capilar.",
    icono: "smile",
    precio: 55,
    nota: "Programa tu cita según fechas disponibles",
    categoria: "Especialidades Quirúrgicas",
  },
  {
    id: "e-oft",
    nombre: "Oftalmología",
    descripcion: "Salud visual y control de la vista.",
    atiende: "miopía, astigmatismo, conjuntivitis, desprendimiento de retina y más.",
    icono: "eye",
    precio: 55,
    nota: "Atención desde la próxima semana",
    categoria: "Especialidades Quirúrgicas",
  },
  {
    id: "e-otorr",
    nombre: "Otorrinolaringología",
    descripcion: "Oídos, nariz y garganta.",
    atiende: "otitis, sinusitis, amigdalitis, rinitis alérgica, pérdida auditiva y más.",
    icono: "ear",
    precio: 55,
    nota: "Programe su cita",
    categoria: "Especialidades Quirúrgicas",
  },
  {
    id: "e-mfis",
    nombre: "Medicina Física",
    descripcion: "Terapia física para niños y adultos.",
    atiende: "rehabilitación, dolor crónico y recuperación de lesiones.",
    icono: "stethoscope",
    precio: 40,
    nota: "Con orden médica · según fechas disponibles",
    categoria: "Apoyo y Bienestar",
  },
  {
    id: "e-dniños",
    nombre: "Dental Niños",
    descripcion: "Odontología pediátrica y prevención.",
    atiende: "caries, prevención, ortodoncia interceptiva y salud bucal infantil.",
    icono: "smile",
    precio: 35,
    nota: "Acercarse al Archivo Dental y programar con anticipación",
    categoria: "Odontología",
  },
  {
    id: "e-dadultos",
    nombre: "Dental Adultos",
    descripcion: "Curaciones, profilaxis y tratamientos.",
    atiende: "caries, limpiezas, extracciones y tratamientos dentales.",
    icono: "smile",
    precio: 35,
    nota: "Acercarse al Archivo Dental y programar con anticipación",
    categoria: "Odontología",
  },
  {
    id: "e-enf",
    nombre: "Enfermería y Vacunación",
    descripcion: "Vacunas, curaciones e inyectables.",
    atiende: "vacunas, curaciones, inyectables y control de signos vitales.",
    icono: "syringe",
    precio: 20,
    categoria: "Apoyo y Bienestar",
  },
];

const medicosBase: Medico[] = [
  // Medicina General
  {
    id: "m-bolanos",
    nombre: "Dra. G. Bolaños",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 1: ["10:00", "15:00"], 3: ["10:00", "15:00"], 5: ["10:00", "15:00"] },
  },
  {
    id: "m-gozar",
    nombre: "Dr. M. Gozar",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 2: ["16:00"], 3: ["16:00"] },
  },
  {
    id: "m-arodriguez",
    nombre: "Dra. Amada Rodríguez",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 1: ["10:00"], 3: ["10:00"], 5: ["10:00"], 6: ["10:00"] },
  },
  {
    id: "m-cabrera-mg",
    nombre: "Dr. Cabrera",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 1: ["08:30"], 2: ["08:30"], 3: ["08:30"], 4: ["08:30"], 5: ["08:30"], 6: ["08:30"] },
  },
  {
    id: "m-bendezu",
    nombre: "Dr. Bendezú",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 1: ["09:00", "15:00"], 4: ["16:00"], 5: ["15:00"] },
  },
  {
    id: "m-aguirre",
    nombre: "Dra. M. Aguirre",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 4: ["08:00", "14:00"], 6: ["08:00", "14:00"] },
  },
  {
    id: "m-huaman",
    nombre: "Dra. Huamán",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 2: ["08:30"], 3: ["08:30"], 4: ["08:30"] },
  },
  {
    id: "m-quiri",
    nombre: "Dra. Quiri",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 2: ["08:30", "14:00"], 4: ["08:30", "14:00"], 6: ["08:30", "14:00"] },
  },
  {
    id: "m-mgarcia",
    nombre: "Dr. Marlon García",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 1: ["08:30", "14:00"], 5: ["08:30"], 6: ["14:30"] },
  },
  {
    id: "m-jgarcia",
    nombre: "Dr. Jean Piere García",
    especialidadId: "e-mgen",
    cmp: "Medicina General",
    agenda: { 1: ["08:30"], 2: ["08:30"], 4: ["08:30"], 5: ["08:30"], 6: ["08:30"] },
  },

  // Pediatría
  {
    id: "m-ramirez",
    nombre: "Dr. Ramírez",
    especialidadId: "e-ped",
    cmp: "Pediatría",
    agenda: { 1: ["09:00", "15:00"], 3: ["09:00", "15:00"], 5: ["09:00", "15:00"] },
  },
  {
    id: "m-alvarado",
    nombre: "Dr. Alvarado",
    especialidadId: "e-ped",
    cmp: "Pediatría",
    agenda: {
      1: ["09:00", "14:30"],
      2: ["09:00", "14:30"],
      3: ["14:30"],
      4: ["09:00", "14:30"],
      5: ["14:30"],
      6: ["09:00", "14:30"],
    },
  },
  {
    id: "m-cabrera-ped",
    nombre: "Dra. Cabrera",
    especialidadId: "e-ped",
    cmp: "Pediatría",
    agenda: { 2: ["16:00"], 4: ["16:00"], 6: ["09:00"] },
  },
  {
    id: "m-diaz",
    nombre: "Dra. Díaz",
    especialidadId: "e-ped",
    cmp: "Pediatría",
    agenda: { 2: ["08:30"], 4: ["08:30"], 6: ["08:30"] },
  },

  // Medicina Interna
  {
    id: "m-grodriguez",
    nombre: "Dra. Gloria Rodríguez",
    especialidadId: "e-mint",
    cmp: "Medicina Interna",
    agenda: {
      1: ["11:30", "13:00", "14:00", "15:00"],
      3: [ "11:30", "13:00", "14:00", "15:00"],
      5: [ "11:30", "13:00", "14:00", "15:00"],
    },
  },

  // Ginecología
  {
    id: "m-crodriguez",
    nombre: "Dr. C. Rodríguez",
    especialidadId: "e-gin",
    cmp: "Ginecología",
    agenda: {
      1: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
      2: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
      3: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
      4: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
      5: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
      6: ["08:00", "09:00", "10:00", "11:00", "14:00"],
    },
    nota: "Lunes a viernes 8:00 am – 4:00 pm · Sábado 8:00 am – 3:00 pm",
  },

  // Obstetricia
  {
    id: "m-palacin",
    nombre: "Lic. M. Palacin",
    especialidadId: "e-obs",
    cmp: "Obstetricia",
    agenda: { 2: ["09:00"], 3: ["15:00"], 4: ["15:00"], 6: ["15:00"] },
  },
  {
    id: "m-osorio",
    nombre: "Lic. M. Osorio",
    especialidadId: "e-obs",
    cmp: "Obstetricia",
    agenda: { 1: ["08:30", "14:30"], 2: ["14:30"] },
  },

  // CRED
  {
    id: "m-cred",
    nombre: "Enfermería CRED",
    especialidadId: "e-cred",
    cmp: "Turno mañana y tarde",
    agenda: {
      1: ["08:30", "09:30", "10:30", "11:30", "15:00", "16:00", "17:00"],
      3: ["08:30", "09:30", "10:30", "11:30", "15:00", "16:00", "17:00"],
      5: ["08:30", "09:30", "10:30", "11:30", "15:00", "16:00", "17:00"],
    },
    nota: "Mañana 8:30 am – 12:00 md · Tarde 3:00 pm – 6:00 pm",
  },

  // Estimulación Temprana
  {
    id: "m-est-13a15",
    nombre: "Grupo 13 a 15 meses",
    especialidadId: "e-estim",
    cmp: "Estimulación Temprana",
    agenda: { 2: ["15:00"] },
    nota: "Martes 3:00 pm – 4:00 pm",
  },
  {
    id: "m-est-16a18",
    nombre: "Grupo 16 a 18 meses",
    especialidadId: "e-estim",
    cmp: "Estimulación Temprana",
    agenda: { 2: ["16:15"] },
    nota: "Martes 4:15 pm – 5:15 pm",
  },
  {
    id: "m-est-1a6",
    nombre: "Grupo 1 a 6 meses",
    especialidadId: "e-estim",
    cmp: "Estimulación Temprana",
    agenda: { 4: ["15:00"], 6: ["10:00"] },
    nota: "Jueves 3:00 pm – 4:00 pm · Sábado 10:00 am – 11:00 am",
  },
  {
    id: "m-est-7a12",
    nombre: "Grupo 7 a 12 meses",
    especialidadId: "e-estim",
    cmp: "Estimulación Temprana",
    agenda: { 4: ["16:15"], 6: ["11:15"] },
    nota: "Jueves 4:15 pm – 5:15 pm · Sábado 11:15 am – 12:15 md",
  },

  // Psicología
  {
    id: "m-rllerena",
    nombre: "Lic. R. Llerena",
    especialidadId: "e-psi",
    cmp: "Psicología",
    agenda: {
      1: ["09:00", "14:00"],
      2: ["09:00"],
      3: ["09:00", "14:00"],
      4: ["09:00"],
      5: ["09:00", "14:00"],
      6: ["09:00"],
    },
    nota: "Sábado solo pacientes citados",
  },
  {
    id: "m-matias",
    nombre: "Lic. Matias",
    especialidadId: "e-psi",
    cmp: "Psicología",
    agenda: { 2: ["14:00"], 4: ["09:00", "14:30"], 6: ["09:00"] },
  },
  {
    id: "m-bendano",
    nombre: "Lic. Bendaño",
    especialidadId: "e-psi",
    cmp: "Psicología",
    agenda: { 1: ["08:30"], 2: ["08:30", "14:00"], 3: ["08:30"], 4: ["14:00"], 5: ["08:30"] },
  },
  {
    id: "m-gamarra",
    nombre: "Lic. Gamarra",
    especialidadId: "e-psi",
    cmp: "Psicología",
    agenda: { 1: ["14:00"], 3: ["14:00"], 4: ["09:00"], 5: ["14:00"], 6: ["09:00", "14:00"] },
  },
  {
    id: "m-tafur",
    nombre: "Lic. Tafur",
    especialidadId: "e-psi",
    cmp: "Psicología",
    agenda: { 1: ["14:00"], 3: ["14:00"], 5: ["14:00"] },
  },
  {
    id: "m-flores",
    nombre: "Lic. Flores",
    especialidadId: "e-psi",
    cmp: "Psicología",
    agenda: { 2: ["14:00"], 4: ["14:00"], 6: ["14:00"] },
  },
  {
    id: "m-rengifo",
    nombre: "Lic. Rengifo",
    especialidadId: "e-psi",
    cmp: "Psicología",
    agenda: { 1: ["09:30", "14:30"], 3: ["09:30", "14:30"], 5: ["09:30", "14:30"], 6: ["09:30"] },
  },

  // Psiquiatría
  {
    id: "m-naveda",
    nombre: "Dr. Naveda",
    especialidadId: "e-psiq",
    cmp: "Psiquiatría",
    agenda: { 2: ["15:00"], 5: ["15:00"] },
    nota: "Con orden médica",
  },

  // Nutrición
  {
    id: "m-lucich",
    nombre: "Lic. S. Lucich",
    especialidadId: "e-nut",
    cmp: "Nutrición",
    agenda: { 1: ["08:00"], 2: ["08:00"], 3: ["08:00"], 4: ["08:00"], 5: ["08:00"], 6: ["08:00"] },
  },

  // Cardiología / Cirugía Cardiovascular
  {
    id: "m-pintado",
    nombre: "Dr. J. Pintado",
    especialidadId: "e-card",
    cmp: "Cardiología",
    agenda: { 1: ["08:00"], 2: ["08:00"], 3: ["08:00"], 5: ["08:00"], 6: ["08:00"] },
  },
  {
    id: "m-llerena-cv",
    nombre: "Dr. Llerena",
    especialidadId: "e-cardv",
    cmp: "Cirugía Cardiovascular",
    agenda: { 4: ["16:30"] },
  },

  // Cirugía
  {
    id: "m-delgado",
    nombre: "Dr. Delgado",
    especialidadId: "e-cir",
    cmp: "Cirugía",
    agenda: { 3: ["09:00"], 4: ["09:00"] },
  },
  {
    id: "m-vasquez",
    nombre: "Dr. Vásquez",
    especialidadId: "e-cir",
    cmp: "Cirugía",
    agenda: { 5: ["09:00"] },
  },
  {
    id: "m-alosilla",
    nombre: "Dr. Alosilla",
    especialidadId: "e-cir",
    cmp: "Cirugía",
    agenda: { 2: ["09:00"], 6: ["09:00"] },
  },

  // Traumatología
  {
    id: "m-matta",
    nombre: "Dr. W. Matta",
    especialidadId: "e-trau",
    cmp: "Traumatología",
    agenda: { 1: ["08:00"], 4: ["11:00"], 5: ["08:00"], 6: ["08:00"] },
  },
  {
    id: "m-duenas",
    nombre: "Dr. Dueñas",
    especialidadId: "e-trau",
    cmp: "Traumatología",
    agenda: { 2: ["08:00", "14:00"] },
  },

  // Neurología
  {
    id: "m-malaga",
    nombre: "Dr. Málaga",
    especialidadId: "e-neuro",
    cmp: "Neurología",
    agenda: { 2: ["14:30"], 4: ["14:30"] },
  },

  // Gastroenterología
  {
    id: "m-vrodriguez",
    nombre: "Dra. V. Rodríguez",
    especialidadId: "e-gastro",
    cmp: "Gastroenterología",
    agenda: { 2: ["16:30"], 3: ["09:00", "16:00"], 4: ["09:00", "16:00"] },
  },

  // Urología
  {
    id: "m-llana",
    nombre: "Dr. R. Llana",
    especialidadId: "e-uro",
    cmp: "Urología",
    agenda: { 1: ["15:30"], 3: ["08:00"], 5: ["08:00"] },
  },
  {
    id: "m-lazo",
    nombre: "Dr. Lazo",
    especialidadId: "e-uro",
    cmp: "Urología",
    agenda: { 4: ["17:00"] },
  },

  // Neumología
  {
    id: "m-yabar",
    nombre: "Dr. Yabar",
    especialidadId: "e-neum",
    cmp: "Neumología",
    agenda: { 1: ["15:30"], 2: ["15:30"], 3: ["15:30"], 4: ["15:30"], 5: ["15:30"], 6: ["08:00"] },
  },

  // Reumatología
  {
    id: "m-camargo",
    nombre: "Dr. Camargo",
    especialidadId: "e-reum",
    cmp: "Reumatología",
    agenda: { 1: ["15:30"], 3: ["15:30"], 5: ["15:30"], 6: ["13:30"] },
  },

  // Dermatología
  {
    id: "m-silupu",
    nombre: "Dr. J. Silupu",
    especialidadId: "e-derm",
    cmp: "Dermatología",
    agenda: {},
    nota: "Programa su cita según las fechas disponibles en recepción",
  },
  {
    id: "m-cruz",
    nombre: "Dr. Cruz",
    especialidadId: "e-derm",
    cmp: "Dermatología",
    agenda: {},
    nota: "Atiende el próximo mes · cita adelantada",
  },

  // Oftalmología
  {
    id: "m-cardenas",
    nombre: "Dra. Cárdenas",
    especialidadId: "e-oft",
    cmp: "Oftalmología",
    agenda: {},
    nota: "Inicia atención la próxima semana",
  },

  // Otorrinolaringología
  {
    id: "m-vega",
    nombre: "Dr. M. Vega",
    especialidadId: "e-otorr",
    cmp: "Otorrinolaringología",
    agenda: { 4: ["08:00", "14:30"], 5: ["14:30"] },
  },

  // Medicina Física
  {
    id: "m-mfis",
    nombre: "Terapia Física",
    especialidadId: "e-mfis",
    cmp: "Medicina Física",
    agenda: {},
    nota: "Con orden médica · terapia física para niños y adultos, según fechas disponibles",
  },

  // Dental Niños
  {
    id: "m-barzola",
    nombre: "CD. Barzola",
    especialidadId: "e-dniños",
    cmp: "Odontopediatría",
    agenda: { 3: ["09:00", "15:00"], 4: ["09:00", "15:00"], 5: ["09:00", "15:00"], 6: ["09:00"] },
    nota: "Miércoles a viernes ambos turnos · sábado turno mañana",
  },
  {
    id: "m-aguilar",
    nombre: "CD. Aguilar",
    especialidadId: "e-dniños",
    cmp: "Odontopediatría",
    agenda: { 1: ["13:30"], 3: ["13:30"], 5: ["13:30"], 6: ["08:30"] },
  },

  // Dental Adultos
  {
    id: "m-balbuena",
    nombre: "CD. Balbuena",
    especialidadId: "e-dadultos",
    cmp: "Odontología",
    agenda: { 1: ["09:00", "15:00"], 4: ["09:00", "15:00"] },
    nota: "Lunes y jueves, ambos turnos",
  },
  {
    id: "m-palomino",
    nombre: "CD. Palomino",
    especialidadId: "e-dadultos",
    cmp: "Odontología",
    agenda: { 1: ["09:00", "15:00"], 3: ["09:00", "15:00"], 5: ["09:00", "15:00"] },
    nota: "Lunes, miércoles y viernes, ambos turnos",
  },
  {
    id: "m-castillo",
    nombre: "CD. Castillo",
    especialidadId: "e-dadultos",
    cmp: "Odontología",
    agenda: { 2: ["09:00", "15:00"], 5: ["09:00", "15:00"] },
    nota: "Martes y viernes, ambos turnos",
  },
  {
    id: "m-povis",
    nombre: "CD. Povis",
    especialidadId: "e-dadultos",
    cmp: "Odontología",
    agenda: { 1: ["09:00"], 3: ["09:00"], 4: ["09:00", "15:00"], 5: ["09:00"] },
    nota: "Lunes, miércoles y viernes 9:00 am · jueves ambos turnos",
  },
  {
    id: "m-mbarzola",
    nombre: "CD. Mauro Barzola",
    especialidadId: "e-dadultos",
    cmp: "Odontología",
    agenda: { 4: ["09:00", "15:00"], 6: ["09:00", "15:00"] },
    nota: "Jueves y sábado, ambos turnos",
  },

  // Enfermería y Vacunación
  {
    id: "m-enf",
    nombre: "Enfermería y Vacunación",
    especialidadId: "e-enf",
    cmp: "Tópico",
    agenda: {
      1: ["08:00", "17:00"],
      2: ["08:00", "17:00"],
      3: ["08:00", "17:00"],
      4: ["08:00", "17:00"],
      5: ["08:00", "10:00", "15:00", "17:00"],
      6: ["08:00", "10:00"],
    },
  },
];

function estadoInicial(): Estado {
  return {
    especialidades: especialidadesBase,
    medicos: medicosBase,
    pacientes: [{ dni: "70123456", nombre: "María Torres" }],
    citas: [],
    sesion: null,
  };
}

let estado: Estado = estadoInicial();
let cargado = false;
let sincronizadoConServidor = false;
const listeners = new Set<() => void>();

/** La sesión no se persiste: siempre se arranca sin sesión iniciada. */
function paraGuardar(e: Estado) {
  return {
    especialidades: e.especialidades,
    medicos: e.medicos,
    pacientes: e.pacientes,
    citas: e.citas,
  };
}

function cargar() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) estado = { ...estadoInicial(), ...(JSON.parse(raw) as Estado), sesion: null };
  } catch {
    /* ignore */
  }
}

function guardar() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(paraGuardar(estado)));
}

/* ---------- sincronización con el archivo del proyecto ---------- */

let temporizadorGuardado: ReturnType<typeof setTimeout> | null = null;

/** Guarda en el servidor (archivo del proyecto) con un pequeño retardo. */
function guardarEnServidor() {
  if (typeof window === "undefined" || !sincronizadoConServidor) return;
  if (temporizadorGuardado) clearTimeout(temporizadorGuardado);
  temporizadorGuardado = setTimeout(() => {
    const instantanea = paraGuardar(estado);
    void guardarDatos({ data: { datos: JSON.stringify(instantanea) } })
      .catch(() => {
        /* si el servidor no responde, al menos queda el respaldo local */
      });
  }, 400);
}

/** Trae, una sola vez, lo guardado en el proyecto (tiene prioridad sobre el navegador). */
function sincronizarDesdeServidor() {
  if (typeof window === "undefined" || sincronizadoConServidor) return;
  sincronizadoConServidor = true;
  void obtenerDatos()
    .then((guardado) => {
      const datos = guardado?.datos ? (JSON.parse(guardado.datos) as Partial<Estado>) : null;
      if (datos) {
        estado = { ...estadoInicial(), ...datos, sesion: estado.sesion };
        guardar();
        listeners.forEach((l) => l());
      } else {
        // Primera vez: sube lo que ya existe en este navegador al proyecto.
        guardarEnServidor();
      }
    })
    .catch(() => {
      /* sin servidor disponible seguimos con el respaldo local */
    });
}

function emitir() {
  guardar();
  guardarEnServidor();
  listeners.forEach((l) => l());
}

function suscribir(cb: () => void) {
  cargar();
  sincronizarDesdeServidor();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const servidor = estadoInicial();

export function useEstado(): Estado {
  return useSyncExternalStore(
    suscribir,
    () => {
      cargar();
      return estado;
    },
    () => servidor,
  );
}

export function set(mut: (e: Estado) => Estado) {
  cargar();
  estado = mut(estado);
  emitir();
}

/** Actualiza los datos de un paciente (perfil) y refleja el nombre en sus citas ya creadas. */
export function actualizarPaciente(dni: string, cambios: Partial<Omit<Paciente, "dni">>) {
  set((e) => ({
    ...e,
    pacientes: e.pacientes.map((p) => (p.dni === dni ? { ...p, ...cambios } : p)),
    citas:
      cambios.nombre !== undefined
        ? e.citas.map((c) =>
            c.pacienteDni === dni ? { ...c, pacienteNombre: cambios.nombre! } : c,
          )
        : e.citas,
  }));
}

/* ---------- helpers ---------- */

export function fechasProximas(dias = 14) {
  const hoy = new Date();
  return Array.from({ length: dias }, (_, i) => {
    // Se arma la fecha con componentes locales (no toISOString, que pasa a UTC
    // y corre la fecha un día en zonas horarias negativas como Perú por las tardes).
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dia}`;
  });
}

export function nombreFecha(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" });
}

export function fechaLarga(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function horasOcupadas(citas: Cita[], medicoId: string, fecha: string) {
  return citas
    .filter(
      (c) =>
        c.medicoId === medicoId &&
        c.fecha === fecha &&
        !["cancelada", "liberada"].includes(c.estado),
    )
    .map((c) => c.hora);
}

export function generarCodigo() {
  return "TC-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export function crearCita(input: {
  paciente: Paciente;
  medicoId: string;
  especialidadId: string;
  fecha: string;
  hora: string;
  metodoPago: MetodoPago;
}): Cita {
  const cita: Cita = {
    id: crypto.randomUUID(),
    codigo: generarCodigo(),
    pacienteDni: input.paciente.dni,
    pacienteNombre: input.paciente.nombre,
    medicoId: input.medicoId,
    especialidadId: input.especialidadId,
    fecha: input.fecha,
    hora: input.hora,
    metodoPago: input.metodoPago,
    estado: input.metodoPago === "efectivo" ? "pendiente_pago" : "pagada",
    creadaEn: Date.now(),
    llegadaLimite:
      input.metodoPago === "efectivo"
        ? new Date(`${input.fecha}T${input.hora}:00`).getTime() + TOLERANCIA_MIN * 60_000
        : null,
  };
  set((e) => ({ ...e, citas: [...e.citas, cita] }));
  return cita;
}

/** Libera cupos en efectivo cuya tolerancia de 15 min ya venció. */
export function liberarVencidas() {
  const ahora = Date.now();
  set((e) => ({
    ...e,
    citas: e.citas.map((c) =>
      c.estado === "pendiente_pago" && c.llegadaLimite && c.llegadaLimite < ahora
        ? { ...c, estado: "liberada" as EstadoCita }
        : c,
    ),
  }));
}

export function etiquetaEstado(estado: EstadoCita) {
  return {
    pendiente_pago: "Pago en caja pendiente",
    pagada: "Pagada",
    atendida: "Atendida",
    cancelada: "Cancelada",
    liberada: "Cupo liberado",
  }[estado];
}

export function soles(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

/* ---------- agenda por médico ---------- */

export function diaSemana(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay();
}

/** Horarios que el profesional atiende ese día, según la programación semanal. */
export function horasDeMedico(medico: Medico | undefined, iso: string): string[] {
  if (!medico) return [];
  if (!medico.agenda) return HORARIO;
  return medico.agenda[diaSemana(iso)] ?? [];
}

/** "Lunes, Miércoles y Viernes" a partir de la agenda. */
export function diasDeMedico(medico: Medico): string {
  if (!medico.agenda) return "Lunes a sábado";
  const dias = Object.keys(medico.agenda)
    .map(Number)
    .filter((d) => (medico.agenda?.[d] ?? []).length > 0)
    .sort((a, b) => a - b)
    .map((d) => DIAS_NOMBRE[d]!);
  if (dias.length === 0) return "Sin turnos programados";
  if (dias.length === 1) return dias[0]!;
  return `${dias.slice(0, -1).join(", ")} y ${dias[dias.length - 1]}`;
}

export function resumenHorasMedico(medico: Medico): string {
  const horas = new Set<string>();
  Object.values(medico.agenda ?? {}).forEach((hs) => hs.forEach((h) => horas.add(h)));
  return [...horas].sort().join(" · ");
}

/** "15:00" → "3:00 p. m." — formato de 12 horas, fácil de leer. */
export function horaLegible(hora: string): string {
  const [hStr, m] = hora.split(":");
  const h = Number(hStr);
  const periodo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${periodo}`;
}

/** Separa una lista de horas (ya ordenadas) en turno mañana y turno tarde. */
export function agruparPorTurno(horas: string[]): { manana: string[]; tarde: string[] } {
  const ordenadas = [...horas].sort();
  return {
    manana: ordenadas.filter((h) => Number(h.split(":")[0]) < 12),
    tarde: ordenadas.filter((h) => Number(h.split(":")[0]) >= 12),
  };
}
