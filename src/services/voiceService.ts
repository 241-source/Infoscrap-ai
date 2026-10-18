// Voice Service for Speech Recognition (STT) and Speech Synthesis (TTS)
// Specially configured for InfoScrap AI's masculine, calm, soft-spoken JARVIS-like personality

type SpeechCallback = (text: string) => void;
type StatusCallback = (active: boolean) => void;

class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis || null;
      this.initRecognition();
    }
  }

  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      } catch (e) {
        console.warn('SpeechRecognition initialization failed:', e);
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(onResult: SpeechCallback, onStateChange: StatusCallback, lang: string = 'en-US') {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    this.stopSpeaking();

    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      onStateChange(true);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onStateChange(false);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      onStateChange(false);
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onResult(transcript);
      }
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error(e);
      }
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    options: {
      pitch?: number;
      rate?: number;
      masculine?: boolean;
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ) {
    if (!this.synthesis) return;

    this.stopSpeaking();

    // Clean text: strip markdown code blocks and raw symbols
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block provided on screen.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Masculine, soft-spoken JARVIS calibration
    utterance.pitch = options.pitch ?? 0.85; // Slightly lower pitch for masculine presence
    utterance.rate = options.rate ?? 0.95; // Calm, soft-spoken cadence

    // Detect Hindi
    const containsHindi = /[\u0900-\u097F]/.test(cleanText);

    // Pick best matching masculine voice
    const voices = this.synthesis.getVoices();
    if (voices && voices.length > 0) {
      if (containsHindi) {
        const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
        if (hindiVoice) {
          utterance.voice = hindiVoice;
          utterance.lang = 'hi-IN';
        }
      } else {
        // Preferred masculine names
        const maleVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('george') ||
              v.name.toLowerCase().includes('daniel') ||
              v.name.toLowerCase().includes('uk english male') ||
              v.name.toLowerCase().includes('guy') ||
              v.name.toLowerCase().includes('ryan'))
        );

        if (maleVoice) {
          utterance.voice = maleVoice;
        } else {
          // Fallback to first English voice
          const defaultEn = voices.find((v) => v.lang.startsWith('en'));
          if (defaultEn) utterance.voice = defaultEn;
        }
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    this.synthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceManager = new VoiceService();
