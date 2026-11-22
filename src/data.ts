/* SAMA 0.3 — типы данных для TypeScript. Данные хранятся отдельно в content/*.json. */
interface Letter { char: string; ipa: string; how: string; example: string; hint: string; }
interface Lexeme { w: string; ru: string; tag: string; proposed: boolean; status: 'core'|'candidate'; note?: string; }
interface EditorialNote { editorial_status?: "historical"|"experimental"; editorial_note?: string; }
interface Phrase extends EditorialNote { sama: string; ru: string; topic: string; }
interface Lesson extends EditorialNote { title: string; level: string; intro: string; rules: string[]; examples: [string,string][]; task: string; answer: string; }
interface Article { id: string; title: string; area: string; desc: string; paragraphs: string[]; examples?: [string,string][]; related?: string[]; edition?: string; status?: string; }
interface QuizItem { q: string; options: string[]; correct: number; explain: string; }
interface HandbookChapter {id:string;title:string;level:'core'|'candidate';summary:string;rules:string[];examples:{sama:string;ru:string}[];notes:string[];area:string;}
interface AuditData { legacyTotal:number; legacyUnique:number; visible:number; quarantine: {w:string;oldMeaning:string;topic:string;reason:string}[]; conflicts:{w:string;oldMeanings:string[];decision:string;type:string}[]; }
declare const LETTERS: Letter[];
declare const VOWELS: Set<string>;
declare const COUNTS: [string,string][];
declare const LEXICON: Lexeme[];
declare const PHRASES: Phrase[];
declare const LESSONS: Lesson[];
declare const ARTICLE_SECTIONS: {id:string;name:string}[];
declare const ARTICLES: Article[];
declare const QUIZ: QuizItem[];
declare const HANDBOOK: HandbookChapter[];
declare const AUDIT: AuditData;

interface GrammarAtlasChapter {id:string;title:string;group:string;status:"core"|"proposal";principle:string;rules:string[];examples:{sama:string;ru:string;note:string}[];pitfall:string;open_questions:string[];}
interface GrammarAtlasData {version:string;note:string;sections:Record<string,string>;chapters:GrammarAtlasChapter[];}
declare const GRAMMAR_ATLAS:GrammarAtlasData;

interface CanonicalSense extends SamaLexicalSense {id:string;gloss:{ru:string;en:string};definition:{ru:string;en:string};examples:{sama:string;ru:string}[];}
interface CanonicalEntry extends SamaLexicalEntry {id:string;form:string;ipa:string;status:'core';accepted_in:string;senses:CanonicalSense[];}
interface CanonicalRule {id:string;revision:string;status:'core';title:string;area:string;text:string;summary_en:string;examples:{sama:string;ru:string}[];}
interface CanonicalLesson {id:number;version:string;title:string;goal:string;rules:string[];explanation:string;examples:{sama:string;ru:string}[];exercise:{prompt:string;answer:string};contrast:string;}
declare const CURRENT_LEXICON:{version:string;entries:CanonicalEntry[]};
declare const CURRENT_RULES:{version:string;rules:CanonicalRule[]};
declare const CURRENT_PHONOLOGY:{version:string;letters:{letter:string;name:string;phoneme:string;variants:string[]}[]};
declare const CURRENT_LESSONS:{version:string;lessons:CanonicalLesson[]};
declare const CURRENT_READER:{version:string;texts:{id:number;title:string;sentences:{sama:string;ru:string}[]}[]};
declare const CURRENT_RELEASE:{version:string;name:string;target:string;target_lexemes:number;accepted_lexemes:number;rules:number;complete_1_0:boolean;open_work:string[]};
