export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi';

export interface TranslationDictionary {
  openPositions: string;
  searchPlaceholder: string;
  allLocations: string;
  allTypes: string;
  applyNow: string;
  jobDescription: string;
  qualifications: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resume: string;
  summary: string;
  submitApplication: string;
  submitting: string;
  applicationSuccess: string;
  backToCareers: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    openPositions: 'Explore Open Roles',
    searchPlaceholder: 'Search positions or skills...',
    allLocations: 'All Locations',
    allTypes: 'All Job Types',
    applyNow: 'Apply Now',
    jobDescription: 'Job Description & Role Summary',
    qualifications: 'Key Requirements & Skills',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    resume: 'Resume / CV (PDF or DOCX)',
    summary: 'Professional Summary & Bio',
    submitApplication: 'Submit Application',
    submitting: 'Submitting Dossier...',
    applicationSuccess: 'Your application was submitted successfully!',
    backToCareers: 'Back to Careers Portal',
  },
  es: {
    openPositions: 'Explorar Puestos Vacantes',
    searchPlaceholder: 'Buscar puestos o habilidades...',
    allLocations: 'Todas las Ubicaciones',
    allTypes: 'Todos los Tipos de Trabajo',
    applyNow: 'Postularse Ahora',
    jobDescription: 'Descripción del Puesto y Resumen',
    qualifications: 'Requisitos Clave y Habilidades',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',
    phone: 'Número de Teléfono',
    resume: 'Currículum (PDF o DOCX)',
    summary: 'Resumen Profesional y Biografía',
    submitApplication: 'Enviar Solicitud',
    submitting: 'Enviando Expediente...',
    applicationSuccess: '¡Su solicitud fue enviada con éxito!',
    backToCareers: 'Volver al Portal de Empleos',
  },
  fr: {
    openPositions: 'Explorer les Postes Ouverts',
    searchPlaceholder: 'Rechercher des postes ou compétences...',
    allLocations: 'Toutes les Localisations',
    allTypes: 'Tous les Types de Contrat',
    applyNow: 'Postuler Maintenant',
    jobDescription: 'Description du Poste et Résumé',
    qualifications: 'Exigences Clés et Compétences',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Adresse E-mail',
    phone: 'Numéro de Téléphone',
    resume: 'CV (PDF ou DOCX)',
    summary: 'Résumé Professionnel & Bio',
    submitApplication: 'Soumettre la Candidature',
    submitting: 'Soumission du Dossier...',
    applicationSuccess: 'Votre candidature a été soumise avec succès !',
    backToCareers: 'Retour au Portail Carrières',
  },
  de: {
    openPositions: 'Offene Stellen Erkunden',
    searchPlaceholder: 'Stellen oder Fähigkeiten suchen...',
    allLocations: 'Alle Standorte',
    allTypes: 'Alle Beschäftigungsarten',
    applyNow: 'Jetzt Bewerben',
    jobDescription: 'Stellenbeschreibung & Übersicht',
    qualifications: 'Wichtige Anforderungen & Fähigkeiten',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail-Adresse',
    phone: 'Telefonnummer',
    resume: 'Lebenslauf (PDF oder DOCX)',
    summary: 'Berufliches Profil & Bio',
    submitApplication: 'Bewerbung Einreichen',
    submitting: 'Dossier wird übermittelt...',
    applicationSuccess: 'Ihre Bewerbung wurde erfolgreich eingereicht!',
    backToCareers: 'Zurück zum Karriereportal',
  },
  hi: {
    openPositions: 'खुली भूमिकाओं की खोज करें',
    searchPlaceholder: 'पद या कौशल खोजें...',
    allLocations: 'सभी स्थान',
    allTypes: 'सभी प्रकार के कार्य',
    applyNow: 'अभी आवेदन करें',
    jobDescription: 'नौकरी का विवरण और सारांश',
    qualifications: 'मुख्य आवश्यकताएं और कौशल',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    email: 'ईमेल पता',
    phone: 'फ़ोन नंबर',
    resume: 'बायोडाटा / सीवी (PDF या DOCX)',
    summary: 'पेशेवर सारांश और बायो',
    submitApplication: 'आवेदन जमा करें',
    submitting: 'डोजियर जमा हो रहा है...',
    applicationSuccess: 'आपका आवेदन सफलतापूर्वक जमा कर दिया गया!',
    backToCareers: 'करियर पोर्टल पर वापस जाएं',
  },
};
