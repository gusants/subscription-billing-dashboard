import type { DemoSummary } from '../../src/mocks/demo-types.ts'

export const PLAN_CATALOG = [
  { key: 'solo', name: 'Solo', amountCents: 8990, interval: 'monthly' },
  { key: 'studio', name: 'Studio', amountCents: 38990, interval: 'monthly' },
  {
    key: 'studio-annual',
    name: 'Studio Annual',
    amountCents: 399000,
    interval: 'yearly',
  },
] as const

export type PlanKey = (typeof PLAN_CATALOG)[number]['key']

export const SCHOOL_PREFIXES = [
  'Escola de Música',
  'Instituto Musical',
  'Casa da Música',
  'Academia de Música',
  'Ateliê Sonoro',
  'Studio',
] as const

export const SCHOOL_NAMES = [
  'Allegro',
  'Pentagrama',
  'Sustenido',
  'Bemol',
  'Clave de Sol',
  'Tom Maior',
  'Contraponto',
  'Acorde',
  'Harmonia',
  'Ritornelo',
  'Cadenza',
  'Vibrato',
  'Andante',
  'Sonata',
  'Fermata',
  'Arpejo',
  'Compasso',
  'Colcheia',
  'Semibreve',
  'Fá Maior',
  'Tríade',
  'Partitura',
] as const

export const TEACHER_FIRST_NAMES = [
  'Ana',
  'Bruno',
  'Camila',
  'Diego',
  'Elisa',
  'Felipe',
  'Gabriela',
  'Heitor',
  'Isabela',
  'João',
  'Larissa',
  'Marcos',
  'Natália',
  'Otávio',
  'Paula',
  'Rafael',
  'Sofia',
  'Tiago',
] as const

export const TEACHER_LAST_NAMES = [
  'Almeida',
  'Barbosa',
  'Cardoso',
  'Duarte',
  'Ferraz',
  'Gomes',
  'Lacerda',
  'Moreira',
  'Nogueira',
  'Pires',
  'Queiroz',
  'Rezende',
  'Siqueira',
  'Teixeira',
  'Vasconcelos',
] as const

export const SUMMARIES = {
  reliable: {
    summary:
      'Pays every renewal on the due date with no declined attempts. A stable account with no signs of churn.',
    paymentBehavior: 'on_time',
    riskLevel: 'low',
    suggestedAction:
      'No action needed. Consider offering the annual plan at renewal.',
  },
  recovers: {
    summary:
      'Card renewals are occasionally declined on the first attempt but recover on the next retry. Payments end up on time.',
    paymentBehavior: 'occasional_delays',
    riskLevel: 'low',
    suggestedAction:
      'Suggest updating the card on file to avoid recurring first-attempt declines.',
  },
  pastDue: {
    summary:
      'The current renewal was declined for insufficient funds after a history of regular payments. Retries are still scheduled.',
    paymentBehavior: 'occasional_delays',
    riskLevel: 'medium',
    suggestedAction: 'Send a Pix payment link before the next card retry.',
  },
  churned: {
    summary:
      'The card on file expired and every retry was declined. The subscription was canceled when retries ran out.',
    paymentBehavior: 'frequent_delays',
    riskLevel: 'high',
    suggestedAction:
      'Reach out with a win-back offer and ask for a new payment method.',
  },
  boletoLate: {
    summary:
      'Pays by boleto, usually a day or two after the due date. No charge has gone unpaid.',
    paymentBehavior: 'occasional_delays',
    riskLevel: 'low',
    suggestedAction:
      'Suggest switching to Pix to settle renewals on the due date.',
  },
  boletoOverdue: {
    summary:
      'The latest boleto expired without payment after months of late but complete payments.',
    paymentBehavior: 'occasional_delays',
    riskLevel: 'medium',
    suggestedAction:
      'Contact the school to confirm the new boleto was received.',
  },
  newAccount: {
    summary:
      'New account with no completed payment yet. The first Pix charge is waiting for payment.',
    paymentBehavior: 'on_time',
    riskLevel: 'medium',
    suggestedAction:
      'Send a welcome message with the Pix code for the first payment.',
  },
  canceled: {
    summary:
      'Paid every renewal on time and canceled the subscription voluntarily. No outstanding balance.',
    paymentBehavior: 'on_time',
    riskLevel: 'low',
    suggestedAction:
      'Ask for cancellation feedback and keep the account for a future win-back.',
  },
} as const satisfies Record<string, DemoSummary>
