import { useEffect, useReducer } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import ShieldCheckIcon from '@/assets/icons/shield-check.svg?react';

interface LoadingScreenProps {
  isFinished?: boolean;
  onExitComplete?: () => void;
}

const cssKeyframes = `
@keyframes ls-orbit {
  0% { transform: rotate(0deg) translateX(80px) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); opacity: 0; }
}
@keyframes ls-particle-drift {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 0.4; }
  80% { opacity: 0.4; }
  100% { transform: translate(100px, -100px); opacity: 0; }
}
`;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
};

const STATUS_KEYS = [
  'common.loadingStatus.connecting',
  'common.loadingStatus.syncing',
  'common.loadingStatus.almostReady',
] as const;

const CYCLE_MS = 2800;

const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")";

const SHIMMER_GRADIENT =
  'linear-gradient(90deg, #6764f2 0%, #bcbbfd 25%, #6764f2 50%, #bcbbfd 75%, #6764f2 100%)';

const PARTICLES = [
  { top: '20%', left: '30%', size: 'w-1.5 h-1.5', dur: '10s', delay: '0s' },
  { top: '60%', left: '20%', size: 'w-1 h-1', dur: '12s', delay: '-3s' },
  { top: '40%', left: '80%', size: 'w-2 h-2', dur: '15s', delay: '-5s' },
  { top: '80%', left: '60%', size: 'w-1.5 h-1.5', dur: '9s', delay: '-2s' },
] as const;

function BackgroundLayer() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%]"
        style={{
          background:
            'radial-gradient(circle at center, rgba(103,100,242,0.12) 0%, transparent 60%)',
        }}
        animate={{
          x: ['-5%', '5%', '-5%'],
          y: ['-5%', '5%', '-5%'],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%]"
        style={{
          background:
            'radial-gradient(circle at center, rgba(188,187,253,0.1) 0%, transparent 60%)',
        }}
        animate={{
          x: ['5%', '-5%', '5%'],
          y: ['5%', '-5%', '5%'],
          scale: [1.1, 1, 1.1],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#6764f215 1.5px, transparent 1.5px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: NOISE_URI }}
      />
    </div>
  );
}

function MidLayer() {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={`absolute ${p.size} rounded-full opacity-0`}
          style={{
            top: p.top,
            left: p.left,
            background: '#6764f2',
            filter: 'blur(2px)',
            pointerEvents: 'none',
            animation: `ls-particle-drift ${p.dur} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-10">
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 800 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            cx="400"
            cy="400"
            r="300"
            stroke="#6764f2"
            strokeDasharray="10 20"
            strokeWidth="0.5"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: 'center' }}
          />
          <motion.circle
            cx="400"
            cy="400"
            r="220"
            stroke="#6764f2"
            strokeDasharray="5 15"
            strokeWidth="1"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: 'center' }}
          />
        </svg>
      </div>
    </div>
  );
}

function LogoArea() {
  const { t } = useTranslation();
  const appNameParts = t('common.appName').split(' ');
  const prefix = appNameParts[0];
  const suffix = appNameParts.slice(1).join(' ');

  return (
    <div className="flex flex-col items-center gap-6 scale-110">
      <div className="relative flex items-center justify-center h-48 w-48">
        <motion.div
          className="absolute w-48 h-48 bg-primary/25 rounded-full"
          animate={{
            scale: [1.2, 1.8, 1.2],
            opacity: [0.3, 0.5, 0.3],
            filter: ['blur(50px)', 'blur(70px)', 'blur(50px)'],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute w-44 h-44 rounded-full border-[1.5px] border-transparent border-t-primary/40 border-r-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        <div className="absolute w-40 h-40">
          <div
            className="absolute top-0 left-1/2 -ml-1 w-2 h-2 bg-primary rounded-full"
            style={{
              animation: 'ls-orbit 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
          <div
            className="absolute top-0 left-1/2 -ml-1 w-2 h-2 bg-primary/40 rounded-full"
            style={{
              animation: 'ls-orbit 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              animationDelay: '1.5s',
            }}
          />
        </div>

        <motion.div
          className="relative select-none"
          animate={{ y: [-8, 8, -8], scale: [0.98, 1.02, 0.98] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        >
          <span
            className="material-symbols-outlined text-primary text-9xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            video_chat
          </span>
        </motion.div>
      </div>

      <motion.h1
        className="text-5xl font-black tracking-tight"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <span className="text-slate-900">{prefix}</span>
        <motion.span
          style={{
            background: SHIMMER_GRADIENT,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          animate={{ backgroundPosition: ['-200% center', '200% center'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          {suffix}
        </motion.span>
      </motion.h1>
    </div>
  );
}

function TextSection() {
  const { t } = useTranslation();
  const [index, next] = useReducer((s: number) => (s + 1) % STATUS_KEYS.length, 0);

  useEffect(() => {
    const id = setInterval(next, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="text-center space-y-3"
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      <div className="flex flex-col items-center">
        <div className="h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              className="text-sm font-medium text-slate-500/80 tracking-wide"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {t(STATUS_KEYS[index])}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex space-x-1">
          <div
            className="w-1 h-1 bg-primary/30 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-1 h-1 bg-primary/30 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-1 h-1 bg-primary/30 rounded-full animate-bounce"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function FooterBadge() {
  const { t } = useTranslation();

  return (
    <footer className="fixed bottom-12 w-full text-center z-30 opacity-40">
      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
        <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
          {t('common.loadingStatus.secure')}
        </p>
      </div>
    </footer>
  );
}

function ReducedMotionFallback() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#f8f9fa] font-['Inter']">
      <main className="relative flex flex-col items-center justify-center max-w-lg w-full px-8">
        <div className="w-full flex flex-col items-center justify-center space-y-8">
          <div className="relative flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-9xl select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              video_chat
            </span>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              {t('common.appName')}
            </h1>
            <p className="text-sm font-medium text-slate-500/80 tracking-wide">
              {t('common.loadingStatus.connecting')}
            </p>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-12 w-full text-center opacity-40">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
            {t('common.loadingStatus.secure')}
          </p>
        </div>
      </footer>
    </div>
  );
}

const LoadingScreen = ({ isFinished = false, onExitComplete }: LoadingScreenProps) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    if (isFinished) return null;
    return <ReducedMotionFallback />;
  }

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {!isFinished && (
        <motion.div
          key="loading-screen"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#f8f9fa] font-['Inter']"
          role="status"
          aria-label="Loading"
          aria-live="polite"
        >
          <style>{cssKeyframes}</style>

          <BackgroundLayer />

          <MidLayer />

          <main className="relative z-20 flex flex-col items-center justify-center max-w-lg w-full px-8">
            <div className="w-full flex flex-col items-center justify-center space-y-8">
              <LogoArea />
              <TextSection />
            </div>
          </main>

          <FooterBadge />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
