
import { MetaDimension } from './types';

// Standard 13-MD Levels labels (mapped from Annexe)
export const DEFAULT_OPTIONS_5 = [
  { id: 1, label: "Aucune difficulté / Jamais" },
  { id: 2, label: "Très peu / Rarement" },
  { id: 3, label: "Un peu / Parfois" },
  { id: 4, label: "Difficulté / Souvent" },
  { id: 5, label: "Grandes difficultés / Très souvent" }
];

export const DEFAULT_OPTIONS_6 = [
  ...DEFAULT_OPTIONS_5,
  { id: 6, label: "Très grandes difficultés / Toujours" }
];

export const DEFAULT_OPTIONS_7 = [
  ...DEFAULT_OPTIONS_6,
  { id: 7, label: "Besoin d'assistance / Incapable" }
];

export const QUESTIONNAIRE: MetaDimension[] = [
  {
    id: "corps",
    name: "Fonctionnement du corps",
    items: [
      { id: "Respirer", title: "Respirer", options: DEFAULT_OPTIONS_7 },
      { id: "Manger", title: "M'alimenter", options: DEFAULT_OPTIONS_7 },
      { id: "Eliminer", title: "Éliminer (urine/fèces)", options: DEFAULT_OPTIONS_7 }
    ]
  },
  {
    id: "cognitif",
    name: "Capacités cognitives, sens et langage",
    items: [
      { id: "Cognition", title: "Capacités cognitives", description: "Réfléchir, se souvenir, se concentrer", options: DEFAULT_OPTIONS_6 },
      { id: "Sens", title: "Certains sens", description: "Vision, audition, toucher, goût, odorat", options: DEFAULT_OPTIONS_6 },
      { id: "Langage", title: "Langage", description: "Parler, se faire comprendre", options: DEFAULT_OPTIONS_6 }
    ]
  },
  {
    id: "sommeil",
    name: "Sommeil et énergie",
    items: [
      { id: "Sommeil", title: "Sommeil", options: DEFAULT_OPTIONS_6 },
      { id: "Energie", title: "Énergie", options: DEFAULT_OPTIONS_6 }
    ]
  },
  {
    id: "estime",
    name: "Estime et acceptation de soi",
    items: [
      { id: "Confiance", title: "Confiance ou estime de soi", options: DEFAULT_OPTIONS_7 },
      { id: "Acceptation_soi", title: "M'accepter", options: DEFAULT_OPTIONS_7 }
    ]
  },
  {
    id: "douleur",
    name: "Douleur et inconfort physique",
    items: [
      { id: "Douleur", title: "Douleur(s)", options: DEFAULT_OPTIONS_6 },
      { id: "Inconfort", title: "Inconfort", options: DEFAULT_OPTIONS_6 }
    ]
  },
  {
    id: "mobilite",
    name: "Mobilité et incapacité physique",
    items: [
      { id: "Activites_intenses", title: "Activités intenses", description: "Courir, soulever des poids", options: DEFAULT_OPTIONS_7 },
      { id: "Activites_moderees", title: "Activités modérées", description: "Marcher, monter des marches", options: DEFAULT_OPTIONS_7 },
      { id: "Soins_personnels", title: "Prendre un bain, s'habiller", options: DEFAULT_OPTIONS_7 }
    ]
  },
  {
    id: "travail",
    name: "Activités courantes et travail",
    items: [
      { id: "Quotidien", title: "Activités courantes", description: "Cuisiner, ménage, courses", options: DEFAULT_OPTIONS_7 },
      { id: "Travail", title: "Travail ou études", options: DEFAULT_OPTIONS_7 }
    ]
  },
  {
    id: "social_loisirs",
    name: "Activités sociales et loisirs",
    items: [
      { id: "Social", title: "Activités sociales", options: DEFAULT_OPTIONS_6 },
      { id: "Loisirs", title: "Loisirs", options: DEFAULT_OPTIONS_6 }
    ]
  },
  {
    id: "interpersonnel",
    name: "Relations interpersonnelles",
    items: [
      { id: "Accepte_ecoute", title: "Accepté et écouté", options: DEFAULT_OPTIONS_5 },
      { id: "Affection_soutien", title: "Affection et soutien", options: DEFAULT_OPTIONS_5 }
    ]
  },
  {
    id: "citoyennete",
    name: "Citoyenneté et autonomie",
    items: [
      { id: "Engage", title: "Engagé dans son rôle de citoyen", options: DEFAULT_OPTIONS_6 },
      { id: "Integre", title: "Intégré dans la société", options: DEFAULT_OPTIONS_6 },
      { id: "Autonome", title: "Autonome et libre de choix", options: DEFAULT_OPTIONS_6 }
    ]
  },
  {
    id: "mental",
    name: "Dépression, anxiété et colère",
    items: [
      { id: "Triste", title: "Triste ou déprimé", options: DEFAULT_OPTIONS_6 },
      { id: "Anxieux", title: "Anxieux ou stressé", options: DEFAULT_OPTIONS_6 },
      { id: "Colere", title: "En colère ou irrité", options: DEFAULT_OPTIONS_6 }
    ]
  },
  {
    id: "bienetre",
    name: "Bien-être",
    items: [
      { id: "Epanoui", title: "Épanoui", options: DEFAULT_OPTIONS_6 },
      { id: "Utile", title: "Utile", options: DEFAULT_OPTIONS_6 },
      { id: "Satisfait", title: "Satisfait de ma vie", options: DEFAULT_OPTIONS_6 }
    ]
  },
  {
    id: "sexualite",
    name: "Sexualité et intimité",
    items: [
      { id: "Sexe", title: "Vie sexuelle", options: DEFAULT_OPTIONS_7 },
      { id: "Intimite", title: "Niveau d'intimité avec partenaire", options: DEFAULT_OPTIONS_7 },
      { id: "Identite", title: "Identité sexuelle", options: DEFAULT_OPTIONS_7 }
    ]
  }
];

