/* SAMA 0.3 — типы данных для TypeScript. Данные хранятся отдельно в content/*.json. */
interface Letter { char: string; ipa: string; how: string; example: string; hint: string; }
interface Lexeme { w: string; ru: string; tag: string; proposed: boolean; status: 'core'|'candidate'; note?: string; }
interface Phrase { sama: string; ru: string; topic: string; }
interface Lesson { title: string; level: string; intro: string; rules: string[]; examples: [string,string][]; task: string; answer: string; }
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