// Beta coefficients extracted from Table 1 (pages 9-13)
// Note: Level 1 is baseline (0). Some levels were merged (same beta).
export const COEFFICIENTS: Record<string, Record<number, number>> = {
  "Respirer": { 2: -0.0126, 3: -0.0126, 4: -0.1283, 5: -0.3140, 6: -0.3140, 7: -0.3140 },
  "Manger": { 2: -0.0886, 3: -0.0886, 4: -0.0886, 5: -0.2305, 6: -0.2466, 7: -0.3724 },
  "Eliminer": { 2: -0.2310, 3: -0.2310, 4: -0.2310, 5: -0.2310, 6: -0.3276, 7: -0.3276 },
  "Cognition": { 2: -0.0488, 3: -0.0488, 4: -0.0488, 5: -0.2687, 6: -0.4117 },
  "Sens": { 2: -0.0539, 3: -0.0539, 4: -0.0760, 5: -0.1736, 6: -0.2994 },
  "Langage": { 2: -0.0856, 3: -0.1107, 4: -0.1107, 5: -0.3417, 6: -0.3417 },
  "Sommeil": { 2: -0.0252, 3: -0.0252, 4: -0.0775, 5: -0.1419, 6: -0.1802 },
  "Energie": { 2: -0.1676, 3: -0.1676, 4: -0.1676, 5: -0.1687, 6: -0.1687 },
  "Confiance": { 2: -0.0956, 3: -0.2104, 4: -0.2104, 5: -0.3241, 6: -0.3241, 7: -0.3241 },
  "Acceptation_soi": { 2: -0.0528, 3: -0.0528, 4: -0.1988, 5: -0.2290, 6: -0.2290, 7: -0.4934 },
  "Douleur": { 2: -0.0710, 3: -0.0710, 4: -0.0966, 5: -0.4162, 6: -0.4952 },
  "Inconfort": { 2: -0.0518, 3: -0.0518, 4: -0.0518, 5: -0.2486, 6: -0.2567 },
  "Activites_intenses": { 2: -0.0609, 3: -0.0609, 4: -0.0609, 5: -0.0720, 6: -0.3226, 7: -0.3226 },
  "Activites_moderees": { 2: -0.0070, 3: -0.0070, 4: -0.1112, 5: -0.1112, 6: -0.2250, 7: -0.2667 },
  "Soins_personnels": { 2: -0.0785, 3: -0.0795, 4: -0.0795, 5: -0.1409, 6: -0.2028, 7: -0.2516 },
  "Quotidien": { 2: -0.1354, 3: -0.1354, 4: -0.1354, 5: -0.1354, 6: -0.2068, 7: -0.2068 },
  "Travail": { 2: -0.1047, 3: -0.1047, 4: -0.1047, 5: -0.2053, 6: -0.2053, 7: -0.2053 },
  "Social": { 2: -0.0911, 3: -0.0911, 4: -0.1268, 5: -0.1268, 6: -0.2360 },
  "Loisirs": { 2: -0.0086, 3: -0.0086, 4: -0.0377, 5: -0.2023, 6: -0.2023 },
  "Accepte_ecoute": { 2: -0.0206, 3: -0.0559, 4: -0.0559, 5: -0.0976 },
  "Affection_soutien": { 2: -0.0599, 3: -0.0599, 4: -0.0941, 5: -0.0941 },
  "Engage": { 2: -0.0237, 3: -0.0946, 4: -0.0946, 5: -0.0946, 6: -0.0946 },
  "Integre": { 2: -0.0050, 3: -0.0267, 4: -0.0267, 5: -0.0267, 6: -0.0503 },
  "Autonome": { 2: -0.1067, 3: -0.1067, 4: -0.1862, 5: -0.2969, 6: -0.3412 },
  "Triste": { 2: -0.1107, 3: -0.1107, 4: -0.1107, 5: -0.2436, 6: -0.2491 },
  "Anxieux": { 2: -0.0851, 3: -0.0851, 4: -0.0851, 5: -0.1334, 6: -0.1600 },
  "Colere": { 2: -0.0785, 3: -0.0785, 4: -0.0785, 5: -0.3236, 6: -0.3236 },
  "Epanoui": { 2: -0.0201, 3: -0.0750, 4: -0.1243, 5: -0.1802, 6: -0.2456 },
  "Utile": { 2: -0.0861, 3: -0.0861, 4: -0.0861, 5: -0.1676, 6: -0.2375 },
  "Satisfait": { 2: -0.0946, 3: -0.0946, 4: -0.0946, 5: -0.1525, 6: -0.3377 },
  "Sexe": { 2: -0.0091, 3: -0.1641, 4: -0.1641, 5: -0.1641, 6: -0.1822, 7: -0.1822 },
  "Intimite": { 2: -0.0156, 3: -0.0156, 4: -0.0463, 5: -0.0463, 6: -0.0463, 7: -0.0472 },
  "Identite": { 2: -0.1882, 3: -0.1882, 4: -0.1882, 5: -0.2536, 6: -0.3518, 7: -0.3558 }
};
